import type { PokemonSet } from '@/types'
import { Pokemon } from '@/domain/entities/Pokemon'
import { Team } from '@/domain/entities/Team'
import { importTeamFromShowdown, exportTeamToShowdown } from '@/lib/importExport'

export class TeamService {
  static createEmptyTeam(): Pokemon[] {
    return Array.from({ length: 6 }, () => Pokemon.empty())
  }

  static buildTeam(name: string, format: string, pokemon: Pokemon[]): Team {
    return Team.build(name, format, pokemon)
  }

  static importFromShowdown(text: string): Pokemon[] {
    const sets = importTeamFromShowdown(text)
    return sets.map(s => Pokemon.fromJSON(s))
  }

  static exportToShowdown(pokemon: Pokemon[]): string {
    return exportTeamToShowdown(pokemon.map(p => p.toJSON()))
  }

  static deepClonePokemonSet(p: PokemonSet): PokemonSet {
    return {
      species: p.species,
      item: p.item,
      ability: p.ability,
      moves: [...p.moves],
      nature: p.nature,
      evs: { ...p.evs },
      ivs: { ...p.ivs },
      teraType: p.teraType,
      level: p.level,
    }
  }
}
