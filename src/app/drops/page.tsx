'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Calendar, Globe, Sparkles } from 'lucide-react'

interface City {
  id: string
  name: string
  country?: string | null
}

export default function DropsPage() {
  const [cities, setCities] = useState<City[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const response = await fetch('/api/cities')
        if (response.ok) {
          const data = await response.json()
          setCities(Array.isArray(data) ? data : data.cities || [])
        }
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [])

  const dropCities = cities.slice(0, 3)

  return (
    <div className="mx-auto flex h-full max-w-6xl flex-col gap-6">
      <div>
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Drops</p>
        <h1 className="text-3xl font-bold text-foreground">Launch Calendar</h1>
        <p className="text-sm text-muted-foreground">Manage multi-city drops and launch operations.</p>
      </div>

      {loading && (
        <div className="surface rounded-xl p-6 text-muted-foreground">Loading drops...</div>
      )}

      {!loading && cities.length === 0 && (
        <div className="surface rounded-xl p-6 text-muted-foreground">
          Add cities to activate your first drop.
        </div>
      )}

      {!loading && cities.length > 0 && (
        <div className="surface rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-foreground">Drop 1</h2>
              <p className="text-xs text-muted-foreground">Draft · {dropCities.length} cities</p>
            </div>
            <Link
              href="/drops/drop-1"
              className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
            >
              Open Drop
            </Link>
          </div>
          <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
            {dropCities.map((city) => (
              <div key={city.id} className="rounded-lg border border-[color:var(--surface-border)] bg-[color:var(--surface-muted)] p-4">
                <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                  <Globe className="h-4 w-4 text-primary" />
                  {city.name}
                </div>
                <p className="mt-1 text-xs text-muted-foreground">{city.country || 'City'}</p>
              </div>
            ))}
          </div>
          <div className="mt-4 flex items-center gap-3 text-xs text-muted-foreground">
            <Calendar className="h-4 w-4" />
            Launch date not set
            <Sparkles className="h-4 w-4 text-primary" />
            Social ideas pending
          </div>
        </div>
      )}
    </div>
  )
}
