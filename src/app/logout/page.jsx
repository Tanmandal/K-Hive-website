"use client";
import { useEffect, useRef } from "react";
import { useLogout } from "@/lib/hooks/useAuth";

export default function LogoutPage() {
  const { mutate: logout } = useLogout();
  const called = useRef(false);

  useEffect(() => {
    if (called.current) return;
    called.current = true;
    logout();
  }, [logout]);

  return (
    <div className="min-h-screen bg-[#020d17] flex items-center justify-center px-4">
      <div className="text-center max-w-md w-full">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-4">
          Signing out...
        </h1>
        <p className="text-gray-400 text-md sm:text-lg mb-8">
          You are being logged out of K-Hive
        </p>
        <div className="flex justify-center gap-2 mt-8">
          <div className="w-2 h-2 bg-[#1dddf2] rounded-full animate-bounce"></div>
          <div
            className="w-2 h-2 bg-[#1dddf2] rounded-full animate-bounce"
            style={{ animationDelay: "0.1s" }}
          ></div>
          <div
            className="w-2 h-2 bg-[#1dddf2] rounded-full animate-bounce"
            style={{ animationDelay: "0.2s" }}
          ></div>
        </div>
      </div>
    </div>
  );
}
