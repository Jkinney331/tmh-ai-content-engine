import { supabase } from './supabase'

interface PreferenceWeights {
  modelPreferences: Record<string, number>
  tagPreferences: Record<string, number>
  cityPreferences: Record<string, number>
}

interface CacheEntry {
  data: PreferenceWeights
  timestamp: number
}

const CACHE_DURATION_MS = 60 * 60 * 1000 // 1 hour in milliseconds
const preferencesCache: Map<string, CacheEntry> = new Map()

export async function calculatePreferences(userId: string): Promise<PreferenceWeights> {
  // Check cache first
  const cacheKey = userId
  const cachedEntry = preferencesCache.get(cacheKey)

  if (cachedEntry) {
    const now = Date.now()
    if (now - cachedEntry.timestamp < CACHE_DURATION_MS) {
      return cachedEntry.data
    }
    // Cache expired, remove it
    preferencesCache.delete(cacheKey)
  }

  try {
    // Query feedback table for user's feedback
    const { data: feedbackData, error: feedbackError } = await supabase
      .from('feedback')
      .select('*')
      .eq('created_by', userId)

    if (feedbackError) {
      console.error('Error fetching feedback:', feedbackError)
      // Return default preferences if error
      return getDefaultPreferences()
    }

    // If no feedback data, return default preferences
    if (!feedbackData || feedbackData.length === 0) {
      const defaultPrefs = getDefaultPreferences()
      cachePreferences(cacheKey, defaultPrefs)
      return defaultPrefs
    }

    // Get content details for model preferences
    const contentIds = [...new Set((feedbackData as any).map((f: any) => f.content_id))]

    const { data: generatedContent, error: contentError } = await supabase
      .from('generated_content')
      .select('id, model_used, city_id')
      .in('id', contentIds)

    if (contentError) {
      console.error('Error fetching generated content:', contentError)
    }

    // Calculate model preferences
    const modelPreferences: Record<string, number> = {}
    const modelCounts: Record<string, { positive: number; negative: number }> = {}

    if (generatedContent) {
      (feedbackData as any).forEach((feedback: any) => {
        const content = (generatedContent as any).find((c: any) => c.id === feedback.content_id)
        if (content && content.model_used) {
          if (!modelCounts[content.model_used]) {
            modelCounts[content.model_used] = { positive: 0, negative: 0 }
          }

          if (feedback.rating === 'thumbs_up') {
            modelCounts[content.model_used].positive++
          } else if (feedback.rating === 'thumbs_down') {
            modelCounts[content.model_used].negative++
          }
        }
      })

      // Calculate weighted scores for models
      Object.entries(modelCounts).forEach(([model, counts]) => {
        const total = counts.positive + counts.negative
        if (total > 0) {
          // Weight calculation: positive feedback increases score, negative decreases
          // Score ranges from -1 to 1, normalized to 0 to 1
          const rawScore = (counts.positive - counts.negative) / total
          modelPreferences[model] = (rawScore + 1) / 2
        }
      })
    }

    // Calculate tag preferences
    const tagPreferences: Record<string, number> = {}
    const tagCounts: Record<string, { positive: number; negative: number }> = {} as Record<string, { positive: number; negative: number }>

    (feedbackData as any).forEach((feedback: any) => {
      if (feedback.tags && Array.isArray(feedback.tags)) {
        feedback.tags.forEach((tag: string) => {
          if (!tagCounts[tag]) {
            tagCounts[tag] = { positive: 0, negative: 0 }
          }

          if (feedback.rating === 'thumbs_up') {
            tagCounts[tag].positive++
          } else if (feedback.rating === 'thumbs_down') {
            tagCounts[tag].negative++
          }
        })
      }
    })

    // Calculate weighted scores for tags
    Object.entries(tagCounts).forEach(([tag, counts]) => {
      const total = counts.positive + counts.negative
      if (total > 0) {
        const rawScore = (counts.positive - counts.negative) / total
        tagPreferences[tag] = (rawScore + 1) / 2
      }
    })

    // Calculate city preferences
    const cityPreferences: Record<string, number> = {}
    const cityCounts: Record<string, { positive: number; negative: number }> = {}

    if (generatedContent) {
      (feedbackData as any).forEach((feedback: any) => {
        const content = (generatedContent as any).find((c: any) => c.id === feedback.content_id)
        if (content && content.city_id) {
          if (!cityCounts[content.city_id]) {
            cityCounts[content.city_id] = { positive: 0, negative: 0 }
          }

          if (feedback.rating === 'thumbs_up') {
            cityCounts[content.city_id].positive++
          } else if (feedback.rating === 'thumbs_down') {
            cityCounts[content.city_id].negative++
          }
        }
      })

      // Calculate weighted scores for cities
      Object.entries(cityCounts).forEach(([cityId, counts]) => {
        const total = counts.positive + counts.negative
        if (total > 0) {
          const rawScore = (counts.positive - counts.negative) / total
          cityPreferences[cityId] = (rawScore + 1) / 2
        }
      })
    }

    // Handle comparison feedback for additional weighting
    const comparisonFeedback = (feedbackData as any).filter((f: any) => f.comparison_winner === true)

    if (comparisonFeedback.length > 0 && generatedContent) {
      comparisonFeedback.forEach((feedback: any) => {
        const winnerContent = (generatedContent as any).find((c: any) => c.id === feedback.content_id)
        const loserContent = (generatedContent as any).find((c: any) => c.id === feedback.competitor_content_id)

        // Boost winner model, decrease loser model
        if (winnerContent?.model_used) {
          modelPreferences[winnerContent.model_used] = Math.min(
            (modelPreferences[winnerContent.model_used] || 0.5) + 0.1,
            1.0
          )
        }
        if (loserContent?.model_used) {
          modelPreferences[loserContent.model_used] = Math.max(
            (modelPreferences[loserContent.model_used] || 0.5) - 0.1,
            0.0
          )
        }
      })
    }

    const preferences: PreferenceWeights = {
      modelPreferences,
      tagPreferences,
      cityPreferences
    }

    // Cache the result
    cachePreferences(cacheKey, preferences)

    return preferences
  } catch (error) {
    console.error('Error calculating preferences:', error)
    return getDefaultPreferences()
  }
}

function cachePreferences(key: string, data: PreferenceWeights): void {
  preferencesCache.set(key, {
    data,
    timestamp: Date.now()
  })
}

function getDefaultPreferences(): PreferenceWeights {
  return {
    modelPreferences: {},
    tagPreferences: {},
    cityPreferences: {}
  }
}

// Helper function to clear cache for a specific user
export function clearPreferencesCache(userId?: string): void {
  if (userId) {
    preferencesCache.delete(userId)
  } else {
    // Clear entire cache
    preferencesCache.clear()
  }
}

// Helper function to get cache statistics
export function getCacheStats(): { size: number; keys: string[] } {
  return {
    size: preferencesCache.size,
    keys: Array.from(preferencesCache.keys())
  }
}