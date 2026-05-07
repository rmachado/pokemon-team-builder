import { ChevronDown } from 'lucide-react'
import * as Select from '@radix-ui/react-select'
import type { VGCFormat } from '../types'

interface FormatSelectorProps {
  formats: VGCFormat[]
  current: VGCFormat
  onChange: (format: VGCFormat) => void
}

export function FormatSelector({ formats, current, onChange }: FormatSelectorProps) {
  return (
    <div className="flex items-center gap-2">
      <label className="text-xs text-gray-400 hidden sm:inline">Format:</label>
      <Select.Root
        value={current.id}
        onValueChange={val => {
          const f = formats.find(f => f.id === val)
          if (f) onChange(f)
        }}
      >
        <Select.Trigger className="inline-flex items-center justify-between gap-1 bg-gray-800 border border-gray-600 rounded-lg px-2.5 py-1.5 text-sm text-white focus:outline-none focus:border-blue-500 min-w-[140px]">
          <Select.Value />
          <Select.Icon>
            <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
          </Select.Icon>
        </Select.Trigger>
        <Select.Portal>
          <Select.Content className="z-50 bg-gray-800 border border-gray-600 rounded-lg shadow-xl overflow-hidden">
            <Select.ScrollUpButton className="flex items-center justify-center h-6 bg-gray-800 text-gray-400">
              ▲
            </Select.ScrollUpButton>
            <Select.Viewport className="p-1">
              {formats.map(f => (
                <Select.Item
                  key={f.id}
                  value={f.id}
                  className="relative flex items-center px-8 py-2 text-sm text-gray-200 rounded-md select-none data-[highlighted]:bg-blue-600/40 data-[highlighted]:text-white data-[state=checked]:text-blue-300 cursor-pointer outline-none"
                >
                  <Select.ItemText>{f.name}</Select.ItemText>
                  <Select.ItemIndicator className="absolute left-2 inline-flex items-center">
                    <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                    </svg>
                  </Select.ItemIndicator>
                </Select.Item>
              ))}
            </Select.Viewport>
            <Select.ScrollDownButton className="flex items-center justify-center h-6 bg-gray-800 text-gray-400">
              ▼
            </Select.ScrollDownButton>
          </Select.Content>
        </Select.Portal>
      </Select.Root>
    </div>
  )
}
