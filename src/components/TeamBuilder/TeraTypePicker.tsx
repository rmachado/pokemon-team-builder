import { useState } from 'react'
import { Modal } from '../ui/Modal'
import { TYPES } from '../../lib/pkmn'

interface TeraTypePickerProps {
  value: string
  onChange: (teraType: string) => void
}

const TYPE_COLORS: Record<string, string> = {
  Normal: 'bg-gray-400/30 text-gray-200',
  Fire: 'bg-orange-500/30 text-orange-200',
  Water: 'bg-blue-500/30 text-blue-200',
  Electric: 'bg-yellow-400/30 text-yellow-200',
  Grass: 'bg-green-500/30 text-green-200',
  Ice: 'bg-cyan-300/30 text-cyan-200',
  Fighting: 'bg-red-600/30 text-red-200',
  Poison: 'bg-purple-500/30 text-purple-200',
  Ground: 'bg-amber-500/30 text-amber-200',
  Flying: 'bg-indigo-300/30 text-indigo-200',
  Psychic: 'bg-pink-500/30 text-pink-200',
  Bug: 'bg-lime-500/30 text-lime-200',
  Rock: 'bg-yellow-600/30 text-yellow-200',
  Ghost: 'bg-purple-700/30 text-purple-200',
  Dragon: 'bg-violet-600/30 text-violet-200',
  Dark: 'bg-neutral-700/30 text-neutral-200',
  Steel: 'bg-stone-400/30 text-stone-200',
  Fairy: 'bg-pink-300/30 text-pink-200',
}

export function TeraTypePicker({ value, onChange }: TeraTypePickerProps) {
  const [open, setOpen] = useState(false)

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
        {value || 'Tera Type'}
      </button>

      <Modal open={open} onClose={() => setOpen(false)} title="Select Tera Type">
        <div className="grid grid-cols-3 gap-1.5">
          {TYPES.map(type => (
            <button
              key={type}
              onClick={() => { onChange(type); setOpen(false) }}
              className={`px-3 py-2 rounded text-sm font-medium transition-colors ${
                type === value
                  ? 'ring-2 ring-blue-400 ' + TYPE_COLORS[type]
                  : TYPE_COLORS[type] + ' hover:brightness-125'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </Modal>
    </>
  )
}
