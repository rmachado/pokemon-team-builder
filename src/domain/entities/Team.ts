import type { Team as TeamData } from '@/types'
import { generateId } from '@/lib/storage'
import { Pokemon } from './Pokemon'

export class Team {
  private readonly data: TeamData

  private constructor(data: TeamData) {
    this.data = data
  }

  get id(): string { return this.data.id }
  get name(): string { return this.data.name }
  get format(): string { return this.data.format }
  get createdAt(): number { return this.data.createdAt }
  get updatedAt(): number { return this.data.updatedAt }
  get pokemonCount(): number { return this.data.pokemon.filter(p => p.species).length }

  pokemonAt(index: number): Pokemon {
    return Pokemon.fromJSON(this.data.pokemon[index])
  }

  allPokemon(): Pokemon[] {
    return this.data.pokemon.map(Pokemon.fromJSON)
  }

  withName(name: string): Team {
    return new Team({ ...this.data, name, updatedAt: Date.now() })
  }

  withPokemonAt(index: number, pokemon: Pokemon): Team {
    const pokemonData = [...this.data.pokemon]
    pokemonData[index] = pokemon.toJSON()
    return new Team({ ...this.data, pokemon: pokemonData, updatedAt: Date.now() })
  }

  withFormat(format: string): Team {
    return new Team({ ...this.data, format })
  }

  toJSON(): TeamData {
    return {
      ...this.data,
      pokemon: this.data.pokemon.map(p => ({
        ...p,
        moves: [...p.moves],
        evs: { ...p.evs },
        ivs: { ...p.ivs },
      })),
    }
  }

  static fromJSON(data: TeamData): Team { return new Team(data) }

  static empty(format: string = ''): Team {
    return new Team({
      id: generateId(),
      name: '',
      format,
      pokemon: Array.from({ length: 6 }, () => Pokemon.empty().toJSON()),
      createdAt: Date.now(),
      updatedAt: Date.now(),
    })
  }

  static build(name: string, format: string, pokemon: Pokemon[]): Team {
    return new Team({
      id: generateId(),
      name,
      format,
      pokemon: pokemon.map(p => p.clone().toJSON()),
      createdAt: Date.now(),
      updatedAt: Date.now(),
    })
  }

  static clone(team: Team): Team {
    return Team.fromJSON(team.toJSON())
  }
}
