import { useState, useMemo, useRef, useCallback, type KeyboardEvent } from 'react'
import { Virtuoso, type VirtuosoHandle } from 'react-virtuoso'
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

interface MoveRowProps {
  move: { name: string; data: Move }
  index: number
  focusedIndex: number
  current: string
  onSelect: (name: string) => void
}

const MoveRow = ({ move: { name, data }, index, focusedIndex, current, onSelect }: MoveRowProps) => {
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
      onClick={() => onSelect(name)}
      className={`w-full text-left rounded-xl p-3 transition-colors border-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-900 ${
        isSelected
          ? 'border-blue-400 bg-blue-600/10'
          : index === focusedIndex
          ? 'border-blue-300/50 bg-gray-700/50'
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
}

export function MoveEditor({ current, learnableMoves, onSelect, onAdvance }: MoveEditorProps) {
  const [query, setQuery] = useState('')
  const [focusedIndex, setFocusedIndex] = useState(-1)
  const inputRef = useRef<HTMLInputElement>(null)
  const virtuosoRef = useRef<VirtuosoHandle>(null)

  const allMoves = useMemo(() => {
    return learnableMoves
      .map(m => ({ name: m, data: getMove(m) }))
      .filter((m): m is { name: string; data: Move } => !!m.data)
      .sort((a, b) => a.name.localeCompare(b.name))
  }, [learnableMoves])

  const moves = useMemo(() => {
    if (!query.trim()) return allMoves
    return allMoves
      .map(m => ({ ...m, score: SearchEngine.score(query, m.name) }))
      .filter(m => m.score > 0)
      .sort((a, b) => b.score - a.score)
  }, [allMoves, query])

  const handleSelect = useCallback((name: string) => {
    onSelect(name)
    setQuery('')
    setFocusedIndex(-1)
    inputRef.current?.focus()
    onAdvance?.()
  }, [onSelect, onAdvance])

  function handleSearchKeyDown(e: KeyboardEvent) {
    if (e.key === 'ArrowDown' && moves.length > 0) {
      e.preventDefault()
      const next = focusedIndex < moves.length - 1 ? focusedIndex + 1 : focusedIndex
      setFocusedIndex(next)
      virtuosoRef.current?.scrollToIndex({ index: next, align: 'center', behavior: 'auto' })
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      const next = focusedIndex > 0 ? focusedIndex - 1 : -1
      setFocusedIndex(next)
      if (next >= 0) {
        virtuosoRef.current?.scrollToIndex({ index: next, align: 'center', behavior: 'auto' })
      }
    } else if (e.key === 'Enter' && focusedIndex >= 0 && moves[focusedIndex]) {
      e.preventDefault()
      handleSelect(moves[focusedIndex].name)
    } else if (e.key === 'Escape') {
      setQuery('')
      setFocusedIndex(-1)
      inputRef.current?.blur()
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
          placeholder={`Filter moves... (${learnableMoves.length} available)`}
          className="w-full bg-gray-800 border border-gray-600 rounded-lg pl-8 pr-3 py-2 text-sm text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
          autoFocus
        />
      </div>

      <div className="flex-1 min-h-0">
        {moves.length === 0 && query.trim() ? (
          <div className="text-sm text-gray-500 text-center py-8">No moves match &quot;{query}&quot;</div>
        ) : (
          <Virtuoso
            ref={virtuosoRef}
            data={moves}
            itemContent={(index, move) => (
              <div className="px-1 py-0.5">
                <MoveRow
                  move={move}
                  index={index}
                  focusedIndex={focusedIndex}
                  current={current}
                  onSelect={handleSelect}
                />
              </div>
            )}
            className="h-full"
          />
        )}
      </div>
    </div>
  )
}
