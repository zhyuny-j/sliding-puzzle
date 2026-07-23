import { describe, expect, test } from "vitest"
import { render, screen } from "@testing-library/react"
import { RankingPanel } from "./ranking-panel"
import type { RankingEntry } from "@/types/puzzle"

describe("RankingPanel", () => {
  test("[S1-4] 기록이 없으면 안내 문구가 나타난다", () => {
    render(<RankingPanel imageName={null} rankings={[]} />)
    expect(screen.getByText("아직 기록이 없습니다")).toBeInTheDocument()
  })

  test("[S9-1][S9-2] 기록이 있으면 아이디와 시간이 정렬된 순서로 나타난다", () => {
    const rankings: RankingEntry[] = [
      { playerId: "alice", timeMs: 32_000, recordedAt: 1 },
      { playerId: "bob", timeMs: 41_000, recordedAt: 2 },
    ]
    render(<RankingPanel imageName="산" rankings={rankings} />)

    const items = screen.getAllByRole("listitem")
    expect(items).toHaveLength(2)
    expect(items[0]).toHaveTextContent("alice")
    expect(items[0]).toHaveTextContent("00:32")
    expect(items[1]).toHaveTextContent("bob")
    expect(items[1]).toHaveTextContent("00:41")
  })

  test("[S9-3] 이미지 이름이 제목에 표시된다", () => {
    render(<RankingPanel imageName="산" rankings={[]} />)
    expect(screen.getByText("랭킹 - 산")).toBeInTheDocument()
  })
})
