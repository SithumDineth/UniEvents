const User = require('../models/User');
const Registration = require('../models/Registration');
const Event = require('../models/Event');

// @desc    Get logged-in user's profile
// @route   GET /api/users/profile
// @access  Private
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update logged-in user's profile
// @route   PUT /api/users/profile
// @access  Private
const updateProfile = async (req, res) => {
  try {
    const { name, phone, faculty, interests, notificationsEnabled } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name, phone, faculty, interests, notificationsEnabled },
      { new: true, runValidators: true }
    ).select('-password');

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get all events the user has registered for
// @route   GET /api/users/registered-events
// @access  Private
const getRegisteredEvents = async (req, res) => {
  try {
    const registrations = await Registration.find({ user: req.user._id }).populate('event');
    const events = registrations.map(r => r.event).filter(Boolean);
    res.json(events);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Save (bookmark) an event
// @route   POST /api/users/saved-events/:eventId
// @access  Private
const toggleSavedEvent = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const eventId = req.params.eventId;
    const idx = user.savedEvents ? user.savedEvents.findIndex(id => id.toString() === eventId) : -1;

    if (idx > -1) {
      user.savedEvents.splice(idx, 1);
      await user.save();
      return res.json({ saved: false, message: 'Event removed from saved' });
    }

    if (!user.savedEvents) user.savedEvents = [];
    user.savedEvents.push(eventId);
    await user.save();
    res.json({ saved: true, message: 'Event saved successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get all saved events for the user
// @route   GET /api/users/saved-events
// @access  Private
const getSavedEvents = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('savedEvents');
    res.json(user.savedEvents || []);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get all users (admin dashboard)
// @route   GET /api/users
// @access  Private/Admin
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update user's Expo push token
// @route   PUT /api/users/push-token
// @access  Private
const updatePushToken = async (req, res) => {
  try {
    const { token } = req.body;
    await User.findByIdAndUpdate(req.user._id, { expoPushToken: token });
    res.json({ message: 'Push token updated' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getProfile,
  updateProfile,
  getRegisteredEvents,
  toggleSavedEvent,
  getSavedEvents,
  getAllUsers,
  updatePushToken,
};
