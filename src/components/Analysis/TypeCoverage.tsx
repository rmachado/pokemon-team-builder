import { useMemo } from 'react'
import type { PokemonSet } from '../../types'
import { TYPES, getTypeEffectiveness, getPokemon } from '../../lib/pkmn'
import { TYPE_COLORS } from '../../lib/theme'

interface TypeCoverageProps {
  team: PokemonSet[]
}

export function TypeCoverage({ team }: TypeCoverageProps) {
  const pokeDetails = useMemo(() => {
    return team
      .filter(p => p.species)
      .map(p => {
        const sp = getPokemon(p.species)
        return { species: p.species, types: (sp?.types ?? []) as string[] }
      })
  }, [team])

  const analysis = useMemo(() => {
    return TYPES.map(type => {
      const weak: string[] = []
      const resist: string[] = []
      const immune: string[] = []

      for (const { species, types } of pokeDetails) {
        const eff = getTypeEffectiveness(type, types)
        if (eff === 0) immune.push(species)
        else if (eff > 1) weak.push(species)
        else if (eff < 1) resist.push(species)
      }

      return { type, weak, resist, immune }
    })
  }, [pokeDetails])

  if (pokeDetails.length === 0) {
    return (
      <div className="text-gray-500 text-sm text-center py-12">Add Pokémon to see type coverage</div>
    )
  }

  return (
    <div>
      <h3 className="text-sm font-medium text-gray-300 mb-3">Defensive Type Coverage</h3>
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
        {analysis.map(({ type, weak, resist, immune }) => {
          const color = TYPE_COLORS[type] ?? '#6b7280'
          const severity = weak.length > 0 ? 'weak' : resist.length > 0 ? 'resist' : immune.length > 0 ? 'immune' : 'neutral'

          return (
            <div
              key={type}
              className="rounded-xl p-2.5 border group relative"
              style={{
                backgroundColor: severity === 'weak' ? color + '18' : severity === 'resist' ? color + '12' : severity === 'immune' ? color + '08' : 'transparent',
                borderColor: severity === 'weak' ? color + '40' : color + '20',
              }}
            >
              <div className="text-xs font-semibold text-gray-200 text-center" style={{ color }}>{type}</div>
              <div className="text-[10px] mt-1 text-center space-y-0.5">
                {weak.length > 0 && <div className="text-red-400 font-medium">{weak.length} weak</div>}
                {resist.length > 0 && <div className="text-green-400 font-medium">{resist.length} resist</div>}
                {immune.length > 0 && <div className="text-gray-400 font-medium">{immune.length} immune</div>}
                {weak.length === 0 && resist.length === 0 && immune.length === 0 && (
                  <div className="text-gray-600">neutral</div>
                )}
              </div>

              {/* Tooltip on hover */}
              {(weak.length > 0 || resist.length > 0 || immune.length > 0) && (
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 hidden group-hover:block z-10">
                  <div className="bg-gray-800 border border-gray-600 rounded-lg px-2.5 py-1.5 text-[10px] text-gray-300 whitespace-nowrap shadow-xl max-w-48">
                    {weak.length > 0 && <div className="text-red-400">Weak: {weak.join(', ')}</div>}
                    {resist.length > 0 && <div className="text-green-400">Resists: {resist.join(', ')}</div>}
                    {immune.length > 0 && <div className="text-gray-400">Immune: {immune.join(', ')}</div>}
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
