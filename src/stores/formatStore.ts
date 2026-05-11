import { create } from 'zustand'
import type { VGCFormat } from '@/types'
import { VGC_FORMATS } from '@/lib/pkmn'
import { loadFormat, saveFormat } from '@/lib/storage'

interface FormatState {
  currentFormat: VGCFormat
  setFormat: (fmt: VGCFormat | string) => void
  formats: VGCFormat[]
}

export const useFormatStore = create<FormatState>((set) => {
  const saved = loadFormat()
  const initial = VGC_FORMATS.find(f => f.id === saved) || VGC_FORMATS[0]

  return {
    currentFormat: initial,
    formats: VGC_FORMATS,
    setFormat: fmt => {
      const format = typeof fmt === 'string' ? VGC_FORMATS.find(f => f.id === fmt) || VGC_FORMATS[0] : fmt
      set({ currentFormat: format })
      saveFormat(format.id)
    },
  }
})
