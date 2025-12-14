// src/components/Sidebar.js
"use client";
import React, { useState, useEffect } from "react";
import {
  Home,
  MessageSquare,
  Bell,
  FileText,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";
import { useRouter, usePathname } from "next/navigation";

export default function Sidebar({ isMobileOpen, onMobileClose, onMobileOpen }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  // Load collapsed state from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("sidebarCollapsed");
    if (saved !== null) {
      setIsCollapsed(JSON.parse(saved));
    }
  }, []);

  // Save collapsed state to localStorage
  const toggleCollapse = () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    localStorage.setItem("sidebarCollapsed", JSON.stringify(newState));
    
    // Dispatch custom event to notify other components
    window.dispatchEvent(new Event("sidebarToggle"));
  };

  const menuItems = [
    { icon: Home, label: "Home", path: "/" },
    { icon: MessageSquare, label: "Feedback", path: "/feedback" },
    { icon: Bell, label: "Announcements", path: "/announcements" },
    { icon: FileText, label: "Terms & Conditions", path: "/terms" },
  ];

  const handleNavigation = (path) => {
    router.push(path);
    if (onMobileClose) {
      onMobileClose();
    }
  };

  const isActive = (path) => {
    if (path === "/") {
      return pathname === "/";
    }
    return pathname?.startsWith(path);
  };

  // Desktop sidebar
  const DesktopSidebar = () => (
    <div
      className={`hidden lg:flex flex-col fixed left-0 top-[68px] sm:top-[80px] h-[calc(100vh-68px)] sm:h-[calc(100vh-80px)] bg-[#0d1d2c] border-r border-[#1dddf2]/20 transition-all duration-300 z-40 ${
        isCollapsed ? "w-16" : "w-64"
      }`}
    >
      {/* Collapse Toggle */}
      <button
        onClick={toggleCollapse}
        className="absolute -right-3 top-70 bg-[#0d1d2c] border border-[#1dddf2]/30 rounded-full p-1.5 hover:bg-[#1a2f3f] transition-all shadow-lg"
      >
        {isCollapsed ? (
          <ChevronRight className="w-4 h-4 text-[#1dddf2]" />
        ) : (
          <ChevronLeft className="w-4 h-4 text-[#1dddf2]" />
        )}
      </button>

      {/* Menu Items */}
      <nav className="flex-1 px-2 py-4 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);

          return (
            <button
              key={item.path}
              onClick={() => handleNavigation(item.path)}
              className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-all group relative ${
                active
                  ? "bg-[#1dddf2]/10 text-[#1dddf2]"
                  : "text-gray-400 hover:bg-[#1a2f3f] hover:text-gray-200"
              }`}
              title={isCollapsed ? item.label : ""}
            >
              <Icon
                className={`w-5 h-5 flex-shrink-0 ${
                  active ? "text-[#1dddf2]" : ""
                }`}
              />
              {!isCollapsed && (
                <span className="font-medium text-sm truncate">
                  {item.label}
                </span>
              )}
              {active && (
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#1dddf2] rounded-r-full" />
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer */}
      {!isCollapsed && (
        <div className="p-4 border-t border-[#1dddf2]/20">
          <img
            src="/banner.png"
            alt="K-Hive Community"
            className="w-full h-auto rounded-lg"
          />
        </div>
      )}
    </div>
  );

  // Mobile sidebar
  const MobileSidebar = () => (
    <>
      {/* Overlay */}
      {isMobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/60 z-40 backdrop-blur-sm"
          onClick={onMobileClose}
        />
      )}

      {/* Sidebar */}
      <div
        className={`lg:hidden fixed left-0 top-0 h-full w-64 bg-[#0d1d2c] border-r border-[#1dddf2]/20 z-50 transform transition-transform duration-300 ${
          isMobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#1dddf2]/20">
          <div className="flex items-center gap-2">
            <div className="bg-[#37ff0074] rounded-full w-8 h-8 flex items-center justify-center">
              <span className="text-white font-bold text-xl">K</span>
            </div>
            <span className="text-white font-semibold text-xl">K-Hive</span>
          </div>
          <button
            onClick={onMobileClose}
            className="p-2 text-gray-400 hover:text-white hover:bg-[#1a2f3f] rounded-lg transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Menu Items */}
        <nav className="px-2 py-4 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);

            return (
              <button
                key={item.path}
                onClick={() => handleNavigation(item.path)}
                className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-all relative ${
                  active
                    ? "bg-[#1dddf2]/10 text-[#1dddf2]"
                    : "text-gray-400 hover:bg-[#1a2f3f] hover:text-gray-200"
                }`}
              >
                <Icon
                  className={`w-5 h-5 flex-shrink-0 ${
                    active ? "text-[#1dddf2]" : ""
                  }`}
                />
                <span className="font-medium text-sm">{item.label}</span>
                {active && (
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#1dddf2] rounded-r-full" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-[#1dddf2]/20">
          <img
            src="banner.png"
            alt="K-Hive Community"
            className="w-full h-auto rounded-lg"
          />
          <p className="text-xs text-gray-600 text-center mt-1">v1.0.0</p>
        </div>
      </div>
    </>
  );

  return (
    <>
      <DesktopSidebar />
      <MobileSidebar />
    </>
  );
}