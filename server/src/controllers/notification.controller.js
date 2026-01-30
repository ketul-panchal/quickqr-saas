import Notification from '../models/notification.model.js';
import asyncHandler from '../utils/asyncHandler.js';
import ApiResponse from '../utils/ApiResponse.js';
import { paginate } from '../utils/helpers.js';

/**
 * @desc    Get user notifications
 * @route   GET /api/v1/notifications
 * @access  Private
 */
export const getNotifications = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { page = 1, limit = 20 } = req.query;

  const total = await Notification.countDocuments({ user: userId });
  const pagination = paginate(page, limit, total);

  const notifications = await Notification.find({ user: userId })
    .sort({ createdAt: -1 })
    .skip(pagination.skip)
    .limit(pagination.itemsPerPage)
    .populate('restaurant', 'name');

  ApiResponse.success({
    notifications,
    pagination: {
      currentPage: pagination.currentPage,
      totalPages: pagination.totalPages,
      totalItems: pagination.totalItems,
    },
  }).send(res);
});

/**
 * @desc    Get unread notification count
 * @route   GET /api/v1/notifications/unread-count
 * @access  Private
 */
export const getUnreadCount = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  const count = await Notification.countDocuments({
    user: userId,
    isRead: false,
  });

  ApiResponse.success({ unreadCount: count }).send(res);
});

/**
 * @desc    Mark notification as read
 * @route   PATCH /api/v1/notifications/:id/read
 * @access  Private
 */
export const markAsRead = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { id } = req.params;

  const notification = await Notification.findOneAndUpdate(
    { _id: id, user: userId },
    { isRead: true, readAt: new Date() },
    { new: true }
  );

  if (!notification) {
    return ApiResponse.notFound('Notification not found').send(res);
  }

  ApiResponse.success(notification, 'Notification marked as read').send(res);
});

/**
 * @desc    Mark all notifications as read
 * @route   PATCH /api/v1/notifications/read-all
 * @access  Private
 */
export const markAllAsRead = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  await Notification.updateMany(
    { user: userId, isRead: false },
    { isRead: true, readAt: new Date() }
  );

  ApiResponse.success(null, 'All notifications marked as read').send(res);
});

/**
 * @desc    Delete a notification
 * @route   DELETE /api/v1/notifications/:id
 * @access  Private
 */
export const deleteNotification = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { id } = req.params;

  const notification = await Notification.findOneAndDelete({
    _id: id,
    user: userId,
  });

  if (!notification) {
    return ApiResponse.notFound('Notification not found').send(res);
  }

  ApiResponse.success(null, 'Notification deleted').send(res);
});

/**
 * Create a notification (internal use)
 * @param {object} data - Notification data
 * @returns {Promise<Notification>}
 */
export const createNotification = async ({ user, restaurant, type, title, message, data = {} }) => {
  const notification = await Notification.create({
    user,
    restaurant,
    type,
    title,
    message,
    data,
  });

  // Clean old notifications (keep last 100)
  await Notification.cleanOldNotifications(user, 100);

  return notification;
};

export default {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  createNotification,
};
