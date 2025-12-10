// src/lib/hooks/useComments.js
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { commentsApi } from '@/lib/api/comments';

// Query hooks
export const useComments = (postId, { page = 1, limit = 20 } = {}) => {
  return useQuery({
    queryKey: ['comments', postId, page, limit],
    queryFn: () => commentsApi.getCommentsByPostId(postId, { page, limit }),
    enabled: !!postId,
  });
};

export const useReplies = (commentId, { page = 1, limit = 10 } = {}) => {
  return useQuery({
    queryKey: ['replies', commentId, page, limit],
    queryFn: () => commentsApi.getRepliesByCommentId(commentId, { page, limit }),
    enabled: !!commentId,
  });
};

// Mutation hooks
export const useCreateComment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: commentsApi.createComment,
    onSuccess: (data, variables) => {
      // Invalidate comments for the post
      queryClient.invalidateQueries({ queryKey: ['comments', variables.postId] });
      
      // If it's a reply, invalidate replies for parent comment
      if (variables.parentCommentId) {
        queryClient.invalidateQueries({ queryKey: ['replies', variables.parentCommentId] });
      }
      
      // Invalidate post to update comment count
      queryClient.invalidateQueries({ queryKey: ['posts', variables.postId] });
    },
  });
};

export const useUpdateComment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: commentsApi.updateComment,
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['comments'] });
      queryClient.invalidateQueries({ queryKey: ['replies'] });
    },
  });
};

export const useDeleteComment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: commentsApi.deleteComment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments'] });
      queryClient.invalidateQueries({ queryKey: ['replies'] });
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
  });
};

export const useVoteComment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ commentId, voteType }) => {
      if (voteType === 'upvote') {
        return commentsApi.upvoteComment(commentId);
      } else if (voteType === 'downvote') {
        return commentsApi.downvoteComment(commentId);
      }
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['comments'] });
      queryClient.invalidateQueries({ queryKey: ['replies'] });
    },
  });
};