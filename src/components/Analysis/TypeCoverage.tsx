import { useMemo } from 'react'
import type { PokemonSet } from '@/types'
import { TYPE_COLORS } from '@/lib/theme'
import { StatsCalculator } from '@/domain'
import { Pokemon } from '@/domain'

interface TypeCoverageProps {
  team: PokemonSet[]
}

export function TypeCoverage({ team }: TypeCoverageProps) {
  const pokeDetails = useMemo(() => {
    return team
      .filter(p => p.species)
      .map(p => p.species)
  }, [team])

  const analysis = useMemo(() => {
    return StatsCalculator.calculateTypeCoverage(team.map(p => Pokemon.fromJSON(p)))
  }, [team])

  if (pokeDetails.length === 0) {
    return (
      <div className="text-gray-500 text-sm text-center py-12">Add Pokémon to see type coverage</div>
    )
  }

  return (
    <div>
      <h3 className="text-sm font-medium text-gray-300 mb-3">Defensive Type Coverage</h3>
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
        {analysis.defensive.map(({ type, weak, resist, immune, weakCount, resistCount, immuneCount }) => {
          const color = TYPE_COLORS[type] ?? '#6b7280'
          const severity = weakCount > 0 ? 'weak' : resistCount > 0 ? 'resist' : immuneCount > 0 ? 'immune' : 'neutral'

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
                {weakCount > 0 && <div className="text-red-400 font-medium">{weakCount} weak</div>}
                {resistCount > 0 && <div className="text-green-400 font-medium">{resistCount} resist</div>}
                {immuneCount > 0 && <div className="text-gray-400 font-medium">{immuneCount} immune</div>}
                {weakCount === 0 && resistCount === 0 && immuneCount === 0 && (
                  <div className="text-gray-600">neutral</div>
                )}
              </div>

              {/* Tooltip on hover */}
              {(weakCount > 0 || resistCount > 0 || immuneCount > 0) && (
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 hidden group-hover:block z-10">
                  <div className="bg-gray-800 border border-gray-600 rounded-lg px-2.5 py-1.5 text-[10px] text-gray-300 whitespace-nowrap shadow-xl max-w-48">
                    {weakCount > 0 && <div className="text-red-400">Weak: {weak.join(', ')}</div>}
                    {resistCount > 0 && <div className="text-green-400">Resists: {resist.join(', ')}</div>}
                    {immuneCount > 0 && <div className="text-gray-400">Immune: {immune.join(', ')}</div>}
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
