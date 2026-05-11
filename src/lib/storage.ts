import type { Team } from '@/types'

const STORAGE_KEY_TEAMS = 'vgc_teams'
const STORAGE_KEY_OPPOSING = 'vgc_opposing_teams'
const STORAGE_KEY_FORMAT = 'vgc_current_format'

function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

function save<T>(key: string, data: T) {
  try {
    localStorage.setItem(key, JSON.stringify(data))
  } catch {
    console.warn('Failed to save to localStorage')
  }
}

export function loadTeams(): Team[] {
  return load<Team[]>(STORAGE_KEY_TEAMS, [])
}

export function saveTeams(teams: Team[]) {
  save(STORAGE_KEY_TEAMS, teams)
}

export function loadOpposingTeams(): Team[] {
  return load<Team[]>(STORAGE_KEY_OPPOSING, [])
}

export function saveOpposingTeams(teams: Team[]) {
  save(STORAGE_KEY_OPPOSING, teams)
}

export function loadFormat(): string | null {
  return load<string | null>(STORAGE_KEY_FORMAT, null)
}

export function saveFormat(format: string) {
  save(STORAGE_KEY_FORMAT, format)
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
}
