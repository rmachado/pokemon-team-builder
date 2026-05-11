import { useState, useEffect } from 'react'
import { getLearnableMoveNames } from '@/lib/pkmn'

export function useLearnableMoves(species: string): string[] {
  const [moves, setMoves] = useState<string[]>([])

  useEffect(() => {
    let canceled = false

    if (!species) {
      // Don't set state synchronously; return and let the effect cleanup handle it
      return () => { canceled = true }
    }

    getLearnableMoveNames(species).then(result => {
      if (!canceled) setMoves(result)
    })

    return () => { canceled = true }
  }, [species])

  return moves
}
