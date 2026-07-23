import { beforeEach, describe, expect, test } from "vitest"
import { addRanking, getRankings } from "./ranking-storage"
import type { RankingEntry } from "@/types/puzzle"

function entry(playerId: string, timeMs: number): RankingEntry {
  return { playerId, timeMs, recordedAt: timeMs }
}

describe("ranking-storage", () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  test("저장된 기록이 없으면 빈 배열을 반환한다", () => {
    expect(getRankings("img-1")).toEqual([])
  })

  test("[S9-1] addRanking은 새 기록을 추가하고 반환한다", () => {
    const result = addRanking("img-1", entry("alice", 32_000))
    expect(result).toEqual([entry("alice", 32_000)])
    expect(getRankings("img-1")).toEqual([entry("alice", 32_000)])
  })

  test("[S9-2] 여러 기록은 소요 시간 오름차순으로 정렬된다", () => {
    addRanking("img-1", entry("bob", 55_000))
    addRanking("img-1", entry("alice", 32_000))
    const result = addRanking("img-1", entry("carol", 41_000))

    expect(result.map((r) => r.playerId)).toEqual(["alice", "carol", "bob"])
  })

  test("[S9-3] 이미지별로 랭킹이 분리 저장된다", () => {
    addRanking("img-1", entry("alice", 32_000))
    addRanking("img-2", entry("dave", 10_000))

    expect(getRankings("img-1").map((r) => r.playerId)).toEqual(["alice"])
    expect(getRankings("img-2").map((r) => r.playerId)).toEqual(["dave"])
  })

  test("[INV-5] 상위 10개까지만 유지한다", () => {
    for (let i = 0; i < 12; i++) {
      addRanking("img-1", entry(`player${i}`, 100_000 - i * 1000))
    }
    const result = getRankings("img-1")
    expect(result).toHaveLength(10)
    // 시간이 가장 짧은(빠른) 10명만 남아야 한다 -> player11(88_000)~player2(98_000)
    expect(result[0].playerId).toBe("player11")
    expect(result[result.length - 1].timeMs).toBeLessThan(100_000)
  })
})
