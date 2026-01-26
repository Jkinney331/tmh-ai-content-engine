import { CityStatus } from './database'

export interface City {
  id: string
  name: string
  state: string
  country: string
  status: CityStatus
  areaCodes: string[]
  nicknameCount: number
  population?: number
  timezone?: string
  coordinates?: {
    lat: number
    lng: number
  }
  metadata?: Record<string, any>
}

export interface CityState {
  cities: City[]
  selectedCity: City | null
  loading: boolean
  error: string | null
}

export interface CityActions {
  setCities: (cities: City[]) => void
  addCity: (city: City) => void
  updateCity: (id: string, city: Partial<City>) => void
  deleteCity: (id: string) => void
  selectCity: (city: City | null) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  reset: () => void
}

export type CityStore = CityState & CityActions