import { getAllPokemon } from './pkmn'
import { SearchEngine } from '@/domain'
import type { SearchMatch } from '@/types'

const GEN_NUM = 9

type MatchKind = 'name' | 'type' | 'move' | 'ability'
const KIND_ORDER: MatchKind[] = ['name', 'type', 'move', 'ability']

interface SpeciesData {
  name: string
  types: string[]
  abilities: string[]
  learnset?: Record<string, string[]>
}

interface SearchIndex {
  byName: Map<string, SpeciesData>
  byType: Map<string, SpeciesData[]>
  byAbility: Map<string, SpeciesData[]>
  byMove: Map<string, SpeciesData[]>
  allSpecies: SpeciesData[]
}

let cachedIndex: SearchIndex | null = null

function getLearnset(d: SpeciesData): Record<string, string[]> | undefined {
  return d.learnset
}

export function buildSearchIndex(genNum: number = GEN_NUM): SearchIndex {
  if (cachedIndex) return cachedIndex

  const allPokemon = getAllPokemon(genNum)
  const speciesList: SpeciesData[] = allPokemon.map(p => ({
    name: p.name,
    types: p.types,
    abilities: p.abilities,
    learnset: p.learnset,
  }))

  const byName = new Map<string, SpeciesData>()
  const byType = new Map<string, SpeciesData[]>()
  const byAbility = new Map<string, SpeciesData[]>()
  const byMove = new Map<string, SpeciesData[]>()

  for (const sp of speciesList) {
    byName.set(sp.name.toLowerCase(), sp)

    for (const t of sp.types) {
      const k = t.toLowerCase()
      if (!byType.has(k)) byType.set(k, [])
      byType.get(k)!.push(sp)
    }

    for (const a of sp.abilities) {
      const k = a.toLowerCase()
      if (!byAbility.has(k)) byAbility.set(k, [])
      byAbility.get(k)!.push(sp)
    }

    const ls = getLearnset(sp)
    if (ls) {
      for (const moveId of Object.keys(ls)) {
        const moveName = moveId.charAt(0).toUpperCase() + moveId.slice(1)
        const k = moveName.toLowerCase()
        if (!byMove.has(k)) byMove.set(k, [])
        byMove.get(k)!.push(sp)
      }
    }
  }

  cachedIndex = { byName, byType, byAbility, byMove, allSpecies: speciesList }
  return cachedIndex
}

export function clearSearchCache() {
  cachedIndex = null
}

function collectMatches(query: string, index: SearchIndex): { species: string; kind: MatchKind; matchDetail: string; score: number }[] {
  const results: { species: string; kind: MatchKind; matchDetail: string; score: number }[] = []
  const q = query.toLowerCase().trim()
  if (!q) return results

  for (const [, sp] of index.byName) {
    const score = SearchEngine.score(query, sp.name)
    if (score > 0) {
      results.push({ species: sp.name, kind: 'name' as MatchKind, matchDetail: sp.name, score })
    }
  }

  for (const [typeName, species] of index.byType) {
    const score = SearchEngine.score(query, typeName)
    if (score > 0) {
      for (const sp of species) {
        results.push({ species: sp.name, kind: 'type' as MatchKind, matchDetail: typeName, score: score - 5 })
      }
    }
  }

  for (const [abilityName, species] of index.byAbility) {
    const score = SearchEngine.score(query, abilityName)
    if (score > 0) {
      for (const sp of species) {
        results.push({ species: sp.name, kind: 'ability' as MatchKind, matchDetail: abilityName, score: score - 10 })
      }
    }
  }

  for (const [moveName, species] of index.byMove) {
    const score = SearchEngine.score(query, moveName)
    if (score > 0) {
      for (const sp of species) {
        results.push({ species: sp.name, kind: 'move' as MatchKind, matchDetail: moveName, score: score - 7 })
      }
    }
  }

  return results
}

export function searchPokemon(query: string, genNum: number = GEN_NUM): SearchMatch[] {
  if (!query.trim()) return []

  const index = buildSearchIndex(genNum)
  const raw = collectMatches(query, index)
  const deduped = new Map<string, SearchMatch>()

  for (const r of raw) {
    const existing = deduped.get(r.species)
    if (existing) {
      const existingKind = KIND_ORDER.indexOf(existing.kind)
      const newKind = KIND_ORDER.indexOf(r.kind)
      if (newKind < existingKind || (newKind === existingKind && r.score > existing.score)) {
        deduped.set(r.species, {
          species: r.species,
          kind: r.kind,
          matchDetail: r.matchDetail,
          types: [],
          abilities: [],
          score: r.score,
        })
      }
    } else {
      deduped.set(r.species, {
        species: r.species,
        kind: r.kind,
        matchDetail: r.matchDetail,
        types: [],
        abilities: [],
        score: r.score,
      })
    }
  }

  const sorted = Array.from(deduped.values()).sort((a, b) => {
    const ki = KIND_ORDER.indexOf(a.kind) - KIND_ORDER.indexOf(b.kind)
    if (ki !== 0) return ki
    return b.score - a.score
  })

  for (const r of sorted) {
    const sp = index.byName.get(r.species.toLowerCase())
    if (sp) {
      r.types = sp.types
      r.abilities = sp.abilities
    }
  }

  return sorted.slice(0, 40)
}
