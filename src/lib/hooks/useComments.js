// src/lib/hooks/useComments.js
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { commentsApi } from '@/lib/api/comments';

// Query hooks
export const useComments = (postId, { page = 1, limit = 20 } = {}) => {
  return useQuery({
    queryKey: ['comments', 'post', postId, page, limit],
    queryFn: () => commentsApi.getCommentsByPostId(postId, { page, limit }),
    enabled: !!postId,
    staleTime: 1000 * 60 * 2, // 2 minutes
    placeholderData: (previousData) => previousData,
  });
};

export const useComment = (commentId) => {
  return useQuery({
    queryKey: ['comments', commentId],
    queryFn: () => commentsApi.getCommentById(commentId),
    enabled: !!commentId,
  });
};

export const useUserComments = (userId, { page = 1, limit = 20 } = {}) => {
  return useQuery({
    queryKey: ['comments', 'user', userId, page, limit],
    queryFn: () => commentsApi.getCommentsByUserId(userId, { page, limit }),
    enabled: !!userId,
    staleTime: 1000 * 60 * 2,
  });
};

export const useReplies = (commentId, { page = 1, limit = 10 } = {}) => {
  return useQuery({
    queryKey: ['comments', 'replies', commentId, page, limit],
    queryFn: () => commentsApi.getRepliesByCommentId(commentId, { page, limit }),
    enabled: !!commentId,
    staleTime: 1000 * 60 * 2,
  });
};

export const useCommentCount = (postId) => {
  return useQuery({
    queryKey: ['comments', 'count', postId],
    queryFn: () => commentsApi.getCommentCount(postId),
    enabled: !!postId,
    staleTime: 1000 * 60 * 5, // 5 minutes - counts change less frequently
  });
};

export const useReplyCount = (commentId) => {
  return useQuery({
    queryKey: ['comments', 'replyCount', commentId],
    queryFn: () => commentsApi.getReplyCount(commentId),
    enabled: !!commentId,
    staleTime: 1000 * 60 * 5,
  });
};

// Mutation hooks
export const useCreateComment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: commentsApi.createComment,
    onSuccess: (data, variables) => {
      const { postId, parentCommentId } = variables;
      
      // Invalidate all comments for this post
      queryClient.invalidateQueries({ queryKey: ['comments', 'post', postId] });
      
      // Invalidate comment count for the post
      queryClient.invalidateQueries({ queryKey: ['comments', 'count', postId] });
      
      // If it's a reply, invalidate replies for parent comment
      if (parentCommentId) {
        queryClient.invalidateQueries({ queryKey: ['comments', 'replies', parentCommentId] });
        queryClient.invalidateQueries({ queryKey: ['comments', 'replyCount', parentCommentId] });
      }

      // Invalidate user's comments
      queryClient.invalidateQueries({ queryKey: ['comments', 'user'] });
      
      // Invalidate the post to update comment count
      queryClient.invalidateQueries({ queryKey: ['posts', postId] });
    },
  });
};

export const useUpdateComment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: commentsApi.updateComment,
    onSuccess: (data, variables) => {
      const { commentId } = variables;
      
      // Invalidate the specific comment
      queryClient.invalidateQueries({ queryKey: ['comments', commentId] });
      
      // Invalidate all comment lists that might contain this comment
      queryClient.invalidateQueries({ queryKey: ['comments', 'post'] });
      queryClient.invalidateQueries({ queryKey: ['comments', 'user'] });
      queryClient.invalidateQueries({ queryKey: ['comments', 'replies'] });
    },
  });
};

export const useDeleteComment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: commentsApi.softDeleteComment,
    onSuccess: (data, commentId) => {
      // Invalidate the specific comment
      queryClient.invalidateQueries({ queryKey: ['comments', commentId] });
      
      // Invalidate all comment lists
      queryClient.invalidateQueries({ queryKey: ['comments', 'post'] });
      queryClient.invalidateQueries({ queryKey: ['comments', 'user'] });
      queryClient.invalidateQueries({ queryKey: ['comments', 'replies'] });
      
      // Invalidate comment counts
      queryClient.invalidateQueries({ queryKey: ['comments', 'count'] });
      queryClient.invalidateQueries({ queryKey: ['comments', 'replyCount'] });
      
      // Invalidate posts to update comment counts
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
      } else {
        return commentsApi.downvoteComment(commentId);
      }
    },
    // Optimistic update for better UX
    onMutate: async ({ commentId, voteType }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['comments', commentId] });

      // Snapshot the previous value
      const previousComment = queryClient.getQueryData(['comments', commentId]);

      // Optimistically update to the new value
      if (previousComment?.data) {
        queryClient.setQueryData(['comments', commentId], (old) => ({
          ...old,
          data: {
            ...old.data,
            upvotes: voteType === 'upvote' ? old.data.upvotes + 1 : old.data.upvotes,
            downvotes: voteType === 'downvote' ? old.data.downvotes + 1 : old.data.downvotes,
          },
        }));
      }

      return { previousComment };
    },
    // If the mutation fails, roll back
    onError: (err, variables, context) => {
      if (context?.previousComment) {
        queryClient.setQueryData(['comments', variables.commentId], context.previousComment);
      }
    },
    // Always refetch after error or success
    onSettled: (data, error, variables) => {
      queryClient.invalidateQueries({ queryKey: ['comments', variables.commentId] });
      queryClient.invalidateQueries({ queryKey: ['comments', 'post'] });
      queryClient.invalidateQueries({ queryKey: ['comments', 'user'] });
      queryClient.invalidateQueries({ queryKey: ['comments', 'replies'] });
    },
  });
};