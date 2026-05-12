import { RefreshCw } from 'lucide-react'
import * as Tabs from '@radix-ui/react-tabs'
import { TypeCoverage } from '@/components/Analysis/TypeCoverage'
import { MatchupTable } from '@/components/Analysis/MatchupTable'
import { DamageCalcPanel } from '@/components/Analysis/DamageCalcPanel'
import { TeamComparison } from '@/components/Analysis/TeamComparison'
import { Button } from '@/components/ui/Button'
import { useTeamStore, useMetaStore, useFormatStore } from '@/stores'

const SUB_TABS = [
  { id: 'overview', label: 'Overview' },
  { id: 'matchup', label: 'Matchups' },
  { id: 'calc', label: 'Damage Calc' },
  { id: 'compare', label: 'Team Compare' },
]

export function AnalysisTab() {
  const { currentTeam, opposingTeams, loadTeam, removeOpposingTeam } = useTeamStore()
  const { metaData, loading: metaLoading, error: metaError } = useMetaStore()
  const { currentFormat } = useFormatStore()

  const handleRefreshMeta = () => {
    if (currentFormat.hasMeta && currentFormat.smogonId) {
      useMetaStore.getState().refresh(currentFormat.smogonId)
    }
  }

  return (
    <Tabs.Root defaultValue="overview" className="flex flex-col p-4 gap-3" style={{ height: 'calc(100dvh - 88px)' }}>
      <div className="flex items-center justify-between shrink-0">
        <h2 className="text-base font-semibold text-gray-200">Analysis</h2>
        {currentFormat.hasMeta && (
          <Button variant="ghost" size="sm" onClick={handleRefreshMeta}>
            <RefreshCw className="w-3 h-3" /> Refresh Meta
          </Button>
        )}
      </div>

      <Tabs.List className="flex gap-1 border-b border-gray-700 overflow-x-auto shrink-0" aria-label="Analysis sub-tabs">
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

      <div className="flex-1 overflow-y-auto min-h-0">
        {metaError && (
          <div className="text-xs text-red-400 mb-2">
            Meta data: {metaError}
          </div>
        )}

        <Tabs.Content value="overview">
          <TypeCoverage team={currentTeam} />
        </Tabs.Content>
        <Tabs.Content value="matchup">
          <MatchupTable team={currentTeam} metaData={metaData} loading={metaLoading} />
        </Tabs.Content>
        <Tabs.Content value="calc">
          <DamageCalcPanel />
        </Tabs.Content>
        <Tabs.Content value="compare">
          <TeamComparison
            yourTeam={currentTeam}
            opposingTeams={opposingTeams}
            onSelect={loadTeam}
            onRemove={removeOpposingTeam}
          />
        </Tabs.Content>
      </div>
    </Tabs.Root>
  )
}
