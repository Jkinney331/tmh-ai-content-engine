'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';
import { getImageById, supabase } from '@/lib/supabase';
import Link from 'next/link';
import ComparisonViewer from '@/components/ComparisonViewer';
import type { Generation } from '@/types/generation';

interface Design {
  id: string;
  city_id: string;
  image_url: string;
  prompt?: string;
  product_type?: string;
  style?: string;
  metadata?: any;
  cities?: {
    id: string;
    name: string;
    country?: string;
  };
  status?: string;
  created_at?: string;
}

interface GeneratedShot {
  id: string;
  shotType: string;
  shotName: string;
  modelA: {
    url: string;
    model: string;
  };
  modelB: {
    url: string;
    model: string;
  };
  timestamp: string;
  winner?: 'A' | 'B' | null;
  feedback?: string;
}

function ProductShotsContent() {
  const searchParams = useSearchParams();
  const designId = searchParams.get('designId');
  const [design, setDesign] = useState<Design | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedShotTypes, setSelectedShotTypes] = useState<Set<string>>(
    new Set(['flat-front', 'flat-back', 'ghost', 'hanging', 'macro'])
  );
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState<{
    current: number;
    total: number;
    currentShot: string;
  }>({ current: 0, total: 0, currentShot: '' });
  const [generatedShots, setGeneratedShots] = useState<GeneratedShot[]>([]);
  const [selectedGalleryShot, setSelectedGalleryShot] = useState<GeneratedShot | null>(null);
  const [currentReviewIndex, setCurrentReviewIndex] = useState(0);
  const [isReviewMode, setIsReviewMode] = useState(false);
  const [shotWinners, setShotWinners] = useState<Map<string, { winner: 'A' | 'B', feedback: string }>>(new Map());

  useEffect(() => {
    const fetchDesign = async () => {
      if (!designId) return;

      setLoading(true);
      setError(null);

      try {
        const data = await getImageById(designId);
        setDesign(data as Design);
      } catch (err) {
        console.error('Error fetching design:', err);
        setError('Failed to fetch design details');
      } finally {
        setLoading(false);
      }
    };

    fetchDesign();
  }, [designId]);

  const shotTypes = [
    {
      id: 'flat-front',
      name: 'Flat Lay Front',
      description: 'Top-down view of product front',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v14a1 1 0 01-1 1H5a1 1 0 01-1-1V5z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 9h6v6H9z" />
        </svg>
      )
    },
    {
      id: 'flat-back',
      name: 'Flat Lay Back',
      description: 'Top-down view of product back',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v14a1 1 0 01-1 1H5a1 1 0 01-1-1V5z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 9l6 6m0-6l-6 6" />
        </svg>
      )
    },
    {
      id: 'ghost',
      name: 'Ghost Mannequin',
      description: 'Invisible mannequin effect for 3D shape',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} strokeDasharray="2 2" d="M12 14v7" />
        </svg>
      )
    },
    {
      id: 'hanging',
      name: 'Hanging',
      description: 'Product suspended on hanger',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 0a3 3 0 013 3v1m-3-4a3 3 0 00-3 3v1m0 0v13m6-13v13m-3-13h6" />
        </svg>
      )
    },
    {
      id: 'macro',
      name: 'Macro Detail',
      description: 'Close-up detail shots of fabric and features',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          <circle cx="10" cy="10" r="3" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
        </svg>
      )
    }
  ];

  const toggleShotType = (shotId: string) => {
    const newSelection = new Set(selectedShotTypes);
    if (newSelection.has(shotId)) {
      newSelection.delete(shotId);
    } else {
      newSelection.add(shotId);
    }
    setSelectedShotTypes(newSelection);
  };

  const handlePickWinner = (shotId: string, winner: 'A' | 'B') => {
    const current = shotWinners.get(shotId);
    setShotWinners(new Map(shotWinners.set(shotId, {
      winner: winner,
      feedback: current?.feedback || ''
    })));
  };

  const handleGenerateShots = async () => {
    if (selectedShotTypes.size === 0 || !design) {
      alert('Please select at least one shot type');
      return;
    }

    setIsGenerating(true);
    setGeneratedShots([]);
    setSelectedGalleryShot(null);

    const selectedShotsList = Array.from(selectedShotTypes);
    const selectedShotDetails = shotTypes.filter(shot => selectedShotTypes.has(shot.id));
    const totalShots = selectedShotsList.length;

    setGenerationProgress({ current: 0, total: totalShots, currentShot: '' });

    try {
      for (let i = 0; i < totalShots; i++) {
        const shotType = selectedShotsList[i];
        const shotDetails = selectedShotDetails.find(s => s.id === shotType);

        setGenerationProgress({
          current: i + 1,
          total: totalShots,
          currentShot: shotDetails?.name || shotType
        });

        const response = await fetch('/api/generate/product-shot', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            designId: design.id,
            shotType: shotType,
            shotName: shotDetails?.name || shotType,
            designUrl: design.image_url,
            cityName: design.cities?.name,
            productType: design.metadata?.product_type || 'T-Shirt',
            style: design.metadata?.style || 'Urban'
          }),
        });

        if (!response.ok) {
          throw new Error(`Failed to generate shot ${i + 1}`);
        }

        const data = await response.json();

        const newShot: GeneratedShot = {
          id: `shot-${Date.now()}-${i}`,
          shotType: shotType,
          shotName: shotDetails?.name || shotType,
          modelA: {
            url: data.modelA?.url || '/api/placeholder/400/400',
            model: data.modelA?.model || 'Sora'
          },
          modelB: {
            url: data.modelB?.url || '/api/placeholder/400/400',
            model: data.modelB?.model || 'Nano Banana'
          },
          timestamp: new Date().toISOString(),
          winner: null,
          feedback: ''
        };

        // Set default winner to A for each shot
        setShotWinners(prev => new Map(prev.set(newShot.id, { winner: 'A', feedback: '' })));

        setGeneratedShots(prev => [...prev, newShot]);
      }
    } catch (error) {
      console.error('Error generating shots:', error);
      setError('Failed to generate product shots. Please try again.');
    } finally {
      setIsGenerating(false);
      setGenerationProgress({ current: 0, total: 0, currentShot: '' });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading design details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 mb-4">
            <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-red-600 mb-4">{error}</p>
          <Link
            href="/generate"
            className="inline-block px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Generate
          </Link>
        </div>
      </div>
    );
  }

  if (!designId || !design) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">No Design Selected</h2>
          <p className="text-gray-600 mb-6">Please select a design from the generate page first.</p>
          <Link
            href="/generate"
            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go to Generate
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <Link
            href="/generate"
            className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Generate
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Create Product Shots</h1>
          <p className="text-gray-600 mt-2">Generate professional product photography for your design</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Design Preview */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Design Preview</h2>

              {/* Design Thumbnail */}
              <div className="aspect-square bg-gray-100 rounded-lg mb-4 overflow-hidden">
                {design.image_url ? (
                  <img
                    src={design.image_url}
                    alt="Design preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                )}
              </div>

              {/* Design Details */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Design ID:</span>
                  <span className="text-gray-900 font-mono text-xs">{design.id.slice(0, 8)}...</span>
                </div>
                {design.cities?.name && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">City:</span>
                    <span className="text-gray-900">{design.cities.name}</span>
                  </div>
                )}
                {design.metadata?.product_type && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Product:</span>
                    <span className="text-gray-900">{design.metadata.product_type}</span>
                  </div>
                )}
                {design.metadata?.style && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Style:</span>
                    <span className="text-gray-900">{design.metadata.style}</span>
                  </div>
                )}
                {design.status && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Status:</span>
                    <span className={`font-medium ${
                      design.status === 'approved' ? 'text-green-600' :
                      design.status === 'rejected' ? 'text-red-600' :
                      'text-yellow-600'
                    }`}>
                      {design.status}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Shot Type Selection */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">Select Shot Types</h2>
              <p className="text-sm text-gray-600 mb-6">Choose which product shots to generate (at least one required)</p>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                {shotTypes.map((shot) => (
                  <div
                    key={shot.id}
                    onClick={() => toggleShotType(shot.id)}
                    className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                      selectedShotTypes.has(shot.id)
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-start">
                      <div className="mr-3 mt-1">
                        <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                          selectedShotTypes.has(shot.id)
                            ? 'border-blue-500 bg-blue-500'
                            : 'border-gray-300 bg-white'
                        }`}>
                          {selectedShotTypes.has(shot.id) && (
                            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          )}
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center mb-2">
                          <div className={`mr-2 ${selectedShotTypes.has(shot.id) ? 'text-blue-600' : 'text-gray-400'}`}>
                            {shot.icon}
                          </div>
                          <h3 className="font-medium text-gray-900">{shot.name}</h3>
                        </div>
                        <p className="text-sm text-gray-500">{shot.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Additional Options */}
              <div className="border-t pt-6">
                <h3 className="text-sm font-medium text-gray-900 mb-3">Additional Options</h3>

                <div className="space-y-3">
                  <label className="flex items-center">
                    <input type="checkbox" className="rounded text-blue-600 mr-3" />
                    <span className="text-sm text-gray-700">Include lifestyle context</span>
                  </label>
                  <label className="flex items-center">
                    <input type="checkbox" className="rounded text-blue-600 mr-3" />
                    <span className="text-sm text-gray-700">Generate multiple variations</span>
                  </label>
                  <label className="flex items-center">
                    <input type="checkbox" className="rounded text-blue-600 mr-3" />
                    <span className="text-sm text-gray-700">High resolution output</span>
                  </label>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-8 flex justify-end gap-4">
                <Link
                  href="/generate"
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </Link>
                <button
                  onClick={handleGenerateShots}
                  disabled={selectedShotTypes.size === 0 || isGenerating}
                  className={`px-6 py-2 rounded-lg transition-colors ${
                    selectedShotTypes.size > 0 && !isGenerating
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {isGenerating ? 'Generating...' : 'Generate Product Shots'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Progress Indicator */}
        {isGenerating && (
          <div className="mt-8 bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Generating Product Shots</h3>
              <span className="text-sm text-gray-600">
                Generating shot {generationProgress.current} of {generationProgress.total}...
              </span>
            </div>
            <div className="mb-2">
              <div className="text-sm text-gray-600 mb-1">
                Current: {generationProgress.currentShot}
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{
                    width: `${(generationProgress.current / generationProgress.total) * 100}%`
                  }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Review Mode - Show ComparisonViewer for each shot */}
        {isReviewMode && generatedShots.length > 0 && (
          <div className="mt-8">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">Review Product Shots</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Shot {currentReviewIndex + 1} of {generatedShots.length}: {generatedShots[currentReviewIndex]?.shotName}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setIsReviewMode(false);
                    setCurrentReviewIndex(0);
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Current Shot Comparison */}
              {generatedShots[currentReviewIndex] && (
                <div>
                  <ComparisonViewer
                    modelA={{
                      id: `${generatedShots[currentReviewIndex].id}-A`,
                      cityId: design.city_id || '',
                      prompt: `Product shot: ${generatedShots[currentReviewIndex].shotName}`,
                      imageUrl: generatedShots[currentReviewIndex].modelA.url,
                      status: 'completed' as const,
                      createdAt: new Date(),
                      updatedAt: new Date(),
                      metadata: { model: generatedShots[currentReviewIndex].modelA.model }
                    } as Generation}
                    modelB={{
                      id: `${generatedShots[currentReviewIndex].id}-B`,
                      cityId: design.city_id || '',
                      prompt: `Product shot: ${generatedShots[currentReviewIndex].shotName}`,
                      imageUrl: generatedShots[currentReviewIndex].modelB.url,
                      status: 'completed' as const,
                      createdAt: new Date(),
                      updatedAt: new Date(),
                      metadata: { model: generatedShots[currentReviewIndex].modelB.model }
                    } as Generation}
                    comparisonId={generatedShots[currentReviewIndex].id}
                    productType={design?.metadata?.product_type || 'Product'}
                    designStyle={generatedShots[currentReviewIndex].shotName}
                    onGenerateAnother={() => {
                      // Handle selecting winner for current shot
                      const winner = shotWinners.get(generatedShots[currentReviewIndex].id)?.winner;
                      if (winner) {
                        handlePickWinner(generatedShots[currentReviewIndex].id, winner);
                      }
                    }}
                  />

                  {/* Feedback Input */}
                  <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Feedback for {generatedShots[currentReviewIndex].shotName}
                    </label>
                    <textarea
                      value={shotWinners.get(generatedShots[currentReviewIndex].id)?.feedback || ''}
                      onChange={(e) => {
                        const current = shotWinners.get(generatedShots[currentReviewIndex].id);
                        setShotWinners(new Map(shotWinners.set(
                          generatedShots[currentReviewIndex].id,
                          {
                            winner: current?.winner || 'A',
                            feedback: e.target.value
                          }
                        )));
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows={3}
                      placeholder="Add any notes or feedback about this shot..."
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
                      {generatedShots.map((_, index) => (
                        <button
                          key={index}
                          onClick={() => setCurrentReviewIndex(index)}
                          className={`w-2 h-2 rounded-full ${
                            index === currentReviewIndex ? 'bg-blue-600' : 'bg-gray-300'
                          }`}
                        />
                      ))}
                    </div>

                    {currentReviewIndex < generatedShots.length - 1 ? (
                      <button
                        onClick={() => setCurrentReviewIndex(currentReviewIndex + 1)}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                      >
                        Next →
                      </button>
                    ) : (
                      <button
                        onClick={async () => {
                          // Save all winners to database
                          const approvedShots: any[] = [];
                          for (const shot of generatedShots) {
                            const selection = shotWinners.get(shot.id);
                            if (selection) {
                              const winner = selection.winner === 'A' ? shot.modelA : shot.modelB;
                              approvedShots.push({
                                content_type: 'product_shot',
                                parent_id: design?.id || null,
                                city_id: design?.city_id,
                                generation_params: {
                                  shot_type: shot.shotType,
                                  shot_name: shot.shotName,
                                  feedback: selection.feedback
                                },
                                model_used: winner.model,
                                prompt_used: `Product shot: ${shot.shotName}`,
                                output_url: winner.url,
                                output_metadata: {
                                  shot_type: shot.shotType,
                                  winner_side: selection.winner
                                },
                                status: 'approved'
                              });
                            }
                          }

                          if (approvedShots.length > 0 && design?.city_id) {
                            try {
                              const { data, error } = await supabase
                                .from('generated_content')
                                .insert(approvedShots as any);

                              if (error) {
                                console.error('Error saving approved shots:', error);
                                alert('Failed to save approved shots. Please try again.');
                              } else {
                                alert(`Successfully approved ${approvedShots.length} product shots!`);
                                setIsReviewMode(false);
                                // Optionally redirect or clear the form
                              }
                            } catch (err) {
                              console.error('Error:', err);
                              alert('An error occurred while saving. Please try again.');
                            }
                          }
                        }}
                        className="px-6 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700"
                      >
                        Approve All Winners
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Generated Shots Gallery (Non-Review Mode) */}
        {!isReviewMode && generatedShots.length > 0 && (
          <div className="mt-8 bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Generated Product Shots</h3>
              <button
                onClick={() => {
                  setIsReviewMode(true);
                  setCurrentReviewIndex(0);
                }}
                className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
              >
                Review & Approve Shots
              </button>
            </div>

            {/* Scrollable Gallery */}
            <div className="overflow-x-auto pb-4">
              <div className="flex gap-4" style={{ minWidth: 'max-content' }}>
                {generatedShots.map((shot) => (
                  <div
                    key={shot.id}
                    className="cursor-pointer"
                    onClick={() => setSelectedGalleryShot(shot)}
                  >
                    <div className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors">
                      <h4 className="text-sm font-medium text-gray-900 mb-3">{shot.shotName}</h4>
                      <div className="grid grid-cols-2 gap-2">
                        {/* Model A */}
                        <div className="space-y-1">
                          <div className="text-xs text-gray-500">Model A: {shot.modelA.model}</div>
                          <div className="w-32 h-32 bg-gray-200 rounded overflow-hidden">
                            <img
                              src={shot.modelA.url}
                              alt={`${shot.shotName} - Model A`}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = '/api/placeholder/128/128';
                              }}
                            />
                          </div>
                        </div>
                        {/* Model B */}
                        <div className="space-y-1">
                          <div className="text-xs text-gray-500">Model B: {shot.modelB.model}</div>
                          <div className="w-32 h-32 bg-gray-200 rounded overflow-hidden">
                            <img
                              src={shot.modelB.url}
                              alt={`${shot.shotName} - Model B`}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = '/api/placeholder/128/128';
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Selected Shot Detail View */}
            {selectedGalleryShot && (
              <div className="mt-6 pt-6 border-t">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-lg font-medium text-gray-900">
                    {selectedGalleryShot.shotName} - Comparison View
                  </h4>
                  <button
                    onClick={() => setSelectedGalleryShot(null)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Model A */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h5 className="font-medium text-gray-900">Model A: {selectedGalleryShot.modelA.model}</h5>
                      <button className="text-sm text-blue-600 hover:text-blue-700">Download</button>
                    </div>
                    <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                      <img
                        src={selectedGalleryShot.modelA.url}
                        alt={`${selectedGalleryShot.shotName} - Model A`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/api/placeholder/400/400';
                        }}
                      />
                    </div>
                  </div>
                  {/* Model B */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h5 className="font-medium text-gray-900">Model B: {selectedGalleryShot.modelB.model}</h5>
                      <button className="text-sm text-blue-600 hover:text-blue-700">Download</button>
                    </div>
                    <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                      <img
                        src={selectedGalleryShot.modelB.url}
                        alt={`${selectedGalleryShot.shotName} - Model B`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/api/placeholder/400/400';
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function GenerateShotsContent() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <ProductShotsContent />
    </Suspense>
  );
}