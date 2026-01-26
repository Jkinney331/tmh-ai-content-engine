'use client';

import { useState } from 'react';
import { X, Download, Trash2, FileImage, Calendar, Settings, MessageSquare } from 'lucide-react';
import Link from 'next/link';

interface AssetDetailModalProps {
  asset: {
    id: string;
    // Support both old and new schema
    image_url?: string;
    output_url?: string | null;
    image_type?: string | null;
    content_type?: string | null;
    title?: string | null;
    model_used?: string | null;
    model?: string | null;
    prompt_used?: string | null;
    prompt?: string | null;
    duration_seconds?: number | null;
    created_at: string;
    cities?: {
      id: string;
      name: string;
      state?: string | null;
    } | null;
    approval_notes?: string | null;
  };
  onClose: () => void;
  onDelete?: (assetId: string) => void;
}

export default function AssetDetailModal({ asset, onClose, onDelete }: AssetDetailModalProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Support both old and new schema field names
  const imageUrl = asset.output_url || asset.image_url || '';
  const contentType = asset.content_type || asset.image_type;
  const modelUsed = asset.model || asset.model_used;
  const promptUsed = asset.prompt || asset.prompt_used;
  const isVideo = contentType === 'video';

  const getImageUrl = (url: string) => {
    if (!url) return '/placeholder-image.png';
    if (url.startsWith('http') || url.startsWith('data:') || url.startsWith('blob:')) return url;
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    return `${supabaseUrl}/storage/v1/object/public/images/${url}`;
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = getImageUrl(imageUrl);
    link.download = `tmh-asset-${asset.id}.${isVideo ? 'mp4' : 'jpg'}`;
    link.click();
  };

  const handleDelete = async () => {
    if (!onDelete) return;

    setIsDeleting(true);
    try {
      await onDelete(asset.id);
      onClose();
    } catch (error) {
      console.error('Error deleting asset:', error);
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-75 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <h2 className="text-lg font-semibold text-gray-900">Asset Details</h2>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
            {/* Image/Video */}
            <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
              {isVideo ? (
                imageUrl ? (
                  <video
                    src={getImageUrl(imageUrl)}
                    className="h-full w-full object-contain bg-black"
                    controls
                    playsInline
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-800">
                    <div className="text-center text-white">
                      <svg className="w-16 h-16 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <p className="text-lg font-medium">{asset.title || 'Video'}</p>
                      {asset.duration_seconds && <p className="text-sm opacity-75">{asset.duration_seconds} seconds</p>}
                    </div>
                  </div>
                )
              ) : (
                <img
                  src={getImageUrl(imageUrl)}
                  alt={asset.title || contentType || 'Generated asset'}
                  className="w-full h-full object-contain"
                />
              )}
            </div>

            {/* Details */}
            <div className="space-y-6">
              {/* Metadata */}
              <div className="space-y-4">
                {/* Title */}
                {asset.title && (
                  <div className="flex items-start gap-3">
                    <FileImage className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500">Title</p>
                      <p className="text-gray-900">{asset.title}</p>
                    </div>
                  </div>
                )}

                {/* City */}
                {asset.cities && (
                  <div className="flex items-start gap-3">
                    <FileImage className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500">City</p>
                      <p className="text-gray-900">
                        {asset.cities.name}
                        {asset.cities.state && `, ${asset.cities.state}`}
                      </p>
                    </div>
                  </div>
                )}

                {/* Type */}
                {contentType && (
                  <div className="flex items-start gap-3">
                    <FileImage className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500">Content Type</p>
                      <p className="text-gray-900">
                        {contentType.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </p>
                    </div>
                  </div>
                )}

                {/* Model */}
                {modelUsed && (
                  <div className="flex items-start gap-3">
                    <Settings className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500">Model Used</p>
                      <p className="text-gray-900">{modelUsed}</p>
                    </div>
                  </div>
                )}

                {/* Created Date */}
                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Created</p>
                    <p className="text-gray-900">{formatDate(asset.created_at)}</p>
                  </div>
                </div>

                {/* Feedback/Notes */}
                {asset.approval_notes && (
                  <div className="flex items-start gap-3">
                    <MessageSquare className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500">Feedback</p>
                      <p className="text-gray-900">{asset.approval_notes}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Prompt */}
              {promptUsed && (
                <div>
                  <p className="text-sm text-gray-500 mb-2">Generation Prompt</p>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">
                      {promptUsed}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-between p-4 border-t bg-gray-50">
            <div className="flex gap-2">
              {/* Use in Post */}
              <Link
                href={`/content/create?assetId=${asset.id}&assetUrl=${encodeURIComponent(imageUrl)}`}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
              >
                <FileImage className="w-4 h-4" />
                Use in Post
              </Link>

              {/* Download */}
              <button
                onClick={handleDownload}
                className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Download className="w-4 h-4" />
                Download
              </button>
            </div>

            {/* Delete */}
            {onDelete && (
              <div className="relative">
                {showDeleteConfirm ? (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">Delete this asset?</span>
                    <button
                      onClick={handleDelete}
                      disabled={isDeleting}
                      className="px-3 py-1.5 bg-red-600 text-white text-sm font-medium rounded hover:bg-red-700 disabled:bg-red-400 transition-colors"
                    >
                      {isDeleting ? 'Deleting...' : 'Yes, Delete'}
                    </button>
                    <button
                      onClick={() => setShowDeleteConfirm(false)}
                      className="px-3 py-1.5 bg-gray-200 text-gray-700 text-sm font-medium rounded hover:bg-gray-300 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    className="inline-flex items-center gap-2 px-4 py-2 text-red-600 text-sm font-medium rounded-lg hover:bg-red-50 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
