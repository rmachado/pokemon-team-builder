import type { Stats, StatName } from '../../types'
import { STAT_NAMES } from '../../lib/pkmn'

interface EVSpreadProps {
  evs: Stats
  onChange: (evs: Stats) => void
}

const STAT_LABELS: Record<StatName, string> = {
  hp: 'HP', atk: 'Atk', def: 'Def', spa: 'SpA', spd: 'SpD', spe: 'Spe',
}

export function EVSpread({ evs, onChange }: EVSpreadProps) {
  const total = Object.values(evs).reduce((a, b) => a + b, 0)

  function handleChange(stat: StatName, value: number) {
    const clamped = Math.max(0, Math.min(252, value))
    const others = STAT_NAMES.filter(s => s !== stat)
    const otherTotal = others.reduce((sum, s) => sum + (evs[s] || 0), 0)
    const newTotal = otherTotal + clamped

    if (newTotal > 510) {
      let overflow = newTotal - 510
      let adjusted = { ...evs, [stat]: clamped }

      for (const s of others) {
        if (overflow <= 0) break
        const reduce = Math.min(adjusted[s], overflow)
        adjusted[s] -= reduce
        overflow -= reduce
      }

      onChange(adjusted as Stats)
    } else {
      onChange({ ...evs, [stat]: clamped })
    }
  }

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-400">EVs</span>
        <span className={`text-xs font-mono ${total > 510 ? 'text-red-400' : 'text-gray-400'}`}>
          {total}/510
        </span>
      </div>
      <div className="grid grid-cols-2 gap-x-3 gap-y-1">
        {STAT_NAMES.map(stat => (
          <div key={stat} className="flex items-center gap-1.5">
            <span className="text-xs text-gray-400 w-8 shrink-0">{STAT_LABELS[stat]}</span>
            <input
              type="number"
              min={0}
              max={252}
              value={evs[stat]}
              onChange={e => handleChange(stat, parseInt(e.target.value) || 0)}
              className="w-full bg-gray-800 border border-gray-600 rounded px-1.5 py-0.5 text-xs text-white text-center font-mono focus:outline-none focus:border-blue-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
            <div className="flex-1 h-1.5 bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-500 rounded-full transition-all"
                style={{ width: `${(evs[stat] / 252) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
