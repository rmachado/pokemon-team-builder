import { useState } from 'react'
import { Download, Upload, Save, Plus, Copy } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { exportTeamToShowdown, importTeamFromShowdown } from '@/lib/importExport'
import { useTeamStore, useFormatStore } from '@/stores'

export function TeamActions() {
  const { currentTeam, importTeam, resetTeam, saveCurrentTeam } = useTeamStore()
  const { currentFormat } = useFormatStore()
  const [showExport, setShowExport] = useState(false)
  const [showImport, setShowImport] = useState(false)
  const [showSave, setShowSave] = useState(false)
  const [teamName, setTeamName] = useState('')
  const [importText, setImportText] = useState('')
  const [importError, setImportError] = useState('')

  const exportText = exportTeamToShowdown(currentTeam, { format: currentFormat.id })

  function handleImport() {
    try {
      const mons = importTeamFromShowdown(importText)
      importTeam(mons)
      setShowImport(false)
      setImportText('')
      setImportError('')
    } catch (e) {
      setImportError(e instanceof Error ? e.message : 'Invalid format')
    }
  }

  async function copyExport() {
    try {
      await navigator.clipboard.writeText(exportText)
    } catch {
      const ta = document.createElement('textarea')
      ta.value = exportText
      document.body.appendChild(ta)
      ta.select()
      document.execCommand('copy')
      document.body.removeChild(ta)
    }
  }

  return (
    <div className="flex flex-wrap gap-2">
      <Button variant="primary" size="sm" onClick={() => setShowExport(true)}>
        <Download className="w-3 h-3" /> Export
      </Button>
      <Button variant="secondary" size="sm" onClick={() => setShowImport(true)}>
        <Upload className="w-3 h-3" /> Import
      </Button>
      <Button variant="secondary" size="sm" onClick={() => setShowSave(true)}>
        <Save className="w-3 h-3" /> Save
      </Button>
      <Button variant="ghost" size="sm" onClick={resetTeam}>
        <Plus className="w-3 h-3" /> New
      </Button>

      <Modal open={showExport} onClose={() => setShowExport(false)} title="Export Team">
        <textarea
          readOnly
          value={exportText}
          className="w-full h-48 bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-sm text-white font-mono focus:outline-none resize-none"
        />
        <Button variant="primary" size="sm" className="mt-3" onClick={copyExport}>
          <Copy className="w-3 h-3" /> Copy to Clipboard
        </Button>
      </Modal>

      <Modal open={showImport} onClose={() => setShowImport(false)} title="Import Team (Showdown Format)">
        <textarea
          value={importText}
          onChange={e => setImportText(e.target.value)}
          placeholder="Paste Pokémon Showdown team export here..."
          className="w-full h-48 bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 resize-none font-mono"
        />
        {importError && <p className="text-red-400 text-xs mt-1">{importError}</p>}
        <Button variant="primary" size="sm" className="mt-3" onClick={handleImport}>
          <Upload className="w-3 h-3" /> Import
        </Button>
      </Modal>

      <Modal open={showSave} onClose={() => setShowSave(false)} title="Save Team">
        <input
          type="text"
          value={teamName}
          onChange={e => setTeamName(e.target.value)}
          placeholder="Team name..."
          className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
          autoFocus
        />
        <Button
          variant="primary"
          size="sm"
          className="mt-3"
          onClick={() => {
            if (teamName.trim()) {
              saveCurrentTeam(teamName.trim(), currentFormat.id)
              setShowSave(false)
              setTeamName('')
            }
          }}
          disabled={!teamName.trim()}
        >
          <Save className="w-3 h-3" /> Save
        </Button>
      </Modal>
    </div>
  )
}
