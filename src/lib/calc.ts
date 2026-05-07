import { calculate, Pokemon, Move, Field, Generations } from '@smogon/calc'
import type { PokemonSet, Stats, MoveDamageResult } from '../types'

const gen = Generations.get(9)

const SPREAD_MULTIPLIER = 0.75
const SPREAD_MOVES = new Set([
  'Earthquake', 'Dazzling Gleam', 'Rock Slide', 'Heat Wave',
  'Discharge', 'Lava Plume', 'Sludge Wave', 'Eruption',
  'Water Spout', 'Surf', 'Muddy Water', 'Origin Pulse',
  'Precipice Blades', 'Expanding Force', 'Rising Voltage',
  'Bleakwind Storm', 'Wildbolt Storm', 'Sandsear Storm',
  'Springtide Storm', 'Blood Moon',
])

function toStatsObj(evs: Stats): Record<string, number> {
  const stats: Record<string, number> = {}
  for (const k of Object.keys(evs)) {
    stats[k] = evs[k] ?? (k === 'hp' ? 31 : 31)
  }
  return stats
}

function buildPokemon(set: PokemonSet): Pokemon {
  const item = set.item === '' ? undefined : set.item
  const nature = set.nature || 'Serious'

  return new Pokemon(gen, set.species, {
    item,
    nature,
    evs: toStatsObj(set.evs),
    ivs: toStatsObj(set.ivs),
    level: set.level,
  })
}

export function calcDamage(
  attacker: PokemonSet,
  defender: PokemonSet,
  moveName: string,
  options?: {
    spread?: boolean
    weather?: string
    terrain?: string
    screens?: boolean
    helpingHand?: boolean
  }
): MoveDamageResult {
  const atkMon = buildPokemon(attacker)
  const defMon = buildPokemon(defender)

  const fieldOptions: Record<string, unknown> = { gameType: 'Doubles' }
  if (options?.weather) fieldOptions.weather = options.weather
  if (options?.terrain) fieldOptions.terrain = options.terrain
  const field = new Field(fieldOptions)

  const move = new Move(gen, moveName)

  const result = calculate(gen, atkMon, defMon, move, field)

  const [minDmgRaw, maxDmgRaw] = result.range()
  let minDmg = minDmgRaw
  let maxDmg = maxDmgRaw

  if (options?.spread || SPREAD_MOVES.has(moveName)) {
    minDmg = Math.floor(minDmg * SPREAD_MULTIPLIER)
    maxDmg = Math.floor(maxDmg * SPREAD_MULTIPLIER)
  }

  const desc = result.desc()
  const defHP = defMon.stats.hp
  const minPercent = Math.floor((minDmg / defHP) * 1000) / 10
  const maxPercent = Math.floor((maxDmg / defHP) * 1000) / 10

  let koChance: string | null = null
  try {
    const kc = result.kochance()
    if (kc) {
      koChance = kc.text
    }
  } catch {
    if (maxDmg >= defHP) koChance = 'OHKO'
    else if (maxDmg * 2 >= defHP) koChance = 'possible 2HKO'
  }

  return {
    moveName,
    minDamage: minDmg,
    maxDamage: maxDmg,
    minPercent,
    maxPercent,
    koChance,
    description: desc,
  }
}

export function calcMatchup(
  attacker: PokemonSet,
  defender: PokemonSet,
  options?: { spread?: boolean }
): MoveDamageResult[] {
  return attacker.moves
    .filter(m => m)
    .map(moveName => calcDamage(attacker, defender, moveName, options))
}

export { Pokemon, Move, Field, calculate, Generations }
