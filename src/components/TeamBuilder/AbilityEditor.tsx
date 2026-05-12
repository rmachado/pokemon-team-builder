import { useState, useMemo, useRef, type KeyboardEvent } from 'react'
import { Search, Shield } from 'lucide-react'
import { getAbility } from '@/lib/pkmn'
import { SearchEngine } from '@/domain'

interface AbilityEditorProps {
  current: string
  onSelect: (ability: string) => void
  onAdvance?: () => void
  speciesAbilities?: string[]
}

export function AbilityEditor({ current, onSelect, onAdvance, speciesAbilities }: AbilityEditorProps) {
  const [query, setQuery] = useState('')
  const [focusedIndex, setFocusedIndex] = useState(-1)
  const inputRef = useRef<HTMLInputElement>(null)
  const abilities = useMemo(() => speciesAbilities ?? [], [speciesAbilities])

  const filtered = useMemo(() => {
    const mapped = abilities.map(a => ({ name: a, score: SearchEngine.score(query, a) }))

    if (!query.trim()) return mapped.sort((a, b) => a.name.localeCompare(b.name))

    return mapped
      .filter(a => a.score > 0)
      .sort((a, b) => b.score - a.score)
  }, [query, abilities])

  function handleSearchKeyDown(e: KeyboardEvent) {
    if (e.key === 'ArrowDown' && filtered.length > 0) {
      e.preventDefault()
      setFocusedIndex(0)
    }
  }

  function handleItemKeyDown(e: KeyboardEvent, idx: number, name: string) {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      if (idx < filtered.length - 1) setFocusedIndex(idx + 1)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      if (idx > 0) setFocusedIndex(idx - 1)
      else { setFocusedIndex(-1); inputRef.current?.focus() }
    } else if (e.key === 'Enter') {
      e.preventDefault()
      onSelect(name)
      setQuery('')
      setFocusedIndex(-1)
      inputRef.current?.focus()
      onAdvance?.()
    }
  }

  return (
    <div className="flex flex-col h-full gap-3">
      <div className="relative shrink-0">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={e => { setQuery(e.target.value); setFocusedIndex(-1) }}
          onKeyDown={handleSearchKeyDown}
          placeholder={`Filter abilities... (${abilities.length} available)`}
          className="w-full bg-gray-800 border border-gray-600 rounded-lg pl-8 pr-3 py-2 text-sm text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
          autoFocus
        />
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto space-y-1 p-1">
        {filtered.map(({ name }, idx) => {
          const isSelected = name === current
          const data = getAbility(name)
          const desc = (data?.desc as string) || (data?.shortDesc as string) || ''

          return (
            <button
              key={name}
              onClick={() => { onSelect(name); setQuery(''); setFocusedIndex(-1); inputRef.current?.focus(); onAdvance?.() }}
              onKeyDown={e => handleItemKeyDown(e, idx, name)}
              className={`w-full text-left rounded-xl p-3 transition-colors border-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-900 ${
                isSelected
                  ? 'border-blue-400 bg-blue-600/10'
                  : idx === focusedIndex
                  ? 'border-blue-300/50 bg-gray-700/50'
                  : 'border-transparent bg-gray-800/30 hover:bg-gray-800/60 hover:border-gray-600/50'
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <Shield className="w-4 h-4 text-gray-500 shrink-0" />
                <span className="text-sm font-semibold text-gray-100 truncate">{name}</span>
              </div>
              {desc && (
                <div className="text-[11px] text-gray-500 leading-relaxed">{desc}</div>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
