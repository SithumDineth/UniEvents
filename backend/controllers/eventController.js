const Event = require('../models/Event');
const Registration = require('../models/Registration');
const User = require('../models/User');
const { sendPushNotifications } = require('../utils/pushNotifications');
const { GoogleGenerativeAI } = require('@google/generative-ai');

// @desc    Get all published events (with optional search & category filter)
// @route   GET /api/events
// @access  Public
const getEvents = async (req, res) => {
  try {
    const { search, category, featured } = req.query;
    const filter = { published: true };

    if (category && category !== 'All') {
      filter.category = category;
    }

    if (featured === 'true') {
      filter.featured = true;
      filter.$or = [{ completed: false }, { completed: { $exists: false } }];
    }

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const events = await Event.find(filter).sort({ createdAt: -1 });
    res.json(events);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error fetching events' });
  }
};

// @desc    Get all events (admin - including unpublished)
// @route   GET /api/events/admin
// @access  Private/Admin
const getAllEventsAdmin = async (req, res) => {
  try {
    const events = await Event.find().sort({ createdAt: -1 });
    res.json(events);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error fetching events' });
  }
};

// @desc    Get single event by ID
// @route   GET /api/events/:id
// @access  Public
const getEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: 'Event not found' });
    res.json(event);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error fetching event' });
  }
};

// @desc    Create a new event
// @route   POST /api/events
// @access  Private/Admin
const createEvent = async (req, res) => {
  try {
    const { title, category, date, time, location, capacity, description, organizer, image, tag, accentKey, published, featured } = req.body;

    if (!title || !category || !date || !time || !location || !capacity || !description || !organizer) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    const event = await Event.create({
      title, category, date, time, location,
      capacity: Number(capacity),
      description, organizer,
      image: image || 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=600&h=340&fit=crop&auto=format',
      tag: tag || 'New',
      accentKey: accentKey || 'primary',
      published: published || false,
      featured: featured || false,
      completed: false,
    });

    // Notify users if event is published
    if (event.published) {
      const users = await User.find({ notificationsEnabled: true });
      const messages = users.map(user => ({
        userId: user._id,
        pushToken: user.expoPushToken,
        title: `New Event: ${event.title}`,
        body: `A new event has been published! Check it out in the app.`,
        data: { eventId: event._id }
      }));
      await sendPushNotifications(messages);
    }

    res.status(201).json(event);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error creating event' });
  }
};

// @desc    Update an event
// @route   PUT /api/events/:id
// @access  Private/Admin
const updateEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: 'Event not found' });

    let changed = [];
    if (req.body.date && req.body.date !== event.date) changed.push('date');
    if (req.body.time && req.body.time !== event.time) changed.push('time');
    if (req.body.location && req.body.location !== event.location) changed.push('location');
    if (req.body.title && req.body.title !== event.title) changed.push('title');
    if (req.body.description && req.body.description !== event.description) changed.push('description');
    if (req.body.published !== undefined && req.body.published !== event.published) changed.push('published status');

    const updatedEvent = await Event.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });

    // Check if we just published it
    const justPublished = req.body.published === true && !event.published;
    
    if (justPublished || (changed.length > 0 && event.published)) {
      let usersToNotify = [];
      if (justPublished) {
        // Notify all students
        usersToNotify = await User.find({ notificationsEnabled: true, role: 'student' });
      } else {
        // Notify registered users
        const registrations = await Registration.find({ event: event._id }).populate('user');
        usersToNotify = registrations.map(reg => reg.user).filter(u => u && u.notificationsEnabled);
      }
      
      const title = justPublished ? `New Event: ${updatedEvent.title}` : `Event Update: ${event.title}`;
      const body = justPublished 
        ? `A new event has been published! Check it out in the app.` 
        : `The ${changed.join(', ')} of an event you registered for has changed.`;
      
      const messages = usersToNotify.map(user => ({
        userId: user._id,
        pushToken: user.expoPushToken,
        title,
        body,
        data: { eventId: event._id }
      }));
      await sendPushNotifications(messages);
    }

    res.json(updatedEvent);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error updating event' });
  }
};

