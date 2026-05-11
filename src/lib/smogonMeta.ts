import type { MetaPokemonStats } from '@/types'

const SMOGON_STATS_BASE = 'https://www.smogon.com/stats'

interface SmogonMonEntry {
  rank: number
  species: string
  usage: number
  moves: Record<string, number>
  items: Record<string, number>
  abilities: Record<string, number>
  spreads: Record<string, number>
  teammates: Record<string, number>
  teraTypes: Record<string, number>
}

async function fetchSmogonData(format: string, month: string, elo: string = '1760'): Promise<string> {
  const url = `${SMOGON_STATS_BASE}/${month}/moveset/${format}-${elo}.txt`
  const resp = await fetch(url)
  if (!resp.ok) throw new Error(`Failed to fetch Smogon data: ${resp.status}`)
  return resp.text()
}

function parseSmogonMoveset(raw: string): SmogonMonEntry[] {
  const entries: SmogonMonEntry[] = []
  const blocks = raw.split(/\n\n+/)

  for (const block of blocks) {
    const lines = block.trim().split('\n')
    if (lines.length < 5) continue

    const header = lines[0].trim()
    const match = header.match(/^\s*\|\s*(\d+)\s+\|\s+([^|]+)\s+\|\s+([\d.]+)%/)
    if (!match) continue

    const species = match[2].trim()
    const usage = parseFloat(match[3])

    const moves: Record<string, number> = {}
    const items: Record<string, number> = {}
    const abilities: Record<string, number> = {}
    const spreads: Record<string, number> = {}
    const teammates: Record<string, number> = {}
    const teraTypes: Record<string, number> = {}

    let section: string | null = null
    for (const line of lines.slice(1)) {
      const trimmed = line.trim()
      if (!trimmed) continue

      if (trimmed.startsWith('| Moves')) { section = 'moves'; continue }
      if (trimmed.startsWith('| Items')) { section = 'items'; continue }
      if (trimmed.startsWith('| Abilities')) { section = 'abilities'; continue }
      if (trimmed.startsWith('| Spreads')) { section = 'spreads'; continue }
      if (trimmed.startsWith('| Teammates')) { section = 'teammates'; continue }
      if (trimmed.startsWith('| Terastallization')) { section = 'teraTypes'; continue }

      if (!trimmed.startsWith('|')) continue

      const parts = trimmed.split('|').filter(Boolean)
      if (parts.length < 2) continue

      const target = section
      const name = parts[0].trim()
      const pctStr = parts[parts.length - 2]?.trim()?.replace('%', '') || '0'
      const pct = parseFloat(pctStr)

      if (!name || isNaN(pct)) continue

      switch (target) {
        case 'moves': moves[name] = pct; break
        case 'items': items[name] = pct; break
        case 'abilities': abilities[name] = pct; break
        case 'spreads': spreads[name] = pct; break
        case 'teammates': teammates[name] = pct; break
        case 'teraTypes': teraTypes[name] = pct; break
      }
    }

    entries.push({
      rank: parseInt(match[1]),
      species,
      usage,
      moves,
      items,
      abilities,
      spreads,
      teammates,
      teraTypes,
    })
  }

  return entries
}

export async function fetchMetaStats(format: string): Promise<MetaPokemonStats[]> {
  const now = new Date()
  const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  const previousMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  const prevMonthStr = `${previousMonth.getFullYear()}-${String(previousMonth.getMonth() + 1).padStart(2, '0')}`

  let raw: string
  try {
    raw = await fetchSmogonData(format, month)
  } catch {
    try {
      raw = await fetchSmogonData(format, prevMonthStr)
    } catch {
      return getFallbackMeta()
    }
  }

  const entries = parseSmogonMoveset(raw)

  return entries.map(e => ({
    species: e.species,
    usage: e.usage,
    moves: e.moves,
    items: e.items,
    abilities: e.abilities,
    natures: {},
    teraTypes: e.teraTypes,
    evs: e.spreads,
    teammates: e.teammates,
  }))
}

function getFallbackMeta(): MetaPokemonStats[] {
  const topMons = [
    'Incineroar', 'Rillaboom', 'Urshifu', 'Tornadus', 'Landorus',
    'Ogerpon', 'Flutter Mane', 'Amoonguss', 'Gholdengo', 'Dragonite',
    'Sneasler', 'Chien-Pao', 'Chi-Yu', 'Heatran', 'Pelipper',
  ]

  return topMons.map(species => ({
    species,
    usage: 0,
    moves: {},
    items: {},
    abilities: {},
    natures: {},
    teraTypes: {},
    evs: {},
    teammates: {},
  }))
}
