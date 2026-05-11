import { useMemo } from 'react'
import type { PokemonSet, MetaPokemonStats } from '@/types'
import { Pokemon, DamageCalculator } from '@/domain'

interface MatchupTableProps {
  team: PokemonSet[]
  metaData: MetaPokemonStats[]
  loading: boolean
}

export function MatchupTable({ team, metaData, loading }: MatchupTableProps) {
  const matchups = useMemo(() => {
    if (!team.some(p => p.species) || metaData.length === 0) return []

    const topMeta = metaData.slice(0, 10)
    const results: {
      yourMon: string
      theirMon: string
      damage: { moveName: string; minPercent: number; maxPercent: number }[]
    }[] = []

    for (const mon of team) {
      if (!mon.species) continue

      for (const meta of topMeta) {
        const commonSet = DamageCalculator.buildFromMeta(meta)
        const calcResults = DamageCalculator.calculateMatchup(Pokemon.fromJSON(mon), commonSet)
        results.push({
          yourMon: mon.species,
          theirMon: meta.species,
          damage: calcResults.map(r => ({
            moveName: r.moveName,
            minPercent: r.minPercent,
            maxPercent: r.maxPercent,
          })),
        })
      }
    }

    return results
  }, [team, metaData])

  if (loading) {
    return (
      <div className="text-gray-500 text-sm text-center py-8">
        Loading meta data...
      </div>
    )
  }

  if (matchups.length === 0) {
    return (
      <div className="text-gray-500 text-sm text-center py-8">
        {metaData.length === 0
          ? 'No meta data loaded. Select a format and refresh.'
          : 'Add Pokémon to your team to see matchups.'
        }
      </div>
    )
  }

  const yourMons = [...new Set(matchups.map(m => m.yourMon))]
  const theirMons = [...new Set(matchups.map(m => m.theirMon))]

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs">
        <thead>
          <tr className="text-gray-400">
            <th className="text-left px-2 py-1 sticky left-0 bg-gray-950">Your Mon</th>
            {theirMons.map(m => (
              <th key={m} className="px-2 py-1 text-center">{m}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {yourMons.map(yourMon => (
            <tr key={yourMon} className="border-t border-gray-800">
              <td className="text-left px-2 py-1.5 font-medium text-gray-200 sticky left-0 bg-gray-950">
                {yourMon}
              </td>
              {theirMons.map(theirMon => {
                const m = matchups.find(x => x.yourMon === yourMon && x.theirMon === theirMon)
                const best = m ? m.damage.reduce((a, b) => Math.max(a, b.maxPercent), 0) : 0
                const color = best >= 100 ? 'text-green-400' : best >= 50 ? 'text-yellow-400' : 'text-red-400'
                return (
                  <td key={theirMon} className={`text-center px-2 py-1.5 ${color}`}>
                    {best.toFixed(0)}%
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
