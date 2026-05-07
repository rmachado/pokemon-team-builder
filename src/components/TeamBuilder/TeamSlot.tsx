import { useMemo } from 'react'
import type { PokemonSet } from '../../types'
import { getPokemonNum, getPokemon, calcStat, getNatureMultiplier } from '../../lib/pkmn'

interface TeamSlotProps {
  pokemon: PokemonSet
  onEdit: (field: string, moveIndex?: number) => void
}

const STATS = ['hp', 'atk', 'def', 'spa', 'spd', 'spe'] as const
const STAT_LABEL: Record<string, string> = { hp: 'HP', atk: 'Atk', def: 'Def', spa: 'SpA', spd: 'SpD', spe: 'Spe' }

export function TeamSlot({ pokemon, onEdit }: TeamSlotProps) {
  const hasMon = !!pokemon.species
  const num = hasMon ? getPokemonNum(pokemon.species) : 0

  const dexSpecies = useMemo(() => pokemon.species ? getPokemon(pokemon.species) : null, [pokemon.species])
  const dexAny = dexSpecies as unknown as Record<string, unknown> | null
  const baseStats = (dexAny?.baseStats ?? {}) as Record<string, number>

  function statValue(s: string): number {
    return calcStat(baseStats[s] ?? 80, pokemon.ivs[s], pokemon.evs[s], pokemon.level || 50, getNatureMultiplier(pokemon.nature, s))
  }

  return (
    <div
      className={`border rounded-lg overflow-hidden transition-colors ${
        hasMon ? 'bg-gray-800/70 border-gray-700 hover:border-gray-600' : 'bg-gray-800/20 border-gray-700/40'
      }`}
      onClick={() => !hasMon && onEdit('pokemon')}
    >
      <div className="flex gap-3 p-2.5">
        {/* Sprite column */}
        <button
          onClick={e => { e.stopPropagation(); onEdit('pokemon') }}
          className="shrink-0"
        >
          {num ? (
            <img
              src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${num}.png`}
              alt={pokemon.species}
              className="w-12 h-12 object-contain"
              loading="lazy"
            />
          ) : (
            <div className="w-12 h-12 flex items-center justify-center text-gray-600 text-xl font-bold rounded bg-gray-800/50">+</div>
          )}
        </button>

        {/* Pokémon info column */}
        <div className="flex flex-col gap-0.5 min-w-0 w-28 shrink-0">
          <button onClick={e => { e.stopPropagation(); onEdit('pokemon') }} className="text-left">
            <span className="text-sm font-semibold text-gray-100 truncate block">
              {hasMon ? pokemon.species : 'Empty slot'}
            </span>
            {hasMon && (
              <span className="text-xs text-gray-400">Lv.{pokemon.level || 50} ♂</span>
            )}
          </button>
          <div className="flex items-center gap-1 text-xs">
            <button onClick={e => { e.stopPropagation(); onEdit('item') }} className={`truncate ${pokemon.item ? 'text-purple-300 hover:text-purple-200' : 'text-gray-500 italic'}`}>
              {pokemon.item || 'Item'}
            </button>
          </div>
          <div className="flex items-center gap-1 text-xs">
            <button onClick={e => { e.stopPropagation(); onEdit('ability') }} className={`truncate ${pokemon.ability ? 'text-gray-300 hover:text-gray-100' : 'text-gray-500 italic'}`}>
              {pokemon.ability || 'Ability'}
            </button>
          </div>
          <div className="text-xs text-gray-500">
            {pokemon.nature && pokemon.nature !== 'Serious' ? pokemon.nature : ''}
            {pokemon.teraType ? <span className="ml-2 text-xs px-1.5 py-0.5 rounded bg-gray-700 text-gray-300">{pokemon.teraType}</span> : null}
          </div>
        </div>

        {/* Moves column */}
        <div className="flex flex-col gap-1 flex-1 min-w-0">
          {[0, 1, 2, 3].map(i => (
            <button
              key={i}
              onClick={e => { e.stopPropagation(); onEdit('move', i) }}
              className={`text-xs rounded px-2 py-1 text-left truncate border transition-colors ${
                pokemon.moves[i]
                  ? 'text-gray-200 border-gray-600 hover:bg-gray-700'
                  : 'text-gray-500 italic border-gray-700/50 hover:border-gray-600'
              }`}
            >
              {pokemon.moves[i] || `— Move ${i + 1} —`}
            </button>
          ))}
        </div>

        {/* Stats column */}
        <button onClick={e => { e.stopPropagation(); onEdit('stats') }} className="flex flex-col gap-0.5 min-w-0 w-40 shrink-0">
          {STATS.map(s => {
            const base = baseStats[s] ?? 0
            const ev = pokemon.evs[s]
            const final = statValue(s)
            const mult = getNatureMultiplier(pokemon.nature, s)

            return (
              <div key={s} className="flex items-center gap-1 text-xs">
                <span className="text-gray-400 w-7 text-right shrink-0">{STAT_LABEL[s]}</span>
                <span className="text-gray-500 w-5 text-right shrink-0 font-mono">{base}</span>
                <div className="flex-1 h-2 bg-gray-700 rounded-full overflow-hidden min-w-[40px]">
                  <div
                    className="h-full bg-blue-500 rounded-full transition-all"
                    style={{ width: `${Math.min(100, (ev / 252) * 100)}%` }}
                  />
                </div>
                <span className="text-gray-200 w-7 text-right shrink-0 font-mono">{final}</span>
                {mult > 1 && <span className="text-green-400 text-[10px] w-3 shrink-0">▲</span>}
                {mult < 1 && <span className="text-red-400 text-[10px] w-3 shrink-0">▼</span>}
              </div>
            )
          })}
        </button>
      </div>
    </div>
  )
}
