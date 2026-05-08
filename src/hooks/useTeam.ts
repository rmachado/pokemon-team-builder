import { useState, useCallback, useEffect, useRef } from 'react'
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

const DRAFT_KEY = 'vgc_draft_team'

export function emptyTeam(): PokemonSet[] {
  return Array.from({ length: 6 }, () => EMPTY_SET())
}

function loadDraft(): PokemonSet[] | null {
  try {
    const raw = localStorage.getItem(DRAFT_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return null
    return parsed.map((p: Record<string, unknown>): PokemonSet => ({
      species: (p.species as string) ?? '',
      item: (p.item as string) ?? '',
      ability: (p.ability as string) ?? '',
      moves: Array.isArray(p.moves) ? [...(p.moves as string[]), '', '', '', ''].slice(0, 4) : ['', '', '', ''],
      nature: (p.nature as string) ?? 'Serious',
      evs: { hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 0, ...((p.evs ?? {}) as Record<string, number>) },
      ivs: { hp: 31, atk: 31, def: 31, spa: 31, spd: 31, spe: 31, ...((p.ivs ?? {}) as Record<string, number>) },
      teraType: (p.teraType as string) ?? '',
      level: (p.level as number) ?? 50,
    }))
  } catch {
    return null
  }
}

function saveDraft(team: PokemonSet[]) {
  try {
    localStorage.setItem(DRAFT_KEY, JSON.stringify(team))
  } catch {}
}

function clearDraft() {
  try {
    localStorage.removeItem(DRAFT_KEY)
  } catch {}
}

export function useTeam() {
  const [currentTeam, setCurrentTeam] = useState<PokemonSet[]>(() => loadDraft() ?? emptyTeam())
  const [savedTeams, setSavedTeams] = useState<Team[]>(() => loadTeams())
  const [opposingTeams, setOpposingTeams] = useState<Team[]>(() => loadOpposingTeams())
  const isInitialMount = useRef(true)

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
    clearDraft()
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
    clearDraft()
  }, [])

  const resetTeam = useCallback(() => {
    setCurrentTeam(emptyTeam())
    clearDraft()
  }, [])

  // Persist draft whenever the team changes
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false
      return
    }
    saveDraft(currentTeam)
  }, [currentTeam])

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
