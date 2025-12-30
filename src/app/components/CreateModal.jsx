"use client";
import { useState } from "react";
import { X, Image as ImageIcon, Tag, Heart, MessageCircle, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";

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

  // Animation variants
  const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 }
  };

  const modalVariants = {
    hidden: { 
      opacity: 0, 
      scale: 0.8,
      y: 50
    },
    visible: { 
      opacity: 1, 
      scale: 1,
      y: 0,
      transition: {
        type: "spring",
        damping: 25,
        stiffness: 300
      }
    },
    exit: {
      opacity: 0,
      scale: 0.8,
      y: 50,
      transition: {
        duration: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.3
      }
    }
  };

  const tagVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: {
        type: "spring",
        damping: 20,
        stiffness: 300
      }
    },
    exit: {
      opacity: 0,
      scale: 0.8,
      transition: {
        duration: 0.2
      }
    }
  };

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
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
          variants={backdropVariants}
          initial="hidden"
          animate="visible"
          exit="hidden"
          transition={{ duration: 0.2 }}
          onClick={handleClose}
        >
          <motion.div
            className="bg-[#0d1d2c] border-2 border-[#00d9ff] rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl"
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-[#343536]">
              <motion.h2 
                className="text-2xl font-bold text-white"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
              >
                Create Post
              </motion.h2>
              <motion.button
                onClick={handleClose}
                disabled={isSubmitting}
                className="p-2 text-gray-400 hover:text-white hover:bg-[#323234] rounded-full transition-all disabled:opacity-50"
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                initial={{ opacity: 0, rotate: -90 }}
                animate={{ opacity: 1, rotate: 0 }}
                transition={{ delay: 0.1 }}
              >
                <X className="w-6 h-6" />
              </motion.button>
            </div>

            {/* Content */}
            <div className="overflow-y-auto max-h-[calc(90vh-140px)] p-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Title Input */}
                <motion.div variants={itemVariants} initial="hidden" animate="visible">
                  <motion.input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="Title"
                    className="w-full bg-[#e2e2f8c4] text-gray-800 placeholder-gray-800 px-4 py-3 rounded-lg outline-none focus:ring-2 focus:ring-[#00d9ff] transition-all disabled:opacity-50"
                    disabled={isSubmitting}
                    whileFocus={{ scale: 1.01 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  />
                </motion.div>

                {/* Content Textarea */}
                <motion.div 
                  className="relative"
                  variants={itemVariants}
                  initial="hidden"
                  animate="visible"
                  transition={{ delay: 0.05 }}
                >
                  <motion.textarea
                    name="content"
                    value={formData.content}
                    onChange={handleChange}
                    placeholder="What's on your mind?"
                    rows={6}
                    maxLength={5000}
                    className="w-full bg-[#e2e2f8c4] text-gray-800 placeholder-gray-800 px-4 py-3 rounded-lg outline-none focus:ring-2 focus:ring-[#00d9ff] transition-all resize-none disabled:opacity-50"
                    disabled={isSubmitting}
                    whileFocus={{ scale: 1.01 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  />
                  <motion.div 
                    className="absolute bottom-3 right-3 text-xs text-gray-500"
                    animate={{ scale: charCount > 4500 ? [1, 1.1, 1] : 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    {charCount}/5000
                  </motion.div>
                </motion.div>

                {/* Image Preview */}
                <AnimatePresence>
                  {imagePreview && (
                    <motion.div
                      className="relative rounded-lg overflow-hidden"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <motion.img
                        src={imagePreview}
                        alt="Preview"
                        className="w-full h-64 object-cover rounded-lg"
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.1, type: "spring" }}
                      />
                      <motion.button
                        type="button"
                        onClick={handleRemoveImage}
                        disabled={isSubmitting}
                        className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-all disabled:opacity-50"
                        whileHover={{ scale: 1.1, rotate: 90 }}
                        whileTap={{ scale: 0.9 }}
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.2 }}
                      >
                        <X size={18} />
                      </motion.button>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Tags Display */}
                <AnimatePresence>
                  {formData.tags.length > 0 && (
                    <motion.div
                      className="flex flex-wrap gap-2"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                    >
                      <AnimatePresence>
                        {formData.tags.map((tag, index) => (
                          <motion.span
                            key={tag}
                            className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#00d9ff]/20 text-[#00d9ff] rounded-full text-sm border border-[#00d9ff]/30"
                            variants={tagVariants}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                            layout
                          >
                            #{tag}
                            <motion.button
                              type="button"
                              onClick={() => handleRemoveTag(tag)}
                              disabled={isSubmitting}
                              className="hover:text-white transition-all disabled:opacity-50"
                              whileHover={{ scale: 1.2, rotate: 90 }}
                              whileTap={{ scale: 0.8 }}
                            >
                              <X size={14} />
                            </motion.button>
                          </motion.span>
                        ))}
                      </AnimatePresence>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Tags Input */}
                <motion.div 
                  className="flex gap-2"
                  variants={itemVariants}
                  initial="hidden"
                  animate="visible"
                  transition={{ delay: 0.1 }}
                >
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleAddTag(e)}
                    placeholder="Add tags..."
                    className="flex-1 bg-[#e2e2f8c4] text-gray-800 placeholder-gray-800 px-4 py-2.5 rounded-lg outline-none focus:ring-2 focus:ring-[#00d9ff] transition-all disabled:opacity-50"
                    disabled={isSubmitting}
                  />
                  <motion.button
                    type="button"
                    onClick={handleAddTag}
                    disabled={isSubmitting}
                    className="px-4 py-2.5 bg-[#00d9ff] text-white rounded-lg hover:bg-[#00d9ffb6] transition-all flex items-center gap-2 disabled:opacity-50"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Tag size={18} />
                  </motion.button>
                </motion.div>

                {/* Action Buttons */}
                <motion.div 
                  className="flex items-center justify-between pt-4 border-t border-[#343536]"
                  variants={itemVariants}
                  initial="hidden"
                  animate="visible"
                  transition={{ delay: 0.15 }}
                >
                  {/* Left side - Media buttons */}
                  <div className="flex items-center gap-2">
                    <motion.label 
                      className="p-2.5 text-gray-400 hover:text-[#00d9ff] hover:bg-[#323234] rounded-lg transition-all cursor-pointer"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <ImageIcon className="w-5 h-5" />
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={handleImageChange}
                        disabled={isSubmitting}
                      />
                    </motion.label>
                  </div>

                  {/* Right side - Submit button */}
                  <motion.button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-8 py-2.5 bg-[#00d9ff] text-[#1a1a1b] rounded-full font-semibold hover:bg-[#00b8d4] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="animate-spin" size={18} />
                        Posting...
                      </>
                    ) : (
                      "Post"
                    )}
                  </motion.button>
                </motion.div>
              </form>

              {/* Preview Section */}
              <AnimatePresence>
                {(formData.title || formData.content) && (
                  <motion.div
                    className="mt-6 pt-6 border-t border-[#343536]"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <h3 className="text-sm font-semibold text-gray-400 mb-3">Preview</h3>
                    <motion.div 
                      className="bg-[#272729] rounded-xl p-4 border border-[#343536]"
                      initial={{ scale: 0.95 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      {/* Preview Header */}
                      <div className="flex items-center gap-3 mb-3">
                        <motion.div 
                          className="w-10 h-10 rounded-full bg-[#00ff1187] flex items-center justify-center"
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: "spring", delay: 0.1 }}
                        >
                          <span className="text-white font-semibold">U</span>
                        </motion.div>
                        <motion.div
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.15 }}
                        >
                          <p className="text-white font-semibold text-sm">You</p>
                          <p className="text-gray-500 text-xs">Just now</p>
                        </motion.div>
                      </div>

                      {/* Preview Content */}
                      <AnimatePresence mode="wait">
                        {formData.title && (
                          <motion.h4 
                            className="text-white font-bold text-lg mb-2"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                          >
                            {formData.title}
                          </motion.h4>
                        )}
                      </AnimatePresence>
                      
                      <AnimatePresence mode="wait">
                        {formData.content && (
                          <motion.p 
                            className="text-gray-300 text-sm mb-3 whitespace-pre-wrap"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                          >
                            {formData.content}
                          </motion.p>
                        )}
                      </AnimatePresence>

                      {/* Preview Image */}
                      <AnimatePresence>
                        {imagePreview && (
                          <motion.img
                            src={imagePreview}
                            alt="Preview"
                            className="w-full h-48 object-cover rounded-lg mb-3"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            transition={{ duration: 0.3 }}
                          />
                        )}
                      </AnimatePresence>

                      {/* Preview Tags */}
                      <AnimatePresence>
                        {formData.tags.length > 0 && (
                          <motion.div
                            className="flex flex-wrap gap-2 mb-3"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                          >
                            {formData.tags.map((tag, index) => (
                              <motion.span
                                key={tag}
                                className="text-xs px-2 py-1 bg-[#00d9ff]/20 text-[#00d9ff] rounded-full border border-[#00d9ff]/30"
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.8 }}
                                transition={{ delay: index * 0.05 }}
                              >
                                #{tag}
                              </motion.span>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {/* Preview Actions */}
                      <motion.div 
                        className="flex items-center gap-4 pt-3 border-t border-[#343536]"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                      >
                        <motion.div 
                          className="flex items-center gap-2 text-gray-400"
                          whileHover={{ scale: 1.05, color: "#00d9ff" }}
                        >
                          <Heart className="w-5 h-5" />
                          <span className="text-sm">0</span>
                        </motion.div>
                        <motion.div 
                          className="flex items-center gap-2 text-gray-400"
                          whileHover={{ scale: 1.05, color: "#00d9ff" }}
                        >
                          <MessageCircle className="w-5 h-5" />
                          <span className="text-sm">0</span>
                        </motion.div>
                      </motion.div>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}