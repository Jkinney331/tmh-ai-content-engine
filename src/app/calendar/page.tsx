'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Calendar, Filter, Image, FileText, Video, Clock, CheckCircle, XCircle, Loader2, Download, CheckSquare, Square, Package } from 'lucide-react';

interface GeneratedContent {
  id: string;
  content_type: 'product_shot' | 'lifestyle_shot' | 'social_post' | 'video_ad' | 'image' | 'video';
  city_id: string;
  title?: string | null;
  generation_params?: any;
  // Support both old and new column names
  model_used?: string;
  model?: string;
  prompt_used?: string;
  prompt?: string;
  output_url: string;
  output_metadata?: any;
  duration_seconds?: number | null;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'approved' | 'rejected';
  created_at: string;
  city?: {
    id: string;
    name: string;
  };
}

interface City {
  id: string;
  name: string;
}

const contentTypeIcons: Record<string, React.ReactNode> = {
  product_shot: <Image className="w-4 h-4" />,
  lifestyle_shot: <Image className="w-4 h-4" />,
  social_post: <FileText className="w-4 h-4" />,
  video_ad: <Video className="w-4 h-4" />,
  image: <Image className="w-4 h-4" />,
  video: <Video className="w-4 h-4" />
};

const contentTypeLabels: Record<string, string> = {
  product_shot: 'Product Shot',
  lifestyle_shot: 'Lifestyle Shot',
  social_post: 'Social Post',
  video_ad: 'Video Ad',
  image: 'Image',
  video: 'Video'
};

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800',
  processing: 'bg-blue-100 text-blue-800',
  completed: 'bg-gray-100 text-gray-800',
  failed: 'bg-red-100 text-red-800',
  approved: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800'
};

const statusIcons = {
  pending: <Clock className="w-4 h-4" />,
  processing: <Loader2 className="w-4 h-4 animate-spin" />,
  completed: <CheckCircle className="w-4 h-4" />,
  failed: <XCircle className="w-4 h-4" />,
  approved: <CheckCircle className="w-4 h-4" />,
  rejected: <XCircle className="w-4 h-4" />
};

