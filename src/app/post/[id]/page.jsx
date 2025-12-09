"use client";

import { useParams } from "next/navigation";
import { useRouter } from "next/navigation";
import {
  ArrowUp,
  ArrowDown,
  MessageSquare,
  Share2,
  Bookmark,
  Loader2,
} from "lucide-react";
import CommentsSection from "@/app/components/CommentSection";
import { usePost, useVotePost } from "@/lib/hooks/usePosts";
import { useAuth } from "@/lib/hooks/useAuth";

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

export default function PostPage() {
  const { id } = useParams();
  const router = useRouter();
  const { data: authData } = useAuth();
  const user = authData?.user || null;

  // Fetch post data
  const { data: postResponse, isLoading, error } = usePost(id);
  const post = postResponse?.data;

  // Vote mutation
  const { mutate: votePost } = useVotePost();

  const handleVote = (voteType) => {
    if (!user) {
      router.push('/login');
      return;
    }
    votePost({ postId: post.postId, voteType });
  };

  // Get user's current vote state (-1, 0, 1)
  // Backend returns 'vote' field after populateVoteData
  const userVote = post?.vote || 0;

  const handleCommentSubmit = async (text, parentId) => {
    if (!user) {
      router.push('/login');
      return;
    }
    console.log("Comment submitted:", text, "Parent ID:", parentId);
    // TODO: Add your comment API call here
  };

  const handleCommentVote = (commentId, voteType) => {
    if (!user) {
      router.push('/login');
      return;
    }
    console.log("Comment vote:", commentId, voteType);
    // TODO: Add your comment vote API call here
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    // You can add a toast notification here
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="bg-[#020d17] min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-[#ff4500] animate-spin" />
          <p className="text-gray-400 text-sm">Loading post...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="bg-[#020d17] min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-bold text-white mb-2">Error Loading Post</h2>
          <p className="text-gray-400 mb-4">{error.message || "Failed to load post"}</p>
          <button
            onClick={() => router.push('/')}
            className="px-4 py-2 bg-[#ff4500] hover:bg-[#ff5722] text-white rounded-lg transition-all"
          >
            Go Back Home
          </button>
        </div>
      </div>
    );
  }

  // Not found state
  if (!post) {
    return (
      <div className="bg-[#020d17] min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-bold text-white mb-2">Post Not Found</h2>
          <p className="text-gray-400 mb-4">The post you're looking for doesn't exist.</p>
          <button
            onClick={() => router.push('/')}
            className="px-4 py-2 bg-[#ff4500] hover:bg-[#ff5722] text-white rounded-lg transition-all"
          >
            Go Back Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#020d17] min-h-screen">
      <div className="max-w-5xl mx-auto p-4 md:p-6">
        {/* Post Card */}
        <div className="bg-[#0d1d2c] rounded-xl p-4 md:p-6 shadow-lg border border-[#1a2836]">
          {/* User Info Header */}
          <div className="flex items-center gap-3 mb-4">
            <img
              src={post.user?.avatarLink || '/default-avatar.png'}
              alt={post.user?.name || 'User'}
              className="w-10 h-10 rounded-full object-cover border-2 border-[#1a2836]"
              onError={(e) => {
                e.target.src = '/default-avatar.png';
              }}
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span
                  onClick={() => router.push(`/profile/${post.userId}`)}
                  className={`font-semibold hover:underline cursor-pointer transition-colors ${
                    post.user?.role === 'admin'
                      ? 'text-transparent bg-clip-text bg-gradient-to-r from-[#ff4500] via-[#ff6b35] to-[#ffa500]'
                      : 'text-white'
                  }`}
                >
                  {post.user?.name || post.user?.username || "Unknown User"}
                </span>
                {post.user?.role === 'admin' && (
                  <span className="px-2 py-0.5 bg-gradient-to-r from-[#ff4500] to-[#ff6b35] text-white text-xs font-bold rounded-md uppercase tracking-wide shadow-lg">
                    Admin
                  </span>
                )}
                <span className="text-gray-500">•</span>
                <span className="text-gray-400 text-sm">
                  {formatTimeAgo(post.createdAt)}
                </span>
              </div>
            </div>
          </div>

          {/* Title */}
          <h1 className="text-white text-xl md:text-2xl lg:text-3xl font-bold mb-4 leading-tight">
            {post.title}
          </h1>

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {post.tags.map((tag, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-[#1a2836] text-[#ff4500] text-sm font-medium rounded-full hover:bg-[#243647] transition-colors cursor-pointer"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* Content */}
          <p className="text-gray-300 text-base md:text-lg leading-relaxed mb-4 whitespace-pre-wrap">
            {post.content}
          </p>

          {/* Media - Moved to bottom */}
          {post.media && post.media.length > 0 && (
            <div className="relative mb-6 overflow-hidden rounded-xl">
              <div
                className="absolute inset-0 blur-3xl scale-110 opacity-20"
                style={{
                  backgroundImage: `url(${post.media[0]})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              />

              <a
                href={post.media[0]}
                target="_blank"
                rel="noopener noreferrer"
                className="relative z-10 block"
              >
                <img
                  src={post.media[0]}
                  alt={post.title}
                  className="max-w-full max-h-[600px] mx-auto rounded-lg object-contain"
                  loading="lazy"
                />
              </a>
            </div>
          )}

          {/* Action Bar - Moved to bottom */}
          <div className="flex items-center justify-between pt-4 border-t border-[#1a2836]">
            {/* Left side - Votes and Comments */}
            <div className="flex items-center gap-2">
              {/* Vote Section */}
              <div className="flex items-center gap-2">
                {/* Upvote */}
                <button
                  onClick={() => handleVote("upvote")}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-full transition-all duration-200 hover:scale-105 active:scale-95 ${
                    userVote === 1 
                      ? 'bg-[#ff4500] text-white' 
                      : 'bg-[#1a2836] text-gray-400 hover:bg-[#243647] hover:text-[#ff4500]'
                  }`}
                  title={userVote === 1 ? "Remove upvote" : "Upvote"}
                >
                  <ArrowUp className="w-4 h-4" fill={userVote === 1 ? "currentColor" : "none"} />
                  <span className="font-bold text-sm">
                    {formatVoteCount(post.upvotes || 0)}
                  </span>
                </button>

                {/* Downvote */}
                <button
                  onClick={() => handleVote("downvote")}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-full transition-all duration-200 hover:scale-105 active:scale-95 ${
                    userVote === -1 
                      ? 'bg-[#7193ff] text-white' 
                      : 'bg-[#1a2836] text-gray-400 hover:bg-[#243647] hover:text-[#7193ff]'
                  }`}
                  title={userVote === -1 ? "Remove downvote" : "Downvote"}
                >
                  <ArrowDown className="w-4 h-4" fill={userVote === -1 ? "currentColor" : "none"} />
                  <span className="font-bold text-sm">
                    {formatVoteCount(post.downvotes || 0)}
                  </span>
                </button>
              </div>

              {/* Comments */}
              <button className="flex items-center gap-2 px-3 py-2 text-gray-400 hover:bg-[#1a2836] rounded-full transition-all duration-200 active:scale-95 group">
                <MessageSquare className="w-5 h-5 group-hover:text-gray-300" />
                <span className="text-sm font-semibold group-hover:text-gray-300">
                  {post.commentCount || post.commentIds?.length || 0}
                </span>
              </button>
            </div>

            {/* Right side - Share and Save */}
            <div className="flex items-center gap-2">
              <button 
                onClick={handleShare}
                className="flex items-center gap-2 px-3 py-2 text-gray-400 hover:bg-[#1a2836] rounded-full transition-all duration-200 active:scale-95 group"
              >
                <Share2 className="w-5 h-5 group-hover:text-gray-300" />
                <span className="text-sm font-semibold hidden sm:inline group-hover:text-gray-300">
                  Share
                </span>
              </button>

              <button className="flex items-center gap-2 px-3 py-2 text-gray-400 hover:bg-[#1a2836] rounded-full transition-all duration-200 active:scale-95 group">
                <Bookmark className="w-5 h-5 group-hover:text-gray-300" />
                <span className="text-sm font-semibold hidden sm:inline group-hover:text-gray-300">
                  Save
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Comments Section */}
        <div className="mt-6">
          <CommentsSection
            comments={post.comments || []}
            onCommentSubmit={handleCommentSubmit}
            onVote={handleCommentVote}
            router={router}
          />
        </div>
      </div>
    </div>
  );
}