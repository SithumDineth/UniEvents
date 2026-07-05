const express = require('express');
const router = express.Router();
const {
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
} = require('../controllers/eventController');
const { protect, admin } = require('../middleware/auth');

// Public
router.get('/', getEvents);

// Private (Student) — must come BEFORE /:id wildcard
router.get('/recommendations', protect, getRecommendations);

// Admin — must come BEFORE /:id wildcard
router.get('/admin/all', protect, admin, getAllEventsAdmin);

// Wildcard :id routes (after named routes)
router.get('/:id', getEventById);
router.post('/:id/register', protect, toggleRegistration);
router.get('/:id/registration-status', protect, checkRegistrationStatus);
router.get('/:id/registrations', protect, admin, getEventRegistrations);

// Admin CRUD
router.post('/', protect, admin, createEvent);
router.put('/:id', protect, admin, updateEvent);
router.put('/:id/complete', protect, admin, markAsCompleted); // Mark event as completed
router.delete('/:id', protect, admin, deleteEvent);

module.exports = router;
