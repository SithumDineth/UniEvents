const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: { type: String },
  role: { type: String, enum: ['student', 'admin'], default: 'student' },
  
  // Student specific fields
  faculty: { type: String },
  interests: [{ type: String }],
  
  savedEvents: [{ type: require('mongoose').Schema.Types.ObjectId, ref: 'Event' }],
  
  // Admin specific fields
  department: { type: String },
  
  // Notification preferences
  expoPushToken: { type: String },
  notificationsEnabled: { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
