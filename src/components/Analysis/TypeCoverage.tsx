import { useMemo } from 'react'
import type { PokemonSet } from '../../types'
import { TYPES, getTypeEffectiveness, getPokemon } from '../../lib/pkmn'

interface TypeCoverageProps {
  team: PokemonSet[]
}

export function TypeCoverage({ team }: TypeCoverageProps) {
  const teamTypes = useMemo(() => {
    return team
      .filter(p => p.species)
      .map(p => {
        const sp = getPokemon(p.species)
        return { species: p.species, types: sp?.types || [] }
      })
  }, [team])

  const analysis = useMemo(() => {
    return TYPES.map(type => {
      let weak = 0
      let resist = 0
      let immune = 0
      let normal = 0

      for (const { types } of teamTypes) {
        const eff = getTypeEffectiveness(type, types as string[])
        if (eff === 0) immune++
        else if (eff > 1) weak++
        else if (eff < 1) resist++
        else normal++
      }

      return { type, weak, resist, immune, normal }
    })
  }, [teamTypes])

  if (teamTypes.length === 0) {
    return (
      <div className="text-gray-500 text-sm text-center py-8">
        Add Pokémon to your team to see type coverage
      </div>
    )
  }

  return (
    <div>
      <h3 className="text-sm font-medium text-gray-300 mb-2">Defensive Coverage</h3>
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
        {analysis.map(({ type, weak, resist, immune }) => (
          <div
            key={type}
            className={`px-2 py-1.5 rounded text-center text-xs border ${
              weak > 0
                ? 'bg-red-900/30 border-red-800/50'
                : resist > 0
                ? 'bg-green-900/30 border-green-800/50'
                : immune > 0
                ? 'bg-gray-800/50 border-gray-700'
                : 'bg-gray-800/30 border-gray-700/50'
            }`}
          >
            <div className="font-medium text-gray-200">{type}</div>
            <div className="mt-0.5 text-gray-400">
              {weak > 0 && <span className="text-red-400">{weak} weak </span>}
              {resist > 0 && <span className="text-green-400">{resist} resist </span>}
              {immune > 0 && <span className="text-gray-400">{immune} immune </span>}
              {weak === 0 && resist === 0 && immune === 0 && <span className="text-gray-500">neutral</span>}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
