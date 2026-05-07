import { useState, useMemo } from 'react'
import { Modal } from '../ui/Modal'
import { getItems } from '../../lib/pkmn'

interface ItemPickerProps {
  value: string
  onChange: (item: string) => void
}

export function ItemPicker({ value, onChange }: ItemPickerProps) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const items = useMemo(() => getItems(), [])

  const filtered = query
    ? items.filter(i => i.toLowerCase().includes(query.toLowerCase()))
    : items

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
        {value || 'Item'}
      </button>

      <Modal open={open} onClose={() => setOpen(false)} title="Select Item">
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search items..."
          className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 mb-3"
          autoFocus
        />
        <div className="max-h-60 overflow-y-auto space-y-0.5">
          <button
            onClick={() => { onChange(''); setOpen(false); setQuery('') }}
            className={`w-full text-left px-3 py-1.5 rounded text-sm transition-colors ${
              !value ? 'bg-blue-600/40 text-blue-200' : 'text-gray-400 hover:bg-gray-700'
            }`}
          >
            (No Item)
          </button>
          {filtered.map(item => (
            <button
              key={item}
              onClick={() => { onChange(item); setOpen(false); setQuery('') }}
              className={`w-full text-left px-3 py-1.5 rounded text-sm transition-colors ${
                item === value
                  ? 'bg-blue-600/40 text-blue-200'
                  : 'text-gray-200 hover:bg-gray-700'
              }`}
            >
              {item}
            </button>
          ))}
        </div>
      </Modal>
    </>
  )
}
