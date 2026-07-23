import { describe, expect, test, vi } from "vitest"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { PuzzleBoard } from "./puzzle-board"
import { BLANK, createSolvedBoard } from "@/lib/puzzle-shuffle"
import type { PuzzleImage } from "@/types/puzzle"

const image: PuzzleImage = {
  id: "img-1",
  name: "산",
  url: "https://example.com/mountain.jpg",
  isPreset: true,
}

describe("PuzzleBoard", () => {
  test("[S2-1] 4X4 타일 16칸을 렌더링한다", () => {
    const board = createSolvedBoard()
    render(<PuzzleBoard image={image} board={board} elapsedMs={0} />)
    for (let position = 0; position < 16; position++) {
      expect(screen.getByTestId(`tile-${position}`)).toBeInTheDocument()
    }
  })

  test("[S2-2] 빈칸(0)에는 배경 이미지 레이어가 없다", () => {
    const board = createSolvedBoard()
    const blankPosition = board.indexOf(BLANK)
    render(<PuzzleBoard image={image} board={board} elapsedMs={0} />)
    const blankTile = screen.getByTestId(`tile-${blankPosition}`)
    expect(blankTile.querySelector("[data-tile-layer]")).not.toBeInTheDocument()
  })

  test("[INV-2] 조각 배경은 cover/center로 정사각 크롭되어 슬라이싱된다", () => {
    const board = createSolvedBoard()
    render(<PuzzleBoard image={image} board={board} elapsedMs={0} />)
    // 값 1은 정답 배치에서 좌상단(0행 0열) 조각이어야 한다
    const firstTile = screen.getByTestId("tile-0").querySelector("[data-tile-layer]") as HTMLElement
    expect(firstTile).toBeTruthy()
    expect(firstTile.style.backgroundImage).toBe(`url("${image.url}")`)
    expect(firstTile.style.backgroundSize).toBe("cover")
    expect(firstTile.style.backgroundPosition).toBe("center center")
    expect(firstTile.style.top).toBe("0%")
    expect(firstTile.style.left).toBe("0%")

    // 값 6은 정답 배치에서 1행 1열 조각 -> top/left가 -100%여야 한다
    const sixthPosition = board.indexOf(6)
    const sixthTile = screen
      .getByTestId(`tile-${sixthPosition}`)
      .querySelector("[data-tile-layer]") as HTMLElement
    expect(sixthTile.style.top).toBe("-100%")
    expect(sixthTile.style.left).toBe("-100%")
  })

  test("[S2-4][INV-4] 경과 시간을 mm:ss 형식으로 표시한다", () => {
    const board = createSolvedBoard()
    render(<PuzzleBoard image={image} board={board} elapsedMs={47_000} />)
    expect(screen.getByLabelText("경과 시간")).toHaveTextContent("00:47")
  })

  test("타일을 클릭하면 onTileClick에 해당 위치를 전달한다 (인접성 판정은 use-puzzle에서 검증)", async () => {
    const user = userEvent.setup()
    const board = createSolvedBoard()
    const onTileClick = vi.fn()
    render(
      <PuzzleBoard image={image} board={board} elapsedMs={0} onTileClick={onTileClick} />
    )

    await user.click(screen.getByTestId("tile-3"))

    expect(onTileClick).toHaveBeenCalledWith(3)
  })

  test("Reset 버튼을 클릭하면 onReset이 호출된다 (실제 재셔플·타이머 초기화는 use-puzzle에서 검증)", async () => {
    const user = userEvent.setup()
    const onReset = vi.fn()
    const board = createSolvedBoard()
    render(<PuzzleBoard image={image} board={board} elapsedMs={0} onReset={onReset} />)

    await user.click(screen.getByRole("button", { name: "Reset" }))

    expect(onReset).toHaveBeenCalled()
  })
})
