import { useState, useMemo } from 'react'
import { getAbilities, getAbility } from '../../lib/pkmn'

interface AbilityPanelProps {
  current: string
  onSelect: (ability: string) => void
  speciesAbilities?: string[]
}

export function AbilityPanel({ current, onSelect, speciesAbilities }: AbilityPanelProps) {
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState(current)
  const allAbilities = useMemo(() => getAbilities(), [])

  const filtered = useMemo(() => {
    const source = query ? allAbilities : (speciesAbilities?.length ? speciesAbilities : allAbilities)
    if (!query) return source.slice(0, 60)
    return source.filter(a => a.toLowerCase().includes(query.toLowerCase())).slice(0, 60)
  }, [query, allAbilities, speciesAbilities])

  const abilDetail = selected ? getAbility(selected) : null
  const abilDetailAny = abilDetail as Record<string, unknown> | undefined

  return (
    <div className="flex flex-col h-full gap-2">
      <input
        type="text"
        value={query}
        onChange={e => setQuery(e.target.value)}
        placeholder="Search abilities..."
        className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-1.5 text-sm text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
        autoFocus
      />
      <div className="flex gap-3 flex-1 min-h-0">
        <div className="flex-1 overflow-y-auto space-y-0.5 max-h-40">
          {filtered.map(ability => (
            <button
              key={ability}
              onClick={() => { setSelected(ability); onSelect(ability) }}
              className={`w-full text-left px-2 py-1 rounded text-xs transition-colors ${
                ability === current
                  ? 'bg-blue-600/40 text-blue-200'
                  : selected === ability
                  ? 'bg-gray-700 text-gray-100'
                  : 'text-gray-300 hover:bg-gray-700'
              }`}
            >
              {ability}
            </button>
          ))}
        </div>
        <div className="w-48 shrink-0 bg-gray-800/50 rounded-lg p-2.5 space-y-1.5">
          {abilDetailAny ? (
            <>
              <div className="text-sm font-medium text-gray-100">{abilDetailAny.name as string}</div>
              <div className="text-xs text-gray-400 mt-1 leading-tight">
                {(abilDetailAny.desc as string) || (abilDetailAny.shortDesc as string) || 'No description available.'}
              </div>
            </>
          ) : (
            <div className="text-xs text-gray-500">Select an ability</div>
          )}
        </div>
      </div>
    </div>
  )
}
