import { getAllPokemon } from './pkmn'
import type { SearchMatch } from '../types'

const GEN_NUM = 9

export interface SearchIndex {
  byName: Map<string, string>
  byType: Map<string, string[]>
  byAbility: Map<string, string[]>
  byMove: Map<string, string[]> | null
  speciesList: { name: string; types: string[]; abilities: string[] }[]
}

let cachedIndex: SearchIndex | null = null

export function buildSearchIndex(genNum: number = GEN_NUM): SearchIndex {
  if (cachedIndex) return cachedIndex

  const allPokemon = getAllPokemon(genNum)
  const byName = new Map<string, string>()
  const byType = new Map<string, string[]>()
  const byAbility = new Map<string, string[]>()
  const byMove: Map<string, string[]> | null = null

  for (const pkm of allPokemon) {
    const lower = pkm.name.toLowerCase()
    byName.set(lower, pkm.name)

    for (const t of pkm.types) {
      const key = t.toLowerCase()
      if (!byType.has(key)) byType.set(key, [])
      byType.get(key)!.push(pkm.name)
    }

    for (const a of pkm.abilities) {
      const key = a.toLowerCase()
      if (!byAbility.has(key)) byAbility.set(key, [])
      byAbility.get(key)!.push(pkm.name)
    }
  }

  cachedIndex = { byName, byType, byAbility, byMove, speciesList: allPokemon }
  return cachedIndex
}

export function clearSearchCache() {
  cachedIndex = null
}

export function searchPokemon(query: string, genNum: number = GEN_NUM): SearchMatch[] {
  if (!query.trim()) return []

  const index = buildSearchIndex(genNum)
  const tokens = query.toLowerCase().split(/[,+ ]+/).filter(Boolean)
  const results = new Map<string, SearchMatch>()

  for (const token of tokens) {
    if (token.startsWith('@')) {
      const abilityName = token.slice(1)
      const mons = index.byAbility.get(abilityName)
      if (mons) {
        for (const m of mons) {
          if (!results.has(m)) {
            results.set(m, { species: m, reason: `Ability: ${abilityName}`, types: [], abilities: [] })
          }
        }
      }
      continue
    }

    if (token.startsWith(':')) {
      const typeName = token.slice(1)
      const mons = index.byType.get(typeName)
      if (mons) {
        for (const m of mons) {
          if (!results.has(m)) {
            results.set(m, { species: m, reason: `Type: ${typeName}`, types: [], abilities: [] })
          }
        }
      }
      continue
    }

    const typeMatch = index.byType.get(token)
    if (typeMatch) {
      for (const m of typeMatch) {
        const existing = results.get(m)
        if (existing) {
          existing.reason = existing.reason.replace(/^Type: /, '')
          existing.reason = 'Type match'
        } else {
          results.set(m, { species: m, reason: 'Type match', types: [], abilities: [] })
        }
      }
    }

    const nameMatches: string[] = []
    for (const [lowerName, realName] of index.byName) {
      if (lowerName.includes(token) || token.includes(lowerName)) {
        nameMatches.push(realName)
      }
    }
    for (const m of nameMatches) {
      const existing = results.get(m)
      if (existing) {
        existing.reason = existing.reason === 'Type match' ? 'Name + Type match' : 'Name match'
      } else {
        results.set(m, { species: m, reason: 'Name match', types: [], abilities: [] })
      }
    }
  }

  const sorted = Array.from(results.values())
  const priority = ['Name match', 'Name + Type match', 'Type match', 'Ability']
  sorted.sort((a, b) => {
    const ai = priority.indexOf(a.reason)
    const bi = priority.indexOf(b.reason)
    return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi)
  })

  for (const r of sorted) {
    const pkm = index.speciesList.find(p => p.name === r.species)
    if (pkm) {
      r.types = pkm.types
      r.abilities = pkm.abilities
    }
  }

  return sorted.slice(0, 40)
}
