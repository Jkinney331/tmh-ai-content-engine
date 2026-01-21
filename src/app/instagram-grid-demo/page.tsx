import { supabase } from '@/lib/supabase'
import InstagramGridPreview from '@/components/InstagramGridPreview'
import ClientWrapper from './client-wrapper'

export default async function InstagramGridDemoPage() {
  // Fetch generated content from database
  const { data: posts, error } = await supabase
    .from('generated_content')
    .select('id, output_url, output_metadata, city_id, order_index')
    .eq('content_type', 'social_post')
    .eq('status', 'approved')
    .order('order_index', { ascending: true })
    .limit(9)

  if (error) {
    console.error('Error fetching posts:', error)
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-red-50 text-red-600 p-4 rounded-lg">
            Error loading Instagram grid: {error.message}
          </div>
        </div>
      </div>
    )
  }

  // Transform database posts to match component interface
  const transformedPosts = posts?.map((post: any, index: number) => ({
    id: (post as any).id,
    image_url: (post as any).output_url || `https://picsum.photos/400/400?random=${index}`,
    caption: (post as any).output_metadata?.caption || '',
    order_index: (post as any).order_index ?? index
  })) || []

  // Use mock data if no posts from database
  const displayPosts = transformedPosts.length > 0 ? transformedPosts : [
    { id: '1', image_url: 'https://picsum.photos/400/400?random=1', caption: 'Seattle vibes', order_index: 0 },
    { id: '2', image_url: 'https://picsum.photos/400/400?random=2', caption: 'Urban style', order_index: 1 },
    { id: '3', image_url: 'https://picsum.photos/400/400?random=3', caption: 'Street fashion', order_index: 2 },
    { id: '4', image_url: 'https://picsum.photos/400/400?random=4', caption: 'City life', order_index: 3 },
    { id: '5', image_url: 'https://picsum.photos/400/400?random=5', caption: 'Downtown mood', order_index: 4 },
    { id: '6', image_url: 'https://picsum.photos/400/400?random=6', caption: 'Metro style', order_index: 5 },
    { id: '7', image_url: 'https://picsum.photos/400/400?random=7', caption: 'Urban culture', order_index: 6 },
    { id: '8', image_url: 'https://picsum.photos/400/400?random=8', caption: 'Street art', order_index: 7 },
    { id: '9', image_url: 'https://picsum.photos/400/400?random=9', caption: 'City nights', order_index: 8 }
  ]

  const cityId = (posts as any)?.[0]?.city_id || 'demo-city-id'

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Instagram Grid Preview with Drag & Drop
          </h1>
          <p className="text-gray-600">
            Drag posts to reorder them. Visual feedback includes ghost images and highlighted drop zones.
            Click "Lock Order" to save the arrangement to the database.
          </p>
        </div>

        <ClientWrapper posts={displayPosts} cityId={cityId} />

        <div className="mt-8 space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-900 mb-2">Features Implemented:</h3>
            <ul className="space-y-1 text-sm text-blue-800">
              <li>✅ Drag posts to new positions in grid</li>
              <li>✅ Visual feedback during drag (ghost image)</li>
              <li>✅ Drop zone highlighting when hovering</li>
              <li>✅ Order persists in local state</li>
              <li>✅ "Lock Order" button saves order to database</li>
            </ul>
          </div>

          <div className="bg-gray-100 border border-gray-300 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-2">How to Use:</h3>
            <ol className="space-y-1 text-sm text-gray-700 list-decimal list-inside">
              <li>Click and hold on any post in the grid</li>
              <li>Drag it to a new position (see the blue highlight)</li>
              <li>Release to drop the post in its new location</li>
              <li>Continue reordering until satisfied</li>
              <li>Click "Lock Order" to save to database</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  )
}