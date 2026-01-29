'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  ArrowLeft,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Video,
  Image,
  MessageSquare,
  Camera,
  Loader2,
  Plus
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { LTRFL_BRAND_COLORS } from '@/types/ltrfl'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

type ContentType = 'video_ad' | 'image_ad' | 'social_post' | 'product_photo'

interface ScheduledContent {
  id: string
  content_type: ContentType
  title: string | null
  status: string
  scheduled_date: string
  platform: string | null
}

const contentTypeConfig: Record<ContentType, { icon: React.ElementType; color: string }> = {
  video_ad: { icon: Video, color: '#9333EA' },
  image_ad: { icon: Image, color: '#2563EB' },
  social_post: { icon: MessageSquare, color: '#16A34A' },
  product_photo: { icon: Camera, color: '#EA580C' }
}

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
]

export default function ContentCalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [content, setContent] = useState<ScheduledContent[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()

  useEffect(() => {
    loadContent()
  }, [month, year])

  async function loadContent() {
    setLoading(true)
    try {
      // In production, filter by date range
      const res = await fetch('/api/ltrfl/marketing?limit=100')
      if (res.ok) {
        const data = await res.json()
        // Filter to only scheduled content
        setContent(data.filter((item: ScheduledContent) => item.scheduled_date))
      }
    } catch (error) {
      toast.error('Failed to load calendar content')
    } finally {
      setLoading(false)
    }
  }

  function goToPreviousMonth() {
    setCurrentDate(new Date(year, month - 1, 1))
  }

  function goToNextMonth() {
    setCurrentDate(new Date(year, month + 1, 1))
  }

  function goToToday() {
    setCurrentDate(new Date())
  }

  // Get calendar data
  const firstDayOfMonth = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const daysInPrevMonth = new Date(year, month, 0).getDate()

  // Build calendar grid
  const calendarDays: { date: Date; isCurrentMonth: boolean }[] = []

  // Previous month days
  for (let i = firstDayOfMonth - 1; i >= 0; i--) {
    calendarDays.push({
      date: new Date(year, month - 1, daysInPrevMonth - i),
      isCurrentMonth: false
    })
  }

  // Current month days
  for (let i = 1; i <= daysInMonth; i++) {
    calendarDays.push({
      date: new Date(year, month, i),
      isCurrentMonth: true
    })
  }

  // Next month days
  const remainingDays = 42 - calendarDays.length // 6 rows * 7 days
  for (let i = 1; i <= remainingDays; i++) {
    calendarDays.push({
      date: new Date(year, month + 1, i),
      isCurrentMonth: false
    })
  }

  function getContentForDate(date: Date): ScheduledContent[] {
    return content.filter(item => {
      if (!item.scheduled_date) return false
      const itemDate = new Date(item.scheduled_date)
      return (
        itemDate.getFullYear() === date.getFullYear() &&
        itemDate.getMonth() === date.getMonth() &&
        itemDate.getDate() === date.getDate()
      )
    })
  }

  function isToday(date: Date): boolean {
    const today = new Date()
    return (
      date.getFullYear() === today.getFullYear() &&
      date.getMonth() === today.getMonth() &&
      date.getDate() === today.getDate()
    )
  }

  function isSelected(date: Date): boolean {
    if (!selectedDate) return false
    return (
      date.getFullYear() === selectedDate.getFullYear() &&
      date.getMonth() === selectedDate.getMonth() &&
      date.getDate() === selectedDate.getDate()
    )
  }

  const selectedDateContent = selectedDate ? getContentForDate(selectedDate) : []

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link href="/ltrfl/marketing">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div className="flex items-center gap-3 flex-1">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: `${LTRFL_BRAND_COLORS.sage}20` }}
          >
            <Calendar className="w-5 h-5" style={{ color: LTRFL_BRAND_COLORS.sage }} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">Content Calendar</h1>
            <p className="text-sm text-muted-foreground">Schedule and manage your content</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Calendar */}
        <div className="lg:col-span-3">
          <div className="bg-[color:var(--surface)] border border-[color:var(--surface-border)] rounded-lg overflow-hidden">
            {/* Month Navigation */}
            <div className="flex items-center justify-between p-4 border-b border-[color:var(--surface-border)]">
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" onClick={goToPreviousMonth}>
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={goToNextMonth}>
                  <ChevronRight className="w-4 h-4" />
                </Button>
                <h2 className="text-lg font-semibold text-foreground ml-2">
                  {MONTHS[month]} {year}
                </h2>
              </div>
              <Button variant="secondary" size="sm" onClick={goToToday}>
                Today
              </Button>
            </div>

            {/* Day Headers */}
            <div className="grid grid-cols-7 border-b border-[color:var(--surface-border)]">
              {DAYS.map((day) => (
                <div
                  key={day}
                  className="p-2 text-center text-sm font-medium text-muted-foreground"
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Grid */}
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin" style={{ color: LTRFL_BRAND_COLORS.sage }} />
              </div>
            ) : (
              <div className="grid grid-cols-7">
                {calendarDays.map((day, index) => {
                  const dayContent = getContentForDate(day.date)
                  const today = isToday(day.date)
                  const selected = isSelected(day.date)

                  return (
                    <button
                      key={index}
                      onClick={() => setSelectedDate(day.date)}
                      className={cn(
                        "min-h-[100px] p-2 border-b border-r border-[color:var(--surface-border)] text-left transition-colors",
                        !day.isCurrentMonth && "bg-[color:var(--surface-muted)] opacity-50",
                        selected && "bg-[#9CAF88]/10",
                        "hover:bg-[color:var(--surface-muted)]"
                      )}
                    >
                      <div
                        className={cn(
                          "w-7 h-7 flex items-center justify-center rounded-full text-sm mb-1",
                          today && "bg-[#9CAF88] text-white font-bold",
                          selected && !today && "ring-2 ring-[#9CAF88]"
                        )}
                      >
                        {day.date.getDate()}
                      </div>

                      {/* Content Dots */}
                      <div className="space-y-1">
                        {dayContent.slice(0, 3).map((item) => {
                          const config = contentTypeConfig[item.content_type]
                          const Icon = config.icon as React.ComponentType<{ className?: string; style?: React.CSSProperties }>
                          return (
                            <div
                              key={item.id}
                              className="flex items-center gap-1 text-xs truncate"
                              style={{ color: config.color }}
                            >
                              <Icon className="w-3 h-3 flex-shrink-0" />
                              <span className="truncate">{item.title || 'Untitled'}</span>
                            </div>
                          )
                        })}
                        {dayContent.length > 3 && (
                          <p className="text-xs text-muted-foreground">
                            +{dayContent.length - 3} more
                          </p>
                        )}
                      </div>
                    </button>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar - Selected Date Details */}
        <div className="lg:col-span-1">
          <div className="bg-[color:var(--surface)] border border-[color:var(--surface-border)] rounded-lg p-4 sticky top-6">
            {selectedDate ? (
              <>
                <h3 className="font-semibold text-foreground mb-1">
                  {selectedDate.toLocaleDateString('en-US', {
                    weekday: 'long',
                    month: 'long',
                    day: 'numeric'
                  })}
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {selectedDateContent.length} item{selectedDateContent.length !== 1 ? 's' : ''} scheduled
                </p>

                {selectedDateContent.length > 0 ? (
                  <div className="space-y-2">
                    {selectedDateContent.map((item) => {
                      const config = contentTypeConfig[item.content_type]
                      const Icon = config.icon as React.ComponentType<{ className?: string; style?: React.CSSProperties }>
                      return (
                        <Link
                          key={item.id}
                          href={`/ltrfl/marketing/${item.id}`}
                          className="block p-3 rounded-lg border border-[color:var(--surface-border)] hover:border-[#9CAF88]/50 transition-colors"
                        >
                          <div className="flex items-center gap-2">
                            <Icon className="w-4 h-4" style={{ color: config.color }} />
                            <span className="font-medium text-foreground text-sm truncate">
                              {item.title || 'Untitled'}
                            </span>
                          </div>
                          {item.platform && (
                            <p className="text-xs text-muted-foreground mt-1 capitalize">
                              {item.platform}
                            </p>
                          )}
                        </Link>
                      )
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Calendar className="w-10 h-10 text-muted-foreground opacity-30 mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">
                      No content scheduled
                    </p>
                  </div>
                )}

                <Button
                  className="w-full mt-4 text-white"
                  style={{ backgroundColor: LTRFL_BRAND_COLORS.sage }}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Schedule Content
                </Button>
              </>
            ) : (
              <div className="text-center py-8">
                <Calendar className="w-10 h-10 text-muted-foreground opacity-30 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">
                  Select a date to view scheduled content
                </p>
              </div>
            )}
          </div>

          {/* Legend */}
          <div className="bg-[color:var(--surface)] border border-[color:var(--surface-border)] rounded-lg p-4 mt-4">
            <h4 className="text-sm font-medium text-foreground mb-3">Content Types</h4>
            <div className="space-y-2">
              {Object.entries(contentTypeConfig).map(([type, config]) => {
                const Icon = config.icon as React.ComponentType<{ className?: string; style?: React.CSSProperties }>
                const labels: Record<string, string> = {
                  video_ad: 'Video Ads',
                  image_ad: 'Image Ads',
                  social_post: 'Social Posts',
                  product_photo: 'Product Photos'
                }
                return (
                  <div key={type} className="flex items-center gap-2 text-sm">
                    <Icon className="w-4 h-4" style={{ color: config.color }} />
                    <span className="text-muted-foreground">{labels[type]}</span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
