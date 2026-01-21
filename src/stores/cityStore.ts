import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import type { CityStore, City } from '../types/city'

const initialState = {
  cities: [],
  selectedCity: null,
  loading: false,
  error: null,
}

export const useCityStore = create<CityStore>()(
  devtools(
    (set) => ({
      ...initialState,

      setCities: (cities) =>
        set((state) => ({ ...state, cities }), false, 'setCities'),

      addCity: (city) =>
        set(
          (state) => ({ ...state, cities: [...state.cities, city] }),
          false,
          'addCity'
        ),

      selectCity: (city) =>
        set(
          (state) => ({
            ...state,
            selectedCity: city,
          }),
          false,
          'selectCity'
        ),

      updateCity: (id, data) =>
        set(
          (state) => ({
            ...state,
            cities: state.cities.map((city) =>
              city.id === id ? { ...city, ...data } : city
            ),
            selectedCity:
              state.selectedCity?.id === id
                ? { ...state.selectedCity, ...data }
                : state.selectedCity,
          }),
          false,
          'updateCity'
        ),

      deleteCity: (id) =>
        set(
          (state) => ({
            ...state,
            cities: state.cities.filter((city) => city.id !== id),
            selectedCity:
              state.selectedCity?.id === id ? null : state.selectedCity,
          }),
          false,
          'deleteCity'
        ),

      setLoading: (loading) =>
        set((state) => ({ ...state, loading }), false, 'setLoading'),

      setError: (error) =>
        set((state) => ({ ...state, error }), false, 'setError'),

      reset: () => set(initialState, false, 'reset'),
    }),
    {
      name: 'city-store',
    }
  )
)