import { useState, useEffect, useCallback } from 'react'
import type { MetaPokemonStats } from '../types'
import { fetchMetaStats } from '../lib/meta'

const cache = new Map<string, { data: MetaPokemonStats[]; ts: number }>()
const CACHE_TTL = 30 * 60 * 1000

export function useMetaData(formatId: string) {
  const [metaData, setMetaData] = useState<MetaPokemonStats[]>(() => {
    const cached = cache.get(formatId)
    if (cached && Date.now() - cached.ts < CACHE_TTL) return cached.data
    return []
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    const cached = cache.get(formatId)
    if (cached && Date.now() - cached.ts < CACHE_TTL) {
      setMetaData(cached.data)
      return
    }

    setLoading(true)
    setError(null)
    try {
      const data = await fetchMetaStats(formatId)
      cache.set(formatId, { data, ts: Date.now() })
      setMetaData(data)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load meta data')
    } finally {
      setLoading(false)
    }
  }, [formatId])

  useEffect(() => {
    load()
  }, [load])

  const refresh = useCallback(() => {
    cache.delete(formatId)
    load()
  }, [formatId, load])

  return { metaData, loading, error, refresh }
}
