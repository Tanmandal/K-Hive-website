// src/lib/api/search.js
import apiClient from './client';

export const searchApi = {
  // Autocomplete search
  autocomplete: async (query, params = {}) => {
    const { type = 'all', limit = 10 } = params;
    
    const { data } = await apiClient.get('/search/autocomplete', {
      params: { 
        q: query,
        type,
        limit 
      },
    });
    return data;
  },

  // Full search (fallback when index not ready, or for results page)
  search: async (query, params = {}) => {
    const { page = 1, sortBy = 'relevance', limit = 10, enhanced = false } = params;
    
    const { data } = await apiClient.get('/search', {
      params: { 
        q: query,
        page,
        sortBy,
        limit,
        enhanced: enhanced ? 'true' : undefined
      },
    });
    return data;
  },

  // Get tag suggestions
  getTagSuggestions: async (query, limit = 10) => {
    const { data } = await apiClient.get('/search/tags', {
      params: { q: query, limit },
    });
    return data;
  },
};