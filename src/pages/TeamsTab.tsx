import { useState } from 'react'
import { Upload, Trash2, ArrowUpFromLine } from 'lucide-react'
import type { Team } from '../types'
import { Button } from '../components/ui/Button'
import { Modal } from '../components/ui/Modal'
import { importTeamFromShowdown } from '../lib/importExport'
import { generateId } from '../lib/storage'

interface TeamsTabProps {
  savedTeams: Team[]
  opposingTeams: Team[]
  formatId: string
  onLoadTeam: (team: Team) => void
  onDeleteTeam: (id: string) => void
  onAddOpposing: (team: Team) => void
  onRemoveOpposing: (id: string) => void
}

export function TeamsTab({
  savedTeams, opposingTeams, formatId,
  onLoadTeam, onDeleteTeam, onAddOpposing, onRemoveOpposing,
}: TeamsTabProps) {
  const [showImport, setShowImport] = useState(false)
  const [importText, setImportText] = useState('')
  const [importError, setImportError] = useState('')
  const [teamName, setTeamName] = useState('')

  function handleImport(type: 'saved' | 'opposing') {
    try {
      const pokemon = importTeamFromShowdown(importText)
      const team: Team = {
        id: generateId(),
        name: teamName || `${type === 'saved' ? 'Team' : 'Opponent'} ${new Date().toLocaleDateString()}`,
        format: formatId,
        pokemon,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      }
      if (type === 'saved') {
        onLoadTeam(team)
      } else {
        onAddOpposing(team)
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
    <div className="p-3 pb-20 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-gray-200">Teams</h2>
        <Button variant="primary" size="sm" onClick={() => setShowImport(true)}>
          <Upload className="w-3 h-3" /> Import Team
        </Button>
      </div>

      <section>
        <h3 className="text-sm font-medium text-gray-400 mb-2">Your Teams ({savedTeams.length})</h3>
        {savedTeams.length === 0 ? (
          <p className="text-gray-500 text-sm">No saved teams yet. Build and save a team in the Builder tab.</p>
        ) : (
          <div className="space-y-2">
            {savedTeams.map(team => (
              <TeamCard key={team.id} team={team} onLoad={onLoadTeam} onDelete={onDeleteTeam} />
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
              <TeamCard key={team.id} team={team} onLoad={onLoadTeam} onDelete={onRemoveOpposing} />
            ))}
          </div>
        )}
      </section>

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
