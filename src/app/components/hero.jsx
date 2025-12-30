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
  SendHorizontal,
  Check,
  Copy,
  Pin,
  Megaphone
} from "lucide-react";
import { usePosts, useVotePost, usePinnedPosts } from "@/lib/hooks/usePosts";
import { useCreateComment } from "@/lib/hooks/useComments";
import { useAuth } from "@/lib/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

export default function RedditFeed() {
  const [activeFilter, setActiveFilter] = useState("recent");
  const [showCommentInput, setShowCommentInput] = useState(null);
  const [page, setPage] = useState(1);
  const [lastRefresh, setLastRefresh] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [text, setText] = useState("");
  const [copiedPostId, setCopiedPostId] = useState(null);
  const [votingPosts, setVotingPosts] = useState({});
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: authData } = useAuth();
  const user = authData?.user || null;

  // Fetch regular posts or pinned posts based on active filter
  const { data: postsData, isLoading: postsLoading, error: postsError, refetch: refetchPosts } = usePosts({
    page,
    sort: "createdAt",
    limit: 10,
  });

  const { data: pinnedData, isLoading: pinnedLoading, error: pinnedError, refetch: refetchPinned } = usePinnedPosts({
    page,
    limit: 10,
  });

  // Determine which data to use based on active filter
  const isLoading = activeFilter === "recent" ? postsLoading : pinnedLoading;
  const error = activeFilter === "recent" ? postsError : pinnedError;
  const data = activeFilter === "recent" ? postsData : pinnedData;
  const refetch = activeFilter === "recent" ? refetchPosts : refetchPinned;

  const { mutate: votePost } = useVotePost();
  const { mutate: createComment, isPending } = useCreateComment();

  const handleVote = (postId, voteType) => {
    // Check if user is logged in
    if (!user) {
      toast.error("Please login to vote", {
        duration: 3000,
        style: {
          background: "#1a2836",
          color: "#fff",
          border: "1px solid #ff4500",
        },
      });
      return;
    }

    // Set voting state for this post
    setVotingPosts(prev => ({ ...prev, [postId]: true }));

    // Optimistic update
    const queryKey = activeFilter === "recent" 
      ? ['posts', { page, sort: "createdAt", limit: 10 }]
      : ['pinnedPosts', { page, limit: 10 }];

    queryClient.setQueryData(queryKey, (oldData) => {
      if (!oldData) return oldData;

      return {
        ...oldData,
        data: oldData.data.map((post) => {
          if (post.postId !== postId) return post;

          const currentVote = post.vote || 0;
          const isUpvote = voteType === "upvote";
          let newVote = 0;
          let newUpvotes = post.upvotes;
          let newDownvotes = post.downvotes;

          // Calculate new vote state
          if (isUpvote) {
            if (currentVote === 1) {
              // Removing upvote
              newVote = 0;
              newUpvotes = Math.max(0, post.upvotes - 1);
            } else if (currentVote === -1) {
              // Switching from downvote to upvote
              newVote = 1;
              newUpvotes = post.upvotes + 1;
              newDownvotes = Math.max(0, post.downvotes - 1);
            } else {
              // Adding upvote
              newVote = 1;
              newUpvotes = post.upvotes + 1;
            }
          } else {
            // Downvote
            if (currentVote === -1) {
              // Removing downvote
              newVote = 0;
              newDownvotes = Math.max(0, post.downvotes - 1);
            } else if (currentVote === 1) {
              // Switching from upvote to downvote
              newVote = -1;
              newDownvotes = post.downvotes + 1;
              newUpvotes = Math.max(0, post.upvotes - 1);
            } else {
              // Adding downvote
              newVote = -1;
              newDownvotes = post.downvotes + 1;
            }
          }

          return {
            ...post,
            vote: newVote,
            upvotes: newUpvotes,
            downvotes: newDownvotes,
          };
        }),
      };
    });

    // Perform actual API call
    votePost(
      { postId, voteType },
      {
        onSuccess: async () => {
          // Refetch to get the actual server state
          await refetch();
          setVotingPosts(prev => {
            const newState = { ...prev };
            delete newState[postId];
            return newState;
          });
        },
        onError: (error) => {
          console.error("Failed to vote:", error);
          // Revert optimistic update on error
          refetch();
          setVotingPosts(prev => {
            const newState = { ...prev };
            delete newState[postId];
            return newState;
          });
        },
      }
    );
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    setLastRefresh(new Date());
    setTimeout(() => setIsRefreshing(false), 600);
  };

  const handleShare = async (postId) => {
    const postUrl = `${window.location.origin}/post/${postId}`;
    
    try {
      if (navigator.share) {
        await navigator.share({
          title: 'Check out this post',
          url: postUrl
        });
      } else {
        await navigator.clipboard.writeText(postUrl);
        setCopiedPostId(postId);
        setTimeout(() => setCopiedPostId(null), 2000);
      }
    } catch (error) {
      try {
        await navigator.clipboard.writeText(postUrl);
        setCopiedPostId(postId);
        setTimeout(() => setCopiedPostId(null), 2000);
      } catch (err) {
        console.error('Failed to share:', err);
      }
    }
  };

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
          toast.success("Comment posted successfully!", {
            duration: 3000,
            style: {
              background: "#1a2836",
              color: "#fff",
              border: "1px solid #1dddf2",
            },
          });
        },
        onError: (error) => {
          console.error("Failed to create comment:", error);
          toast.error(error.response?.data?.message || "Failed to post comment", {
            duration: 3000,
            style: {
              background: "#1a2836",
              color: "#fff",
              border: "1px solid #ff4500",
            },
          });
        },
      }
    );
  };

  const handleFilterChange = (filter) => {
    setActiveFilter(filter);
    setPage(1); // Reset to page 1 when switching tabs
  };

  return (
    <div className="min-h-screen bg-[#020d17]">
      <div className="w-full max-w-[1200px] mx-auto px-2 sm:px-4 md:px-6 lg:px-8">
        <div className="sticky top-0 z-10 bg-[#020d17] pt-3 sm:pt-4 md:pt-6 pb-2 sm:pb-3">
          <div className="flex gap-1 sm:gap-2 md:gap-3 border-b border-[#343536] overflow-x-auto scrollbar-hide">
            {[
              { name: "recent", icon: Clock, label: "Recent" },
              {
                name: "announcements",
                icon: Megaphone,
                label: "Announcements",
              },
            ].map((filter) => (
              <button
                key={filter.name}
                onClick={() => handleFilterChange(filter.name)}
                className={`
                  flex items-center gap-1.5 sm:gap-2 md:gap-3 
                  px-2.5 sm:px-4 md:px-5 lg:px-6
                  py-2 sm:py-2.5 md:py-3 lg:py-3.5 
                  text-xs sm:text-sm md:text-base
                  transition-all relative rounded-lg whitespace-nowrap flex-shrink-0
                  ${
                    activeFilter === filter.name
                      ? "text-black bg-[#60d7e5]"
                      : "text-gray-400 hover:text-gray-200 hover:bg-[#1c1c1d3d]"
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

            <div className="flex-1"></div>

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

        {isLoading && (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
          </div>
        )}

        {error && (
          <div className="text-center py-20">
            <p className="text-red-400 text-lg">
              Failed to load posts. Please try again.
            </p>
          </div>
        )}

        {!isLoading && !error && data?.data && (
          <div className="space-y-2 sm:space-y-3 md:space-y-4 lg:space-y-6 pb-12 sm:pb-16 md:pb-20">
            {data.data.map((post, index) => (
              <div
                key={post.postId}
                onClick={() => router.push(`/post/${post.postId}`)}
                className="bg-[#0d1d2c] border border-[#343536] cursor-pointer rounded-md sm:rounded-lg hover:border-[#1dddf2] transition-all duration-300 overflow-hidden relative"
              >
                {/* Pinned Badge for Announcements */}
                {activeFilter === "announcements" && (
                  <div className="absolute top-0 right-0 bg-gradient-to-br from-[#1dddf2] to-[#7193ff] text-white px-3 py-1 rounded-bl-lg text-xs font-semibold flex items-center gap-1 shadow-lg z-10">
                    <Pin className="w-3 h-3" />
                    Pinned
                  </div>
                )}

                <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-50 sm:opacity-100">
                  <div className="w-1/3 h-full bg-gradient-to-r from-transparent via-white/5 to-transparent" />
                </div>

                <div className="flex">
                  <div className="flex-1 p-1.5 sm:p-2 md:p-3 lg:p-4 min-w-0">
                    <div className="flex items-center gap-1 sm:gap-1.5 md:gap-2 mb-1 sm:mb-1.5 md:mb-2 text-[10px] sm:text-xs md:text-sm text-gray-400 flex-wrap">
                      {activeFilter === "announcements" && (
                        <>
                          <span className="px-2 py-0.5 bg-[#1dddf2]/10 text-[#1dddf2] rounded font-semibold">
                            #{index + 1}
                          </span>
                          <span className="hidden xs:inline">•</span>
                        </>
                      )}
                      <span
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/profile/${post.userId}`);
                        }}
                        className="hover:underline cursor-pointer truncate max-w-[80px] sm:max-w-none"
                      >
                        u/{post.user?.name || "Unknown User"}
                      </span>
                      <span className="hidden xs:inline">•</span>
                      <span className="text-[9px] sm:text-[10px] md:text-xs">
                        {formatTimeAgo(post.createdAt)}
                      </span>
                    </div>

                    <div className="flex flex-col md:flex-row gap-2 sm:gap-3 md:gap-4">
                      <div className="flex-1 md:w-[60%] min-w-0">
                        <h2 className="text-white text-sm sm:text-base md:text-lg lg:text-xl font-bold tracking-tight mb-1.5 sm:mb-2 cursor-pointer hover:text-[#1dddf2] transition-colors duration-300 line-clamp-2 sm:line-clamp-3 md:line-clamp-none break-words">
                          {post.title}
                        </h2>

                        <p className="text-gray-400 text-[11px] sm:text-xs md:text-sm mb-1.5 sm:mb-2 md:mb-3 break-words">
                          {post.content && post.content.length > 150
                            ? `${post.content.substring(0, 250)}...`
                            : post.content}
                        </p>
                      </div>

                      {post.media && post.media.length > 0 && (
                        <div
                          className="w-full h-52 md:w-[45%] md:h-36 lg:h-40 xl:h-44 flex-shrink-0 rounded-md sm:rounded-lg overflow-hidden cursor-pointer"
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowCommentInput(
                              showCommentInput === `img-${post.postId}`
                                ? null
                                : `img-${post.postId}`
                            );
                          }}
                        >
                          <img
                            src={post.media[0]}
                            alt={post.title}
                            className="w-full h-full object-cover hover:opacity-90 transition-opacity"
                          />
                        </div>
                      )}
                    </div>

                    {post.tags && post.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 sm:gap-2 mt-2 mb-2">
                        {post.tags.slice(0, 3).map((tag, idx) => (
                          <span
                            key={idx}
                            className={`px-2 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs ${
                              activeFilter === "announcements"
                                ? "bg-gradient-to-r from-[#1dddf2]/10 to-[#7193ff]/10 text-[#1dddf2] border border-[#1dddf2]/20"
                                : "bg-[#1dddf2]/10 text-[#1dddf2]"
                            }`}
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}

                    {post.media &&
                      post.media.length > 0 &&
                      showCommentInput === `img-${post.postId}` && (
                        <div
                          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowCommentInput(null);
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

                    <div className="flex items-center gap-3 sm:gap-4 md:gap-5 mt-2 sm:mt-3 flex-wrap">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleVote(post.postId, "upvote");
                        }}
                        disabled={votingPosts[post.postId]}
                        className={`flex items-center gap-1.5 px-2 py-1 rounded-md transition-all duration-200 active:scale-95 ${
                          post.vote === 1
                            ? "bg-[#1dddf2] text-white shadow-lg shadow-[#1dddf2]/30"
                            : "text-gray-400 hover:text-[#1dddf2] hover:bg-[#272729]"
                        } ${
                          votingPosts[post.postId]
                            ? "opacity-70 cursor-wait"
                            : ""
                        }`}
                      >
                        <ArrowUp
                          className="w-4 h-4 sm:w-5 sm:h-5"
                          fill={post.vote === 1 ? "currentColor" : "none"}
                        />
                        {votingPosts[post.postId] ? (
                          <span className="text-xs sm:text-sm font-semibold flex items-center gap-1">
                            <span
                              className="inline-block w-1 h-1 bg-current rounded-full animate-bounce"
                              style={{ animationDelay: "0ms" }}
                            ></span>
                            <span
                              className="inline-block w-1 h-1 bg-current rounded-full animate-bounce"
                              style={{ animationDelay: "150ms" }}
                            ></span>
                            <span
                              className="inline-block w-1 h-1 bg-current rounded-full animate-bounce"
                              style={{ animationDelay: "300ms" }}
                            ></span>
                          </span>
                        ) : (
                          <span className="text-xs sm:text-sm font-semibold">
                            {formatVoteCount(post.upvotes)}
                          </span>
                        )}
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleVote(post.postId, "downvote");
                        }}
                        disabled={votingPosts[post.postId]}
                        className={`flex items-center gap-1.5 px-2 py-1 rounded-md transition-all duration-200 active:scale-95 ${
                          post.vote === -1
                            ? "bg-[#7193ff] text-white shadow-lg shadow-[#7193ff]/30"
                            : "text-gray-400 hover:text-[#7193ff] hover:bg-[#272729]"
                        } ${
                          votingPosts[post.postId]
                            ? "opacity-70 cursor-wait"
                            : ""
                        }`}
                      >
                        <ArrowDown
                          className="w-4 h-4 sm:w-5 sm:h-5"
                          fill={post.vote === -1 ? "currentColor" : "none"}
                        />
                        {votingPosts[post.postId] ? (
                          <span className="text-xs sm:text-sm font-semibold flex items-center gap-1">
                            <span
                              className="inline-block w-1 h-1 bg-current rounded-full animate-bounce"
                              style={{ animationDelay: "0ms" }}
                            ></span>
                            <span
                              className="inline-block w-1 h-1 bg-current rounded-full animate-bounce"
                              style={{ animationDelay: "150ms" }}
                            ></span>
                            <span
                              className="inline-block w-1 h-1 bg-current rounded-full animate-bounce"
                              style={{ animationDelay: "300ms" }}
                            ></span>
                          </span>
                        ) : (
                          <span className="text-xs sm:text-sm font-semibold">
                            {formatVoteCount(post.downvotes)}
                          </span>
                        )}
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowCommentInput(
                            showCommentInput === post.postId
                              ? null
                              : post.postId
                          );
                        }}
                        className="flex items-center gap-1.5 px-2 py-1 text-gray-400 hover:bg-[#272729] rounded-md transition-all duration-300 active:scale-95"
                      >
                        <MessageSquare className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5" />
                        <span className="text-[10px] sm:text-xs md:text-sm font-semibold">
                          {post.commentCount || post.commentIds?.length || 0}
                        </span>
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleShare(post.postId);
                        }}
                        className="flex items-center gap-1.5 px-2 py-1 text-gray-400 hover:bg-[#272729] rounded-md transition-all duration-300 active:scale-95"
                      >
                        {copiedPostId === post.postId ? (
                          <>
                            <Check className="w-4 h-4 sm:w-5 sm:h-5 text-green-400" />
                            <span className="text-xs sm:text-sm font-semibold text-green-400 hidden md:inline">
                              Copied!
                            </span>
                          </>
                        ) : (
                          <>
                            <Share2 className="w-4 h-4 sm:w-5 sm:h-5" />
                            <span className="text-xs sm:text-sm font-semibold hidden md:inline">
                              Share
                            </span>
                          </>
                        )}
                      </button>
                    </div>

                    {showCommentInput === post.postId && (
                      <div className="mt-2 sm:mt-3 relative">
                        <input
                          type="text"
                          onClick={(e) => e.stopPropagation()}
                          placeholder="Write a comment..."
                          className="w-full px-2 sm:px-3 py-1.5 sm:py-2 pr-10 rounded sm:rounded-md md:rounded-lg bg-[#1a1a1b] border border-gray-700 text-gray-200 placeholder:text-gray-500 focus:outline-none focus:ring-1 sm:focus:ring-2 focus:ring-blue-500 transition-all duration-300 text-xs sm:text-sm"
                          value={text}
                          onChange={(e) => setText(e.target.value)}
                          autoFocus
                        />

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSubmit(text, post.postId, null);
                          }}
                          disabled={!text.trim() || !user}
                          className={`absolute right-2 top-1/2 -translate-y-1/2 cursor-pointer p-1 rounded transition-all ${
                            text.trim() && user
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

        {!isLoading && !error && data?.data?.length === 0 && (
          <div className="text-center py-20">
            <p className="text-gray-400 text-lg">
              {activeFilter === "announcements"
                ? "No announcements available"
                : "No posts found"}
            </p>
          </div>
        )}

        {!isLoading && !error && data?.pagination && (
          <div className="flex justify-center gap-4 pb-8">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 py-2 bg-[#272729] text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#3a3a3c] transition-all"
            >
              Previous
            </button>
            <span className="px-4 py-2 text-white">
              Page {page} of {data.pagination.totalPages}
            </span>
            <button
              onClick={() => setPage((p) => p + 1)}
              disabled={page >= data.pagination.totalPages}
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

        @media (min-width: 475px) {
          .xs\\:inline {
            display: inline;
          }
        }
      `}</style>
    </div>
  );
}
