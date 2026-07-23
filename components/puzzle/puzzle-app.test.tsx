import { afterEach, beforeEach, describe, expect, test, vi } from "vitest"
import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { PuzzleApp } from "./puzzle-app"
import { PRESET_IMAGES } from "@/config/puzzle-presets"

class FakeImage {
  onload: (() => void) | null = null
  onerror: (() => void) | null = null
  private _src = ""

  set src(value: string) {
    this._src = value
    queueMicrotask(() => this.onload?.())
  }

  get src() {
    return this._src
  }
}

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

  test("[S2-1] 프리셋 이미지를 클릭하면 가운데 패널에 4X4 퍼즐이 나타난다", async () => {
    const user = userEvent.setup()
    render(<PuzzleApp />)

    await user.click(screen.getByRole("button", { name: PRESET_IMAGES[0].name }))

    expect(screen.queryByText("이미지를 선택해주세요")).not.toBeInTheDocument()
    for (let position = 0; position < 16; position++) {
      expect(screen.getByTestId(`tile-${position}`)).toBeInTheDocument()
    }
  })

  test("[S12-1] 진행 중 다른 이미지를 클릭하면 확인 다이얼로그가 나타난다", async () => {
    const user = userEvent.setup()
    render(<PuzzleApp />)

    await user.click(screen.getByRole("button", { name: PRESET_IMAGES[0].name }))
    await user.click(screen.getByRole("button", { name: PRESET_IMAGES[1].name }))

    expect(
      screen.getByText("진행 중인 퍼즐을 포기하고 전환하시겠습니까?")
    ).toBeInTheDocument()
  })

  test("[S12-2] 확인을 선택하면 새 이미지로 전환된다", async () => {
    const user = userEvent.setup()
    render(<PuzzleApp />)

    await user.click(screen.getByRole("button", { name: PRESET_IMAGES[0].name }))
    await user.click(screen.getByRole("button", { name: PRESET_IMAGES[1].name }))
    await user.click(screen.getByRole("button", { name: "확인" }))

    expect(screen.getAllByText(PRESET_IMAGES[1].name).length).toBeGreaterThan(0)
  })

  test("[S12-3] 취소를 선택하면 원래 이미지가 유지된다", async () => {
    const user = userEvent.setup()
    render(<PuzzleApp />)

    await user.click(screen.getByRole("button", { name: PRESET_IMAGES[0].name }))
    await user.click(screen.getByRole("button", { name: PRESET_IMAGES[1].name }))
    await user.click(screen.getByRole("button", { name: "취소" }))

    expect(
      screen.queryByText("진행 중인 퍼즐을 포기하고 전환하시겠습니까?")
    ).not.toBeInTheDocument()
    expect(screen.getAllByText(PRESET_IMAGES[0].name).length).toBeGreaterThan(0)
  })

  describe("URL로 이미지 추가 후 자동 선택", () => {
    beforeEach(() => {
      window.localStorage.clear()
      vi.stubGlobal("Image", FakeImage)
    })

    afterEach(() => {
      vi.unstubAllGlobals()
    })

    test("[S3-2] 추가된 이미지가 자동 선택되어 퍼즐과 00:00 타이머가 나타난다", async () => {
      const user = userEvent.setup()
      render(<PuzzleApp />)

      await user.type(screen.getByLabelText("이미지 URL"), "https://example.com/sea.jpg")
      await user.type(screen.getByLabelText("이름"), "바다 풍경")
      await user.click(screen.getByRole("button", { name: "추가" }))

      await waitFor(() => {
        expect(screen.getByTestId("tile-0")).toBeInTheDocument()
      })
      expect(screen.getAllByText("바다 풍경").length).toBeGreaterThan(0)
      expect(screen.getByLabelText("경과 시간")).toHaveTextContent("00:00")
    })

    test("[S14-1] 추가한 이미지를 삭제하면 목록에서 사라진다", async () => {
      const user = userEvent.setup()
      render(<PuzzleApp />)

      await user.type(screen.getByLabelText("이미지 URL"), "https://example.com/sea.jpg")
      await user.type(screen.getByLabelText("이름"), "바다 풍경")
      await user.click(screen.getByRole("button", { name: "추가" }))
      await waitFor(() => {
        expect(screen.getByTestId("tile-0")).toBeInTheDocument()
      })

      await user.click(screen.getByRole("button", { name: "바다 풍경 삭제" }))

      expect(screen.queryByRole("button", { name: "바다 풍경" })).not.toBeInTheDocument()
    })

    test("[S15] 선택 중인 이미지를 삭제하면 빈 상태로 전환된다", async () => {
      const user = userEvent.setup()
      render(<PuzzleApp />)

      await user.type(screen.getByLabelText("이미지 URL"), "https://example.com/sea.jpg")
      await user.type(screen.getByLabelText("이름"), "바다 풍경")
      await user.click(screen.getByRole("button", { name: "추가" }))
      await waitFor(() => {
        expect(screen.getByTestId("tile-0")).toBeInTheDocument()
      })

      await user.click(screen.getByRole("button", { name: "바다 풍경 삭제" }))

      expect(screen.getByText("이미지를 선택해주세요")).toBeInTheDocument()
    })
  })
})
