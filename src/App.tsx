import { useState, useCallback, useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import type { GameTab } from './types'
import { FormatSelector } from './components/FormatSelector'
import { TabBar } from './components/TabBar'
import { BuilderTab } from './pages/BuilderTab'
import { AnalysisTab } from './pages/AnalysisTab'
import { TeamsTab } from './pages/TeamsTab'
import { useFormatStore, useTeamStore, useMetaStore } from './stores'

export default function App() {
  const [activeTab, setActiveTab] = useState<GameTab>('builder')
  const { currentFormat, setFormat, formats } = useFormatStore()
  const { resetTeam } = useTeamStore()
  const { load: loadMeta } = useMetaStore()

  useEffect(() => {
    if (currentFormat.smogonId) {
      loadMeta(currentFormat.smogonId)
    }
  }, [currentFormat.smogonId, loadMeta])

  const handleFormatChange = useCallback((fmt: typeof formats[0]) => {
    setFormat(fmt)
    resetTeam()
  }, [setFormat, resetTeam])

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
            {activeTab === 'builder' && <BuilderTab />}
            {activeTab === 'analysis' && <AnalysisTab />}
            {activeTab === 'teams' && <TeamsTab />}
          </motion.div>
        </AnimatePresence>
      </main>

      <footer className="fixed bottom-0 left-0 right-0 z-30 bg-gray-950/90 backdrop-blur-md border-t border-gray-800/50">
        <TabBar active={activeTab} onChange={setActiveTab} />
      </footer>
    </div>
  )
}
