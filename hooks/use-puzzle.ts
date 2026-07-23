"use client"

import * as React from "react"

import { BLANK, BOARD_SIZE, generateSolvableShuffle, isSolvedBoard } from "@/lib/puzzle-shuffle"
import type { PuzzleImage } from "@/types/puzzle"

export interface UsePuzzleResult {
  board: number[]
  elapsedMs: number
  moveTile: (position: number) => void
  isSolved: boolean
  reset: () => void
}

function isAdjacent(a: number, b: number): boolean {
  const rowA = Math.floor(a / BOARD_SIZE)
  const colA = a % BOARD_SIZE
  const rowB = Math.floor(b / BOARD_SIZE)
  const colB = b % BOARD_SIZE
  return (
    (rowA === rowB && Math.abs(colA - colB) === 1) ||
    (colA === colB && Math.abs(rowA - rowB) === 1)
  )
}

export function usePuzzle(image: PuzzleImage | null): UsePuzzleResult {
  const [board, setBoard] = React.useState<number[]>(() =>
    image ? generateSolvableShuffle() : []
  )
  const [elapsedMs, setElapsedMs] = React.useState(0)
  const startedAtRef = React.useRef(0)
  const isSolved = board.length > 0 && isSolvedBoard(board)

  React.useEffect(() => {
    if (!image) {
      setBoard([])
      setElapsedMs(0)
    } else {
      setBoard(generateSolvableShuffle())
      setElapsedMs(0)
      startedAtRef.current = Date.now()
    }
  }, [image?.id])

  React.useEffect(() => {
    if (!image || isSolved) return

    const intervalId = setInterval(() => {
      setElapsedMs(Date.now() - startedAtRef.current)
    }, 1000)

    return () => clearInterval(intervalId)
  }, [image?.id, isSolved])

  const moveTile = React.useCallback((position: number) => {
    setBoard((prev) => {
      if (isSolvedBoard(prev)) return prev
      const blankIndex = prev.indexOf(BLANK)
      if (!isAdjacent(position, blankIndex)) return prev
      const next = [...prev]
      ;[next[position], next[blankIndex]] = [next[blankIndex], next[position]]
      return next
    })
  }, [])

  const reset = React.useCallback(() => {
    if (!image) return
    setBoard(generateSolvableShuffle())
    setElapsedMs(0)
    startedAtRef.current = Date.now()
  }, [image])

  return { board, elapsedMs, moveTile, isSolved, reset }
}
