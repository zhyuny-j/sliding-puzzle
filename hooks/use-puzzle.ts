"use client"

import * as React from "react"

import { generateSolvableShuffle } from "@/lib/puzzle-shuffle"
import type { PuzzleImage } from "@/types/puzzle"

export interface UsePuzzleResult {
  board: number[]
  elapsedMs: number
}

export function usePuzzle(image: PuzzleImage | null): UsePuzzleResult {
  const [board, setBoard] = React.useState<number[]>(() =>
    image ? generateSolvableShuffle() : []
  )
  const [elapsedMs, setElapsedMs] = React.useState(0)

  React.useEffect(() => {
    if (!image) {
      setBoard([])
      setElapsedMs(0)
      return
    }

    setBoard(generateSolvableShuffle())
    setElapsedMs(0)

    const intervalId = setInterval(() => {
      setElapsedMs((prev) => prev + 1000)
    }, 1000)

    return () => clearInterval(intervalId)
  }, [image?.id])

  return { board, elapsedMs }
}
