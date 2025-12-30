// src/components/Sidebar.js
"use client";
import React, { useState, useEffect } from "react";
import {
  Home,
  MessageSquare,
  Bell,
  FileText,
  Users,
  Settings,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

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
    {icon: Users, label: "About Us", path: "/about"},
    { icon: Bell, label: "Announcements", path: "/announcements" },
    { icon: MessageSquare, label: "Feedback", path: "/feedback" },
    { icon: Settings, label: "Settings", path: "/settings" },
    { icon: FileText, label: "Legal Notices", path: "/legal" },
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

  // Animation variants
  const sidebarVariants = {
    expanded: {
      width: 256,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 35
      }
    },
    collapsed: {
      width: 64,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 35
      }
    }
  };

  const menuItemVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: (i) => ({
      opacity: 1,
      x: 0,
      transition: {
        delay: i * 0.03,
        duration: 0.2,
        ease: "easeOut"
      }
    })
  };

  const labelVariants = {
    expanded: {
      opacity: 1,
      width: "auto",
      transition: {
        duration: 0.15,
        ease: "easeOut"
      }
    },
    collapsed: {
      opacity: 0,
      width: 0,
      transition: {
        duration: 0.1,
        ease: "easeIn"
      }
    }
  };

  const activeIndicatorVariants = {
    initial: { scaleY: 0.3, opacity: 0 },
    animate: {
      scaleY: 1,
      opacity: 1,
      transition: {
        duration: 0.2,
        ease: "easeOut"
      }
    },
    exit: {
      scaleY: 0.3,
      opacity: 0,
      transition: {
        duration: 0.15,
        ease: "easeIn"
      }
    }
  };

  const footerVariants = {
    expanded: {
      opacity: 1,
      height: "auto",
      transition: {
        duration: 0.2,
        ease: "easeOut"
      }
    },
    collapsed: {
      opacity: 0,
      height: 0,
      transition: {
        duration: 0.15,
        ease: "easeIn"
      }
    }
  };

  // Desktop sidebar
  const DesktopSidebar = () => (
    <motion.div
      className="hidden lg:flex flex-col fixed left-0 top-[68px] sm:top-[80px] h-[calc(100vh-68px)] sm:h-[calc(100vh-80px)] bg-[#0d1d2c] border-r border-[#1dddf2]/20 z-40"
      variants={sidebarVariants}
      animate={isCollapsed ? "collapsed" : "expanded"}
      initial={false}
    >
      {/* Collapse Toggle */}
      <motion.button
        onClick={toggleCollapse}
        className="absolute -right-3 top-70 bg-[#0d1d2c] border border-[#1dddf2]/30 rounded-full p-1.5 hover:bg-[#1a2f3f] transition-all shadow-lg"
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.92 }}
        transition={{ duration: 0.15 }}
      >
        <motion.div
          animate={{ rotate: isCollapsed ? 0 : 180 }}
          transition={{ duration: 0.2 }}
        >
          {isCollapsed ? (
            <ChevronRight className="w-4 h-4 text-[#1dddf2]" />
          ) : (
            <ChevronLeft className="w-4 h-4 text-[#1dddf2]" />
          )}
        </motion.div>
      </motion.button>

      {/* Menu Items */}
      <nav className="flex-1 px-2 py-4 space-y-1">
        {menuItems.map((item, index) => {
          const Icon = item.icon;
          const active = isActive(item.path);

          return (
            <motion.button
              key={item.path}
              onClick={() => handleNavigation(item.path)}
              className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-colors duration-150 group relative overflow-hidden ${
                active
                  ? "bg-[#1dddf2]/10 text-[#1dddf2]"
                  : "text-gray-400 hover:bg-[#1a2f3f] hover:text-gray-200"
              }`}
              title={isCollapsed ? item.label : ""}
              custom={index}
              variants={menuItemVariants}
              initial="hidden"
              animate="visible"
              whileHover={{ x: 3 }}
              whileTap={{ scale: 0.98 }}
              transition={{ duration: 0.15 }}
            >
              <Icon
                className={`w-5 h-5 flex-shrink-0 transition-transform duration-150 ${
                  active ? "text-[#1dddf2]" : ""
                }`}
              />
              
              <AnimatePresence mode="wait">
                {!isCollapsed && (
                  <motion.span
                    className="font-medium text-sm truncate"
                    variants={labelVariants}
                    initial="collapsed"
                    animate="expanded"
                    exit="collapsed"
                  >
                    {item.label}
                  </motion.span>
                )}
              </AnimatePresence>

              <AnimatePresence mode="wait">
                {active && (
                  <motion.div
                    className="absolute left-0 top-0 bottom-0 w-1 bg-[#1dddf2] rounded-r-full origin-center"
                    variants={activeIndicatorVariants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    layoutId="activeIndicator"
                    transition={{ duration: 0.2, ease: "easeInOut" }}
                  />
                )}
              </AnimatePresence>
            </motion.button>
          );
        })}
      </nav>

      {/* Footer */}
      <AnimatePresence mode="wait">
        {!isCollapsed && (
          <motion.div
            className="absolute bottom-0 left-0 right-0 p-4 border-t border-[#1dddf2]/20"
            variants={footerVariants}
            initial="collapsed"
            animate="expanded"
            exit="collapsed"
          >
            <motion.p
              className="text-xs text-gray-500 text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.05, duration: 0.15 }}
            >
              K-Hive Community
            </motion.p>
            <motion.p
              className="text-xs text-gray-600 text-center mt-1"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1, duration: 0.15 }}
            >
              v1.0.0
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );

  // Mobile sidebar
  const MobileSidebar = () => (
    <>
      {/* Overlay */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            className="lg:hidden fixed inset-0 bg-black/60 z-40 backdrop-blur-sm"
            onClick={onMobileClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            className="lg:hidden fixed left-0 top-0 h-full w-64 bg-[#0d1d2c] border-r border-[#1dddf2]/20 z-50"
            initial={{ x: -256 }}
            animate={{ x: 0 }}
            exit={{ x: -256 }}
            transition={{
              type: "spring",
              stiffness: 400,
              damping: 35
            }}
          >
            {/* Header */}
            <motion.div
              className="flex items-center justify-between p-4 border-b border-[#1dddf2]/20"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05, duration: 0.2 }}
            >
              <img src="/KHive/k-logo2.png" alt="K-Hive" className="h-8 sm:h-10 md:h-12 w-auto object-contain" />
              <motion.button
                onClick={onMobileClose}
                className="p-2 text-gray-400 hover:text-white hover:bg-[#1a2f3f] rounded-lg transition-all"
                whileHover={{ scale: 1.08, rotate: 90 }}
                whileTap={{ scale: 0.92 }}
                transition={{ duration: 0.15 }}
              >
                <X className="w-5 h-5" />
              </motion.button>
            </motion.div>

            {/* Menu Items */}
            <nav className="px-2 py-4 space-y-1">
              {menuItems.map((item, index) => {
                const Icon = item.icon;
                const active = isActive(item.path);

                return (
                  <motion.button
                    key={item.path}
                    onClick={() => handleNavigation(item.path)}
                    className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-colors duration-150 relative overflow-hidden ${
                      active
                        ? "bg-[#1dddf2]/10 text-[#1dddf2]"
                        : "text-gray-400 hover:bg-[#1a2f3f] hover:text-gray-200"
                    }`}
                    custom={index}
                    variants={menuItemVariants}
                    initial="hidden"
                    animate="visible"
                    whileHover={{ x: 3 }}
                    whileTap={{ scale: 0.98 }}
                    transition={{ duration: 0.15 }}
                  >
                    <Icon
                      className={`w-5 h-5 flex-shrink-0 transition-transform duration-150 ${
                        active ? "text-[#1dddf2]" : ""
                      }`}
                    />
                    <span className="font-medium text-sm">{item.label}</span>
                    
                    <AnimatePresence mode="wait">
                      {active && (
                        <motion.div
                          className="absolute left-0 top-0 bottom-0 w-1 bg-[#1dddf2] rounded-r-full origin-center"
                          variants={activeIndicatorVariants}
                          initial="initial"
                          animate="animate"
                          exit="exit"
                          layoutId="mobileActiveIndicator"
                          transition={{ duration: 0.2, ease: "easeInOut" }}
                        />
                      )}
                    </AnimatePresence>
                  </motion.button>
                );
              })}
            </nav>

            {/* Footer */}
            <motion.div
              className="absolute bottom-0 left-0 right-0 p-4 border-t border-[#1dddf2]/20"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.2 }}
            >
              <p className="text-xs text-gray-500 text-center">
                K-Hive Community
              </p>
              <p className="text-xs text-gray-600 text-center mt-1">v1.0.0</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );

  return (
    <>
      <DesktopSidebar />
      <MobileSidebar />
    </>
  );
}