// src/lib/hooks/useSearch.js
import { useQuery } from '@tanstack/react-query';
import { searchApi } from '@/lib/api/search';

// Track when index was last unavailable (shared across all components)
const indexUnavailableTimestamp = { current: null };

export const useAutocomplete = (query, options = {}) => {
  const { type = 'all', limit = 5 } = options;
  const trimmedQuery = query?.trim() || '';
  
  // Check if we're in the 30s cooldown period
  const now = Date.now();
  const isInCooldown = indexUnavailableTimestamp.current && 
    (now - indexUnavailableTimestamp.current < 30000);

  // If cooldown period has expired, reset the timestamp
  if (indexUnavailableTimestamp.current && (now - indexUnavailableTimestamp.current >= 30000)) {
    indexUnavailableTimestamp.current = null;
  }

  return useQuery({
    queryKey: ['search', 'autocomplete', trimmedQuery, type, limit],
    queryFn: async () => {
      const result = await searchApi.autocomplete(trimmedQuery, { type, limit });
      
      // Only use autocomplete if indexReady === true AND isBuilding === false
      const canUseAutocomplete = result.indexReady === true && result.isBuilding === false;
      
      if (!canUseAutocomplete) {
        // Set timestamp to start 30s cooldown
        indexUnavailableTimestamp.current = Date.now();
      } else {
        // Clear timestamp if autocomplete is working
        indexUnavailableTimestamp.current = null;
      }
      
      return result;
    },
    enabled: trimmedQuery.length >= 2 && !isInCooldown,
    staleTime: 1000 * 60 * 2, // 2 minutes
    gcTime: 1000 * 60 * 5,
    retry: false,
    refetchOnWindowFocus: false,
  });
};

export const useSearch = (query, options = {}) => {
  const { 
    page = 1, 
    sortBy = 'relevance', 
    limit = 10, 
    enhanced = false,
    enabled = true // Allow external control
  } = options;
  const trimmedQuery = query?.trim() || '';

  return useQuery({
    queryKey: ['search', 'results', trimmedQuery, page, sortBy, limit, enhanced],
    queryFn: () => searchApi.search(trimmedQuery, { page, sortBy, limit, enhanced }),
    enabled: enabled && trimmedQuery.length >= 2, // Respect external enabled flag
    staleTime: 1000 * 60 * 2,
    gcTime: 1000 * 60 * 5,
    retry: 1,
    refetchOnWindowFocus: false,
  });
};

// Hook to check if we're in cooldown (can be used by components)
export const useIsInCooldown = () => {
  const now = Date.now();
  return indexUnavailableTimestamp.current && 
    (now - indexUnavailableTimestamp.current < 30000);
};

// Keep old hook for backward compatibility
export const useSearchPosts = (query, options = {}) => {
  console.warn('useSearchPosts is deprecated, use useSearch instead');
  return useSearch(query, options);
};