// src/lib/hooks/useAuth.js
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { authApi } from '@/lib/api/auth';

export const useAuth = () => {
  return useQuery({
    queryKey: ['auth', 'user'],
    queryFn: authApi.getCurrentUser,
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
    cacheTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
    retry: false, // Don't retry if user is not authenticated
    refetchOnWindowFocus: false, // Don't refetch when user focuses window
  });
};

export const useUpdateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: authApi.updateUser,
    onSuccess: (data) => {
      queryClient.setQueryData(['auth', 'user'], {
        success: true,
        user: data.user
      });
      
      // Optionally invalidate to refetch
      queryClient.invalidateQueries(['auth', 'user']);
    },
    onError: (error) => {
      console.error('Update user error:', error);
    }
  });
};

export const useDeleteUser = () => {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: authApi.deleteUser,
    onSuccess: () => {
      // Clear all cached data
      queryClient.clear();
      
      // Remove access token
      localStorage.removeItem('accessToken');
      
      // Small delay to ensure cookies are cleared
      setTimeout(() => {
        router.push('/');
      }, 100);
    },
    onError: (error) => {
      console.error('Delete user error:', error);
    }
  });
};

export const useLogout = () => {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: authApi.logout,
    onSuccess: () => {
      queryClient.clear();
      router.push('/');
    },
  });
};