// @desc    Delete an event
// @route   DELETE /api/events/:id
// @access  Private/Admin
const deleteEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: 'Event not found' });

    // Notify registered users before deleting
    if (event.published) {
      const registrations = await Registration.find({ event: event._id }).populate('user');
      const usersToNotify = registrations.map(reg => reg.user).filter(u => u && u.notificationsEnabled);
      
      const messages = usersToNotify.map(user => ({
        userId: user._id,
        pushToken: user.expoPushToken,
        title: `Event Cancelled: ${event.title}`,
        body: `An event you registered for has been cancelled.`,
        data: {}
      }));
      await sendPushNotifications(messages);
    }

    await Registration.deleteMany({ event: req.params.id });
    await event.deleteOne();

    res.json({ message: 'Event deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error deleting event' });
  }
};

// @desc    Mark event as completed
// @route   PUT /api/events/:id/complete
// @access  Private/Admin
const markAsCompleted = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: 'Event not found' });

    event.completed = true;
    await event.save();

    // Notify registered users
    if (event.published) {
      const registrations = await Registration.find({ event: event._id }).populate('user');
      const usersToNotify = registrations.map(reg => reg.user).filter(u => u && u.notificationsEnabled);
      
      const messages = usersToNotify.map(user => ({
        userId: user._id,
        pushToken: user.expoPushToken,
        title: `Event Completed: ${event.title}`,
        body: `The event you attended has been marked as completed.`,
        data: { eventId: event._id }
      }));
      await sendPushNotifications(messages);
    }

    res.json({ message: 'Event marked as completed', event });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Register (or unregister) a student for an event
// @route   POST /api/events/:id/register
// @access  Private/Student
const toggleRegistration = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: 'Event not found' });

    const existingReg = await Registration.findOne({ user: req.user._id, event: req.params.id });

    if (existingReg) {
      // Unregister - always allow even if event is completed
      await existingReg.deleteOne();
      await Event.findByIdAndUpdate(req.params.id, { $inc: { attendeesCount: -1 } });
      return res.json({ registered: false, message: 'Unregistered successfully' });
    }

    // Check if event is completed
    if (event.completed) {
      return res.status(400).json({ message: 'Cannot register for an event that is already completed.' });
    }

    // Check capacity
    if (event.attendeesCount >= event.capacity) {
      return res.status(400).json({ message: 'Event is full. No spots remaining.' });
    }

    // Register
    await Registration.create({ user: req.user._id, event: req.params.id });
    await Event.findByIdAndUpdate(req.params.id, { $inc: { attendeesCount: 1 } });

    res.status(201).json({ registered: true, message: 'Registered successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error during registration' });
  }
};

