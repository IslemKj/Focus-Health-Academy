/**
 * Chat API service
 */

import apiClient from './client';
import { ENDPOINTS } from './config';

export const chatService = {
  /**
   * Get all chat rooms
   */
  getChatRooms: async () => {
    const response = await apiClient.get(ENDPOINTS.CHAT.ROOMS);
    return response.data;
  },

  /**
   * Get chat room by ID
   */
  getChatRoom: async (roomId) => {
    const response = await apiClient.get(ENDPOINTS.CHAT.ROOM_DETAIL(roomId));
    return response.data;
  },

  /**
   * Get messages for a chat room
   */
  getMessages: async (roomId) => {
    const response = await apiClient.get(ENDPOINTS.CHAT.MESSAGES(roomId));
    return response.data;
  },

  /**
   * Send a message
   */
  sendMessage: async (roomId, content, image = null, file = null) => {
    const formData = new FormData();
    formData.append('content', content);

    if (image) {
      formData.append('image', {
        uri: image.uri,
        type: image.type || 'image/jpeg',
        name: image.fileName || 'photo.jpg',
      });
    }

    if (file) {
      formData.append('file', {
        uri: file.uri,
        type: file.type,
        name: file.name,
      });
    }

    const response = await apiClient.post(
      ENDPOINTS.CHAT.SEND_MESSAGE(roomId),
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  },

  /**
   * Mark messages as read
   */
  markAsRead: async (roomId) => {
    const response = await apiClient.post(ENDPOINTS.CHAT.MARK_AS_READ(roomId));
    return response.data;
  },

  /**
   * Get or create direct chat with a user
   */
  getOrCreateDirectChat: async (userId) => {
    const response = await apiClient.post(ENDPOINTS.CHAT.GET_OR_CREATE_DIRECT, {
      user_id: userId,
    });
    return response.data;
  },
};
