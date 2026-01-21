import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import type { FeedbackStore, Feedback } from '../types/feedback'

const initialState = {
  pendingFeedback: null,
  feedbackHistory: [],
  submitting: false,
  error: null,
}

export const useFeedbackStore = create<FeedbackStore>()(
  devtools(
    (set, get) => ({
      ...initialState,

      // Initialize feedback for a specific content
      startFeedback: (contentId, contentType) => {
        const newFeedback: Partial<Feedback> = {
          generationId: contentId,
          metadata: { contentType },
          rating: 0,
          tags: [],
          comment: '',
        }
        set(
          (state) => ({ ...state, pendingFeedback: newFeedback as Feedback }),
          false,
          'startFeedback'
        )
      },

      // Set rating (thumbs up = 1, thumbs down = -1)
      setRating: (rating) => {
        set(
          (state) => ({
            ...state,
            pendingFeedback: state.pendingFeedback
              ? { ...state.pendingFeedback, rating }
              : null,
          }),
          false,
          'setRating'
        )
      },

      // Toggle a tag in the tags array
      toggleTag: (tag) => {
        set(
          (state) => {
            if (!state.pendingFeedback) return state

            const currentTags = state.pendingFeedback.tags || []
            const newTags = currentTags.includes(tag)
              ? currentTags.filter(t => t !== tag)
              : [...currentTags, tag]

            return {
              ...state,
              pendingFeedback: {
                ...state.pendingFeedback,
                tags: newTags,
              },
            }
          },
          false,
          'toggleTag'
        )
      },

      // Set text feedback (comment)
      setTextFeedback: (text) => {
        set(
          (state) => ({
            ...state,
            pendingFeedback: state.pendingFeedback
              ? { ...state.pendingFeedback, comment: text }
              : null,
          }),
          false,
          'setTextFeedback'
        )
      },

      setPendingFeedback: (feedback) =>
        set(
          (state) => ({ ...state, pendingFeedback: feedback }),
          false,
          'setPendingFeedback'
        ),

      addToHistory: (feedback) =>
        set(
          (state) => ({
            ...state,
            feedbackHistory: [...state.feedbackHistory, feedback],
          }),
          false,
          'addToHistory'
        ),

      // Submit the pending feedback
      submitFeedback: async () => {
        const { pendingFeedback } = get()

        if (!pendingFeedback) {
          console.warn('No pending feedback to submit')
          return
        }

        set({ submitting: true, error: null }, false, 'submitFeedback:start')

        try {
          // Create feedback with generated ID and timestamp
          const feedback: Feedback = {
            ...pendingFeedback,
            id: `feedback-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
            createdAt: new Date(),
          }

          // Simulate API call (replace with actual API call later)
          await new Promise((resolve) => setTimeout(resolve, 500))

          // Move pending to history and clear pending
          set(
            (state) => ({
              ...state,
              feedbackHistory: [...state.feedbackHistory, feedback],
              pendingFeedback: null,
              submitting: false,
              error: null,
            }),
            false,
            'submitFeedback:success'
          )
        } catch (error) {
          set(
            {
              submitting: false,
              error: error instanceof Error ? error.message : 'Failed to submit feedback',
            },
            false,
            'submitFeedback:error'
          )
          throw error
        }
      },

      clearPendingFeedback: () =>
        set(
          (state) => ({ ...state, pendingFeedback: null }),
          false,
          'clearPendingFeedback'
        ),

      clearHistory: () =>
        set(
          (state) => ({ ...state, feedbackHistory: [] }),
          false,
          'clearHistory'
        ),

      setSubmitting: (submitting) =>
        set((state) => ({ ...state, submitting }), false, 'setSubmitting'),

      setError: (error) =>
        set((state) => ({ ...state, error }), false, 'setError'),

      reset: () => set(initialState, false, 'reset'),
    }),
    {
      name: 'feedback-store',
    }
  )
)