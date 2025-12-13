"use client";
import React, { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useSearch } from "@/lib/hooks/useSearch";
import { 
  Search, 
  TrendingUp, 
  Clock, 
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Loader2,
  ArrowUp,
  ArrowDown,
  MessageSquare,
  Share2,
  Bookmark,
  AlertCircle,
  Zap
} from "lucide-react";
import { useAuth } from "@/lib/hooks/useAuth";

export default function SearchResultsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";
  const enhanced = searchParams.get("enhanced") === "true";
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState("relevance");
  const [showImageModal, setShowImageModal] = useState(null);
  const limit = 10;

  // Get auth data for enhanced search toggle
  const { data: authData } = useAuth();
  const user = authData?.user || null;

  // Fetch search results
  const { 
    data, 
    isLoading, 
    isError, 
    error, 
    isFetching 
  } = useSearch(query, { 
    page, 
    sortBy, 
    limit,
    enhanced 
  });

  // Reset page when query changes
  useEffect(() => {
    setPage(1);
  }, [query, enhanced]);

  // Scroll to top on page change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [page]);

  const handleSortChange = (newSort) => {
    setSortBy(newSort);
    setPage(1);
  };

  const toggleEnhancedSearch = () => {
    if (!user) return;
    const newUrl = enhanced 
      ? `/search?q=${encodeURIComponent(query)}`
      : `/search?q=${encodeURIComponent(query)}&enhanced=true`;
    router.push(newUrl);
  };

  // Format time ago
  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);

    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  // Format vote count
  const formatVoteCount = (count) => {
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}k`;
    }
    return count.toString();
  };

  if (!query || query.trim().length < 2) {
    return (
      <div className="min-h-screen bg-[#020d17] pt-24 px-4">
        <div className="max-w-4xl mx-auto text-center py-20">
          <Search className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-400 mb-2">
            Start Searching
          </h2>
          <p className="text-gray-500">
            Enter at least 2 characters to search
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020d17] pt-16 px-3 sm:px-4 pb-12">
      <div className="max-w-[1200px] mx-auto">
        {/* Search Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Search className="w-5 h-5 text-[#1dddf2]" />
            <h1 className="text-xl sm:text-2xl font-bold text-white">
              Search Results
            </h1>
            {enhanced && (
              <span className="px-2 py-1 bg-gradient-to-r from-[#1dddf2]/20 to-[#00ff11]/20 border border-[#1dddf2]/30 rounded-full text-xs font-semibold text-[#1dddf2] flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                Enhanced
              </span>
            )}
          </div>
          
          <div className="flex flex-col gap-3">
            {/* Query Info */}
            <p className="text-gray-400 text-sm">
              Showing results for: <span className="text-[#1dddf2] font-semibold">"{query}"</span>
              {data?.pagination && (
                <span className="ml-2">
                  ({data.pagination.total} results)
                </span>
              )}
            </p>

            {/* Enhanced Search Info for Comments */}
            {enhanced && data?.matchingComments && data.matchingComments.length > 0 && (
              <div className="bg-gradient-to-r from-[#1dddf2]/10 to-[#00ff11]/10 border border-[#1dddf2]/30 rounded-lg p-3 flex items-start gap-2">
                <Zap className="w-4 h-4 text-[#1dddf2] flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-[#1dddf2] text-sm font-semibold">
                    Found in {data.matchingComments.length} comment{data.matchingComments.length !== 1 ? 's' : ''}
                  </p>
                  <p className="text-gray-400 text-xs mt-0.5">
                    Enhanced search found matches in post comments
                  </p>
                </div>
              </div>
            )}

            {/* Controls Row */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              {/* Sort Options */}
              <div className="flex items-center gap-2">
                <span className="text-gray-500 text-sm">Sort by:</span>
                <div className="flex gap-2">
                  {[
                    { value: "relevance", label: "Relevance", icon: Sparkles },
                    { value: "recent", label: "Recent", icon: Clock },
                    { value: "popular", label: "Popular", icon: TrendingUp }
                  ].map(({ value, label, icon: Icon }) => (
                    <button
                      key={value}
                      onClick={() => handleSortChange(value)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs sm:text-sm font-medium transition-all ${
                        sortBy === value
                          ? "bg-[#1dddf2] text-white"
                          : "bg-[#0d1d2c] text-gray-400 hover:bg-[#323234] border border-[#343536]"
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">{label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Enhanced Search Toggle - Only for authenticated users */}
              {user && (
                <button
                  onClick={toggleEnhancedSearch}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    enhanced
                      ? "bg-gradient-to-r from-[#1dddf2] to-[#00ff11] text-white shadow-[0_0_10px_rgba(29,221,242,0.5)]"
                      : "bg-[#0d1d2c] text-gray-400 hover:bg-[#323234] border border-[#343536] hover:border-[#1dddf2]/50"
                  }`}
                >
                  <Sparkles className={`w-4 h-4 ${enhanced ? 'animate-pulse' : ''}`} />
                  <span>{enhanced ? 'Enhanced' : 'Standard'} Search</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-12 h-12 text-[#1dddf2] animate-spin mb-4" />
            <p className="text-gray-400">
              {enhanced ? 'Running enhanced search...' : 'Searching...'}
            </p>
          </div>
        )}

        {/* Error State */}
        {isError && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-6 text-center">
            <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-3" />
            <p className="text-red-400 font-medium mb-2">Search Failed</p>
            <p className="text-gray-400 text-sm">
              {error?.response?.data?.message || error?.message || "Something went wrong"}
            </p>
          </div>
        )}

        {/* Results */}
        {!isLoading && !isError && data?.data && (
          <>
            {data.data.length === 0 ? (
              <div className="text-center py-20">
                <div className="w-20 h-20 bg-[#0d1d2c] rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="w-10 h-10 text-gray-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-400 mb-2">
                  No Results Found
                </h3>
                <p className="text-gray-500 mb-6">
                  Try different keywords or check your spelling
                </p>
                {user && !enhanced && (
                  <button
                    onClick={toggleEnhancedSearch}
                    className="px-6 py-2.5 bg-gradient-to-r from-[#1dddf2] to-[#00ff11] text-white rounded-full font-medium hover:shadow-[0_0_20px_rgba(29,221,242,0.6)] transition-all flex items-center gap-2 mx-auto"
                  >
                    <Sparkles className="w-4 h-4" />
                    Try Enhanced Search
                  </button>
                )}
                {!user && (
                  <button
                    onClick={() => router.push("/")}
                    className="px-6 py-2.5 bg-[#1dddf2] text-white rounded-full font-medium hover:bg-[#1dddf2]/90 transition-all"
                  >
                    Back to Home
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-2 sm:space-y-3 md:space-y-4">
                {/* Fetching Indicator */}
                {isFetching && !isLoading && (
                  <div className="bg-[#1dddf2]/10 border border-[#1dddf2]/30 rounded-lg px-4 py-2 flex items-center gap-2">
                    <Loader2 className="w-4 h-4 text-[#1dddf2] animate-spin" />
                    <span className="text-sm text-[#1dddf2]">Updating results...</span>
                  </div>
                )}

                {/* Search Results List */}
                {data.data.map((post) => (
                  <div
                    key={post.postId}
                    className="bg-[#0d1d2c] border border-[#343536] rounded-md sm:rounded-lg hover:border-[#1dddf2] transition-all duration-300 overflow-hidden relative cursor-pointer"
                    onClick={() => router.push(`/post/${post.postId}`)}
                  >
                    {/* Liquid shimmer overlay */}
                    <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-50 sm:opacity-100">
                      <div className="w-1/3 h-full bg-gradient-to-r from-transparent via-white/5 to-transparent" />
                    </div>

                    <div className="flex">
                      {/* Vote section */}
                      <div className="bg-[#0d1d2c] w-8 sm:w-10 md:w-12 flex flex-col items-center gap-0.5 sm:gap-1 py-1.5 sm:py-2 md:py-3 flex-shrink-0">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                          }}
                          className="text-gray-400 hover:text-[#ff4500] p-0.5 sm:p-1 rounded transition-all duration-300 hover:scale-110 active:scale-95"
                        >
                          <ArrowUp className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5" />
                        </button>
                        <span className="text-white font-bold text-[10px] sm:text-xs md:text-sm leading-tight">
                          {formatVoteCount((post.upvotes || 0) - (post.downvotes || 0))}
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                          }}
                          className="text-gray-400 hover:text-[#7193ff] p-0.5 sm:p-1 rounded transition-all duration-300 hover:scale-110 active:scale-95"
                        >
                          <ArrowDown className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5" />
                        </button>
                      </div>

                      {/* Main Content */}
                      <div className="flex-1 p-1.5 sm:p-2 md:p-3 lg:p-4 min-w-0">
                        <div className="flex gap-2 sm:gap-3 md:gap-4">
                          {/* Text Content */}
                          <div className="flex-1 min-w-0">
                            {/* Post Header */}
                            <div className="flex items-center gap-1 sm:gap-1.5 md:gap-2 mb-1 sm:mb-1.5 md:mb-2 text-[10px] sm:text-xs md:text-sm text-gray-400 flex-wrap">
                              <span className="font-semibold hover:underline cursor-pointer truncate max-w-[100px] sm:max-w-none">
                                r/{post.tags?.[0] || "general"}
                              </span>
                              <span className="hidden xs:inline">•</span>
                              <span className="hover:underline cursor-pointer truncate max-w-[80px] sm:max-w-none">
                                u/{post.user?.name || post.userName || "Unknown"}
                              </span>
                              <span className="hidden xs:inline">•</span>
                              <span className="text-[9px] sm:text-[10px] md:text-xs">
                                {formatTimeAgo(post.createdAt)}
                              </span>
                              {post.viewCount > 0 && (
                                <>
                                  <span className="hidden sm:inline">•</span>
                                  <span className="hidden sm:inline text-[10px] md:text-xs">
                                    {post.viewCount} views
                                  </span>
                                </>
                              )}
                            </div>

                            {/* Title */}
                            <h2 className="text-white text-sm sm:text-base md:text-lg lg:text-xl font-bold tracking-tight mb-1.5 sm:mb-2 hover:text-[#1dddf2] transition-colors duration-300 line-clamp-2">
                              {post.title}
                            </h2>

                            {/* Content */}
                            <p className="text-gray-400 text-[11px] sm:text-xs md:text-sm mb-1.5 sm:mb-2 md:mb-3 line-clamp-2 sm:line-clamp-3 break-words">
                              {post.content}
                            </p>

                            {/* Action buttons */}
                            <div className="flex items-center gap-0.5 sm:gap-1 md:gap-2 flex-wrap">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                }}
                                className="flex items-center gap-0.5 sm:gap-1 md:gap-2 px-1.5 sm:px-2 md:px-3 py-1 sm:py-1.5 md:py-2 text-gray-400 hover:bg-[#272729] rounded sm:rounded-md md:rounded-lg transition-all duration-300 active:scale-95"
                              >
                                <MessageSquare className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5" />
                                <span className="text-[10px] sm:text-xs md:text-sm font-semibold">
                                  {post.commentCount || 0}
                                </span>
                              </button>

                              <button
                                onClick={(e) => e.stopPropagation()}
                                className="flex items-center gap-0.5 sm:gap-1 md:gap-2 px-1.5 sm:px-2 md:px-3 py-1 sm:py-1.5 md:py-2 text-gray-400 hover:bg-[#272729] rounded sm:rounded-md md:rounded-lg transition-all duration-300 active:scale-95"
                              >
                                <Share2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5" />
                                <span className="text-[10px] sm:text-xs md:text-sm font-semibold hidden md:inline">
                                  Share
                                </span>
                              </button>

                              <button
                                onClick={(e) => e.stopPropagation()}
                                className="flex items-center gap-0.5 sm:gap-1 md:gap-2 px-1.5 sm:px-2 md:px-3 py-1 sm:py-1.5 md:py-2 text-gray-400 hover:bg-[#272729] rounded sm:rounded-md md:rounded-lg transition-all duration-300 active:scale-95"
                              >
                                <Bookmark className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5" />
                                <span className="text-[10px] sm:text-xs md:text-sm font-semibold hidden md:inline">
                                  Save
                                </span>
                              </button>
                            </div>
                          </div>

                          {/* Image on Right Side */}
                          {post.media && post.media.length > 0 && (
                            <div 
                              className="flex-shrink-0 w-20 h-full sm:w-24 sm:h-24 md:w-28 md:h-28 lg:w-32 lg:h-32 rounded-md sm:rounded-lg overflow-hidden cursor-pointer hover:opacity-90 transition-opacity"
                              onClick={(e) => {
                                e.stopPropagation();
                                setShowImageModal(post.postId);
                              }}
                            >
                              <img
                                src={post.media[0]}
                                alt={post.title}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          )}
                        </div>

                        {/* Tags */}
                        {post.tags && post.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 sm:gap-2 mt-2 sm:mt-3">
                            {post.tags.slice(0, 3).map((tag, idx) => (
                              <span
                                key={idx}
                                className="px-2 py-0.5 sm:py-1 bg-[#1dddf2]/10 text-[#1dddf2] rounded-full text-[10px] sm:text-xs"
                              >
                                #{tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Expanded Image Modal */}
                    {showImageModal === post.postId && post.media && post.media.length > 0 && (
                      <div
                        className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowImageModal(null);
                        }}
                      >
                        <img
                          src={post.media[0]}
                          alt={post.title}
                          className="max-w-full max-h-full object-contain"
                          onClick={(e) => e.stopPropagation()}
                        />
                      </div>
                    )}
                  </div>
                ))}

                {/* Pagination */}
                {data.pagination && data.pagination.totalPages > 1 && (
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 mt-6 border-t border-[#343536]">
                    <p className="text-sm text-gray-400">
                      Page {data.pagination.currentPage} of {data.pagination.totalPages}
                      {" "}({data.pagination.total} total results)
                    </p>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={page === 1}
                        className="flex items-center gap-1 px-4 py-2 bg-[#0d1d2c] border border-[#343536] text-gray-300 rounded-lg hover:border-[#1dddf2]/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                      >
                        <ChevronLeft className="w-4 h-4" />
                        <span className="hidden sm:inline">Previous</span>
                      </button>

                      {/* Page Numbers */}
                      <div className="flex gap-1">
                        {Array.from({ length: Math.min(5, data.pagination.totalPages) }, (_, i) => {
                          let pageNum;
                          if (data.pagination.totalPages <= 5) {
                            pageNum = i + 1;
                          } else if (page <= 3) {
                            pageNum = i + 1;
                          } else if (page >= data.pagination.totalPages - 2) {
                            pageNum = data.pagination.totalPages - 4 + i;
                          } else {
                            pageNum = page - 2 + i;
                          }

                          return (
                            <button
                              key={pageNum}
                              onClick={() => setPage(pageNum)}
                              className={`w-10 h-10 rounded-lg font-medium transition-all ${
                                page === pageNum
                                  ? "bg-[#1dddf2] text-white"
                                  : "bg-[#0d1d2c] border border-[#343536] text-gray-300 hover:border-[#1dddf2]/50"
                              }`}
                            >
                              {pageNum}
                            </button>
                          );
                        })}
                      </div>

                      <button
                        onClick={() => setPage(p => Math.min(data.pagination.totalPages, p + 1))}
                        disabled={page >= data.pagination.totalPages}
                        className="flex items-center gap-1 px-4 py-2 bg-[#0d1d2c] border border-[#343536] text-gray-300 rounded-lg hover:border-[#1dddf2]/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                      >
                        <span className="hidden sm:inline">Next</span>
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>

      <style jsx>{`
        @media (min-width: 475px) {
          .xs\\:inline {
            display: inline;
          }
        }
      `}</style>
    </div>
  );
}