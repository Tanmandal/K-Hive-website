"use client";
import { useState } from "react";
import { X, Image as ImageIcon, Tag, Heart, MessageCircle, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

export default function CreatePostModal({ isOpen, onClose, onSubmit, isSubmitting }) {
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    tags: [],
  });
  const [tagInput, setTagInput] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [charCount, setCharCount] = useState(0);

  if (!isOpen) return null;

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === "content") {
      setCharCount(value.length);
    }
    
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle tag addition
  const handleAddTag = (e) => {
    e.preventDefault();
    const trimmedTag = tagInput.trim();

    if (trimmedTag && !formData.tags.includes(trimmedTag)) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, trimmedTag],
      }));
      setTagInput("");
    }
  };

  // Handle tag removal
  const handleRemoveTag = (tagToRemove) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }));
  };

  // Compress image before upload
  const compressImage = (file, maxWidth = 1200, quality = 0.8) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);

      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target.result;

        img.onload = () => {
          const canvas = document.createElement("canvas");
          let width = img.width;
          let height = img.height;

          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }

          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext("2d");
          ctx.drawImage(img, 0, 0, width, height);

          canvas.toBlob(
            (blob) => {
              if (blob) {
                const compressedFile = new File([blob], file.name, {
                  type: "image/jpeg",
                  lastModified: Date.now(),
                });
                resolve(compressedFile);
              } else {
                reject(new Error("Failed to compress image"));
              }
            },
            "image/jpeg",
            quality
          );
        };

        img.onerror = () => reject(new Error("Failed to load image"));
      };

      reader.onerror = () => reject(new Error("Failed to read file"));
    });
  };

  // Handle image selection
  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        toast.error("Please select a valid image file", {
          duration: 3000,
          style: {
            background: "#1a2836",
            color: "#fff",
            border: "1px solid #ff4500",
          },
        });
        return;
      }

      if (file.size > 10 * 1024 * 1024) {
        toast.error("Image size should be less than 10MB", {
          duration: 3000,
          style: {
            background: "#1a2836",
            color: "#fff",
            border: "1px solid #ff4500",
          },
        });
        return;
      }

      try {
        const compressedFile = await compressImage(file);
        setImageFile(compressedFile);

        const reader = new FileReader();
        reader.onloadend = () => {
          setImagePreview(reader.result);
        };
        reader.readAsDataURL(compressedFile);
        toast.success("Image added successfully", {
          duration: 2000,
          style: {
            background: "#1a2836",
            color: "#fff",
            border: "1px solid #1dddf2",
          },
        });
      } catch (err) {
        console.error("Error compressing image:", err);
        toast.error("Failed to process image", {
          duration: 3000,
          style: {
            background: "#1a2836",
            color: "#fff",
            border: "1px solid #ff4500",
          },
        });
      }
    }
  };

  // Remove selected image
  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title.trim()) {
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

    if (formData.title.trim().length < 5 || formData.title.trim().length > 200) {
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

    if (!formData.content.trim()) {
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

    if (formData.content.trim().length < 10) {
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

    try {
      await onSubmit({
        ...formData,
        imageFile,
      });

      // Reset form on success
      setFormData({ title: "", content: "", tags: [] });
      setImageFile(null);
      setImagePreview(null);
      setTagInput("");
      setCharCount(0);
      onClose();
    } catch (err) {
      toast.error(err.message || "Failed to create post", {
        duration: 3000,
        style: {
          background: "#1a2836",
          color: "#fff",
          border: "1px solid #ff4500",
        },
      });
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setFormData({ title: "", content: "", tags: [] });
      setImageFile(null);
      setImagePreview(null);
      setTagInput("");
      setCharCount(0);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-[#0d1d2c] border-2 border-[#00d9ff] rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#343536]">
          <h2 className="text-2xl font-bold text-white">Create Post</h2>
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
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Title Input */}
            <div>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Title"
                className="w-full bg-[#e2e2f8c4] text-gray-800 placeholder-gray-800 px-4 py-3 rounded-lg outline-none focus:ring-2 focus:ring-[#00d9ff] transition-all disabled:opacity-50"
                disabled={isSubmitting}
              />
            </div>

            {/* Content Textarea */}
            <div className="relative">
              <textarea
                name="content"
                value={formData.content}
                onChange={handleChange}
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

            {/* Image Preview */}
            {imagePreview && (
              <div className="relative rounded-lg overflow-hidden">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-full h-64 object-cover rounded-lg"
                />
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  disabled={isSubmitting}
                  className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-all disabled:opacity-50"
                >
                  <X size={18} />
                </button>
              </div>
            )}

            {/* Tags Display */}
            {formData.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.tags.map((tag, index) => (
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
                placeholder="Add tags..."
                className="flex-1 bg-[#e2e2f8c4] text-gray-800 placeholder-gray-800 px-4 py-2.5 rounded-lg outline-none focus:ring-2 focus:ring-[#00d9ff] transition-all disabled:opacity-50"
                disabled={isSubmitting}
              />
              <button
                type="button"
                onClick={handleAddTag}
                disabled={isSubmitting}
                className="px-4 py-2.5 bg-[#00d9ff] text-white rounded-lg hover:bg-[#00d9ffb6] transition-all flex items-center gap-2 disabled:opacity-50"
              >
                <Tag size={18} />
              </button>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-4 border-t border-[#343536]">
              {/* Left side - Media buttons */}
              <div className="flex items-center gap-2">
                <label className="p-2.5 text-gray-400 hover:text-[#00d9ff] hover:bg-[#323234] rounded-lg transition-all cursor-pointer">
                  <ImageIcon className="w-5 h-5" />
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleImageChange}
                    disabled={isSubmitting}
                  />
                </label>
              </div>

              {/* Right side - Submit button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-8 py-2.5 bg-[#00d9ff] text-[#1a1a1b] rounded-full font-semibold hover:bg-[#00b8d4] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="animate-spin" size={18} />
                    Posting...
                  </>
                ) : (
                  "Post"
                )}
              </button>
            </div>
          </form>

          {/* Preview Section */}
          {(formData.title || formData.content) && (
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
                    <p className="text-gray-500 text-xs">Just now</p>
                  </div>
                </div>

                {/* Preview Content */}
                {formData.title && (
                  <h4 className="text-white font-bold text-lg mb-2">{formData.title}</h4>
                )}
                {formData.content && (
                  <p className="text-gray-300 text-sm mb-3 whitespace-pre-wrap">{formData.content}</p>
                )}

                {/* Preview Image */}
                {imagePreview && (
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-48 object-cover rounded-lg mb-3"
                  />
                )}

                {/* Preview Tags */}
                {formData.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-3">
                    {formData.tags.map((tag, index) => (
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
                    <span className="text-sm">0</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-400">
                    <MessageCircle className="w-5 h-5" />
                    <span className="text-sm">0</span>
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