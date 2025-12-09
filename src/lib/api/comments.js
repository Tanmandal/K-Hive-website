// src/lib/api/comments.js
import apiClient from './client';

export const commentsApi = {
  // Get comments by post ID
  getCommentsByPostId: async (postId, params = {}) => {
    const { page = 1, limit = 20 } = params;
    const { data } = await apiClient.get(`/comment/post/${postId}`, {
      params: { page, limit },
    });
    return data;
  },

  // Get single comment by ID
  getCommentById: async (commentId) => {
    const { data } = await apiClient.get(`/comment/${commentId}`);
    return data;
  },

  // Get comments by user ID
  getCommentsByUserId: async (userId, params = {}) => {
    const { page = 1, limit = 20 } = params;
    const { data } = await apiClient.get(`/comment/user/${userId}`, {
      params: { page, limit },
    });
    return data;
  },

  // Get replies to a comment
  getRepliesByCommentId: async (commentId, params = {}) => {
    const { page = 1, limit = 10 } = params;
    const { data } = await apiClient.get(`/comment/${commentId}/replies`, {
      params: { page, limit },
    });
    return data;
  },

  // Get comment count for a post
  getCommentCount: async (postId) => {
    const { data } = await apiClient.get(`/comment/post/${postId}/count`);
    return data;
  },

  // Get reply count for a comment
  getReplyCount: async (commentId) => {
    const { data } = await apiClient.get(`/comment/${commentId}/replycount`);
    return data;
  },

  // Create comment
  createComment: async (commentData) => {
    const { data } = await apiClient.post('/comment', commentData);
    return data;
  },

  // Update comment
  updateComment: async ({ commentId, content }) => {
    const { data } = await apiClient.put(`/comment/${commentId}`, { content });
    return data;
  },

  // Soft delete comment
  softDeleteComment: async (commentId) => {
    const { data } = await apiClient.delete(`/comment/${commentId}`);
    return data;
  },

  // Upvote comment
  upvoteComment: async (commentId) => {
    const { data } = await apiClient.post(`/comment/${commentId}/upvote`);
    return data;
  },

  // Downvote comment
  downvoteComment: async (commentId) => {
    const { data } = await apiClient.post(`/comment/${commentId}/downvote`);
    return data;
  },
};