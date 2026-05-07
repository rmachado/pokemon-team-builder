import { useState } from 'react'
import { Modal } from '../ui/Modal'
import { NATURES } from '../../lib/pkmn'

interface NaturePickerProps {
  value: string
  onChange: (nature: string) => void
}

export function NaturePicker({ value, onChange }: NaturePickerProps) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className={`w-full text-left px-2.5 py-1.5 rounded text-sm border transition-colors ${
          value && value !== 'Serious'
            ? 'bg-gray-700/50 border-gray-600 text-gray-100'
            : 'bg-gray-800/50 border-gray-700 text-gray-400 hover:border-gray-500'
        }`}
      >
        {value || 'Nature'}
      </button>

      <Modal open={open} onClose={() => setOpen(false)} title="Select Nature">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-1">
          {NATURES.map(nature => (
            <button
              key={nature}
              onClick={() => { onChange(nature); setOpen(false) }}
              className={`px-3 py-1.5 rounded text-sm transition-colors ${
                nature === value
                  ? 'bg-blue-600/40 text-blue-200'
                  : 'text-gray-200 hover:bg-gray-700'
              }`}
            >
              {nature}
            </button>
          ))}
        </div>
      </Modal>
    </>
  )
}
