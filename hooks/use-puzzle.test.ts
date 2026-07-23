import { afterEach, beforeEach, describe, expect, test, vi } from "vitest"
import { act, renderHook } from "@testing-library/react"
import { usePuzzle } from "./use-puzzle"
import { createSolvedBoard } from "@/lib/puzzle-shuffle"
import type { PuzzleImage } from "@/types/puzzle"

const image: PuzzleImage = {
  id: "img-1",
  name: "테스트 이미지",
  url: "https://example.com/a.jpg",
  isPreset: true,
}

describe("usePuzzle", () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  test("[S2-3] 이미지가 선택되면 16칸짜리 보드를, 정답과 다르게 섞어서 만든다", () => {
    const { result } = renderHook(() => usePuzzle(image))
    expect(result.current.board).toHaveLength(16)
    expect(result.current.board).not.toEqual(createSolvedBoard())
  })

  test("[S2-4][INV-4] 이미지가 선택되면 경과 시간이 0부터 매초 증가한다", () => {
    const { result } = renderHook(() => usePuzzle(image))
    expect(result.current.elapsedMs).toBe(0)

    act(() => {
      vi.advanceTimersByTime(3000)
    })

    expect(result.current.elapsedMs).toBe(3000)
  })

  test("이미지가 없으면 보드가 비어 있고 타이머가 흐르지 않는다", () => {
    const { result } = renderHook(() => usePuzzle(null))
    expect(result.current.board).toHaveLength(0)

    act(() => {
      vi.advanceTimersByTime(5000)
    })

    expect(result.current.elapsedMs).toBe(0)
  })

  test("선택된 이미지가 바뀌면 경과 시간이 다시 0부터 시작한다", () => {
    const secondImage: PuzzleImage = { ...image, id: "img-2" }
    const { result, rerender } = renderHook(({ img }) => usePuzzle(img), {
      initialProps: { img: image as PuzzleImage | null },
    })

    act(() => {
      vi.advanceTimersByTime(4000)
    })
    expect(result.current.elapsedMs).toBe(4000)

    rerender({ img: secondImage })
    expect(result.current.elapsedMs).toBe(0)
  })
})
