export class SearchEngine {
  static score(query: string, target: string): number {
    const q = query.toLowerCase().trim()
    const t = target.toLowerCase()

    if (q === t) return 100
    if (t.startsWith(q)) return 85 - Math.min(q.length * 2, 30)
    if (t.includes(q)) return 70 - Math.min(q.length, 10)
    if (q.includes(t)) return 50 + Math.min(t.length * 3, 20)

    const qWords = q.split(/\s+/)
    let wordScore = 0
    for (const w of qWords) {
      if (t.includes(w)) wordScore += 30
    }
    if (wordScore > 0) return Math.min(wordScore, 55)

    let matches = 0
    for (let i = 0; i < q.length && i < t.length; i++) {
      if (q[i] === t[i]) matches++
    }
    if (matches >= 2) return matches * 3

    return -1
  }

  static filter<T>(
    items: T[],
    query: string,
    getName: (item: T) => string,
  ): { item: T; score: number }[] {
    if (!query.trim()) {
      return items.map(item => ({ item, score: 0 }))
    }
    return items
      .map(item => ({ item, score: SearchEngine.score(query, getName(item)) }))
      .filter(r => r.score > 0)
      .sort((a, b) => b.score - a.score)
  }
}
