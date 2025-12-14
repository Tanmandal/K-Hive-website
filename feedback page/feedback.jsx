"use client";
import React, { useState } from "react";
import { Home, MessageSquare, Send, CheckCircle } from "lucide-react";

export default function FeedbackPage() {
  const [formData, setFormData] = useState({
    name: "",
    subject: "",
    feedback: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.subject || !formData.feedback) {
      return;
    }
    
    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setIsSubmitting(false);
    setIsSubmitted(true);
    
    // Reset form after 3 seconds
    setTimeout(() => {
      setFormData({ name: "", subject: "", feedback: "" });
      setIsSubmitted(false);
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-[#020d17]">
      {/* Top Navigation Bar */}
      <nav className="bg-[#0d1d2c] border-b border-[#343536] sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-[#1dddf2] to-[#0088cc] rounded-lg flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-white">Community</span>
            </div>

            {/* Navigation Links */}
            <div className="flex items-center gap-4">
              <button className="flex items-center gap-2 px-4 py-2 text-gray-400 hover:text-white hover:bg-[#272729] rounded-lg transition-all">
                <Home className="w-5 h-5" />
                <span className="hidden sm:inline font-semibold">Home</span>
              </button>
              <button className="flex items-center gap-2 px-4 py-2 bg-[#1dddf2] text-[#020d17] rounded-lg hover:bg-[#18b8cc] transition-all font-semibold">
                Feedback
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-[#1dddf2] to-[#0088cc] rounded-full mb-6">
            <MessageSquare className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Your Feedback Matters!
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            We value your thoughts and suggestions. Help us improve by sharing your feedback.
          </p>
        </div>

        {/* Feedback Form Card */}
        <div className="bg-[#0d1d2c] border border-[#343536] rounded-lg p-6 sm:p-8 md:p-10 shadow-xl">
          {isSubmitted ? (
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-green-500/20 rounded-full mb-6">
                <CheckCircle className="w-10 h-10 text-green-500" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-3">
                Thank You!
              </h2>
              <p className="text-gray-400 text-lg">
                Your feedback has been submitted successfully.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Name Field */}
              <div>
                <label className="block text-white font-semibold text-lg mb-3">
                  Name:
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-[#1a1a1b] border border-gray-700 rounded-lg text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#1dddf2] focus:border-transparent transition-all"
                  placeholder="Enter your name"
                  disabled={isSubmitting}
                />
              </div>

              {/* Subject Field */}
              <div>
                <label className="block text-white font-semibold text-lg mb-3">
                  Subject:
                </label>
                <input
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-[#1a1a1b] border border-gray-700 rounded-lg text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#1dddf2] focus:border-transparent transition-all"
                  placeholder="What's this about?"
                  disabled={isSubmitting}
                />
              </div>

              {/* Feedback Field */}
              <div>
                <label className="block text-white font-semibold text-lg mb-3">
                  Your Feedback:
                </label>
                <textarea
                  name="feedback"
                  value={formData.feedback}
                  onChange={handleChange}
                  rows="6"
                  className="w-full px-4 py-3 bg-[#1a1a1b] border border-gray-700 rounded-lg text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#1dddf2] focus:border-transparent transition-all resize-none"
                  placeholder="Share your thoughts, suggestions, or concerns..."
                  disabled={isSubmitting}
                />
              </div>

              {/* Submit Button */}
              <button
                onClick={handleSubmit}
                disabled={isSubmitting || !formData.name || !formData.subject || !formData.feedback}
                className="w-full px-6 py-4 bg-[#1dddf2] text-[#020d17] font-bold text-lg rounded-lg hover:bg-[#18b8cc] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-lg"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[#020d17]"></div>
                    <span>Submitting...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    <span>Submit Feedback</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        {/* Additional Info */}
        <div className="mt-8 text-center">
          <p className="text-gray-500 text-sm">
            Your privacy is important to us. All feedback is kept confidential.
          </p>
        </div>
      </div>
    </div>
  );
}