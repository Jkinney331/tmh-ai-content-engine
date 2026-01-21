"use client";

import { useState, useEffect } from "react";
import { ChevronDown, ChevronUp, TrendingUp, Hash, Palette, MapPin } from "lucide-react";
import { WinRateChart } from "@/components/WinRateChart";
import { TagAnalysis } from "@/components/TagAnalysis";

interface CityInsight {
  id: string;
  name: string;
  totalFeedback: number;
  topPositiveTags: { tag: string; count: number; percentage: number }[];
  preferredColorways: { colorway: string; count: number; percentage: number }[];
  averageRating: number;
  lastUpdated: Date;
}

// Mock data for city insights
const mockCityInsights: CityInsight[] = [
  {
    id: "seattle",
    name: "Seattle",
    totalFeedback: 245,
    topPositiveTags: [
      { tag: "Rainy Day Vibes", count: 89, percentage: 36.3 },
      { tag: "Coffee Culture", count: 76, percentage: 31.0 },
      { tag: "Tech Forward", count: 64, percentage: 26.1 }
    ],
    preferredColorways: [
      { colorway: "Emerald Green / Grey", count: 92, percentage: 37.6 },
      { colorway: "Navy / Silver", count: 68, percentage: 27.8 },
      { colorway: "Forest / Gold", count: 45, percentage: 18.4 }
    ],
    averageRating: 4.2,
    lastUpdated: new Date()
  },
  {
    id: "detroit",
    name: "Detroit",
    totalFeedback: 189,
    topPositiveTags: [
      { tag: "Motor City Pride", count: 71, percentage: 37.6 },
      { tag: "Urban Grit", count: 58, percentage: 30.7 },
      { tag: "Blue Collar", count: 42, percentage: 22.2 }
    ],
    preferredColorways: [
      { colorway: "Black / Chrome", count: 78, percentage: 41.3 },
      { colorway: "Red / White", count: 52, percentage: 27.5 },
      { colorway: "Blue / Silver", count: 38, percentage: 20.1 }
    ],
    averageRating: 4.0,
    lastUpdated: new Date()
  },
  {
    id: "chicago",
    name: "Chicago",
    totalFeedback: 312,
    topPositiveTags: [
      { tag: "Windy City Style", count: 124, percentage: 39.7 },
      { tag: "Deep Dish Energy", count: 98, percentage: 31.4 },
      { tag: "Lake Life", count: 67, percentage: 21.5 }
    ],
    preferredColorways: [
      { colorway: "Bulls Red / Black", count: 135, percentage: 43.3 },
      { colorway: "Sky Blue / White", count: 89, percentage: 28.5 },
      { colorway: "Bears Orange / Navy", count: 56, percentage: 17.9 }
    ],
    averageRating: 4.3,
    lastUpdated: new Date()
  },
  {
    id: "portland",
    name: "Portland",
    totalFeedback: 167,
    topPositiveTags: [
      { tag: "Eco Conscious", count: 68, percentage: 40.7 },
      { tag: "Indie Vibes", count: 51, percentage: 30.5 },
      { tag: "Trail Ready", count: 38, percentage: 22.8 }
    ],
    preferredColorways: [
      { colorway: "Forest Green / Tan", count: 71, percentage: 42.5 },
      { colorway: "Plaid Pattern", count: 45, percentage: 26.9 },
      { colorway: "Rose / Black", count: 32, percentage: 19.2 }
    ],
    averageRating: 4.1,
    lastUpdated: new Date()
  },
  {
    id: "austin",
    name: "Austin",
    totalFeedback: 198,
    topPositiveTags: [
      { tag: "Keep It Weird", count: 82, percentage: 41.4 },
      { tag: "Music Scene", count: 64, percentage: 32.3 },
      { tag: "BBQ Life", count: 41, percentage: 20.7 }
    ],
    preferredColorways: [
      { colorway: "Burnt Orange / White", count: 88, percentage: 44.4 },
      { colorway: "Desert Sand / Turquoise", count: 56, percentage: 28.3 },
      { colorway: "Black / Neon", count: 37, percentage: 18.7 }
    ],
    averageRating: 4.4,
    lastUpdated: new Date()
  }
];

