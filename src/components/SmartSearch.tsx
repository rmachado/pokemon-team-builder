import { useState, useMemo, useRef, useEffect, useCallback, useLayoutEffect, type KeyboardEvent } from 'react'
import { createPortal } from 'react-dom'
import { Search, Hash, Swords, Shield } from 'lucide-react'
import { searchPokemon } from '@/lib/search'
import { TYPE_COLORS } from '@/lib/theme'
import type { SearchMatch } from '@/types'

interface SmartSearchProps {
  onSelect: (species: string) => void
  placeholder?: string
  exclude?: string[]
}

const KIND_CONFIG: Record<string, { label: string; icon: React.ReactNode }> = {
  name: { label: 'Species', icon: <Search className="w-3 h-3" /> },
  type: { label: 'Type', icon: <Hash className="w-3 h-3" /> },
  move: { label: 'Move', icon: <Swords className="w-3 h-3" /> },
  ability: { label: 'Ability', icon: <Shield className="w-3 h-3" /> },
}

const KIND_ORDER = ['name', 'type', 'move', 'ability']

export function SmartSearch({ onSelect, placeholder = 'Search Pokémon...', exclude = [] }: SmartSearchProps) {
  const [query, setQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [inputRect, setInputRect] = useState<DOMRect | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const results = useMemo(() => {
    if (!query.trim()) return []
    const matches = searchPokemon(query)
    return matches.filter(m => !exclude.includes(m.species))
  }, [query, exclude])

  const grouped = useMemo(() => {
    const groups: Record<string, SearchMatch[]> = { name: [], type: [], move: [], ability: [] }
    for (const r of results) {
      groups[r.kind].push(r)
    }
    return KIND_ORDER.filter(k => groups[k].length > 0).map(kind => ({ kind, matches: groups[kind] }))
  }, [results])

  const flatResults = useMemo(() => grouped.flatMap(g => g.matches), [grouped])

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  useLayoutEffect(() => {
    function updateRect() {
      if (inputRef.current) {
        setInputRect(inputRef.current.getBoundingClientRect())
      }
    }
    updateRect()
    window.addEventListener('scroll', updateRect, true)
    window.addEventListener('resize', updateRect)
    return () => {
      window.removeEventListener('scroll', updateRect, true)
      window.removeEventListener('resize', updateRect)
    }
  }, [])

  const handleSelect = useCallback((match: SearchMatch) => {
    onSelect(match.species)
    setQuery('')
    setSelectedIndex(0)
    inputRef.current?.focus()
  }, [onSelect])

  function handleChange(value: string) {
    setQuery(value)
    setSelectedIndex(0)
  }

  function handleKeyDown(e: KeyboardEvent) {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex(i => Math.min(i + 1, flatResults.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex(i => Math.max(i - 1, 0))
    } else if (e.key === 'Enter' && flatResults[selectedIndex]) {
      e.preventDefault()
      handleSelect(flatResults[selectedIndex])
    } else if (e.key === 'Escape') {
      setQuery('')
      setSelectedIndex(0)
      inputRef.current?.blur()
    }
  }

  const showResults = flatResults.length > 0 && query.trim().length > 0

  return (
    <div className="relative">
      <input
        ref={inputRef}
        type="text"
        value={query}
        onChange={e => handleChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
      />
      {showResults && inputRect && createPortal(
        <ResultsDropdown
          grouped={grouped}
          flatResults={flatResults}
          selectedIndex={selectedIndex}
          inputRect={inputRect}
          onSelect={handleSelect}
          onHover={setSelectedIndex}
          onClose={() => { setQuery(''); setSelectedIndex(0) }}
        />,
        document.body
      )}
    </div>
  )
}

interface ResultsDropdownProps {
  grouped: { kind: string; matches: SearchMatch[] }[]
  flatResults: SearchMatch[]
  selectedIndex: number
  inputRect: DOMRect
  onSelect: (match: SearchMatch) => void
  onHover: (index: number) => void
  onClose: () => void
}

const ResultsDropdown = ({
  grouped, selectedIndex, inputRect,
  onSelect, onHover, onClose,
}: ResultsDropdownProps) => {
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        onClose()
      }
    }
    document.addEventListener('mousedown', handleClick, true)
    return () => document.removeEventListener('mousedown', handleClick, true)
  }, [onClose])

  useEffect(() => {
    if (dropdownRef.current) {
      const el = dropdownRef.current.querySelectorAll('[data-result]')[selectedIndex] as HTMLElement
      el?.scrollIntoView({ block: 'nearest' })
    }
  }, [selectedIndex])

  const style: React.CSSProperties = {
    position: 'fixed',
    top: `${inputRect.bottom + 4}px`,
    left: `${inputRect.left}px`,
    width: `${Math.max(inputRect.width, 320)}px`,
    zIndex: 9999,
  }

  let globalIndex = -1

  return (
    <div
      ref={dropdownRef}
      style={style}
      className="bg-gray-800 border border-gray-600 rounded-lg max-h-72 overflow-y-auto shadow-xl"
    >
      {grouped.map(({ kind, matches }) => {
        const config = KIND_CONFIG[kind]
        return (
          <div key={kind}>
            <div className="flex items-center gap-1.5 px-3 py-1 text-[10px] font-medium text-gray-500 border-b border-gray-700/30 bg-gray-800/50 sticky top-0">
              {config?.icon}
              {config?.label}
              <span className="text-gray-600 ml-1">({matches.length})</span>
            </div>
            {matches.map(match => {
              globalIndex++
              const i = globalIndex

              return (
                <button
                  key={`${match.species}-${match.kind}-${match.matchDetail}`}
                  data-result
                  onClick={() => onSelect(match)}
                  onMouseEnter={() => onHover(i)}
                  className={`w-full flex items-center gap-2 px-3 py-1.5 text-left text-xs transition-colors ${
                    i === selectedIndex ? 'bg-blue-600/30 text-white' : 'text-gray-200 hover:bg-gray-700/50'
                  }`}
                >
                  <span className="font-medium truncate">{match.species}</span>
                  <span className="flex gap-1 shrink-0">
                    {match.types.map(t => {
                      const tc = TYPE_COLORS[t] ?? '#6b7280'
                      return (
                        <span
                          key={t}
                          className="text-[9px] px-1.5 py-0.5 rounded-full font-medium"
                          style={{ backgroundColor: tc + '25', color: tc }}
                        >
                          {t}
                        </span>
                      )
                    })}
                  </span>
                  <span className="text-[9px] text-gray-500 ml-auto shrink-0">
                    {match.kind === 'type' && match.matchDetail}
                    {match.kind === 'move' && match.matchDetail}
                    {match.kind === 'ability' && match.matchDetail}
                    {match.kind === 'name' && ''}
                  </span>
                </button>
              )
            })}
          </div>
        )
      })}
    </div>
  )
}
