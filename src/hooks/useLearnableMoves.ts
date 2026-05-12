import { useState, useEffect } from 'react'
import { getLearnableMoveNames } from '@/lib/pkmn'

export function useLearnableMoves(species: string, formatId?: string): string[] {
  const [moves, setMoves] = useState<string[]>([])

  useEffect(() => {
    let canceled = false

    if (!species) {
      return () => { canceled = true }
    }

    getLearnableMoveNames(species, formatId).then(result => {
      if (!canceled) setMoves(result)
    })

    return () => { canceled = true }
  }, [species, formatId])

  return moves
}
