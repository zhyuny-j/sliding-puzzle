import { afterEach, beforeEach, describe, expect, test, vi } from "vitest"
import { act, renderHook } from "@testing-library/react"
import { usePuzzle } from "./use-puzzle"
import { BLANK, BOARD_SIZE, createSolvedBoard } from "@/lib/puzzle-shuffle"
import type { PuzzleImage } from "@/types/puzzle"

// [S8] 완성 판정을 결정론적으로 테스트하기 위해, 셔플 결과를 "정답에서 한 칸만 어긋난"
// 고정 배치로 대체한다. 실제 solvability 보장 자체는 lib/puzzle-shuffle.test.ts([S5], [INV-1])가 검증한다.
vi.mock("@/lib/puzzle-shuffle", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/puzzle-shuffle")>()
  const solved = actual.createSolvedBoard()
  const almostSolved = [...solved]
  ;[almostSolved[14], almostSolved[15]] = [almostSolved[15], almostSolved[14]]
  return {
    ...actual,
    generateSolvableShuffle: () => [...almostSolved],
  }
})

const image: PuzzleImage = {
  id: "img-1",
  name: "테스트 이미지",
  url: "https://example.com/a.jpg",
  isPreset: true,
}

function getNeighborPositions(position: number): number[] {
  const row = Math.floor(position / BOARD_SIZE)
  const col = position % BOARD_SIZE
  const neighbors: number[] = []
  if (row > 0) neighbors.push(position - BOARD_SIZE)
  if (row < BOARD_SIZE - 1) neighbors.push(position + BOARD_SIZE)
  if (col > 0) neighbors.push(position - 1)
  if (col < BOARD_SIZE - 1) neighbors.push(position + 1)
  return neighbors
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

  test("[S6-1] 빈칸에 인접한 조각을 클릭하면 서로 위치가 바뀐다", () => {
    const { result } = renderHook(() => usePuzzle(image))
    const blankIndex = result.current.board.indexOf(BLANK)
    const [adjacentPosition] = getNeighborPositions(blankIndex)
    const movedValue = result.current.board[adjacentPosition]

    act(() => {
      result.current.moveTile(adjacentPosition)
    })

    expect(result.current.board[blankIndex]).toBe(movedValue)
    expect(result.current.board[adjacentPosition]).toBe(BLANK)
  })

  test("[S7] 빈칸에 인접하지 않은 조각을 클릭하면 배치가 그대로 유지된다", () => {
    const { result } = renderHook(() => usePuzzle(image))
    const blankIndex = result.current.board.indexOf(BLANK)
    const neighbors = new Set(getNeighborPositions(blankIndex))
    const nonAdjacentPosition = Array.from({ length: 16 }, (_, i) => i).find(
      (position) => position !== blankIndex && !neighbors.has(position)
    )!
    const before = [...result.current.board]

    act(() => {
      result.current.moveTile(nonAdjacentPosition)
    })

    expect(result.current.board).toEqual(before)
  })

  test("[S8-2] 퍼즐이 완성되면 isSolved가 true가 되고 경과 시간이 그 순간에 멈춘다", () => {
    const { result } = renderHook(() => usePuzzle(image))
    // 목(mock)된 셔플은 정답에서 15번 조각과 빈칸만 바뀐 상태 -> 15번 위치(15)를 클릭하면 완성된다
    expect(result.current.isSolved).toBe(false)

    act(() => {
      vi.advanceTimersByTime(2000)
    })
    act(() => {
      result.current.moveTile(15)
    })

    expect(result.current.board).toEqual(createSolvedBoard())
    expect(result.current.isSolved).toBe(true)
    const solvedElapsedMs = result.current.elapsedMs

    act(() => {
      vi.advanceTimersByTime(5000)
    })

    expect(result.current.elapsedMs).toBe(solvedElapsedMs)
  })

  test("[S8-4] 완성 후에는 조각을 클릭해도 배치가 바뀌지 않는다", () => {
    const { result } = renderHook(() => usePuzzle(image))

    act(() => {
      result.current.moveTile(15)
    })
    expect(result.current.isSolved).toBe(true)
    const solvedBoard = [...result.current.board]

    act(() => {
      result.current.moveTile(11) // 완성 상태에서 빈칸(15)에 인접한 조각
    })

    expect(result.current.board).toEqual(solvedBoard)
  })

  test("[S11-1][S11-2] 진행 중에 reset을 호출하면 타이머가 0으로 초기화되고 계속 흐른다", () => {
    const { result } = renderHook(() => usePuzzle(image))

    act(() => {
      vi.advanceTimersByTime(4000)
    })
    expect(result.current.elapsedMs).toBe(4000)

    act(() => {
      result.current.reset()
    })
    expect(result.current.elapsedMs).toBe(0)

    act(() => {
      vi.advanceTimersByTime(1000)
    })
    expect(result.current.elapsedMs).toBe(1000)
  })

  test("[S11-1][S11-2][S11-3] 완성된 상태에서 reset을 호출하면 다시 섞이고 조작 가능해진다", () => {
    const { result } = renderHook(() => usePuzzle(image))

    act(() => {
      result.current.moveTile(15)
    })
    expect(result.current.isSolved).toBe(true)

    act(() => {
      result.current.reset()
    })

    expect(result.current.elapsedMs).toBe(0)
    expect(result.current.isSolved).toBe(false)

    act(() => {
      vi.advanceTimersByTime(2000)
    })
    expect(result.current.elapsedMs).toBe(2000)
  })
})
