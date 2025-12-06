'use client';

import React, { useState, useEffect } from "react";
import Navbar from "./components/Navbar";
import Hero from "./components/hero";
import SignUpModal from "./components/sign-up";

export default function Page() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Automatically open modal after hero loads
  useEffect(() => {
    setIsModalOpen(true);
  }, []);

  return (
    <div>
      <Navbar />
      <Hero />
      <SignUpModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}
