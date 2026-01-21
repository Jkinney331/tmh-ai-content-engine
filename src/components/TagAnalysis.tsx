"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

interface TagFrequency {
  tag: string;
  thumbs_up_count: number;
  thumbs_down_count: number;
  total_count: number;
  positive_rate: number;
}

export function TagAnalysis() {
  const [tagData, setTagData] = useState<TagFrequency[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTagFrequencies();
  }, []);

  const fetchTagFrequencies = async () => {
    try {
      const { data, error } = await supabase.rpc('get_feedback_by_tags');

      if (error) throw error;

      const processedData: TagFrequency[] = (data as any)?.map((item: any) => ({
        tag: item.tag,
        thumbs_up_count: Number(item.thumbs_up_count) || 0,
        thumbs_down_count: Number(item.thumbs_down_count) || 0,
        total_count: Number(item.total_count) || 0,
        positive_rate: item.total_count > 0
          ? (Number(item.thumbs_up_count) / Number(item.total_count)) * 100
          : 0
      }));

      // Sort by total count (most frequent tags first)
      processedData.sort((a, b) => b.total_count - a.total_count);

      setTagData(processedData);
    } catch (err) {
      console.error('Error fetching tag frequencies:', err);
      setError('Failed to load tag preferences');
    } finally {
      setLoading(false);
    }
  };

  const getColorClass = (positiveRate: number) => {
    if (positiveRate >= 70) return "text-green-600";
    if (positiveRate <= 30) return "text-red-600";
    return "text-yellow-600";
  };

  const getBackgroundClass = (positiveRate: number) => {
    if (positiveRate >= 70) return "bg-green-50 border-green-200";
    if (positiveRate <= 30) return "bg-red-50 border-red-200";
    return "bg-yellow-50 border-yellow-200";
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Tag Preferences Analysis</h2>
        <div className="flex justify-center items-center h-32">
          <div className="animate-pulse text-gray-500">Loading tag preferences...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Tag Preferences Analysis</h2>
        <div className="text-red-600">{error}</div>
      </div>
    );
  }

  if (tagData.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Tag Preferences Analysis</h2>
        <div className="text-gray-500 text-center py-8">
          No feedback data available yet. Start rating content to see your preferences!
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Tag Preferences Analysis</h2>
      <p className="text-gray-600 mb-6">
        Discover which attributes you prefer based on your feedback history
      </p>

      <div className="space-y-3">
        {tagData.map((tag) => (
          <div
            key={tag.tag}
            className={`p-4 rounded-lg border ${getBackgroundClass(tag.positive_rate)}`}
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <span className="font-medium text-gray-900 capitalize">
                  {tag.tag.replace(/_/g, ' ')}
                </span>
                <span className={`ml-3 font-semibold ${getColorClass(tag.positive_rate)}`}>
                  {tag.positive_rate.toFixed(0)}% positive
                </span>
              </div>

              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-1">
                  <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
                  </svg>
                  <span className="text-gray-600">{tag.thumbs_up_count}</span>
                </div>

                <div className="flex items-center gap-1">
                  <svg className="w-4 h-4 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M18 9.5a1.5 1.5 0 11-3 0v-6a1.5 1.5 0 013 0v6zM14 9.667v-5.43a2 2 0 00-1.105-1.79l-.05-.025A4 4 0 0011.055 2H5.64a2 2 0 00-1.962 1.608l-1.2 6A2 2 0 004.44 12H8v4a2 2 0 002 2 1 1 0 001-1v-.667a4 4 0 01.8-2.4l1.4-1.866a4 4 0 00.8-2.4z" />
                  </svg>
                  <span className="text-gray-600">{tag.thumbs_down_count}</span>
                </div>

                <div className="text-gray-500">
                  Total: {tag.total_count}
                </div>
              </div>
            </div>

            <div className="mt-2">
              <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                <div
                  className={`h-2 transition-all duration-300 ${
                    tag.positive_rate >= 70 ? 'bg-green-500' :
                    tag.positive_rate <= 30 ? 'bg-red-500' : 'bg-yellow-500'
                  }`}
                  style={{ width: `${tag.positive_rate}%` }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h3 className="text-sm font-semibold text-gray-700 mb-2">Legend:</h3>
        <div className="flex flex-wrap gap-4 text-sm">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 bg-green-500 rounded-full"></span>
            <span className="text-gray-600">Positive pattern (≥70%)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 bg-yellow-500 rounded-full"></span>
            <span className="text-gray-600">Mixed pattern (30-70%)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 bg-red-500 rounded-full"></span>
            <span className="text-gray-600">Negative pattern (≤30%)</span>
          </div>
        </div>
      </div>
    </div>
  );
}