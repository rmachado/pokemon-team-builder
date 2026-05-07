import { useState } from 'react'
import type { PokemonSet } from '../types'
import { TeamSlot } from '../components/TeamBuilder/TeamSlot'
import { TeamActions } from '../components/TeamBuilder/TeamActions'
import { SharedPanel } from '../components/TeamBuilder/SharedPanel'
import type { EditTarget } from '../components/TeamBuilder/SharedPanel'

interface BuilderTabProps {
  team: PokemonSet[]
  onUpdate: (index: number, pokemon: PokemonSet) => void
  onImport: (mons: PokemonSet[]) => void
  onReset: () => void
  onSave: (name: string) => void
}

export function BuilderTab({ team, onUpdate, onImport, onReset, onSave }: BuilderTabProps) {
  const [editTarget, setEditTarget] = useState<EditTarget | null>(null)

  function handleEdit(slotIndex: number, field: string, moveIndex?: number) {
    setEditTarget({ slotIndex, field: field as EditTarget['field'], moveIndex })
  }

  return (
    <div className="flex flex-col sm:flex-row gap-0 sm:gap-2 p-2"
      style={{ height: 'calc(100dvh - 88px)' }}>
      <div className="flex flex-col flex-1 min-w-0 min-h-0">
        <div className="flex items-center justify-between mb-2 shrink-0">
          <h2 className="text-sm font-semibold text-gray-200">Team Builder</h2>
          <TeamActions
            pokemon={team}
            onImport={onImport}
            onReset={onReset}
            onSave={onSave}
          />
        </div>

        <div className="flex-1 overflow-y-auto space-y-2" style={{ minHeight: 0 }}>
          {team.map((pokemon, i) => (
            <TeamSlot
              key={i}
              pokemon={pokemon}
              onEdit={(field, moveIndex) => handleEdit(i, field, moveIndex)}
            />
          ))}
        </div>
      </div>

      <div className="sm:w-80 lg:w-96 shrink-0">
        <SharedPanel
          editTarget={editTarget}
          team={team}
          onUpdate={onUpdate}
          onClose={() => setEditTarget(null)}
        />
      </div>
    </div>
  )
}
