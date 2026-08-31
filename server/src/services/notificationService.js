const Notification = require('../models/Notification');
const { emitToUser } = require('../config/socket');

const createNotification = async ({ owner, type, title, message, messageId, threadId }) => {
  try {
    const notification = await Notification.create({
      owner,
      type,
      title,
      message,
      messageId,
      threadId,
      isRead: false
    });

    // Emit live notification event via Socket.io
    emitToUser(owner.toString(), 'notification_received', notification);

    return notification;
  } catch (err) {
    console.error('Error creating notification:', err.message);
    return null;
  }
};

const getNotifications = async (userId, limit = 50) => {
  return Notification.find({ owner: userId })
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();
};

const markAsRead = async (notificationId, userId) => {
  const notification = await Notification.findOneAndUpdate(
    { _id: notificationId, owner: userId },
    { isRead: true },
    { new: true }
  );

  if (notification) {
    emitToUser(userId.toString(), 'notification_updated', notification);
  }

  return notification;
};

const markAllAsRead = async (userId) => {
  await Notification.updateMany({ owner: userId, isRead: false }, { isRead: true });
  emitToUser(userId.toString(), 'notifications_cleared', { success: true });
  return { success: true };
};

module.exports = {
  createNotification,
  getNotifications,
  markAsRead,
  markAllAsRead
};
