/**
 * Notifications API Service
 * Handles all notification-related API calls
 */

import apiClient from './client';

const notificationsService = {
  /**
   * Get all notifications for the current user
   */
  getNotifications: async () => {
    const response = await apiClient.get('/notifications/');
    return response.data;
  },

  /**
   * Get only unread notifications
   */
  getUnreadNotifications: async () => {
    const response = await apiClient.get('/notifications/unread/');
    return response.data;
  },

  /**
   * Get count of unread notifications
   */
  getUnreadCount: async () => {
    const response = await apiClient.get('/notifications/unread_count/');
    return response.data;
  },

  /**
   * Mark a specific notification as read
   */
  markAsRead: async (notificationId) => {
    const response = await apiClient.post(`/notifications/${notificationId}/mark_read/`);
    return response.data;
  },

  /**
   * Mark all notifications as read
   */
  markAllAsRead: async () => {
    const response = await apiClient.post('/notifications/mark_all_read/');
    return response.data;
  },

  /**
   * Delete all read notifications
   */
  clearAllRead: async () => {
    const response = await apiClient.delete('/notifications/clear_all/');
    return response.data;
  },

  /**
   * Delete a specific notification
   */
  deleteNotification: async (notificationId) => {
    const response = await apiClient.delete(`/notifications/${notificationId}/`);
    return response.data;
  },
};

export default notificationsService;
