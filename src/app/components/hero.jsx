"use client";
import React, { useState } from "react";
import {
  Search,
  Plus,
  Bell,
  User,
  Flame,
  Sparkles,
  TrendingUp,
  Clock,
  MessageSquare,
  Share2,
  Bookmark,
  MoreHorizontal,
  ArrowUp,
  ArrowDown,
  Menu,
  RefreshCw,
  SendHorizontal
} from "lucide-react";
import { usePosts, useVotePost } from "@/lib/hooks/usePosts";
import { useCreateComment } from "@/lib/hooks/useComments";
import { useAuth } from "@/lib/hooks/useAuth";
import { useRouter } from "next/navigation";

export default function RedditFeed() {
  const [activeFilter, setActiveFilter] = useState("hot");
  const [showCommentInput, setShowCommentInput] = useState(null);
  const [page, setPage] = useState(1);
  const [lastRefresh, setLastRefresh] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [text, setText] = useState("");
  const router = useRouter();
  const { data: authData } = useAuth();
  const user = authData?.user || null;

  // Map filter names to API sortBy values
  const sortByMap = {
    hot: "upvotes",
    new: "createdAt",
    top: "upvotes",
    rising: "createdAt",
  };

  // Fetch posts using the hook
  const { data: postsData, isLoading, error, refetch } = usePosts({
    page,
    sort: sortByMap[activeFilter],
    limit: 10,
  });

  console.log(postsData);

  const { mutate: votePost } = useVotePost();
  const { mutate: createComment, isPending } = useCreateComment();

  const handleVote = (postId, voteType) => {
    votePost({ postId, voteType });
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    setLastRefresh(new Date());
    setTimeout(() => setIsRefreshing(false), 600);
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

  // Format vote count (e.g., 1500 -> 1.5k)
  const formatVoteCount = (count) => {
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}k`;
    }
    return count.toString();
  };

  const handleSubmit = async (content, postId, parentId = null) => {
    if (!content.trim()) return;

    createComment(
      {
        postId,
        content: content.trim(),
        parentCommentId: parentId,
      },
      {
        onSuccess: () => {
          setText("");
          setShowCommentInput(null);
        },
        onError: (error) => {
          console.error("Failed to create comment:", error);
          alert(error.response?.data?.message || "Failed to post comment");
        },
      }
    );
  };


  return (
    <div className="min-h-screen bg-[#020d17]">
      {/* Main Container */}
      <div className="w-full max-w-[1200px] mx-auto px-2 sm:px-4 md:px-6 lg:px-8">
        {/* Filter Tabs */}
        <div className="sticky top-0 z-10 bg-[#020d17] pt-3 sm:pt-4 md:pt-6 pb-2 sm:pb-3">
          <div className="flex gap-1 sm:gap-2 md:gap-3 border-b border-[#343536] overflow-x-auto scrollbar-hide">
            {[
              { name: "hot", icon: Flame, label: "Hot" },
              { name: "new", icon: Sparkles, label: "New" },
              { name: "top", icon: TrendingUp, label: "Top" },
              { name: "rising", icon: Clock, label: "Rising" },
            ].map((filter) => (
              <button
                key={filter.name}
                onClick={() => setActiveFilter(filter.name)}
                className={`
                  flex items-center gap-1.5 sm:gap-2 md:gap-3 
                  px-2.5 sm:px-4 md:px-5 lg:px-6
                  py-2 sm:py-2.5 md:py-3 lg:py-3.5 
                  text-xs sm:text-sm md:text-base
                  transition-all relative rounded-lg whitespace-nowrap flex-shrink-0
                  ${activeFilter === filter.name
                    ? "text-white bg-[#272729]"
                    : "text-gray-400 hover:text-gray-200 hover:bg-[#1c1c1d]"
                  }
                `}
              >
                <filter.icon className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" />
                <span className="font-semibold hidden xs:inline">
                  {filter.label}
                </span>
                {activeFilter === filter.name && (
                  <div className="absolute bottom-0 left-0 right-0 h-[2px] sm:h-[3px] bg-white rounded-full" />
                )}
              </button>
            ))}

            {/* Spacer to push refresh button to the right */}
            <div className="flex-1"></div>

            {/* Refresh Button */}
            <div className="flex align-middle items-center">
              <button
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="flex items-center gap-2 px-3 py-2 text-white rounded-lg hover:bg-[#3a3a3c] transition-all disabled:opacity-50 flex-shrink-0"
              >
                <RefreshCw
                  className={`w-5 h-5 ${isRefreshing ? "animate-spin" : ""}`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="text-center py-20">
            <p className="text-red-400 text-lg">
              Failed to load posts. Please try again.
            </p>
          </div>
        )}

        {/* Posts Feed */}
        {!isLoading && !error && postsData?.data && (
          <div className="space-y-2 sm:space-y-3 md:space-y-4 lg:space-y-6 pb-12 sm:pb-16 md:pb-20">
            {postsData.data.map((post) => (
              <div
                key={post.postId}
                className="bg-[#0d1d2c] border border-[#343536] rounded-md sm:rounded-lg hover:border-[#1dddf2] transition-all duration-300 overflow-hidden relative"
              >
                {/* Liquid shimmer overlay */}
                <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-50 sm:opacity-100">
                  <div className="w-1/3 h-full bg-gradient-to-r from-transparent via-white/5 to-transparent" />
                </div>

                <div className="flex">
                  {/* Vote section */}
                  <div className="bg-[#0d1d2c] w-8 sm:w-10 md:w-12 flex flex-col items-center gap-0.5 sm:gap-1 py-1.5 sm:py-2 md:py-3 flex-shrink-0">
                    <button
                      onClick={() => handleVote(post.postId, "upvote")}
                      className="text-gray-400 hover:text-[#ff4500] p-0.5 sm:p-1 rounded transition-all duration-300 hover:scale-110 active:scale-95"
                    >
                      <ArrowUp className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5" />
                    </button>
                    <span className="text-white font-bold text-[10px] sm:text-xs md:text-sm leading-tight">
                      {formatVoteCount(post.upvotes - post.downvotes)}
                    </span>
                    <button
                      onClick={() => handleVote(post.postId, "downvote")}
                      className="text-gray-400 hover:text-[#7193ff] p-0.5 sm:p-1 rounded transition-all duration-300 hover:scale-110 active:scale-95"
                    >
                      <ArrowDown className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5" />
                    </button>
                  </div>

                  {/* Main Content */}
                  <div className="flex-1 p-1.5 sm:p-2 md:p-3 lg:p-4 min-w-0">
                    {/* Post Header */}
                    <div className="flex items-center gap-1 sm:gap-1.5 md:gap-2 mb-1 sm:mb-1.5 md:mb-2 text-[10px] sm:text-xs md:text-sm text-gray-400 flex-wrap">
                      <span className="font-semibold hover:underline cursor-pointer truncate max-w-[100px] sm:max-w-none">
                        r/{post.tags?.[0] || "general"}
                      </span>
                      <span className="hidden xs:inline">•</span>
                      <span onClick={() => router.push(`/profile/${post.userId}`)} className="hover:underline cursor-pointer truncate max-w-[80px] sm:max-w-none">
                        u/{post.user?.name || "Unknown User"}
                      </span>
                      <span className="hidden xs:inline">•</span>
                      <span className="text-[9px] sm:text-[10px] md:text-xs">
                        {formatTimeAgo(post.createdAt)}
                      </span>
                    </div>

                    <div className="flex flex-col md:flex-row gap-2 sm:gap-3 md:gap-4">
                      {/* Left side - Text content (60% on desktop) */}
                      <div className="flex-1 md:w-[60%] min-w-0">
                        {/* Title */}
                        <h2 onClick={() => router.push(`/post/${post.postId}`)} className="text-white text-sm sm:text-base md:text-lg lg:text-xl font-bold tracking-tight mb-1.5 sm:mb-2 cursor-pointer transition-colors duration-300 line-clamp-2 sm:line-clamp-3 md:line-clamp-none break-words">
                          {post.title}
                        </h2>

                        {/* Content */}
                        <p className="text-gray-400 text-[11px] sm:text-xs md:text-sm mb-1.5 sm:mb-2 md:mb-3 break-words">
                          {post.content && post.content.length > 150
                            ? `${post.content.substring(0, 250)}...`
                            : post.content}
                        </p>
                      </div>

                      {/* Right side - Image (40% on desktop, fixed height) */}
                      {post.media && post.media.length > 0 && (
                        <div
                          className="w-full h-52 md:w-[45%] md:h-36 lg:h-40 xl:h-44 flex-shrink-0 rounded-md sm:rounded-lg overflow-hidden cursor-pointer"
                          onClick={() =>
                            setShowCommentInput(
                              showCommentInput === `img-${post.postId}`
                                ? null
                                : `img-${post.postId}`
                            )
                          }
                        >
                          <img
                            src={post.media[0]}
                            alt={post.title}
                            className="w-full h-full object-cover hover:opacity-90 transition-opacity"
                          />
                        </div>
                      )}
                    </div>

                    {/* Expanded Image Modal */}
                    {post.media && post.media.length > 0 && showCommentInput === `img-${post.postId}` && (
                      <div
                        className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
                        onClick={() => setShowCommentInput(null)}
                      >
                        <img
                          src={post.media[0]}
                          alt={post.title}
                          className="max-w-full max-h-full object-contain"
                          onClick={(e) => e.stopPropagation()}
                        />
                      </div>
                    )}

                    {/* Action buttons */}
                    <div className="flex items-center gap-0.5 sm:gap-1 md:gap-2 flex-wrap mt-2 sm:mt-3">
                      <button
                        onClick={() =>
                          setShowCommentInput(
                            showCommentInput === post.postId
                              ? null
                              : post.postId
                          )
                        }
                        className="flex items-center gap-0.5 sm:gap-1 md:gap-2 px-1.5 sm:px-2 md:px-3 py-1 sm:py-1.5 md:py-2 text-gray-400 hover:bg-[#272729] rounded sm:rounded-md md:rounded-lg transition-all duration-300 active:scale-95"
                      >
                        <MessageSquare className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5" />
                        <span className="text-[10px] sm:text-xs md:text-sm font-semibold">
                          {post.commentCount || post.commentIds?.length || 0}
                        </span>
                      </button>

                      <button className="flex items-center gap-0.5 sm:gap-1 md:gap-2 px-1.5 sm:px-2 md:px-3 py-1 sm:py-1.5 md:py-2 text-gray-400 hover:bg-[#272729] rounded sm:rounded-md md:rounded-lg transition-all duration-300 active:scale-95">
                        <Share2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5" />
                        <span className="text-[10px] sm:text-xs md:text-sm font-semibold hidden md:inline">
                          Share
                        </span>
                      </button>

                      <button className="flex items-center gap-0.5 sm:gap-1 md:gap-2 px-1.5 sm:px-2 md:px-3 py-1 sm:py-1.5 md:py-2 text-gray-400 hover:bg-[#272729] rounded sm:rounded-md md:rounded-lg transition-all duration-300 active:scale-95">
                        <Bookmark className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5" />
                        <span className="text-[10px] sm:text-xs md:text-sm font-semibold hidden md:inline">
                          Save
                        </span>
                      </button>
                    </div>

                    {/* Comment Input */}
                    {showCommentInput === post.postId && (
                      <div className="mt-2 sm:mt-3 relative">
                        <input
                          type="text"
                          placeholder="Write a comment..."
                          className="w-full px-2 sm:px-3 py-1.5 sm:py-2 pr-10 rounded sm:rounded-md md:rounded-lg bg-[#1a1a1b] border border-gray-700 text-gray-200 placeholder:text-gray-500 focus:outline-none focus:ring-1 sm:focus:ring-2 focus:ring-blue-500 transition-all duration-300 text-xs sm:text-sm"
                          value={text}
                          onChange={(e) => setText(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" && text.trim() && user) {
                              e.preventDefault();
                              handleSubmit(text, post.postId, null);
                            }
                          }}
                          autoFocus
                        />

                        {/* Lucide icon button */}
                        <button
                          onClick={() => handleSubmit(text, post.postId, null)}
                          disabled={!text.trim() || !user}   // ← disabled if no text or not logged in
                          className={`absolute right-2 top-1/2 -translate-y-1/2 cursor-pointer
               p-1 rounded transition-all
               ${text.trim() && user
                              ? "text-blue-500 hover:text-blue-400"
                              : "text-gray-600 cursor-not-allowed opacity-50"
                            }`}
                        >
                          <SendHorizontal size={18} />
                        </button>
                        </div>
                    )}


                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && postsData?.data?.length === 0 && (
          <div className="text-center py-20">
            <p className="text-gray-400 text-lg">No posts found</p>
          </div>
        )}

        {/* Pagination */}
        {!isLoading && !error && postsData?.pagination && (
          <div className="flex justify-center gap-4 pb-8">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 py-2 bg-[#272729] text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#3a3a3c] transition-all"
            >
              Previous
            </button>
            <span className="px-4 py-2 text-white">
              Page {page} of {postsData.pagination.totalPages}
            </span>
            <button
              onClick={() => setPage((p) => p + 1)}
              disabled={page >= postsData.pagination.totalPages}
              className="px-4 py-2 bg-[#272729] text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#3a3a3c] transition-all"
            >
              Next
            </button>
          </div>
        )}
      </div>

      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }

        /* Extra small screens */
        @media (min-width: 475px) {
          .xs\\:inline {
            display: inline;
          }
        }
      `}</style>
    </div>
  );
}