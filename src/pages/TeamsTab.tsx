import { useState } from 'react'
import { Upload, Trash2, ArrowUpFromLine } from 'lucide-react'
import type { Team } from '@/types'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { useTeamStore, useFormatStore } from '@/stores'
import { TeamService } from '@/domain'

export function TeamsTab() {
  const { savedTeams, opposingTeams, loadTeam, deleteTeam, addOpposingTeam, removeOpposingTeam } = useTeamStore()
  const { currentFormat } = useFormatStore()
  const [showImport, setShowImport] = useState(false)
  const [importText, setImportText] = useState('')
  const [importError, setImportError] = useState('')
  const [teamName, setTeamName] = useState('')

  function handleImport(type: 'saved' | 'opposing') {
    try {
      const pokemon = TeamService.importFromShowdown(importText)
      const team = TeamService.buildTeam(
        teamName || (type === 'saved' ? `Team ${new Date().toLocaleDateString()}` : `Opponent ${new Date().toLocaleDateString()}`),
        currentFormat.id,
        pokemon,
      )
      if (type === 'saved') {
        loadTeam(team.toJSON())
      } else {
        addOpposingTeam(team.toJSON())
      }
      setShowImport(false)
      setImportText('')
      setTeamName('')
      setImportError('')
    } catch (e) {
      setImportError(e instanceof Error ? e.message : 'Invalid format')
    }
  }

  return (
    <div className="flex flex-col p-4 gap-4" style={{ height: 'calc(100dvh - 88px)' }}>
      <div className="flex items-center justify-between shrink-0">
        <h2 className="text-base font-semibold text-gray-200">Teams</h2>
        <Button variant="primary" size="sm" onClick={() => setShowImport(true)}>
          <Upload className="w-3 h-3" /> Import Team
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto space-y-4" style={{ minHeight: 0 }}>
        <section>
          <h3 className="text-sm font-medium text-gray-400 mb-2">Your Teams ({savedTeams.length})</h3>
          {savedTeams.length === 0 ? (
            <p className="text-gray-500 text-sm">No saved teams yet. Build and save a team in the Builder tab.</p>
          ) : (
            <div className="space-y-2">
              {savedTeams.map(team => (
                <TeamCard key={team.id} team={team} onLoad={loadTeam} onDelete={deleteTeam} />
              ))}
            </div>
          )}
        </section>

        <section>
          <h3 className="text-sm font-medium text-gray-400 mb-2">Opposing Teams ({opposingTeams.length})</h3>
          {opposingTeams.length === 0 ? (
            <p className="text-gray-500 text-sm">No opposing teams imported. Import teams to use in team comparison.</p>
          ) : (
            <div className="space-y-2">
              {opposingTeams.map(team => (
                <TeamCard key={team.id} team={team} onLoad={loadTeam} onDelete={removeOpposingTeam} />
              ))}
            </div>
          )}
        </section>
      </div>

      <Modal open={showImport} onClose={() => setShowImport(false)} title="Import Team">
        <div className="space-y-3">
          <input
            type="text"
            value={teamName}
            onChange={e => setTeamName(e.target.value)}
            placeholder="Team name (optional)..."
            className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
          />
          <textarea
            value={importText}
            onChange={e => setImportText(e.target.value)}
            placeholder="Paste Pokémon Showdown team export..."
            className="w-full h-40 bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 resize-none font-mono"
          />
          {importError && <p className="text-red-400 text-xs">{importError}</p>}
          <div className="flex gap-2">
            <Button variant="primary" size="sm" onClick={() => handleImport('saved')} disabled={!importText.trim()}>
              <ArrowUpFromLine className="w-3 h-3" /> Save as My Team
            </Button>
            <Button variant="secondary" size="sm" onClick={() => handleImport('opposing')} disabled={!importText.trim()}>
              <Upload className="w-3 h-3" /> Save as Opponent
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

function TeamCard({ team, onLoad, onDelete }: { team: Team; onLoad: (t: Team) => void; onDelete: (id: string) => void }) {
  return (
    <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-3">
      <div className="flex items-center justify-between mb-2">
        <div>
          <span className="text-sm font-medium text-gray-200">{team.name}</span>
          <span className="text-xs text-gray-500 ml-2">{team.format}</span>
        </div>
        <div className="flex gap-2">
          <button onClick={() => onLoad(team)} className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1">
            <ArrowUpFromLine className="w-3 h-3" /> Load
          </button>
          <button onClick={() => onDelete(team.id)} className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1">
            <Trash2 className="w-3 h-3" /> Delete
          </button>
        </div>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {team.pokemon.filter(p => p.species).map(p => (
          <span key={p.species} className="text-xs bg-gray-700 px-2 py-0.5 rounded text-gray-300">
            {p.species}
          </span>
        ))}
      </div>
    </div>
  )
}
