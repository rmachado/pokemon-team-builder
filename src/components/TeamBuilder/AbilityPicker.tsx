import { useState, useMemo } from 'react'
import { Modal } from '../ui/Modal'
import { getAbilities } from '../../lib/pkmn'

interface AbilityPickerProps {
  value: string
  onChange: (ability: string) => void
}

export function AbilityPicker({ value, onChange }: AbilityPickerProps) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const abilities = useMemo(() => getAbilities(), [])

  const filtered = query
    ? abilities.filter(a => a.toLowerCase().includes(query.toLowerCase()))
    : abilities

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
        {value || 'Ability'}
      </button>

      <Modal open={open} onClose={() => setOpen(false)} title="Select Ability">
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search abilities..."
          className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 mb-3"
          autoFocus
        />
        <div className="max-h-60 overflow-y-auto space-y-0.5">
          {filtered.map(ability => (
            <button
              key={ability}
              onClick={() => { onChange(ability); setOpen(false); setQuery('') }}
              className={`w-full text-left px-3 py-1.5 rounded text-sm transition-colors ${
                ability === value
                  ? 'bg-blue-600/40 text-blue-200'
                  : 'text-gray-200 hover:bg-gray-700'
              }`}
            >
              {ability}
            </button>
          ))}
        </div>
      </Modal>
    </>
  )
}
