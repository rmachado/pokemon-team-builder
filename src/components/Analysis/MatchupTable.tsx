import { useMemo } from 'react'
import type { PokemonSet, MetaPokemonStats } from '../../types'
import { calcMatchup } from '../../lib/calc'
import { getTopMoves, getTopItem, getTopAbility } from '../../lib/meta'

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
        const topMoves = getTopMoves(meta, 4)
        const topItem = getTopItem(meta)
        const topAbility = getTopAbility(meta)

        const commonSet: PokemonSet = {
          species: meta.species,
          item: topItem,
          ability: topAbility,
          moves: topMoves.slice(0, 4).concat(['', '', '', '']).slice(0, 4) as [string, string, string, string],
          nature: 'Adamant',
          evs: { hp: 252, atk: 252, def: 0, spa: 0, spd: 0, spe: 0 },
          ivs: { hp: 31, atk: 31, def: 31, spa: 31, spd: 31, spe: 31 },
          teraType: '',
          level: 50,
        }

        const teras = Object.entries(meta.teraTypes).sort((a, b) => b[1] - a[1])
        if (teras[0]) commonSet.teraType = teras[0][0]

        const calcResults = calcMatchup(mon, commonSet)
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
