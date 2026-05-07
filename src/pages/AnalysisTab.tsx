import { RefreshCw } from 'lucide-react'
import * as Tabs from '@radix-ui/react-tabs'
import type { PokemonSet, MetaPokemonStats, Team } from '../types'
import { TypeCoverage } from '../components/Analysis/TypeCoverage'
import { MatchupTable } from '../components/Analysis/MatchupTable'
import { DamageCalcPanel } from '../components/Analysis/DamageCalcPanel'
import { TeamComparison } from '../components/Analysis/TeamComparison'
import { Button } from '../components/ui/Button'

interface AnalysisTabProps {
  team: PokemonSet[]
  metaData: MetaPokemonStats[]
  metaLoading: boolean
  metaError: string | null
  onRefreshMeta: () => void
  opposingTeams: Team[]
  onLoadTeam: (team: Team) => void
  onRemoveOpposing: (id: string) => void
}

const SUB_TABS = [
  { id: 'overview', label: 'Overview' },
  { id: 'matchup', label: 'Matchups' },
  { id: 'calc', label: 'Damage Calc' },
  { id: 'compare', label: 'Team Compare' },
]

export function AnalysisTab({
  team, metaData, metaLoading, metaError, onRefreshMeta,
  opposingTeams, onLoadTeam, onRemoveOpposing,
}: AnalysisTabProps) {
  return (
    <Tabs.Root defaultValue="overview" className="p-3 pb-20 space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-gray-200">Analysis</h2>
        <Button variant="ghost" size="sm" onClick={onRefreshMeta}>
          <RefreshCw className="w-3 h-3" /> Refresh Meta
        </Button>
      </div>

      <Tabs.List className="flex gap-1 border-b border-gray-700 overflow-x-auto" aria-label="Analysis sub-tabs">
        {SUB_TABS.map(st => (
          <Tabs.Trigger
            key={st.id}
            value={st.id}
            className="px-3 py-1.5 text-xs font-medium transition-colors shrink-0 data-[state=active]:text-blue-400 data-[state=active]:border-b-2 data-[state=active]:border-blue-500 data-[state=active]:-mb-[1px] text-gray-500 hover:text-gray-300 cursor-pointer outline-none"
          >
            {st.label}
          </Tabs.Trigger>
        ))}
      </Tabs.List>

      <div className="min-h-48">
        {metaError && (
          <div className="text-xs text-red-400 mb-2">
            Meta data: {metaError}
          </div>
        )}

        <Tabs.Content value="overview">
          <TypeCoverage team={team} />
        </Tabs.Content>
        <Tabs.Content value="matchup">
          <MatchupTable team={team} metaData={metaData} loading={metaLoading} />
        </Tabs.Content>
        <Tabs.Content value="calc">
          <DamageCalcPanel />
        </Tabs.Content>
        <Tabs.Content value="compare">
          <TeamComparison
            yourTeam={team}
            opposingTeams={opposingTeams}
            onSelect={onLoadTeam}
            onRemove={onRemoveOpposing}
          />
        </Tabs.Content>
      </div>
    </Tabs.Root>
  )
}
