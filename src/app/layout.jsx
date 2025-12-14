// src/app/layout.jsx
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { QueryProvider } from "@/providers/QueryProvider";
import { ToastProvider } from "@/components/Toast";
import ClientLayout from "@/components/ClientLayout";
import ScrollToTop from "@/components/scrollToTop";

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
            <ClientLayout>
              <ScrollToTop />
              {children}
            </ClientLayout>
          </ToastProvider>
        </QueryProvider>
      </body>
    </html>
  );
}