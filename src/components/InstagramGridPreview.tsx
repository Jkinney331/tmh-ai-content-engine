'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import Image from 'next/image'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'

interface GridPost {
  id: string
  image_url: string
  caption: string
  order_index: number
}

interface InstagramGridPreviewProps {
  posts: GridPost[]
  cityId?: string
  onOrderChange?: (posts: GridPost[]) => void
}

export default function InstagramGridPreview({
  posts: initialPosts,
  cityId,
  onOrderChange
}: InstagramGridPreviewProps) {
  const [posts, setPosts] = useState<GridPost[]>(initialPosts)
  const [draggedPost, setDraggedPost] = useState<GridPost | null>(null)
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [isLocking, setIsLocking] = useState(false)
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null)
  const dragImage = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setPosts(initialPosts.sort((a, b) => a.order_index - b.order_index))
  }, [initialPosts])

  const handleDragStart = useCallback((e: React.DragEvent, post: GridPost, index: number) => {
    setDraggedPost(post)
    setIsDragging(true)

    // Create custom drag image
    const dragImg = new (Image as any)()
    dragImg.src = post.image_url
    dragImg.style.width = '100px'
    dragImg.style.height = '100px'
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setDragImage(dragImg, 50, 50)

    // Add data for fallback
    e.dataTransfer.setData('text/plain', JSON.stringify({ post, index }))
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent, index: number) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    setDragOverIndex(index)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    // Only clear if leaving the grid entirely
    const relatedTarget = e.relatedTarget as HTMLElement
    if (!relatedTarget?.closest('.instagram-grid')) {
      setDragOverIndex(null)
    }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent, dropIndex: number) => {
    e.preventDefault()

    if (!draggedPost) return

    const draggedIndex = posts.findIndex(p => p.id === draggedPost.id)
    if (draggedIndex === dropIndex) {
      setDragOverIndex(null)
      return
    }

    // Reorder the posts
    const newPosts = [...posts]
    const [removed] = newPosts.splice(draggedIndex, 1)
    newPosts.splice(dropIndex, 0, removed)

    // Update order indices
    const reorderedPosts = newPosts.map((post, idx) => ({
      ...post,
      order_index: idx
    }))

    setPosts(reorderedPosts)
    onOrderChange?.(reorderedPosts)

    // Clean up drag state
    setDraggedPost(null)
    setDragOverIndex(null)
    setIsDragging(false)
  }, [draggedPost, posts, onOrderChange])

  const handleDragEnd = useCallback(() => {
    setDraggedPost(null)
    setDragOverIndex(null)
    setIsDragging(false)
  }, [])

  // Touch event handlers for mobile support
  const handleTouchStart = useCallback((e: React.TouchEvent, post: GridPost, index: number) => {
    const touch = e.touches[0]
    setTouchStart({ x: touch.clientX, y: touch.clientY })
    setDraggedPost(post)
    setIsDragging(true)
  }, [])

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!draggedPost || !touchStart) return

    const touch = e.touches[0]
    const element = document.elementFromPoint(touch.clientX, touch.clientY)
    const gridItem = element?.closest('[data-grid-index]')

    if (gridItem) {
      const index = parseInt(gridItem.getAttribute('data-grid-index') || '0')
      setDragOverIndex(index)
    }
  }, [draggedPost, touchStart])

  const handleTouchEnd = useCallback((e: React.TouchEvent, dropIndex: number) => {
    if (!draggedPost) return

    const draggedIndex = posts.findIndex(p => p.id === draggedPost.id)
    if (draggedIndex !== dropIndex && dragOverIndex !== null) {
      // Reorder the posts
      const newPosts = [...posts]
      const [removed] = newPosts.splice(draggedIndex, 1)
      newPosts.splice(dragOverIndex, 0, removed)

      // Update order indices
      const reorderedPosts = newPosts.map((post, idx) => ({
        ...post,
        order_index: idx
      }))

      setPosts(reorderedPosts)
      onOrderChange?.(reorderedPosts)
    }

    // Clean up touch state
    setTouchStart(null)
    setDraggedPost(null)
    setDragOverIndex(null)
    setIsDragging(false)
  }, [draggedPost, dragOverIndex, posts, onOrderChange])

  const handleLockOrder = async () => {
    if (!cityId) {
      toast.error('City ID is required to save order')
      return
    }

    setIsLocking(true)

    try {
      // Update order in database for each post
      const updates = posts.map(async (post, index) => {
        const { error } = await (supabase as any)
          .from('generated_content')
          .update({ order_index: index })
          .eq('id', post.id)
          .eq('city_id', cityId)

        if (error) throw error
      })

      await Promise.all(updates)

      toast.success('Grid order saved successfully!')
    } catch (error) {
      console.error('Error saving grid order:', error)
      toast.error('Failed to save grid order')
    } finally {
      setIsLocking(false)
    }
  }

  if (!posts || posts.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg">
        <p className="text-gray-500">No posts to display</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Instagram Grid Preview</h3>
        <button
          onClick={handleLockOrder}
          disabled={isLocking}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isLocking ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Saving...
            </span>
          ) : (
            'Lock Order'
          )}
        </button>
      </div>

      <div
        className={`instagram-grid grid grid-cols-3 gap-1 p-4 bg-white rounded-lg shadow-sm border ${
          isDragging ? 'border-blue-400' : 'border-gray-200'
        } transition-colors`}
      >
        {posts.map((post, index) => (
          <div
            key={post.id}
            data-grid-index={index}
            draggable
            onDragStart={(e) => handleDragStart(e, post, index)}
            onDragOver={(e) => handleDragOver(e, index)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, index)}
            onDragEnd={handleDragEnd}
            onTouchStart={(e) => handleTouchStart(e, post, index)}
            onTouchMove={handleTouchMove}
            onTouchEnd={(e) => handleTouchEnd(e, index)}
            className={`
              relative aspect-square cursor-move group select-none
              ${draggedPost?.id === post.id ? 'opacity-50' : ''}
              ${dragOverIndex === index && draggedPost?.id !== post.id ? 'ring-2 ring-blue-500 ring-offset-2' : ''}
              transition-all duration-200
            `}
          >
            {/* Drop zone indicator */}
            {dragOverIndex === index && draggedPost?.id !== post.id && (
              <div className="absolute inset-0 bg-blue-500 bg-opacity-20 z-10 rounded-md">
                <div className="flex items-center justify-center h-full">
                  <div className="bg-blue-500 text-white px-2 py-1 rounded text-xs font-medium">
                    Drop here
                  </div>
                </div>
              </div>
            )}

            {/* Post image */}
            <div className="relative w-full h-full overflow-hidden rounded-md bg-gray-100">
              <Image
                src={post.image_url}
                alt={post.caption || `Post ${index + 1}`}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 33vw, (max-width: 1200px) 25vw, 20vw"
                draggable={false}
              />

              {/* Hover overlay with position */}
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-opacity flex items-center justify-center">
                <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="bg-white px-2 py-1 rounded text-sm font-medium text-gray-900">
                    Position {index + 1}
                  </div>
                </div>
              </div>

              {/* Drag handle indicator */}
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="bg-white bg-opacity-90 p-1 rounded">
                  <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Instructions */}
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span>Drag and drop posts to reorder them. Click "Lock Order" to save changes.</span>
      </div>
    </div>
  )
}