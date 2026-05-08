import { useState, useMemo, useRef, useEffect, useCallback, type KeyboardEvent } from 'react'
import { Search } from 'lucide-react'
import { getItems, getItem, getItemSpriteUrl } from '../../lib/pkmn'

interface ItemEditorProps {
  current: string
  onSelect: (item: string) => void
  onAdvance?: () => void
}

function fuzzyScore(query: string, target: string): number {
  const q = query.toLowerCase().trim()
  const t = target.toLowerCase()
  if (q === t) return 100
  if (t.startsWith(q)) return 85
  if (t.includes(q)) return 70
  const qWords = q.split(/\s+/)
  for (const w of qWords) { if (t.includes(w)) return 30 }
  return -1
}

export function ItemEditor({ current, onSelect, onAdvance }: ItemEditorProps) {
  const [query, setQuery] = useState('')
  const [focusedIndex, setFocusedIndex] = useState(-1)
  const inputRef = useRef<HTMLInputElement>(null)
  const itemRefs = useRef<Map<number, HTMLButtonElement>>(new Map())
  const allItems = useMemo(() => getItems(), [])

  const items = useMemo(() => {
    const mapped = allItems.map(i => ({ name: i, score: fuzzyScore(query, i) }))

    const sorted = !query.trim()
      ? mapped.sort((a, b) => a.name.localeCompare(b.name))
      : mapped.filter(i => i.score > 0).sort((a, b) => b.score - a.score)

    return [{ name: null, score: -1 } as const, ...sorted].slice(0, 201)
  }, [query, allItems])

  useEffect(() => {
    if (focusedIndex >= items.length) setFocusedIndex(items.length - 1)
  }, [items.length, focusedIndex])

  const focusItem = useCallback((idx: number) => {
    setFocusedIndex(idx)
    const btn = itemRefs.current.get(idx)
    btn?.focus()
    btn?.scrollIntoView({ block: 'nearest' })
  }, [])

  function handleSearchKeyDown(e: KeyboardEvent) {
    if (e.key === 'ArrowDown' && items.length > 0) {
      e.preventDefault()
      focusItem(0)
    }
  }

  function handleItemKeyDown(e: KeyboardEvent, idx: number, name: string) {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      if (idx < items.length - 1) focusItem(idx + 1)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      if (idx > 0) focusItem(idx - 1)
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
          onChange={e => setQuery(e.target.value)}
          onKeyDown={handleSearchKeyDown}
          placeholder={`Search items... (${allItems.length} available)`}
          className="w-full bg-gray-800 border border-gray-600 rounded-lg pl-8 pr-3 py-2 text-sm text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
          autoFocus
        />
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto space-y-1 p-1">
        {items.map((item, idx) => {
          const name = item.name
          const isSelected = name === null ? !current : name === current
          const data = name ? (getItem(name) as Record<string, unknown> | undefined) : undefined
          const desc = data ? ((data.desc as string) || (data.shortDesc as string) || '') : ''
          const spriteUrl = name ? getItemSpriteUrl(name) : null

          function handleClick() {
            onSelect(name ?? '')
            setQuery('')
            setFocusedIndex(-1)
            inputRef.current?.focus()
            onAdvance?.()
          }

          return (
            <button
              key={name ?? '__none__'}
              ref={el => { if (el) itemRefs.current.set(idx, el); else itemRefs.current.delete(idx) }}
              onClick={handleClick}
              onKeyDown={e => handleItemKeyDown(e, idx, name ?? '')}
              tabIndex={focusedIndex === idx ? 0 : -1}
              className={`w-full text-left rounded-xl p-3 transition-colors border-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-900 ${
                isSelected
                  ? 'border-blue-400 bg-blue-600/10'
                  : 'border-transparent bg-gray-800/30 hover:bg-gray-800/60 hover:border-gray-600/50'
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                {spriteUrl && (
                  <img
                    src={spriteUrl}
                    alt={name!}
                    className="w-5 h-5 object-contain shrink-0"
                    loading="lazy"
                    onError={e => { (e.target as HTMLImageElement).style.display = 'none' }}
                  />
                )}
                <span className={`text-sm font-semibold truncate ${name ? 'text-gray-100' : 'text-gray-400 italic'}`}>
                  {name ?? '(No Item)'}
                </span>
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
