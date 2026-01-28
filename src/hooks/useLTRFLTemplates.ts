import { useEffect, useState } from 'react'
import { LTRFLTemplate } from '@/types/ltrfl'

interface UseLTRFLTemplatesOptions {
  category?: string | null
  subcategory?: string | null
  search?: string
  page?: number
  pageSize?: number
}

interface UseLTRFLTemplatesResult {
  templates: LTRFLTemplate[]
  total: number
  loading: boolean
  error: string | null
}

export function useLTRFLTemplates(options: UseLTRFLTemplatesOptions): UseLTRFLTemplatesResult {
  const [templates, setTemplates] = useState<LTRFLTemplate[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const { category, subcategory, search, page = 1, pageSize = 20 } = options

  useEffect(() => {
    let isMounted = true

    const load = async () => {
      try {
        setLoading(true)
        setError(null)

        const params = new URLSearchParams()
        if (category) params.set('category', category)
        if (subcategory) params.set('subcategory', subcategory)
        if (search) params.set('search', search)
        params.set('page', String(page))
        params.set('page_size', String(pageSize))
        params.set('include_count', 'true')

        const res = await fetch(`/api/ltrfl/templates?${params}`)
        if (!res.ok) {
          throw new Error('Failed to load templates')
        }

        const data = await res.json()
        if (!isMounted) return

        if (Array.isArray(data)) {
          setTemplates(data)
          setTotal(data.length)
        } else {
          setTemplates(data.data || [])
          setTotal(data.total || 0)
        }
      } catch (err) {
        if (!isMounted) return
        setError(err instanceof Error ? err.message : 'Failed to load templates')
        setTemplates([])
        setTotal(0)
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    load()

    return () => {
      isMounted = false
    }
  }, [category, subcategory, search, page, pageSize])

  return { templates, total, loading, error }
}
