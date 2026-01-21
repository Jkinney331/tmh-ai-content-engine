'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import type { Generation } from '../types/generation';
import { useGenerationStore } from '../stores/generationStore';
import { calculatePreferences } from '../lib/preferences';

interface ComparisonViewerProps {
  modelA: Generation;
  modelB: Generation;
  comparisonId?: string;
  onClose?: () => void;
  onGenerateAnother?: () => void;
  productType?: string;
  designStyle?: string;
}

interface ModelPreference {
  model: 'A' | 'B';
  confidence: number;
}

export default function ComparisonViewer({ modelA, modelB, comparisonId, onClose, onGenerateAnother, productType, designStyle }: ComparisonViewerProps) {
  const router = useRouter();
  const [isMobile, setIsMobile] = useState(false);
  const [selectedWinner, setSelectedWinner] = useState<'A' | 'B' | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [modelPreference, setModelPreference] = useState<ModelPreference | null>(null);
  const [predictionCorrect, setPredictionCorrect] = useState<boolean | null>(null);
  const selectWinner = useGenerationStore((state) => state.selectWinner);

  // Check if viewport is mobile size
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    // Initial check
    checkMobile();

    // Listen for resize events
    window.addEventListener('resize', checkMobile);

    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  // Fetch user preferences and determine if we should show prediction
  useEffect(() => {
    const fetchPreferences = async () => {
      // Use default userId for now - in production this would come from auth context
      const userId = 'default-user';

      try {
        const preferences = await calculatePreferences(userId);

        // Get model preferences
        const modelAPreference = preferences.modelPreferences[modelA.model || ''] || 0.5;
        const modelBPreference = preferences.modelPreferences[modelB.model || ''] || 0.5;

        // Check if we have enough confidence to show a prediction (> 70% win rate)
        if (modelAPreference > 0.7) {
          setModelPreference({
            model: 'A',
            confidence: modelAPreference
          });
        } else if (modelBPreference > 0.7) {
          setModelPreference({
            model: 'B',
            confidence: modelBPreference
          });
        }

        // Also check tag preferences if available
        if (productType && preferences.tagPreferences[productType]) {
          const tagConfidence = preferences.tagPreferences[productType];
          // If we have strong tag preference but no model preference, we could enhance this
          // For now, we'll focus on model preferences as per the requirement
        }
      } catch (error) {
        console.error('Error fetching user preferences:', error);
      }
    };

    // Only fetch preferences when both models are loaded
    if (modelA && modelB) {
      fetchPreferences();
    }
  }, [modelA, modelB, productType]);

  // Handle winner selection
  const handlePickWinner = (winner: 'A' | 'B') => {
    setSelectedWinner(winner);

    // Check if our prediction was correct
    if (modelPreference) {
      setPredictionCorrect(modelPreference.model === winner);

      // Track prediction accuracy for improving future predictions
      // In a production app, this would be sent to analytics or stored in the database
      console.log('Prediction accuracy:', {
        predicted: modelPreference.model,
        actual: winner,
        correct: modelPreference.model === winner,
        confidence: modelPreference.confidence,
        contentType: productType || designStyle
      });
    }

    // Store winner in generationStore if comparisonId is provided
    if (comparisonId) {
      selectWinner(comparisonId, winner === 'A' ? 'left' : 'right');
    }

    // Show feedback panel
    setShowFeedback(true);
  };

  // Handle navigation to product shots
  const handleContinueToShots = () => {
    const winnerModel = selectedWinner === 'A' ? modelA : modelB;
    const params = new URLSearchParams({
      designId: winnerModel.id,
      productType: productType || '',
      style: designStyle || '',
      imageUrl: winnerModel.imageUrl || ''
    });
    router.push(`/shots?${params.toString()}`);
  };

  // Placeholder images if no imageUrl is provided
  const placeholderImage = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400"%3E%3Crect width="400" height="400" fill="%23e0e0e0"/%3E%3Ctext x="50%25" y="50%25" font-family="sans-serif" font-size="24" fill="%23999" text-anchor="middle" dominant-baseline="middle"%3EGenerating...%3C/text%3E%3C/svg%3E';

  return (
    <div className="w-full bg-white rounded-lg shadow-md p-6">
      {/* Header with optional close button */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Generation Results</h2>
        {onClose && (
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Close comparison viewer"
          >
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Comparison Grid - Responsive Layout */}
      <div className={`grid gap-6 ${isMobile ? 'grid-cols-1' : 'grid-cols-2'}`}>
        {/* Model A Result */}
        <div className={`flex flex-col relative ${selectedWinner === 'A' ? 'ring-4 ring-green-500 rounded-lg p-4' : 'p-4'}`}>
          {/* Winner Checkmark */}
          {selectedWinner === 'A' && (
            <div className="absolute -top-2 -right-2 bg-green-500 text-white rounded-full p-2 z-10">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
              </svg>
            </div>
          )}

          <div className="mb-3">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-800">Model A</h3>
              {modelPreference && modelPreference.model === 'A' && !selectedWinner && (
                <div className="flex items-center gap-1 px-2 py-1 bg-purple-50 border border-purple-200 rounded-md">
                  <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  <span className="text-xs text-purple-700 font-medium">You usually prefer this style</span>
                </div>
              )}
            </div>
            {modelA.status === 'generating' && (
              <span className="inline-flex items-center mt-1 text-sm text-blue-600">
                <svg className="animate-spin mr-2 h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                </svg>
                Generating...
              </span>
            )}
            {modelA.status === 'failed' && (
              <span className="inline-flex items-center mt-1 text-sm text-red-600">
                <svg className="mr-2 h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"/>
                </svg>
                Generation Failed
              </span>
            )}
            {modelA.status === 'completed' && (
              <span className="inline-flex items-center mt-1 text-sm text-green-600">
                <svg className="mr-2 h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                </svg>
                Completed
              </span>
            )}
          </div>

          {/* Image Container with Fixed Aspect Ratio */}
          <div className="relative bg-gray-100 rounded-lg overflow-hidden aspect-square">
            {modelA.imageUrl ? (
              <img
                src={modelA.imageUrl}
                alt="Model A generated design"
                className="w-full h-full object-contain"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                {modelA.status === 'generating' ? (
                  <div className="text-center">
                    <svg className="animate-spin mx-auto h-12 w-12 text-blue-600 mb-3" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                    </svg>
                    <p className="text-gray-500">Generating design...</p>
                  </div>
                ) : modelA.status === 'failed' ? (
                  <div className="text-center">
                    <svg className="mx-auto h-12 w-12 text-red-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-gray-500">Failed to generate</p>
                    {modelA.metadata?.error && (
                      <p className="text-sm text-red-500 mt-1">{modelA.metadata.error}</p>
                    )}
                  </div>
                ) : (
                  <div className="text-center">
                    <svg className="mx-auto h-12 w-12 text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p className="text-gray-500">Waiting to generate</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Metadata */}
          {modelA.metadata?.processingTime && (
            <p className="text-xs text-gray-500 mt-2">
              Generated in {(modelA.metadata.processingTime / 1000).toFixed(1)}s
            </p>
          )}

          {/* Pick Winner Button */}
          <button
            onClick={() => handlePickWinner('A')}
            disabled={!modelA.imageUrl || !modelB.imageUrl}
            className={`mt-4 px-6 py-3 rounded-lg font-medium transition-all ${
              selectedWinner === 'A'
                ? 'bg-green-500 text-white'
                : 'bg-blue-500 text-white hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed'
            }`}
          >
            {selectedWinner === 'A' ? 'Winner Selected' : 'Pick A'}
          </button>
        </div>

        {/* Model B Result */}
        <div className={`flex flex-col relative ${selectedWinner === 'B' ? 'ring-4 ring-green-500 rounded-lg p-4' : 'p-4'}`}>
          {/* Winner Checkmark */}
          {selectedWinner === 'B' && (
            <div className="absolute -top-2 -right-2 bg-green-500 text-white rounded-full p-2 z-10">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
              </svg>
            </div>
          )}

          <div className="mb-3">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-800">Model B</h3>
              {modelPreference && modelPreference.model === 'B' && !selectedWinner && (
                <div className="flex items-center gap-1 px-2 py-1 bg-purple-50 border border-purple-200 rounded-md">
                  <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  <span className="text-xs text-purple-700 font-medium">You usually prefer this style</span>
                </div>
              )}
            </div>
            {modelB.status === 'generating' && (
              <span className="inline-flex items-center mt-1 text-sm text-blue-600">
                <svg className="animate-spin mr-2 h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                </svg>
                Generating...
              </span>
            )}
            {modelB.status === 'failed' && (
              <span className="inline-flex items-center mt-1 text-sm text-red-600">
                <svg className="mr-2 h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"/>
                </svg>
                Generation Failed
              </span>
            )}
            {modelB.status === 'completed' && (
              <span className="inline-flex items-center mt-1 text-sm text-green-600">
                <svg className="mr-2 h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                </svg>
                Completed
              </span>
            )}
          </div>

          {/* Image Container with Fixed Aspect Ratio */}
          <div className="relative bg-gray-100 rounded-lg overflow-hidden aspect-square">
            {modelB.imageUrl ? (
              <img
                src={modelB.imageUrl}
                alt="Model B generated design"
                className="w-full h-full object-contain"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                {modelB.status === 'generating' ? (
                  <div className="text-center">
                    <svg className="animate-spin mx-auto h-12 w-12 text-blue-600 mb-3" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                    </svg>
                    <p className="text-gray-500">Generating design...</p>
                  </div>
                ) : modelB.status === 'failed' ? (
                  <div className="text-center">
                    <svg className="mx-auto h-12 w-12 text-red-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-gray-500">Failed to generate</p>
                    {modelB.metadata?.error && (
                      <p className="text-sm text-red-500 mt-1">{modelB.metadata.error}</p>
                    )}
                  </div>
                ) : (
                  <div className="text-center">
                    <svg className="mx-auto h-12 w-12 text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p className="text-gray-500">Waiting to generate</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Metadata */}
          {modelB.metadata?.processingTime && (
            <p className="text-xs text-gray-500 mt-2">
              Generated in {(modelB.metadata.processingTime / 1000).toFixed(1)}s
            </p>
          )}

          {/* Pick Winner Button */}
          <button
            onClick={() => handlePickWinner('B')}
            disabled={!modelA.imageUrl || !modelB.imageUrl}
            className={`mt-4 px-6 py-3 rounded-lg font-medium transition-all ${
              selectedWinner === 'B'
                ? 'bg-green-500 text-white'
                : 'bg-blue-500 text-white hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed'
            }`}
          >
            {selectedWinner === 'B' ? 'Winner Selected' : 'Pick B'}
          </button>
        </div>
      </div>

      {/* Feedback Panel */}
      {showFeedback && selectedWinner && (
        <div className="mt-8 p-6 bg-green-50 border-2 border-green-200 rounded-lg">
          <div className="flex items-center mb-4">
            <svg className="w-6 h-6 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
            </svg>
            <h3 className="text-lg font-semibold text-green-800">Design Selected!</h3>
          </div>
          <p className="text-gray-700 mb-4">
            You selected <span className="font-bold">Model {selectedWinner}</span> as your preferred design.
            {comparisonId && " Your choice has been saved."}
          </p>
          {modelPreference && predictionCorrect !== null && (
            <div className={`flex items-center gap-2 mb-4 px-3 py-2 rounded-md ${
              predictionCorrect ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
            }`}>
              {predictionCorrect ? (
                <>
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                  </svg>
                  <span className="text-sm">Our prediction was correct! We're learning your preferences.</span>
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"/>
                  </svg>
                  <span className="text-sm">Thanks for the feedback! We'll improve our predictions.</span>
                </>
              )}
            </div>
          )}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => {
                if (onGenerateAnother) {
                  onGenerateAnother();
                } else {
                  // Reset the comparison viewer
                  setSelectedWinner(null);
                  setShowFeedback(false);
                  if (onClose) onClose();
                }
              }}
              className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Generate Another
            </button>
            <button
              onClick={handleContinueToShots}
              className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center justify-center gap-2"
            >
              Generate Product Shots
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}