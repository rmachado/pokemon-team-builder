import { useMemo } from 'react'
import type { PokemonSet, TypeCoverageResult } from '../types'
import { TYPES, getTypeEffectiveness, getPokemon } from '../lib/pkmn'

export function useTypeCoverage(team: PokemonSet[]) {
  return useMemo(() => {
    const teamTypes = team
      .filter(p => p.species)
      .map(p => {
        const sp = getPokemon(p.species)
        return sp?.types || []
      })

    const defensive: TypeCoverageResult[] = TYPES.map(type => {
      let neutral = 0
      let superEffective = 0
      let resist = 0
      let immune = 0

      for (const types of teamTypes) {
        const eff = getTypeEffectiveness(type, types as string[])
        if (eff === 0) immune++
        else if (eff > 1) superEffective++
        else if (eff < 1) resist++
        else neutral++
      }

      return { type, neutral, superEffective, resist, immune }
    })

    return { defensive }
  }, [team])
}
