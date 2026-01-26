'use client';

import { useState, useRef, useEffect } from 'react';
import { useGenerationStore } from '../../../stores/generationStore';
import CitySelector from '../../../components/CitySelector';

// Video generation model options
type VideoModel = 'sora-2' | 'sora-2-pro' | 'veo-3';
type VideoResolution = '720p' | '1080p';
type VideoAspectRatio = '16:9' | '9:16' | '1:1';

interface VideoSettings {
  model: VideoModel;
  duration: number;
  resolution: VideoResolution;
  aspectRatio: VideoAspectRatio;
}

// Model-specific durations based on API requirements
const MODEL_DURATIONS: Record<VideoModel, number[]> = {
  'sora-2': [4, 8, 12],      // Sora 2 Standard
  'sora-2-pro': [10, 15, 25], // Sora 2 Pro
  'veo-3': [5, 10, 15],       // VEO 3
};

const VIDEO_MODELS: { id: VideoModel; name: string; description: string; cost: string; durations: number[] }[] = [
  { id: 'sora-2', name: 'Sora 2', description: 'Fast, cost-effective video generation', cost: '~$0.10/sec', durations: [4, 8, 12] },
  { id: 'sora-2-pro', name: 'Sora 2 Pro', description: 'Higher quality, longer videos', cost: '~$0.30/sec', durations: [10, 15, 25] },
  { id: 'veo-3', name: 'VEO 3', description: 'Google video model via WaveSpeed', cost: '~$0.03/sec', durations: [5, 10, 15] },
];

const VIDEO_RESOLUTIONS: { id: VideoResolution; label: string }[] = [
  { id: '720p', label: '720p (HD)' },
  { id: '1080p', label: '1080p (Full HD)' },
];

const VIDEO_ASPECT_RATIOS: { id: VideoAspectRatio; label: string; description: string }[] = [
  { id: '16:9', label: '16:9', description: 'Landscape (YouTube, TV)' },
  { id: '9:16', label: '9:16', description: 'Vertical (TikTok, Reels)' },
  { id: '1:1', label: '1:1', description: 'Square (Instagram Feed)' },
];

interface VideoVariation {
  id: string;
  name: string;
  style: string;
  duration: string;
  description: string;
  prompt: string;
}

interface GenerationResult {
  variationId: string;
  variationName: string;
  modelA: {
    jobId?: string;
    videoUrl?: string;
    thumbnailUrl?: string;
    status: 'idle' | 'generating' | 'completed' | 'error';
    error?: string;
    model?: string;
  };
  modelB: {
    jobId?: string;
    videoUrl?: string;
    thumbnailUrl?: string;
    status: 'idle' | 'generating' | 'completed' | 'error';
    error?: string;
    model?: string;
  };
  winner?: 'A' | 'B';
  feedback?: {
    thumbsUp?: boolean;
    thumbsDown?: boolean;
    tags?: string[];
    text?: string;
  };
  approved?: boolean;
}

