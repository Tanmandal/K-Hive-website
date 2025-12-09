// src/lib/hooks/usePosts.js
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { postsApi } from '@/lib/api/posts';

// Query hooks
export const usePosts = ({ page = 1, sort = 'new', limit = 10 } = {}) => {
  return useQuery({
    queryKey: ['posts', page, sort, limit],
    queryFn: () => postsApi.getAllPosts({ page, sort, limit }),
  });
};

export const usePost = (postId) => {
  return useQuery({
    queryKey: ['posts', postId],
    queryFn: () => postsApi.getPostById(postId),
    enabled: !!postId,
  });
};

export const useUserPosts = (userId, { page = 1, limit = 10 } = {}) => {
  return useQuery({
    queryKey: ['posts', 'user', userId, page, limit],
    queryFn: () => postsApi.getPostsByUserId(userId, { page, limit }),
    enabled: !!userId,
  });
};

export const useSearchPosts = (query, { page = 1, sortBy = 'relevance', limit = 10 } = {}) => {
  const trimmedQuery = query?.trim() || '';
  
  return useQuery({
    queryKey: ['posts', 'search', trimmedQuery, page, sortBy, limit],
    queryFn: () => postsApi.searchPosts(trimmedQuery, { page, sortBy, limit }),
    enabled: trimmedQuery.length >= 2,
    placeholderData: (previousData) => previousData,
    staleTime: 1000 * 60 * 2,
    gcTime: 1000 * 60 * 5,
    retry: false,
    refetchOnWindowFocus: true,
  });
};

// Mutation hooks
export const useCreatePost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: postsApi.createPost,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
  });
};

export const useUpdatePost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: postsApi.updatePost,
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      queryClient.invalidateQueries({ queryKey: ['posts', variables.postId] });
    },
  });
};

export const useDeletePost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: postsApi.deletePost,
    onSuccess: (data, postId) => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      queryClient.removeQueries({ queryKey: ['posts', postId] });
    },
  });
};

export const useVotePost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ postId, voteType }) => {
      if (voteType === 'upvote') {
        return postsApi.upvotePost(postId);
      } else {
        return postsApi.downvotePost(postId);
      }
    },
    onMutate: async ({ postId, voteType }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['posts', postId] });

      // Snapshot previous value
      const previousPost = queryClient.getQueryData(['posts', postId]);

      // Optimistically update
      if (previousPost?.data) {
        const currentVote = previousPost.data.vote || 0;
        const newVote = voteType === 'upvote' ? 1 : -1;
        
        let upvoteDelta = 0;
        let downvoteDelta = 0;

        // Calculate deltas based on current vote state
        if (currentVote === 0) {
          // No previous vote
          if (newVote === 1) upvoteDelta = 1;
          else downvoteDelta = 1;
        } else if (currentVote === 1) {
          // Previously upvoted
          if (newVote === 1) {
            // Toggle off upvote
            upvoteDelta = -1;
          } else {
            // Change to downvote
            upvoteDelta = -1;
            downvoteDelta = 1;
          }
        } else if (currentVote === -1) {
          // Previously downvoted
          if (newVote === -1) {
            // Toggle off downvote
            downvoteDelta = -1;
          } else {
            // Change to upvote
            downvoteDelta = -1;
            upvoteDelta = 1;
          }
        }

        queryClient.setQueryData(['posts', postId], (old) => ({
          ...old,
          data: {
            ...old.data,
            upvotes: old.data.upvotes + upvoteDelta,
            downvotes: old.data.downvotes + downvoteDelta,
            vote: currentVote === newVote ? 0 : newVote, // Toggle if same, otherwise set new vote
          },
        }));
      }

      return { previousPost };
    },
    onError: (err, variables, context) => {
      // Rollback on error
      if (context?.previousPost) {
        queryClient.setQueryData(['posts', variables.postId], context.previousPost);
      }
    },
    onSuccess: (response, variables) => {
      // Update with actual server response
      const { postId } = variables;
      
      queryClient.setQueryData(['posts', postId], (old) => {
        if (!old) return old;
        
        return {
          ...old,
          data: {
            ...old.data,
            upvotes: response.data.upvotes,
            downvotes: response.data.downvotes,
            vote: response.data.userVote,
          },
        };
      });
    },
    onSettled: (data, error, variables) => {
      // Invalidate to ensure consistency
      queryClient.invalidateQueries({ queryKey: ['posts', variables.postId] });
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
  });
};