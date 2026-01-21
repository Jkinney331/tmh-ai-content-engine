export interface Feedback {
  id: string
  generationId: string
  rating: number
  comment?: string
  tags?: string[]
  createdAt: Date
  updatedAt?: Date
  userId?: string
  metadata?: Record<string, any>
}

export interface FeedbackState {
  pendingFeedback: Feedback | null
  feedbackHistory: Feedback[]
  submitting: boolean
  error: string | null
}

export interface FeedbackActions {
  startFeedback: (contentId: string, contentType: string) => void
  setRating: (rating: number) => void
  toggleTag: (tag: string) => void
  setTextFeedback: (text: string) => void
  setPendingFeedback: (feedback: Feedback | null) => void
  addToHistory: (feedback: Feedback) => void
  submitFeedback: () => Promise<void>
  clearPendingFeedback: () => void
  clearHistory: () => void
  setSubmitting: (submitting: boolean) => void
  setError: (error: string | null) => void
  reset: () => void
}

export type FeedbackStore = FeedbackState & FeedbackActions