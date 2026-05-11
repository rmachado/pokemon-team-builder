import { useState, useMemo, useRef, useCallback, type KeyboardEvent } from 'react'
import { getMove } from '@/lib/pkmn'
import { TYPE_COLORS } from '@/lib/theme'
import { Swords, Sparkles, Heart, Search } from 'lucide-react'
import { SearchEngine } from '@/domain'
import type { Move } from '@pkmn/data'

interface MoveEditorProps {
  current: string
  learnableMoves: string[]
  onSelect: (move: string) => void
  onAdvance?: () => void
}

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  Physical: <Swords className="w-3 h-3" />,
  Special: <Sparkles className="w-3 h-3" />,
  Status: <Heart className="w-3 h-3" />,
}

export function MoveEditor({ current, learnableMoves, onSelect, onAdvance }: MoveEditorProps) {
  const [query, setQuery] = useState('')
  const [focusedIndex, setFocusedIndex] = useState(-1)
  const inputRef = useRef<HTMLInputElement>(null)
  const itemRefs = useRef<Map<number, HTMLButtonElement>>(new Map())

  const moves = useMemo(() => {
    const all = learnableMoves
      .map(m => ({ name: m, data: getMove(m)  }))
      .filter((m): m is { name: string; data: Move } => !!m.data)
      .sort((a, b) => a.name.localeCompare(b.name))

    if (!query.trim()) return all

    return all
      .map(m => ({ ...m, score: SearchEngine.score(query, m.name) }))
      .filter(m => m.score > 0)
      .sort((a, b) => b.score - a.score)
  }, [learnableMoves, query])

  const safeFocusedIndex = focusedIndex >= moves.length ? moves.length - 1 : focusedIndex

  const focusItem = useCallback((idx: number) => {
    const safeIdx = idx >= moves.length ? moves.length - 1 : idx
    setFocusedIndex(safeIdx)
    const btn = itemRefs.current.get(safeIdx)
    btn?.focus()
    btn?.scrollIntoView({ block: 'nearest' })
  }, [moves.length])

  function handleSearchKeyDown(e: KeyboardEvent) {
    if (e.key === 'ArrowDown' && moves.length > 0) {
      e.preventDefault()
      focusItem(0)
    }
  }

  function handleItemKeyDown(e: KeyboardEvent, idx: number, name: string) {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      if (idx < moves.length - 1) {
        focusItem(idx + 1)
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      if (idx > 0) {
        focusItem(idx - 1)
      } else {
        setFocusedIndex(-1)
        inputRef.current?.focus()
      }
    } else if (e.key === 'Enter') {
      e.preventDefault()
      handleSelect(name)
    }
  }

  function handleSelect(name: string) {
    onSelect(name)
    setQuery('')
    setFocusedIndex(-1)
    inputRef.current?.focus()
    onAdvance?.()
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
          placeholder={`Filter moves... (${learnableMoves.length} available)`}
          className="w-full bg-gray-800 border border-gray-600 rounded-lg pl-8 pr-3 py-2 text-sm text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
          autoFocus
        />
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto space-y-1 p-1">
        {moves.length === 0 && query.trim() && (
          <div className="text-sm text-gray-500 text-center py-8">No moves match "{query}"</div>
        )}
        {moves.map(({ name, data }, idx) => {
          const mType = data.type as string
          const mCat = data.category as string
          const typeColor = mType ? TYPE_COLORS[mType] : undefined
          const isSelected = name === current
          const bp = typeof data.basePower === 'number' ? data.basePower : null
          const acc = typeof data.accuracy === 'number' ? data.accuracy : null
          const pp = data.pp as number | undefined
          const desc = (data.desc as string) || (data.shortDesc as string) || ''

          return (
            <button
              key={name}
              ref={el => { if (el) itemRefs.current.set(idx, el); else itemRefs.current.delete(idx) }}
              onClick={() => handleSelect(name)}
              onKeyDown={e => handleItemKeyDown(e, idx, name)}
              tabIndex={safeFocusedIndex === idx ? 0 : -1}
              className={`w-full text-left rounded-xl p-3 transition-colors border-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-900 ${
                isSelected
                  ? 'border-blue-400 bg-blue-600/10'
                  : 'border-transparent bg-gray-800/30 hover:bg-gray-800/60 hover:border-gray-600/50'
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-semibold text-gray-100 truncate">{name}</span>
                {mType && (
                  <span
                    className="text-[10px] px-2 py-0.5 rounded-full font-medium shrink-0"
                    style={{ backgroundColor: (typeColor ?? '#6b7280') + '25', color: typeColor }}
                  >
                    {mType}
                  </span>
                )}
                {mCat && (
                  <span className="text-gray-400 shrink-0 flex items-center gap-0.5 text-[10px]">
                    {CATEGORY_ICONS[mCat]}
                  </span>
                )}
              </div>

              <div className="flex gap-3 text-[11px] text-gray-400 mb-1.5">
                <span>Power <span className="text-gray-200 font-mono">{bp ?? '—'}</span></span>
                <span>Acc <span className="text-gray-200 font-mono">{acc != null ? `${acc}%` : '—'}</span></span>
                <span>PP <span className="text-gray-200 font-mono">{pp ?? '—'}</span></span>
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
