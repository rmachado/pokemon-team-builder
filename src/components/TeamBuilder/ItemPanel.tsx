import { useState, useMemo } from 'react'
import { getItems, getItem } from '../../lib/pkmn'

interface ItemPanelProps {
  current: string
  onSelect: (item: string) => void
}

export function ItemPanel({ current, onSelect }: ItemPanelProps) {
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState(current)
  const allItems = useMemo(() => getItems(), [])

  const filtered = useMemo(() => {
    if (!query) return allItems.slice(0, 80)
    return allItems.filter(i => i.toLowerCase().includes(query.toLowerCase())).slice(0, 80)
  }, [query, allItems])

  const itemDetail = selected ? getItem(selected) : null
  const itemDetailAny = itemDetail as Record<string, unknown> | undefined

  return (
    <div className="flex flex-col h-full gap-2">
      <input
        type="text"
        value={query}
        onChange={e => setQuery(e.target.value)}
        placeholder="Search items..."
        className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-1.5 text-sm text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
        autoFocus
      />
      <div className="flex gap-3 flex-1 min-h-0">
        <div className="flex-1 overflow-y-auto space-y-0.5 max-h-40">
          <button
            onClick={() => { setSelected(''); onSelect('') }}
            className={`w-full text-left px-2 py-1 rounded text-xs transition-colors ${
              !current ? 'bg-blue-600/40 text-blue-200' : 'text-gray-400 hover:bg-gray-700'
            }`}
          >
            (No Item)
          </button>
          {filtered.map(item => (
            <button
              key={item}
              onClick={() => { setSelected(item); onSelect(item) }}
              className={`w-full text-left px-2 py-1 rounded text-xs transition-colors ${
                item === current
                  ? 'bg-blue-600/40 text-blue-200'
                  : selected === item
                  ? 'bg-gray-700 text-gray-100'
                  : 'text-gray-300 hover:bg-gray-700'
              }`}
            >
              {item}
            </button>
          ))}
        </div>
        <div className="w-48 shrink-0 bg-gray-800/50 rounded-lg p-2.5 space-y-1.5">
          {itemDetailAny ? (
            <>
              <div className="text-sm font-medium text-gray-100">{itemDetailAny.name as string}</div>
              <div className="text-xs text-gray-400 mt-1 leading-tight">
                {(itemDetailAny.desc as string) || (itemDetailAny.shortDesc as string) || 'No description available.'}
              </div>
            </>
          ) : selected === '' ? (
            <div className="text-xs text-gray-500">No item selected</div>
          ) : (
            <div className="text-xs text-gray-500">Select an item</div>
          )}
        </div>
      </div>
    </div>
  )
}
