import { describe, expect, test } from "vitest"
import {
  BLANK,
  countInversions,
  createSolvedBoard,
  generateSolvableShuffle,
  isSolvable,
  isSolvedBoard,
} from "./puzzle-shuffle"

describe("puzzle-shuffle", () => {
  test("createSolvedBoard returns 1..15 followed by a blank", () => {
    const board = createSolvedBoard()
    expect(board).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, BLANK])
  })

  test("isSolvable returns true for the solved board", () => {
    expect(isSolvable(createSolvedBoard())).toBe(true)
  })

  test("isSolvable returns false for a single tile swap (classic unsolvable case)", () => {
    const board = createSolvedBoard()
    ;[board[0], board[1]] = [board[1], board[0]]
    expect(isSolvable(board)).toBe(false)
  })

  test("countInversions ignores the blank and counts out-of-order pairs", () => {
    expect(countInversions([2, 1, 3, BLANK])).toBe(1)
    expect(countInversions(createSolvedBoard())).toBe(0)
  })

  test("[S5][INV-1] generateSolvableShuffle always returns a solvable board", () => {
    for (let i = 0; i < 200; i++) {
      const board = generateSolvableShuffle()
      expect(isSolvable(board)).toBe(true)
    }
  })

  test("[S5][INV-1] generateSolvableShuffle result differs from the solved board", () => {
    const board = generateSolvableShuffle()
    expect(board).not.toEqual(createSolvedBoard())
  })

  test("[S5][INV-1] generateSolvableShuffle accepts an injected RNG for deterministic tests", () => {
    let calls = 0
    const fixedRandom = () => {
      calls++
      return 0.5
    }
    const board = generateSolvableShuffle(fixedRandom)
    expect(calls).toBeGreaterThan(0)
    expect(isSolvable(board)).toBe(true)
    expect(board.sort((a, b) => a - b)).toEqual(createSolvedBoard().sort((a, b) => a - b))
  })

  test("[S8-2] isSolvedBoard는 정답 배치일 때만 true를 반환한다", () => {
    expect(isSolvedBoard(createSolvedBoard())).toBe(true)
    const shuffled = createSolvedBoard()
    ;[shuffled[0], shuffled[1]] = [shuffled[1], shuffled[0]]
    expect(isSolvedBoard(shuffled)).toBe(false)
  })
})
