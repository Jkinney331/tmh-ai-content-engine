'use client'

import { useState } from 'react'
import InstagramGridPreview from '@/components/InstagramGridPreview'
import { toast, Toaster } from 'sonner'

// Mock data for testing
const mockPosts = [
  {
    id: '1',
    image_url: 'https://picsum.photos/400/400?random=1',
    caption: 'Seattle vibes',
    order_index: 0
  },
  {
    id: '2',
    image_url: 'https://picsum.photos/400/400?random=2',
    caption: 'Urban style',
    order_index: 1
  },
  {
    id: '3',
    image_url: 'https://picsum.photos/400/400?random=3',
    caption: 'Street fashion',
    order_index: 2
  },
  {
    id: '4',
    image_url: 'https://picsum.photos/400/400?random=4',
    caption: 'City life',
    order_index: 3
  },
  {
    id: '5',
    image_url: 'https://picsum.photos/400/400?random=5',
    caption: 'Downtown mood',
    order_index: 4
  },
  {
    id: '6',
    image_url: 'https://picsum.photos/400/400?random=6',
    caption: 'Metro style',
    order_index: 5
  },
  {
    id: '7',
    image_url: 'https://picsum.photos/400/400?random=7',
    caption: 'Urban culture',
    order_index: 6
  },
  {
    id: '8',
    image_url: 'https://picsum.photos/400/400?random=8',
    caption: 'Street art',
    order_index: 7
  },
  {
    id: '9',
    image_url: 'https://picsum.photos/400/400?random=9',
    caption: 'City nights',
    order_index: 8
  }
]

export default function TestGridPage() {
  const [posts, setPosts] = useState(mockPosts)

  const handleOrderChange = (newPosts: typeof mockPosts) => {
    setPosts(newPosts)
    toast.success('Grid order updated locally')
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <Toaster position="top-right" />

      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Instagram Grid Preview - Drag & Drop Test
          </h1>
          <p className="text-gray-600">
            Test the drag and drop functionality by dragging posts to new positions.
            Visual feedback includes ghost images and highlighted drop zones.
          </p>
        </div>

        <InstagramGridPreview
          posts={posts}
          cityId="test-city-id"
          onOrderChange={handleOrderChange}
        />

        <div className="mt-8 p-4 bg-blue-50 rounded-lg">
          <h3 className="font-semibold text-blue-900 mb-2">Current Order:</h3>
          <div className="grid grid-cols-3 gap-2 text-sm">
            {posts.map((post, index) => (
              <div key={post.id} className="bg-white p-2 rounded border border-blue-200">
                <span className="font-medium">Position {index + 1}:</span> {post.caption}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}