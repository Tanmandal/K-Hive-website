// src/app/layout.js
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { QueryProvider } from "@/providers/QueryProvider";
import { ToastProvider } from "@/components/Toast";
import RedditNavbar from "./components/Navbar";
import ScrollToTop from "@/components/scrollToTop";
import { Toaster } from "react-hot-toast";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "K-Hive - The KIIT Community Forum",
  description: "K-Hive is a community forum for KIIT students to discuss various topics related to the KIIT community.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <QueryProvider>
          <ToastProvider>
            <RedditNavbar />
            <ScrollToTop />
            {children}
             <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
          }}
        />
          </ToastProvider>
        </QueryProvider>
      </body>
    </html>
  );
}