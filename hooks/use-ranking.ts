"use client"

import * as React from "react"

import { addRanking, getRankings } from "@/services/ranking-storage"
import type { RankingEntry } from "@/types/puzzle"

export interface UseRankingResult {
  rankings: RankingEntry[]
  submitRanking: (playerId: string, timeMs: number) => void
}

export function useRanking(imageId: string | null): UseRankingResult {
  const [rankings, setRankings] = React.useState<RankingEntry[]>([])

  React.useEffect(() => {
    setRankings(imageId ? getRankings(imageId) : [])
  }, [imageId])

  const submitRanking = React.useCallback(
    (playerId: string, timeMs: number) => {
      if (!imageId) return
      const entry: RankingEntry = { playerId, timeMs, recordedAt: Date.now() }
      setRankings(addRanking(imageId, entry))
    },
    [imageId]
  )

  return { rankings, submitRanking }
}
