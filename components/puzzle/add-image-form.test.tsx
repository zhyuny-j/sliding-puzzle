import { describe, expect, test, vi } from "vitest"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { AddImageForm } from "./add-image-form"

describe("AddImageForm", () => {
  test("[S3-1] 유효한 URL과 이름을 제출하면 onAddImage가 호출되고 폼이 비워진다", async () => {
    const user = userEvent.setup()
    const onAddImage = vi.fn().mockResolvedValue({ ok: true })
    render(<AddImageForm onAddImage={onAddImage} />)

    await user.type(screen.getByLabelText("이미지 URL"), "https://example.com/sea.jpg")
    await user.type(screen.getByLabelText("이름"), "바다 풍경")
    await user.click(screen.getByRole("button", { name: "추가" }))

    expect(onAddImage).toHaveBeenCalledWith("https://example.com/sea.jpg", "바다 풍경")
    expect(screen.getByLabelText("이미지 URL")).toHaveValue("")
    expect(screen.getByLabelText("이름")).toHaveValue("")
  })

  test("[S4] 실패 응답이 오면 에러 메시지가 나타나고 입력값이 유지된다", async () => {
    const user = userEvent.setup()
    const onAddImage = vi.fn().mockResolvedValue({
      ok: false,
      error: "이미지를 불러올 수 없습니다",
    })
    render(<AddImageForm onAddImage={onAddImage} />)

    await user.type(screen.getByLabelText("이미지 URL"), "https://example.com/broken.jpg")
    await user.type(screen.getByLabelText("이름"), "깨진 이미지")
    await user.click(screen.getByRole("button", { name: "추가" }))

    expect(await screen.findByText("이미지를 불러올 수 없습니다")).toBeInTheDocument()
    expect(screen.getByLabelText("이미지 URL")).toHaveValue("https://example.com/broken.jpg")
  })
})
