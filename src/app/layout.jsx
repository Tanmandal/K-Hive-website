// src/app/layout.jsx
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { QueryProvider } from "@/providers/QueryProvider";
import ClientLayout from "@/components/ClientLayout";
import ScrollToTop from "@/components/scrollToTop";
import { Toaster } from "react-hot-toast";
import DisableDevtools from "@/components/DisableDevtools";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "KHive - The KIIT Community Forum",
  description: "KHive is a community forum for KIIT students to discuss various topics related to the KIIT community.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <QueryProvider>
           <DisableDevtools />
            <ClientLayout>
              <ScrollToTop />
              {children}
              <Toaster
                position="bottom-right"
                toastOptions={{
                  duration: 3000,
                }}
              />
            </ClientLayout>
        </QueryProvider>
      </body>
    </html>
  );
}