// src/lib/api/auth.js
import apiClient from './client';

export const authApi = {
  // Google OAuth redirect
  loginWithGoogle: () => {
    window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/auth/google`;
  },

  // Get current logged-in user
  getCurrentUser: async () => {
    const { data } = await apiClient.get('/auth/user');
    return data;
  },

  // Update user
  updateUser: async (userData) => {
    const { data } = await apiClient.put('/auth/user', userData);
    return data;
  },

  // Delete user
  deleteUser: async () => {
    const { data } = await apiClient.delete('/auth/user');
    return data;
  },

  // Logout user
  logout: async () => {
    const { data } = await apiClient.post('/auth/logout');
    localStorage.removeItem('accessToken');
    return data;
  },
};