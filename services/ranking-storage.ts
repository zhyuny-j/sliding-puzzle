import { isBrowser } from "@/lib/is-browser"
import type { RankingEntry } from "@/types/puzzle"

const STORAGE_PREFIX = "sliding-puzzle:rankings:"
const MAX_RANKING_ENTRIES = 10

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
    try {
      window.localStorage.setItem(STORAGE_PREFIX + imageId, JSON.stringify(next))
    } catch {
      // localStorage 쓰기 실패(용량 초과, 프라이빗 브라우징 등)해도 화면에는 정렬된 랭킹을 보여준다
    }
  }

  return next
}
