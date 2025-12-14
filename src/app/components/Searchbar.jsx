"use client";
import React, { useState, useEffect, useRef } from "react";
import { Search, X, TrendingUp, Clock, Sparkles, AlertCircle } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAutocomplete, useSearch, useIsInCooldown } from "@/lib/hooks/useSearch";
import { useAuth } from "@/lib/hooks/useAuth";

export default function SearchBar({ 
  isMobile = false, 
  onClose = () => {},
  className = "" 
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [recentSearches, setRecentSearches] = useState([]);
  const searchRef = useRef(null);
  const inputRef = useRef(null);
  
  // Get current user for enhanced search feature
  const { data: authData } = useAuth();
  const user = authData?.user || null;

  // Check if we're in cooldown period
  const isInCooldown = useIsInCooldown();

  // Load recent searches from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("recentSearches");
    if (saved) {
      try {
        setRecentSearches(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse recent searches:", e);
      }
    }
  }, []);

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Fetch autocomplete suggestions (primary method)
  const { 
    data: autocompleteData, 
    isLoading: isAutocompleteLoading,
    isError: isAutocompleteError,
    isFetched: isAutocompleteFetched
  } = useAutocomplete(debouncedSearch, { 
    type: 'all', 
    limit: 5 
  });

  // Check if we can use autocomplete: indexReady === true AND isBuilding === false
  const canUseAutocomplete = 
    autocompleteData?.indexReady === true && 
    autocompleteData?.isBuilding === false;
  
  // Also keep isIndexReady for backward compatibility in UI messages
  const isIndexReady = autocompleteData?.indexReady ?? true;
  
  const shouldUseFallback = isInCooldown || (isAutocompleteFetched && !canUseAutocomplete);
  
  // Fallback search - enabled during cooldown or when autocomplete is unavailable
  const { 
    data: fallbackSearchData, 
    isLoading: isFallbackLoading 
  } = useSearch(debouncedSearch, {
    page: 1,
    sortBy: 'relevance',
    limit: 5,
    enhanced: false,
    enabled: shouldUseFallback // Only call when needed
  });

  // Determine which data to use
  const suggestions = (canUseAutocomplete && !isInCooldown)
    ? autocompleteData?.results?.posts 
    : fallbackSearchData?.data;
  const isLoading = (canUseAutocomplete && !isInCooldown) ? isAutocompleteLoading : isFallbackLoading;

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsFocused(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Handle search submission
  const handleSearch = (query) => {
    const trimmedQuery = query.trim();
    if (trimmedQuery.length < 2) return;

    // Add to recent searches
    saveRecentSearch(trimmedQuery);

    // Navigate to search results page
    router.push(`/search?q=${encodeURIComponent(trimmedQuery)}`);
    
    // Clear input and close
    setSearchTerm("");
    setIsFocused(false);
    onClose();
  };

  // Handle enhanced search
  const handleEnhancedSearch = () => {
    const trimmedQuery = debouncedSearch.trim();
    if (trimmedQuery.length < 2) return;

    // Add to recent searches
    saveRecentSearch(trimmedQuery);

    // Navigate to search page with enhanced flag
    router.push(`/search?q=${encodeURIComponent(trimmedQuery)}&enhanced=true`);
    
    // Clear input and close
    setSearchTerm("");
    setIsFocused(false);
    onClose();
  };

  // Save search to recent searches
  const saveRecentSearch = (query) => {
    const updated = [
      query,
      ...recentSearches.filter(s => s.toLowerCase() !== query.toLowerCase())
    ].slice(0, 10);
    
    setRecentSearches(updated);
    localStorage.setItem("recentSearches", JSON.stringify(updated));
  };

  // Clear recent searches
  const clearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem("recentSearches");
  };

  // Clear a single recent search
  const removeRecentSearch = (searchToRemove) => {
    const updated = recentSearches.filter(s => s !== searchToRemove);
    setRecentSearches(updated);
    localStorage.setItem("recentSearches", JSON.stringify(updated));
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSearch(searchTerm);
    }
  };

  const showDropdown = isFocused && (
    debouncedSearch.length >= 2 || 
    (searchTerm.length === 0 && recentSearches.length > 0)
  );

  return (
    <div ref={searchRef} className={`relative ${className}`}>
      {/* Search Input */}
      <div
        className={`flex items-center bg-[#0d1d2c] border transition-all rounded-full px-4 ${
          isMobile ? 'py-2.5' : 'py-2 lg:py-3'
        } ${
          isFocused
            ? "border-[#1dddf2] ring-2 ring-[#1dddf2]/30"
            : "border-[#343536] hover:border-[#1dddf2]/50"
        }`}
      >
        <Search className={`text-gray-400 flex-shrink-0 mr-2 lg:mr-3 ${
          isMobile ? 'w-5 h-5' : 'w-5 h-5 lg:w-6 lg:h-6'
        }`} />
        
        <input
          ref={inputRef}
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onKeyDown={handleKeyDown}
          placeholder="Search for posts"
          className="bg-transparent text-gray-300 placeholder-gray-500 outline-none flex-1 text-sm lg:text-base"
        />

        {searchTerm && (
          <button
            onClick={() => setSearchTerm("")}
            className="ml-2 p-1 hover:bg-[#323234] rounded-full transition-all"
          >
            <X className="w-4 h-4 text-gray-400" />
          </button>
        )}
      </div>

      {/* Dropdown - Suggestions or Recent Searches */}
      {showDropdown && (
        <div className="absolute top-full mt-2 left-0 right-0 bg-[#0d1d2c] border border-[#1dddf2]/30 rounded-lg shadow-[0_0_20px_rgba(29,221,242,0.2)] overflow-hidden z-50 max-h-[400px] overflow-y-auto">
          
          {/* Enhanced Search Button - Only for authenticated users with search query */}
          {user && debouncedSearch.length >= 2 && (
            <button
              onClick={handleEnhancedSearch}
              className="w-full px-4 py-3 bg-gradient-to-r from-[#1dddf2]/10 to-[#00ff11]/10 hover:from-[#1dddf2]/20 hover:to-[#00ff11]/20 border-b border-[#1dddf2]/30 transition-all flex items-center justify-center gap-2 group"
            >
              <Sparkles className="w-4 h-4 text-[#1dddf2] group-hover:animate-pulse" />
              <span className="text-[#1dddf2] text-sm font-semibold">
                Try Enhanced Search
              </span>
              <span className="text-xs text-gray-400 ml-1">(AI-Powered)</span>
            </button>
          )}

          {/* Index Status Warning - Show when index is not ready or building */}
          {!canUseAutocomplete && debouncedSearch.length >= 2 && autocompleteData && (
            <div className="px-4 py-2.5 bg-yellow-500/10 border-b border-yellow-500/30 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-yellow-500 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-yellow-500 text-xs font-medium">
                  {autocompleteData.isBuilding 
                    ? 'Search index is building' 
                    : 'Search index not ready'}
                </p>
                <p className="text-yellow-400/70 text-[10px] mt-0.5">
                  {autocompleteData.isBuilding
                    ? 'Index is being built. Using fallback search.'
                    : 'Using fallback search. Full search available shortly.'}
                </p>
              </div>
            </div>
          )}

          {/* Loading State */}
          {isLoading && debouncedSearch.length >= 2 && (
            <div className="px-4 py-3 text-gray-400 text-sm flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-[#1dddf2] border-t-transparent rounded-full animate-spin"></div>
              <span>{isIndexReady ? 'Searching...' : 'Using fallback search...'}</span>
            </div>
          )}

          {/* Search Suggestions */}
          {debouncedSearch.length >= 2 && suggestions && suggestions.length > 0 && !isLoading && (
            <div>
              <div className="px-4 py-2 text-xs text-gray-500 uppercase tracking-wide border-b border-[#343536] flex items-center justify-between">
                <span>{canUseAutocomplete ? 'Suggestions' : 'Results'}</span>
                {!canUseAutocomplete && autocompleteData && (
                  <span className="text-yellow-500 text-[10px] normal-case">
                    {autocompleteData.isBuilding ? 'Building Index' : 'Fallback Mode'}
                  </span>
                )}
              </div>
              {suggestions.map((post) => (
                <button
                  key={post.postId}
                  onClick={() => {
                    router.push(`/post/${post.postId}`);
                    setIsFocused(false);
                    onClose();
                  }}
                  className="w-full px-4 py-3 text-left hover:bg-[#323234] transition-all border-b border-[#343536]/50 last:border-b-0 group"
                >
                  <div className="flex items-start gap-3">
                    <Search className="w-4 h-4 text-[#1dddf2] mt-1 flex-shrink-0 group-hover:scale-110 transition-transform" />
                    <div className="flex-1 min-w-0">
                      <p className="text-gray-200 text-sm font-medium truncate group-hover:text-[#1dddf2] transition-colors">
                        {post.title}
                      </p>
                      <p className="text-gray-500 text-xs mt-0.5 line-clamp-1">
                        {post.content}
                      </p>
                      {/* Show post stats */}
                      <div className="flex items-center gap-2 mt-1 text-[10px] text-gray-600">
                        <span>↑ {post.upvotes || 0}</span>
                        <span>•</span>
                        <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* No Results */}
          {debouncedSearch.length >= 2 && (!suggestions || suggestions.length === 0) && !isLoading && (
            <div className="px-4 py-6 text-center">
              <div className="w-12 h-12 bg-[#323234] rounded-full flex items-center justify-center mx-auto mb-3">
                <Search className="w-6 h-6 text-gray-600" />
              </div>
              <p className="text-gray-400 text-sm font-medium">No results found</p>
              <p className="text-gray-500 text-xs mt-1">
                Try different keywords or check your spelling
              </p>
              {user && (
                <button
                  onClick={handleEnhancedSearch}
                  className="mt-3 px-4 py-2 bg-[#1dddf2]/10 hover:bg-[#1dddf2]/20 border border-[#1dddf2]/30 rounded-full text-[#1dddf2] text-xs font-medium transition-all"
                >
                  Try Enhanced Search
                </button>
              )}
            </div>
          )}

          {/* Recent Searches */}
          {searchTerm.length === 0 && recentSearches.length > 0 && (
            <div>
              <div className="px-4 py-2 flex items-center justify-between border-b border-[#343536]">
                <span className="text-xs text-gray-500 uppercase tracking-wide">
                  Recent Searches
                </span>
                <button
                  onClick={clearRecentSearches}
                  className="text-xs text-[#1dddf2] hover:text-[#1dddf2]/70 transition-colors font-medium"
                >
                  Clear All
                </button>
              </div>
              {recentSearches.slice(0, 5).map((search, index) => (
                <div
                  key={index}
                  className="flex items-center hover:bg-[#323234] transition-all border-b border-[#343536]/50 last:border-b-0 group"
                >
                  <button
                    onClick={() => handleSearch(search)}
                    className="flex-1 px-4 py-3 text-left flex items-center gap-3"
                  >
                    <Clock className="w-4 h-4 text-gray-500 flex-shrink-0 group-hover:text-[#1dddf2] transition-colors" />
                    <span className="text-gray-200 text-sm group-hover:text-[#1dddf2] transition-colors">
                      {search}
                    </span>
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeRecentSearch(search);
                    }}
                    className="px-3 py-3 hover:bg-[#323234]/50 transition-all"
                  >
                    <X className="w-4 h-4 text-gray-500 hover:text-gray-300 transition-colors" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}