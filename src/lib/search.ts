import type { Category, Product } from '@/types'
import { normalize } from './utils'

/** Distância de edição simples para tolerar pequenos erros de digitação. */
function lev(a: string, b: string) {
  if (Math.abs(a.length - b.length) > 2) return 3
  const dp = Array.from({ length: b.length + 1 }, (_, i) => i)
  for (let i = 1; i <= a.length; i++) {
    let prev = dp[0]
    dp[0] = i
    for (let j = 1; j <= b.length; j++) {
      const tmp = dp[j]
      dp[j] = Math.min(dp[j] + 1, dp[j - 1] + 1, prev + (a[i - 1] === b[j - 1] ? 0 : 1))
      prev = tmp
    }
  }
  return dp[b.length]
}

/**
 * Busca inteligente: ignora acentos, considera sinônimos (tags), categoria,
 * descrição e tolera pequenos erros de digitação ("glicemya", "colesterou").
 */
export function searchProducts(products: Product[], categories: Record<string, Category>, query: string) {
  const q = normalize(query)
  if (!q) return products.map((p) => ({ product: p, score: 0 }))
  const tokens = q.split(/\s+/).filter(Boolean)

  return products
    .map((p) => {
      const name = normalize(p.name)
      const words = name.split(/[^a-z0-9]+/).filter(Boolean)
      const tags = p.tags.map(normalize)
      const cat = normalize(categories[p.categoryId]?.name ?? '')
      const desc = normalize(`${p.shortDescription} ${p.includes?.join(' ') ?? ''}`)
      let score = 0
      if (name === q) score += 120
      if (name.startsWith(q)) score += 60
      else if (name.includes(q)) score += 40
      for (const t of tokens) {
        let hit = false
        if (words.some((w) => w.startsWith(t))) (score += 20), (hit = true)
        if (tags.some((tag) => tag.includes(t))) (score += 14), (hit = true)
        if (cat.includes(t)) (score += 8), (hit = true)
        if (desc.includes(t)) (score += 5), (hit = true)
        if (!hit && t.length >= 4) {
          const fuzzy = [...words, ...tags.flatMap((x) => x.split(' '))].some((w) => w.length >= 4 && lev(t, w.slice(0, t.length + 1)) <= 1)
          if (fuzzy) score += 10
          else score -= 30
        } else if (!hit) score -= 30
      }
      return { product: p, score }
    })
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score)
}

/** Destaca o trecho buscado em um texto (para sugestões). */
export function highlightParts(text: string, query: string): { text: string; match: boolean }[] {
  const q = normalize(query)
  if (!q) return [{ text, match: false }]
  const idx = normalize(text).indexOf(q)
  if (idx < 0) return [{ text, match: false }]
  return [
    { text: text.slice(0, idx), match: false },
    { text: text.slice(idx, idx + q.length), match: true },
    { text: text.slice(idx + q.length), match: false },
  ].filter((p) => p.text)
}
