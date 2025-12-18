"use client";
import React, { useState, useEffect } from "react";
import {
  X,
  Tag,
  Loader2,
  Heart,
  MessageCircle,
} from "lucide-react";
import toast from "react-hot-toast";

export default function EditPostModal({ 
  isOpen, 
  post, 
  onClose, 
  onSubmit, 
  isSubmitting 
}) {
  const [postEditData, setPostEditData] = useState({
    title: "",
    content: "",
    tags: [],
  });
  const [tagInput, setTagInput] = useState("");
  const [charCount, setCharCount] = useState(0);

  // Initialize form data when post changes
  useEffect(() => {
    if (post && isOpen) {
      setPostEditData({
        title: post.title || "",
        content: post.content || "",
        tags: post.tags || [],
      });
      setCharCount(post.content?.length || 0);
      setTagInput("");
    }
  }, [post, isOpen]);

  if (!isOpen || !post) return null;

  // Handle post edit form changes
  const handlePostEditChange = (e) => {
    const { name, value } = e.target;
    
    if (name === "content") {
      setCharCount(value.length);
    }
    
    setPostEditData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle tag addition
  const handleAddTag = (e) => {
    e.preventDefault();
    const trimmedTag = tagInput.trim();

    if (!trimmedTag) return;

    if (trimmedTag.length < 2 || trimmedTag.length > 20) {
      toast.error("Tag must be between 2 and 20 characters", {
        duration: 3000,
        style: {
          background: "#1a2836",
          color: "#fff",
          border: "1px solid #ff4500",
        },
      });
      return;
    }

    if (postEditData.tags.length >= 5) {
      toast.error("Maximum 5 tags allowed", {
        duration: 3000,
        style: {
          background: "#1a2836",
          color: "#fff",
          border: "1px solid #ff4500",
        },
      });
      return;
    }

    if (postEditData.tags.includes(trimmedTag)) {
      toast.error("Tag already exists", {
        duration: 2000,
        style: {
          background: "#1a2836",
          color: "#fff",
          border: "1px solid #ff4500",
        },
      });
      return;
    }

    setPostEditData((prev) => ({
      ...prev,
      tags: [...prev.tags, trimmedTag],
    }));
    setTagInput("");
  };

  // Handle tag removal
  const handleRemoveTag = (tagToRemove) => {
    setPostEditData((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }));
  };

  // Handle post update
  const handleUpdatePost = async (e) => {
    e.preventDefault();

    // Validation
    if (!postEditData.title.trim()) {
      toast.error("Title is required", {
        duration: 3000,
        style: {
          background: "#1a2836",
          color: "#fff",
          border: "1px solid #ff4500",
        },
      });
      return;
    }

    if (postEditData.title.trim().length < 5 || postEditData.title.trim().length > 200) {
      toast.error("Title must be between 5 and 200 characters", {
        duration: 3000,
        style: {
          background: "#1a2836",
          color: "#fff",
          border: "1px solid #ff4500",
        },
      });
      return;
    }

    if (!postEditData.content.trim()) {
      toast.error("Content is required", {
        duration: 3000,
        style: {
          background: "#1a2836",
          color: "#fff",
          border: "1px solid #ff4500",
        },
      });
      return;
    }

    if (postEditData.content.trim().length < 10) {
      toast.error("Content must be at least 10 characters", {
        duration: 3000,
        style: {
          background: "#1a2836",
          color: "#fff",
          border: "1px solid #ff4500",
        },
      });
      return;
    }

    // Call the onSubmit handler passed from parent
    await onSubmit({
      postId: post.postId,
      title: postEditData.title.trim(),
      content: postEditData.content.trim(),
      tags: postEditData.tags,
    });
  };

  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-[#0d1d2c] border-2 border-[#00d9ff] rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#343536]">
          <h2 className="text-2xl font-bold text-white">Edit Post</h2>
          <button
            onClick={handleClose}
            disabled={isSubmitting}
            className="p-2 text-gray-400 hover:text-white hover:bg-[#323234] rounded-full transition-all disabled:opacity-50"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-140px)] p-6">
          <div className="space-y-4">
            {/* Title Input */}
            <div>
              <input
                type="text"
                name="title"
                value={postEditData.title}
                onChange={handlePostEditChange}
                placeholder="Title"
                className="w-full bg-[#e2e2f8c4] text-gray-800 placeholder-gray-800 px-4 py-3 rounded-lg outline-none focus:ring-2 focus:ring-[#00d9ff] transition-all disabled:opacity-50"
                disabled={isSubmitting}
              />
            </div>

            {/* Content Textarea */}
            <div className="relative">
              <textarea
                name="content"
                value={postEditData.content}
                onChange={handlePostEditChange}
                placeholder="What's on your mind?"
                rows={6}
                maxLength={5000}
                className="w-full bg-[#e2e2f8c4] text-gray-800 placeholder-gray-800 px-4 py-3 rounded-lg outline-none focus:ring-2 focus:ring-[#00d9ff] transition-all resize-none disabled:opacity-50"
                disabled={isSubmitting}
              />
              <div className="absolute bottom-3 right-3 text-xs text-gray-500">
                {charCount}/5000
              </div>
            </div>

            {/* Tags Display */}
            {postEditData.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {postEditData.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#00d9ff]/20 text-[#00d9ff] rounded-full text-sm border border-[#00d9ff]/30"
                  >
                    #{tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      disabled={isSubmitting}
                      className="hover:text-white transition-all disabled:opacity-50"
                    >
                      <X size={14} />
                    </button>
                  </span>
                ))}
              </div>
            )}

            {/* Tags Input */}
            <div className="flex gap-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleAddTag(e)}
                placeholder="Add tags (2-20 chars, max 5)..."
                className="flex-1 bg-[#e2e2f8c4] text-gray-800 placeholder-gray-600 px-4 py-2.5 rounded-lg outline-none focus:ring-2 focus:ring-[#00d9ff] transition-all disabled:opacity-50 text-sm"
                disabled={isSubmitting}
                maxLength={20}
              />
              <button
                type="button"
                onClick={handleAddTag}
                disabled={isSubmitting || postEditData.tags.length >= 5}
                className="px-4 py-2.5 bg-[#00d9ff] text-white rounded-lg hover:bg-[#00d9ffb6] transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                title={postEditData.tags.length >= 5 ? "Maximum 5 tags allowed" : "Add tag"}
              >
                <Tag size={18} />
              </button>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#343536]">
              <button
                type="button"
                onClick={handleClose}
                disabled={isSubmitting}
                className="px-6 py-2.5 bg-[#272729] text-white rounded-full font-semibold hover:bg-[#3a3a3c] transition-all disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleUpdatePost}
                disabled={isSubmitting}
                className="px-8 py-2.5 bg-[#00d9ff] text-[#1a1a1b] rounded-full font-semibold hover:bg-[#00b8d4] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="animate-spin" size={18} />
                    Updating...
                  </>
                ) : (
                  "Update Post"
                )}
              </button>
            </div>
          </div>

          {/* Preview Section */}
          {(postEditData.title || postEditData.content) && (
            <div className="mt-6 pt-6 border-t border-[#343536]">
              <h3 className="text-sm font-semibold text-gray-400 mb-3">Preview</h3>
              <div className="bg-[#272729] rounded-xl p-4 border border-[#343536]">
                {/* Preview Header */}
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-[#00ff1187] flex items-center justify-center">
                    <span className="text-white font-semibold">U</span>
                  </div>
                  <div>
                    <p className="text-white font-semibold text-sm">You</p>
                    <p className="text-gray-500 text-xs">Just now • edited</p>
                  </div>
                </div>

                {/* Preview Content */}
                {postEditData.title && (
                  <h4 className="text-white font-bold text-lg mb-2">{postEditData.title}</h4>
                )}
                {postEditData.content && (
                  <p className="text-gray-300 text-sm mb-3 whitespace-pre-wrap">{postEditData.content}</p>
                )}

                {/* Preview Tags */}
                {postEditData.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-3">
                    {postEditData.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="text-xs px-2 py-1 bg-[#00d9ff]/20 text-[#00d9ff] rounded-full border border-[#00d9ff]/30"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* Preview Actions */}
                <div className="flex items-center gap-4 pt-3 border-t border-[#343536]">
                  <div className="flex items-center gap-2 text-gray-400">
                    <Heart className="w-5 h-5" />
                    <span className="text-sm">{post.upvotes || 0}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-400">
                    <MessageCircle className="w-5 h-5" />
                    <span className="text-sm">{post.commentIds?.length || 0}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}