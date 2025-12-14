// src/lib/hooks/useFeedback.js
import { useMutation } from '@tanstack/react-query';
import api from '../api/client';

// Submit feedback mutation
export const useSubmitFeedback = () => {
  return useMutation({
    mutationFn: async (feedbackData) => {
      const response = await api.post('/feedback', {
        content: feedbackData.feedback,
      });
      return response.data;
    },
    onSuccess: (data) => {
      console.log('Feedback submitted successfully:', data);
    },
    onError: (error) => {
      console.error('Error submitting feedback:', error);
    },
  });
};