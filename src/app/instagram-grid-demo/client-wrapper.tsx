'use client'

import { useState } from 'react'
import InstagramGridPreview from '@/components/InstagramGridPreview'
import { Toaster, toast } from 'sonner'

interface GridPost {
  id: string
  image_url: string
  caption: string
  order_index: number
}

interface ClientWrapperProps {
  posts: GridPost[]
  cityId: string
}

export default function ClientWrapper({ posts: initialPosts, cityId }: ClientWrapperProps) {
  const [posts, setPosts] = useState(initialPosts)

  const handleOrderChange = (newPosts: GridPost[]) => {
    setPosts(newPosts)
    toast.info('Grid order updated locally. Click "Lock Order" to save.')
  }

  return (
    <>
      <Toaster position="top-right" />

      <InstagramGridPreview
        posts={posts}
        cityId={cityId}
        onOrderChange={handleOrderChange}
      />

      <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
        <h3 className="font-semibold text-amber-900 mb-2">Current Order:</h3>
        <div className="grid grid-cols-3 gap-2 text-sm">
          {posts.sort((a, b) => a.order_index - b.order_index).map((post, index) => (
            <div key={post.id} className="bg-white p-2 rounded border border-amber-300">
              <span className="font-medium text-amber-700">Position {index + 1}:</span>
              <span className="text-gray-700 ml-1">{post.caption || `Post ${post.id.slice(0, 8)}`}</span>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}