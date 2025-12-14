// src/components/ClientLayout.js
"use client";
import React, { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import RedditNavbar from "@/app/components/Navbar";
import Sidebar from "@/app/components/Sidebar";

export default function ClientLayout({ children }) {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const pathname = usePathname();

  // Check if we're on a profile page
  const isProfilePage = pathname?.startsWith("/profile");

  // Listen for sidebar collapse changes
  useEffect(() => {
    const handleStorageChange = () => {
      const collapsed = localStorage.getItem("sidebarCollapsed") === "true";
      setSidebarCollapsed(collapsed);
    };

    // Initial load
    handleStorageChange();

    // Listen for storage events
    window.addEventListener("storage", handleStorageChange);
    
    // Custom event for same-page updates
    window.addEventListener("sidebarToggle", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("sidebarToggle", handleStorageChange);
    };
  }, []);

  return (
    <>
      <RedditNavbar 
        onMobileSidebarToggle={() => setIsMobileSidebarOpen(true)}
      />
      
      {!isProfilePage && (
        <Sidebar
          isMobileOpen={isMobileSidebarOpen}
          onMobileClose={() => setIsMobileSidebarOpen(false)}
        />
      )}
      
      <div 
        className={`transition-all duration-300 ${
          !isProfilePage ? (sidebarCollapsed ? "lg:ml-16" : "lg:ml-64") : ""
        }`}
      >
        {children}
      </div>
    </>
  );
}