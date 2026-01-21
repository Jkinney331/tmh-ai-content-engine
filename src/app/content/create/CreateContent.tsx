'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { ArrowLeft, Upload, RefreshCw, X, Plus, Sparkles, Image as ImageIcon, Video, FileText, ThumbsUp, ThumbsDown, Calendar, Clock, Instagram, Smartphone, Check } from 'lucide-react'
import { Database } from '@/types/database'

type ContentType = Database['public']['Tables']['content_types']['Row']

export default function CreateContent() {
  const router = useRouter()
  const searchParams = useSearchParams()

  // Get content type from query params
  const contentTypeId = searchParams.get('contentTypeId')
  const contentTypeName = searchParams.get('contentTypeName')

  // State for the form
  const [step, setStep] = useState<'asset' | 'caption' | 'preview'>('asset')
  const [assetFile, setAssetFile] = useState<File | null>(null)
  const [assetPreview, setAssetPreview] = useState<string | null>(null)
  const [assetType, setAssetType] = useState<'image' | 'video' | 'text'>('image')

  // Caption generation state
  const [topic, setTopic] = useState('')
  const [additionalContext, setAdditionalContext] = useState('')
  const [caption, setCaption] = useState('')
  const [hashtags, setHashtags] = useState<string[]>([])
  const [newHashtag, setNewHashtag] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [generationError, setGenerationError] = useState<string | null>(null)

  // Preview state
  const [previewPlatform, setPreviewPlatform] = useState<'instagram' | 'tiktok'>('instagram')
  const [feedbackRating, setFeedbackRating] = useState<'up' | 'down' | null>(null)
  const [feedbackTags, setFeedbackTags] = useState<string[]>([])
  const [scheduledDate, setScheduledDate] = useState<string>('')
  const [scheduledTime, setScheduledTime] = useState<string>('')
  const [isSaving, setIsSaving] = useState(false)

  // Handle file selection
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setAssetFile(file)

      // Create preview for images and videos
      if (file.type.startsWith('image/')) {
        setAssetType('image')
        const reader = new FileReader()
        reader.onloadend = () => {
          setAssetPreview(reader.result as string)
        }
        reader.readAsDataURL(file)
      } else if (file.type.startsWith('video/')) {
        setAssetType('video')
        const url = URL.createObjectURL(file)
        setAssetPreview(url)
      } else {
        setAssetType('text')
        setAssetPreview(null)
      }
    }
  }

  // Handle drag and drop
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()

    const file = e.dataTransfer.files?.[0]
    if (file) {
      setAssetFile(file)

      if (file.type.startsWith('image/')) {
        setAssetType('image')
        const reader = new FileReader()
        reader.onloadend = () => {
          setAssetPreview(reader.result as string)
        }
        reader.readAsDataURL(file)
      } else if (file.type.startsWith('video/')) {
        setAssetType('video')
        const url = URL.createObjectURL(file)
        setAssetPreview(url)
      } else {
        setAssetType('text')
        setAssetPreview(null)
      }
    }
  }

  // Generate caption
  const generateCaption = async () => {
    if (!topic.trim()) {
      setGenerationError('Please enter a topic for the caption')
      return
    }

    setIsGenerating(true)
    setGenerationError(null)

    try {
      const response = await fetch('/api/generate/caption', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contentTypeId,
          contentTypeName,
          topic,
          assetUrl: assetPreview,
          assetType,
          additionalContext
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to generate caption')
      }

      const data = await response.json()
      setCaption(data.caption)
      setHashtags(data.hashtags)

    } catch (error) {
      console.error('Generation error:', error)
      setGenerationError(error instanceof Error ? error.message : 'Failed to generate caption')
    } finally {
      setIsGenerating(false)
    }
  }

  // Regenerate caption
  const regenerateCaption = () => {
    generateCaption()
  }

  // Add hashtag
  const addHashtag = () => {
    if (newHashtag.trim() && !hashtags.includes(newHashtag.trim().replace('#', ''))) {
      setHashtags([...hashtags, newHashtag.trim().replace('#', '')])
      setNewHashtag('')
    }
  }

  // Remove hashtag
  const removeHashtag = (tagToRemove: string) => {
    setHashtags(hashtags.filter(tag => tag !== tagToRemove))
  }

  // Handle next step
  const handleNextStep = () => {
    if (step === 'asset' && assetFile) {
      setStep('caption')
      // Auto-generate caption when moving to caption step
      if (topic) {
        generateCaption()
      }
    }
  }

  // Handle save/publish
  const handleSave = async () => {
    setIsSaving(true)

    try {
      // Here you would save the content to the database
      // For now, just show the data
      console.log({
        contentTypeId,
        contentTypeName,
        asset: assetFile,
        caption,
        hashtags,
        topic,
        additionalContext,
        feedbackRating,
        feedbackTags,
        scheduledDate,
        scheduledTime,
        platform: previewPlatform
      })

      // Simulate save delay
      await new Promise(resolve => setTimeout(resolve, 1000))

      // Navigate back to content page with success message
      router.push('/content?success=true')
    } catch (error) {
      console.error('Error saving content:', error)
    } finally {
      setIsSaving(false)
    }
  }

  // Handle moving to preview step
  const handleMoveToPreview = () => {
    if (caption.trim()) {
      setStep('preview')
      // Set default scheduled date to tomorrow
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      setScheduledDate(tomorrow.toISOString().split('T')[0])
      setScheduledTime('10:00')
    }
  }

  // Toggle feedback tag
  const toggleFeedbackTag = (tag: string) => {
    if (feedbackTags.includes(tag)) {
      setFeedbackTags(feedbackTags.filter(t => t !== tag))
    } else {
      setFeedbackTags([...feedbackTags, tag])
    }
  }

  if (!contentTypeId || !contentTypeName) {
    return (
      <div className="container mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600">Invalid content type. Please select a content type from the content page.</p>
          <button
            onClick={() => router.push('/content')}
            className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
          >
            Go back to content types
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => router.push('/content')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Content Types
        </button>
        <h1 className="text-3xl font-bold text-gray-900">Create {contentTypeName}</h1>
        <p className="text-gray-600 mt-2">
          {step === 'asset' && 'Step 1: Upload your asset'}
          {step === 'caption' && 'Step 2: Generate caption and hashtags'}
          {step === 'preview' && 'Step 3: Preview and approve'}
        </p>
      </div>

      {/* Progress indicator */}
      <div className="flex items-center mb-8">
        <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
          step === 'asset' ? 'bg-blue-600 text-white' : 'bg-green-600 text-white'
        }`}>
          1
        </div>
        <div className={`flex-1 h-1 mx-2 ${
          step === 'caption' || step === 'preview' ? 'bg-blue-600' : 'bg-gray-300'
        }`} />
        <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
          step === 'caption' ? 'bg-blue-600 text-white' : step === 'preview' ? 'bg-green-600 text-white' : 'bg-gray-300 text-gray-500'
        }`}>
          2
        </div>
        <div className={`flex-1 h-1 mx-2 ${
          step === 'preview' ? 'bg-blue-600' : 'bg-gray-300'
        }`} />
        <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
          step === 'preview' ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-500'
        }`}>
          3
        </div>
      </div>

      {/* Step 1: Asset Selection */}
      {step === 'asset' && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Select Asset</h2>

          {!assetFile ? (
            <div
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center hover:border-blue-400 transition-colors"
            >
              <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-2">Drag and drop your file here, or click to browse</p>
              <p className="text-sm text-gray-500 mb-4">Supports images, videos, and documents</p>
              <input
                type="file"
                id="file-upload"
                className="hidden"
                onChange={handleFileSelect}
                accept="image/*,video/*,.pdf,.doc,.docx,.txt"
              />
              <label
                htmlFor="file-upload"
                className="inline-block px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer"
              >
                Choose File
              </label>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Preview */}
              <div className="relative bg-gray-50 rounded-lg p-4">
                {assetType === 'image' && assetPreview && (
                  <img
                    src={assetPreview}
                    alt="Asset preview"
                    className="max-w-full max-h-96 mx-auto rounded"
                  />
                )}
                {assetType === 'video' && assetPreview && (
                  <video
                    src={assetPreview}
                    controls
                    className="max-w-full max-h-96 mx-auto rounded"
                  />
                )}
                {assetType === 'text' && (
                  <div className="flex items-center justify-center py-8">
                    <FileText className="w-16 h-16 text-gray-400" />
                  </div>
                )}

                {/* Remove button */}
                <button
                  onClick={() => {
                    setAssetFile(null)
                    setAssetPreview(null)
                  }}
                  className="absolute top-2 right-2 p-1 bg-white rounded-full shadow hover:bg-gray-100"
                >
                  <X className="w-4 h-4 text-gray-600" />
                </button>
              </div>

              {/* File info */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0">
                    {assetType === 'image' && <ImageIcon className="w-5 h-5 text-blue-600" />}
                    {assetType === 'video' && <Video className="w-5 h-5 text-blue-600" />}
                    {assetType === 'text' && <FileText className="w-5 h-5 text-blue-600" />}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{assetFile.name}</p>
                    <p className="text-sm text-gray-600">
                      {(assetFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Topic input for context */}
          {assetFile && (
            <div className="mt-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  What is this content about? *
                </label>
                <input
                  type="text"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="e.g., New product launch, summer collection, team update..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Additional Context (optional)
                </label>
                <textarea
                  value={additionalContext}
                  onChange={(e) => setAdditionalContext(e.target.value)}
                  placeholder="Any additional details about the asset or message you want to convey..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div className="mt-6 flex justify-between">
            <button
              onClick={() => router.push('/content')}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleNextStep}
              disabled={!assetFile || !topic.trim()}
              className={`px-6 py-2 rounded-lg font-medium ${
                assetFile && topic.trim()
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              Next: Generate Caption
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Caption Generation */}
      {step === 'caption' && (
        <div className="space-y-6">
          {/* Asset preview (small) */}
          <div className="bg-white rounded-lg shadow-md p-4">
            <div className="flex items-center gap-4">
              {assetType === 'image' && assetPreview && (
                <img
                  src={assetPreview}
                  alt="Asset"
                  className="w-24 h-24 object-cover rounded"
                />
              )}
              {assetType === 'video' && (
                <div className="w-24 h-24 bg-gray-100 rounded flex items-center justify-center">
                  <Video className="w-8 h-8 text-gray-400" />
                </div>
              )}
              {assetType === 'text' && (
                <div className="w-24 h-24 bg-gray-100 rounded flex items-center justify-center">
                  <FileText className="w-8 h-8 text-gray-400" />
                </div>
              )}
              <div>
                <p className="font-medium text-gray-900">{assetFile?.name}</p>
                <p className="text-sm text-gray-600">{topic}</p>
              </div>
              <button
                onClick={() => setStep('asset')}
                className="ml-auto text-sm text-blue-600 hover:text-blue-800"
              >
                Change asset
              </button>
            </div>
          </div>

          {/* Caption section */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Caption</h2>
              <button
                onClick={regenerateCaption}
                disabled={isGenerating}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Regenerate
                  </>
                )}
              </button>
            </div>

            {generationError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{generationError}</p>
              </div>
            )}

            <textarea
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder={isGenerating ? "Generating caption..." : "Your caption will appear here. You can edit it after generation."}
              rows={6}
              disabled={isGenerating}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
            />

            <div className="mt-2 text-sm text-gray-500 text-right">
              {caption.length} characters
            </div>
          </div>

          {/* Hashtags section */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Hashtags</h2>

            {/* Display hashtags as tags */}
            <div className="flex flex-wrap gap-2 mb-4">
              {hashtags.length === 0 ? (
                <p className="text-gray-500 text-sm">No hashtags yet. They will appear here after generation.</p>
              ) : (
                hashtags.map((tag, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full"
                  >
                    <span>#{tag}</span>
                    <button
                      onClick={() => removeHashtag(tag)}
                      className="ml-1 hover:text-blue-900"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Add new hashtag */}
            <div className="flex gap-2">
              <input
                type="text"
                value={newHashtag}
                onChange={(e) => setNewHashtag(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addHashtag()}
                placeholder="Add a hashtag..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={addHashtag}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex justify-between">
            <button
              onClick={() => setStep('asset')}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Back
            </button>
            <div className="flex gap-3">
              <button
                onClick={() => router.push('/content')}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleMoveToPreview}
                disabled={!caption.trim()}
                className={`px-8 py-2 rounded-lg font-medium ${
                  caption.trim()
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                Next: Preview Post
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Step 3: Preview and Approve */}
      {step === 'preview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left column: Preview */}
          <div className="space-y-4">
            {/* Platform toggle */}
            <div className="bg-white rounded-lg shadow-md p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-semibold">Preview Platform</h3>
                <div className="flex bg-gray-100 rounded-lg p-1">
                  <button
                    onClick={() => setPreviewPlatform('instagram')}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-md transition-colors ${
                      previewPlatform === 'instagram'
                        ? 'bg-white text-pink-600 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <Instagram className="w-4 h-4" />
                    Instagram
                  </button>
                  <button
                    onClick={() => setPreviewPlatform('tiktok')}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-md transition-colors ${
                      previewPlatform === 'tiktok'
                        ? 'bg-white text-black shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <Smartphone className="w-4 h-4" />
                    TikTok
                  </button>
                </div>
              </div>
            </div>

            {/* Platform-styled preview */}
            <div className="bg-white rounded-lg shadow-md p-4">
              {previewPlatform === 'instagram' ? (
                // Instagram-style preview
                <div className="max-w-md mx-auto">
                  <div className="bg-white border border-gray-200 rounded-lg">
                    {/* Instagram header */}
                    <div className="flex items-center justify-between p-3 border-b">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full"></div>
                        <span className="font-semibold text-sm">your_brand</span>
                      </div>
                      <button className="text-gray-600">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                          <path d="M10 4a2 2 0 100-4 2 2 0 000 4z" />
                          <path d="M10 20a2 2 0 100-4 2 2 0 000 4z" />
                        </svg>
                      </button>
                    </div>

                    {/* Instagram image */}
                    <div className="aspect-square bg-gray-100 relative">
                      {assetType === 'image' && assetPreview ? (
                        <img
                          src={assetPreview}
                          alt="Post preview"
                          className="w-full h-full object-cover"
                        />
                      ) : assetType === 'video' ? (
                        <div className="flex items-center justify-center h-full">
                          <Video className="w-16 h-16 text-gray-400" />
                        </div>
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          <ImageIcon className="w-16 h-16 text-gray-400" />
                        </div>
                      )}
                    </div>

                    {/* Instagram actions */}
                    <div className="p-3">
                      <div className="flex justify-between mb-3">
                        <div className="flex gap-4">
                          <button>
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                              <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                            </svg>
                          </button>
                          <button>
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                              <path d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                            </svg>
                          </button>
                          <button>
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                              <path d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z" />
                            </svg>
                          </button>
                        </div>
                        <button>
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                          </svg>
                        </button>
                      </div>

                      {/* Caption */}
                      <div className="space-y-2">
                        <p className="text-sm">
                          <span className="font-semibold mr-2">your_brand</span>
                          {caption}
                        </p>
                        <p className="text-sm text-blue-500">
                          {hashtags.map(tag => `#${tag}`).join(' ')}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                // TikTok-style preview
                <div className="max-w-sm mx-auto">
                  <div className="bg-black rounded-lg overflow-hidden">
                    {/* TikTok video area */}
                    <div className="relative" style={{ paddingTop: '177.77%' }}>
                      <div className="absolute inset-0">
                        {assetType === 'image' && assetPreview ? (
                          <img
                            src={assetPreview}
                            alt="Post preview"
                            className="w-full h-full object-cover"
                          />
                        ) : assetType === 'video' ? (
                          <div className="flex items-center justify-center h-full bg-gray-900">
                            <Video className="w-16 h-16 text-white opacity-50" />
                          </div>
                        ) : (
                          <div className="flex items-center justify-center h-full bg-gray-900">
                            <ImageIcon className="w-16 h-16 text-white opacity-50" />
                          </div>
                        )}

                        {/* TikTok overlay UI */}
                        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/60 to-transparent">
                          <div className="flex items-end justify-between">
                            {/* Left side - caption */}
                            <div className="flex-1 mr-4">
                              <div className="flex items-center gap-2 mb-2">
                                <div className="w-10 h-10 bg-white rounded-full"></div>
                                <span className="text-white font-semibold">@yourbrand</span>
                              </div>
                              <p className="text-white text-sm mb-2">{caption.substring(0, 100)}...</p>
                              <p className="text-white/80 text-xs">
                                {hashtags.slice(0, 3).map(tag => `#${tag}`).join(' ')}
                              </p>
                            </div>

                            {/* Right side - actions */}
                            <div className="flex flex-col items-center gap-4">
                              <button className="flex flex-col items-center">
                                <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" />
                                  </svg>
                                </div>
                                <span className="text-white text-xs mt-1">12.3k</span>
                              </button>
                              <button className="flex flex-col items-center">
                                <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
                                  </svg>
                                </div>
                                <span className="text-white text-xs mt-1">234</span>
                              </button>
                              <button className="flex flex-col items-center">
                                <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                    <path d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m9.032 4.026a9.001 9.001 0 11-13.432 0m13.432 0A9.003 9.003 0 0012 21a9.003 9.003 0 00-5.716-2.316" />
                                  </svg>
                                </div>
                                <span className="text-white text-xs mt-1">Share</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right column: Feedback and scheduling */}
          <div className="space-y-4">
            {/* Feedback panel */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold mb-4">Feedback</h3>

              {/* Thumbs up/down */}
              <div className="mb-6">
                <p className="text-sm text-gray-600 mb-3">How does this post look?</p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setFeedbackRating('up')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 transition-all ${
                      feedbackRating === 'up'
                        ? 'bg-green-50 border-green-500 text-green-700'
                        : 'border-gray-200 hover:border-gray-300 text-gray-600'
                    }`}
                  >
                    <ThumbsUp className="w-5 h-5" />
                    Looks Great
                  </button>
                  <button
                    onClick={() => setFeedbackRating('down')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 transition-all ${
                      feedbackRating === 'down'
                        ? 'bg-red-50 border-red-500 text-red-700'
                        : 'border-gray-200 hover:border-gray-300 text-gray-600'
                    }`}
                  >
                    <ThumbsDown className="w-5 h-5" />
                    Needs Work
                  </button>
                </div>
              </div>

              {/* Feedback tags */}
              <div>
                <p className="text-sm text-gray-600 mb-3">Tag this content (optional)</p>
                <div className="flex flex-wrap gap-2">
                  {['Engaging', 'Professional', 'Fun', 'Informative', 'Creative', 'Trendy', 'Seasonal', 'Product Focus'].map(tag => (
                    <button
                      key={tag}
                      onClick={() => toggleFeedbackTag(tag)}
                      className={`px-3 py-1.5 rounded-full text-sm transition-all ${
                        feedbackTags.includes(tag)
                          ? 'bg-blue-100 text-blue-700 border-2 border-blue-300'
                          : 'bg-gray-100 text-gray-600 border-2 border-transparent hover:bg-gray-200'
                      }`}
                    >
                      {feedbackTags.includes(tag) && <Check className="w-3 h-3 inline mr-1" />}
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Schedule section */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold mb-4">Schedule Post</h3>

              <div className="space-y-4">
                {/* Date picker */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Calendar className="w-4 h-4 inline mr-1" />
                    Post Date
                  </label>
                  <input
                    type="date"
                    value={scheduledDate}
                    onChange={(e) => setScheduledDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Time picker */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Clock className="w-4 h-4 inline mr-1" />
                    Post Time
                  </label>
                  <input
                    type="time"
                    value={scheduledTime}
                    onChange={(e) => setScheduledTime(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Timezone notice */}
                <p className="text-xs text-gray-500">
                  All times are in your local timezone ({Intl.DateTimeFormat().resolvedOptions().timeZone})
                </p>
              </div>
            </div>

            {/* Action buttons */}
            <div className="space-y-3">
              <button
                onClick={handleSave}
                disabled={isSaving || !scheduledDate || !scheduledTime}
                className={`w-full px-6 py-3 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${
                  !isSaving && scheduledDate && scheduledTime
                    ? 'bg-green-600 text-white hover:bg-green-700 shadow-lg hover:shadow-xl'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                {isSaving ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Check className="w-5 h-5" />
                    Approve & Add to Calendar
                  </>
                )}
              </button>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setStep('caption')}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Back to Edit
                </button>
                <button
                  onClick={() => router.push('/content')}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Save as Draft
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}