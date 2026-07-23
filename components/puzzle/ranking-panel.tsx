import { formatElapsedTime } from "@/lib/format-time"
import type { RankingEntry } from "@/types/puzzle"

export interface RankingPanelProps {
  imageName: string | null
  rankings: RankingEntry[]
}

export function RankingPanel({ imageName, rankings }: RankingPanelProps) {
  return (
    <div>
      <h2 className="mb-2 text-sm font-bold">랭킹{imageName ? ` - ${imageName}` : ""}</h2>
      {rankings.length === 0 ? (
        <p className="text-sm text-muted-foreground">아직 기록이 없습니다</p>
      ) : (
        <ol className="flex flex-col gap-1 text-sm">
          {rankings.map((entry, index) => (
            <li key={`${entry.playerId}-${entry.recordedAt}`} className="flex justify-between">
              <span>
                {index + 1}. {entry.playerId}
              </span>
              <span>{formatElapsedTime(entry.timeMs)}</span>
            </li>
          ))}
        </ol>
      )}
    </div>
  )
}
