import { create } from 'zustand'
import { DEFAULT_SETTINGS, type GridResult, type Settings } from '../lib/types'

interface AppState {
  sourceImage: HTMLImageElement | null
  sourceError: string | null
  isLoadingSource: boolean
  settings: Settings
  gridResult: GridResult | null

  setSourceImage: (img: HTMLImageElement | null) => void
  setSourceError: (message: string | null) => void
  setIsLoadingSource: (loading: boolean) => void
  updateSettings: (partial: Partial<Settings>) => void
  setGridResult: (result: GridResult | null) => void
}

export const useAppStore = create<AppState>((set) => ({
  sourceImage: null,
  sourceError: null,
  isLoadingSource: false,
  settings: DEFAULT_SETTINGS,
  gridResult: null,

  setSourceImage: (img) => set({ sourceImage: img, sourceError: null }),
  setSourceError: (message) => set({ sourceError: message }),
  setIsLoadingSource: (loading) => set({ isLoadingSource: loading }),
  updateSettings: (partial) =>
    set((state) => ({ settings: { ...state.settings, ...partial } })),
  setGridResult: (result) => set({ gridResult: result }),
}))
