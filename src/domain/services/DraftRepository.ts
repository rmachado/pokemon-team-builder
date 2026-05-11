import type { PokemonSet } from '@/types'

const DRAFT_KEY = 'vgc_draft_team'

export class DraftRepository {
  load(): PokemonSet[] | null {
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
      // localStorage access failed (e.g., private mode)
      return null
    }
  }

  save(team: PokemonSet[]) {
    try {
      localStorage.setItem(DRAFT_KEY, JSON.stringify(team))
    } catch {
      // localStorage quota exceeded or access denied
    }
  }

  clear() {
    try {
      localStorage.removeItem(DRAFT_KEY)
    } catch {
      // localStorage access denied
    }
  }
}

export const draftRepository = new DraftRepository()
