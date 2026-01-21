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

interface TikTokFeedPreviewProps {
  posts: GridPost[]
  cityId?: string
  onOrderChange?: (posts: GridPost[]) => void
}

type PreviewMode = 'instagram' | 'tiktok'

export default function TikTokFeedPreview({
  posts: initialPosts,
  cityId,
  onOrderChange
}: TikTokFeedPreviewProps) {
  const [posts, setPosts] = useState<GridPost[]>(initialPosts)
  const [previewMode, setPreviewMode] = useState<PreviewMode>('instagram')
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
    if (!relatedTarget?.closest('.preview-container')) {
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

      toast.success('Feed order saved successfully!')
    } catch (error) {
      console.error('Error saving feed order:', error)
      toast.error('Failed to save feed order')
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
        <h3 className="text-lg font-semibold text-gray-900">
          {previewMode === 'instagram' ? 'Instagram Grid' : 'TikTok Feed'} Preview
        </h3>
        <div className="flex items-center gap-3">
          {/* Preview Mode Toggle */}
          <div className="flex items-center bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setPreviewMode('instagram')}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                previewMode === 'instagram'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <div className="flex items-center gap-1.5">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zM5.838 12a6.162 6.162 0 1112.324 0 6.162 6.162 0 01-12.324 0zM12 16a4 4 0 110-8 4 4 0 010 8zm4.965-10.405a1.44 1.44 0 112.881.001 1.44 1.44 0 01-2.881-.001z"/>
                </svg>
                Instagram
              </div>
            </button>
            <button
              onClick={() => setPreviewMode('tiktok')}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                previewMode === 'tiktok'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <div className="flex items-center gap-1.5">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.37 6.37 0 00-1-.05A6.34 6.34 0 005 15.68a6.34 6.34 0 008.42 3.26 6.18 6.18 0 001.84-1.61 6.27 6.27 0 001.08-3.47V8.69a8.16 8.16 0 004.65 1.46v-3.46a4.79 4.79 0 01-1.4 0z"/>
                </svg>
                TikTok
              </div>
            </button>
          </div>

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
      </div>

      {/* Instagram Grid View */}
      {previewMode === 'instagram' && (
        <div
          className={`preview-container instagram-grid grid grid-cols-3 gap-1 p-4 bg-white rounded-lg shadow-sm border ${
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
      )}

      {/* TikTok Feed View */}
      {previewMode === 'tiktok' && (
        <div className="preview-container tiktok-feed">
          {/* Phone Frame */}
          <div className="max-w-sm mx-auto">
            <div className="bg-black rounded-[2.5rem] p-2 shadow-2xl">
              {/* Phone Screen */}
              <div className="bg-gray-900 rounded-[2rem] p-1">
                {/* Status Bar */}
                <div className="flex justify-between items-center px-4 py-1 text-white text-xs">
                  <span>9:41</span>
                  <div className="flex gap-1">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M2 17h20v2H2zm1.15-4.05L4 11.47l.85 1.48 1.3-.75-.85-1.48H7v-1.5H5.3l.85-1.48L4.85 7 4 8.47 3.15 7l-1.3.75.85 1.48H1v1.5h1.7l-.85 1.48 1.3.75zm6.7-.75l1.48.85 1.48-.85-.85-1.48H14v-1.5h-2.05l.85-1.48-1.48-.85L10 8.47 8.68 7l-1.48.85.85 1.48H6v1.5h2.05l-.85 1.48zm8 0l1.48.85 1.48-.85-.85-1.48H22v-1.5h-2.05l.85-1.48-1.48-.85L18 8.47 16.68 7l-1.48.85.85 1.48H14v1.5h2.05l-.85 1.48z"/>
                    </svg>
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12.01 21.49L23.64 7c-.45-.34-4.93-4-11.64-4C5.28 3 .81 6.66.36 7l11.63 14.49.01.01.01-.01z"/>
                    </svg>
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M15.67 4H14V2h-4v2H8.33C7.6 4 7 4.6 7 5.33v15.33C7 21.4 7.6 22 8.33 22h7.33c.74 0 1.34-.6 1.34-1.33V5.33C17 4.6 16.4 4 15.67 4z"/>
                    </svg>
                  </div>
                </div>

                {/* Content Area - Scrollable */}
                <div
                  className={`h-[600px] overflow-y-auto overflow-x-hidden bg-black ${
                    isDragging ? 'ring-2 ring-blue-400' : ''
                  } transition-all`}
                  style={{ scrollSnapType: 'y mandatory' }}
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
                        relative w-full h-[600px] cursor-move group select-none
                        ${draggedPost?.id === post.id ? 'opacity-50' : ''}
                        ${dragOverIndex === index && draggedPost?.id !== post.id ? 'ring-4 ring-blue-500' : ''}
                        transition-all duration-200
                      `}
                      style={{ scrollSnapAlign: 'start' }}
                    >
                      {/* Drop zone indicator */}
                      {dragOverIndex === index && draggedPost?.id !== post.id && (
                        <div className="absolute inset-0 bg-blue-500 bg-opacity-30 z-10">
                          <div className="flex items-center justify-center h-full">
                            <div className="bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium">
                              Drop here
                            </div>
                          </div>
                        </div>
                      )}

                      {/* 9:16 Aspect Ratio Container */}
                      <div className="relative w-full h-full bg-gray-900">
                        <Image
                          src={post.image_url}
                          alt={post.caption || `Post ${index + 1}`}
                          fill
                          className="object-cover"
                          sizes="(max-width: 768px) 100vw, 384px"
                          draggable={false}
                        />

                        {/* TikTok UI Overlay */}
                        <div className="absolute inset-0 pointer-events-none">
                          {/* Bottom gradient */}
                          <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-black/60 to-transparent" />

                          {/* Caption */}
                          <div className="absolute bottom-20 left-4 right-16 text-white">
                            <p className="text-sm font-medium mb-2">@yourbrand</p>
                            <p className="text-sm line-clamp-2">
                              {post.caption || `Amazing content #${index + 1}`}
                            </p>
                          </div>

                          {/* Action buttons */}
                          <div className="absolute bottom-20 right-4 flex flex-col gap-4">
                            <button className="text-white flex flex-col items-center">
                              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                              </svg>
                              <span className="text-xs mt-1">24.5K</span>
                            </button>
                            <button className="text-white flex flex-col items-center">
                              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/>
                              </svg>
                              <span className="text-xs mt-1">385</span>
                            </button>
                            <button className="text-white flex flex-col items-center">
                              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92 1.61 0 2.92-1.31 2.92-2.92s-1.31-2.92-2.92-2.92z"/>
                              </svg>
                              <span className="text-xs mt-1">Share</span>
                            </button>
                          </div>

                          {/* Position indicator */}
                          <div className="absolute top-4 right-4 pointer-events-auto">
                            <div className="bg-black/50 backdrop-blur px-3 py-1 rounded-full">
                              <span className="text-white text-xs font-medium">
                                {index + 1} / {posts.length}
                              </span>
                            </div>
                          </div>

                          {/* Drag handle indicator */}
                          <div className="absolute top-4 left-4 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-auto">
                            <div className="bg-white/90 backdrop-blur p-2 rounded-lg">
                              <svg className="w-5 h-5 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
                              </svg>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Bottom Navigation */}
                <div className="bg-black border-t border-gray-800 px-4 py-2">
                  <div className="flex justify-around items-center">
                    <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
                    </svg>
                    <svg className="w-6 h-6 text-gray-500" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                    </svg>
                    <div className="relative">
                      <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <rect x="4" y="4" width="16" height="16" rx="2" ry="2"/>
                        <line x1="12" y1="8" x2="12" y2="16" stroke="black" strokeWidth="2"/>
                        <line x1="8" y1="12" x2="16" y2="12" stroke="black" strokeWidth="2"/>
                      </svg>
                    </div>
                    <svg className="w-6 h-6 text-gray-500" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M20 4h1a1 1 0 00-1-1v1zm-1 12a1 1 0 102 0h-2zM8 3a1 1 0 000 2V3zM3.293 19.293a1 1 0 101.414 1.414l-1.414-1.414zM19 4v12h2V4h-2zm1-1H8v2h12V3zm-.707.293l-16 16 1.414 1.414 16-16-1.414-1.414z"/>
                    </svg>
                    <svg className="w-6 h-6 text-gray-500" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span>
          {previewMode === 'instagram'
            ? 'Drag and drop posts to reorder them in the Instagram grid.'
            : 'Drag and drop posts to reorder them in the TikTok feed. Scroll to view all posts.'}
          {' Click "Lock Order" to save changes.'}
        </span>
      </div>
    </div>
  )
}