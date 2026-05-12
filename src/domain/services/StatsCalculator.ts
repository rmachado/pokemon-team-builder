import type { Stats } from '@/types'
import { getPokemon, getNatureMultiplier, TYPES, getTypeEffectiveness, STAT_NAMES } from '@/lib/pkmn'
import { Pokemon } from '@/domain/entities/Pokemon'

export class StatsCalculator {
  static calculate(
    base: number,
    iv: number,
    ev: number,
    level: number,
    natureMultiplier: number,
    statName: string,
    useStatPoints = false,
  ): number {
    if (useStatPoints) {
      // Champions formula: HP = base + sp + 75, Other = (base + sp + 20) * natureMult
      const sp = ev
      if (statName === 'hp') {
        return base + sp + 75
      }
      let stat = base + sp + 20
      if (natureMultiplier === 1.1) {
        stat = Math.trunc(Math.trunc(stat * 110) / 100)
      } else if (natureMultiplier === 0.9) {
        stat = Math.trunc(Math.trunc(stat * 90) / 100)
      }
      return stat
    }
    if (statName === 'hp') {
      return Math.floor((2 * base + iv + Math.floor(ev / 4)) * level / 100) + level + 10
    }
    const stat = Math.floor((2 * base + iv + Math.floor(ev / 4)) * level / 100 + 5)
    return Math.floor(stat * natureMultiplier)
  }

  static totalEVs(evs: Stats): number {
    return Object.values(evs).reduce((a, b) => a + b, 0)
  }

  static clampEV(stat: string, value: number, currentEVs: Stats, useStatPoints = false): number {
    const maxPerStat = useStatPoints ? 32 : 252
    const totalLimit = useStatPoints ? 66 : 510
    const clamped = Math.max(0, Math.min(maxPerStat, value))
    const otherTotal = STAT_NAMES
      .filter(s => s !== stat)
      .reduce((sum, s) => sum + (currentEVs[s] || 0), 0)
    const available = totalLimit - otherTotal
    return Math.min(clamped, Math.max(0, available))
  }

  static calculateAll(pokemon: Pokemon, useStatPoints = false): Record<string, number> {
    const dex = pokemon.species ? getPokemon(pokemon.species) : null
    const baseStats = (dex?.baseStats ?? {}) as Record<string, number>
    const nature = pokemon.nature || 'Serious'
    const level = pokemon.level || 50

    const result: Record<string, number> = {}
    for (const stat of STAT_NAMES) {
      const base = baseStats[stat] ?? 80
      const iv = pokemon.ivs[stat]
      const ev = pokemon.evs[stat]
      const mult = getNatureMultiplier(nature, stat)
      result[stat] = StatsCalculator.calculate(base, iv, ev, level, mult, stat, useStatPoints)
    }
    return result
  }

  static applyPreset(pokemon: Pokemon, preset: Record<string, number>): Pokemon {
    return Pokemon.fromJSON({
      ...pokemon.toJSON(),
      evs: { hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 0, ...preset } as Stats,
    })
  }

  static calculateTypeCoverage(team: Pokemon[]): {
    defensive: {
      type: string
      weak: string[]
      resist: string[]
      immune: string[]
      weakCount: number
      resistCount: number
      immuneCount: number
    }[]
  } {
    const pokeDetails = team
      .filter(p => p.species)
      .map(p => {
        const sp = getPokemon(p.species)
        return { species: p.species, types: (sp?.types ?? []) as string[] }
      })

    const defensive = TYPES.map(type => {
      const weak: string[] = []
      const resist: string[] = []
      const immune: string[] = []

      for (const { species, types } of pokeDetails) {
        const eff = getTypeEffectiveness(type, types as string[])
        if (eff === 0) immune.push(species)
        else if (eff > 1) weak.push(species)
        else if (eff < 1) resist.push(species)
      }

      return {
        type,
        weak,
        resist,
        immune,
        weakCount: weak.length,
        resistCount: resist.length,
        immuneCount: immune.length,
      }
    })

    return { defensive }
  }
}
