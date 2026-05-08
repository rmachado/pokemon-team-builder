import { useState, useCallback } from 'react'
import { AnimatePresence } from 'framer-motion'
import type { PokemonSet } from '../types'
import { PokemonCard } from '../components/TeamBuilder/PokemonCard'
import { TeamActions } from '../components/TeamBuilder/TeamActions'
import { EditingPanel } from '../components/TeamBuilder/EditingPanel'
import type { EditTarget } from '../components/TeamBuilder/EditingPanel'
import { useKeyboardNav } from '../hooks/useKeyboardNav'

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

  const handleAdvanceMove = useCallback(() => {
    if (!editTarget) return
    const { slotIndex, field, moveIndex } = editTarget

    if (field === 'pokemon') return setEditTarget({ slotIndex, field: 'move', moveIndex: 0 })
    if (field === 'move' && moveIndex !== undefined && moveIndex < 3)
      return setEditTarget({ slotIndex, field: 'move', moveIndex: moveIndex + 1 })
    if (field === 'move' && moveIndex === 3) return setEditTarget({ slotIndex, field: 'item' })
    if (field === 'item') return setEditTarget({ slotIndex, field: 'ability' })
    if (field === 'ability') return setEditTarget({ slotIndex, field: 'stats' })
  }, [editTarget])
  const importFn = useCallback(() => {}, [])
  const exportFn = useCallback(() => {}, [])
  const saveFn = useCallback(() => onSave('Quick Save'), [onSave])

  useKeyboardNav({
    onEditSlot: (i) => handleEdit(i, 'pokemon'),
    onImport: importFn,
    onExport: exportFn,
    onSave: saveFn,
    editTarget,
    onClosePanel: () => setEditTarget(null),
  })

  return (
    <div className="flex flex-col sm:flex-row gap-0 sm:gap-3 p-2 sm:p-3"
      style={{ height: 'calc(100dvh - 88px)' }}>
      <div className="flex flex-col flex-1 min-w-0 min-h-0">
        <div className="flex items-center justify-between mb-3 shrink-0">
          <h2 className="text-sm font-semibold text-gray-300">Team Builder</h2>
          <TeamActions
            pokemon={team}
            onImport={onImport}
            onReset={onReset}
            onSave={onSave}
          />
        </div>

        <div className="flex-1 overflow-y-auto space-y-2 pr-1" style={{ minHeight: 0 }}>
          <AnimatePresence>
            {team.map((pokemon, i) => (
              <PokemonCard
                key={i}
                pokemon={pokemon}
                isActive={editTarget?.slotIndex === i}
                onClick={() => handleEdit(i, 'pokemon')}
                onEdit={(field, moveIndex) => handleEdit(i, field, moveIndex)}
              />
            ))}
          </AnimatePresence>
        </div>
      </div>

      <div className="hidden sm:block sm:w-80 lg:w-96 shrink-0">
        <EditingPanel
          editTarget={editTarget}
          team={team}
          onUpdate={onUpdate}
          onClose={() => setEditTarget(null)}
          onAdvanceMove={handleAdvanceMove}
        />
      </div>

      {editTarget && (
        <div className="sm:hidden fixed inset-0 z-40 bg-black/60" onClick={() => setEditTarget(null)}>
          <div className="absolute bottom-0 left-0 right-0 max-h-[70dvh] rounded-t-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
            <EditingPanel
              editTarget={editTarget}
              team={team}
              onUpdate={onUpdate}
              onClose={() => setEditTarget(null)}
              onAdvanceMove={handleAdvanceMove}
            />
          </div>
        </div>
      )}
    </div>
  )
}
