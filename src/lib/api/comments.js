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

  // Get replies by comment ID
  getRepliesByCommentId: async (commentId, params = {}) => {
    const { page = 1, limit = 10 } = params;
    const { data } = await apiClient.get(`/comment/${commentId}/replies`, {
      params: { page, limit },
    });
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

  // Delete comment (soft delete)
  deleteComment: async (commentId) => {
    const { data } = await apiClient.delete(`/comment/${commentId}`);
    return data;
  },

  // Upvote comment
  upvoteComment: async (commentId) => {
    const { data } = await apiClient.patch(`/comment/upvote/${commentId}`);
    return data;
  },

  // Downvote comment
  downvoteComment: async (commentId) => {
    const { data } = await apiClient.patch(`/comment/downvote/${commentId}`);
    return data;
  },

  // Get comment count
  getCommentCount: async (postId) => {
    const { data } = await apiClient.get(`/comment/count/${postId}`);
    return data;
  },

  // Get reply count
  getReplyCount: async (commentId) => {
    const { data } = await apiClient.get(`/comment/${commentId}/reply-count`);
    return data;
  },
};