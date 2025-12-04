import apiClient from './client';
import { ENDPOINTS } from './config';

export const usersService = {
  getUsers: async (params = {}) => {
    const response = await apiClient.get(ENDPOINTS.USERS.LIST, { params });
    // If the API is paginated (DRF), return the `results` array, otherwise return the data directly
    const data = response.data;
    if (data && typeof data === 'object' && Array.isArray(data.results)) {
      return data.results;
    }
    return data;
  },

  getUser: async (userId) => {
    const response = await apiClient.get(ENDPOINTS.USERS.DETAIL(userId));
    return response.data;
  },

  updateUser: async (userId, data) => {
    // support partial update
    const response = await apiClient.patch(ENDPOINTS.USERS.UPDATE(userId), data);
    return response.data;
  },

  deleteUser: async (userId) => {
    const response = await apiClient.delete(ENDPOINTS.USERS.DELETE(userId));
    return response.data;
  },
};
