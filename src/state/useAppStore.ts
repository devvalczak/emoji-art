import { create } from 'zustand'
import { DEFAULT_SETTINGS, type GridResult, type Settings } from '../lib/types'

export type ResultMode = 'text' | 'image'

interface AppState {
  sourceImage: HTMLImageElement | null
  sourceError: string | null
  isLoadingSource: boolean
  settings: Settings
  gridResult: GridResult | null
  isGenerating: boolean
  generationError: string | null
  generationProgress: { done: number; total: number } | null
  styleWarning: string | null

  resultMode: ResultMode
  exportCellPx: number
  imageBlob: Blob | null
  isRenderingImage: boolean
  renderProgress: { done: number; total: number } | null
  renderError: string | null

  setSourceImage: (img: HTMLImageElement | null) => void
  setSourceError: (message: string | null) => void
  setIsLoadingSource: (loading: boolean) => void
  updateSettings: (partial: Partial<Settings>) => void
  setGridResult: (result: GridResult | null) => void
  setIsGenerating: (generating: boolean) => void
  setGenerationError: (message: string | null) => void
  setGenerationProgress: (progress: { done: number; total: number } | null) => void
  setStyleWarning: (message: string | null) => void

  setResultMode: (mode: ResultMode) => void
  setExportCellPx: (px: number) => void
  setImageBlob: (blob: Blob | null) => void
  setIsRenderingImage: (rendering: boolean) => void
  setRenderProgress: (progress: { done: number; total: number } | null) => void
  setRenderError: (message: string | null) => void
}

export const useAppStore = create<AppState>((set) => ({
  sourceImage: null,
  sourceError: null,
  isLoadingSource: false,
  settings: DEFAULT_SETTINGS,
  gridResult: null,
  isGenerating: false,
  generationError: null,
  generationProgress: null,
  styleWarning: null,

  resultMode: 'text',
  exportCellPx: 32,
  imageBlob: null,
  isRenderingImage: false,
  renderProgress: null,
  renderError: null,

  setSourceImage: (img) => set({ sourceImage: img, sourceError: null }),
  setSourceError: (message) => set({ sourceError: message }),
  setIsLoadingSource: (loading) => set({ isLoadingSource: loading }),
  updateSettings: (partial) =>
    set((state) => ({ settings: { ...state.settings, ...partial } })),
  setGridResult: (result) => set({ gridResult: result, imageBlob: null }),
  setIsGenerating: (generating) => set({ isGenerating: generating }),
  setGenerationError: (message) => set({ generationError: message }),
  setGenerationProgress: (progress) => set({ generationProgress: progress }),
  setStyleWarning: (message) => set({ styleWarning: message }),

  setResultMode: (mode) => set({ resultMode: mode }),
  setExportCellPx: (px) => set({ exportCellPx: px }),
  setImageBlob: (blob) => set({ imageBlob: blob }),
  setIsRenderingImage: (rendering) => set({ isRenderingImage: rendering }),
  setRenderProgress: (progress) => set({ renderProgress: progress }),
  setRenderError: (message) => set({ renderError: message }),
}))
