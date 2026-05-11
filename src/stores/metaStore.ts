import { create } from 'zustand'
import type { MetaPokemonStats } from '@/types'
import { fetchMetaStats } from '@/lib/smogonMeta'

const cache = new Map<string, { data: MetaPokemonStats[]; ts: number }>()
const CACHE_TTL = 30 * 60 * 1000

interface MetaState {
  metaData: MetaPokemonStats[]
  loading: boolean
  error: string | null
  load: (formatId: string) => Promise<void>
  refresh: (formatId: string) => Promise<void>
}

export const useMetaStore = create<MetaState>((set) => ({
  metaData: [],
  loading: false,
  error: null,

  load: async (formatId) => {
    const cached = cache.get(formatId)
    if (cached && Date.now() - cached.ts < CACHE_TTL) {
      set({ metaData: cached.data, error: null })
      return
    }

    set({ loading: true, error: null })
    try {
      const data = await fetchMetaStats(formatId)
      cache.set(formatId, { data, ts: Date.now() })
      set({ metaData: data, loading: false })
    } catch (e) {
      set({
        error: e instanceof Error ? e.message : 'Failed to load meta data',
        loading: false,
      })
    }
  },

  refresh: async (formatId) => {
    cache.delete(formatId)
    await (useMetaStore.getState() as MetaState).load(formatId)
  },
}))
