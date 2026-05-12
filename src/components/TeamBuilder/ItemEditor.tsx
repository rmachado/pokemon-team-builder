import { useState, useMemo, useRef, useCallback, type KeyboardEvent } from 'react'
import { Virtuoso, type VirtuosoHandle } from 'react-virtuoso'
import { Search } from 'lucide-react'
import { getItems, getItem, getItemSpriteUrl } from '@/lib/pkmn'
import { SearchEngine } from '@/domain'
import { useFormatStore } from '@/stores'

interface ItemEditorProps {
  current: string
  onSelect: (item: string) => void
  onAdvance?: () => void
}

interface ItemRowProps {
  item: { name: string | null; score: number }
  index: number
  focusedIndex: number
  current: string
  onSelect: (name: string) => void
}

const ItemRow = ({ item, index, focusedIndex, current, onSelect }: ItemRowProps) => {
  const name = item.name
  const isSelected = name === null ? !current : name === current
  const data = name ? getItem(name) : undefined
  const desc = data ? ((data.desc as string) || (data.shortDesc as string) || '') : ''
  const spriteUrl = name ? getItemSpriteUrl(name) : null

  return (
    <button
      onClick={() => onSelect(name ?? '')}
      className={`w-full text-left rounded-xl p-3 transition-colors border-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-900 ${
        isSelected
          ? 'border-blue-400 bg-blue-600/10'
          : index === focusedIndex
          ? 'border-blue-300/50 bg-gray-700/50'
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
}

export function ItemEditor({ current, onSelect, onAdvance }: ItemEditorProps) {
  const [query, setQuery] = useState('')
  const [focusedIndex, setFocusedIndex] = useState(-1)
  const inputRef = useRef<HTMLInputElement>(null)
  const virtuosoRef = useRef<VirtuosoHandle>(null)
  const { currentFormat } = useFormatStore()
  const allItems = useMemo(() => getItems(9, currentFormat.id), [currentFormat.id])

  const items = useMemo(() => {
    const mapped = allItems.map(i => ({ name: i, score: SearchEngine.score(query, i) }))
    const sorted = !query.trim()
      ? mapped.sort((a, b) => a.name.localeCompare(b.name))
      : mapped.filter(i => i.score > 0).sort((a, b) => b.score - a.score)
    return [{ name: null, score: -1 } as const, ...sorted].slice(0, 201)
  }, [query, allItems])

  const handleSelect = useCallback((name: string) => {
    onSelect(name)
    setQuery('')
    setFocusedIndex(-1)
    inputRef.current?.focus()
    onAdvance?.()
  }, [onSelect, onAdvance])

  function handleSearchKeyDown(e: KeyboardEvent) {
    if (e.key === 'ArrowDown' && items.length > 0) {
      e.preventDefault()
      const next = focusedIndex < items.length - 1 ? focusedIndex + 1 : focusedIndex
      setFocusedIndex(next)
      virtuosoRef.current?.scrollToIndex({ index: next, align: 'center', behavior: 'auto' })
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      const next = focusedIndex > 0 ? focusedIndex - 1 : -1
      setFocusedIndex(next)
      if (next >= 0) {
        virtuosoRef.current?.scrollToIndex({ index: next, align: 'center', behavior: 'auto' })
      }
    } else if (e.key === 'Enter' && focusedIndex >= 0 && items[focusedIndex]) {
      e.preventDefault()
      handleSelect(items[focusedIndex].name ?? '')
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
          placeholder={`Search items... (${allItems.length} available)`}
          className="w-full bg-gray-800 border border-gray-600 rounded-lg pl-8 pr-3 py-2 text-sm text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
          autoFocus
        />
      </div>

      <div className="flex-1 min-h-0">
        {items.length === 0 ? (
          <div className="text-sm text-gray-500 text-center py-8">No items found</div>
        ) : (
          <Virtuoso
            ref={virtuosoRef}
            data={items}
            itemContent={(index, item) => (
              <div className="px-1 py-0.5">
                <ItemRow
                  item={item}
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
