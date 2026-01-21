'use client';

import { useState, useEffect } from 'react';
import CitySelector from '../../components/CitySelector';
import ComparisonViewer from '../../components/ComparisonViewer';
import { useGenerationStore, ProductType, DesignStyle, SlangTerm } from '../../stores/generationStore';
import type { Generation } from '../../types/generation';
import { calculatePreferences } from '../../lib/preferences';

export default function GeneratePage() {
  const {
    selectedCity,
    selectedProductType,
    selectedDesignStyle,
    selectedSlangTerm,
    setSelectedProductType,
    setSelectedDesignStyle,
    setSelectedSlangTerm
  } = useGenerationStore();
  const [hoveredStyle, setHoveredStyle] = useState<DesignStyle | null>(null);
  const [slangTerms, setSlangTerms] = useState<SlangTerm[]>([]);
  const [loadingSlang, setLoadingSlang] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationResults, setGenerationResults] = useState<{ modelA: Generation; modelB: Generation } | null>(null);
  const [preferenceIndicators, setPreferenceIndicators] = useState<{
    productType?: string;
    designStyle?: string;
  }>({});

  const productTypes: { value: ProductType; label: string; icon: string }[] = [
    { value: 'hoodie', label: 'Hoodie', icon: '🧥' },
    { value: 't-shirt', label: 'T-Shirt', icon: '👕' },
    { value: 'hat', label: 'Hat', icon: '🧢' },
  ];

  const designStyles: { value: DesignStyle; label: string; description: string }[] = [
    {
      value: 'minimal',
      label: 'Minimal',
      description: 'Clean and simple design with lots of white space'
    },
    {
      value: 'bold',
      label: 'Bold',
      description: 'High contrast, striking typography and vibrant colors'
    },
    {
      value: 'vintage',
      label: 'Vintage',
      description: 'Classic retro aesthetics with nostalgic elements'
    },
    {
      value: 'modern',
      label: 'Modern',
      description: 'Contemporary design with current trends'
    },
    {
      value: 'luxury',
      label: 'Luxury',
      description: 'Premium feel with elegant and sophisticated elements'
    }
  ];

  // Check if all required fields are selected
  const canGenerate = selectedCity && selectedProductType && selectedDesignStyle;

  // Handle generate button click
  const handleGenerateAnother = () => {
    // Reset generation results to show form again
    setGenerationResults(null);
    // Optionally reset selections if desired
    // setSelectedProductType(null);
    // setSelectedDesignStyle(null);
    // setSelectedSlangTerm(null);
  };

  const handleGenerate = async () => {
    if (!canGenerate || !selectedCity) return;

    setIsGenerating(true);

    // Create initial generation objects for both models
    const modelAGeneration: Generation = {
      id: `gen-a-${Date.now()}`,
      cityId: selectedCity.id,
      prompt: `Generate a ${selectedProductType} design with ${selectedDesignStyle} style for ${selectedCity.name}`,
      status: 'generating',
      model: 'modelA',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const modelBGeneration: Generation = {
      id: `gen-b-${Date.now()}`,
      cityId: selectedCity.id,
      prompt: `Generate a ${selectedProductType} design with ${selectedDesignStyle} style for ${selectedCity.name}`,
      status: 'generating',
      model: 'modelB',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Set initial generation results
    setGenerationResults({ modelA: modelAGeneration, modelB: modelBGeneration });

    // Simulate generation process (replace with actual API call later)
    setTimeout(() => {
      // Simulate completed generations with mock image URLs
      const completedModelA: Generation = {
        ...modelAGeneration,
        status: 'completed',
        imageUrl: `https://via.placeholder.com/400x400/4F46E5/ffffff?text=Model+A+${selectedProductType}`,
        metadata: {
          processingTime: 2500,
        },
        updatedAt: new Date(),
      };

      const completedModelB: Generation = {
        ...modelBGeneration,
        status: 'completed',
        imageUrl: `https://via.placeholder.com/400x400/10B981/ffffff?text=Model+B+${selectedProductType}`,
        metadata: {
          processingTime: 3200,
        },
        updatedAt: new Date(),
      };

      setGenerationResults({ modelA: completedModelA, modelB: completedModelB });
      setIsGenerating(false);
    }, 3000);
  };

  // Fetch approved slang terms when city changes
  useEffect(() => {
    if (selectedCity) {
      setLoadingSlang(true);
      fetch(`/api/cities/${selectedCity.id}/elements`)
        .then(res => res.json())
        .then(data => {
          // Filter for approved slang terms
          const approvedSlang = data
            .filter((element: any) => element.element_type === 'slang' && element.status === 'approved')
            .map((element: any) => ({
              id: element.id,
              term: element.element_value.term || element.element_key,
              meaning: element.element_value.meaning || '',
              usage: element.element_value.usage,
              popularity: element.element_value.popularity
            }));
          setSlangTerms(approvedSlang);
        })
        .catch(err => {
          console.error('Failed to fetch slang terms:', err);
          setSlangTerms([]);
        })
        .finally(() => {
          setLoadingSlang(false);
        });
    } else {
      setSlangTerms([]);
    }
  }, [selectedCity]);

  // Apply learned preferences on mount
  useEffect(() => {
    const applyPreferences = async () => {
      // Use a default userId for now - in production this would come from auth context
      const userId = 'default-user';

      try {
        const preferences = await calculatePreferences(userId);

        // Apply product type preference if confidence > 70%
        const productTypePrefs = preferences.tagPreferences;
        const productTypeConfidences = productTypes.map(pt => ({
          type: pt.value,
          confidence: productTypePrefs[pt.value] || 0
        }));

        const highConfidenceProduct = productTypeConfidences.find(p => p.confidence > 0.7);
        if (highConfidenceProduct && !selectedProductType) {
          setSelectedProductType(highConfidenceProduct.type as ProductType);
          setPreferenceIndicators(prev => ({ ...prev, productType: 'Based on your preferences' }));
        }

        // Apply design style preference if confidence > 70%
        const stylePrefs = preferences.tagPreferences;
        const styleConfidences = designStyles.map(ds => ({
          style: ds.value,
          confidence: stylePrefs[ds.value] || 0
        }));

        const highConfidenceStyle = styleConfidences.find(s => s.confidence > 0.7);
        if (highConfidenceStyle && !selectedDesignStyle) {
          setSelectedDesignStyle(highConfidenceStyle.style as DesignStyle);
          setPreferenceIndicators(prev => ({ ...prev, designStyle: 'Based on your preferences' }));
        }
      } catch (error) {
        console.error('Error applying preferences:', error);
      }
    };

    applyPreferences();
  }, []); // Run only on mount

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Generate Content</h1>
      <p className="text-gray-600 mb-8">Generate AI-powered content for your campaigns.</p>

      <div className="bg-white rounded-lg shadow-md p-6">
        <CitySelector />

        {/* Product Type Selector */}
        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Select Product Type
          </label>
          <div className="grid grid-cols-3 gap-4">
            {productTypes.map((product) => (
              <label
                key={product.value}
                className={`
                  relative flex flex-col items-center justify-center p-4 cursor-pointer rounded-lg border-2 transition-all
                  ${selectedProductType === product.value
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300 bg-white'
                  }
                `}
              >
                <input
                  type="radio"
                  name="productType"
                  value={product.value}
                  checked={selectedProductType === product.value}
                  onChange={(e) => setSelectedProductType(e.target.value as ProductType)}
                  className="sr-only"
                />
                <span className="text-3xl mb-2" role="img" aria-label={product.label}>
                  {product.icon}
                </span>
                <span className={`text-sm font-medium ${
                  selectedProductType === product.value ? 'text-blue-700' : 'text-gray-700'
                }`}>
                  {product.label}
                </span>
                {selectedProductType === product.value && preferenceIndicators.productType && (
                  <span className="text-xs text-blue-600 mt-1">
                    {preferenceIndicators.productType}
                  </span>
                )}
                {selectedProductType === product.value && (
                  <div className="absolute top-2 right-2">
                    <svg className="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </label>
            ))}
          </div>
        </div>

        {/* Design Style Selector */}
        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Select Design Style
          </label>
          <div className="space-y-3">
            {designStyles.map((style) => (
              <label
                key={style.value}
                className={`
                  relative flex items-center p-4 cursor-pointer rounded-lg border-2 transition-all
                  ${selectedDesignStyle === style.value
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300 bg-white'
                  }
                `}
                onMouseEnter={() => setHoveredStyle(style.value)}
                onMouseLeave={() => setHoveredStyle(null)}
              >
                <input
                  type="radio"
                  name="designStyle"
                  value={style.value}
                  checked={selectedDesignStyle === style.value}
                  onChange={(e) => setSelectedDesignStyle(e.target.value as DesignStyle)}
                  className="sr-only"
                />
                <div className="flex-1">
                  <div className="flex items-center">
                    <span className={`text-sm font-medium ${
                      selectedDesignStyle === style.value ? 'text-blue-700' : 'text-gray-700'
                    }`}>
                      {style.label}
                      {selectedDesignStyle === style.value && preferenceIndicators.designStyle && (
                        <span className="text-xs text-blue-600 ml-2">
                          {preferenceIndicators.designStyle}
                        </span>
                      )}
                    </span>
                    {/* Tooltip */}
                    {hoveredStyle === style.value && (
                      <div className="absolute left-full ml-2 z-10 w-48 p-2 bg-gray-900 text-white text-xs rounded shadow-lg">
                        {style.description}
                        <div className="absolute right-full top-1/2 -mt-1 ml-px">
                          <div className="border-4 border-transparent border-r-gray-900"></div>
                        </div>
                      </div>
                    )}
                  </div>
                  <p className={`text-xs mt-1 ${
                    selectedDesignStyle === style.value ? 'text-blue-600' : 'text-gray-500'
                  }`}>
                    {style.description}
                  </p>
                </div>
                {selectedDesignStyle === style.value && (
                  <div className="ml-auto">
                    <svg className="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </label>
            ))}
          </div>
        </div>

        {/* Slang Term Selector */}
        {selectedCity && (
          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Select Slang Term
            </label>
            {loadingSlang ? (
              <div className="flex items-center justify-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <div className="space-y-2">
                {/* AI Suggest Option */}
                <label
                  className={`
                    relative flex items-center p-4 cursor-pointer rounded-lg border-2 transition-all
                    ${selectedSlangTerm === 'ai-suggest'
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                    }
                  `}
                >
                  <input
                    type="radio"
                    name="slangTerm"
                    value="ai-suggest"
                    checked={selectedSlangTerm === 'ai-suggest'}
                    onChange={() => setSelectedSlangTerm('ai-suggest')}
                    className="sr-only"
                  />
                  <div className="flex-1">
                    <div className="flex items-center">
                      <span className="text-2xl mr-3">🤖</span>
                      <div>
                        <span className={`text-sm font-medium ${
                          selectedSlangTerm === 'ai-suggest' ? 'text-blue-700' : 'text-gray-700'
                        }`}>
                          Let AI Suggest
                        </span>
                        <p className={`text-xs mt-1 ${
                          selectedSlangTerm === 'ai-suggest' ? 'text-blue-600' : 'text-gray-500'
                        }`}>
                          AI will pick the perfect slang term for your design
                        </p>
                      </div>
                    </div>
                  </div>
                  {selectedSlangTerm === 'ai-suggest' && (
                    <div className="ml-auto">
                      <svg className="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                </label>

                {/* Slang Terms List */}
                {slangTerms.length > 0 ? (
                  slangTerms.map((term) => (
                    <label
                      key={term.id}
                      className={`
                        relative flex items-center p-4 cursor-pointer rounded-lg border-2 transition-all
                        ${selectedSlangTerm && typeof selectedSlangTerm === 'object' && selectedSlangTerm.id === term.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300 bg-white'
                        }
                      `}
                    >
                      <input
                        type="radio"
                        name="slangTerm"
                        value={term.id}
                        checked={!!selectedSlangTerm && typeof selectedSlangTerm === 'object' && selectedSlangTerm.id === term.id}
                        onChange={() => setSelectedSlangTerm(term)}
                        className="sr-only"
                      />
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <span className={`text-sm font-medium ${
                              selectedSlangTerm && typeof selectedSlangTerm === 'object' && selectedSlangTerm.id === term.id
                                ? 'text-blue-700'
                                : 'text-gray-700'
                            }`}>
                              {term.term}
                            </span>
                            <span className="text-gray-500 text-sm ml-2">- {term.meaning}</span>
                            {term.usage && (
                              <p className={`text-xs mt-1 ${
                                selectedSlangTerm && typeof selectedSlangTerm === 'object' && selectedSlangTerm.id === term.id
                                  ? 'text-blue-600'
                                  : 'text-gray-500'
                              }`}>
                                {term.usage}
                              </p>
                            )}
                          </div>
                          {term.popularity && (
                            <span className={`ml-3 px-2 py-1 text-xs rounded-full ${
                              term.popularity === 'very high' || term.popularity === 'high'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-gray-100 text-gray-600'
                            }`}>
                              {term.popularity}
                            </span>
                          )}
                        </div>
                      </div>
                      {selectedSlangTerm && typeof selectedSlangTerm === 'object' && selectedSlangTerm.id === term.id && (
                        <div className="ml-auto">
                          <svg className="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                    </label>
                  ))
                ) : (
                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md">
                    <p className="text-yellow-800 text-sm">
                      No approved slang terms available for {selectedCity.name}. Please approve some slang terms in the city details page or use AI suggestion.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {!selectedCity && (
          <div className="mt-8 p-4 bg-gray-50 rounded-md text-center">
            <p className="text-gray-500">Select a city to begin generating content</p>
          </div>
        )}

        {/* Generate Button Section */}
        <div className="mt-8 flex justify-center">
          <button
            onClick={handleGenerate}
            disabled={!canGenerate || isGenerating}
            className={`
              relative px-8 py-4 rounded-lg font-medium text-lg transition-all
              ${canGenerate && !isGenerating
                ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }
            `}
          >
            {isGenerating ? (
              <div className="flex items-center space-x-3">
                {/* Spinner */}
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Generating with 2 models...</span>
              </div>
            ) : (
              <span>Generate Designs</span>
            )}
          </button>
        </div>

        {/* Status Messages */}
        {!canGenerate && !isGenerating && (
          <div className="mt-4 text-center">
            <p className="text-sm text-gray-500">
              Please select a city, product type, and design style to enable generation
            </p>
          </div>
        )}

        {selectedCity && canGenerate && !isGenerating && (
          <div className="mt-6">
            <div className="p-4 border border-gray-200 rounded-md bg-gray-50">
              <p className="text-sm text-gray-600 mb-2 font-medium">Selected Configuration:</p>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• City: <span className="font-medium">{selectedCity.name}, {selectedCity.state}</span></li>
                <li>• Product: <span className="font-medium">{productTypes.find(p => p.value === selectedProductType)?.label || 'Not selected'}</span></li>
                <li>• Style: <span className="font-medium">{designStyles.find(s => s.value === selectedDesignStyle)?.label || 'Not selected'}</span></li>
                <li>• Slang: <span className="font-medium">{
                  selectedSlangTerm === 'ai-suggest'
                    ? 'AI will suggest'
                    : selectedSlangTerm && typeof selectedSlangTerm === 'object'
                      ? selectedSlangTerm.term
                      : 'Not selected'
                }</span></li>
              </ul>
            </div>
          </div>
        )}
      </div>

      {/* Comparison Viewer - Display generation results */}
      {generationResults && (
        <div className="mt-8">
          <ComparisonViewer
            modelA={generationResults.modelA}
            modelB={generationResults.modelB}
            onClose={() => setGenerationResults(null)}
            onGenerateAnother={handleGenerateAnother}
            productType={selectedProductType}
            designStyle={selectedDesignStyle}
          />
        </div>
      )}
    </div>
  );
}