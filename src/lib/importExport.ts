import { Team as PkmnTeam } from '@pkmn/sets'
import type { PokemonSet } from '../types'

export function importTeamFromShowdown(text: string): PokemonSet[] {
  const parsed = PkmnTeam.import(text)
  if (!parsed || !parsed.team || !Array.isArray(parsed.team)) {
    throw new Error('Failed to parse team: invalid format')
  }

  return parsed.team.map((s) => {
    const sAny = s as Record<string, unknown>
    const moves = (sAny.moves as string[] | undefined) || []
    const evsObj = sAny.evs as Record<string, number> | undefined
    const ivsObj = sAny.ivs as Record<string, number> | undefined

    return {
      species: (sAny.species as string) || (sAny.name as string) || '',
      item: (sAny.item as string) || '',
      ability: (sAny.ability as string) || '',
      moves: moves.length >= 4 ? moves.slice(0, 4) : [...moves, '', '', ''].slice(0, 4),
      nature: (sAny.nature as string) || 'Serious',
      evs: {
        hp: evsObj?.hp ?? 0,
        atk: evsObj?.atk ?? 0,
        def: evsObj?.def ?? 0,
        spa: evsObj?.spa ?? 0,
        spd: evsObj?.spd ?? 0,
        spe: evsObj?.spe ?? 0,
      },
      ivs: {
        hp: ivsObj?.hp ?? 31,
        atk: ivsObj?.atk ?? 31,
        def: ivsObj?.def ?? 31,
        spa: ivsObj?.spa ?? 31,
        spd: ivsObj?.spd ?? 31,
        spe: ivsObj?.spe ?? 31,
      },
      teraType: (sAny.teraType as string) || '',
      level: (sAny.level as number) || 50,
    }
  })
}

export interface ExportOptions {
  name?: string
  format?: string
}

export function exportTeamToShowdown(pokemon: PokemonSet[], options?: ExportOptions): string {
  const lines: string[] = []

  if (options?.name) {
    lines.push(`=== ${options.name} ===`)
  }

  for (const p of pokemon) {
    if (!p.species) continue

    const itemStr = p.item ? ` @ ${p.item}` : ''
    lines.push('')
    lines.push(`${p.species}${itemStr}`)

    if (p.ability) lines.push(`Ability: ${p.ability}`)
    if (p.level && p.level !== 50) lines.push(`Level: ${p.level}`)
    if (p.teraType) lines.push(`Tera Type: ${p.teraType}`)

    const evStr = ['hp', 'atk', 'def', 'spa', 'spd', 'spe']
      .filter(s => p.evs[s] > 0)
      .map(s => `${p.evs[s]} ${s === 'spa' ? 'SpA' : s === 'spd' ? 'SpD' : s.charAt(0).toUpperCase() + s.slice(1)}`)
      .join(' / ')
    if (evStr) lines.push(`EVs: ${evStr}`)

    if (p.nature && p.nature !== 'Serious') lines.push(`${p.nature} Nature`)

    const ivStr = ['hp', 'atk', 'def', 'spa', 'spd', 'spe']
      .filter(s => p.ivs[s] !== 31)
      .map(s => `${p.ivs[s]} ${s === 'spa' ? 'SpA' : s === 'spd' ? 'SpD' : s.charAt(0).toUpperCase() + s.slice(1)}`)
      .join(' / ')
    if (ivStr) lines.push(`IVs: ${ivStr}`)

    for (const move of p.moves) {
      if (move) lines.push(`- ${move}`)
    }
  }

  return lines.join('\n').trim()
}

export function parseTeamFromShowdown(text: string, format: string, name?: string) {
  const pokemon = importTeamFromShowdown(text)
  return {
    id: crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(36) + Math.random().toString(36).slice(2, 8),
    name: name || 'Imported Team',
    format,
    pokemon,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  }
}
