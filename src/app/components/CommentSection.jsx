"use client";

import { useState } from "react";
import {
  Reply,
  RefreshCw,
  Loader2,
  ChevronDown,
  ChevronUp,
  Edit2,
  Trash2,
  X,
  Check,
} from "lucide-react";
import { useComments, useReplies, useCreateComment, useUpdateComment, useDeleteComment } from "@/lib/hooks/useComments";
import toast from "react-hot-toast";

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

function InlineReply({ parentId = null, onCancel, onSubmit, postId }) {
  const [text, setText] = useState("");
  const { mutate: createComment, isPending } = useCreateComment();

  const handleSubmit = async () => {
    if (!text.trim()) return;
    
    createComment(
      {
        postId,
        content: text.trim(),
        parentCommentId: parentId,
      },
      {
        onSuccess: () => {
          setText("");
          onSubmit?.();
          toast.success(parentId ? "Reply posted!" : "Comment posted!", {
            duration: 2000,
            position: "top-center",
            icon: "💬",
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
            position: "top-center",
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

  return (
    <div className="flex flex-col gap-2 p-3">
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={3}
        className="w-full bg-[#020d17] border border-[#1a2836] rounded-lg p-3 text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:border-[#1dddf2] focus:ring-1 focus:ring-[#1dddf2] transition-all resize-none"
        placeholder={parentId ? "Write your reply..." : "What are your thoughts?"}
        maxLength={1000}
      />

      <div className="flex gap-2 items-center">
        <button
          onClick={handleSubmit}
          className="px-4 py-1.5 rounded-full bg-[#1dddf2] hover:bg-[#1dddf2b7] text-white text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 active:scale-95"
          disabled={isPending || !text.trim()}
        >
          {isPending ? "Posting..." : parentId ? "Reply" : "Comment"}
        </button>

        <span className="text-xs text-gray-500 ml-auto">
          {text.length}/1000
        </span>
      </div>
    </div>
  );
}

function EditCommentForm({ comment, onCancel, onSuccess }) {
  const [text, setText] = useState(comment.content);
  const { mutate: updateComment, isPending } = useUpdateComment();

  const handleSubmit = () => {
    if (!text.trim()) return;
    
    updateComment(
      {
        commentId: comment.commentId,
        content: text.trim(),
      },
      {
        onSuccess: () => {
          onSuccess?.();
          toast.success("Comment updated!", {
            duration: 2000,
            position: "top-center",
            icon: "✏️",
            style: {
              background: "#1a2836",
              color: "#fff",
              border: "1px solid #1dddf2",
            },
          });
        },
        onError: (error) => {
          console.error("Failed to update comment:", error);
          toast.error(error.response?.data?.message || "Failed to update comment", {
            duration: 3000,
            position: "top-center",
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

  return (
    <div className="flex flex-col gap-2 mt-2">
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={3}
        className="w-full bg-[#020d17] border border-[#1a2836] rounded-lg p-3 text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:border-[#1dddf2] focus:ring-1 focus:ring-[#1dddf2] transition-all resize-none"
        maxLength={1000}
        autoFocus
      />

      <div className="flex gap-2 items-center">
        <button
          onClick={handleSubmit}
          className="px-4 py-1.5 rounded-full bg-[#1dddf2] hover:bg-[#1dddf2b9] text-white text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 active:scale-95 flex items-center gap-1"
          disabled={isPending || !text.trim()}
        >
          <Check className="w-4 h-4" />
          {isPending ? "Saving..." : "Save"}
        </button>

        <button
          className="px-4 py-1.5 rounded-full border border-[#1a2836] hover:border-[#2a3846] text-gray-400 hover:text-gray-300 text-sm font-semibold transition-all duration-200 active:scale-95 flex items-center gap-1"
          onClick={onCancel}
          disabled={isPending}
        >
          <X className="w-4 h-4" />
          Cancel
        </button>

        <span className="text-xs text-gray-500 ml-auto">
          {text.length}/1000
        </span>
      </div>
    </div>
  );
}

function RepliesList({ commentId, postId, router, user }) {
  const [page, setPage] = useState(1);
  const [editingReplyId, setEditingReplyId] = useState(null);
  const { data: repliesData, isLoading } = useReplies(commentId, { page, limit: 10 });
  const { mutate: deleteComment } = useDeleteComment();

  const replies = repliesData?.data || [];
  const pagination = repliesData?.pagination;

  const handleDelete = (replyId) => {
    if (!confirm("Are you sure you want to delete this reply?")) return;
    
    deleteComment(replyId, {
      onSuccess: () => {
        toast.success("Reply deleted", {
          duration: 2000,
          position: "top-center",
          icon: "🗑️",
          style: {
            background: "#1a2836",
            color: "#fff",
            border: "1px solid #1dddf2",
          },
        });
      },
      onError: (error) => {
        console.error("Failed to delete reply:", error);
        toast.error(error.response?.data?.message || "Failed to delete reply", {
          duration: 3000,
          position: "top-center",
          style: {
            background: "#1a2836",
            color: "#fff",
            border: "1px solid #ff4500",
          },
        });
      },
    });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-4">
        <Loader2 className="w-5 h-5 text-[#1dddf2] animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-3 ml-6 md:ml-8 mt-3">
      {replies.map((reply) => (
        <div key={reply.commentId} className="flex gap-2 md:gap-3">
          {/* User Avatar */}
          <img
            src={reply.user?.avatarLink || '/default-avatar.png'}
            alt={reply.user?.name || 'User'}
            referrerPolicy="no-referrer"
            className="w-8 h-8 rounded-full object-cover border-2 border-[#1a2836] flex-shrink-0"
          />

          {/* Reply content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <span
                onClick={() => router.push(`/profile/${reply.userId}`)}
                className={`text-sm font-semibold hover:underline cursor-pointer transition-colors ${
                  reply.user?.role === 'admin'
                    ? 'text-transparent bg-clip-text bg-gradient-to-r from-[#ff4500] via-[#ff6b35] to-[#ffa500]'
                    : 'text-gray-300'
                }`}
              >
                {reply.user?.name || "Unknown User"}
              </span>
              
              {reply.user?.role === 'admin' && (
                <span className="px-2 py-0.5 bg-gradient-to-r from-[#ff4500] to-[#ff6b35] text-white text-xs font-bold rounded-md uppercase tracking-wide shadow-lg">
                  Admin
                </span>
              )}
              
              <span className="text-xs text-gray-500">
                {formatTimeAgo(reply.createdAt)}
              </span>
              
              {reply.isEdited && (
                <span className="text-xs text-gray-500 italic">(edited)</span>
              )}
            </div>

            {editingReplyId === reply.commentId ? (
              <EditCommentForm
                comment={reply}
                onCancel={() => setEditingReplyId(null)}
                onSuccess={() => setEditingReplyId(null)}
              />
            ) : (
              <>
                <div className="text-sm text-gray-300 leading-relaxed mb-2">
                  {reply.content}
                </div>

                {/* Action buttons - only show if user owns the reply */}
                {user && user.userId === reply.userId && (
                  <div className="flex items-center gap-3 text-xs text-gray-500">
                    <button
                      className="flex items-center gap-1 hover:text-[#1dddf2] transition-colors"
                      onClick={() => setEditingReplyId(reply.commentId)}
                    >
                      <Edit2 size={14} />
                      <span>Edit</span>
                    </button>

                    <button
                      className="flex items-center gap-1 hover:text-blue-500 transition-colors"
                      onClick={() => handleDelete(reply.commentId)}
                    >
                      <Trash2 size={14} />
                      <span>Delete</span>
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      ))}

      {/* Load more replies */}
      {pagination && pagination.page < pagination.totalPages && (
        <button
          onClick={() => setPage(p => p + 1)}
          className="text-sm text-[#ff4500] hover:text-[#ff5722] font-semibold transition-colors"
        >
          Load more replies ({pagination.total - replies.length} remaining)
        </button>
      )}
    </div>
  );
}

function Comment({ comment, postId, router, user }) {
  const [showReply, setShowReply] = useState(false);
  const [showReplies, setShowReplies] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const { mutate: deleteComment } = useDeleteComment();

  const handleReplySubmit = () => {
    setShowReply(false);
    setShowReplies(true);
  };

  const handleDelete = () => {
    if (!confirm("Are you sure you want to delete this comment?")) return;
    
    deleteComment(comment.commentId, {
      onSuccess: () => {
        toast.success("Comment deleted", {
          duration: 2000,
          position: "top-center",
          icon: "🗑️",
          style: {
            background: "#1a2836",
            color: "#fff",
            border: "1px solid #1dddf2",
          },
        });
      },
      onError: (error) => {
        console.error("Failed to delete comment:", error);
        toast.error(error.response?.data?.message || "Failed to delete comment", {
          duration: 3000,
          position: "top-center",
          style: {
            background: "#1a2836",
            color: "#fff",
            border: "1px solid #ff4500",
          },
        });
      },
    });
  };

  return (
    <div className="relative">
      <div className="flex gap-2 md:gap-3">
        {/* User Avatar */}
        <img
          src={comment.user?.avatarLink || '/default-avatar.png'}
          alt={comment.user?.name || 'User'}
          referrerPolicy="no-referrer"
          className="w-10 h-10 rounded-full object-cover border-2 border-[#1a2836] flex-shrink-0"
        />

        {/* Comment content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <span
              onClick={() => router.push(`/profile/${comment.userId}`)}
              className={`text-sm font-semibold hover:underline cursor-pointer transition-colors ${
                comment.user?.role === 'admin'
                  ? 'text-transparent bg-clip-text bg-gradient-to-r from-[#ff4500] via-[#ff6b35] to-[#ffa500]'
                  : 'text-gray-300'
              }`}
            >
              {comment.user?.name || "Unknown User"}
            </span>
            
            {comment.user?.role === 'admin' && (
              <span className="px-2 py-0.5 bg-gradient-to-r from-[#ff4500] to-[#ff6b35] text-white text-xs font-bold rounded-md uppercase tracking-wide shadow-lg">
                Admin
              </span>
            )}
            
            <span className="text-xs text-gray-500">
              {formatTimeAgo(comment.createdAt)}
            </span>
            
            {comment.isEdited && (
              <span className="text-xs text-gray-500 italic">(edited)</span>
            )}
          </div>

          {isEditing ? (
            <EditCommentForm
              comment={comment}
              onCancel={() => setIsEditing(false)}
              onSuccess={() => setIsEditing(false)}
            />
          ) : (
            <>
              <div className="text-sm text-gray-300 leading-relaxed mb-2">
                {comment.content}
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-3 text-xs text-gray-500">
                <button
                  className="flex items-center gap-1 hover:text-gray-300 transition-colors"
                  onClick={() => setShowReply((prev) => !prev)}
                >
                  <Reply size={14} />
                  <span>Reply</span>
                </button>

                {/* View replies button */}
                <button
                  className="flex items-center gap-1 hover:text-gray-300 transition-colors"
                  onClick={() => setShowReplies((prev) => !prev)}
                >
                  {showReplies ? (
                    <>
                      <ChevronUp size={14} />
                      <span>Hide replies</span>
                    </>
                  ) : (
                    <>
                      <ChevronDown size={14} />
                      <span>View replies</span>
                    </>
                  )}
                </button>

                {/* Edit and Delete - only show if user owns the comment */}
                {user && user.userId === comment.userId && (
                  <>
                    <button
                      className="flex items-center gap-1 hover:text-[#1dddf2] transition-colors"
                      onClick={() => setIsEditing(true)}
                    >
                      <Edit2 size={14} />
                      <span>Edit</span>
                    </button>

                    <button
                      className="flex items-center gap-1 hover:text-blue-500 transition-colors"
                      onClick={handleDelete}
                    >
                      <Trash2 size={14} />
                      <span>Delete</span>
                    </button>
                  </>
                )}
              </div>
            </>
          )}

          {/* Reply form */}
          {showReply && !isEditing && (
            <div className="mt-3">
              <InlineReply
                parentId={comment.commentId}
                postId={postId}
                onCancel={() => setShowReply(false)}
                onSubmit={handleReplySubmit}
              />
            </div>
          )}

          {/* Replies list */}
          {showReplies && !isEditing && (
            <RepliesList 
              commentId={comment.commentId} 
              postId={postId} 
              router={router}
              user={user}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default function CommentsSection({ postId, router, user }) {
  const [page, setPage] = useState(1);
  const { data: commentsData, isLoading, refetch, isFetching } = useComments(postId, { page, limit: 20 });

  const comments = commentsData?.data || [];
  const pagination = commentsData?.pagination;

  const handleRefresh = () => {
    refetch();
  };

  return (
    <div className="bg-[#0d1d2c] rounded-sm p-4 border border-[#1a2836]">
      {/* Header with refresh button */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-200">
          Comments 
        </h3>
        
        <button
          onClick={handleRefresh}
          disabled={isFetching}
          className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-400 hover:text-gray-300 hover:bg-[#1a2836] rounded-lg transition-all duration-200 active:scale-95 disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${isFetching ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Comment input - only for top-level comments */}
      <div className="mb-6">
        <InlineReply 
          postId={postId} 
          parentId={null}
        />
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="flex justify-center py-12">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-6 h-6 text-[#1dddf2] animate-spin" />
            <p className="text-gray-400 text-sm">Loading comments...</p>
          </div>
        </div>
      )}

      {/* Comments list */}
      {!isLoading && (
        <div className="space-y-4 pt-4 border-t border-[#1a2836]">
          {comments.map((comment) => (
            <Comment
              key={comment.commentId}
              comment={comment}
              postId={postId}
              router={router}
              user={user}
            />
          ))}

          {comments.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 text-sm">
                No comments yet. Be the first to share your thoughts!
              </p>
            </div>
          )}

          {/* Load more comments */}
          {pagination && pagination.page < pagination.totalPages && (
            <div className="flex justify-center pt-4">
              <button
                onClick={() => setPage(p => p + 1)}
                className="px-6 py-2 bg-[#1a2836] hover:bg-[#243647] text-gray-300 rounded-lg font-semibold transition-all duration-200 active:scale-95"
              >
                Load more comments ({pagination.total - comments.length} remaining)
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}