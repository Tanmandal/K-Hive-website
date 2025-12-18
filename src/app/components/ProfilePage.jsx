"use client";
import React, { useState, useEffect } from "react";
import {
  User,
  Calendar,
  MessageSquare,
  FileText,
  Edit,
  Share2,
  Bookmark,
  LogOut,
  ArrowUp,
  ArrowDown,
  X,
  MoreVertical,
  Trash2,
  Loader2,
} from "lucide-react";
import { useAuth, useLogout, useUpdateUser } from "@/lib/hooks/useAuth";
import { useUserProfile } from "@/lib/hooks/useUsers";
import { useQuery } from "@tanstack/react-query";
import { postsApi } from "@/lib/api/posts";
import { useUserComments } from "@/lib/hooks/useComments";
import { useParams } from "next/navigation";
import { useUpdatePost, useDeletePost } from "@/lib/hooks/usePosts";
import toast from "react-hot-toast";
import EditPostModal from "@/app/components/EditModal";

export default function ProfilePage() {
  const params = useParams();
  const profileUserId = params?.userId;

  const [activeTab, setActiveTab] = useState("posts");
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPostEditModal, setShowPostEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [openMenuPostId, setOpenMenuPostId] = useState(null);
  const [editName, setEditName] = useState("");
  const [postsPage, setPostsPage] = useState(1);
  const [commentsPage, setCommentsPage] = useState(1);
  const [allPosts, setAllPosts] = useState([]);
  const [allComments, setAllComments] = useState([]);
  const [postsPagination, setPostsPagination] = useState(null);
  const [commentsPagination, setCommentsPagination] = useState(null);
  const postsPerPage = 10;
  const commentsPerPage = 20;

  // Current authenticated user
  const { data: authData, isLoading: authLoading } = useAuth();
  const currentUser = authData?.user || null;
  console.log("Current User:", currentUser);

  // Profile being viewed
  const { data: profileData, isLoading: profileLoading } =
    useUserProfile(profileUserId);
  const profileUser = profileData?.user || null;

  // Determine which user to display
  const isOwnProfile = !profileUserId || profileUserId === currentUser?.userId;
  const displayUser = isOwnProfile ? currentUser : profileUser;
  const isLoading = isOwnProfile ? authLoading : authLoading || profileLoading;

  const { mutate: logout } = useLogout();
  const { mutate: updateUser, isPending: isUpdating } = useUpdateUser();
  const { mutate: updatePost, isPending: isPostUpdating } = useUpdatePost();
  const { mutate: deletePost, isPending: isDeleting } = useDeletePost();

  const { data: postsData, isLoading: postsLoading } = useQuery({
    queryKey: ["posts", "user", displayUser?.userId, postsPage],
    queryFn: () => postsApi.getPostsByUserId(displayUser?.userId, { 
      page: postsPage, 
      limit: postsPerPage 
    }),
    enabled: !!displayUser?.userId,
  });

  const { data: commentsData, isLoading: commentsLoading } = useUserComments(
    displayUser?.userId,
    { page: commentsPage, limit: commentsPerPage }
  );

  // Update allPosts when postsData changes
  useEffect(() => {
    if (postsData?.data) {
      if (postsPage === 1) {
        setAllPosts(postsData.data);
      } else {
        setAllPosts(prev => [...prev, ...postsData.data]);
      }
      setPostsPagination(postsData.pagination);
    }
  }, [postsData, postsPage]);

  // Update allComments when commentsData changes
  useEffect(() => {
    if (commentsData?.data) {
      if (commentsPage === 1) {
        setAllComments(commentsData.data);
      } else {
        setAllComments(prev => [...prev, ...commentsData.data]);
      }
      setCommentsPagination(commentsData.pagination);
    }
  }, [commentsData, commentsPage]);

  // Reset pagination when user changes
  useEffect(() => {
    setPostsPage(1);
    setCommentsPage(1);
    setAllPosts([]);
    setAllComments([]);
  }, [displayUser?.userId]);

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const handleOpenEdit = () => {
    setEditName(currentUser?.name || "");
    setShowEditModal(true);
  };

  // Handle user profile update
  const handleUpdateUser = () => {
    if (editName.trim() && editName !== currentUser?.name) {
      updateUser(
        { name: editName.trim() },
        {
          onSuccess: () => {
            setShowEditModal(false);
            toast.success("Profile updated successfully!", {
              duration: 2000,
              style: {
                background: "#1a2836",
                color: "#fff",
                border: "1px solid #1dddf2",
              },
            });
          },
          onError: (error) => {
            console.error("Update failed:", error);
            toast.error(
              error.response?.data?.message ||
                "Failed to update profile. Please try again.",
              {
                duration: 3000,
                position: "top-center",
                style: {
                  background: "#1a2836",
                  color: "#fff",
                  border: "1px solid #ff4500",
                },
              }
            );
          },
        }
      );
    }
  };

  // Handle logout with toast
  const handleLogout = () => {
    logout(undefined, {
      onSuccess: () => {
        toast.success("Logged out successfully!", {
          duration: 2000,
          style: {
            background: "#1a2836",
            color: "#fff",
            border: "1px solid #1dddf2",
          },
        });
      },
      onError: (error) => {
        toast.error("Failed to logout. Please try again.", {
          duration: 3000,
          style: {
            background: "#1a2836",
            color: "#fff",
            border: "1px solid #ff4500",
          },
        });
      },
    });
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

  // Format vote count
  const formatVoteCount = (count) => {
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}k`;
    }
    return count.toString();
  };

  // Calculate total karma
  const calculateKarma = () => {
    const postCount = displayUser?.postIds?.length || 0;
    const commentCount = displayUser?.commentIds?.length || 0;
    return postCount * 2 + commentCount;
  };

  // Toggle post menu
  const togglePostMenu = (postId) => {
    setOpenMenuPostId(openMenuPostId === postId ? null : postId);
  };

  // Open post edit modal
  const handleOpenPostEdit = (post) => {
    setSelectedPost(post);
    setOpenMenuPostId(null);
    setShowPostEditModal(true);
  };

  // Open delete confirmation
  const handleOpenDeleteConfirm = (post) => {
    setSelectedPost(post);
    setOpenMenuPostId(null);
    setShowDeleteConfirm(true);
  };

  // Handle post update
  const handleUpdatePost = async (data) => {
    updatePost(
      {
        postId: data.postId,
        title: data.title,
        content: data.content,
        tags: data.tags,
        mediaId: [],
        media: []
      },
      {
        onSuccess: () => {
          setShowPostEditModal(false);
          setSelectedPost(null);
          // Reset posts to refresh
          setPostsPage(1);
          setAllPosts([]);
          toast.success("Post updated successfully!", {
            duration: 2000,
            style: {
              background: "#1a2836",
              color: "#fff",
              border: "1px solid #1dddf2",
            },
          });
        },
        onError: (error) => {
          toast.error(
            error.response?.data?.message || "Failed to update post",
            {
              duration: 3000,
              style: {
                background: "#1a2836",
                color: "#fff",
                border: "1px solid #ff4500",
              },
            }
          );
        },
      }
    );
  };

  // Handle post delete
  const handleDeletePost = () => {
    deletePost(selectedPost.postId, {
      onSuccess: () => {
        setShowDeleteConfirm(false);
        setSelectedPost(null);
        // Reset posts to refresh
        setPostsPage(1);
        setAllPosts([]);
        toast.success("Post deleted successfully!", {
          duration: 2000,
          style: {
            background: "#1a2836",
            color: "#fff",
            border: "1px solid #1dddf2",
          },
        });
      },
      onError: (error) => {
        toast.error(
          error.response?.data?.message || "Failed to delete post",
          {
            duration: 3000,
            style: {
              background: "#1a2836",
              color: "#fff",
              border: "1px solid #ff4500",
            },
          }
        );
      },
    });
  };

  // Load more posts
  const handleLoadMorePosts = () => {
    setPostsPage(prev => prev + 1);
  };

  // Load more comments
  const handleLoadMoreComments = () => {
    setCommentsPage(prev => prev + 1);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#020d17] flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </div>
    );
  }

  if (!displayUser) {
    return (
      <div className="min-h-screen bg-[#020d17] flex justify-center items-center">
        <div className="text-center">
          <p className="text-white text-xl mb-4">
            {profileUserId
              ? "User not found"
              : "Please log in to view your profile"}
          </p>
          <button
            onClick={() =>
              (window.location.href = profileUserId ? "/" : "/login")
            }
            className="px-6 py-3 bg-[#1dddf2] text-[#020d17] font-bold rounded-lg hover:bg-[#18b8cc] transition-all"
          >
            {profileUserId ? "Go Home" : "Login"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020d17]">
      {/* Edit Profile Modal */}
      {isOwnProfile && showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div className="bg-[#0d1d2c] border border-[#343536] rounded-lg w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Edit Profile</h2>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-gray-400 hover:text-white transition-colors"
                disabled={isUpdating}
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div>
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-400 mb-2">
                  Username
                </label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-4 py-3 bg-[#1a1a1b] border border-gray-700 rounded-lg text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#1dddf2] transition-all"
                  placeholder="Enter your username"
                  disabled={isUpdating}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleUpdateUser();
                    }
                  }}
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 px-4 py-3 bg-[#272729] text-white rounded-lg hover:bg-[#3a3a3c] transition-all font-semibold"
                  disabled={isUpdating}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleUpdateUser}
                  disabled={
                    isUpdating ||
                    !editName.trim() ||
                    editName === currentUser?.name
                  }
                  className="flex-1 px-4 py-3 bg-[#1dddf2] text-[#020d17] rounded-lg hover:bg-[#18b8cc] transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isUpdating ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Post Modal */}
      <EditPostModal
        isOpen={showPostEditModal}
        post={selectedPost}
        onClose={() => {
          setShowPostEditModal(false);
          setSelectedPost(null);
        }}
        onSubmit={handleUpdatePost}
        isSubmitting={isPostUpdating}
      />

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && selectedPost && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div className="bg-[#0d1d2c] border border-red-500 rounded-lg w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white">Delete Post</h2>
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setSelectedPost(null);
                }}
                className="text-gray-400 hover:text-white transition-colors"
                disabled={isDeleting}
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <p className="text-gray-300 mb-6">
              Are you sure you want to delete "{selectedPost.title}"? This action cannot be undone.
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setSelectedPost(null);
                }}
                className="flex-1 px-4 py-3 bg-[#272729] text-white rounded-lg hover:bg-[#3a3a3c] transition-all font-semibold"
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                onClick={handleDeletePost}
                disabled={isDeleting}
                className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="animate-spin" size={18} />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 size={18} />
                    Delete
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header Banner */}
      <div className="w-full h-32 sm:h-40 md:h-48 relative overflow-hidden">
        <img
          src="/KHive/k-hive_banner.png"
          alt="Profile banner"
          className="w-full h-full object-cover"
          onError={(e) => {
            e.target.style.display = 'none';
            e.target.nextSibling.style.display = 'block';
          }}
        />
        <div 
          className="absolute inset-0 bg-gradient-to-r from-[#0d1d2c] via-[#1a3a4a] to-[#0d1d2c]"
          style={{ display: 'none' }}
        >
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJyZ2JhKDI5LCAyMjEsIDI0MiwgMC4xKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-20"></div>
        </div>
        <div className="absolute inset-0 bg-black/30"></div>
      </div>

      {/* Main Container */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16 sm:-mt-20 relative z-10">
        {/* Profile Card */}
        <div className="bg-[#0d1d2c] border border-[#343536] rounded-lg p-4 sm:p-6 mb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
            {/* Avatar */}
            <div className="relative">
              <div className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 rounded-full bg-gradient-to-br from-[#1dddf2] to-[#0088cc] flex items-center justify-center border-4 border-[#020d17] shadow-lg">
                {displayUser.avatarLink ? (
                  <img
                    src={displayUser.avatarLink}
                    alt={displayUser.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <User className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 text-white" />
                )}
              </div>
              <div className="absolute -bottom-1 -right-1 w-6 h-6 sm:w-7 sm:h-7 bg-green-500 rounded-full border-2 border-[#020d17]"></div>
            </div>

            {/* User Info */}
            <div className="flex-1 w-full sm:w-auto">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white">
                  {displayUser.name}
                </h1>
                {displayUser.role === "admin" && (
                  <span className="px-3 py-1 bg-[#ff4500] text-white text-xs font-bold rounded-full">
                    ADMIN
                  </span>
                )}
              </div>
              {isOwnProfile && displayUser.gmailId && (
                <p className="text-gray-400 text-sm sm:text-base mb-3">
                  {displayUser.gmailId}
                </p>
              )}
              <div className="flex items-center gap-4 text-sm text-gray-400">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>Joined {formatDate(displayUser.joinDate)}</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            {isOwnProfile && (
              <div className="flex gap-2 w-full sm:w-auto">
                <button
                  onClick={handleOpenEdit}
                  className="flex-1 sm:flex-none px-4 py-2 bg-[#272729] text-white rounded-lg hover:bg-[#3a3a3c] transition-all flex items-center justify-center gap-2"
                >
                  <Edit className="w-4 h-4" />
                  <span className="text-sm font-semibold">Edit</span>
                </button>
                <button
                  onClick={handleLogout}
                  className="flex-1 sm:flex-none px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all flex items-center justify-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="text-sm font-semibold">Logout</span>
                </button>
              </div>
            )}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-[#343536]">
            <div className="text-center">
              <div className="text-2xl sm:text-3xl font-bold text-white mb-1">
                {formatVoteCount(calculateKarma())}
              </div>
              <div className="text-xs sm:text-sm text-gray-400">Karma</div>
            </div>
            <div className="text-center">
              <div className="text-2xl sm:text-3xl font-bold text-white mb-1">
                {displayUser?.postIds?.length || 0}
              </div>
              <div className="text-xs sm:text-sm text-gray-400">Posts</div>
            </div>
            <div className="text-center">
              <div className="text-2xl sm:text-3xl font-bold text-white mb-1">
                {displayUser?.commentIds?.length || 0}
              </div>
              <div className="text-xs sm:text-sm text-gray-400">Comments</div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-[#0d1d2c] border border-[#343536] rounded-lg mb-6">
          <div className="flex gap-2 p-2 overflow-x-auto scrollbar-hide">
            <button
              onClick={() => setActiveTab("posts")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all whitespace-nowrap ${
                activeTab === "posts"
                  ? "bg-[#272729] text-white"
                  : "text-gray-400 hover:text-white hover:bg-[#1c1c1d]"
              }`}
            >
              <FileText className="w-4 h-4" />
              <span className="font-semibold">Posts</span>
            </button>
            <button
              onClick={() => setActiveTab("comments")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all whitespace-nowrap ${
                activeTab === "comments"
                  ? "bg-[#272729] text-white"
                  : "text-gray-400 hover:text-white hover:bg-[#1c1c1d]"
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              <span className="font-semibold">Comments</span>
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="pb-12">
          {activeTab === "posts" && (
            <>
              {postsLoading && postsPage === 1 ? (
                <div className="flex justify-center py-20">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
                </div>
              ) : allPosts.length > 0 ? (
                <>
                  <div className="space-y-4">
                    {allPosts.map((post) => (
                      <div
                        key={post.postId}
                        className="bg-[#0d1d2c] border border-[#343536] rounded-lg hover:border-[#1dddf2] transition-all duration-300 overflow-hidden"
                      >
                        <div className="flex">
                          {/* Content */}
                          <div className="flex-1 p-4">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2 text-xs text-gray-400">
                                <span className="font-semibold">
                                  r/{post.tags?.[0] || "general"}
                                </span>
                                <span>•</span>
                                <span>{formatTimeAgo(post.createdAt)}</span>
                              </div>

                              {/* Three dot menu for own posts */}
                              {isOwnProfile && (
                                <div className="relative">
                                  <button
                                    onClick={() => togglePostMenu(post.postId)}
                                    className="p-1.5 text-gray-400 hover:text-white hover:bg-[#272729] rounded-lg transition-all"
                                  >
                                    <MoreVertical className="w-5 h-5" />
                                  </button>

                                  {/* Dropdown menu */}
                                  {openMenuPostId === post.postId && (
                                    <div className="absolute right-0 mt-2 w-48 bg-[#1a1a1b] border border-[#343536] rounded-lg shadow-xl z-20">
                                      <button
                                        onClick={() => handleOpenPostEdit(post)}
                                        className="w-full flex items-center gap-3 px-4 py-3 text-left text-white hover:bg-[#272729] transition-all"
                                      >
                                        <Edit className="w-4 h-4" />
                                        <span className="text-sm font-medium">Edit Post</span>
                                      </button>
                                      <button
                                        onClick={() => handleOpenDeleteConfirm(post)}
                                        className="w-full flex items-center gap-3 px-4 py-3 text-left text-red-400 hover:bg-[#272729] transition-all"
                                      >
                                        <Trash2 className="w-4 h-4" />
                                        <span className="text-sm font-medium">Delete Post</span>
                                      </button>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>

                            <h2 className="text-white text-lg font-bold mb-2 hover:text-[#ff4500] cursor-pointer transition-colors">
                              {post.title}
                            </h2>

                            <p className="text-gray-400 text-sm mb-3 line-clamp-2">
                              {post.content}
                            </p>

                            <div className="flex items-center gap-3">
                              {/* Like */}
                              <button className="flex items-center gap-1.5 px-3 py-1.5 text-gray-400 hover:text-[#00ff51] hover:bg-[#272729] rounded-lg transition-all">
                                <ArrowUp className="w-5 h-5" />
                                <span className="text-sm font-semibold text-white">
                                  {formatVoteCount(post.upvotes)}
                                </span>
                              </button>

                              {/* Dislike */}
                              <button className="flex items-center gap-1.5 px-3 py-1.5 text-gray-400 hover:text-[#ff7171] hover:bg-[#272729] rounded-lg transition-all">
                                <ArrowDown className="w-5 h-5" />
                                <span className="text-sm font-semibold text-white">
                                  {formatVoteCount(post.downvotes)}
                                </span>
                              </button>

                              {/* Comments */}
                              <button className="flex items-center gap-2 px-3 py-1.5 text-gray-400 hover:bg-[#272729] rounded-lg transition-all">
                                <MessageSquare className="w-4 h-4" />
                                <span className="text-sm font-semibold">
                                  {post.commentIds?.length || 0}
                                </span>
                              </button>

                              {/* Share */}
                              <button className="flex items-center gap-2 px-3 py-1.5 text-gray-400 hover:bg-[#272729] rounded-lg transition-all">
                                <Share2 className="w-4 h-4" />
                                <span className="text-sm font-semibold hidden sm:inline">
                                  Share
                                </span>
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Show More Button for Posts */}
                  {postsPagination && postsPagination.page < postsPagination.totalPages && (
                    <div className="mt-6 text-center">
                      <button
                        onClick={handleLoadMorePosts}
                        disabled={postsLoading}
                        className="px-6 py-3 bg-[#272729] text-white rounded-lg hover:bg-[#3a3a3c] transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mx-auto"
                      >
                        {postsLoading ? (
                          <>
                            <Loader2 className="animate-spin w-5 h-5" />
                            Loading...
                          </>
                        ) : (
                          `Show More Posts (${postsPagination.page} of ${postsPagination.totalPages})`
                        )}
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <div className="bg-[#0d1d2c] border border-[#343536] rounded-lg p-12 text-center">
                  <FileText className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                  <h3 className="text-xl text-white font-bold mb-2">
                    No posts yet
                  </h3>
                  <p className="text-gray-400 mb-6">
                    {isOwnProfile
                      ? "Start sharing your thoughts with the community!"
                      : `${displayUser.name} hasn't posted anything yet.`}
                  </p>
                  {isOwnProfile && (
                    <button className="px-6 py-3 bg-[#1dddf2] text-[#020d17] font-bold rounded-lg hover:bg-[#18b8cc] transition-all">
                      Create Post
                    </button>
                  )}
                </div>
              )}
            </>
          )}

          {activeTab === "comments" && (
            <>
              {commentsLoading && commentsPage === 1 ? (
                <div className="flex justify-center py-20">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
                </div>
              ) : allComments.length > 0 ? (
                <>
                  <div className="space-y-4">
                    {allComments.map((comment) => (
                      <div
                        key={comment.commentId}
                        className="bg-[#0d1d2c] border border-[#343536] rounded-lg hover:border-[#1dddf2] transition-all duration-300 p-4"
                      >
                        <div className="flex gap-3">
                          {/* Vote section */}
                          <div className="flex flex-col items-center gap-1">
                            <button className="text-gray-400 hover:text-[#ff4500] p-1 rounded transition-all">
                              <ArrowUp className="w-4 h-4" />
                            </button>
                            <span className="text-white font-bold text-xs">
                              {formatVoteCount(
                                comment.upvotes - comment.downvotes
                              )}
                            </span>
                            <button className="text-gray-400 hover:text-[#7193ff] p-1 rounded transition-all">
                              <ArrowDown className="w-4 h-4" />
                            </button>
                          </div>

                          {/* Comment Content */}
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2 text-xs text-gray-400">
                              <span className="font-semibold text-white">
                                {displayUser.name}
                              </span>
                              <span>•</span>
                              <span>{formatTimeAgo(comment.createdAt)}</span>
                              {comment.isEdited && (
                                <>
                                  <span>•</span>
                                  <span className="italic">edited</span>
                                </>
                              )}
                            </div>

                            <p className="text-gray-300 text-sm mb-3 whitespace-pre-wrap">
                              {comment.content}
                            </p>

                            <div className="flex items-center gap-2">
                              <button className="flex items-center gap-1 px-2 py-1 text-gray-400 hover:bg-[#272729] rounded text-xs transition-all">
                                <MessageSquare className="w-3 h-3" />
                                <span>Reply</span>
                              </button>
                              <button className="flex items-center gap-1 px-2 py-1 text-gray-400 hover:bg-[#272729] rounded text-xs transition-all">
                                <Share2 className="w-3 h-3" />
                                <span>Share</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Show More Button for Comments */}
                  {commentsPagination && commentsPagination.page < commentsPagination.totalPages && (
                    <div className="mt-6 text-center">
                      <button
                        onClick={handleLoadMoreComments}
                        disabled={commentsLoading}
                        className="px-6 py-3 bg-[#272729] text-white rounded-lg hover:bg-[#3a3a3c] transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mx-auto"
                      >
                        {commentsLoading ? (
                          <>
                            <Loader2 className="animate-spin w-5 h-5" />
                            Loading...
                          </>
                        ) : (
                          `Show More Comments (${commentsPagination.page} of ${commentsPagination.totalPages})`
                        )}
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <div className="bg-[#0d1d2c] border border-[#343536] rounded-lg p-12 text-center">
                  <MessageSquare className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                  <h3 className="text-xl text-white font-bold mb-2">
                    No comments yet
                  </h3>
                  <p className="text-gray-400">
                    {isOwnProfile
                      ? "Your comments will appear here once you start engaging with posts."
                      : `${displayUser.name} hasn't commented yet.`}
                  </p>
                </div>
              )}
            </>
          )}

          {activeTab === "saved" && isOwnProfile && (
            <div className="bg-[#0d1d2c] border border-[#343536] rounded-lg p-12 text-center">
              <Bookmark className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl text-white font-bold mb-2">
                No saved posts
              </h3>
              <p className="text-gray-400">Save posts to read them later.</p>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}