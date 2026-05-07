import { useState, useMemo } from 'react'
import { getMove } from '../../lib/pkmn'

interface MovePanelProps {
  current: string
  learnableMoves: string[]
  onSelect: (move: string) => void
}

export function MovePanel({ current, learnableMoves, onSelect }: MovePanelProps) {
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState(current)

  const filtered = useMemo(() => {
    if (!query) return learnableMoves.slice(0, 100)
    return learnableMoves.filter(m => m.toLowerCase().includes(query.toLowerCase())).slice(0, 100)
  }, [query, learnableMoves])

  const moveDetail = selected ? getMove(selected) : null
  const moveDetailAny = moveDetail as Record<string, unknown> | undefined

  return (
    <div className="flex flex-col h-full gap-2">
      <input
        type="text"
        value={query}
        onChange={e => setQuery(e.target.value)}
        placeholder="Search moves..."
        className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-1.5 text-sm text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
        autoFocus
      />
      <div className="flex gap-3 flex-1 min-h-0">
        <div className="flex-1 overflow-y-auto space-y-0.5 max-h-40">
          {filtered.map(move => (
            <button
              key={move}
              onClick={() => { setSelected(move); onSelect(move) }}
              className={`w-full text-left px-2 py-1 rounded text-xs transition-colors ${
                move === current
                  ? 'bg-blue-600/40 text-blue-200'
                  : selected === move
                  ? 'bg-gray-700 text-gray-100'
                  : 'text-gray-300 hover:bg-gray-700'
              }`}
            >
              {move}
            </button>
          ))}
        </div>
        <div className="w-48 shrink-0 bg-gray-800/50 rounded-lg p-2.5 space-y-1.5">
          {moveDetailAny ? (
            <>
              <div className="text-sm font-medium text-gray-100">{moveDetailAny.name as string}</div>
              <div className="flex flex-wrap gap-1 text-xs">
                <span className="px-1.5 py-0.5 rounded bg-gray-700 text-gray-300">{moveDetailAny.type as string}</span>
                <span className="px-1.5 py-0.5 rounded bg-gray-700 text-gray-300">{moveDetailAny.category as string}</span>
              </div>
              <div className="text-xs text-gray-400 space-y-0.5">
                <div>Power: <span className="text-gray-200 font-mono">{String(moveDetailAny.basePower ?? '-')}</span></div>
                <div>Accuracy: <span className="text-gray-200 font-mono">{typeof moveDetailAny.accuracy === 'number' ? `${moveDetailAny.accuracy}%` : '—'}</span></div>
                <div>PP: <span className="text-gray-200 font-mono">{moveDetailAny.pp as string ?? '-'}</span></div>
                <div className="pt-1 text-gray-500 text-xs leading-tight">
                  {moveDetailAny.desc as string || moveDetailAny.shortDesc as string || ''}
                </div>
              </div>
            </>
          ) : (
            <div className="text-xs text-gray-500">Select a move</div>
          )}
        </div>
      </div>
    </div>
  )
}
