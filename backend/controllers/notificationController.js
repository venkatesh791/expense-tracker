const Notification = require('../models/Notification');

// @desc    Get user notifications
// @route   GET /api/notifications
// @access  Private
const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ userId: req.user._id })
      .sort('-createdAt')
      .limit(20);

    const unreadCount = await Notification.countDocuments({
      userId: req.user._id,
      read: false,
    });

    res.json({
      notifications,
      unreadCount,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Mark notifications as read
// @route   PUT /api/notifications
// @access  Private
const markAsRead = async (req, res) => {
  try {
    const { id } = req.body;

    if (id) {
      // Mark specific notification as read
      const notification = await Notification.findById(id);
      
      if (!notification) {
        return res.status(404).json({ message: 'Notification not found' });
      }

      if (notification.userId.toString() !== req.user._id.toString()) {
        return res.status(401).json({ message: 'Not authorized' });
      }

      notification.read = true;
      await notification.save();
    } else {
      // Mark all user notifications as read
      await Notification.updateMany(
        { userId: req.user._id, read: false },
        { read: true }
      );
    }

    res.json({ message: 'Notifications updated successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getNotifications,
  markAsRead,
};
