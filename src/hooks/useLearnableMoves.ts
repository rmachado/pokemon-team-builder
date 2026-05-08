import { useState, useEffect } from 'react'
import { getLearnableMoveNames } from '../lib/pkmn'

export function useLearnableMoves(species: string): string[] {
  const [moves, setMoves] = useState<string[]>([])

  useEffect(() => {
    let canceled = false
    if (!species) {
      setMoves([])
      return
    }

    setMoves([])
    getLearnableMoveNames(species).then(result => {
      if (!canceled) setMoves(result)
    })

    return () => { canceled = true }
  }, [species])

  return moves
}
