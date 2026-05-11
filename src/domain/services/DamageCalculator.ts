import type { MetaPokemonStats, MoveDamageResult } from '@/types'
import { calcMatchup, calcDamage } from '@/lib/smogonCalc'
import { Pokemon } from '@/domain/entities/Pokemon'
import { MetaAnalyzer } from './MetaAnalyzer'

export interface DamageConfig {
  species: string
  item: string
  ability: string
  nature: string
  evs: Record<string, number>
  level: number
  move: string
}

export class DamageCalculator {
  static calculateMatchup(attacker: Pokemon, defender: Pokemon): MoveDamageResult[] {
    return calcMatchup(attacker.toJSON(), defender.toJSON())
  }

  static calculateSingle(attacker: Pokemon, defender: Pokemon, move: string): MoveDamageResult {
    return calcDamage(attacker.toJSON(), defender.toJSON(), move)
  }

  static buildFromConfig(config: DamageConfig): Pokemon {
    return Pokemon.fromJSON({
      species: config.species,
      item: config.item,
      ability: config.ability,
      moves: [config.move, '', '', ''],
      nature: config.nature,
      evs: {
        hp: config.evs.hp || 0,
        atk: config.evs.atk || 0,
        def: config.evs.def || 0,
        spa: config.evs.spa || 0,
        spd: config.evs.spd || 0,
        spe: config.evs.spe || 0,
      },
      ivs: { hp: 31, atk: 31, def: 31, spa: 31, spd: 31, spe: 31 },
      teraType: '',
      level: config.level,
    })
  }

  static buildFromMeta(meta: MetaPokemonStats): Pokemon {
    const topMoves = MetaAnalyzer.extractTopMoves(meta, 4)
    const topItem = MetaAnalyzer.extractTopItem(meta)
    const topAbility = MetaAnalyzer.extractTopAbility(meta)

    const commonSet = Pokemon.fromJSON({
      species: meta.species,
      item: topItem,
      ability: topAbility,
      moves: [...topMoves, '', '', '', ''].slice(0, 4) as [string, string, string, string],
      nature: 'Adamant',
      evs: { hp: 252, atk: 252, def: 0, spa: 0, spd: 0, spe: 0 },
      ivs: { hp: 31, atk: 31, def: 31, spa: 31, spd: 31, spe: 31 },
      teraType: '',
      level: 50,
    })

    const teraType = MetaAnalyzer.extractTopTeraType(meta)
    if (teraType) return commonSet.withTeraType(teraType)
    return commonSet
  }
}
