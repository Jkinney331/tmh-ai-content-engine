'use client';

import React, { useEffect, useState } from 'react';
import { useCityStore } from '../stores/cityStore';
import { useGenerationStore } from '../stores/generationStore';
import type { City } from '../types/city';

export default function CitySelector() {
  const { cities, setCities } = useCityStore();
  const { selectedCity, setSelectedCity } = useGenerationStore();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load approved cities from the database
    const loadCities = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/cities');

        if (response.ok) {
          const data = await response.json();
          // API returns array directly, not { cities: [] }
          setCities(Array.isArray(data) ? data : data.cities || []);
        } else {
          // Fallback to mock data if API is not ready
          const mockCities: City[] = [
            {
              id: 'seattle',
              name: 'Seattle',
              state: 'WA',
              country: 'USA',
              status: 'active',
              areaCodes: ['206', '425', '253'],
              nicknameCount: 15,
              population: 737015,
              timezone: 'America/Los_Angeles',
              coordinates: { lat: 47.6062, lng: -122.3321 }
            },
            {
              id: 'detroit',
              name: 'Detroit',
              state: 'MI',
              country: 'USA',
              status: 'active',
              areaCodes: ['313', '248', '586'],
              nicknameCount: 12,
              population: 639111,
              timezone: 'America/Detroit',
              coordinates: { lat: 42.3314, lng: -83.0458 }
            },
            {
              id: 'chicago',
              name: 'Chicago',
              state: 'IL',
              country: 'USA',
              status: 'active',
              areaCodes: ['312', '773', '872'],
              nicknameCount: 20,
              population: 2746388,
              timezone: 'America/Chicago',
              coordinates: { lat: 41.8781, lng: -87.6298 }
            }
          ];
          setCities(mockCities);
        }
      } catch (error) {
        console.error('Error loading cities:', error);
        // Use mock data on error
        const mockCities: City[] = [
          {
            id: 'seattle',
            name: 'Seattle',
            state: 'WA',
            country: 'USA',
            status: 'active',
            areaCodes: ['206', '425', '253'],
            nicknameCount: 15,
            population: 737015,
            timezone: 'America/Los_Angeles',
            coordinates: { lat: 47.6062, lng: -122.3321 }
          },
          {
            id: 'detroit',
            name: 'Detroit',
            state: 'MI',
            country: 'USA',
            status: 'active',
            areaCodes: ['313', '248', '586'],
            nicknameCount: 12,
            population: 639111,
            timezone: 'America/Detroit',
            coordinates: { lat: 42.3314, lng: -83.0458 }
          },
          {
            id: 'chicago',
            name: 'Chicago',
            state: 'IL',
            country: 'USA',
            status: 'active',
            areaCodes: ['312', '773', '872'],
            nicknameCount: 20,
            population: 2746388,
            timezone: 'America/Chicago',
            coordinates: { lat: 41.8781, lng: -87.6298 }
          }
        ];
        setCities(mockCities);
      } finally {
        setIsLoading(false);
      }
    };

    loadCities();
  }, [setCities]);

  const handleCityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const cityId = e.target.value;
    if (cityId) {
      const city = cities.find(c => c.id === cityId);
      if (city) {
        setSelectedCity(city);
      }
    } else {
      setSelectedCity(null);
    }
  };

  // Show active, ready, and approved cities (not just 'active')
  const approvedCities = cities.filter(city =>
    city.status === 'active' || city.status === 'ready' || city.status === 'approved' || city.status === 'draft'
  );

  return (
    <div className="w-full max-w-md">
      <label htmlFor="city-selector" className="block text-sm font-medium text-gray-700 mb-2">
        Select a City
      </label>
      <select
        id="city-selector"
        value={selectedCity?.id || ''}
        onChange={handleCityChange}
        disabled={isLoading}
        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
      >
        <option value="">-- Select a city --</option>
        {approvedCities.map(city => (
          <option key={city.id} value={city.id}>
            {city.name}, {city.state}
          </option>
        ))}
      </select>

      {!selectedCity && !isLoading && (
        <p className="mt-2 text-sm text-gray-500">
          Select a city to begin generating content
        </p>
      )}

      {selectedCity && (
        <div className="mt-4 p-3 bg-blue-50 rounded-md">
          <p className="text-sm font-medium text-blue-900">
            Selected: {selectedCity.name}, {selectedCity.state}
          </p>
          <p className="text-xs text-blue-700 mt-1">
            Population: {selectedCity.population?.toLocaleString() || 'N/A'} |
            Area Codes: {selectedCity.areaCodes.join(', ')}
          </p>
        </div>
      )}
    </div>
  );
}