// @desc    Check if a user is registered for an event
// @route   GET /api/events/:id/registration-status
// @access  Private
const checkRegistrationStatus = async (req, res) => {
  try {
    const reg = await Registration.findOne({ user: req.user._id, event: req.params.id });
    const user = await User.findById(req.user._id);
    const saved = user && user.savedEvents ? user.savedEvents.includes(req.params.id) : false;
    res.json({ registered: !!reg, saved: !!saved });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get all registrations for an event (admin)
// @route   GET /api/events/:id/registrations
// @access  Private/Admin
const getEventRegistrations = async (req, res) => {
  try {
    const registrations = await Registration.find({ event: req.params.id }).populate('user', 'name email faculty');
    res.json(registrations);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get AI recommendations (events matching user interests)
// @route   GET /api/events/recommendations
// @access  Private
const getRecommendations = async (req, res) => {
  try {
    const user = req.user;
    console.log("AI Recommendations: User data received:", user);
    // Build filter to include events where completed is false OR doesn't exist
    const notCompletedFilter = {
      $or: [
        { completed: false },
        { completed: { $exists: false } }
      ]
    };

    // Get all published, not completed events
    const allEvents = await Event.find({ published: true, ...notCompletedFilter });

    if (allEvents.length === 0) {
      return res.json([]);
    }

    // Get user's registered events
    const userRegistrations = await Registration.find({ user: user._id });
    const registeredEventIds = userRegistrations.map(reg => reg.event.toString());
    console.log("AI Recommendations: Registered event IDs:", registeredEventIds);

    // Initialize Google Generative AI client
    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    // Prepare event data for AI
    const eventsData = allEvents.map(event => ({
      id: event._id.toString(),
      title: event.title,
      category: event.category,
      description: event.description,
      organizer: event.organizer,
      attendeesCount: event.attendeesCount,
      date: event.date,
    }));

    // Prepare user profile for AI
    const userProfile = {
      interests: user.interests || [],
      registeredEventIds: registeredEventIds,
    };
    console.log("AI Recommendations: User profile for AI:", userProfile);

    let recommendedEventIds = [];

    if (process.env.GOOGLE_API_KEY) {
      try {
        const prompt = `You are an AI event recommender for a university events platform.
        Given the user's interests and registered events, recommend the TOP 5 MOST RELEVANT events from the list below.
        IMPORTANT: Return ONLY a valid JSON array of event IDs (strings), with NO extra text at all, no explanations, no markdown, just the array like ["id1", "id2", "id3", "id4", "id5"].

        User Profile:
        ${JSON.stringify(userProfile)}

        Available Events:
        ${JSON.stringify(eventsData)}`;
        console.log("AI Recommendations: Sending prompt to Gemini...");

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const responseText = response.text().trim();
        console.log("AI Recommendations: Gemini response text:", responseText);

        // Clean up response text in case there are extra characters
        const cleanedResponse = responseText.replace(/^```json\s*/, '').replace(/\s*```$/, '').trim();
        recommendedEventIds = JSON.parse(cleanedResponse);
        console.log("AI Recommendations: Parsed recommended IDs:", recommendedEventIds);
      } catch (aiError) {
        console.error('AI recommendation error:', aiError);
        // Fallback: use interests-based recommendation, then popular
        console.log("AI Recommendations: Falling back to interest-based recommendations");
        if (!user.interests || user.interests.length === 0) {
          recommendedEventIds = allEvents
            .sort((a, b) => b.attendeesCount - a.attendeesCount)
            .slice(0, 5)
            .map(e => e._id.toString());
        } else {
          const interestMap = {
            'Hackathons': 'Tech',
            'AI & ML': 'Tech',
            'Design': 'Design',
            'Research': 'Academic',
            'Social': 'Social',
            'Tech Talks': 'Tech',
          };
          const categories = [...new Set(user.interests.map(i => interestMap[i] || 'Tech'))];
          recommendedEventIds = allEvents
            .filter(event => categories.includes(event.category))
            .sort((a, b) => b.attendeesCount - a.attendeesCount)
            .slice(0, 5)
            .map(e => e._id.toString());
        }
        console.log("AI Recommendations: Using fallback events:", recommendedEventIds);
      }
    } else {
      console.log("AI Recommendations: No API key, using fallback");
      // Fallback if no API key
      if (!user.interests || user.interests.length === 0) {
        recommendedEventIds = allEvents
          .sort((a, b) => b.attendeesCount - a.attendeesCount)
          .slice(0, 5)
          .map(e => e._id.toString());
      } else {
        const interestMap = {
          'Hackathons': 'Tech',
          'AI & ML': 'Tech',
          'Design': 'Design',
          'Research': 'Academic',
          'Social': 'Social',
          'Tech Talks': 'Tech',
        };
        const categories = [...new Set(user.interests.map(i => interestMap[i] || 'Tech'))];
        recommendedEventIds = allEvents
          .filter(event => categories.includes(event.category))
          .slice(0, 5)
          .map(e => e._id.toString());
      }
      console.log("AI Recommendations: Using fallback events:", recommendedEventIds);
    }

    // Fetch the recommended events in order
    const recommendedEvents = recommendedEventIds
      .map(id => allEvents.find(event => event._id.toString() === id))
      .filter(Boolean);

    res.json(recommendedEvents);
  } catch (error) {
    console.error("Error in getRecommendations:", error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getEvents,
  getAllEventsAdmin,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
  toggleRegistration,
  checkRegistrationStatus,
  getEventRegistrations,
  getRecommendations,
  markAsCompleted,
};
