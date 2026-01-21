"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

interface ModelStats {
  model: string;
  wins: number;
  total: number;
  winRate: number;
}

interface WinRateData {
  images: ModelStats[];
  videos: ModelStats[];
}

export function WinRateChart() {
  const [winRates, setWinRates] = useState<WinRateData>({
    images: [],
    videos: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWinRates();
  }, []);

  async function fetchWinRates() {
    try {
      // Get user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Query feedback where comparison_winner = true
      const { data: feedbackData, error } = await supabase
        .from('feedback')
        .select('content_type, model_used')
        .eq('user_id', user.id)
        .eq('comparison_winner', true);

      if (error) throw error;

      // Query all feedback to get total comparisons
      const { data: allFeedback, error: allError } = await supabase
        .from('feedback')
        .select('content_type, model_used')
        .eq('user_id', user.id)
        .not('comparison_winner', 'is', null);

      if (allError) throw allError;

      // Calculate win rates
      const imageWins = feedbackData?.filter((f: any) => f.content_type === 'image') || [];
      const videoWins = feedbackData?.filter((f: any) => f.content_type === 'video') || [];
      const allImages = allFeedback?.filter((f: any) => f.content_type === 'image') || [];
      const allVideos = allFeedback?.filter((f: any) => f.content_type === 'video') || [];

      const imageStats = calculateModelStats(imageWins, allImages);
      const videoStats = calculateModelStats(videoWins, allVideos);

      setWinRates({
        images: imageStats,
        videos: videoStats
      });
    } catch (error) {
      console.error('Error fetching win rates:', error);
    } finally {
      setLoading(false);
    }
  }

  function calculateModelStats(wins: any[], total: any[]): ModelStats[] {
    const modelMap = new Map<string, { wins: number, total: number }>();

    // Count total comparisons per model
    total.forEach(item => {
      const model = item.model_used || 'Unknown';
      const current = modelMap.get(model) || { wins: 0, total: 0 };
      modelMap.set(model, { ...current, total: current.total + 1 });
    });

    // Count wins per model
    wins.forEach(item => {
      const model = item.model_used || 'Unknown';
      const current = modelMap.get(model) || { wins: 0, total: 0 };
      modelMap.set(model, { ...current, wins: current.wins + 1 });
    });

    // Convert to array with win rates
    const stats: ModelStats[] = [];
    modelMap.forEach((value, key) => {
      const winRate = value.total > 0 ? (value.wins / value.total) * 100 : 0;
      stats.push({
        model: key,
        wins: value.wins,
        total: value.total,
        winRate: Math.round(winRate)
      });
    });

    // Sort by win rate descending
    return stats.sort((a, b) => b.winRate - a.winRate);
  }

  function renderChart(data: ModelStats[], title: string) {
    if (data.length === 0) {
      return (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
          <p className="text-gray-500">No comparison data available yet</p>
        </div>
      );
    }

    // Calculate total for display
    const totalComparisons = Math.max(...data.map(d => d.total));

    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
        <div className="space-y-4">
          {data.map((stat, index) => {
            // Use different colors for different models
            const colors = {
              'Nano Banana': 'bg-yellow-500',
              'OpenAI': 'bg-blue-500',
              'Sora': 'bg-purple-500',
              'Unknown': 'bg-gray-500'
            };
            const bgColor = colors[stat.model as keyof typeof colors] || 'bg-indigo-500';

            return (
              <div key={stat.model} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-700">{stat.model}</span>
                  <span className="text-sm text-gray-600">
                    {stat.winRate}% ({stat.wins}/{stat.total} wins)
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-8 relative overflow-hidden">
                  <div
                    className={`${bgColor} h-full rounded-full transition-all duration-500 flex items-center justify-center`}
                    style={{ width: `${stat.winRate}%` }}
                  >
                    {stat.winRate > 10 && (
                      <span className="text-white text-xs font-semibold px-2">
                        {stat.winRate}%
                      </span>
                    )}
                  </div>
                  {stat.winRate <= 10 && stat.winRate > 0 && (
                    <span className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-700 text-xs font-semibold">
                      {stat.winRate}%
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        {data.length >= 2 && (
          <div className="mt-6 pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-600">
              {getWinRateSummary(data)}
            </p>
          </div>
        )}
      </div>
    );
  }

  function getWinRateSummary(stats: ModelStats[]): string {
    if (stats.length < 2) return "";

    // Get top two models for the summary
    const [first, second] = stats;
    return `${first.model}: ${first.winRate}% | ${second.model}: ${second.winRate}%`;
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="space-y-3">
              <div className="h-8 bg-gray-200 rounded"></div>
              <div className="h-8 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Model Win Rates</h2>
        <p className="text-gray-600">
          Based on your comparison feedback, here are your preferred AI models
        </p>
      </div>

      {/* Image generation win rates */}
      {renderChart(winRates.images, "Image Generation Models")}

      {/* Video generation win rates */}
      {renderChart(winRates.videos, "Video Generation Models")}
    </div>
  );
}