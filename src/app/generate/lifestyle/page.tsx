'use client';

import { useState, useEffect } from 'react';
import { useGenerationStore } from '../../../stores/generationStore';
import CitySelector from '../../../components/CitySelector';
import { calculatePreferences } from '../../../lib/preferences';

interface LifestyleVariation {
  id: string;
  name: string;
  model: string;
  location: string;
  description: string;
  prompt: string;
}

interface GenerationResult {
  variationId: string;
  variationName: string;
  modelA: {
    imageUrl?: string;
    status: 'idle' | 'generating' | 'completed' | 'error';
    error?: string;
    model?: string;
  };
  modelB: {
    imageUrl?: string;
    status: 'idle' | 'generating' | 'completed' | 'error';
    error?: string;
    model?: string;
  };
  winner?: 'A' | 'B';
  feedback?: string;
}

export default function LifestyleGeneratePage() {
  const { selectedCity, setSelectedCity } = useGenerationStore();
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationResults, setGenerationResults] = useState<GenerationResult[]>([]);
  const [isReviewMode, setIsReviewMode] = useState(false);
  const [currentReviewIndex, setCurrentReviewIndex] = useState(0);
  const [approvalSaved, setApprovalSaved] = useState(false);
  const [selectedVariation, setSelectedVariation] = useState<string | null>(null);
  const [preferenceIndicator, setPreferenceIndicator] = useState<string>('');

  // 3 predefined variations with different model/location combos
  const variations: LifestyleVariation[] = [
    {
      id: 'urban-street',
      name: 'Urban Street Style',
      model: 'Model wearing hoodie',
      location: 'Downtown street corner',
      description: 'Street photography with urban backdrop',
      prompt: 'Urban street fashion photography, model wearing branded hoodie, downtown city backdrop'
    },
    {
      id: 'rooftop-sunset',
      name: 'Rooftop Sunset',
      model: 'Model in t-shirt',
      location: 'City rooftop at golden hour',
      description: 'Elevated view with sunset lighting',
      prompt: 'Rooftop fashion shoot, model in branded t-shirt, city skyline at sunset, golden hour lighting'
    },
    {
      id: 'cafe-casual',
      name: 'Café Casual',
      model: 'Model with hat',
      location: 'Trendy coffee shop',
      description: 'Relaxed lifestyle in café setting',
      prompt: 'Casual lifestyle photography, model wearing branded hat, modern coffee shop interior, natural lighting'
    }
  ];

  // Apply learned preferences on mount
  useEffect(() => {
    const applyPreferences = async () => {
      // Use a default userId for now - in production this would come from auth context
      const userId = 'default-user';

      try {
        const preferences = await calculatePreferences(userId);

        // Check for lifestyle variation preferences in tag preferences
        const variationPrefs = preferences.tagPreferences;

        // Map variations to their preference scores
        const variationConfidences = variations.map(v => ({
          id: v.id,
          confidence: variationPrefs[v.name] || variationPrefs[v.id] || 0
        }));

        // Find the highest confidence variation above 70%
        const highConfidenceVariation = variationConfidences
          .sort((a, b) => b.confidence - a.confidence)
          .find(v => v.confidence > 0.7);

        if (highConfidenceVariation && !selectedVariation) {
          setSelectedVariation(highConfidenceVariation.id);
          setPreferenceIndicator('Based on your preferences');
        }

        // Check for city preferences if no city is selected
        if (!selectedCity && preferences.cityPreferences) {
          const cityIds = Object.keys(preferences.cityPreferences);
          const highConfidenceCity = cityIds.find(id =>
            preferences.cityPreferences[id] > 0.7
          );

          if (highConfidenceCity) {
            // Fetch city details and set it
            fetch('/api/cities')
              .then(res => res.json())
              .then(cities => {
                const matchedCity = cities.find((c: any) => c.id === highConfidenceCity);
                if (matchedCity) {
                  setSelectedCity(matchedCity);
                  setPreferenceIndicator('Based on your preferences');
                }
              })
              .catch(err => console.error('Failed to fetch cities:', err));
          }
        }
      } catch (error) {
        console.error('Error applying preferences:', error);
      }
    };

    applyPreferences();
  }, []); // Run only on mount

  const handleGenerate = async () => {
    if (!selectedCity) return;

    setIsGenerating(true);

    // Initialize results for all variations
    const initialResults: GenerationResult[] = variations.map(variation => ({
      variationId: variation.id,
      variationName: variation.name,
      modelA: { status: 'generating' },
      modelB: { status: 'generating' },
      winner: 'A',
      feedback: ''
    }));
    setGenerationResults(initialResults);

    // Generate for each variation
    for (let i = 0; i < variations.length; i++) {
      const variation = variations[i];

      try {
        // Call API for both Model A and Model B
        const response = await fetch('/api/generate/lifestyle-shot', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            cityId: selectedCity.id,
            cityName: selectedCity.name,
            variation: variation,
            generateBothModels: true
          })
        });

        const data = await response.json();

        // Update results for this variation
        setGenerationResults(prev => {
          const updated = [...prev];
          updated[i] = {
            variationId: variation.id,
            variationName: variation.name,
            modelA: {
              imageUrl: data.modelA?.imageUrl || `https://via.placeholder.com/600x800/4F46E5/ffffff?text=Model+A+${variation.name}`,
              status: 'completed',
              model: data.modelA?.model || 'Sora'
            },
            modelB: {
              imageUrl: data.modelB?.imageUrl || `https://via.placeholder.com/600x800/10B981/ffffff?text=Model+B+${variation.name}`,
              status: 'completed',
              model: data.modelB?.model || 'Nano Banana'
            },
            winner: 'A',
            feedback: ''
          };
          return updated;
        });
      } catch (error) {
        // Handle error for this variation
        setGenerationResults(prev => {
          const updated = [...prev];
          updated[i] = {
            variationId: variation.id,
            variationName: variation.name,
            modelA: { status: 'error', error: 'Failed to generate' },
            modelB: { status: 'error', error: 'Failed to generate' },
            winner: 'A',
            feedback: ''
          };
          return updated;
        });
      }
    }

    setIsGenerating(false);
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
      updated[index] = {
        ...updated[index],
        winner: winner
      };
      return updated;
    });
  };

  const handleFeedbackChange = (index: number, feedback: string) => {
    setGenerationResults(prev => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        feedback: feedback
      };
      return updated;
    });
  };

  const handleApproveSelected = async () => {
    // In a real app, this would save to database
    // For now, just mark as saved and show success
    const approvedShots = generationResults.filter(result =>
      result.winner && result.modelA.status === 'completed'
    );

    console.log('Approved shots:', approvedShots);
    setApprovalSaved(true);

    // Show success message
    alert(`Successfully approved ${approvedShots.length} lifestyle shots!`);
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Generate Lifestyle Shots</h1>
      <p className="text-gray-600 mb-8">Create lifestyle photography with your branded merchandise in realistic settings.</p>

      {/* City Selector */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <CitySelector />
        {preferenceIndicator && selectedCity && (
          <div className="mt-2 text-sm text-blue-600 flex items-center gap-1">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            {preferenceIndicator}
          </div>
        )}
      </div>

      {/* Variation Preview Cards */}
      {!generationResults.length && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Available Variations</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {variations.map(variation => (
              <div key={variation.id} className={`border-2 rounded-lg p-4 transition-all ${
                selectedVariation === variation.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}>
                <h3 className="font-medium text-gray-900 mb-2">
                  {variation.name}
                  {selectedVariation === variation.id && preferenceIndicator && (
                    <span className="text-xs text-blue-600 ml-2">{preferenceIndicator}</span>
                  )}
                </h3>
                <div className="space-y-2 text-sm text-gray-600">
                  <p><span className="font-medium">Model:</span> {variation.model}</p>
                  <p><span className="font-medium">Location:</span> {variation.location}</p>
                  <p className="text-xs">{variation.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Generate Button */}
      {!generationResults.length && (
        <div className="flex justify-center mb-8">
          <button
            onClick={handleGenerate}
            disabled={!selectedCity || isGenerating}
            className={`
              px-8 py-4 rounded-lg font-medium text-lg transition-all
              ${selectedCity && !isGenerating
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
                <span>Generating Lifestyle Shots...</span>
              </div>
            ) : (
              <span>Generate Lifestyle Shots</span>
            )}
          </button>
        </div>
      )}

      {/* Review Mode */}
      {isReviewMode && generationResults.length > 0 && (
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Review & Approve Lifestyle Shots</h2>
              <p className="text-sm text-gray-600 mt-1">
                Shot {currentReviewIndex + 1} of {generationResults.length}: {generationResults[currentReviewIndex]?.variationName}
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

          {/* Current Shot Comparison */}
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
                      {generationResults[currentReviewIndex].winner === 'A' ? '✓ Selected' : 'Select'}
                    </button>
                  </div>
                  <div className="aspect-[3/4] bg-gray-100 rounded-lg overflow-hidden">
                    {generationResults[currentReviewIndex].modelA.imageUrl && (
                      <img
                        src={generationResults[currentReviewIndex].modelA.imageUrl}
                        alt={`Model A - ${generationResults[currentReviewIndex].variationName}`}
                        className="w-full h-full object-cover"
                      />
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
                      {generationResults[currentReviewIndex].winner === 'B' ? '✓ Selected' : 'Select'}
                    </button>
                  </div>
                  <div className="aspect-[3/4] bg-gray-100 rounded-lg overflow-hidden">
                    {generationResults[currentReviewIndex].modelB.imageUrl && (
                      <img
                        src={generationResults[currentReviewIndex].modelB.imageUrl}
                        alt={`Model B - ${generationResults[currentReviewIndex].variationName}`}
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                </div>
              </div>

              {/* Feedback Section */}
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Feedback for {generationResults[currentReviewIndex].variationName}
                </label>
                <textarea
                  value={generationResults[currentReviewIndex].feedback || ''}
                  onChange={(e) => handleFeedbackChange(currentReviewIndex, e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="Add notes about lighting, composition, or model pose..."
                />
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
                  <div className="flex gap-3">
                    <button
                      onClick={handleApproveSelected}
                      className="px-6 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors"
                    >
                      Approve Selected
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Success Message & Continue Button */}
      {approvalSaved && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-8 text-center">
          <svg className="w-12 h-12 text-green-600 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
          </svg>
          <h3 className="text-xl font-semibold text-green-800 mb-2">Lifestyle Shots Approved!</h3>
          <p className="text-green-700 mb-4">Your selected lifestyle shots have been saved successfully.</p>
          <a
            href="/generate/social"
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            Continue to Social Content →
          </a>
        </div>
      )}

      {/* Results: Scrollable Comparison Gallery */}
      {!isReviewMode && generationResults.length > 0 && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Generated Lifestyle Shots</h2>
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

          {/* Scrollable Gallery Container */}
          <div className="overflow-x-auto pb-4">
            <div className="flex space-x-6 min-w-max">
              {variations.map((variation, index) => {
                const result = generationResults[index];
                if (!result) return null;

                return (
                  <div key={variation.id} className="flex-shrink-0 w-[600px]">
                    {/* Variation Header */}
                    <div className="bg-gray-50 rounded-t-lg p-4 border-b border-gray-200">
                      <h3 className="font-semibold text-lg text-gray-900">{variation.name}</h3>
                      <p className="text-sm text-gray-600 mt-1">{variation.description}</p>
                    </div>

                    {/* Model A and Model B Comparison with Winner Indicator */}
                    <div className="grid grid-cols-2 gap-4 p-4 bg-white rounded-b-lg">
                      {/* Model A */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-blue-600">
                            Model A
                            {result.winner === 'A' && (
                              <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">Winner</span>
                            )}
                          </span>
                          {result.modelA.status === 'generating' && (
                            <svg className="animate-spin h-4 w-4 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                          )}
                        </div>
                        <div className="aspect-[3/4] bg-gray-100 rounded-lg overflow-hidden">
                          {result.modelA.status === 'completed' && result.modelA.imageUrl ? (
                            <img
                              src={result.modelA.imageUrl}
                              alt={`Model A - ${variation.name}`}
                              className="w-full h-full object-cover"
                            />
                          ) : result.modelA.status === 'generating' ? (
                            <div className="w-full h-full flex items-center justify-center">
                              <div className="text-gray-400">Generating...</div>
                            </div>
                          ) : result.modelA.status === 'error' ? (
                            <div className="w-full h-full flex items-center justify-center">
                              <div className="text-red-500 text-sm text-center px-4">
                                {result.modelA.error || 'Generation failed'}
                              </div>
                            </div>
                          ) : null}
                        </div>
                      </div>

                      {/* Model B */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-green-600">
                            Model B
                            {result.winner === 'B' && (
                              <span className="ml-2 text-xs bg-green-100 text-green-700 px-2 py-1 rounded">Winner</span>
                            )}
                          </span>
                          {result.modelB.status === 'generating' && (
                            <svg className="animate-spin h-4 w-4 text-green-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                          )}
                        </div>
                        <div className="aspect-[3/4] bg-gray-100 rounded-lg overflow-hidden">
                          {result.modelB.status === 'completed' && result.modelB.imageUrl ? (
                            <img
                              src={result.modelB.imageUrl}
                              alt={`Model B - ${variation.name}`}
                              className="w-full h-full object-cover"
                            />
                          ) : result.modelB.status === 'generating' ? (
                            <div className="w-full h-full flex items-center justify-center">
                              <div className="text-gray-400">Generating...</div>
                            </div>
                          ) : result.modelB.status === 'error' ? (
                            <div className="w-full h-full flex items-center justify-center">
                              <div className="text-red-500 text-sm text-center px-4">
                                {result.modelB.error || 'Generation failed'}
                              </div>
                            </div>
                          ) : null}
                        </div>
                      </div>
                    </div>

                    {/* Variation Details */}
                    <div className="mt-2 p-3 bg-gray-50 rounded-lg text-xs text-gray-600">
                      <div className="flex justify-between">
                        <span><strong>Model:</strong> {variation.model}</span>
                        <span><strong>Location:</strong> {variation.location}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Scroll Indicator */}
          <div className="text-center text-sm text-gray-500 mt-4">
            <span className="flex items-center justify-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 9l4-4 4 4m0 6l-4 4-4-4"></path>
              </svg>
              Scroll horizontally to view all variations
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 9l4-4 4 4m0 6l-4 4-4-4"></path>
              </svg>
            </span>
          </div>
        </div>
      )}

      {/* Info Message when no city selected */}
      {!selectedCity && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
          <p className="text-yellow-800">Please select a city to generate lifestyle shots</p>
        </div>
      )}
    </div>
  );
}