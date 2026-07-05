const express = require('express');
const router = express.Router();
const {
  getNotifications,
  markAsRead,
  markAllAsRead,
  adminSendPush,
  deleteNotification,
} = require('../controllers/notificationController');
const { protect, admin } = require('../middleware/auth');

router.get('/', protect, getNotifications);
router.put('/read-all', protect, markAllAsRead);
router.put('/:id/read', protect, markAsRead);
router.delete('/:id', protect, deleteNotification);

// Admin routes
router.post('/admin-push', protect, admin, adminSendPush);

module.exports = router;
