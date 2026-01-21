'use client'

import React, { useState } from 'react'

const POSITIVE_TAGS = [
  'Accurate',
  'Creative',
  'Engaging',
  'Well-written',
  'Informative',
  'Entertaining',
  'Professional',
  'Original',
  'Compelling',
  'On-brand'
]

const NEGATIVE_TAGS = [
  'Inaccurate',
  'Generic',
  'Boring',
  'Poorly-written',
  'Confusing',
  'Off-topic',
  'Unprofessional',
  'Repetitive',
  'Too long',
  'Off-brand'
]

interface FeedbackPanelProps {
  contentId: string
  contentType: 'design' | 'generated_content' | 'city_element' | 'approval'
  comparisonWinner?: boolean
  onSubmit?: (feedback: {
    rating: 'up' | 'down' | null
    tags: string[]
    comment: string
  }) => void
}

export default function FeedbackPanel({
  contentId,
  contentType,
  comparisonWinner = false,
  onSubmit
}: FeedbackPanelProps) {
  const [rating, setRating] = useState<'up' | 'down' | null>(null)
  const [selectedTags, setSelectedTags] = useState<Set<string>>(new Set())
  const [comment, setComment] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitMessage, setSubmitMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  const handleTagToggle = (tag: string) => {
    const newTags = new Set(selectedTags)
    if (newTags.has(tag)) {
      newTags.delete(tag)
    } else {
      newTags.add(tag)
    }
    setSelectedTags(newTags)
  }

  const handleSubmit = async () => {
    if (!rating) {
      setSubmitMessage({ type: 'error', text: 'Please select a rating' })
      return
    }

    setIsSubmitting(true)
    setSubmitMessage(null)

    try {
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contentId,
          contentType,
          rating: rating === 'up' ? 'thumbs_up' : 'thumbs_down',
          tags: Array.from(selectedTags),
          textFeedback: comment,
          comparisonWinner
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit feedback')
      }

      // Show success message
      setSubmitMessage({ type: 'success', text: 'Design saved!' })

      // Call optional onSubmit callback
      if (onSubmit) {
        onSubmit({
          rating,
          tags: Array.from(selectedTags),
          comment
        })
      }

      // Reset form after successful submission
      setTimeout(() => {
        setRating(null)
        setSelectedTags(new Set())
        setComment('')
        setSubmitMessage(null)
      }, 2000)
    } catch (error) {
      console.error('Error submitting feedback:', error)
      setSubmitMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Failed to submit feedback'
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const displayTags = rating === 'up' ? POSITIVE_TAGS : rating === 'down' ? NEGATIVE_TAGS : []

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Provide Feedback</h3>

      {/* Thumbs up/down toggle */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => setRating(rating === 'up' ? null : 'up')}
          className={`flex items-center justify-center w-12 h-12 rounded-lg border-2 transition-all ${
            rating === 'up'
              ? 'bg-green-500 border-green-500 text-white'
              : 'bg-white border-gray-300 text-gray-600 hover:border-green-500'
          }`}
          aria-label="Thumbs up"
        >
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
            <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
          </svg>
        </button>

        <button
          onClick={() => setRating(rating === 'down' ? null : 'down')}
          className={`flex items-center justify-center w-12 h-12 rounded-lg border-2 transition-all ${
            rating === 'down'
              ? 'bg-red-500 border-red-500 text-white'
              : 'bg-white border-gray-300 text-gray-600 hover:border-red-500'
          }`}
          aria-label="Thumbs down"
        >
          <svg className="w-6 h-6 rotate-180" fill="currentColor" viewBox="0 0 20 20">
            <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
          </svg>
        </button>

        <span className="text-sm text-gray-600">
          {rating === 'up' ? 'Liked it!' : rating === 'down' ? 'Needs improvement' : 'Rate this content'}
        </span>
      </div>

      {/* Tag checkboxes */}
      {rating && (
        <div className="mb-6">
          <p className="text-sm font-medium text-gray-700 mb-3">
            What specifically did you {rating === 'up' ? 'like' : 'dislike'}?
          </p>
          <div className="grid grid-cols-2 gap-2">
            {displayTags.map((tag) => (
              <label
                key={tag}
                className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-2 rounded"
              >
                <input
                  type="checkbox"
                  checked={selectedTags.has(tag)}
                  onChange={() => handleTagToggle(tag)}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">{tag}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Text input */}
      <div className="mb-6">
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Any specific feedback?"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
          rows={3}
        />
      </div>

      {/* Submit button */}
      <button
        onClick={handleSubmit}
        disabled={isSubmitting || (!rating && selectedTags.size === 0 && !comment)}
        className="w-full px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
      >
        {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
      </button>

      {/* Success/Error message */}
      {submitMessage && (
        <div
          className={`mt-4 p-3 rounded-lg text-sm font-medium ${
            submitMessage.type === 'success'
              ? 'bg-green-100 text-green-700 border border-green-300'
              : 'bg-red-100 text-red-700 border border-red-300'
          }`}
        >
          {submitMessage.text}
        </div>
      )}
    </div>
  )
}