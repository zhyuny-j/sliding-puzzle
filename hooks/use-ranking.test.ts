import { beforeEach, describe, expect, test } from "vitest"
import { act, renderHook } from "@testing-library/react"
import { useRanking } from "./use-ranking"

describe("useRanking", () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  test("기록이 없으면 빈 목록을 반환한다", () => {
    const { result } = renderHook(() => useRanking("img-1"))
    expect(result.current.rankings).toEqual([])
  })

  test("[S9-1] submitRanking을 호출하면 목록에 반영된다", () => {
    const { result } = renderHook(() => useRanking("img-1"))

    act(() => {
      result.current.submitRanking("player1", 47_000)
    })

    expect(result.current.rankings).toHaveLength(1)
    expect(result.current.rankings[0].playerId).toBe("player1")
    expect(result.current.rankings[0].timeMs).toBe(47_000)
  })

  test("[S9-2] 여러 기록이 소요 시간 오름차순으로 반영된다", () => {
    const { result } = renderHook(() => useRanking("img-1"))

    act(() => {
      result.current.submitRanking("bob", 55_000)
    })
    act(() => {
      result.current.submitRanking("alice", 32_000)
    })

    expect(result.current.rankings.map((r) => r.playerId)).toEqual(["alice", "bob"])
  })

  test("[S9-3] 이미지 id가 바뀌면 그 이미지의 랭킹만 보여준다", () => {
    const { result, rerender } = renderHook(({ id }) => useRanking(id), {
      initialProps: { id: "img-1" },
    })

    act(() => {
      result.current.submitRanking("alice", 32_000)
    })

    rerender({ id: "img-2" })
    expect(result.current.rankings).toEqual([])
  })
})
