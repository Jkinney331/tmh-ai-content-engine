'use client';

import { useState, useRef } from 'react';
import { useGenerationStore } from '../../../stores/generationStore';
import CitySelector from '../../../components/CitySelector';

// Image generation model options
type ImageModel = 'gpt-5-image' | 'gpt-5-image-mini' | 'gemini-flash' | 'gemini-pro';
type ShotType = 'flat-front' | 'flat-back' | 'ghost' | 'hanging' | 'macro';
type AspectRatio = '1:1' | '4:3' | '3:4' | '16:9' | '9:16';
type GenerationType = 'product' | 'lifestyle';

interface ImageSettings {
  model: ImageModel;
  aspectRatio: AspectRatio;
  generateBothModels: boolean;
}

const IMAGE_MODELS: { id: ImageModel; name: string; description: string; cost: string }[] = [
  { id: 'gpt-5-image', name: 'GPT-5 Image', description: 'Best quality, recommended for finals', cost: '~$0.08/image' },
  { id: 'gpt-5-image-mini', name: 'GPT-5 Image Mini', description: 'Fast iteration, lower cost', cost: '~$0.02/image' },
  { id: 'gemini-flash', name: 'Gemini Flash', description: 'Google model, good for variations', cost: '~$0.03/image' },
  { id: 'gemini-pro', name: 'Gemini Pro', description: 'Google pro model, highest quality', cost: '~$0.06/image' },
];

const SHOT_TYPES: { id: ShotType; name: string; description: string }[] = [
  { id: 'flat-front', name: 'Flat Front', description: 'Top-down front view on white background' },
  { id: 'flat-back', name: 'Flat Back', description: 'Top-down back view showing details' },
  { id: 'ghost', name: 'Ghost Mannequin', description: '3D form with invisible mannequin' },
  { id: 'hanging', name: 'Hanger Shot', description: 'Suspended on hanger, front view' },
  { id: 'macro', name: 'Macro Detail', description: 'Close-up of fabric and stitching' },
];

const ASPECT_RATIOS: { id: AspectRatio; label: string; description: string }[] = [
  { id: '1:1', label: '1:1', description: 'Square (Instagram)' },
  { id: '4:3', label: '4:3', description: 'Landscape (Standard)' },
  { id: '3:4', label: '3:4', description: 'Portrait (Vertical)' },
  { id: '16:9', label: '16:9', description: 'Wide (YouTube)' },
  { id: '9:16', label: '9:16', description: 'Vertical (Stories/TikTok)' },
];

const LIFESTYLE_PRESETS = [
  { id: 'street-casual', name: 'Street Casual', description: 'Model walking through urban neighborhood' },
  { id: 'rooftop-golden', name: 'Rooftop Golden Hour', description: 'Model on rooftop with city skyline at sunset' },
  { id: 'sneaker-focus', name: 'Sneaker Focus', description: 'Close-up lifestyle shot highlighting sneakers' },
  { id: 'coffee-shop', name: 'Coffee Shop', description: 'Model in trendy local coffee shop' },
  { id: 'mural-backdrop', name: 'Mural Backdrop', description: 'Model in front of iconic street art' },
];

