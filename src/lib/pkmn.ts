import { Generations } from '@pkmn/data'
import { Dex, toID } from '@pkmn/dex'
import type { VGCFormat } from '@/types'

const gens = new Generations(Dex)

export function getGen(num: number) {
  return gens.get(num)
}

export const GEN9 = getGen(9)

export const VGC_FORMATS: VGCFormat[] = [
  { id: 'gen9championsvgc2026regma', name: 'Champions VGC 2026 Reg M-A', gen: 9, description: 'Pokémon Champions, Reg M-A', smogonId: '' },
  { id: 'gen9vgc2024regg', name: 'VGC 2024 Reg G', gen: 9, description: 'Gen 9, One Restricted, OTS', smogonId: 'gen9vgc2025regg' },
  { id: 'gen9vgc2026regi', name: 'VGC 2026 Reg I', gen: 9, description: 'Gen 9, Two Restricted, OTS', smogonId: 'gen9vgc2025regi' },
  { id: 'gen9vgc2026regf', name: 'VGC 2026 Reg F', gen: 9, description: 'Gen 9, No Restricted, OTS', smogonId: 'gen9vgc2025regf' },
]

export function getAllPokemon(genNum: number = 9) {
  const gen = getGen(genNum)
  const result: { name: string; types: string[]; abilities: string[]; baseStats: Record<string, number>; learnset?: Record<string, string[]> }[] = []
  for (const s of gen.species) {
    if (!s.name || s.name.includes('(') || s.name.includes('-*')) continue
    if (s.isNonstandard === 'CAP') continue
    result.push({
      name: s.name,
      types: (s.types ?? []) as string[],
      abilities: Object.values(s.abilities ?? {}).filter(Boolean) as string[],
      baseStats: s.baseStats as Record<string, number>,
      learnset: (s as { learnset?: Record<string, string[]> }).learnset,
    })
  }
  return result
}

export function getPokemon(name: string, genNum: number = 9) {
  const gen = getGen(genNum)
  return gen.species.get(name)
}

export function getMoves(genNum: number = 9) {
  const gen = getGen(genNum)
  const result: { name: string; type: string; category: string; basePower: number; accuracy: number }[] = []
  for (const m of gen.moves) {
    if (!m.name || m.isNonstandard === 'CAP') continue
    if (!m.exists) continue
    result.push({
      name: m.name,
      type: m.type,
      category: m.category,
      basePower: m.basePower,
      accuracy: typeof m.accuracy === 'number' ? m.accuracy : 100,
    })
  }
  return result
}

export function getMove(name: string, genNum: number = 9) {
  const gen = getGen(genNum)
  return gen.moves.get(name)
}

export function getItems(genNum: number = 9) {
  const gen = getGen(genNum)
  const result: string[] = []
  for (const i of gen.items) {
    if (!i.name || i.isNonstandard === 'CAP') continue
    if (!i.exists) continue
    result.push(i.name)
  }
  return result.sort()
}

export function getItem(name: string, genNum: number = 9) {
  const gen = getGen(genNum)
  return gen.items.get(name)
}

export function getAbilities(genNum: number = 9) {
  const gen = getGen(genNum)
  const result: string[] = []
  for (const a of gen.abilities) {
    if (!a.name || a.isNonstandard === 'CAP') continue
    if (!a.exists) continue
    result.push(a.name)
  }
  return result.sort()
}

export function getAbility(name: string, genNum: number = 9) {
  const gen = getGen(genNum)
  return gen.abilities.get(name)
}

export const NATURES = [
  'Adamant', 'Bashful', 'Bold', 'Brave', 'Calm',
  'Careful', 'Docile', 'Gentle', 'Hardy', 'Hasty',
  'Impish', 'Jolly', 'Lax', 'Lonely', 'Mild',
  'Modest', 'Naive', 'Naughty', 'Quiet', 'Quirky',
  'Rash', 'Relaxed', 'Sassy', 'Serious', 'Timid',
]

export const TYPES = [
  'Normal', 'Fire', 'Water', 'Electric', 'Grass', 'Ice',
  'Fighting', 'Poison', 'Ground', 'Flying', 'Psychic', 'Bug',
  'Rock', 'Ghost', 'Dragon', 'Dark', 'Steel', 'Fairy',
]

export const STAT_NAMES = ['hp', 'atk', 'def', 'spa', 'spd', 'spe'] as const

export type TypeName = typeof TYPES[number]

