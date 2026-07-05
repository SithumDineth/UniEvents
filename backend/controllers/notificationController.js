const Notification = require('../models/Notification');
const User = require('../models/User');
const { sendPushNotifications } = require('../utils/pushNotifications');

// @desc    Get logged-in user's notifications
// @route   GET /api/notifications
// @access  Private
const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Mark a notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
const markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { isRead: true },
      { new: true }
    );
    if (!notification) return res.status(404).json({ message: 'Notification not found' });
    res.json(notification);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Mark all notifications as read
// @route   PUT /api/notifications/read-all
// @access  Private
const markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany({ userId: req.user._id }, { isRead: true });
    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Admin: Send manual push notification
// @route   POST /api/notifications/admin-push
// @access  Private/Admin
const adminSendPush = async (req, res) => {
  try {
    const { title, body, audience, faculty, interests } = req.body;
    
    // Determine audience
    let query = { notificationsEnabled: true };
    
    if (audience === 'faculty' && faculty) {
      query.faculty = faculty;
    } else if (audience === 'interests' && interests && interests.length > 0) {
      query.interests = { $in: interests };
    } // else 'all' uses the base query

    const users = await User.find(query);
    
    if (users.length === 0) {
      return res.status(404).json({ message: 'No users found matching criteria' });
    }

    const messages = users.map(user => ({
      userId: user._id,
      pushToken: user.expoPushToken,
      title,
      body,
    }));

    await sendPushNotifications(messages);

    res.json({ message: `Push notification sent to ${users.length} users` });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete a notification
// @route   DELETE /api/notifications/:id
// @access  Private
const deleteNotification = async (req, res) => {
  try {
    const notification = await Notification.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id,
    });
    if (!notification)
      return res.status(404).json({ message: "Notification not found" });
    res.json({ message: "Notification deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  getNotifications,
  markAsRead,
  markAllAsRead,
  adminSendPush,
  deleteNotification,
};
