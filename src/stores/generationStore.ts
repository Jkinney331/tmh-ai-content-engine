import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { Generation, Comparison } from '../types/generation';
import type { City } from '../types/city';

export type ProductType = 'hoodie' | 't-shirt' | 'hat';
export type DesignStyle = 'minimal' | 'bold' | 'vintage' | 'modern' | 'luxury';

export interface SlangTerm {
  id: string;
  term: string;
  meaning: string;
  usage?: string;
  popularity?: string;
}

interface GenerationState {
  queue: Generation[];
  currentGeneration: Generation | null;
  comparisons: Comparison[];
  selectedCity: City | null;
  selectedProductType: ProductType;
  selectedDesignStyle: DesignStyle;
  selectedSlangTerm: SlangTerm | 'ai-suggest' | null;
  loading: boolean;
  error: string | null;

  // Actions
  addToQueue: (generation: Generation) => void;
  removeFromQueue: (id: string) => void;
  setCurrentGeneration: (generation: Generation | null) => void;
  updateGeneration: (id: string, updates: Partial<Generation>) => void;
  addComparison: (modelA: string, modelB: string) => void;
  selectWinner: (comparisonId: string, winner: 'left' | 'right' | 'tie') => void;
  updateComparison: (id: string, updates: Partial<Comparison>) => void;
  setSelectedCity: (city: City | null) => void;
  setSelectedProductType: (productType: ProductType) => void;
  setSelectedDesignStyle: (designStyle: DesignStyle) => void;
  setSelectedSlangTerm: (slangTerm: SlangTerm | 'ai-suggest' | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearQueue: () => void;
  clearComparisons: () => void;
  reset: () => void;
}

const initialState = {
  queue: [],
  currentGeneration: null,
  comparisons: [],
  selectedCity: null,
  selectedProductType: 'hoodie' as ProductType,
  selectedDesignStyle: 'modern' as DesignStyle,
  selectedSlangTerm: null as SlangTerm | 'ai-suggest' | null,
  loading: false,
  error: null,
};

export const useGenerationStore = create<GenerationState>()(
  devtools(
    (set) => ({
      ...initialState,

      addToQueue: (generation) =>
        set((state) => ({
          queue: [...state.queue, generation],
        })),

      removeFromQueue: (id) =>
        set((state) => ({
          queue: state.queue.filter((g) => g.id !== id),
        })),

      setCurrentGeneration: (generation) =>
        set({ currentGeneration: generation }),

      updateGeneration: (id, updates) =>
        set((state) => ({
          queue: state.queue.map((g) =>
            g.id === id ? { ...g, ...updates } : g
          ),
          currentGeneration:
            state.currentGeneration?.id === id
              ? { ...state.currentGeneration, ...updates }
              : state.currentGeneration,
        })),

      addComparison: (modelA, modelB) =>
        set((state) => {
          const comparison: Comparison = {
            id: `comparison-${Date.now()}`,
            cityId: state.currentGeneration?.cityId || '',
            leftGeneration: {
              id: `gen-left-${Date.now()}`,
              cityId: state.currentGeneration?.cityId || '',
              prompt: state.currentGeneration?.prompt || '',
              status: 'pending',
              model: modelA,
              createdAt: new Date(),
              updatedAt: new Date(),
            },
            rightGeneration: {
              id: `gen-right-${Date.now()}`,
              cityId: state.currentGeneration?.cityId || '',
              prompt: state.currentGeneration?.prompt || '',
              status: 'pending',
              model: modelB,
              createdAt: new Date(),
              updatedAt: new Date(),
            },
            createdAt: new Date(),
            updatedAt: new Date(),
          };
          return {
            comparisons: [...state.comparisons, comparison],
          };
        }),

      selectWinner: (comparisonId, winner) =>
        set((state) => ({
          comparisons: state.comparisons.map((c) =>
            c.id === comparisonId ? { ...c, winner, updatedAt: new Date() } : c
          ),
        })),

      updateComparison: (id, updates) =>
        set((state) => ({
          comparisons: state.comparisons.map((c) =>
            c.id === id ? { ...c, ...updates } : c
          ),
        })),

      setSelectedCity: (city) => set({ selectedCity: city, selectedSlangTerm: null }),

      setSelectedProductType: (productType) => set({ selectedProductType: productType }),

      setSelectedDesignStyle: (designStyle) => set({ selectedDesignStyle: designStyle }),

      setSelectedSlangTerm: (slangTerm) => set({ selectedSlangTerm: slangTerm }),

      setLoading: (loading) => set({ loading }),

      setError: (error) => set({ error }),

      clearQueue: () => set({ queue: [] }),

      clearComparisons: () => set({ comparisons: [] }),

      reset: () => set(initialState),
    }),
    {
      name: 'generation-store',
    }
  )
);