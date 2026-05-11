import type { MetaPokemonStats } from '@/types'

export class MetaAnalyzer {
  static extractTopMoves(meta: MetaPokemonStats, count: number = 4): string[] {
    return Object.entries(meta.moves)
      .sort((a, b) => b[1] - a[1])
      .slice(0, count)
      .map(([name]) => name)
  }

  static extractTopItem(meta: MetaPokemonStats): string {
    const sorted = Object.entries(meta.items).sort((a, b) => b[1] - a[1])
    return sorted[0]?.[0] || ''
  }

  static extractTopAbility(meta: MetaPokemonStats): string {
    const sorted = Object.entries(meta.abilities).sort((a, b) => b[1] - a[1])
    return sorted[0]?.[0] || ''
  }

  static extractTopTeraType(meta: MetaPokemonStats): string {
    const sorted = Object.entries(meta.teraTypes).sort((a, b) => b[1] - a[1])
    return sorted[0]?.[0] || ''
  }
}
