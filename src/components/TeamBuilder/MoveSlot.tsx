import { useState } from 'react'
import { Modal } from '../ui/Modal'

interface MoveSlotProps {
  value: string
  onChange: (move: string) => void
  learnableMoves: string[]
  index: number
}

export function MoveSlot({ value, onChange, learnableMoves, index }: MoveSlotProps) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')

  const filtered = query
    ? learnableMoves.filter(m => m.toLowerCase().includes(query.toLowerCase()))
    : learnableMoves

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className={`w-full text-left px-2.5 py-1.5 rounded text-sm border transition-colors ${
          value
            ? 'bg-gray-700/50 border-gray-600 text-gray-100'
            : 'bg-gray-800/50 border-gray-700 text-gray-400 hover:border-gray-500'
        }`}
      >
        {value || `Move ${index + 1}`}
      </button>

      <Modal open={open} onClose={() => setOpen(false)} title={`Move ${index + 1}`}>
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search moves..."
          className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 mb-3"
          autoFocus
        />
        <div className="max-h-60 overflow-y-auto space-y-0.5">
          {filtered.map(move => (
            <button
              key={move}
              onClick={() => { onChange(move); setOpen(false); setQuery('') }}
              className={`w-full text-left px-3 py-1.5 rounded text-sm transition-colors ${
                move === value
                  ? 'bg-blue-600/40 text-blue-200'
                  : 'text-gray-200 hover:bg-gray-700'
              }`}
            >
              {move}
            </button>
          ))}
          {filtered.length === 0 && (
            <p className="text-gray-500 text-sm py-4 text-center">No moves found</p>
          )}
        </div>
      </Modal>
    </>
  )
}
