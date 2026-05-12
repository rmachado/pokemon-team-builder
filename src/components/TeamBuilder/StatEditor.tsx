import { useMemo } from 'react'
import * as Slider from '@radix-ui/react-slider'
import { Zap, Archive } from 'lucide-react'
import type { PokemonSet, StatName } from '@/types'
import { NATURES, TYPES, STAT_NAMES, getPokemon, getNatureMultiplier, isChampionsFormat } from '@/lib/pkmn'
import { STAT_COLORS, STAT_LABEL } from '@/lib/theme'
import { Button } from '@/components/ui/Button'
import { Pokemon, StatsCalculator } from '@/domain'
import { useFormatStore } from '@/stores'

interface StatEditorProps {
  pokemon: PokemonSet
  onChange: (pokemon: PokemonSet) => void
}

export function StatEditor({ pokemon, onChange }: StatEditorProps) {
  const { currentFormat } = useFormatStore()
  const isChampions = isChampionsFormat(currentFormat.id)
  const dexSpecies = useMemo(() => pokemon.species ? getPokemon(pokemon.species) : null, [pokemon.species])
  const baseStats = useMemo(() => (dexSpecies?.baseStats ?? {}) as Record<string, number>, [dexSpecies])
  const nature = pokemon.nature || 'Serious'

  const p = useMemo(() => Pokemon.fromJSON(pokemon), [pokemon])

  const natureMultipliers = useMemo(() => {
    const result: Record<string, number> = {}
    for (const stat of STAT_NAMES) {
      result[stat] = getNatureMultiplier(nature, stat)
    }
    return result
  }, [nature])

  const statFinals = useMemo(() => {
    const result: Record<string, number> = {}
    for (const stat of STAT_NAMES) {
      result[stat] = StatsCalculator.calculate(baseStats[stat] ?? 80, pokemon.ivs[stat], pokemon.evs[stat], pokemon.level || 50, natureMultipliers[stat], stat, isChampions)
    }
    return result
  }, [baseStats, pokemon.ivs, pokemon.evs, pokemon.level, natureMultipliers, isChampions])

  function updateEVs(stat: StatName, values: number[]) {
    const maxPerStat = isChampions ? 32 : 252
    const totalLimit = isChampions ? 66 : 510
    let val = values[0] ?? 0
    val = Math.max(0, Math.min(maxPerStat, val))
    const otherTotal = STAT_NAMES
      .filter(s => s !== stat)
      .reduce((sum, s) => sum + (pokemon.evs[s] || 0), 0)
    const available = totalLimit - otherTotal
    val = Math.min(val, Math.max(0, available))
    onChange(p.withEV(stat, val).toJSON())
  }

  function applyPreset(preset: Record<string, number>) {
    const maxPerStat = isChampions ? 32 : 252
    const totalLimit = isChampions ? 66 : 510
    let total = 0
    const clamped: Record<string, number> = {}
    for (const stat of STAT_NAMES) {
      const val = preset[stat] ?? 0
      const remaining = totalLimit - total
      const allowed = Math.min(maxPerStat, Math.max(0, val), remaining)
      clamped[stat] = allowed
      total += allowed
    }
    onChange(StatsCalculator.applyPreset(p, clamped).toJSON())
  }

  return (
    <div className="space-y-4">
      {/* Stat sliders */}
      <div className="space-y-2">
        {STAT_NAMES.map(stat => {
          const base = baseStats?.[stat] ?? 0
          const ev = pokemon.evs[stat]
          const mult = natureMultipliers[stat]
          const final = statFinals[stat]
          const color = STAT_COLORS[stat]
          const isPlus = mult > 1
          const isMinus = mult < 1

          const maxPerStat = isChampions ? 32 : 252
          const step = isChampions ? 1 : 4
          return (
            <div key={stat} className="space-y-1">
              <div className="flex items-center gap-2 text-xs">
                <span className="w-6 text-right font-medium text-gray-400">{STAT_LABEL[stat]}</span>
                <span className="w-7 text-right font-mono text-gray-500">{base}</span>
                <div className="flex-1 relative">
                  <Slider.Root
                    value={[ev]}
                    min={0}
                    max={maxPerStat}
                    step={step}
                    onValueChange={v => updateEVs(stat, v)}
                    className="relative flex items-center h-5 w-full"
                  >
                    <Slider.Track className="relative h-2 w-full rounded-full bg-gray-700 overflow-hidden">
                      <Slider.Range className="absolute h-full rounded-full" style={{ backgroundColor: color }} />
                    </Slider.Track>
                    <Slider.Thumb className="block w-4 h-4 rounded-full border-2 border-white bg-gray-800 shadow-md cursor-pointer hover:scale-110 transition-transform focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </Slider.Root>
                </div>
                <input
                  type="number"
                  min={0}
                  max={maxPerStat}
                  value={ev}
                  onChange={e => {
                    const val = parseInt(e.target.value)
                    if (!isNaN(val)) updateEVs(stat, [val])
                  }}
                  className="w-10 bg-gray-800 border border-gray-600 rounded px-1 py-0.5 text-xs text-white text-center font-mono focus:outline-none focus:border-blue-500"
                />
                <span className="w-8 text-right font-mono text-gray-200">{final}</span>
                <span className="w-3 text-center shrink-0">
                  {isPlus && <span className="text-green-400">▲</span>}
                  {isMinus && <span className="text-red-400">▼</span>}
                </span>
              </div>
            </div>
          )
        })}

        <div className={`text-xs text-right font-mono ${p.totalEVs > (isChampions ? 66 : 510) ? 'text-red-400' : 'text-gray-500'}`}>
          {p.totalEVs}/{isChampions ? 66 : 510}
        </div>
      </div>

      {/* Stat bar chart */}
      <div className="space-y-[2px]">
        {STAT_NAMES.map(stat => {
          const final = statFinals[stat]
          const color = STAT_COLORS[stat]
          const REF_MAX = 300

          return (
              <div key={`bar-${stat}`} className="flex items-center gap-1 text-[10px]">
                <span className="w-5 text-gray-400 text-right">{STAT_LABEL[stat]}</span>
                <div className="flex-1 h-3">
                  <div
                    className="h-full rounded-full transition-all duration-300 ease-out"
                    style={{ width: `${Math.min(100, (final / REF_MAX) * 100)}%`, backgroundColor: color }}
                  />
                </div>
                <span className="w-8 text-gray-200 font-mono text-right">{final}</span>
              </div>
          )
        })}
      </div>

      {/* EV/SP presets */}
      <div>
        <span className="text-xs text-gray-500 block mb-1.5">Quick Presets</span>
        <div className="flex flex-wrap gap-1.5">
          {isChampions ? (
            <>
              <Button size="sm" variant="secondary" onClick={() => applyPreset({ hp: 32, atk: 32, def: 0, spa: 0, spd: 0, spe: 0 })}>
                <Zap className="w-3 h-3" /> 32/32
              </Button>
              <Button size="sm" variant="secondary" onClick={() => applyPreset({ hp: 32, atk: 0, def: 0, spa: 32, spd: 0, spe: 0 })}>
                <Zap className="w-3 h-3" /> SpA 32
              </Button>
            </>
          ) : (
            <>
              <Button size="sm" variant="secondary" onClick={() => applyPreset({ hp: 252, atk: 252, def: 0, spa: 0, spd: 4, spe: 0 })}>
                <Zap className="w-3 h-3" /> 252/252/4
              </Button>
              <Button size="sm" variant="secondary" onClick={() => applyPreset({ hp: 252, atk: 0, def: 0, spa: 252, spd: 4, spe: 0 })}>
                <Zap className="w-3 h-3" /> SpA 252
              </Button>
            </>
          )}
          <Button size="sm" variant="ghost" onClick={() => applyPreset({ hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 0 })}>
            <Archive className="w-3 h-3" /> All Zero
          </Button>
        </div>
      </div>

      {/* Nature + Tera */}
      <div className={`grid gap-3 pt-2 border-t border-gray-700/50 ${isChampions ? 'grid-cols-1' : 'grid-cols-2'}`}>
        <div>
          <label className="text-xs text-gray-500 block mb-1">Nature</label>
          <select
            value={nature}
            onChange={e => onChange(p.withNature(e.target.value).toJSON())}
            className="w-full bg-gray-800 border border-gray-600 rounded-lg px-2 py-1.5 text-sm text-white focus:outline-none focus:border-blue-500"
          >
            {NATURES.map(n => <option key={n} value={n}>{n}</option>)}
          </select>
        </div>
        {!isChampions && (
          <div>
            <label className="text-xs text-gray-500 block mb-1">Tera Type</label>
            <select
              value={pokemon.teraType}
              onChange={e => onChange(p.withTeraType(e.target.value).toJSON())}
              className="w-full bg-gray-800 border border-gray-600 rounded-lg px-2 py-1.5 text-sm text-white focus:outline-none focus:border-blue-500"
            >
              <option value="">—</option>
              {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
        )}
      </div>
      {isChampions && (
        <div className="text-xs text-gray-500 pt-1">
          Level 50 &middot; IVs are fixed at 31
        </div>
      )}
    </div>
  )
}
