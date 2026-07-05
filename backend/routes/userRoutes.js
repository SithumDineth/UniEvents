const express = require('express');
const router = express.Router();
const {
  getProfile,
  updateProfile,
  getRegisteredEvents,
  toggleSavedEvent,
  getSavedEvents,
  getAllUsers,
  updatePushToken,
} = require('../controllers/userController');
const { protect, admin } = require('../middleware/auth');

router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);
router.put('/push-token', protect, updatePushToken);
router.get('/registered-events', protect, getRegisteredEvents);
router.get('/saved-events', protect, getSavedEvents);
router.post('/saved-events/:eventId', protect, toggleSavedEvent);

// Admin
router.get('/', protect, admin, getAllUsers);

module.exports = router;
