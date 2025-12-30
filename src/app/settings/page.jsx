"use client";
import React, { useState, useEffect } from "react";
import {
  Settings,
  User,
  Shield,
  Trash2,
  LogOut,
  FileText,
  Lock,
  AlertTriangle,
  X,
  Mail,
  Info,
  RefreshCw,
  Eye
} from "lucide-react";
import { useAuth, useLogout, useDeleteUser } from "@/lib/hooks/useAuth";
import { useRouter } from "next/navigation";
import { authApi } from "@/lib/api/auth";
import toast from "react-hot-toast";

export default function SettingsPage() {
  const [hideEmail, setHideEmail] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();
  const { data: authData, isLoading } = useAuth();
  const user = authData?.user || null;
  const isLoggedIn = !!user;
  const { mutate: logout } = useLogout();
  const { mutate: deleteUser } = useDeleteUser();

  // Redirect to home if not authenticated
  useEffect(() => {
    if (!isLoading && !isLoggedIn) {
      toast.error("Please login to access settings");
      router.push("/");
    }
  }, [isLoading, isLoggedIn, router]);

  const handleSwitchAccount = () => {
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
        // Open Google account selection page
        authApi.loginWithGoogle();
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

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== "DELETE") return;
    
    setIsDeleting(true);
    
    deleteUser(undefined, {
      onSuccess: () => {
        toast.success("Account deleted successfully", {
          duration: 3000,
          style: {
            background: "#1a2836",
            color: "#fff",
            border: "1px solid #1dddf2",
          },
        });
        setShowDeleteModal(false);
        setDeleteConfirmText("");
        router.push("/");
      },
      onError: (error) => {
        console.error("Failed to delete account:", error);
        toast.error(error.response?.data?.message || "Failed to delete account. Please try again.", {
          duration: 3000,
          style: {
            background: "#1a2836",
            color: "#fff",
            border: "1px solid #ff4500",
          },
        });
        setIsDeleting(false);
      },
    });
  };

  const handleToggleEmailPrivacy = () => {
    setHideEmail(!hideEmail);
    // Add your API call to update privacy settings
    toast.success(`Email visibility ${!hideEmail ? 'hidden' : 'visible'}`);
  };

  return (
    <div className="min-h-screen bg-[#020d17]">
      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1dddf2]"></div>
        </div>
      )}

      {/* Main Content - Only show if authenticated */}
      {!isLoading && isLoggedIn && (
        <div className="max-w-[1200px] mx-auto px-2 sm:px-4 md:px-6 lg:px-8 py-6">
          {/* Header */}
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-[#1dddf2] to-[#7193ff] rounded-xl">
              <Settings className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-white flex items-center gap-2">
                Settings
              </h1>
              <p className="text-gray-400 text-sm mt-1">
                Manage your account preferences and privacy
              </p>
            </div>
          </div>

          {/* Account Section */}
          <div className="space-y-4 mt-5">
            <div className="bg-[#0d1d2c] border border-[#343536] rounded-lg overflow-hidden">
              <div className="p-4 border-b border-[#343536]">
                <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                  <User className="w-5 h-5 text-[#1dddf2]" />
                  Account Settings
                </h2>
              </div>

              <div className="p-4 space-y-1">
                <div className="w-full flex items-center justify-between p-4 rounded-lg transition-all group">
                  <div className="flex items-center gap-3">
                    <LogOut className="w-5 h-5 text-gray-400 group-hover:text-[#1dddf2] transition-colors" />
                    <div className="text-left">
                      <p className="text-white font-medium">Switch Account</p>
                      <p className="text-xs text-gray-400">
                        Log out and sign in with a different account
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleSwitchAccount}
                    className="flex items-center gap-2 px-4 py-2 bg-[#1dddf2] text-[#020d17] font-semibold rounded-lg hover:bg-[#18b8cc] transition-all"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Switch
                  </button>
                </div>
              </div>
            </div>

            {/* Privacy Settings */}
            <div className="bg-[#0d1d2c] border border-[#343536] rounded-lg overflow-hidden">
              <div className="p-4 border-b border-[#343536]">
                <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                  <Shield className="w-5 h-5 text-[#1dddf2]" />
                  Privacy Settings
                </h2>
              </div>

              <div className="p-4 space-y-1">
                <div className="flex items-center justify-between p-4 rounded-lg transition-all">
                  <div className="flex items-center gap-3 flex-1">
                    <Mail className="w-5 h-5 text-gray-400" />
                    <div className="text-left flex-1">
                      <div className="flex items-center gap-2">
                        <p className="text-white font-medium">Hide My Email</p>
                        <div className="group relative">
                          <Info className="w-4 h-4 text-gray-400 cursor-help" />
                          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block w-64 p-3 bg-[#1a1a1b] border border-[#343536] rounded-lg shadow-xl z-10">
                            <p className="text-xs text-gray-300">
                              When enabled, other users cannot view your email
                              address on your profile or anywhere in the app
                            </p>
                          </div>
                        </div>
                      </div>
                      <p className="text-xs text-gray-400 mt-1">
                        Other users cannot view your email address
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={handleToggleEmailPrivacy}
                    className={`relative w-14 h-7 rounded-md transition-all duration-300 ${
                      hideEmail ? "bg-[#1dddf2]" : "bg-gray-600"
                    }`}
                  >
                    <div
                      className={`absolute top-1 w-5 h-5 bg-white rounded-sm transition-all duration-300 ${
                        hideEmail ? "right-1" : "left-1"
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>

            {/* Legal Section */}
            <div className="bg-[#0d1d2c] border border-[#343536] rounded-lg overflow-hidden">
              <div className="p-4 border-b border-[#343536]">
                <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                  <FileText className="w-5 h-5 text-[#1dddf2]" />
                  Legal
                </h2>
              </div>

              <div className="p-4 space-y-1">
                <div className="w-full flex items-center justify-between p-4 rounded-lg transition-all group">
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-gray-400 group-hover:text-[#1dddf2] transition-colors" />
                    <div className="text-left">
                      <p className="text-white font-medium">Terms & Conditions</p>
                      <p className="text-xs text-gray-400">
                        View our terms of service
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => router.push("/legal/terms")}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-700 text-white font-semibold rounded-lg hover:bg-gray-600 transition-all"
                  >
                    <Eye className="w-4 h-4" />
                    View
                  </button>
                </div>

                <div className="w-full flex items-center justify-between p-4 rounded-lg   transition-all group">
                  <div className="flex items-center gap-3">
                    <Lock className="w-5 h-5 text-gray-400 group-hover:text-[#1dddf2] transition-colors" />
                    <div className="text-left">
                      <p className="text-white font-medium">Privacy Policy</p>
                      <p className="text-xs text-gray-400">
                        How we handle your data
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => router.push("/legal/privacy")}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-700 text-white font-semibold rounded-lg hover:bg-gray-600 transition-all"
                  >
                    <Eye className="w-4 h-4" />
                    View
                  </button>
                </div>
              </div>
            </div>

            {/* Danger Zone */}
            <div className="bg-[#0d1d2c] border border-red-900/50 rounded-lg overflow-hidden">
              <div className="p-4 border-b border-red-900/50 bg-red-900/10">
                <h2 className="text-lg font-semibold text-red-400 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5" />
                  Danger Zone
                </h2>
              </div>

              <div className="p-4">
                <div className="w-full flex items-center justify-between p-4 rounded-lg hover:bg-red-900/20 transition-all group border border-red-900/30">
                  <div className="flex items-center gap-3">
                    <Trash2 className="w-5 h-5 text-red-400" />
                    <div className="text-left">
                      <p className="text-red-400 font-medium">Delete Account</p>
                      <p className="text-xs text-gray-400">
                        Permanently delete your account and all data
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowDeleteModal(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Delete Account Modal */}
          {showDeleteModal && (
            <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
              <div className="bg-[#0d1d2c] border border-red-900/50 rounded-lg max-w-md w-full overflow-hidden">
                {/* Header */}
                <div className="p-6 border-b border-red-900/50 bg-red-900/10">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-red-500/20 rounded-lg">
                        <AlertTriangle className="w-6 h-6 text-red-400" />
                      </div>
                      <h3 className="text-xl font-bold text-red-400">
                        Delete Account
                      </h3>
                    </div>
                    <button
                      onClick={() => setShowDeleteModal(false)}
                      className="text-gray-400 hover:text-white transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 space-y-4">
                  <div className="bg-red-900/10 border border-red-900/30 rounded-lg p-4">
                    <p className="text-red-400 font-semibold mb-2 flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4" />
                      Warning: This action cannot be undone
                    </p>
                    <p className="text-gray-300 text-sm">
                      Deleting your account will permanently remove:
                    </p>
                    <ul className="mt-3 space-y-2 text-sm text-gray-400">
                      <li className="flex items-start gap-2">
                        <span className="text-red-400 mt-0.5">•</span>
                        <span>All your posts and their associated data</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-red-400 mt-0.5">•</span>
                        <span>All your comments and replies</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-red-400 mt-0.5">•</span>
                        <span>Your profile information and settings</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-red-400 mt-0.5">•</span>
                        <span>All your votes and interactions</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-red-400 mt-0.5">•</span>
                        <span>Your account cannot be recovered</span>
                      </li>
                    </ul>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Type <span className="text-red-400 font-bold">DELETE</span>{" "}
                      to confirm
                    </label>
                    <input
                      type="text"
                      value={deleteConfirmText}
                      onChange={(e) => setDeleteConfirmText(e.target.value)}
                      placeholder="Type DELETE"
                      className="w-full px-4 py-3 bg-[#1a1a1b] border border-gray-700 rounded-lg text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-[#343536] bg-[#0a1520] flex gap-3">
                  <button
                    onClick={() => {
                      setShowDeleteModal(false);
                      setDeleteConfirmText("");
                    }}
                    className="flex-1 px-4 py-3 bg-[#272729] text-white rounded-lg hover:bg-[#3a3a3c] transition-all font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDeleteAccount}
                    disabled={deleteConfirmText !== "DELETE" || isDeleting}
                    className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isDeleting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Deleting...
                      </>
                    ) : (
                      <>
                        <Trash2 className="w-4 h-4" />
                        Delete Account
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}