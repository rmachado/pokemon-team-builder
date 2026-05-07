import { useState, useCallback } from 'react'
import { VGC_FORMATS } from '../lib/pkmn'
import { loadFormat, saveFormat } from '../lib/storage'
import type { VGCFormat } from '../types'

export function useFormat() {
  const [currentFormat, setCurrentFormatState] = useState<VGCFormat>(() => {
    const saved = loadFormat()
    return VGC_FORMATS.find(f => f.id === saved) || VGC_FORMATS[0]
  })

  const setCurrentFormat = useCallback((fmt: VGCFormat | string) => {
    const format = typeof fmt === 'string' ? VGC_FORMATS.find(f => f.id === fmt) || VGC_FORMATS[0] : fmt
    setCurrentFormatState(format)
    saveFormat(format.id)
  }, [])

  return { currentFormat, setCurrentFormat, formats: VGC_FORMATS }
}
