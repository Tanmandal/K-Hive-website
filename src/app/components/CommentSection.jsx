"use client";

import { useState } from "react";
import {
  ArrowUp,
  ArrowDown,
  PlusCircle,
  MinusCircle,
  Reply,
} from "lucide-react";

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

function buildTree(flat = []) {
  const map = new Map();
  flat.forEach((c) => map.set(c.id, { ...c, children: [] }));
  const roots = [];
  for (const c of map.values()) {
    if (c.parentId == null) roots.push(c);
    else {
      const parent = map.get(c.parentId);
      if (parent) parent.children.push(c);
      else roots.push(c);
    }
  }
  const sortRec = (arr) => {
    arr.sort((a, b) => (b.votes || 0) - (a.votes || 0));
    arr.forEach((x) => sortRec(x.children));
  };
  sortRec(roots);
  return roots;
}

function InlineReply({ parentId = null, onCancel, onSubmit }) {
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleCancel = () => {
    setText("");
    onCancel?.();
  };

  const handleSubmit = async () => {
    if (!text.trim()) return;
    setSubmitting(true);
    await onSubmit?.(text, parentId);
    setText("");
    setSubmitting(false);
    onCancel?.();
  };

  return (
    <div className="flex flex-col gap-2 p-3">
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={3}
        className="w-full bg-[#020d17] border border-[#1a2836] rounded-lg p-3 text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:border-[#ff4500] focus:ring-1 focus:ring-[#ff4500] transition-all resize-none"
        placeholder="What are your thoughts?"
      />

      <div className="flex gap-2">
        <button
          onClick={handleSubmit}
          className="px-4 py-1.5 rounded-full bg-[#ff4500] hover:bg-[#ff5722] text-white text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 active:scale-95"
          disabled={submitting || !text.trim()}
        >
          {submitting ? "Posting..." : "Comment"}
        </button>

        <button
          className="px-4 py-1.5 rounded-full border border-[#1a2836] hover:border-[#2a3846] text-gray-400 hover:text-gray-300 text-sm font-semibold transition-all duration-200 active:scale-95"
          onClick={handleCancel}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

function Comment({ comment, onToggleCollapse, depth = 0, onVote, onReply, router }) {
  const [collapsed, setCollapsed] = useState(false);
  const [showReply, setShowReply] = useState(false);
  const [userVote, setUserVote] = useState(null);

  const handleVote = (voteType) => {
    const newVote = userVote === voteType ? null : voteType;
    setUserVote(newVote);
    onVote?.(comment.id, newVote);
  };

  const handleReply = (text) => {
    onReply?.(text, comment.id);
    setShowReply(false);
  };

  return (
    <div className={`relative ${depth > 0 ? "ml-6 md:ml-8" : ""}`}>
      {depth > 0 && (
        <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-gradient-to-b from-[#1a2836] to-transparent" />
      )}
      
      <div className={`flex gap-2 md:gap-3 ${depth > 0 ? "ml-4" : ""}`}>
        {/* Vote buttons */}
        <div className="flex flex-col items-center gap-1 pt-1">
          <button
            onClick={() => handleVote("upvote")}
            className={`p-1 rounded transition-all duration-200 hover:scale-110 active:scale-95 ${
              userVote === "upvote"
                ? "text-[#ff4500]"
                : "text-gray-500 hover:text-[#ff4500]"
            }`}
          >
            <ArrowUp className="w-4 h-4" />
          </button>
          
          <span
            className={`text-xs font-bold ${
              userVote === "upvote"
                ? "text-[#ff4500]"
                : userVote === "downvote"
                ? "text-[#7193ff]"
                : "text-gray-400"
            }`}
          >
            {comment.votes || 0}
          </span>
          
          <button
            onClick={() => handleVote("downvote")}
            className={`p-1 rounded transition-all duration-200 hover:scale-110 active:scale-95 ${
              userVote === "downvote"
                ? "text-[#7193ff]"
                : "text-gray-500 hover:text-[#7193ff]"
            }`}
          >
            <ArrowDown className="w-4 h-4" />
          </button>
        </div>

        {/* Comment content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5">
            <span
              onClick={() => router.push(`/profile/${comment.userId}`)}
              className="text-sm font-semibold text-gray-300 hover:text-[#ff4500] cursor-pointer transition-colors"
            >
              {comment.user?.name}
            </span>
            <span className="text-xs text-gray-500">
              {formatTimeAgo(comment.createdAt)}
            </span>
          </div>

          <div
            className={`text-sm text-gray-300 leading-relaxed mb-2 ${
              collapsed ? "line-clamp-2" : ""
            }`}
          >
            {comment.text}
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-3 text-xs text-gray-500">
            <button
              onClick={() => {
                setCollapsed((c) => !c);
                onToggleCollapse?.(comment.id, !collapsed);
              }}
              className="flex items-center gap-1 hover:text-gray-300 transition-colors"
            >
              {collapsed ? (
                <>
                  <PlusCircle size={14} />
                  <span>Expand</span>
                </>
              ) : (
                <>
                  <MinusCircle size={14} />
                  <span>Collapse</span>
                </>
              )}
            </button>

            <button
              className="flex items-center gap-1 hover:text-gray-300 transition-colors"
              onClick={() => setShowReply((prev) => !prev)}
            >
              <Reply size={14} />
              <span>Reply</span>
            </button>
          </div>

          {/* Reply form */}
          {showReply && (
            <div className="mt-3">
              <InlineReply
                parentId={comment.id}
                onCancel={() => setShowReply(false)}
                onSubmit={handleReply}
              />
            </div>
          )}

          {/* Nested comments */}
          {comment.children?.length > 0 && !collapsed && (
            <div className="mt-3 space-y-3">
              {comment.children.map((c) => (
                <Comment
                  key={c.id}
                  comment={c}
                  onToggleCollapse={onToggleCollapse}
                  depth={depth + 1}
                  onVote={onVote}
                  onReply={onReply}
                  router={router}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function CommentsSection({ comments = [], onCommentSubmit, onVote, router }) {
  const [collapsedComments, setCollapsedComments] = useState(new Set());

  const handleToggleCollapse = (id) => {
    setCollapsedComments((prev) => {
      const updated = new Set(prev);
      updated.has(id) ? updated.delete(id) : updated.add(id);
      return updated;
    });
  };

  const tree = buildTree(comments);
  const sortedTree = [...tree].sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  );

  return (
    <div className="bg-[#0d1d2c] rounded-xl p-4 border border-[#1a2836]">
      {/* Header */}
      <h3 className="text-lg font-semibold mb-4 text-gray-200">
        Comments ({comments.length})
      </h3>

      {/* Comment input */}
      <div className="mb-6">
        <InlineReply parentId={null} onSubmit={onCommentSubmit} />
      </div>

      {/* Comments list */}
      <div className="space-y-4 pt-4 border-t border-[#1a2836]">
        {sortedTree.map((c) => (
          <Comment
            key={c.id}
            comment={c}
            onToggleCollapse={handleToggleCollapse}
            onVote={onVote}
            onReply={onCommentSubmit}
            router={router}
          />
        ))}
        {sortedTree.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-sm">
              No comments yet. Be the first to share your thoughts!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}