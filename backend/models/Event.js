const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  category: { type: String, required: true },
  date: { type: String, required: true },
  time: { type: String, required: true },
  location: { type: String, required: true },
  capacity: { type: Number, required: true },
  description: { type: String, required: true },
  organizer: { type: String, required: true },
  image: { type: String, default: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=600&h=340&fit=crop&auto=format' },
  tag: { type: String, default: 'New' },
  accentKey: { type: String, default: 'primary' },
  published: { type: Boolean, default: false },
  featured: { type: Boolean, default: false },
  completed: { type: Boolean, default: false }, // New: Whether event is marked as complete
  attendeesCount: { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('Event', eventSchema);
