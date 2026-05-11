import type { PokemonSet, Stats, StatName } from '@/types'
import { getPokemon } from '@/lib/pkmn'
import { StatsCalculator } from '@/domain/services/StatsCalculator'

export class Pokemon {
  private readonly data: PokemonSet

  private constructor(data: PokemonSet) {
    this.data = data
  }

  // === Getters ===
  get species(): string { return this.data.species }
  get item(): string { return this.data.item }
  get ability(): string { return this.data.ability }
  get moves(): readonly string[] { return Object.freeze([...this.data.moves]) }
  get nature(): string { return this.data.nature }
  get evs(): Readonly<Stats> { return Object.freeze({ ...this.data.evs }) }
  get ivs(): Readonly<Stats> { return Object.freeze({ ...this.data.ivs }) }
  get teraType(): string { return this.data.teraType }
  get level(): number { return this.data.level }
  get totalEVs(): number { return StatsCalculator.totalEVs(this.data.evs) }
  get computedStats(): Record<string, number> { return StatsCalculator.calculateAll(this) }

  // === Immutable Setters ===
  withSpecies(species: string): Pokemon {
    if (!species) {
      return new Pokemon({
        species: '',
        item: '',
        ability: '',
        moves: ['', '', '', ''],
        nature: 'Serious',
        evs: { hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 0 },
        ivs: { hp: 31, atk: 31, def: 31, spa: 31, spd: 31, spe: 31 },
        teraType: '',
        level: 50,
      })
    }
    const abilities = Pokemon.getSpeciesAbilities(species)
    const types = Pokemon.getSpeciesTypes(species)
    return new Pokemon({
      ...this.data,
      species,
      item: '',
      ability: abilities[0] ?? '',
      teraType: types[0] ?? '',
      moves: ['', '', '', ''],
    })
  }

  withItem(item: string): Pokemon { return new Pokemon({ ...this.data, item }) }
  withAbility(ability: string): Pokemon { return new Pokemon({ ...this.data, ability }) }

  withMove(index: number, move: string): Pokemon {
    if (index < 0 || index > 3) return this
    const moves = [...this.data.moves]
    moves[index] = move
    return new Pokemon({ ...this.data, moves })
  }

  withNature(nature: string): Pokemon { return new Pokemon({ ...this.data, nature }) }

  withEV(stat: StatName, value: number): Pokemon {
    const clamped = StatsCalculator.clampEV(stat as string, value, this.data.evs)
    return new Pokemon({ ...this.data, evs: { ...this.data.evs, [stat]: clamped } })
  }

  withIV(stat: StatName, value: number): Pokemon {
    const clamped = Math.max(0, Math.min(31, value))
    return new Pokemon({ ...this.data, ivs: { ...this.data.ivs, [stat]: clamped } })
  }

  withTeraType(type: string): Pokemon { return new Pokemon({ ...this.data, teraType: type }) }

  withLevel(level: number): Pokemon {
    const clamped = Math.max(1, Math.min(100, level))
    return new Pokemon({ ...this.data, level: clamped })
  }

  // === Domain Behavior ===
  resetMoves(): Pokemon { return new Pokemon({ ...this.data, moves: ['', '', '', ''] }) }

  clone(): Pokemon {
    return new Pokemon({
      ...this.data,
      moves: [...this.data.moves],
      evs: { ...this.data.evs },
      ivs: { ...this.data.ivs },
    })
  }

  // === Serialization ===
  toJSON(): PokemonSet {
    return {
      ...this.data,
      moves: [...this.data.moves],
      evs: { ...this.data.evs },
      ivs: { ...this.data.ivs },
    }
  }

  static fromJSON(data: PokemonSet): Pokemon { return new Pokemon(data) }

  static empty(): Pokemon {
    return new Pokemon({
      species: '',
      item: '',
      ability: '',
      moves: ['', '', '', ''],
      nature: 'Serious',
      evs: { hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 0 },
      ivs: { hp: 31, atk: 31, def: 31, spa: 31, spd: 31, spe: 31 },
      teraType: '',
      level: 50,
    })
  }

  // === Static Helpers ===
  static getSpeciesAbilities(species: string): string[] {
    const dex = getPokemon(species)
    if (!dex) return []    
    const abilities = dex.abilities
    if (!abilities) return []
    return Object.values(abilities).filter(Boolean)
  }

  static getSpeciesTypes(species: string): string[] {
    const dex = getPokemon(species)
    if (!dex) return []
    return (dex.types as string[]) || []
  }
}
