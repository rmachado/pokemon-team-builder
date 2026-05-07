import { useCallback, useState } from 'react'
import { calcDamage, calcMatchup } from '../lib/calc'
import type { PokemonSet, MoveDamageResult } from '../types'

export function useDamageCalc() {
  const [results, setResults] = useState<MoveDamageResult[]>([])

  const calculateMatchup = useCallback((
    attacker: PokemonSet,
    defender: PokemonSet,
  ) => {
    const res = calcMatchup(attacker, defender)
    setResults(res)
    return res
  }, [])

  const calculateSingle = useCallback((
    attacker: PokemonSet,
    defender: PokemonSet,
    move: string,
  ) => {
    const res = calcDamage(attacker, defender, move)
    setResults([res])
    return res
  }, [])

  return { results, calculateMatchup, calculateSingle }
}
