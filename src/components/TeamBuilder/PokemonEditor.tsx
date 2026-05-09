import { useState, useMemo, useRef, useEffect, type KeyboardEvent } from 'react'
import { Virtuoso } from 'react-virtuoso'
import { Search, X, Loader2 } from 'lucide-react'
import { Dex, toID } from '@pkmn/dex'
import { getAllPokemon, getPokemonNum, getMoves } from '../../lib/pkmn'
import { TYPE_COLORS } from '../../lib/theme'

interface PokemonEditorProps {
  onSelect: (species: string) => void
  onAdvance?: () => void
  exclude?: string[]
}

type FilterChip = { kind: 'type' | 'ability' | 'move'; value: string }

function fuzzyScore(query: string, target: string): number {
  const q = query.toLowerCase().trim()
  const t = target.toLowerCase()
  if (q === t) return 100
  if (t.startsWith(q)) return 85
  if (t.includes(q)) return 70
  for (const w of q.split(/\s+/)) { if (t.includes(w)) return 30 }
  return -1
}

export function PokemonEditor({ onSelect, onAdvance, exclude = [] }: PokemonEditorProps) {
  const [query, setQuery] = useState('')
  const [chips, setChips] = useState<FilterChip[]>([])
  const [focusedIdx, setFocusedIdx] = useState(-1)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [loadingCache, setLoadingCache] = useState(false)
  const [cacheVersion, setCacheVersion] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const searchAreaRef = useRef<HTMLDivElement>(null)
  const allMons = useMemo(() => getAllPokemon(9), [])
  const allMoves = useMemo(() => getMoves(9), [])

  const learnsetCache = useRef<Map<string, Set<string>>>(new Map())

  // Pre-filtered list without move filters (to limit learnset loading scope)
  const prefilt = useMemo(() => {
    let mons = allMons.filter(m => !exclude.includes(m.name))
    for (const chip of chips) {
      if (chip.kind === 'move') continue
      if (chip.kind === 'type') mons = mons.filter(m => m.types.some(t => t.toLowerCase() === chip.value.toLowerCase()))
      if (chip.kind === 'ability') mons = mons.filter(m => m.abilities.some(a => a.toLowerCase() === chip.value.toLowerCase()))
    }
    return mons
  }, [allMons, chips, exclude])

  // Load learnsets only for pre-filtered species (much fewer than 876)
  useEffect(() => {
    const moveChips = chips.filter(c => c.kind === 'move')
    if (moveChips.length === 0) return

    let canceled = false
    setLoadingCache(true)

    async function load() {
      for (const m of prefilt) {
        if (canceled) break
        if (learnsetCache.current.has(m.name)) continue
        try {
          const data = await Dex.learnsets.get(toID(m.name))
          if (data?.learnset && !canceled) {
            learnsetCache.current.set(m.name, new Set(Object.keys(data.learnset)))
          }
        } catch {
          if (!canceled) learnsetCache.current.set(m.name, new Set())
        }
      }
      if (!canceled) { setLoadingCache(false); setCacheVersion(v => v + 1) }
    }
    load()
    return () => { canceled = true }
  }, [chips, prefilt])

  // Suggestions
  const suggestions = useMemo(() => {
    const q = query.toLowerCase().trim()
    if (q.length < 2) return { types: [] as string[], abilities: [] as string[], moves: [] as string[] }

    const types: string[] = []
    const abilities: string[] = []
    const moves: string[] = []

    const typesSeen = new Set(chips.filter(c => c.kind === 'type').map(c => c.value.toLowerCase()))
    const abilsSeen = new Set(chips.filter(c => c.kind === 'ability').map(c => c.value.toLowerCase()))
    const movesSeen = new Set(chips.filter(c => c.kind === 'move').map(c => c.value.toLowerCase()))

    for (const mon of allMons) {
      for (const t of mon.types) {
        const tl = t.toLowerCase()
        if (!typesSeen.has(tl) && q.length <= tl.length && tl.startsWith(q) && !types.includes(t)) types.push(t)
      }
      for (const a of mon.abilities) {
        if (a && !abilsSeen.has(a.toLowerCase()) && fuzzyScore(query, a) > 50 && !abilities.includes(a)) abilities.push(a)
      }
    }

    for (const m of allMoves) {
      if (!movesSeen.has(m.name.toLowerCase()) && fuzzyScore(query, m.name) > 50) {
        moves.push(m.name)
        if (moves.length >= 10) break
      }
    }

    return { types: types.slice(0, 10), abilities: abilities.slice(0, 10), moves }
  }, [query, chips, allMons, allMoves])

  // Filtered list (all filters including moves)
  const filtered = useMemo(() => {
    let mons = prefilt
    for (const chip of chips) {
      if (chip.kind !== 'move') continue
      const moveId = toID(chip.value)
      mons = mons.filter(m => learnsetCache.current.get(m.name)?.has(moveId))
    }
    if (!query.trim()) return mons.sort((a, b) => a.name.localeCompare(b.name))
    return mons
      .map(m => ({ mon: m, score: fuzzyScore(query, m.name) }))
      .filter(m => m.score > 0)
      .sort((a, b) => b.score - a.score)
      .map(s => s.mon)
  }, [prefilt, chips, query, cacheVersion])

  useEffect(() => { setFocusedIdx(-1); setShowSuggestions(true) }, [query, chips])

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (searchAreaRef.current && !searchAreaRef.current.contains(e.target as Node)) {
        setShowSuggestions(false)
        setFocusedIdx(-1)
      }
    }
    document.addEventListener('mousedown', handler, true)
    return () => document.removeEventListener('mousedown', handler, true)
  }, [])

  const suggestionItems = useMemo(() => {
    const items: { kind: string; value: string }[] = []
    for (const t of suggestions.types) items.push({ kind: 'type', value: t })
    for (const a of suggestions.abilities) items.push({ kind: 'ability', value: a })
    for (const m of suggestions.moves) items.push({ kind: 'move', value: m })
    return items.slice(0, 15)
  }, [suggestions])

  function addChip(chip: FilterChip) {
    if (!chips.some(c => c.kind === chip.kind && c.value === chip.value)) {
      setChips(prev => [...prev, chip])
    }
    setQuery('')
    inputRef.current?.focus()
  }

  function removeChip(chip: FilterChip) {
    setChips(prev => prev.filter(c => !(c.kind === chip.kind && c.value === chip.value)))
  }

  function handleSelect(name: string) {
    onSelect(name)
    onAdvance?.()
  }

  function handleSearchKeyDown(e: KeyboardEvent) {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      if (suggestionItems.length > 0) setFocusedIdx(i => Math.min(i + 1, suggestionItems.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      if (focusedIdx > 0) setFocusedIdx(i => i - 1)
      else setFocusedIdx(-1)
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (focusedIdx >= 0 && focusedIdx < suggestionItems.length) addChip(suggestionItems[focusedIdx] as FilterChip)
    } else if (e.key === 'Escape') {
      setShowSuggestions(false)
      setFocusedIdx(-1)
      inputRef.current?.blur()
    }
  }

  const PokemonRow = ({ mon }: { mon: (typeof allMons)[number] }) => {
          const num = getPokemonNum(mon.name)
          const types = mon.types || []

          return (
      <button
        onClick={() => handleSelect(mon.name)}
        onKeyDown={e => { if (e.key === 'Enter') handleSelect(mon.name) }}
        className="w-full text-left rounded-xl p-2.5 transition-colors border-2 border-transparent bg-gray-800/30 hover:bg-gray-800/60 hover:border-gray-600/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50"
      >
        <div className="flex items-center gap-3">
          <img
            src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${num}.png`}
            alt={mon.name}
            className="w-10 h-10 object-contain shrink-0"
            loading="lazy"
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-gray-100">{mon.name}</span>
              <span className="text-xs text-gray-500">#{num.toString().padStart(3, '0')}</span>
            </div>
            <div className="flex flex-col items-start gap-0.5 mt-0.5">
              <div className="flex flex-wrap gap-1">            
                {types.map(t => (
                  <span key={t} className="text-[10px] px-1.5 py-0.5 rounded-full font-medium"
                    style={{ backgroundColor: (TYPE_COLORS[t] ?? '#6b7280') + '25', color: TYPE_COLORS[t] ?? '#9ca3af' }}>
                    {t}
                  </span>
                ))}
              </div>
              <span className="text-xs text-gray-500">{mon.abilities?.filter(Boolean).join(' / ') || ''}</span>
            </div>
          </div>
          <div className="text-xs text-gray-500 font-mono shrink-0 text-right">
            <div className="grid grid-cols-2 gap-x-2">
              <div>HP {mon.baseStats?.hp ?? 0}</div>
              <div>Atk {mon.baseStats?.atk ?? 0}</div>
              <div>Def {mon.baseStats?.def ?? 0}</div>
              <div>SpA {mon.baseStats?.spa ?? 0}</div>
              <div>SpD {mon.baseStats?.spd ?? 0}</div>
              <div>Spe {mon.baseStats?.spe ?? 0}</div>
            </div>
          </div>
        </div>
      </button>
    )
  }

  return (
    <div className="flex flex-col h-full gap-2">
      <div ref={searchAreaRef} className="relative shrink-0">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={handleSearchKeyDown}
          placeholder={`Search ${allMons.length} Pokémon...`}
          className="w-full bg-gray-800 border border-gray-600 rounded-lg pl-8 pr-3 py-2 text-sm text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
          autoFocus
        />
        {showSuggestions && suggestionItems.length > 0 && query.length >= 2 && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-gray-800 border border-gray-600 rounded-lg shadow-xl z-10 overflow-hidden">
            {suggestionItems.map((item, i) => {
              const color = item.kind === 'type' ? TYPE_COLORS[item.value] ?? '#6b7280' : undefined
              return (
                <button key={`${item.kind}-${item.value}`} onClick={() => addChip(item as FilterChip)}
                  onMouseEnter={() => setFocusedIdx(i)}
                  className={`w-full text-left px-3 py-1.5 text-xs flex items-center gap-2 transition-colors ${i === focusedIdx ? 'bg-blue-600/40 text-white' : 'text-gray-200 hover:bg-gray-700'}`}>
                  <span className="text-gray-500 w-12 shrink-0 capitalize">{item.kind}</span>
                  <span className="px-1.5 py-0.5 rounded font-medium"
                    style={color ? { backgroundColor: color + '25', color: color } : undefined}>{item.value}</span>
                </button>
              )
            })}
          </div>
        )}
      </div>

      {chips.length > 0 && (
        <div className="flex flex-wrap gap-1 shrink-0">
          {chips.map(chip => (
            <span key={`${chip.kind}-${chip.value}`} className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-gray-700 text-gray-200">
              <span className="text-gray-500 capitalize">{chip.kind}:</span>{chip.value}
              <button onClick={() => removeChip(chip)} className="hover:text-white"><X className="w-3 h-3" /></button>
            </span>
          ))}
          <button onClick={() => setChips([])} className="text-xs text-gray-500 hover:text-gray-300 px-1">clear all</button>
        </div>
      )}

      {loadingCache && (
        <div className="flex items-center gap-2 text-xs text-gray-500 shrink-0">
          <Loader2 className="w-3 h-3 animate-spin" /> Loading move data...
        </div>
      )}

      <div className="flex-1 min-h-0">
        {filtered.length === 0 && !loadingCache ? (
          <div className="text-sm text-gray-500 text-center py-8">No Pokémon match your filters</div>
        ) : (
          <Virtuoso
            data={filtered}
            itemContent={(_, mon) => <PokemonRow mon={mon} />}
            className="h-full"
            increaseViewportBy={{ top: 400, bottom: 400 }}
          />
        )}
      </div>
    </div>
  )
}