export default function VideoGeneratePage() {
  const { selectedCity } = useGenerationStore();
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationResults, setGenerationResults] = useState<GenerationResult[]>([]);
  const [isReviewMode, setIsReviewMode] = useState(false);
  const [currentReviewIndex, setCurrentReviewIndex] = useState(0);
  const [approvalSaved, setApprovalSaved] = useState(false);
  const [playingVideo, setPlayingVideo] = useState<{ index: number; model: 'A' | 'B' } | null>(null);
  const [showCityWarning, setShowCityWarning] = useState(false);
  const videoRefsA = useRef<(HTMLVideoElement | null)[]>([]);
  const videoRefsB = useRef<(HTMLVideoElement | null)[]>([]);
  const citySelectorRef = useRef<HTMLDivElement>(null);

  // Video generation settings
  const [videoSettings, setVideoSettings] = useState<VideoSettings>({
    model: 'sora-2',
    duration: 8, // Default to middle option for sora-2
    resolution: '1080p',
    aspectRatio: '16:9'
  });

  // Update duration when model changes to ensure valid value
  const handleModelChange = (newModel: VideoModel) => {
    const validDurations = MODEL_DURATIONS[newModel];
    const newDuration = validDurations[Math.floor(validDurations.length / 2)]; // Pick middle option
    setVideoSettings(prev => ({
      ...prev,
      model: newModel,
      duration: newDuration
    }));
  };

  // Polling state for video generation
  const [generationStatus, setGenerationStatus] = useState<string>('');
  const pollingRef = useRef<{ sora?: NodeJS.Timeout; veo?: NodeJS.Timeout }>({});
  const completedRef = useRef<{ sora: boolean; veo: boolean }>({ sora: false, veo: false });

  // Predefined video ad variations
  const variations: VideoVariation[] = [
    {
      id: 'urban-energy',
      name: 'Urban Energy',
      style: 'Fast-paced montage',
      duration: '15 seconds',
      description: 'Dynamic city scenes with quick cuts',
      prompt: 'Fast-paced urban video ad, energetic music, quick cuts of city life and branded merchandise, 15 seconds'
    },
    {
      id: 'lifestyle-story',
      name: 'Lifestyle Story',
      style: 'Narrative storytelling',
      duration: '30 seconds',
      description: 'Character-driven story with product placement',
      prompt: 'Lifestyle video ad showing day in the life, featuring branded products naturally, warm colors, 30 seconds'
    },
    {
      id: 'product-focus',
      name: 'Product Focus',
      style: 'Clean product showcase',
      duration: '20 seconds',
      description: 'Minimalist product presentation',
      prompt: 'Clean product showcase video, smooth camera movements, studio lighting, branded merchandise focus, 20 seconds'
    }
  ];

  // Cleanup polling on unmount
  useEffect(() => {
    return () => {
      if (pollingRef.current.sora) {
        clearInterval(pollingRef.current.sora);
      }
      if (pollingRef.current.veo) {
        clearInterval(pollingRef.current.veo);
      }
    };
  }, []);

  // Handle generate button click with city validation
  const handleGenerateClick = () => {
    if (!selectedCity) {
      setShowCityWarning(true);
      // Scroll to city selector and flash it
      citySelectorRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      // Auto-hide warning after 5 seconds
      setTimeout(() => setShowCityWarning(false), 5000);
      return;
    }
    handleGenerate();
  };

  const handleGenerate = async () => {
    if (!selectedCity) return;

    setShowCityWarning(false);
    setIsGenerating(true);
    setGenerationStatus('Starting video generation (Sora + VEO)...');
    completedRef.current = { sora: false, veo: false };

    // Initialize results for first variation only (one at a time for real generation)
    const variation = variations[0]; // Start with first variation
    const initialResults: GenerationResult[] = [{
      variationId: variation.id,
      variationName: variation.name,
      modelA: { status: 'generating', model: 'Sora 2' },
      modelB: { status: 'generating', model: 'VEO 3' },
      winner: 'A',
      feedback: { thumbsUp: false, thumbsDown: false, tags: [], text: '' },
      approved: false
    }];
    setGenerationResults(initialResults);

    try {
      // Build prompt with city context
      const prompt = `${variation.prompt}, featuring ${selectedCity.name} city culture and landmarks, ${videoSettings.duration} seconds, ${videoSettings.aspectRatio} aspect ratio`;

      const selectedSoraModel = videoSettings.model === 'sora-2-pro' ? 'sora-2-pro' : 'sora-2';

      const soraRequestBody = {
        prompt,
        model: selectedSoraModel,
        duration: videoSettings.duration,
        resolution: videoSettings.resolution,
        aspectRatio: videoSettings.aspectRatio,
        cityId: selectedCity.id,
        cityName: selectedCity.name,
      };

      const veoRequestBody = {
        prompt,
        model: 'veo-3',
        duration: videoSettings.duration,
        aspectRatio: videoSettings.aspectRatio,
        resolution: videoSettings.resolution,
        cityId: selectedCity.id,
        cityName: selectedCity.name,
      };

      setGenerationStatus('Submitting to Sora and VEO...');

      const [soraResponse, veoResponse] = await Promise.all([
        fetch('/api/generate/video/sora', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(soraRequestBody)
        }),
        fetch('/api/generate/video/veo', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(veoRequestBody)
        })
      ]);

      const soraData = await soraResponse.json();
      const veoData = await veoResponse.json();

      if (!soraResponse.ok) {
        throw new Error(soraData.error || 'Failed to start Sora generation');
      }
      if (!veoResponse.ok) {
        throw new Error(veoData.error || 'Failed to start VEO generation');
      }

      const startPolling = (
        key: 'sora' | 'veo',
        jobId: string,
        statusEndpoint: string,
        updateModel: 'modelA' | 'modelB'
      ) => {
        let attempts = 0;
        const maxAttempts = 60;

        pollingRef.current[key] = setInterval(async () => {
          attempts++;
          try {
            const statusResponse = await fetch(statusEndpoint);
            const statusData = await statusResponse.json();

            if (statusData.status === 'completed' && statusData.videoUrl) {
              if (pollingRef.current[key]) clearInterval(pollingRef.current[key]);
              completedRef.current[key] = true;

              setGenerationResults(prev => {
                const updated = [...prev];
                updated[0] = {
                  ...updated[0],
                  [updateModel]: {
                    videoUrl: statusData.videoUrl,
                    thumbnailUrl: statusData.thumbnailUrl || undefined,
                    status: 'completed',
                    model: updateModel === 'modelA' ? 'Sora 2' : 'VEO 3',
                    jobId
                  }
                };
                return updated;
              });
            } else if (statusData.status === 'failed') {
              if (pollingRef.current[key]) clearInterval(pollingRef.current[key]);
              completedRef.current[key] = true;

              setGenerationResults(prev => {
                const updated = [...prev];
                updated[0] = {
                  ...updated[0],
                  [updateModel]: {
                    status: 'error',
                    error: statusData.error || 'Generation failed',
                    model: updateModel === 'modelA' ? 'Sora 2' : 'VEO 3',
                    jobId
                  }
                };
                return updated;
              });
            } else if (attempts >= maxAttempts) {
              if (pollingRef.current[key]) clearInterval(pollingRef.current[key]);
              completedRef.current[key] = true;
            }

            if (completedRef.current.sora && completedRef.current.veo) {
              setIsGenerating(false);
              setGenerationStatus('Video generation complete!');
            }
          } catch (err) {
            console.error('Status poll error:', err);
          }
        }, 5000);
      };

      setGenerationStatus('Video generation in progress...');

      const soraStatusUrl = `/api/generate/video/sora/status?jobId=${soraData.jobId}${soraData.contentId ? `&contentId=${soraData.contentId}` : ''}`;
      const veoStatusUrl = `/api/generate/video/veo/status?jobId=${veoData.jobId}${veoData.contentId ? `&contentId=${veoData.contentId}` : ''}`;

      startPolling('sora', soraData.jobId, soraStatusUrl, 'modelA');
      startPolling('veo', veoData.jobId, veoStatusUrl, 'modelB');
    } catch (error) {
      console.error('Video generation error:', error);
      setGenerationResults(prev => {
        const updated = [...prev];
        if (updated[0]) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          updated[0] = {
            ...updated[0],
            modelA: {
              status: 'error',
              error: errorMessage,
              model: 'Sora 2'
            },
            modelB: {
              status: 'error',
              error: errorMessage,
              model: 'VEO 3'
            }
          };
        }
        return updated;
      });
      setIsGenerating(false);
      setGenerationStatus('Generation failed');
    }
  };

  const handleReset = () => {
    setGenerationResults([]);
    setIsReviewMode(false);
    setCurrentReviewIndex(0);
    setApprovalSaved(false);
    setPlayingVideo(null);
  };

  const handlePickWinner = (index: number, winner: 'A' | 'B') => {
    setGenerationResults(prev => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        winner: winner
      };
      return updated;
    });
  };

  const toggleThumb = (index: number, type: 'up' | 'down') => {
    setGenerationResults(prev => {
      const updated = [...prev];
      const feedback = updated[index].feedback || {};
      if (type === 'up') {
        feedback.thumbsUp = !feedback.thumbsUp;
        if (feedback.thumbsUp) feedback.thumbsDown = false;
      } else {
        feedback.thumbsDown = !feedback.thumbsDown;
        if (feedback.thumbsDown) feedback.thumbsUp = false;
      }
      updated[index] = {
        ...updated[index],
        feedback
      };
      return updated;
    });
  };

  const toggleTag = (index: number, tag: string) => {
    setGenerationResults(prev => {
      const updated = [...prev];
      const feedback = updated[index].feedback || {};
      const tags = feedback.tags || [];
      if (tags.includes(tag)) {
        feedback.tags = tags.filter(t => t !== tag);
      } else {
        feedback.tags = [...tags, tag];
      }
      updated[index] = {
        ...updated[index],
        feedback
      };
      return updated;
    });
  };

  const updateFeedbackText = (index: number, text: string) => {
    setGenerationResults(prev => {
      const updated = [...prev];
      const feedback = updated[index].feedback || {};
      feedback.text = text;
      updated[index] = {
        ...updated[index],
        feedback
      };
      return updated;
    });
  };

  const handleApproveSelected = async () => {
    // Save to generated_content with content_type='video_ad'
    const approvedVideos = generationResults.map(result => ({
      ...result,
      approved: true,
      content_type: 'video_ad'
    }));

    // Simulate saving to database
    console.log('Saving approved video ads to generated_content:', approvedVideos.filter(v => v.winner));

    setGenerationResults(approvedVideos);
    setApprovalSaved(true);

    // Show success message
    alert(`Successfully approved ${approvedVideos.filter(v => v.winner).length} video ads!`);
  };

  const handlePlayVideo = (index: number, model: 'A' | 'B') => {
    // Pause any currently playing videos
    if (playingVideo) {
      const prevRef = playingVideo.model === 'A'
        ? videoRefsA.current[playingVideo.index]
        : videoRefsB.current[playingVideo.index];
      if (prevRef) {
        prevRef.pause();
      }
    }

    // Play the selected video
    const videoRef = model === 'A'
      ? videoRefsA.current[index]
      : videoRefsB.current[index];

    if (videoRef) {
      videoRef.play();
      setPlayingVideo({ index, model });
    }
  };

  const availableTags = ['Dynamic', 'Professional', 'Engaging', 'Brand-focused', 'Creative', 'High-quality'];

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Generate Video Ads</h1>
      <p className="text-gray-600 mb-8">Create compelling video advertisements for your branded merchandise.</p>

      {/* City Selector */}
      <div
        ref={citySelectorRef}
        className={`bg-white rounded-lg shadow-md p-6 mb-6 transition-all ${
          showCityWarning ? 'ring-2 ring-red-500 ring-offset-2 animate-pulse' : ''
        }`}
      >
        {showCityWarning && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
            <svg className="w-5 h-5 text-red-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span className="text-red-800 font-medium">Please select a city before generating</span>
          </div>
        )}
        <CitySelector />
      </div>

      {/* Video Generation Settings */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Video Generation Settings</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Model Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Model</label>
            <select
              value={videoSettings.model}
              onChange={(e) => handleModelChange(e.target.value as VideoModel)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isGenerating}
            >
              {VIDEO_MODELS.map(model => (
                <option key={model.id} value={model.id}>
                  {model.name} ({model.cost})
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs text-gray-500">
              {VIDEO_MODELS.find(m => m.id === videoSettings.model)?.description}
            </p>
          </div>

          {/* Duration Selection - Model-specific options */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Duration</label>
            <select
              value={videoSettings.duration}
              onChange={(e) => setVideoSettings(prev => ({ ...prev, duration: parseInt(e.target.value) }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isGenerating}
            >
              {MODEL_DURATIONS[videoSettings.model].map(duration => (
                <option key={duration} value={duration}>{duration} seconds</option>
              ))}
            </select>
            <p className="mt-1 text-xs text-gray-500">
              Available durations for {VIDEO_MODELS.find(m => m.id === videoSettings.model)?.name}
            </p>
          </div>

          {/* Resolution Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Resolution</label>
            <select
              value={videoSettings.resolution}
              onChange={(e) => setVideoSettings(prev => ({ ...prev, resolution: e.target.value as VideoResolution }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isGenerating || videoSettings.model === 'veo-3'}
            >
              {VIDEO_RESOLUTIONS.map(res => (
                <option key={res.id} value={res.id}>{res.label}</option>
              ))}
            </select>
            {videoSettings.model === 'veo-3' && (
              <p className="mt-1 text-xs text-gray-500">VEO 3 uses default resolution</p>
            )}
          </div>

          {/* Aspect Ratio Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Aspect Ratio</label>
            <select
              value={videoSettings.aspectRatio}
              onChange={(e) => setVideoSettings(prev => ({ ...prev, aspectRatio: e.target.value as VideoAspectRatio }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isGenerating}
            >
              {VIDEO_ASPECT_RATIOS.map(ratio => (
                <option key={ratio.id} value={ratio.id}>{ratio.label} - {ratio.description}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Estimated Cost */}
        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Estimated cost:</span>
            <span className="font-medium text-gray-900">
              ${(parseFloat(VIDEO_MODELS.find(m => m.id === videoSettings.model)?.cost.replace(/[^0-9.]/g, '') || '0.03') * videoSettings.duration).toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      {/* Variation Preview Cards */}
      {!generationResults.length && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Available Video Styles</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {variations.map(variation => (
              <div key={variation.id} className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-2">{variation.name}</h3>
                <div className="space-y-2 text-sm text-gray-600">
                  <p><span className="font-medium">Style:</span> {variation.style}</p>
                  <p><span className="font-medium">Duration:</span> {variation.duration}</p>
                  <p className="text-xs">{variation.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Generate Button */}
      {!generationResults.length && (
        <div className="flex flex-col items-center mb-8 gap-3">
          <button
            onClick={handleGenerateClick}
            disabled={isGenerating}
            className={`
              px-8 py-4 rounded-lg font-medium text-lg transition-all
              ${!isGenerating
                ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }
            `}
          >
            {isGenerating ? (
              <div className="flex flex-col items-center space-y-2">
                <div className="flex items-center space-x-3">
                  <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>{generationStatus || 'Generating Video...'}</span>
                </div>
              </div>
            ) : (
              <span>Generate Video with {VIDEO_MODELS.find(m => m.id === videoSettings.model)?.name}</span>
            )}
          </button>
          {!selectedCity && (
            <p className="text-sm text-gray-500">Select a city above to enable generation</p>
          )}
        </div>
      )}

      {/* Review Mode - ComparisonViewer for Videos */}
      {isReviewMode && generationResults.length > 0 && (
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Review & Approve Video Ads</h2>
              <p className="text-sm text-gray-600 mt-1">
                Video {currentReviewIndex + 1} of {generationResults.length}: {generationResults[currentReviewIndex]?.variationName}
              </p>
            </div>
            <button
              onClick={() => setIsReviewMode(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Current Video Comparison */}
          {generationResults[currentReviewIndex] && (
            <div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Model A */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-lg">Model A</h3>
                      <span className="text-sm text-gray-500">{generationResults[currentReviewIndex].modelA.model}</span>
                    </div>
                    <button
                      onClick={() => handlePickWinner(currentReviewIndex, 'A')}
                      className={`px-4 py-2 rounded-lg font-medium transition-all ${
                        generationResults[currentReviewIndex].winner === 'A'
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {generationResults[currentReviewIndex].winner === 'A' ? '✓ Winner' : 'Pick Winner'}
                    </button>
                  </div>
                  <div className="aspect-video bg-gray-900 rounded-lg overflow-hidden relative">
                    {generationResults[currentReviewIndex].modelA.videoUrl ? (
                      <>
                        <video
                          ref={el => {videoRefsA.current[currentReviewIndex] = el}}
                          className="w-full h-full object-cover"
                          poster={generationResults[currentReviewIndex].modelA.thumbnailUrl}
                          controls={playingVideo?.index === currentReviewIndex && playingVideo.model === 'A'}
                          onEnded={() => setPlayingVideo(null)}
                        >
                          <source src={generationResults[currentReviewIndex].modelA.videoUrl} type="video/mp4" />
                        </video>
                        {(!playingVideo || playingVideo.index !== currentReviewIndex || playingVideo.model !== 'A') && (
                          <button
                            onClick={() => handlePlayVideo(currentReviewIndex, 'A')}
                            className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40 hover:bg-opacity-50 transition-all"
                          >
                            <div className="bg-white rounded-full p-4">
                              <svg className="w-8 h-8 text-gray-900" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M8 5v14l11-7z" />
                              </svg>
                            </div>
                          </button>
                        )}
                      </>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-500">
                        No video available
                      </div>
                    )}
                  </div>
                </div>

                {/* Model B */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-lg">Model B</h3>
                      <span className="text-sm text-gray-500">{generationResults[currentReviewIndex].modelB.model}</span>
                    </div>
                    <button
                      onClick={() => handlePickWinner(currentReviewIndex, 'B')}
                      className={`px-4 py-2 rounded-lg font-medium transition-all ${
                        generationResults[currentReviewIndex].winner === 'B'
                          ? 'bg-green-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {generationResults[currentReviewIndex].winner === 'B' ? '✓ Winner' : 'Pick Winner'}
                    </button>
                  </div>
                  <div className="aspect-video bg-gray-900 rounded-lg overflow-hidden relative">
                    {generationResults[currentReviewIndex].modelB.videoUrl ? (
                      <>
                        <video
                          ref={el => {videoRefsB.current[currentReviewIndex] = el}}
                          className="w-full h-full object-cover"
                          poster={generationResults[currentReviewIndex].modelB.thumbnailUrl}
                          controls={playingVideo?.index === currentReviewIndex && playingVideo.model === 'B'}
                          onEnded={() => setPlayingVideo(null)}
                        >
                          <source src={generationResults[currentReviewIndex].modelB.videoUrl} type="video/mp4" />
                        </video>
                        {(!playingVideo || playingVideo.index !== currentReviewIndex || playingVideo.model !== 'B') && (
                          <button
                            onClick={() => handlePlayVideo(currentReviewIndex, 'B')}
                            className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40 hover:bg-opacity-50 transition-all"
                          >
                            <div className="bg-white rounded-full p-4">
                              <svg className="w-8 h-8 text-gray-900" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M8 5v14l11-7z" />
                              </svg>
                            </div>
                          </button>
                        )}
                      </>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-500">
                        No video available
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Feedback Panel - Same as Images */}
              <div className="mt-6 p-4 bg-gray-50 rounded-lg space-y-4">
                <h4 className="font-medium text-gray-700">Feedback for {generationResults[currentReviewIndex].variationName}</h4>

                {/* Thumbs Up/Down */}
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => toggleThumb(currentReviewIndex, 'up')}
                    className={`flex items-center gap-2 px-3 py-1 rounded-lg transition-all ${
                      generationResults[currentReviewIndex].feedback?.thumbsUp
                        ? 'bg-green-100 text-green-700'
                        : 'bg-white text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                    </svg>
                    Like
                  </button>
                  <button
                    onClick={() => toggleThumb(currentReviewIndex, 'down')}
                    className={`flex items-center gap-2 px-3 py-1 rounded-lg transition-all ${
                      generationResults[currentReviewIndex].feedback?.thumbsDown
                        ? 'bg-red-100 text-red-700'
                        : 'bg-white text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <svg className="w-5 h-5 rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                    </svg>
                    Dislike
                  </button>
                </div>

                {/* Tags */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tags</label>
                  <div className="flex flex-wrap gap-2">
                    {availableTags.map(tag => (
                      <button
                        key={tag}
                        onClick={() => toggleTag(currentReviewIndex, tag)}
                        className={`px-3 py-1 rounded-full text-sm transition-all ${
                          generationResults[currentReviewIndex].feedback?.tags?.includes(tag)
                            ? 'bg-blue-600 text-white'
                            : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Text Feedback */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Additional Comments</label>
                  <textarea
                    value={generationResults[currentReviewIndex].feedback?.text || ''}
                    onChange={(e) => updateFeedbackText(currentReviewIndex, e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                    placeholder="Add notes about pacing, transitions, or brand presentation..."
                  />
                </div>
              </div>

              {/* Navigation Controls */}
              <div className="mt-6 flex items-center justify-between">
                <button
                  onClick={() => {
                    setCurrentReviewIndex(Math.max(0, currentReviewIndex - 1));
                    setPlayingVideo(null);
                  }}
                  disabled={currentReviewIndex === 0}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  ← Previous
                </button>

                <div className="flex gap-1">
                  {generationResults.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        setCurrentReviewIndex(index);
                        setPlayingVideo(null);
                      }}
                      className={`w-2 h-2 rounded-full transition-colors ${
                        index === currentReviewIndex ? 'bg-blue-600' : 'bg-gray-300'
                      }`}
                    />
                  ))}
                </div>

                {currentReviewIndex < generationResults.length - 1 ? (
                  <button
                    onClick={() => {
                      setCurrentReviewIndex(currentReviewIndex + 1);
                      setPlayingVideo(null);
                    }}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Next →
                  </button>
                ) : (
                  <button
                    onClick={handleApproveSelected}
                    className="px-6 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Approve Selected Videos
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Success Message with View in Library Button */}
      {approvalSaved && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-8 text-center">
          <svg className="w-12 h-12 text-green-600 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
          </svg>
          <h3 className="text-xl font-semibold text-green-800 mb-2">Video Ads Approved!</h3>
          <p className="text-green-700 mb-4">Your selected video ads have been saved to generated_content with content_type='video_ad'.</p>
          <div className="flex justify-center gap-3">
            <a
              href="/approve"
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              View in Library
            </a>
            <button
              onClick={handleReset}
              className="inline-flex items-center px-6 py-3 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors"
            >
              Generate More Videos
            </button>
          </div>
        </div>
      )}

      {/* Results: Gallery View */}
      {!isReviewMode && generationResults.length > 0 && !approvalSaved && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Generated Video Ads</h2>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setIsReviewMode(true);
                  setCurrentReviewIndex(0);
                  setPlayingVideo(null);
                }}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
              >
                Review & Approve
              </button>
              <button
                onClick={handleReset}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
              >
                Generate New Set
              </button>
            </div>
          </div>

          {/* Video Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {variations.map((variation, index) => {
              const result = generationResults[index];
              if (!result) return null;

              return (
                <div key={variation.id} className="bg-gray-50 rounded-lg overflow-hidden">
                  <div className="p-4 border-b border-gray-200">
                    <h3 className="font-semibold text-gray-900">{variation.name}</h3>
                    <p className="text-sm text-gray-600 mt-1">{variation.style} • {variation.duration}</p>
                  </div>

                  <div className="p-4 space-y-3">
                    {/* Model A Thumbnail with Play Button */}
                    <div className="relative">
                      <div className="aspect-video bg-gray-900 rounded-lg overflow-hidden">
                        {result.modelA.thumbnailUrl && (
                          <img
                            src={result.modelA.thumbnailUrl}
                            alt={`Model A - ${variation.name}`}
                            className="w-full h-full object-cover"
                          />
                        )}
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="bg-white bg-opacity-90 rounded-full p-2">
                            <svg className="w-6 h-6 text-gray-900" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M8 5v14l11-7z" />
                            </svg>
                          </div>
                        </div>
                      </div>
                      <span className={`absolute top-2 right-2 px-2 py-1 text-xs rounded ${
                        result.winner === 'A' ? 'bg-blue-600 text-white' : 'bg-black bg-opacity-50 text-white'
                      }`}>
                        Model A {result.winner === 'A' && '• Winner'}
                      </span>
                    </div>

                    {/* Model B Thumbnail with Play Button */}
                    <div className="relative">
                      <div className="aspect-video bg-gray-900 rounded-lg overflow-hidden">
                        {result.modelB.thumbnailUrl && (
                          <img
                            src={result.modelB.thumbnailUrl}
                            alt={`Model B - ${variation.name}`}
                            className="w-full h-full object-cover"
                          />
                        )}
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="bg-white bg-opacity-90 rounded-full p-2">
                            <svg className="w-6 h-6 text-gray-900" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M8 5v14l11-7z" />
                            </svg>
                          </div>
                        </div>
                      </div>
                      <span className={`absolute top-2 right-2 px-2 py-1 text-xs rounded ${
                        result.winner === 'B' ? 'bg-green-600 text-white' : 'bg-black bg-opacity-50 text-white'
                      }`}>
                        Model B {result.winner === 'B' && '• Winner'}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

    </div>
  );
}