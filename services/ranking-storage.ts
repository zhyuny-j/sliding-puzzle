import type { RankingEntry } from "@/types/puzzle"

const STORAGE_PREFIX = "sliding-puzzle:rankings:"
const MAX_RANKING_ENTRIES = 10

function isBrowser(): boolean {
  return typeof window !== "undefined"
}

export function getRankings(imageId: string): RankingEntry[] {
  if (!isBrowser()) return []
  try {
    const raw = window.localStorage.getItem(STORAGE_PREFIX + imageId)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function addRanking(imageId: string, entry: RankingEntry): RankingEntry[] {
  const current = getRankings(imageId)
  const next = [...current, entry]
    .sort((a, b) => a.timeMs - b.timeMs)
    .slice(0, MAX_RANKING_ENTRIES)

  if (isBrowser()) {
    window.localStorage.setItem(STORAGE_PREFIX + imageId, JSON.stringify(next))
  }

  return next
}