export const TYPE_CHART: Record<string, Record<string, number>> = {
  Normal: { Rock: 0.5, Ghost: 0, Steel: 0.5 },
  Fire: { Fire: 0.5, Water: 0.5, Grass: 2, Ice: 2, Bug: 2, Rock: 0.5, Dragon: 0.5, Steel: 2 },
  Water: { Fire: 2, Water: 0.5, Grass: 0.5, Ground: 2, Rock: 2, Dragon: 0.5 },
  Electric: { Water: 2, Electric: 0.5, Grass: 0.5, Ground: 0, Flying: 2, Dragon: 0.5 },
  Grass: { Fire: 0.5, Water: 2, Electric: 2, Grass: 0.5, Ice: 0.5, Poison: 0.5, Ground: 2, Flying: 0.5, Bug: 0.5, Rock: 2, Dragon: 0.5, Steel: 0.5 },
  Ice: { Fire: 0.5, Water: 0.5, Grass: 2, Ice: 0.5, Ground: 2, Flying: 2, Dragon: 2, Steel: 0.5 },
  Fighting: { Normal: 2, Ice: 2, Poison: 0.5, Flying: 0.5, Psychic: 0.5, Bug: 0.5, Rock: 2, Ghost: 0, Dark: 2, Steel: 2, Fairy: 0.5 },
  Poison: { Grass: 2, Poison: 0.5, Ground: 0.5, Rock: 0.5, Ghost: 0.5, Steel: 0, Fairy: 2 },
  Ground: { Fire: 2, Electric: 2, Grass: 0.5, Poison: 2, Flying: 0, Bug: 0.5, Rock: 2, Steel: 2 },
  Flying: { Electric: 0.5, Grass: 2, Fighting: 2, Bug: 2, Rock: 0.5, Steel: 0.5 },
  Psychic: { Fighting: 2, Poison: 2, Psychic: 0.5, Dark: 0, Steel: 0.5 },
  Bug: { Fire: 0.5, Grass: 2, Fighting: 0.5, Poison: 0.5, Flying: 0.5, Psychic: 2, Ghost: 0.5, Dark: 2, Steel: 0.5, Fairy: 0.5 },
  Rock: { Fire: 2, Ice: 2, Fighting: 0.5, Ground: 0.5, Flying: 2, Bug: 2, Steel: 0.5 },
  Ghost: { Normal: 0, Psychic: 2, Ghost: 2, Dark: 0.5 },
  Dragon: { Dragon: 2, Steel: 0.5, Fairy: 0 },
  Dark: { Fighting: 0.5, Psychic: 2, Ghost: 2, Dark: 0.5, Fairy: 0.5 },
  Steel: { Fire: 0.5, Water: 0.5, Electric: 0.5, Ice: 2, Rock: 2, Steel: 0.5, Fairy: 2 },
  Fairy: { Fighting: 2, Poison: 0.5, Bug: 0.5, Dragon: 2, Dark: 2, Steel: 0.5 },
}

export function getNatureMultiplier(nature: string, stat: string): number {
  const natures: Record<string, [string, string]> = {
    Adamant: ['atk', 'spa'], Bold: ['def', 'atk'], Brave: ['atk', 'spe'],
    Calm: ['spd', 'atk'], Careful: ['spd', 'spa'], Gentle: ['spd', 'def'],
    Hasty: ['spe', 'def'], Impish: ['def', 'spa'], Jolly: ['spe', 'spa'],
    Lax: ['def', 'spd'], Lonely: ['atk', 'def'], Mild: ['spa', 'def'],
    Modest: ['spa', 'atk'], Naive: ['spe', 'spd'], Naughty: ['atk', 'spd'],
    Quiet: ['spa', 'spe'], Rash: ['spa', 'spd'], Relaxed: ['def', 'spe'],
    Sassy: ['spd', 'spe'], Timid: ['spe', 'atk'],
  }
  const pair = natures[nature]
  if (!pair) return 1
  if (pair[0] === stat) return 1.1
  if (pair[1] === stat) return 0.9
  return 1
}

export function getTypeEffectiveness(attackType: string, defenderTypes: string[]): number {
  let mult = 1
  for (const dt of defenderTypes) {
    const row = TYPE_CHART[attackType]
    if (row && dt in row) {
      mult *= row[dt]
    }
  }
  return mult
}

export async function getLearnableMoveNames(species: string): Promise<string[]> {
  const id = toID(species)
  if (!id) return []

  async function load(idToTry: string): Promise<string[] | null> {
    try {
      const data = await Dex.learnsets.get(idToTry)
      if (data?.learnset && Object.keys(data.learnset).length > 0) {
        return Object.keys(data.learnset)
          .map(m => m.charAt(0).toUpperCase() + m.slice(1))
          .sort()
      }
    } catch {
      // learnset not available for this form
    }
    return null
  }

  const result = await load(id)
  if (result) return result

  const sp = Dex.species.get(species) as { baseSpecies?: string } | undefined
  if (sp?.baseSpecies) {
    const baseId = toID(sp.baseSpecies)
    if (baseId && baseId !== id) {
      const baseResult = await load(baseId)
      if (baseResult) return baseResult
    }
  }

  return []
}

export function getPokemonNum(name: string): number {
  const sp = getPokemon(name)
  return (sp as unknown as Record<string, number>)?.num ?? 0
}

export function getPokemonSpriteUrl(name: string): string {
  const num = getPokemonNum(name)
  if (!num) return ''
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${num}.png`
}

export function getPokemonGen5SpriteUrl(name: string): string {
  const base = name.toLowerCase().replace(/[^a-z0-9]/g, '')
  return `https://play.pokemonshowdown.com/sprites/gen5/${base}.png`
}

export function getPokemonAnimatedSpriteUrl(name: string): string {
  const base = name.toLowerCase().replace(/[^a-z0-9]/g, '')
  return `https://play.pokemonshowdown.com/sprites/ani/${base}.gif`
}

export function sanitizeItemName(name: string): string {
  return name.toLowerCase().replace(/ /g, '-').replace(/[^a-z0-9-]/g, '')
}

export function getItemSpriteUrl(name: string): string {
  const base = sanitizeItemName(name)
  return `https://play.pokemonshowdown.com/sprites/itemicons/${base}.png`
}
