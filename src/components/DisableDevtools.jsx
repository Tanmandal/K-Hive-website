"use client";

import { useEffect } from "react";
import useIsDevToolsOpen from 'react-devtools-detector';
import { useRouter } from "next/navigation";

export default function DisableDevtools() {
  const router = useRouter();
  
  // Only enable detection in production
  const isDevtoolsOpen = useIsDevToolsOpen({
    interval: 1000, // Check every second
    enabled: process.env.NODE_ENV === "production",
  });

  useEffect(() => {
    if (process.env.NODE_ENV === "production" && isDevtoolsOpen) {
      // Option 1: Redirect to a warning page
    //   router.push("/devtools-detected");
      
      // Option 2: Show alert and reload (uncomment to use)
      alert("Developer tools detected! For security reasons, this action is not allowed.");
      window.location.reload();
      
      // Option 3: Redirect to home (uncomment to use)
      // window.location.href = "/";
      
      // Option 4: Just clear the console repeatedly (uncomment to use)
      const interval = setInterval(() => {
        console.clear();
      }, 100);
      return () => clearInterval(interval);
    }
  }, [isDevtoolsOpen, router]);

  return null;
}