import { describe, expect, test } from "vitest"
import { render, screen } from "@testing-library/react"
import { PuzzleApp } from "./puzzle-app"
import { PRESET_IMAGES } from "@/config/puzzle-presets"

describe("PuzzleApp", () => {
  test("[S1-1] 화면 상단에 타이틀이 표시된다", () => {
    render(<PuzzleApp />)
    expect(
      screen.getByRole("heading", { name: "내가 원하는 사진으로 퍼즐 만들기" })
    ).toBeInTheDocument()
  })

  test("[S1-2] 왼쪽 패널에 기본 프리셋 이미지 목록이 표시된다", () => {
    render(<PuzzleApp />)
    for (const image of PRESET_IMAGES) {
      expect(screen.getByRole("button", { name: image.name })).toBeInTheDocument()
    }
  })

  test("[S1-3] 가운데 패널에는 이미지 선택 안내가 표시된다", () => {
    render(<PuzzleApp />)
    expect(screen.getByText("이미지를 선택해주세요")).toBeInTheDocument()
  })

  test("[S1-4] 오른쪽 랭킹 패널에는 기록 없음 안내가 표시된다", () => {
    render(<PuzzleApp />)
    expect(screen.getByText("아직 기록이 없습니다")).toBeInTheDocument()
  })
})
