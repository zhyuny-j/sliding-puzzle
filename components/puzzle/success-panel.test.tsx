import { describe, expect, test, vi } from "vitest"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { SuccessPanel } from "./success-panel"
import type { PuzzleImage } from "@/types/puzzle"

const image: PuzzleImage = {
  id: "img-1",
  name: "산",
  url: "https://example.com/mountain.jpg",
  isPreset: true,
}

describe("SuccessPanel", () => {
  test("[S8-1] 완성된 원본 이미지가 표시된다", () => {
    render(<SuccessPanel image={image} elapsedMs={47_000} onSubmit={vi.fn()} />)
    const photo = screen.getByTestId("success-image")
    expect(photo.style.backgroundImage).toBe(`url("${image.url}")`)
  })

  test("[S8-2] 최종 소요 시간을 mm:ss로 표시한다", () => {
    render(<SuccessPanel image={image} elapsedMs={47_000} onSubmit={vi.fn()} />)
    expect(screen.getByText("완료 시간: 00:47")).toBeInTheDocument()
  })

  test("[S8-3] 아이디 입력창이 나타난다", () => {
    render(<SuccessPanel image={image} elapsedMs={0} onSubmit={vi.fn()} />)
    expect(screen.getByLabelText("아이디")).toBeInTheDocument()
  })

  test("[S9] 유효한 아이디를 제출하면 onSubmit이 trim된 값으로 호출된다", async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    render(<SuccessPanel image={image} elapsedMs={0} onSubmit={onSubmit} />)

    await user.type(screen.getByLabelText("아이디"), "  player1  ")
    await user.click(screen.getByRole("button", { name: "제출" }))

    expect(onSubmit).toHaveBeenCalledWith("player1")
  })

  test("[S10] 빈 아이디로 제출하면 안내 메시지가 나타나고 onSubmit이 호출되지 않는다", async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    render(<SuccessPanel image={image} elapsedMs={0} onSubmit={onSubmit} />)

    await user.click(screen.getByRole("button", { name: "제출" }))

    expect(screen.getByText("아이디를 입력해주세요")).toBeInTheDocument()
    expect(onSubmit).not.toHaveBeenCalled()
  })

  test("제출 후에는 폼이 사라지고 제출 완료 안내가 나타난다 (중복 제출 방지)", async () => {
    const user = userEvent.setup()
    render(<SuccessPanel image={image} elapsedMs={0} onSubmit={vi.fn()} />)

    await user.type(screen.getByLabelText("아이디"), "player1")
    await user.click(screen.getByRole("button", { name: "제출" }))

    expect(screen.getByText("제출 완료")).toBeInTheDocument()
    expect(screen.queryByLabelText("아이디")).not.toBeInTheDocument()
  })
})
