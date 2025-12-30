"use client";
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  User,
  Menu,
} from "lucide-react";
import SignUpModal from "./sign-up";
import { useAuth, useLogout } from "@/lib/hooks/useAuth";
import { authApi } from "@/lib/api/auth";
import { useRouter, usePathname } from "next/navigation";
import CreatePostModal from "./CreateModal";
import { useCreatePost } from "@/lib/hooks/usePosts";
import { mediaApi } from "@/lib/api/media";
import toast from "react-hot-toast";
import SearchBar from "../components/Searchbar";

export default function RedditNavbar({ onMobileSidebarToggle }) {
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const createPostMutation = useCreatePost();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { mutate: logout } = useLogout();

  const { data, isLoading } = useAuth();
  
  const user = data?.user || null;
  const isLoggedIn = !!user;

  const handleGoogleLogin = () => {
    authApi.loginWithGoogle();
  };

  const handleAvatarClick = () => {
    router.push("/profile");
  };

  const handleCreatePost = async (postData) => {
    setIsSubmitting(true);
    try {
      let mediaUrls = [];
      let mediaIds = [];

      if (postData.imageFile) {
        const credsResult = await mediaApi.getUploadLink();
        const { token, expire, signature, publicKey, uploadUrl, folder } =
          credsResult.data;

        const timeLeft = expire - Math.floor(Date.now() / 1000);
        if (timeLeft < 10) {
          throw new Error("Upload token expired. Please try again.");
        }

        const uploadFormData = new FormData();
        uploadFormData.append("file", postData.imageFile);
        uploadFormData.append(
          "fileName",
          `${Date.now()}-${postData.imageFile.name}`
        );
        uploadFormData.append("publicKey", publicKey);
        uploadFormData.append("signature", signature);
        uploadFormData.append("expire", expire);
        uploadFormData.append("token", token);
        uploadFormData.append("folder", folder);

        const uploadResponse = await fetch(uploadUrl, {
          method: "POST",
          body: uploadFormData,
        });

        const uploadResult = await uploadResponse.json();
        if (!uploadResponse.ok) {
          throw new Error(uploadResult.message || "Failed to upload image");
        }

        mediaUrls.push(uploadResult.url);
        mediaIds.push(uploadResult.fileId);
      }

      const finalPostData = {
        title: postData.title.trim(),
        content: postData.content.trim(),
        tags: postData.tags,
      };

      if (mediaUrls.length > 0) {
        finalPostData.media = mediaUrls;
      }

      if (mediaIds.length > 0) {
        finalPostData.mediaId = mediaIds;
      }

      await createPostMutation.mutateAsync(finalPostData);
      setIsCreateModalOpen(false);
      toast.success("Post created successfully! 🎉", {
        duration: 3000,
        style: {
          background: "#1a2836",
          color: "#fff",
          border: "1px solid #1dddf2",
        },
      });
    } catch (err) {
      console.error("Error creating post:", err);
      const errorMessage =
        err.response?.data?.message || err.message || "Failed to create post";
      toast.error(errorMessage, {
        duration: 3000,
        style: {
          background: "#1a2836",
          color: "#fff",
          border: "1px solid #ff4500",
        },
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-shimmer {
          animation: shimmer 2s infinite;
        }
        @keyframes neonPulse {
          0%, 100% { box-shadow: 0 0 5px rgba(29,221,242,0.5); }
          50% { box-shadow: 0 0 20px rgba(29,221,242,0.8); }
        }
        .neon-border {
          animation: neonPulse 2s infinite;
        }
      `}</style>

      <motion.nav 
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="fixed top-0 left-0 right-0 z-50 bg-[#020d1776] border-b border-[#1dddf2]/20 backdrop-blur-md"
      >
        <div className="px-3 sm:px-4 py-2 sm:py-3">
          <div className="flex items-center justify-between gap-2 sm:gap-4 max-w-[1400px] mx-auto">
            {/* Logo Section */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Mobile Sidebar Toggle */}
              {!pathname?.startsWith("/profile") && onMobileSidebarToggle && (
                <motion.button
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  transition={{ type: "spring", stiffness: 400, damping: 17 }}
                  onClick={onMobileSidebarToggle}
                  className="lg:hidden p-2 text-gray-200 hover:bg-[#323234] rounded-full transition-colors flex-shrink-0"
                >
                  <Menu className="w-5 h-5 sm:w-6 sm:h-6" />
                </motion.button>
              )}
              
              <motion.div 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
                className="flex items-center flex-shrink-0 cursor-pointer"
                onClick={() => router.push("/")}
              >
                <motion.img 
                  src="/KHive/k-logo2.png" 
                  alt="K-Hive" 
                  className="h-8 sm:h-10 lg:h-12 w-auto object-contain"
                />
              </motion.div>
            </div>

            {/* Desktop Search Bar */}
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.4 }}
              className="hidden md:flex flex-1 max-w-3xl mx-4 lg:mx-6"
            >
              <SearchBar className="w-full" />
            </motion.div>

            {/* Mobile Search Button */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
              className="md:hidden p-2 text-gray-200 hover:bg-[#323234] rounded-full transition-colors"
              onClick={() => setMobileSearchOpen(!mobileSearchOpen)}
            >
              <motion.svg 
                animate={{ rotate: mobileSearchOpen ? 90 : 0 }}
                transition={{ duration: 0.3 }}
                className="w-5 h-5" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </motion.svg>
            </motion.button>

            {/* Right Section - Desktop */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, duration: 0.4 }}
              className="hidden lg:flex items-center gap-2 xl:gap-3 flex-shrink-0"
            >
              <AnimatePresence mode="wait">
                {isLoading ? (
                  <motion.div
                    key="loading"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center gap-2"
                  >
                    <div className="w-32 h-10 bg-[#323234] rounded-full animate-pulse"></div>
                    <div className="w-10 h-10 bg-[#323234] rounded-full animate-pulse"></div>
                  </motion.div>
                ) : isLoggedIn && user ? (
                  <motion.div
                    key="logged-in"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.3 }}
                    className="flex items-center gap-2 xl:gap-3"
                  >
                    <motion.button
                      whileHover={{ scale: 1.05, boxShadow: "0 0 15px rgba(29,221,242,0.5)" }}
                      whileTap={{ scale: 0.95 }}
                      transition={{ type: "spring", stiffness: 400, damping: 17 }}
                      onClick={() => setIsCreateModalOpen(true)}
                      className="flex items-center gap-2 px-3 xl:px-5 py-2 xl:py-3 text-gray-100 border border-[#1dddf2] neon-border hover:border-[#1dddf2]/30 rounded-full transition-colors"
                    >
                      <motion.div
                        whileHover={{ rotate: 90 }}
                        transition={{ duration: 0.2 }}
                      >
                        <Plus className="w-4 h-4 xl:w-5 xl:h-5 text-white" />
                      </motion.div>
                      <span className="text-base xl:text-md font-semibold tracking-wide whitespace-nowrap">
                        Create
                      </span>
                    </motion.button>

                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      transition={{ type: "spring", stiffness: 400, damping: 17 }}
                      onClick={handleAvatarClick}
                      className="flex items-center gap-2 xl:gap-3 px-3 xl:px-4 py-2 xl:py-3 text-gray-200 hover:bg-[#323234] border border-transparent hover:border-[#1dddf2]/30 rounded-full transition-colors"
                    >
                      <span className="text-sm xl:text-base font-medium whitespace-nowrap">
                        {user.name}
                      </span>
                      {user.avatarLink ? (
                        <motion.img
                          whileHover={{ scale: 1.1, rotate: 5 }}
                          transition={{ type: "spring", stiffness: 400, damping: 17 }}
                          src={user.avatarLink}
                          alt={user.name}
                          className="w-8 h-8 xl:w-9 xl:h-9 rounded-full object-cover border-2 border-[#1dddf2]/50"
                        />
                      ) : (
                        <motion.div 
                          whileHover={{ scale: 1.1, rotate: 5 }}
                          transition={{ type: "spring", stiffness: 400, damping: 17 }}
                          className="w-8 h-8 xl:w-9 xl:h-9 rounded-full bg-gradient-to-br from-[#1dddf2] to-[#00ff11] flex items-center justify-center border-2 border-[#1dddf2]/50"
                        >
                          <span className="text-white font-bold text-sm xl:text-base">
                            {user.name?.[0]?.toUpperCase() || "U"}
                          </span>
                        </motion.div>
                      )}
                    </motion.button>
                  </motion.div>
                ) : (
                  <motion.div
                    key="logged-out"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.3 }}
                    className="flex items-center gap-2 xl:gap-3"
                  >
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      transition={{ type: "spring", stiffness: 400, damping: 17 }}
                      onClick={handleGoogleLogin}
                      className="flex items-center gap-2 xl:gap-3 px-3 xl:px-4 py-2 xl:py-3 text-gray-200 hover:bg-[#323234] rounded-full transition-colors"
                    >
                      <User className="w-5 h-5 xl:w-6 xl:h-6" />
                      <span className="text-sm xl:text-base font-medium whitespace-nowrap">
                        Log In
                      </span>
                    </motion.button>

                    <motion.button
                      whileHover={{ scale: 1.05, boxShadow: "0 0 15px rgba(29,221,242,0.5)" }}
                      whileTap={{ scale: 0.95 }}
                      transition={{ type: "spring", stiffness: 400, damping: 17 }}
                      onClick={() => setIsModalOpen(true)}
                      className="px-5 xl:px-8 py-2 xl:py-3 text-gray-100 border border-[#1dddf2] neon-border hover:border-[#1dddf2]/30 rounded-full font-semibold text-sm xl:text-base transition-colors whitespace-nowrap"
                    >
                      Sign Up
                    </motion.button>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            {/* Mobile Actions */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, duration: 0.4 }}
              className="flex lg:hidden items-center gap-2 flex-shrink-0"
            >
              <AnimatePresence mode="wait">
                {isLoading ? (
                  <motion.div
                    key="loading-mobile"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="w-8 h-8 bg-[#323234] rounded-full animate-pulse"
                  />
                ) : isLoggedIn && user ? (
                  <motion.div
                    key="logged-in-mobile"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.3 }}
                    className="flex items-center gap-2"
                  >
                    <motion.button
                      whileHover={{ scale: 1.1, boxShadow: "0 0 15px rgba(29,221,242,0.5)" }}
                      whileTap={{ scale: 0.9 }}
                      transition={{ type: "spring", stiffness: 400, damping: 17 }}
                      onClick={() => setIsCreateModalOpen(true)}
                      className="p-2 text-gray-100 border border-[#1dddf2] neon-border hover:border-[#1dddf2]/30 rounded-full transition-colors"
                    >
                      <motion.div
                        whileHover={{ rotate: 90 }}
                        transition={{ duration: 0.2 }}
                      >
                        <Plus className="w-5 h-5 text-white" />
                      </motion.div>
                    </motion.button>

                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      transition={{ type: "spring", stiffness: 400, damping: 17 }}
                      onClick={handleAvatarClick}
                      className="flex items-center"
                    >
                      {user.avatarLink ? (
                        <motion.img
                          whileHover={{ rotate: 5 }}
                          src={user.avatarLink}
                          alt={user.name}
                          className="w-8 h-8 sm:w-9 sm:h-9 rounded-full object-cover border-2 border-[#1dddf2]/50 hover:border-[#1dddf2] transition-colors"
                        />
                      ) : (
                        <motion.div 
                          whileHover={{ rotate: 5 }}
                          className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-gradient-to-br from-[#1dddf2] to-[#00ff11] flex items-center justify-center border-2 border-[#1dddf2]/50 hover:border-[#1dddf2] transition-colors"
                        >
                          <span className="text-white font-semibold text-sm">
                            {user.name?.[0]?.toUpperCase() || "U"}
                          </span>
                        </motion.div>
                      )}
                    </motion.button>
                  </motion.div>
                ) : (
                  <motion.button
                    key="sign-up-mobile"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    whileHover={{ scale: 1.05, boxShadow: "0 0 15px rgba(29,221,242,0.5)" }}
                    whileTap={{ scale: 0.95 }}
                    transition={{ type: "spring", stiffness: 400, damping: 17 }}
                    onClick={() => setIsModalOpen(true)}
                    className="px-4 sm:px-6 py-2 sm:py-2.5 text-gray-100 border border-[#1dddf2] neon-border hover:border-[#1dddf2]/30 rounded-full font-semibold text-xs sm:text-sm transition-colors whitespace-nowrap"
                  >
                    Sign Up
                  </motion.button>
                )}
              </AnimatePresence>
            </motion.div>
          </div>
        </div>

        {/* Mobile Search Bar */}
        <AnimatePresence>
          {mobileSearchOpen && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="md:hidden px-3 sm:px-4 pb-3 overflow-hidden"
            >
              <motion.div
                initial={{ y: -20 }}
                animate={{ y: 0 }}
                exit={{ y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <SearchBar 
                  isMobile={true}
                  onClose={() => setMobileSearchOpen(false)}
                />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>

      <SignUpModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
      <CreatePostModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreatePost}
        isSubmitting={isSubmitting}
      />

      <div className="h-[68px] sm:h-[80px]"></div>
    </>
  );
}