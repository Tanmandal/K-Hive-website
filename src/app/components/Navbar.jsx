"use client";
import React, { useState } from "react";
import {
  Plus,
  User,
  Menu,
  X,
  LogOut,
  Settings,
} from "lucide-react";
import SignUpModal from "./sign-up";
import { useAuth, useLogout } from "@/lib/hooks/useAuth";
import { authApi } from "@/lib/api/auth";
import { useRouter, usePathname } from "next/navigation";
import CreatePostModal from "./CreateModal";
import { useCreatePost } from "@/lib/hooks/usePosts";
import { mediaApi } from "@/lib/api/media";
import { useToast } from "@/components/Toast";
import SearchBar from "../components/Searchbar";

export default function RedditNavbar({ onMobileSidebarToggle }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const createPostMutation = useCreatePost();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { mutate: logout } = useLogout();
  const { showToast } = useToast();

  const { data, isLoading } = useAuth();
  
  const user = data?.user || null;
  const isLoggedIn = !!user;

  const handleGoogleLogin = () => {
    authApi.loginWithGoogle();
  };

  const handleLogout = () => {
    logout();
    setShowUserMenu(false);
  };

  const handleCreatePost = async (postData) => {
    setIsSubmitting(true);
    try {
      let mediaUrls = [];

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
      }

      const finalPostData = {
        title: postData.title.trim(),
        content: postData.content.trim(),
        tags: postData.tags,
      };

      if (mediaUrls.length > 0) {
        finalPostData.media = mediaUrls;
      }

      await createPostMutation.mutateAsync(finalPostData);
      setIsCreateModalOpen(false);
      showToast("Post created successfully! 🎉", "success");
    } catch (err) {
      console.error("Error creating post:", err);
      const errorMessage =
        err.response?.data?.message || err.message || "Failed to create post";
      showToast(errorMessage, "error");
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
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .slide-down {
          animation: slideDown 0.3s ease-out;
        }
        @keyframes neonPulse {
          0%, 100% { box-shadow: 0 0 5px rgba(29,221,242,0.5); }
          50% { box-shadow: 0 0 20px rgba(29,221,242,0.8); }
        }
        .neon-border {
          animation: neonPulse 2s infinite;
        }
      `}</style>

      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#020d1776] border-b border-[#1dddf2]/20 backdrop-blur-md">
        <div className="px-3 sm:px-4 py-3 sm:py-4">
          <div className="flex items-center justify-between gap-2 sm:gap-4 max-w-[1400px] mx-auto">
            {/* Logo Section */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Mobile Sidebar Toggle - Only show on non-profile pages */}
              {!pathname?.startsWith("/profile") && onMobileSidebarToggle && (
                <button
                  onClick={onMobileSidebarToggle}
                  className="lg:hidden p-2 text-gray-200 hover:bg-[#323234] rounded-full transition-all flex-shrink-0"
                >
                  <Menu className="w-5 h-5 sm:w-6 sm:h-6" />
                </button>
              )}
              
              <div 
                className="flex items-center flex-shrink-0 cursor-pointer"
                onClick={() => router.push("/")}
              >
                <img 
                  src="/KHive/k-logo2.png" 
                  alt="K-Hive" 
                  className="h-8 sm:h-10 lg:h-12 w-auto object-contain"
                />
              </div>
            </div>

            {/* Desktop Search Bar */}
            <div className="hidden md:flex flex-1 max-w-3xl mx-4 lg:mx-6">
              <SearchBar className="w-full" />
            </div>

            {/* Mobile Search Button */}
            <button
              className="md:hidden p-2 text-gray-200 hover:bg-[#323234] rounded-full transition-all"
              onClick={() => setMobileSearchOpen(!mobileSearchOpen)}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>

            {/* Right Section - Desktop */}
            <div className="hidden lg:flex items-center gap-2 xl:gap-3 flex-shrink-0">
              {isLoading ? (
                <>
                  <div className="w-32 h-10 bg-[#323234] rounded-full animate-pulse"></div>
                  <div className="w-10 h-10 bg-[#323234] rounded-full animate-pulse"></div>
                </>
              ) : isLoggedIn && user ? (
                <>
                  <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="flex items-center gap-2 px-4 xl:px-6 py-2 xl:py-3 text-gray-100 border border-[#1dddf2] neon-border hover:border-[#1dddf2]/30 hover:shadow-[0_0_10px_rgba(29,221,242,0.3)] rounded-full transition-all"
                  >
                    <Plus className="w-5 h-5 xl:w-6 xl:h-6 text-white" />
                    <span className="text-base xl:text-lg font-semibold tracking-wide whitespace-nowrap">
                      Create
                    </span>
                  </button>

                  <div className="relative">
                    <button
                      onClick={() => setShowUserMenu(!showUserMenu)}
                      className="flex items-center gap-2 xl:gap-3 px-3 xl:px-4 py-2 xl:py-3 text-gray-200 hover:bg-[#323234] border border-transparent hover:border-[#1dddf2]/30 rounded-full transition-all"
                    >
                      <span className="text-sm xl:text-base font-medium whitespace-nowrap">
                        {user.name}
                      </span>
                      {user.avatarLink ? (
                        <img
                          src={user.avatarLink}
                          alt={user.name}
                          className="w-8 h-8 xl:w-9 xl:h-9 rounded-full object-cover border-2 border-[#1dddf2]/50"
                        />
                      ) : (
                        <div className="w-8 h-8 xl:w-9 xl:h-9 rounded-full bg-gradient-to-br from-[#1dddf2] to-[#00ff11] flex items-center justify-center border-2 border-[#1dddf2]/50">
                          <span className="text-white font-bold text-sm xl:text-base">
                            {user.name?.[0]?.toUpperCase() || "U"}
                          </span>
                        </div>
                      )}
                    </button>

                    {showUserMenu && (
                      <div className="absolute right-0 mt-2 w-64 bg-[#0d1d2c] border border-[#1dddf2]/30 shadow-[0_0_20px_rgba(29,221,242,0.2)] rounded-lg overflow-hidden slide-down">
                        <div className="px-4 py-3 bg-gradient-to-r from-[#1dddf2]/10 to-[#00ff11]/10 border-b border-[#1dddf2]/20">
                          <div className="flex items-center gap-3">
                            {user.avatarLink ? (
                              <img
                                src={user.avatarLink}
                                alt={user.name}
                                className="w-12 h-12 rounded-full object-cover"
                              />
                            ) : (
                              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#1dddf2] to-[#00ff11] flex items-center justify-center">
                                <span className="text-white font-bold text-lg">
                                  {user.name?.[0]?.toUpperCase() || "U"}
                                </span>
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="text-white font-semibold truncate">
                                {user.name}
                              </p>
                              <p className="text-gray-400 text-sm truncate">
                                {user.gmailId || user.email}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="py-2">
                          <button
                            onClick={() => {
                              router.push("/profile");
                              setShowUserMenu(false);
                            }}
                            className="w-full flex items-center gap-3 px-4 py-3 text-gray-200 hover:bg-[#323234] transition-all"
                          >
                            <User className="w-5 h-5 text-[#1dddf2]" />
                            <div className="flex-1 text-left">
                              <p className="text-sm font-medium">Profile</p>
                              <p className="text-xs text-gray-400">View your profile</p>
                            </div>
                          </button>

                          <button
                            onClick={() => {
                              setShowUserMenu(false);
                            }}
                            className="w-full flex items-center gap-3 px-4 py-3 text-gray-200 hover:bg-[#323234] transition-all"
                          >
                            <Settings className="w-5 h-5 text-[#1dddf2]" />
                            <div className="flex-1 text-left">
                              <p className="text-sm font-medium">Settings</p>
                              <p className="text-xs text-gray-400">Manage preferences</p>
                            </div>
                          </button>

                          <div className="border-t border-[#343536] my-2"></div>

                          <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-500/10 transition-all"
                          >
                            <LogOut className="w-5 h-5" />
                            <div className="flex-1 text-left">
                              <p className="text-sm font-medium">Logout</p>
                              <p className="text-xs text-red-300/70">Sign out of your account</p>
                            </div>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <button
                    onClick={handleGoogleLogin}
                    className="flex items-center gap-2 xl:gap-3 px-3 xl:px-4 py-2 xl:py-3 text-gray-200 hover:bg-[#323234] rounded-full transition-all"
                  >
                    <User className="w-5 h-5 xl:w-6 xl:h-6" />
                    <span className="text-sm xl:text-base font-medium whitespace-nowrap">
                      Log In
                    </span>
                  </button>

                  <button
                    onClick={() => setIsModalOpen(true)}
                    className="relative bg-gradient-to-r from-[#1dddf2] to-[#00ff11] hover:shadow-[0_0_20px_rgba(29,221,242,0.6)] text-white px-5 xl:px-8 py-2 xl:py-3 rounded-full font-semibold text-sm xl:text-base transition-colors overflow-hidden"
                  >
                    <span className="relative z-10 whitespace-nowrap">
                      Sign Up
                    </span>
                    <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent translate-x-[-100%] animate-shimmer"></span>
                  </button>
                </>
              )}
            </div>

            {/* Mobile Actions */}
            <div className="flex lg:hidden items-center gap-2 flex-shrink-0">
              {isLoading ? (
                <div className="w-8 h-8 bg-[#323234] rounded-full animate-pulse"></div>
              ) : isLoggedIn && user ? (
                <>
                  {/* Create Post Button - Mobile */}
                  <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="p-2 text-white bg-gradient-to-r from-[#1dddf2] to-[#00ff11] rounded-full hover:shadow-[0_0_15px_rgba(29,221,242,0.6)] transition-all"
                  >
                    <Plus className="w-5 h-5" />
                  </button>

                  {/* User Avatar with Dropdown */}
                  <div className="relative">
                    <button
                      onClick={() => setShowUserMenu(!showUserMenu)}
                      className="flex items-center"
                    >
                      {user.avatarLink ? (
                        <img
                          src={user.avatarLink}
                          alt={user.name}
                          className="w-8 h-8 sm:w-9 sm:h-9 rounded-full object-cover border-2 border-[#1dddf2]/50"
                        />
                      ) : (
                        <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-gradient-to-br from-[#1dddf2] to-[#00ff11] flex items-center justify-center border-2 border-[#1dddf2]/50">
                          <span className="text-white font-semibold text-sm">
                            {user.name?.[0]?.toUpperCase() || "U"}
                          </span>
                        </div>
                      )}
                    </button>

                    {/* Mobile User Dropdown */}
                    {showUserMenu && (
                      <div className="absolute right-0 mt-2 w-64 bg-[#0d1d2c] border border-[#1dddf2]/30 shadow-[0_0_20px_rgba(29,221,242,0.2)] rounded-lg overflow-hidden slide-down">
                        <div className="px-4 py-3 bg-gradient-to-r from-[#1dddf2]/10 to-[#00ff11]/10 border-b border-[#1dddf2]/20">
                          <div className="flex items-center gap-3">
                            {user.avatarLink ? (
                              <img
                                src={user.avatarLink}
                                alt={user.name}
                                className="w-12 h-12 rounded-full object-cover"
                              />
                            ) : (
                              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#1dddf2] to-[#00ff11] flex items-center justify-center">
                                <span className="text-white font-bold text-lg">
                                  {user.name?.[0]?.toUpperCase() || "U"}
                                </span>
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="text-white font-semibold truncate">
                                {user.name}
                              </p>
                              <p className="text-gray-400 text-sm truncate">
                                {user.gmailId || user.email}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="py-2">
                          <button
                            onClick={() => {
                              router.push("/profile");
                              setShowUserMenu(false);
                            }}
                            className="w-full flex items-center gap-3 px-4 py-3 text-gray-200 hover:bg-[#323234] transition-all"
                          >
                            <User className="w-5 h-5 text-[#1dddf2]" />
                            <div className="flex-1 text-left">
                              <p className="text-sm font-medium">Profile</p>
                              <p className="text-xs text-gray-400">View your profile</p>
                            </div>
                          </button>

                          <button
                            onClick={() => {
                              setShowUserMenu(false);
                            }}
                            className="w-full flex items-center gap-3 px-4 py-3 text-gray-200 hover:bg-[#323234] transition-all"
                          >
                            <Settings className="w-5 h-5 text-[#1dddf2]" />
                            <div className="flex-1 text-left">
                              <p className="text-sm font-medium">Settings</p>
                              <p className="text-xs text-gray-400">Manage preferences</p>
                            </div>
                          </button>

                          <div className="border-t border-[#343536] my-2"></div>

                          <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-500/10 transition-all"
                          >
                            <LogOut className="w-5 h-5" />
                            <div className="flex-1 text-left">
                              <p className="text-sm font-medium">Logout</p>
                              <p className="text-xs text-red-300/70">Sign out of your account</p>
                            </div>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="relative bg-gradient-to-r from-[#1dddf2] to-[#00ff11] hover:shadow-[0_0_15px_rgba(29,221,242,0.6)] text-white px-4 sm:px-6 py-2 sm:py-2.5 rounded-full font-semibold text-xs sm:text-sm transition-colors overflow-hidden"
                >
                  <span className="relative z-10 whitespace-nowrap">
                    Sign Up
                  </span>
                  <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent translate-x-[-100%] animate-shimmer"></span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Search Bar */}
        {mobileSearchOpen && (
          <div className="md:hidden px-3 sm:px-4 pb-3 slide-down">
            <SearchBar 
              isMobile={true}
              onClose={() => setMobileSearchOpen(false)}
            />
          </div>
        )}
      </nav>

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