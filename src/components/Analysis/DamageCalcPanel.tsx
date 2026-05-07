import { useState } from 'react'
import { Calculator } from 'lucide-react'
import { calcDamage } from '../../lib/calc'
import { SmartSearch } from '../SmartSearch'
import { Button } from '../ui/Button'
import type { PokemonSet, MoveDamageResult } from '../../types'

interface AttackerConfig {
  species: string
  item: string
  ability: string
  nature: string
  evs: Record<string, number>
  level: number
  move: string
}

export function DamageCalcPanel() {
  const [attacker, setAttacker] = useState<AttackerConfig>({
    species: '', item: '', ability: '', nature: 'Adamant',
    evs: { atk: 252, spe: 252 }, level: 50, move: '',
  })
  const [defender, setDefender] = useState<AttackerConfig>({
    species: '', item: '', ability: '', nature: 'Bold',
    evs: { hp: 252, def: 252 }, level: 50, move: '',
  })
  const [results, setResults] = useState<MoveDamageResult[] | null>(null)

  function toPokemonSet(cfg: AttackerConfig): PokemonSet {
    return {
      species: cfg.species,
      item: cfg.item,
      ability: cfg.ability,
      moves: [cfg.move, '', '', ''],
      nature: cfg.nature,
      evs: { hp: cfg.evs.hp || 0, atk: cfg.evs.atk || 0, def: cfg.evs.def || 0, spa: cfg.evs.spa || 0, spd: cfg.evs.spd || 0, spe: cfg.evs.spe || 0 },
      ivs: { hp: 31, atk: 31, def: 31, spa: 31, spd: 31, spe: 31 },
      teraType: '',
      level: cfg.level,
    }
  }

  function handleCalc() {
    if (!attacker.species || !defender.species || !attacker.move) return
    const atkSet = toPokemonSet(attacker)
    const defSet = toPokemonSet(defender)
    const result = calcDamage(atkSet, defSet, attacker.move)
    setResults([result])
  }

  return (
    <div className="space-y-4">
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-300">Attacker</h4>
          <div>
            <label className="text-xs text-gray-500">Pokémon</label>
            <SmartSearch
              onSelect={s => setAttacker(p => ({ ...p, species: s }))}
              placeholder="Search attacker..."
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs text-gray-500">Move</label>
              <input
                type="text"
                value={attacker.move}
                onChange={e => setAttacker(p => ({ ...p, move: e.target.value }))}
                placeholder="Flamethrower"
                className="w-full bg-gray-800 border border-gray-600 rounded px-2 py-1 text-sm text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500">Nature</label>
              <input
                type="text"
                value={attacker.nature}
                onChange={e => setAttacker(p => ({ ...p, nature: e.target.value }))}
                className="w-full bg-gray-800 border border-gray-600 rounded px-2 py-1 text-sm text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>
          <EVInputs values={attacker.evs} onChange={evs => setAttacker(p => ({ ...p, evs }))} />
        </div>

        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-300">Defender</h4>
          <div>
            <label className="text-xs text-gray-500">Pokémon</label>
            <SmartSearch
              onSelect={s => setDefender(p => ({ ...p, species: s }))}
              placeholder="Search defender..."
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs text-gray-500">Item</label>
              <input
                type="text"
                value={defender.item}
                onChange={e => setDefender(p => ({ ...p, item: e.target.value }))}
                className="w-full bg-gray-800 border border-gray-600 rounded px-2 py-1 text-sm text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500">Nature</label>
              <input
                type="text"
                value={defender.nature}
                onChange={e => setDefender(p => ({ ...p, nature: e.target.value }))}
                className="w-full bg-gray-800 border border-gray-600 rounded px-2 py-1 text-sm text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>
          <EVInputs values={defender.evs} onChange={evs => setDefender(p => ({ ...p, evs }))} />
        </div>
      </div>

      <Button variant="primary" size="md" onClick={handleCalc} disabled={!attacker.species || !defender.species || !attacker.move}>
        <Calculator className="w-3.5 h-3.5" /> Calculate
      </Button>

      {results && results.map(r => (
        <div key={r.moveName} className="bg-gray-800/50 border border-gray-700 rounded-lg p-3">
          <div className="text-sm font-medium text-gray-200">{r.moveName}</div>
          <div className="text-xs text-gray-400 mt-1">{r.description}</div>
          <div className="text-sm mt-1">
            <span className="text-gray-300">{r.minDamage} - {r.maxDamage} </span>
            <span className="text-gray-500">({r.minPercent}% - {r.maxPercent}%)</span>
          </div>
          {r.koChance && <div className="text-xs text-yellow-400 mt-0.5">{r.koChance}</div>}
        </div>
      ))}
    </div>
  )
}

function EVInputs({ values, onChange }: { values: Record<string, number>; onChange: (v: Record<string, number>) => void }) {
  const stats = ['hp', 'atk', 'def', 'spa', 'spd', 'spe']
  return (
    <div>
      <label className="text-xs text-gray-500">EVs</label>
      <div className="grid grid-cols-3 gap-1">
        {stats.map(s => (
          <div key={s} className="flex items-center gap-1">
            <span className="text-[10px] text-gray-400 w-6">{s}</span>
            <input
              type="number"
              min={0}
              max={252}
              value={values[s] || 0}
              onChange={e => onChange({ ...values, [s]: parseInt(e.target.value) || 0 })}
              className="w-full bg-gray-800 border border-gray-600 rounded px-1 py-0.5 text-xs text-white text-center focus:outline-none focus:border-blue-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
          </div>
        ))}
      </div>
    </div>
  )
}