interface GenerationResult {
  id: string;
  type: GenerationType;
  shotType?: ShotType;
  presetId?: string;
  presetName?: string;
  modelA: {
    imageUrl?: string;
    model?: string;
    prompt?: string;
    status: 'idle' | 'generating' | 'completed' | 'error';
    error?: string;
  };
  modelB?: {
    imageUrl?: string;
    model?: string;
    prompt?: string;
    status: 'idle' | 'generating' | 'completed' | 'error';
    error?: string;
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

export default function ImageGeneratePage() {
  const { selectedCity } = useGenerationStore();
  const [generationType, setGenerationType] = useState<GenerationType>('product');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationResults, setGenerationResults] = useState<GenerationResult[]>([]);
  const [isReviewMode, setIsReviewMode] = useState(false);
  const [currentReviewIndex, setCurrentReviewIndex] = useState(0);
  const [approvalSaved, setApprovalSaved] = useState(false);
  const [showCityWarning, setShowCityWarning] = useState(false);
  const citySelectorRef = useRef<HTMLDivElement>(null);

  // Product shot settings
  const [selectedShotTypes, setSelectedShotTypes] = useState<ShotType[]>(['flat-front']);
  const [productType, setProductType] = useState('premium streetwear hoodie');
  const [style, setStyle] = useState('urban luxury streetwear');

  // Lifestyle shot settings
  const [selectedPresets, setSelectedPresets] = useState<string[]>(['street-casual']);
  const [customDescription, setCustomDescription] = useState('');

  // Image generation settings
  const [imageSettings, setImageSettings] = useState<ImageSettings>({
    model: 'gemini-pro',
    aspectRatio: '1:1',
    generateBothModels: false
  });

  const handleToggleShotType = (shotType: ShotType) => {
    setSelectedShotTypes(prev =>
      prev.includes(shotType)
        ? prev.filter(st => st !== shotType)
        : [...prev, shotType]
    );
  };

  const handleTogglePreset = (presetId: string) => {
    setSelectedPresets(prev =>
      prev.includes(presetId)
        ? prev.filter(p => p !== presetId)
        : [...prev, presetId]
    );
  };

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
    setApprovalSaved(false);

    const results: GenerationResult[] = [];

    try {
      if (generationType === 'product') {
        // Generate product shots
        for (const shotType of selectedShotTypes) {
          const resultId = `product-${shotType}-${Date.now()}`;
          results.push({
            id: resultId,
            type: 'product',
            shotType,
            modelA: { status: 'generating', model: IMAGE_MODELS.find(m => m.id === imageSettings.model)?.name },
            modelB: imageSettings.generateBothModels ? { status: 'generating' } : undefined,
            winner: 'A',
            feedback: { thumbsUp: false, thumbsDown: false, tags: [], text: '' },
            approved: false
          });
        }
        setGenerationResults([...results]);

        // Generate each shot type
        for (let i = 0; i < selectedShotTypes.length; i++) {
          const shotType = selectedShotTypes[i];
          try {
            const response = await fetch('/api/generate/product-shot', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                shotType,
                productType,
                style,
                cityName: selectedCity.name,
                cityId: selectedCity.id,
                model: imageSettings.model,
                generateBothModels: imageSettings.generateBothModels
              })
            });

            const data = await response.json();

            if (!response.ok) {
              throw new Error(data.error || 'Generation failed');
            }

            setGenerationResults(prev => {
              const updated = [...prev];
              const resultIndex = updated.findIndex(r => r.shotType === shotType);
              if (resultIndex !== -1) {
                updated[resultIndex] = {
                  ...updated[resultIndex],
                  modelA: {
                    imageUrl: data.modelA?.url,
                    model: data.modelA?.model,
                    prompt: data.modelA?.prompt,
                    status: 'completed'
                  },
                  modelB: data.modelB ? {
                    imageUrl: data.modelB?.url,
                    model: data.modelB?.model,
                    prompt: data.modelB?.prompt,
                    status: data.modelB?.error ? 'error' : 'completed',
                    error: data.modelB?.error
                  } : undefined
                };
              }
              return updated;
            });
          } catch (error) {
            setGenerationResults(prev => {
              const updated = [...prev];
              const resultIndex = updated.findIndex(r => r.shotType === shotType);
              if (resultIndex !== -1) {
                updated[resultIndex] = {
                  ...updated[resultIndex],
                  modelA: {
                    status: 'error',
                    error: error instanceof Error ? error.message : 'Unknown error'
                  }
                };
              }
              return updated;
            });
          }
        }
      } else {
        // Generate lifestyle shots
        for (const presetId of selectedPresets) {
          const preset = LIFESTYLE_PRESETS.find(p => p.id === presetId);
          const resultId = `lifestyle-${presetId}-${Date.now()}`;
          results.push({
            id: resultId,
            type: 'lifestyle',
            presetId,
            presetName: preset?.name,
            modelA: { status: 'generating', model: IMAGE_MODELS.find(m => m.id === imageSettings.model)?.name },
            modelB: imageSettings.generateBothModels ? { status: 'generating' } : undefined,
            winner: 'A',
            feedback: { thumbsUp: false, thumbsDown: false, tags: [], text: '' },
            approved: false
          });
        }
        setGenerationResults([...results]);

        // Generate each lifestyle preset
        for (let i = 0; i < selectedPresets.length; i++) {
          const presetId = selectedPresets[i];
          const preset = LIFESTYLE_PRESETS.find(p => p.id === presetId);
          try {
            const response = await fetch('/api/generate/lifestyle-shot', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                cityName: selectedCity.name,
                cityId: selectedCity.id,
                variation: {
                  id: presetId,
                  name: preset?.name,
                  description: customDescription || preset?.description
                },
                model: imageSettings.model,
                aspectRatio: imageSettings.aspectRatio,
                generateBothModels: imageSettings.generateBothModels
              })
            });

            const data = await response.json();

            if (!response.ok) {
              throw new Error(data.error || 'Generation failed');
            }

            setGenerationResults(prev => {
              const updated = [...prev];
              const resultIndex = updated.findIndex(r => r.presetId === presetId);
              if (resultIndex !== -1) {
                updated[resultIndex] = {
                  ...updated[resultIndex],
                  modelA: {
                    imageUrl: data.modelA?.imageUrl,
                    model: data.modelA?.model,
                    prompt: data.modelA?.prompt,
                    status: 'completed'
                  },
                  modelB: data.modelB ? {
                    imageUrl: data.modelB?.imageUrl,
                    model: data.modelB?.model,
                    prompt: data.modelB?.prompt,
                    status: data.modelB?.error ? 'error' : 'completed',
                    error: data.modelB?.error
                  } : undefined
                };
              }
              return updated;
            });
          } catch (error) {
            setGenerationResults(prev => {
              const updated = [...prev];
              const resultIndex = updated.findIndex(r => r.presetId === presetId);
              if (resultIndex !== -1) {
                updated[resultIndex] = {
                  ...updated[resultIndex],
                  modelA: {
                    status: 'error',
                    error: error instanceof Error ? error.message : 'Unknown error'
                  }
                };
              }
              return updated;
            });
          }
        }
      }
    } catch (error) {
      console.error('[Image Generation] Error:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleReset = () => {
    setGenerationResults([]);
    setIsReviewMode(false);
    setCurrentReviewIndex(0);
    setApprovalSaved(false);
  };

  const handlePickWinner = (index: number, winner: 'A' | 'B') => {
    setGenerationResults(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], winner };
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
      updated[index] = { ...updated[index], feedback };
      return updated;
    });
  };

  const toggleTag = (index: number, tag: string) => {
    setGenerationResults(prev => {
      const updated = [...prev];
      const feedback = updated[index].feedback || {};
      const tags = feedback.tags || [];
      feedback.tags = tags.includes(tag) ? tags.filter(t => t !== tag) : [...tags, tag];
      updated[index] = { ...updated[index], feedback };
      return updated;
    });
  };

  const updateFeedbackText = (index: number, text: string) => {
    setGenerationResults(prev => {
      const updated = [...prev];
      const feedback = updated[index].feedback || {};
      feedback.text = text;
      updated[index] = { ...updated[index], feedback };
      return updated;
    });
  };

  const handleApproveSelected = async () => {
    const imagesToApprove = generationResults.filter(r =>
      r.modelA.status === 'completed' && r.modelA.imageUrl
    );

    if (imagesToApprove.length === 0) {
      alert('No completed images to approve');
      return;
    }

    console.log('Saving approved images to generated_content:', imagesToApprove);

    try {
      // Save each approved image to the database
      const savePromises = imagesToApprove.map(async (result) => {
        const winnerImage = result.winner === 'B' && result.modelB?.imageUrl
          ? result.modelB
          : result.modelA;

        const response = await fetch('/api/generated-content', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            city_id: selectedCity?.id,
            content_type: result.type === 'product' ? 'product_shot' : 'lifestyle_shot',
            title: result.presetName || (result.shotType ? `Product Shot - ${result.shotType}` : 'Generated Image'),
            prompt: winnerImage.prompt,
            model: winnerImage.model,
            output_url: winnerImage.imageUrl,
            status: 'approved',
            feedback: result.feedback
          })
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Failed to save image');
        }

        return response.json();
      });

      await Promise.all(savePromises);

      // Update local state
      setGenerationResults(prev => prev.map(result => ({
        ...result,
        approved: true
      })));
      setApprovalSaved(true);

      console.log(`Successfully approved ${imagesToApprove.length} images`);
    } catch (error) {
      console.error('Error saving approved images:', error);
      alert(`Error saving images: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const availableTags = ['Sharp', 'Clean', 'Vibrant', 'Brand-focused', 'Professional', 'Creative'];
  // Check if we have shot types/presets selected (city validation happens on click)
  const hasValidSelection = (generationType === 'product' && selectedShotTypes.length > 0) ||
    (generationType === 'lifestyle' && selectedPresets.length > 0);

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Generate Images</h1>
      <p className="text-gray-600 mb-8">Create product shots and lifestyle images for your branded merchandise.</p>

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

      {/* Generation Type Toggle */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Generation Type</h2>
        <div className="flex gap-4">
          <button
            onClick={() => setGenerationType('product')}
            className={`flex-1 px-4 py-3 rounded-lg font-medium transition-all ${
              generationType === 'product'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <div className="text-lg mb-1">Product Shots</div>
            <div className="text-sm opacity-80">Flat lay, ghost mannequin, hanger shots</div>
          </button>
          <button
            onClick={() => setGenerationType('lifestyle')}
            className={`flex-1 px-4 py-3 rounded-lg font-medium transition-all ${
              generationType === 'lifestyle'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <div className="text-lg mb-1">Lifestyle Shots</div>
            <div className="text-sm opacity-80">Models, locations, street photography</div>
          </button>
        </div>
      </div>

      {/* Image Generation Settings */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Image Settings</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Model Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Model</label>
            <select
              value={imageSettings.model}
              onChange={(e) => setImageSettings(prev => ({ ...prev, model: e.target.value as ImageModel }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isGenerating}
            >
              {IMAGE_MODELS.map(model => (
                <option key={model.id} value={model.id}>
                  {model.name} ({model.cost})
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs text-gray-500">
              {IMAGE_MODELS.find(m => m.id === imageSettings.model)?.description}
            </p>
          </div>

          {/* Aspect Ratio Selection (for lifestyle) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Aspect Ratio</label>
            <select
              value={imageSettings.aspectRatio}
              onChange={(e) => setImageSettings(prev => ({ ...prev, aspectRatio: e.target.value as AspectRatio }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isGenerating || generationType === 'product'}
            >
              {ASPECT_RATIOS.map(ratio => (
                <option key={ratio.id} value={ratio.id}>{ratio.label} - {ratio.description}</option>
              ))}
            </select>
            {generationType === 'product' && (
              <p className="mt-1 text-xs text-gray-500">Product shots use 1:1 square format</p>
            )}
          </div>

          {/* A/B Comparison Toggle */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">A/B Comparison</label>
            <button
              onClick={() => setImageSettings(prev => ({ ...prev, generateBothModels: !prev.generateBothModels }))}
              className={`w-full px-4 py-2 rounded-lg font-medium transition-all ${
                imageSettings.generateBothModels
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              disabled={isGenerating}
            >
              {imageSettings.generateBothModels ? 'Enabled (2 models)' : 'Disabled (1 model)'}
            </button>
            <p className="mt-1 text-xs text-gray-500">
              Generate with two models for comparison
            </p>
          </div>
        </div>
      </div>

      {/* Product Shot Options */}
      {generationType === 'product' && !generationResults.length && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Product Shot Types</h2>

          {/* Product Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Product Type</label>
              <input
                type="text"
                value={productType}
                onChange={(e) => setProductType(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., premium streetwear hoodie"
                disabled={isGenerating}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Style</label>
              <input
                type="text"
                value={style}
                onChange={(e) => setStyle(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., urban luxury streetwear"
                disabled={isGenerating}
              />
            </div>
          </div>

          {/* Shot Type Selection */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {SHOT_TYPES.map(shot => (
              <button
                key={shot.id}
                onClick={() => handleToggleShotType(shot.id)}
                disabled={isGenerating}
                className={`p-4 rounded-lg border-2 transition-all ${
                  selectedShotTypes.includes(shot.id)
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="font-medium text-gray-900">{shot.name}</div>
                <div className="text-xs text-gray-500 mt-1">{shot.description}</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Lifestyle Shot Options */}
      {generationType === 'lifestyle' && !generationResults.length && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Lifestyle Shot Presets</h2>

          {/* Custom Description */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Custom Description (Optional)</label>
            <textarea
              value={customDescription}
              onChange={(e) => setCustomDescription(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={2}
              placeholder="Override preset descriptions with custom instructions..."
              disabled={isGenerating}
            />
          </div>

          {/* Preset Selection */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {LIFESTYLE_PRESETS.map(preset => (
              <button
                key={preset.id}
                onClick={() => handleTogglePreset(preset.id)}
                disabled={isGenerating}
                className={`p-4 rounded-lg border-2 transition-all text-left ${
                  selectedPresets.includes(preset.id)
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="font-medium text-gray-900">{preset.name}</div>
                <div className="text-xs text-gray-500 mt-1">{preset.description}</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Generate Button */}
      {!generationResults.length && (
        <div className="flex flex-col items-center mb-8 gap-3">
          <button
            onClick={handleGenerateClick}
            disabled={!hasValidSelection || isGenerating}
            className={`
              px-8 py-4 rounded-lg font-medium text-lg transition-all
              ${hasValidSelection && !isGenerating
                ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }
            `}
          >
            {isGenerating ? (
              <div className="flex items-center space-x-3">
                <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Generating Images...</span>
              </div>
            ) : (
              <span>
                Generate {generationType === 'product' ? selectedShotTypes.length : selectedPresets.length} {generationType === 'product' ? 'Product Shot' : 'Lifestyle Image'}{(generationType === 'product' ? selectedShotTypes.length : selectedPresets.length) !== 1 ? 's' : ''}
              </span>
            )}
          </button>
          {!selectedCity && hasValidSelection && (
            <p className="text-sm text-gray-500">Select a city above to enable generation</p>
          )}
        </div>
      )}

      {/* Review Mode */}
      {isReviewMode && generationResults.length > 0 && (
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Review & Approve Images</h2>
              <p className="text-sm text-gray-600 mt-1">
                Image {currentReviewIndex + 1} of {generationResults.length}: {generationResults[currentReviewIndex]?.presetName || SHOT_TYPES.find(s => s.id === generationResults[currentReviewIndex]?.shotType)?.name}
              </p>
            </div>
            <button onClick={() => setIsReviewMode(false)} className="text-gray-500 hover:text-gray-700">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {generationResults[currentReviewIndex] && (
            <div>
              <div className={`grid gap-6 ${generationResults[currentReviewIndex].modelB ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1 max-w-2xl mx-auto'}`}>
                {/* Model A */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-lg">Model A</h3>
                      <span className="text-sm text-gray-500">{generationResults[currentReviewIndex].modelA.model}</span>
                    </div>
                    {generationResults[currentReviewIndex].modelB && (
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
                    )}
                  </div>
                  <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                    {generationResults[currentReviewIndex].modelA.status === 'completed' && generationResults[currentReviewIndex].modelA.imageUrl ? (
                      <img
                        src={generationResults[currentReviewIndex].modelA.imageUrl}
                        alt="Model A"
                        className="w-full h-full object-cover"
                      />
                    ) : generationResults[currentReviewIndex].modelA.status === 'generating' ? (
                      <div className="w-full h-full flex items-center justify-center">
                        <div className="text-center">
                          <svg className="animate-spin h-8 w-8 text-blue-600 mx-auto mb-2" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          <p className="text-gray-500">Generating...</p>
                        </div>
                      </div>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-red-500">
                        {generationResults[currentReviewIndex].modelA.error || 'Failed to generate'}
                      </div>
                    )}
                  </div>
                </div>

                {/* Model B (if exists) */}
                {generationResults[currentReviewIndex].modelB && (
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-lg">Model B</h3>
                        <span className="text-sm text-gray-500">{generationResults[currentReviewIndex].modelB?.model}</span>
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
                    <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                      {generationResults[currentReviewIndex].modelB?.status === 'completed' && generationResults[currentReviewIndex].modelB?.imageUrl ? (
                        <img
                          src={generationResults[currentReviewIndex].modelB?.imageUrl}
                          alt="Model B"
                          className="w-full h-full object-cover"
                        />
                      ) : generationResults[currentReviewIndex].modelB?.status === 'generating' ? (
                        <div className="w-full h-full flex items-center justify-center">
                          <div className="text-center">
                            <svg className="animate-spin h-8 w-8 text-blue-600 mx-auto mb-2" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            <p className="text-gray-500">Generating...</p>
                          </div>
                        </div>
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-red-500">
                          {generationResults[currentReviewIndex].modelB?.error || 'Failed to generate'}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Feedback Panel */}
              <div className="mt-6 p-4 bg-gray-50 rounded-lg space-y-4">
                <h4 className="font-medium text-gray-700">Feedback</h4>

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
                    placeholder="Add notes about composition, lighting, or brand presentation..."
                  />
                </div>
              </div>

              {/* Navigation Controls */}
              <div className="mt-6 flex items-center justify-between">
                <button
                  onClick={() => setCurrentReviewIndex(Math.max(0, currentReviewIndex - 1))}
                  disabled={currentReviewIndex === 0}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  ← Previous
                </button>

                <div className="flex gap-1">
                  {generationResults.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentReviewIndex(index)}
                      className={`w-2 h-2 rounded-full transition-colors ${
                        index === currentReviewIndex ? 'bg-blue-600' : 'bg-gray-300'
                      }`}
                    />
                  ))}
                </div>

                {currentReviewIndex < generationResults.length - 1 ? (
                  <button
                    onClick={() => setCurrentReviewIndex(currentReviewIndex + 1)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Next →
                  </button>
                ) : (
                  <button
                    onClick={handleApproveSelected}
                    className="px-6 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Approve Selected Images
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Success Message */}
      {approvalSaved && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-8 text-center">
          <svg className="w-12 h-12 text-green-600 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
          </svg>
          <h3 className="text-xl font-semibold text-green-800 mb-2">Images Approved!</h3>
          <p className="text-green-700 mb-4">Your selected images have been saved to the content library.</p>
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
              Generate More Images
            </button>
          </div>
        </div>
      )}

      {/* Results Gallery View */}
      {!isReviewMode && generationResults.length > 0 && !approvalSaved && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Generated Images</h2>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setIsReviewMode(true);
                  setCurrentReviewIndex(0);
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

          {/* Image Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {generationResults.map((result, index) => (
              <div key={result.id} className="bg-gray-50 rounded-lg overflow-hidden">
                <div className="aspect-square bg-gray-100 relative">
                  {result.modelA.status === 'completed' && result.modelA.imageUrl ? (
                    <img
                      src={result.modelA.imageUrl}
                      alt={result.presetName || SHOT_TYPES.find(s => s.id === result.shotType)?.name}
                      className="w-full h-full object-cover"
                    />
                  ) : result.modelA.status === 'generating' ? (
                    <div className="w-full h-full flex items-center justify-center">
                      <svg className="animate-spin h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    </div>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-red-500 text-sm p-2 text-center">
                      {result.modelA.error || 'Failed'}
                    </div>
                  )}
                  {result.winner && (
                    <span className={`absolute top-2 right-2 px-2 py-1 text-xs rounded ${
                      result.winner === 'A' ? 'bg-blue-600 text-white' : 'bg-green-600 text-white'
                    }`}>
                      Winner: {result.winner}
                    </span>
                  )}
                </div>
                <div className="p-3">
                  <p className="font-medium text-gray-900 text-sm">
                    {result.presetName || SHOT_TYPES.find(s => s.id === result.shotType)?.name}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">{result.modelA.model}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