function CityInsightCard({ city }: { city: CityInsight }) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-4">
          <div className="p-2 bg-blue-50 rounded-lg">
            <MapPin className="w-5 h-5 text-blue-600" />
          </div>
          <div className="text-left">
            <h3 className="text-lg font-semibold text-gray-900">{city.name}</h3>
            <p className="text-sm text-gray-500">
              {city.totalFeedback} feedback points • {city.averageRating.toFixed(1)}★ avg rating
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400">
            Updated {city.lastUpdated.toLocaleDateString()}
          </span>
          {isExpanded ? (
            <ChevronUp className="w-5 h-5 text-gray-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-400" />
          )}
        </div>
      </button>

      {isExpanded && (
        <div className="px-6 pb-6 border-t border-gray-100">
          <div className="grid md:grid-cols-2 gap-6 mt-6">
            {/* Top Positive Tags Section */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 mb-3">
                <Hash className="w-4 h-4 text-green-600" />
                <h4 className="font-medium text-gray-900">Top 3 Positive Tags</h4>
              </div>
              <div className="space-y-2">
                {city.topPositiveTags.map((tag, index) => (
                  <div key={tag.tag} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-gray-400 w-4">
                        {index + 1}.
                      </span>
                      <span className="px-2 py-1 bg-green-50 text-green-700 rounded-md text-sm font-medium">
                        {tag.tag}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-24 bg-gray-200 rounded-full h-2 overflow-hidden">
                        <div
                          className="h-full bg-green-500 rounded-full"
                          style={{ width: `${tag.percentage}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-600 w-12 text-right">
                        {tag.percentage.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Preferred Colorways Section */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 mb-3">
                <Palette className="w-4 h-4 text-purple-600" />
                <h4 className="font-medium text-gray-900">Preferred Colorways</h4>
              </div>
              <div className="space-y-2">
                {city.preferredColorways.map((colorway, index) => (
                  <div key={colorway.colorway} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-gray-400 w-4">
                        {index + 1}.
                      </span>
                      <span className="px-2 py-1 bg-purple-50 text-purple-700 rounded-md text-sm font-medium">
                        {colorway.colorway}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-24 bg-gray-200 rounded-full h-2 overflow-hidden">
                        <div
                          className="h-full bg-purple-500 rounded-full"
                          style={{ width: `${colorway.percentage}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-600 w-12 text-right">
                        {colorway.percentage.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Stats Summary */}
          <div className="mt-6 pt-4 border-t border-gray-100">
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900">{city.totalFeedback}</p>
                <p className="text-xs text-gray-500">Total Feedback</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900">{city.averageRating.toFixed(1)}</p>
                <p className="text-xs text-gray-500">Avg Rating</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900">
                  {city.topPositiveTags[0]?.count || 0}
                </p>
                <p className="text-xs text-gray-500">Top Tag Count</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function PreferencesPage() {
  const [cityInsights, setCityInsights] = useState<CityInsight[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandAll, setExpandAll] = useState(false);

  useEffect(() => {
    // Simulate loading data
    const timer = setTimeout(() => {
      setCityInsights(mockCityInsights);
      setLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Preferences</h1>
        <p className="text-gray-600">
          Configure your content generation preferences and view insights by city.
        </p>
      </div>

      {/* City-Specific Insights Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900">City-Specific Insights</h2>
          </div>
          <button
            onClick={() => setExpandAll(!expandAll)}
            className="px-3 py-1.5 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
          >
            {expandAll ? "Collapse All" : "Expand All"}
          </button>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-gray-100 animate-pulse h-20 rounded-lg" />
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {cityInsights.map((city) => (
              <CityInsightCard key={city.id} city={city} />
            ))}
          </div>
        )}
      </div>

      {/* Existing Components */}
      <div className="space-y-8">
        <WinRateChart />
        <TagAnalysis />
      </div>
    </div>
  );
}