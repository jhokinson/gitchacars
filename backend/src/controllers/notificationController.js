const notificationModel = require('../models/notificationModel');
const { success, error } = require('../utils/response');

function formatNotification(row) {
  return {
    id: row.id,
    type: row.type,
    message: row.message,
    read: row.read,
    relatedId: row.related_id,
    createdAt: row.created_at,
  };
}

async function getNotifications(req, res, next) {
  try {
    const notifications = await notificationModel.getNotifications(req.user.userId);
    success(res, notifications.map(formatNotification));
  } catch (err) {
    next(err);
  }
}

async function getUnreadCount(req, res, next) {
  try {
    const count = await notificationModel.getUnreadCount(req.user.userId);
    success(res, { count });
  } catch (err) {
    next(err);
  }
}

async function markAllRead(req, res, next) {
  try {
    await notificationModel.markAllRead(req.user.userId);
    success(res, { message: 'All notifications marked as read' });
  } catch (err) {
    next(err);
  }
}

async function markRead(req, res, next) {
  try {
    const notification = await notificationModel.markRead(req.params.id, req.user.userId);
    if (!notification) {
      return error(res, 'Notification not found', 404);
    }
    success(res, formatNotification(notification));
  } catch (err) {
    next(err);
  }
}

module.exports = { getNotifications, getUnreadCount, markAllRead, markRead };
