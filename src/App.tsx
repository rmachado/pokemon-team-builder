import { useState, useCallback } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import type { GameTab, PokemonSet } from './types'
import { FormatSelector } from './components/FormatSelector'
import { TabBar } from './components/TabBar'
import { BuilderTab } from './pages/BuilderTab'
import { AnalysisTab } from './pages/AnalysisTab'
import { TeamsTab } from './pages/TeamsTab'
import { useTeam, emptyTeam } from './hooks/useTeam'
import { useFormat } from './hooks/useFormat'
import { useMetaData } from './hooks/useMetaData'

export default function App() {
  const [activeTab, setActiveTab] = useState<GameTab>('builder')
  const { currentFormat, setCurrentFormat, formats } = useFormat()
  const {
    currentTeam, setCurrentTeam,
    savedTeams, opposingTeams,
    updatePokemon, saveCurrentTeam, deleteTeam,
    addOpposingTeam, removeOpposingTeam,
    loadTeam,
  } = useTeam()

  const { metaData, loading: metaLoading, error: metaError, refresh: refreshMeta } = useMetaData(currentFormat.id)

  const handleImport = useCallback((mons: PokemonSet[]) => {
    const padded = [...mons, ...emptyTeam()].slice(0, 6)
    setCurrentTeam(padded)
  }, [setCurrentTeam])

  const handleReset = useCallback(() => {
    setCurrentTeam(emptyTeam())
  }, [setCurrentTeam])

  const handleSave = useCallback((name: string) => {
    saveCurrentTeam(name, currentFormat.id)
  }, [saveCurrentTeam, currentFormat.id])

  const handleFormatChange = useCallback((fmt: typeof formats[0]) => {
    setCurrentFormat(fmt)
    setCurrentTeam(emptyTeam())
  }, [setCurrentFormat, setCurrentTeam])

  return (
    <div className="flex flex-col min-h-dvh bg-gray-950 text-gray-100">
      <header className="sticky top-0 z-30 bg-gray-950/90 backdrop-blur-md border-b border-gray-800/50 px-3 py-2.5">
        <div className="flex items-center justify-between">
          <h1 className="text-base font-bold text-white tracking-tight">VGC Team Builder</h1>
          <FormatSelector
            formats={formats}
            current={currentFormat}
            onChange={handleFormatChange}
          />
        </div>
      </header>

      <main className="flex-1 w-full">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.15 }}
          >
            {activeTab === 'builder' && (
              <BuilderTab
                team={currentTeam}
                onUpdate={updatePokemon}
                onImport={handleImport}
                onReset={handleReset}
                onSave={handleSave}
              />
            )}
            {activeTab === 'analysis' && (
              <AnalysisTab
                team={currentTeam}
                metaData={metaData}
                metaLoading={metaLoading}
                metaError={metaError}
                onRefreshMeta={refreshMeta}
                opposingTeams={opposingTeams}
                onLoadTeam={loadTeam}
                onRemoveOpposing={removeOpposingTeam}
              />
            )}
            {activeTab === 'teams' && (
              <TeamsTab
                savedTeams={savedTeams}
                opposingTeams={opposingTeams}
                formatId={currentFormat.id}
                onLoadTeam={loadTeam}
                onDeleteTeam={deleteTeam}
                onAddOpposing={addOpposingTeam}
                onRemoveOpposing={removeOpposingTeam}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      <footer className="fixed bottom-0 left-0 right-0 z-30 bg-gray-950/90 backdrop-blur-md border-t border-gray-800/50">
        <TabBar active={activeTab} onChange={setActiveTab} />
      </footer>
    </div>
  )
}
