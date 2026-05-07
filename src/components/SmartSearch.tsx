import { useState, useMemo, useRef, useEffect, useCallback, type KeyboardEvent } from 'react'
import { createPortal } from 'react-dom'
import { searchPokemon } from '../lib/search'
import type { SearchMatch } from '../types'

interface SmartSearchProps {
  onSelect: (species: string) => void
  placeholder?: string
  exclude?: string[]
}

export function SmartSearch({ onSelect, placeholder = 'Search Pokémon...', exclude = [] }: SmartSearchProps) {
  const [query, setQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const inputRectRef = useRef<DOMRect | null>(null)

  const results = useMemo(() => {
    if (!query.trim()) return []
    const matches = searchPokemon(query)
    return matches.filter(m => !exclude.includes(m.species))
  }, [query, exclude])

  useEffect(() => {
    setSelectedIndex(0)
  }, [query])

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  useEffect(() => {
    if (results.length > 0 && inputRef.current) {
      inputRectRef.current = inputRef.current.getBoundingClientRect()
    }
  }, [results.length])

  const handleSelect = useCallback((match: SearchMatch) => {
    onSelect(match.species)
    setQuery('')
    inputRef.current?.focus()
  }, [onSelect])

  function handleKeyDown(e: KeyboardEvent) {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex(i => Math.min(i + 1, results.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex(i => Math.max(i - 1, 0))
    } else if (e.key === 'Enter' && results[selectedIndex]) {
      e.preventDefault()
      handleSelect(results[selectedIndex])
    } else if (e.key === 'Escape') {
      setQuery('')
      inputRef.current?.blur()
    }
  }

  const showResults = results.length > 0 && query.trim().length > 0

  return (
    <div className="relative">
      <input
        ref={inputRef}
        type="text"
        value={query}
        onChange={e => setQuery(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
      />
      {showResults && inputRectRef.current && createPortal(
        <ResultsDropdown
          results={results}
          selectedIndex={selectedIndex}
          inputRect={inputRectRef.current}
          onSelect={handleSelect}
          onHover={setSelectedIndex}
          onClose={() => { setQuery(''); inputRectRef.current = null }}
        />,
        document.body
      )}
    </div>
  )
}

interface ResultsDropdownProps {
  results: SearchMatch[]
  selectedIndex: number
  inputRect: DOMRect
  onSelect: (match: SearchMatch) => void
  onHover: (index: number) => void
  onClose: () => void
}

const ResultsDropdown = ({
  results, selectedIndex, inputRect,
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
      const el = dropdownRef.current.children[selectedIndex] as HTMLElement
      el?.scrollIntoView({ block: 'nearest' })
    }
  }, [selectedIndex])

  const style: React.CSSProperties = {
    position: 'fixed',
    top: `${inputRect.bottom + 4}px`,
    left: `${inputRect.left}px`,
    width: `${inputRect.width}px`,
    zIndex: 9999,
  }

  return (
    <div
      ref={dropdownRef}
      style={style}
      className="bg-gray-800 border border-gray-600 rounded-lg max-h-64 overflow-y-auto shadow-xl"
    >
      {results.map((match, i) => (
        <button
          key={match.species}
          onClick={() => onSelect(match)}
          onMouseEnter={() => onHover(i)}
          className={`w-full flex items-center gap-3 px-3 py-2 text-left text-sm transition-colors ${
            i === selectedIndex ? 'bg-blue-600/40 text-white' : 'text-gray-200 hover:bg-gray-700'
          }`}
        >
          <span className="font-medium truncate">{match.species}</span>
          <span className="flex gap-1 shrink-0">
            {match.types.map(t => (
              <span key={t} className="text-xs px-1.5 py-0.5 rounded bg-gray-700 text-gray-300">{t}</span>
            ))}
          </span>
          {match.reason !== 'Name match' && (
            <span className="text-xs text-gray-400 ml-auto shrink-0">{match.reason}</span>
          )}
        </button>
      ))}
    </div>
  )
}
