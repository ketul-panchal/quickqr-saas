import apiClient from './axios.config';

export const notificationApi = {
  // Get all notifications
  getNotifications: async (page = 1, limit = 20) => {
    return apiClient.get('/notifications', {
      params: { page, limit },
    });
  },

  // Get unread count
  getUnreadCount: async () => {
    return apiClient.get('/notifications/unread-count');
  },

  // Mark single notification as read
  markAsRead: async (notificationId) => {
    return apiClient.patch(`/notifications/${notificationId}/read`);
  },

  // Mark all notifications as read
  markAllAsRead: async () => {
    return apiClient.patch('/notifications/read-all');
  },

  // Delete notification
  deleteNotification: async (notificationId) => {
    return apiClient.delete(`/notifications/${notificationId}`);
  },
};

export default notificationApi;