export default function CalendarPage() {
  const [content, setContent] = useState<GeneratedContent[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCity, setSelectedCity] = useState<string>('all');
  const [selectedContentType, setSelectedContentType] = useState<string>('all');
  const [showOnlyApproved, setShowOnlyApproved] = useState(true);
  const [exportMode, setExportMode] = useState(false);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [exporting, setExporting] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);

  useEffect(() => {
    fetchCities();
    fetchContent();
  }, []);

  useEffect(() => {
    fetchContent();
  }, [selectedCity, selectedContentType, showOnlyApproved]);

  const fetchCities = async () => {
    try {
      const { data, error } = await supabase
        .from('cities')
        .select('id, name')
        .order('name');

      if (error) throw error;
      setCities(data || []);
    } catch (error) {
      console.error('Error fetching cities:', error);
    }
  };

  const fetchContent = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('generated_content')
        .select(`
          *,
          city:cities(id, name)
        `);

      // Apply filters
      if (showOnlyApproved) {
        query = query.eq('status', 'approved');
      }

      if (selectedCity !== 'all') {
        query = query.eq('city_id', selectedCity);
      }

      if (selectedContentType !== 'all') {
        query = query.eq('content_type', selectedContentType);
      }

      // Order by creation date, newest first
      query = query.order('created_at', { ascending: false });

      const { data, error } = await query;

      if (error) throw error;
      setContent(data || []);
    } catch (error) {
      console.error('Error fetching content:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getThumbnail = (item: GeneratedContent) => {
    // For images, return the URL directly
    if (item.content_type === 'product_shot' || item.content_type === 'lifestyle_shot') {
      return item.output_url;
    }

    // For social posts and videos, check metadata for thumbnails
    if (item.output_metadata?.thumbnail) {
      return item.output_metadata.thumbnail;
    }

    // Default placeholder
    return null;
  };

  const getCaptionPreview = (item: GeneratedContent) => {
    // Use title if available
    if (item.title) {
      return item.title;
    }

    // Extract caption from different content types
    if (item.content_type === 'social_post') {
      if (item.output_metadata?.caption) {
        return item.output_metadata.caption;
      }
      if (item.generation_params?.caption) {
        return item.generation_params.caption;
      }
    }

    // For other types, use the prompt as a preview (support both column names)
    const prompt = item.prompt || item.prompt_used;
    if (prompt) {
      return prompt.substring(0, 150) + (prompt.length > 150 ? '...' : '');
    }

    return 'No description available';
  };

  const handleSelectAll = () => {
    const allIds = new Set(content.map(item => item.id));
    setSelectedItems(allIds);
  };

  const handleDeselectAll = () => {
    setSelectedItems(new Set());
  };

  const handleToggleItem = (id: string) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedItems(newSelected);
  };

  const handleExportSelected = async () => {
    setExporting(true);
    setDownloadUrl(null);

    try {
      // Get selected content items
      const selectedContent = content.filter(item => selectedItems.has(item.id));

      // Prepare export data
      const exportData = selectedContent.map(item => ({
        id: item.id,
        content_type: item.content_type,
        title: item.title,
        city: item.city?.name || 'Unknown',
        status: item.status,
        created_at: item.created_at,
        output_url: item.output_url,
        prompt: item.prompt || item.prompt_used,
        model: item.model || item.model_used,
        metadata: item.output_metadata
      }));

      // Call export API
      const response = await fetch('/api/export', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: exportData }),
      });

      if (!response.ok) {
        throw new Error('Export failed');
      }

      const result = await response.json();

      // Set download URL from API response
      if (result.downloadUrl) {
        setDownloadUrl(result.downloadUrl);

        // Automatically trigger download
        downloadExportedContent(result.downloadUrl);
      }
    } catch (error) {
      console.error('Error exporting content:', error);
      alert('Failed to export content. Please try again.');
    } finally {
      setExporting(false);
    }
  };

  const downloadExportedContent = (url: string) => {
    // Create download link
    const a = document.createElement('a');
    a.href = url;
    const date = new Date().toISOString().split('T')[0];
    const cityName = selectedCity !== 'all' ? cities.find(c => c.id === selectedCity)?.name || 'all' : 'all';
    a.download = `tmh-export-${cityName}-${date}.zip`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    // Reset after successful download
    setTimeout(() => {
      setSelectedItems(new Set());
      setExportMode(false);
      setDownloadUrl(null);
    }, 1000);
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center mb-4">
          <Calendar className="w-8 h-8 text-blue-600 mr-3" />
          <h1 className="text-3xl font-bold text-gray-900">Content Calendar</h1>
        </div>
        <p className="text-gray-600">View and manage all approved content in one place</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <Filter className="w-5 h-5 text-gray-500 mr-2" />
            <h2 className="text-lg font-medium">Filters</h2>
          </div>

          {/* Export Mode Toggle */}
          <button
            onClick={() => {
              setExportMode(!exportMode);
              if (!exportMode) {
                setSelectedItems(new Set());
              }
            }}
            className={`px-4 py-2 rounded-md font-medium transition-colors ${
              exportMode
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Download className="w-4 h-4 inline-block mr-2" />
            Export Mode
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* City Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              City
            </label>
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Cities</option>
              {cities.map(city => (
                <option key={city.id} value={city.id}>
                  {city.name}
                </option>
              ))}
            </select>
          </div>

          {/* Content Type Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Content Type
            </label>
            <select
              value={selectedContentType}
              onChange={(e) => setSelectedContentType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Types</option>
              <option value="product_shot">Product Shots</option>
              <option value="lifestyle_shot">Lifestyle Shots</option>
              <option value="social_post">Social Posts</option>
              <option value="video_ad">Video Ads</option>
            </select>
          </div>

          {/* Approval Status Toggle */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <div className="flex items-center h-10">
              <label className="inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={showOnlyApproved}
                  onChange={(e) => setShowOnlyApproved(e.target.checked)}
                  className="mr-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Approved Only</span>
              </label>
            </div>
          </div>

          {/* Results Count */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Results
            </label>
            <div className="flex items-center h-10">
              <span className="text-sm text-gray-500">
                {loading ? 'Loading...' : `${content.length} items`}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Export Controls */}
      {exportMode && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={handleSelectAll}
                className="px-3 py-1.5 bg-white text-blue-600 border border-blue-300 rounded-md hover:bg-blue-50 font-medium text-sm"
              >
                Select All
              </button>
              <button
                onClick={handleDeselectAll}
                className="px-3 py-1.5 bg-white text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 font-medium text-sm"
              >
                Deselect All
              </button>
              <span className="text-sm font-medium text-blue-700">
                {selectedItems.size} {selectedItems.size === 1 ? 'item' : 'items'} selected
              </span>
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={handleExportSelected}
                disabled={selectedItems.size === 0 || exporting}
                className={`px-4 py-2 rounded-md font-medium transition-colors ${
                  selectedItems.size > 0 && !exporting
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                {exporting ? (
                  <>
                    <Loader2 className="w-4 h-4 inline-block mr-2 animate-spin" />
                    Exporting...
                  </>
                ) : (
                  <>
                    <Package className="w-4 h-4 inline-block mr-2" />
                    Export Selected
                  </>
                )}
              </button>

              {downloadUrl && (
                <button
                  onClick={() => downloadExportedContent(downloadUrl)}
                  className="px-4 py-2 bg-green-600 text-white rounded-md font-medium hover:bg-green-700 transition-colors animate-pulse"
                >
                  <Download className="w-4 h-4 inline-block mr-2" />
                  Download ZIP
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Content Grid */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
        </div>
      ) : content.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm p-12 text-center">
          <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No content found with the selected filters</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {content.map((item) => {
            const thumbnail = getThumbnail(item);
            const caption = getCaptionPreview(item);

            return (
              <div
                key={item.id}
                className={`bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow relative ${
                  exportMode && selectedItems.has(item.id) ? 'ring-2 ring-blue-500' : ''
                }`}
              >
                {/* Checkbox for export mode */}
                {exportMode && (
                  <div className="absolute top-2 left-2 z-10">
                    <button
                      onClick={() => handleToggleItem(item.id)}
                      className="w-6 h-6 bg-white rounded border-2 border-gray-300 flex items-center justify-center hover:border-blue-500 transition-colors"
                    >
                      {selectedItems.has(item.id) ? (
                        <CheckSquare className="w-4 h-4 text-blue-600" />
                      ) : (
                        <Square className="w-4 h-4 text-gray-400" />
                      )}
                    </button>
                  </div>
                )}

                {/* Thumbnail */}
                {thumbnail ? (
                  <div
                    className="aspect-square bg-gray-100 relative cursor-pointer"
                    onClick={() => exportMode && handleToggleItem(item.id)}
                  >
                    <img
                      src={thumbnail}
                      alt={item.prompt_used}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                      }}
                    />
                  </div>
                ) : (
                  <div
                    className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center cursor-pointer"
                    onClick={() => exportMode && handleToggleItem(item.id)}
                  >
                    {contentTypeIcons[item.content_type]}
                  </div>
                )}

                {/* Content Info */}
                <div className="p-4">
                  {/* Type and Status Badges */}
                  <div className="flex items-center justify-between mb-2">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100">
                      {contentTypeIcons[item.content_type]}
                      <span className="ml-1">{contentTypeLabels[item.content_type]}</span>
                    </span>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${statusColors[item.status]}`}>
                      {statusIcons[item.status]}
                      <span className="ml-1 capitalize">{item.status}</span>
                    </span>
                  </div>

                  {/* City */}
                  {item.city && (
                    <p className="text-sm font-medium text-gray-900 mb-1">
                      {item.city.name}
                    </p>
                  )}

                  {/* Caption/Description Preview */}
                  <p className="text-sm text-gray-600 line-clamp-3 mb-2">
                    {caption}
                  </p>

                  {/* Date */}
                  <p className="text-xs text-gray-400">
                    {formatDate(item.created_at)}
                  </p>

                  {/* Model Used */}
                  <p className="text-xs text-gray-400 mt-1">
                    Model: {item.model || item.model_used || 'N/A'}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}