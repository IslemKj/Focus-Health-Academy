/**
 * Timeline API service
 */

import apiClient from './client';
import { ENDPOINTS } from './config';

export const timelineService = {
  /**
   * Get all posts
   */
  getPosts: async (params = {}) => {
    const response = await apiClient.get(ENDPOINTS.POSTS.LIST, { params });
    return response.data;
  },

  /**
   * Get post by ID
   */
  getPost: async (postId) => {
    const response = await apiClient.get(ENDPOINTS.POSTS.DETAIL(postId));
    return response.data;
  },

  /**
   * Create a new post
   */
  createPost: async (content, image = null) => {
    const formData = new FormData();
    formData.append('content', content);
    
    if (image) {
      formData.append('image', {
        uri: image.uri,
        type: image.type || 'image/jpeg',
        name: image.fileName || 'photo.jpg',
      });
    }

    const response = await apiClient.post(ENDPOINTS.POSTS.CREATE, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  /**
   * Like a post
   */
  likePost: async (postId) => {
    const response = await apiClient.post(ENDPOINTS.POSTS.LIKE(postId));
    return response.data;
  },

  /**
   * Unlike a post
   */
  unlikePost: async (postId) => {
    const response = await apiClient.post(ENDPOINTS.POSTS.UNLIKE(postId));
    return response.data;
  },

  /**
   * Get comments for a post
   */
  getComments: async (postId) => {
    const response = await apiClient.get(ENDPOINTS.POSTS.COMMENTS(postId));
    return response.data;
  },

  /**
   * Add comment to a post
   */
  addComment: async (postId, content) => {
    const response = await apiClient.post(ENDPOINTS.POSTS.ADD_COMMENT(postId), {
      content,
    });
    return response.data;
  },

  /**
   * Update a post (admin only)
   */
  updatePost: async (postId, content) => {
    const response = await apiClient.put(ENDPOINTS.POSTS.DETAIL(postId), {
      content,
    });
    return response.data;
  },

  /**
   * Delete a post
   */
  deletePost: async (postId) => {
    const response = await apiClient.delete(ENDPOINTS.POSTS.DETAIL(postId));
    return response.data;
  },

  /**
   * Delete a comment (admin only)
   */
  deleteComment: async (commentId) => {
    const response = await apiClient.delete(ENDPOINTS.POSTS.DELETE_COMMENT(commentId));
    return response.data;
  },
};
