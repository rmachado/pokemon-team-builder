import { create } from 'zustand'
import type { PokemonSet, Team } from '@/types'
import { Pokemon, Team as TeamEntity, draftRepository, TeamService } from '@/domain'
import { loadTeams, saveTeams, loadOpposingTeams, saveOpposingTeams } from '@/lib/storage'

interface TeamState {
  currentTeam: PokemonSet[]
  savedTeams: Team[]
  opposingTeams: Team[]

  updatePokemon: (index: number, pokemon: PokemonSet) => void
  saveCurrentTeam: (name: string, format: string) => void
  deleteTeam: (id: string) => void
  loadTeam: (team: Team) => void
  resetTeam: () => void
  addOpposingTeam: (team: Team) => void
  removeOpposingTeam: (id: string) => void
  importTeam: (pokemon: PokemonSet[]) => void
}

export const useTeamStore = create<TeamState>((set) => ({
  currentTeam: draftRepository.load() ?? TeamService.createEmptyTeam().map(p => p.toJSON()),
  savedTeams: loadTeams(),
  opposingTeams: loadOpposingTeams(),

  updatePokemon: (index, pokemon) =>
    set(state => {
      const next = [...state.currentTeam]
      next[index] = Pokemon.fromJSON(pokemon).clone().toJSON()
      draftRepository.save(next)
      return { currentTeam: next }
    }),

  saveCurrentTeam: (name, format) =>
    set(state => {
      const team = TeamService.buildTeam(name, format, state.currentTeam.map(p => Pokemon.fromJSON(p)))
      const updated = [...state.savedTeams, team.toJSON()]
      saveTeams(updated)
      draftRepository.clear()
      return { savedTeams: updated }
    }),

  deleteTeam: id =>
    set(state => {
      const updated = state.savedTeams.filter(t => t.id !== id)
      saveTeams(updated)
      return { savedTeams: updated }
    }),

  loadTeam: team =>
    set(() => {
      const next = team.pokemon.map(p => Pokemon.fromJSON(p).clone().toJSON())
      draftRepository.save(next)
      return { currentTeam: next }
    }),

  resetTeam: () =>
    set(() => {
      const empty = TeamService.createEmptyTeam().map(p => p.toJSON())
      draftRepository.clear()
      return { currentTeam: empty }
    }),

  addOpposingTeam: team =>
    set(state => {
      const updated = [...state.opposingTeams, TeamEntity.clone(TeamEntity.fromJSON(team)).toJSON()]
      saveOpposingTeams(updated)
      return { opposingTeams: updated }
    }),

  removeOpposingTeam: id =>
    set(state => {
      const updated = state.opposingTeams.filter(t => t.id !== id)
      saveOpposingTeams(updated)
      return { opposingTeams: updated }
    }),

  importTeam: pokemon =>
    set(() => {
      const padded = [...pokemon.map(p => Pokemon.fromJSON(p).toJSON()), ...TeamService.createEmptyTeam().map(p => p.toJSON())].slice(0, 6)
      draftRepository.save(padded)
      return { currentTeam: padded }
    }),
}))
