// src/lib/api/posts.js
import apiClient from './client';

export const postsApi = {
  // Get all posts
  getAllPosts: async (params = {}) => {
    const { data } = await apiClient.get('/post', { params });
    return data;
  },

  // Get single post
  getPostById: async (postId) => {
    const { data } = await apiClient.get(`/post/${postId}`);
    return data;
  },

  // Get user's posts
  getPostsByUserId: async (userId, params = {}) => {
    const { data } = await apiClient.get(`/post/user/${userId}`, { params });
    return data;
  },

  // Search posts - updated to match backend parameters
  searchPosts: async (query, params = {}) => {
    const { page = 1, sortBy = 'relevance', limit = 10 } = params;
    
    const { data } = await apiClient.get('/post/search', {
      params: { 
        q: query,
        page,
        sortBy,
        limit 
      },
    });
    return data;
  },

  // Create post
  createPost: async (postData) => {
    const { data } = await apiClient.post('/post', postData);
    return data;
  },

  // Update post
  updatePost: async ({ postId, ...postData }) => {
    const { data } = await apiClient.put(`/post/${postId}`, postData);
    return data;
  },

  // Delete post
  deletePost: async (postId) => {
    const { data } = await apiClient.delete(`/post/${postId}`);
    return data;
  },

  // Upvote post
  upvotePost: async (postId) => {
    const { data } = await apiClient.patch(`/post/upvote/${postId}`);
    return data;
  },

  // Downvote post
  downvotePost: async (postId) => {
    const { data } = await apiClient.patch(`/post/downvote/${postId}`);
    return data;
  },

  getPinnedPosts: async (params = {}) => {
    const { page = 1, limit = 10 } = params;
    const { data } = await apiClient.get('/post/pinned', { 
      params: { page, limit } 
    });
    return data;
  },
};