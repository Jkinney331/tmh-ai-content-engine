'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useGenerationStore } from '../../stores/generationStore';

export default function ShotsContent() {
  const searchParams = useSearchParams();
  const designId = searchParams.get('designId');
  const [designDetails, setDesignDetails] = useState<any>(null);
  const { selectedCity } = useGenerationStore();

  useEffect(() => {
    if (designId) {
      // In a real app, fetch design details from API
      setDesignDetails({
        id: designId,
        productType: searchParams.get('productType'),
        style: searchParams.get('style'),
        imageUrl: searchParams.get('imageUrl')
      });
    }
  }, [designId, searchParams]);

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Product Shots</h1>

      {designId ? (
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Selected Design</h2>
            <p className="text-gray-600">Design ID: {designId}</p>
            {designDetails?.productType && (
              <p className="text-gray-600">Product: {designDetails.productType}</p>
            )}
            {designDetails?.style && (
              <p className="text-gray-600">Style: {designDetails.style}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Mock Product Shot Options */}
            <div className="border-2 border-gray-200 rounded-lg p-4 hover:border-blue-500 transition-colors cursor-pointer">
              <div className="aspect-square bg-gray-100 rounded-lg mb-3 flex items-center justify-center">
                <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="font-medium text-gray-900">Street Style</h3>
              <p className="text-sm text-gray-500 mt-1">Urban environment backdrop</p>
            </div>

            <div className="border-2 border-gray-200 rounded-lg p-4 hover:border-blue-500 transition-colors cursor-pointer">
              <div className="aspect-square bg-gray-100 rounded-lg mb-3 flex items-center justify-center">
                <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="font-medium text-gray-900">Studio Shot</h3>
              <p className="text-sm text-gray-500 mt-1">Clean professional backdrop</p>
            </div>

            <div className="border-2 border-gray-200 rounded-lg p-4 hover:border-blue-500 transition-colors cursor-pointer">
              <div className="aspect-square bg-gray-100 rounded-lg mb-3 flex items-center justify-center">
                <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="font-medium text-gray-900">Lifestyle</h3>
              <p className="text-sm text-gray-500 mt-1">In-context product usage</p>
            </div>

            <div className="border-2 border-gray-200 rounded-lg p-4 hover:border-blue-500 transition-colors cursor-pointer">
              <div className="aspect-square bg-gray-100 rounded-lg mb-3 flex items-center justify-center">
                <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="font-medium text-gray-900">Flat Lay</h3>
              <p className="text-sm text-gray-500 mt-1">Top-down product view</p>
            </div>

            <div className="border-2 border-gray-200 rounded-lg p-4 hover:border-blue-500 transition-colors cursor-pointer">
              <div className="aspect-square bg-gray-100 rounded-lg mb-3 flex items-center justify-center">
                <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="font-medium text-gray-900">Model Shot</h3>
              <p className="text-sm text-gray-500 mt-1">On-model product display</p>
            </div>

            <div className="border-2 border-gray-200 rounded-lg p-4 hover:border-blue-500 transition-colors cursor-pointer">
              <div className="aspect-square bg-gray-100 rounded-lg mb-3 flex items-center justify-center">
                <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="font-medium text-gray-900">360° View</h3>
              <p className="text-sm text-gray-500 mt-1">Multiple angle showcase</p>
            </div>
          </div>

          <div className="mt-8 flex justify-center gap-4">
            <button className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors">
              Back to Generate
            </button>
            <button className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              Generate Product Shots
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">No Design Selected</h2>
          <p className="text-gray-600 mb-6">Please select a design from the generate page first.</p>
          <a
            href="/generate"
            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go to Generate
          </a>
        </div>
      )}
    </div>
  );
}