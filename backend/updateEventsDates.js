/**
 * Script to update all events' dates to future dates (relative to today)
 * Run: node updateEventsDates.js
 */
require('dotenv').config();
const mongoose = require('mongoose');
const Event = require('./models/Event');

async function updateDates() {
  try {
    await mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 5000 });
    console.log('✅ Connected to MongoDB Atlas');

    const today = new Date();
    const events = await Event.find({});
    console.log(`📅 Found ${events.length} events to update`);

    for (let i = 0; i < events.length; i++) {
      const event = events[i];
      // Create new date: today + (i+1)*3 days to spread them out
      const newDate = new Date(today);
      newDate.setDate(today.getDate() + (i + 1) * 3); // Every 3 days apart
      
      // Format date like "Jul 12, 2025"
      const formattedDate = newDate.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric' 
      });

      // Update event
      await Event.findByIdAndUpdate(event._id, { date: formattedDate });
      console.log(`   Updated "${event.title}" → ${formattedDate}`);
    }

    console.log('🎉 All events updated to future dates!');
  } catch (err) {
    console.error('❌ Update error:', err.message);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

updateDates();
