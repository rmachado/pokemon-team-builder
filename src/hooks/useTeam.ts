import { useState, useCallback } from 'react'
import type { PokemonSet, Team } from '../types'
import { loadTeams, saveTeams, loadOpposingTeams, saveOpposingTeams, generateId } from '../lib/storage'

const EMPTY_SET = (): PokemonSet => ({
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

export function emptyTeam(): PokemonSet[] {
  return Array.from({ length: 6 }, () => EMPTY_SET())
}

export function useTeam() {
  const [currentTeam, setCurrentTeam] = useState<PokemonSet[]>(emptyTeam())
  const [savedTeams, setSavedTeams] = useState<Team[]>(() => loadTeams())
  const [opposingTeams, setOpposingTeams] = useState<Team[]>(() => loadOpposingTeams())

  const persistTeams = useCallback((teams: Team[]) => {
    setSavedTeams(teams)
    saveTeams(teams)
  }, [])

  const persistOpposing = useCallback((teams: Team[]) => {
    setOpposingTeams(teams)
    saveOpposingTeams(teams)
  }, [])

  const updatePokemon = useCallback((index: number, pokemon: PokemonSet) => {
    setCurrentTeam(prev => {
      const next = [...prev]
      next[index] = { ...pokemon }
      return next
    })
  }, [])

  const saveCurrentTeam = useCallback((name: string, format: string) => {
    const team: Team = {
      id: generateId(),
      name,
      format,
      pokemon: currentTeam,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }
    const updated = [...savedTeams, team]
    persistTeams(updated)
    return team
  }, [currentTeam, savedTeams, persistTeams])

  const deleteTeam = useCallback((id: string) => {
    persistTeams(savedTeams.filter(t => t.id !== id))
  }, [savedTeams, persistTeams])

  const addOpposingTeam = useCallback((team: Team) => {
    const updated = [...opposingTeams, team]
    persistOpposing(updated)
  }, [opposingTeams, persistOpposing])

  const removeOpposingTeam = useCallback((id: string) => {
    persistOpposing(opposingTeams.filter(t => t.id !== id))
  }, [opposingTeams, persistOpposing])

  const loadTeam = useCallback((team: Team) => {
    setCurrentTeam(team.pokemon.map(p => ({ ...p })))
  }, [])

  const resetTeam = useCallback(() => {
    setCurrentTeam(emptyTeam())
  }, [])

  return {
    currentTeam,
    setCurrentTeam,
    savedTeams,
    opposingTeams,
    updatePokemon,
    saveCurrentTeam,
    deleteTeam,
    addOpposingTeam,
    removeOpposingTeam,
    loadTeam,
    resetTeam,
  }
}
