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
      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
            Your Feedback Matters!
          </h1>
          <p className="text-gray-400 text-md max-w-xl mx-auto">
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
              {/* Subject Field */}
              <div>
                <label className="block text-white font-semibold text-md mb-3">
                  Subject:
                </label>
                <input
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  className="text-sm w-full px-4 py-3 bg-[#1a1a1b] border border-gray-700 rounded-lg text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#1dddf2] focus:border-transparent transition-all"
                  placeholder="What's this about?"
                  disabled={isSubmitting}
                />
              </div>

              {/* Feedback Field */}
              <div>
                <label className="block text-white font-semibold text-md mb-3">
                  Your Feedback:
                </label>
                <textarea
                  name="feedback"
                  value={formData.feedback}
                  onChange={handleChange}
                  rows="6"
                  className="w-full text-sm px-4 py-3 bg-[#1a1a1b] border border-gray-700 rounded-lg text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#1dddf2] focus:border-transparent transition-all resize-none"
                  placeholder="Share your thoughts, suggestions, or concerns..."
                  disabled={isSubmitting}
                />
              </div>

              {/* Submit Button */}
              <button
                onClick={handleSubmit}
                disabled={isSubmitting || !formData.name || !formData.subject || !formData.feedback}
                className="w-full px-4 py-3 bg-[#1dddf2] text-[#020d17] font-bold text-md rounded-lg hover:bg-[#18b8cc] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-lg"
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