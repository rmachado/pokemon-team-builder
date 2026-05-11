import { ArrowUpFromLine, Trash2 } from 'lucide-react'
import { useMemo } from 'react'
import type { PokemonSet, Team } from '@/types'

interface TeamComparisonProps {
  yourTeam: PokemonSet[]
  opposingTeams: Team[]
  onSelect?: (team: Team) => void
  onRemove?: (id: string) => void
}

export function TeamComparison({ yourTeam, opposingTeams, onSelect, onRemove }: TeamComparisonProps) {
  const yourMons = useMemo(() => yourTeam.filter(p => p.species), [yourTeam])

  if (opposingTeams.length === 0) {
    return (
      <div className="text-gray-500 text-sm text-center py-8">
        No opposing teams registered. Go to the Teams tab to import teams for comparison.
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium text-gray-300">Registered Opposing Teams ({opposingTeams.length})</h3>
      {opposingTeams.map(team => (
        <div key={team.id} className="bg-gray-800/50 border border-gray-700 rounded-lg p-3">
          <div className="flex items-center justify-between mb-2">
            <div>
              <span className="text-sm font-medium text-gray-200">{team.name}</span>
              <span className="text-xs text-gray-500 ml-2">{team.format}</span>
            </div>
            <div className="flex gap-2">
              {onSelect && (
                <button
                  onClick={() => onSelect(team)}
                  className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1"
                >
                  <ArrowUpFromLine className="w-3 h-3" /> Load
                </button>
              )}
              {onRemove && (
                <button
                  onClick={() => onRemove(team.id)}
                  className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1"
                >
                  <Trash2 className="w-3 h-3" /> Delete
                </button>
              )}
            </div>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {team.pokemon.filter(p => p.species).map(p => (
              <span key={p.species} className="text-xs bg-gray-700 px-2 py-0.5 rounded text-gray-300">
                {p.species}
              </span>
            ))}
          </div>

          {yourMons.length > 0 && (
            <div className="mt-2 pt-2 border-t border-gray-700">
              <span className="text-xs text-gray-500">Quick comparison:</span>
              <div className="text-xs text-gray-400 mt-1">
                Your {yourMons.length} mons vs their {team.pokemon.filter(p => p.species).length} mons
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
