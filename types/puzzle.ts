export interface PuzzleImage {
  id: string
  name: string
  url: string
  isPreset: boolean
}

export interface RankingEntry {
  playerId: string
  timeMs: number
  recordedAt: number
}
