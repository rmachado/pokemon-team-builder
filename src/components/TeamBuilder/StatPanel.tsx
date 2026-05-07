import { useMemo } from 'react'
import type { PokemonSet, Stats, StatName } from '../../types'
import { NATURES, TYPES, STAT_NAMES, calcStat, getNatureMultiplier, getPokemon } from '../../lib/pkmn'

interface StatPanelProps {
  pokemon: PokemonSet
  onChange: (pokemon: PokemonSet) => void
}

const STAT_LABELS: Record<StatName, string> = {
  hp: 'HP', atk: 'Atk', def: 'Def', spa: 'SpA', spd: 'SpD', spe: 'Spe',
}

export function StatPanel({ pokemon, onChange }: StatPanelProps) {
  const dexSpecies = useMemo(() => pokemon.species ? getPokemon(pokemon.species) : null, [pokemon.species])
  const dexAny = dexSpecies as unknown as Record<string, unknown> | null
  const baseStats = dexAny?.baseStats as Record<string, number> | undefined

  const totalEVs = Object.values(pokemon.evs).reduce((a, b) => a + b, 0)

  function updateEVs(stat: StatName, value: number) {
    const clamped = Math.max(0, Math.min(252, value))
    const others = STAT_NAMES.filter(s => s !== stat)
    const otherTotal = others.reduce((sum, s) => sum + (pokemon.evs[s] || 0), 0)
    const newTotal = otherTotal + clamped
    let overflow = newTotal > 510 ? newTotal - 510 : 0
    const newEVs = { ...pokemon.evs, [stat]: clamped }
    for (const s of others) {
      if (overflow <= 0) break
      const reduce = Math.min(newEVs[s], overflow)
      newEVs[s] -= reduce
      overflow -= reduce
    }
    onChange({ ...pokemon, evs: newEVs as Stats })
  }

  function updateIVs(stat: StatName, value: number) {
    const clamped = Math.max(0, Math.min(31, value || 0))
    onChange({ ...pokemon, ivs: { ...pokemon.ivs, [stat]: clamped } })
  }

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          {STAT_NAMES.map(stat => {
            const base = baseStats?.[stat] ?? 0
            const ev = pokemon.evs[stat]
            const iv = pokemon.ivs[stat]
            const nature = getNatureMultiplier(pokemon.nature, stat)
            const final = calcStat(base, iv, ev, pokemon.level || 50, nature)
            const isPlus = nature > 1
            const isMinus = nature < 1

            return (
              <div key={stat} className="flex items-center gap-1.5 text-xs">
                <span className="w-6 text-gray-400 font-medium shrink-0">{STAT_LABELS[stat]}</span>
                <span className="w-5 text-gray-300 font-mono text-right shrink-0">{base}</span>
                <div className="flex-1 h-2.5 bg-gray-700 rounded-full overflow-hidden min-w-[40px]">
                  <div
                    className="h-full bg-blue-500 rounded-full transition-all"
                    style={{ width: `${(ev / 252) * 100}%` }}
                  />
                </div>
                <input
                  type="number"
                  min={0}
                  max={252}
                  value={ev}
                  onChange={e => updateEVs(stat, parseInt(e.target.value) || 0)}
                  className="w-11 bg-gray-800 border border-gray-600 rounded px-1 py-0.5 text-xs text-white text-center font-mono focus:outline-none focus:border-blue-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
                <input
                  type="number"
                  min={0}
                  max={31}
                  value={iv}
                  onChange={e => updateIVs(stat, parseInt(e.target.value) || 0)}
                  className="w-8 bg-gray-800 border border-gray-600 rounded px-1 py-0.5 text-xs text-white text-center font-mono focus:outline-none focus:border-blue-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
                <span className="w-8 text-gray-200 font-mono text-right shrink-0">{final}</span>
                {isPlus && <span className="text-green-400 text-xs w-3 shrink-0">▲</span>}
                {isMinus && <span className="text-red-400 text-xs w-3 shrink-0">▼</span>}
              </div>
            )
          })}
          <div className="text-xs text-gray-500 text-right">EVs: {totalEVs}/510</div>
        </div>

        <div className="space-y-3">
          <div>
            <label className="text-xs text-gray-500 block mb-1">Nature</label>
            <select
              value={pokemon.nature}
              onChange={e => onChange({ ...pokemon, nature: e.target.value })}
              className="w-full bg-gray-800 border border-gray-600 rounded px-2 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500"
            >
              {NATURES.map(n => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs text-gray-500 block mb-1">Tera Type</label>
            <select
              value={pokemon.teraType}
              onChange={e => onChange({ ...pokemon, teraType: e.target.value })}
              className="w-full bg-gray-800 border border-gray-600 rounded px-2 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500"
            >
              <option value="">—</option>
              {TYPES.map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  )
}
