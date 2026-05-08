import { useMemo } from 'react'
import { motion } from 'framer-motion'
import type { PokemonSet } from '../../types'
import { getPokemonNum, getPokemon, getMove, getItemSpriteUrl, calcStat, getNatureMultiplier } from '../../lib/pkmn'
import { TYPE_COLORS, STAT_COLORS, STAT_LABEL } from '../../lib/theme'
import { Sparkles } from 'lucide-react'

interface PokemonCardProps {
  pokemon: PokemonSet
  isActive: boolean
  onClick: () => void
  onEdit: (field: string, moveIndex?: number) => void
}

const STATS = ['hp', 'atk', 'def', 'spa', 'spd', 'spe'] as const

export function PokemonCard({ pokemon, isActive, onClick, onEdit }: PokemonCardProps) {
  const hasMon = !!pokemon.species
  const num = hasMon ? getPokemonNum(pokemon.species) : 0

  const dexSpecies = useMemo(() => pokemon.species ? getPokemon(pokemon.species) : null, [pokemon.species])
  const dexAny = dexSpecies as unknown as Record<string, unknown> | null
  const baseStats = (dexAny?.baseStats ?? {}) as Record<string, number>
  const types = (dexAny?.types ?? []) as string[]
  const primaryColor = types[0] ? TYPE_COLORS[types[0]] ?? '#6b7280' : '#6b7280'

  function statValue(s: string): number {
    return calcStat(baseStats[s] ?? 80, pokemon.ivs[s], pokemon.evs[s], pokemon.level || 50, getNatureMultiplier(pokemon.nature, s))
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      onClick={onClick}
      className={`relative rounded-xl border transition-all duration-200 cursor-pointer select-none ${
        isActive
          ? 'border-blue-400/60 bg-gray-800/80 shadow-lg shadow-blue-500/5'
          : hasMon
          ? 'border-gray-700/60 bg-gray-800/40 hover:border-gray-500/60 hover:bg-gray-800/60'
          : 'border-dashed border-gray-700/30 bg-gray-800/10 hover:border-gray-600/40'
      }`}
      style={isActive && hasMon ? { boxShadow: `0 0 20px -5px ${primaryColor}40` } : undefined}
    >
      {isActive && (
        <div
          className="absolute left-0 top-3 bottom-3 w-0.5 rounded-r-full"
          style={{ backgroundColor: primaryColor }}
        />
      )}

      <div className="flex gap-3 p-3">
        {/* Sprite */}
        <button
          onClick={e => { e.stopPropagation(); onEdit('pokemon') }}
          className="shrink-0 self-start"
        >
          <div
            className="rounded-full p-0.5 w-fit"
            style={{ background: hasMon ? `conic-gradient(from 0deg, ${primaryColor}, transparent 60%, ${primaryColor})` : 'transparent' }}
          >
            <div className="rounded-full bg-gray-900 p-0.5">
              {num ? (
                <img
                  src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${num}.png`}
                  alt={pokemon.species}
                  className="w-14 h-14 object-contain rounded-full"
                  loading="lazy"
                />
              ) : (
                <div className="w-14 h-14 flex items-center justify-center text-gray-500 rounded-full bg-gray-800/50">
                  <Sparkles className="w-5 h-5" />
                </div>
              )}
            </div>
          </div>
        </button>

        {/* Info */}
        <div className="flex flex-col gap-1 min-w-0 w-28 shrink-0">
          {/* Name + Level */}
          <button onClick={e => { e.stopPropagation(); onEdit('pokemon') }} className="text-left">
            <span className="text-sm font-semibold text-gray-100 truncate block">
              {hasMon ? pokemon.species : 'Empty slot'}
            </span>
            {hasMon && (
              <span className="text-xs text-gray-500">Lv.{pokemon.level || 50}</span>
            )}
          </button>

          {/* Types */}
          {hasMon && types.length > 0 && (
            <div className="flex gap-1 flex-wrap">
              {types.map(t => (
                <span
                  key={t}
                  className="text-[10px] px-1.5 py-0.5 rounded-full font-medium"
                  style={{ backgroundColor: (TYPE_COLORS[t] ?? '#6b7280') + '30', color: TYPE_COLORS[t] ?? '#9ca3af' }}
                >
                  {t}
                </span>
              ))}
            </div>
          )}

          {/* Tera type */}
          <div className="flex items-center gap-1.5">
            <span className="text-[9px] text-gray-600 font-medium uppercase tracking-wider shrink-0">Tera</span>
            <button
              onClick={e => { e.stopPropagation(); onEdit('stats') }}
              className="text-left"
            >
              {pokemon.teraType ? (
                <span
                  className="text-[10px] px-2 py-0.5 rounded-full font-medium border"
                  style={{
                    backgroundColor: (TYPE_COLORS[pokemon.teraType] ?? '#6b7280') + '25',
                    color: TYPE_COLORS[pokemon.teraType] ?? '#9ca3af',
                    borderColor: (TYPE_COLORS[pokemon.teraType] ?? '#6b7280') + '40',
                  }}
                >
                  {pokemon.teraType}
                </span>
              ) : (
                <span className="text-[10px] text-gray-600 italic">—</span>
              )}
            </button>
          </div>
        </div>

        {/* Moves + Item/Ability */}
        <div className="flex flex-col gap-1 flex-1 min-w-0">
          <div className="text-[9px] text-gray-600 font-medium uppercase tracking-wider">Moves</div>
          {/* Moves 2x2 grid */}
          <div className="grid grid-cols-2 gap-1">
            {[0, 1, 2, 3].map(i => {
              const moveName = pokemon.moves[i]
              const moveData = moveName ? getMove(moveName) : null
              const moveType = moveData ? (moveData as unknown as Record<string, unknown>).type as string : null
              const typeColor = moveType ? TYPE_COLORS[moveType] : undefined

              return (
                <motion.button
                  key={i}
                  whileTap={{ scale: 0.97 }}
                  onClick={e => { e.stopPropagation(); onEdit('move', i) }}
                  className={`text-xs rounded-lg px-2 py-1.5 text-left truncate border transition-colors ${
                    moveName
                      ? 'text-gray-200 border-gray-600/60 bg-gray-700/30 hover:bg-gray-700/60'
                      : 'text-gray-600 italic border-dashed border-gray-700/40 hover:border-gray-600/60'
                  }`}
                  style={moveName && typeColor ? { borderLeft: `3px solid ${typeColor}` } : undefined}
                >
                  {moveName || '—'}
                </motion.button>
              )
            })}
          </div>

          {/* Item + Ability row */}
          <div className="grid grid-cols-2 gap-1">
            <div className="text-[9px] text-gray-600 font-medium uppercase tracking-wider">Item</div>
            <div className="text-[9px] text-gray-600 font-medium uppercase tracking-wider">Ability</div>
            <button
              onClick={e => { e.stopPropagation(); onEdit('item') }}
              className={`flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs border transition-colors ${
                pokemon.item
                  ? 'text-purple-300 border-gray-600/60 bg-gray-700/30 hover:bg-gray-700/60'
                  : 'text-gray-600 italic border-dashed border-gray-700/40 hover:border-gray-600/60'
              }`}
            >
              {pokemon.item ? (
                <>
                  <img
                    src={getItemSpriteUrl(pokemon.item)}
                    alt={pokemon.item}
                    className="w-4 h-4 object-contain shrink-0"
                    loading="lazy"
                    onError={e => { (e.target as HTMLImageElement).style.display = 'none' }}
                  />
                  <span className="truncate">{pokemon.item}</span>
                </>
              ) : (
                <span className="truncate">Item</span>
              )}
            </button>
            <button
              onClick={e => { e.stopPropagation(); onEdit('ability') }}
              className={`rounded-lg px-2 py-1.5 text-xs border truncate text-left transition-colors ${
                pokemon.ability
                  ? 'text-gray-300 border-gray-600/60 bg-gray-700/30 hover:bg-gray-700/60'
                  : 'text-gray-600 italic border-dashed border-gray-700/40 hover:border-gray-600/60'
              }`}
            >
              {pokemon.ability || 'Ability'}
            </button>
          </div>
        </div>

        {/* Stats column */}
        <div className="flex flex-col shrink-0">
          <div className="text-[9px] text-gray-600 font-medium uppercase tracking-wider">Stats</div>
          <button
            onClick={e => { e.stopPropagation(); onEdit('stats') }}
            className="flex flex-col gap-[3px] min-w-0 w-44"
          >
          {STATS.map(s => {
            const base = baseStats[s] ?? 0
            const ev = pokemon.evs[s]
            const final = statValue(s)
            const mult = getNatureMultiplier(pokemon.nature, s)
            const color = STAT_COLORS[s]

            return (
              <div key={s} className="flex items-center gap-1 text-[11px]">
                <span className="text-gray-500 w-6 text-right shrink-0">{STAT_LABEL[s]}</span>
                <span className="text-gray-500 w-7 text-right shrink-0 font-mono">{base}</span>
                <div className="flex-1 h-1.5 bg-gray-700/50 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(100, (ev / 252) * 100)}%`, backgroundColor: color }}
                  />
                </div>
                <span className="text-gray-200 w-7 text-right shrink-0 font-mono">{final}</span>
                {mult > 1 && <span className="text-green-400 text-[10px] w-3 shrink-0">+</span>}
                {mult < 1 && <span className="text-red-400 text-[10px] w-3 shrink-0">−</span>}
              </div>
            )
          })}
        </button>
        </div>
      </div>

    </motion.div>
  )
}
