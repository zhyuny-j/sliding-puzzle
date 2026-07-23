import { describe, expect, test, vi } from "vitest"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { SwitchConfirmDialog } from "./switch-confirm-dialog"

describe("SwitchConfirmDialog", () => {
  test("[S12-1] open이 true면 확인 문구가 나타난다", () => {
    render(<SwitchConfirmDialog open onConfirm={vi.fn()} onCancel={vi.fn()} />)
    expect(
      screen.getByText("진행 중인 퍼즐을 포기하고 전환하시겠습니까?")
    ).toBeInTheDocument()
  })

  test("open이 false면 문구가 나타나지 않는다", () => {
    render(<SwitchConfirmDialog open={false} onConfirm={vi.fn()} onCancel={vi.fn()} />)
    expect(
      screen.queryByText("진행 중인 퍼즐을 포기하고 전환하시겠습니까?")
    ).not.toBeInTheDocument()
  })

  test("[S12-2] 확인 버튼을 클릭하면 onConfirm이 호출된다", async () => {
    const user = userEvent.setup()
    const onConfirm = vi.fn()
    render(<SwitchConfirmDialog open onConfirm={onConfirm} onCancel={vi.fn()} />)

    await user.click(screen.getByRole("button", { name: "확인" }))

    expect(onConfirm).toHaveBeenCalled()
  })

  test("[S12-3] 취소 버튼을 클릭하면 onCancel이 호출된다", async () => {
    const user = userEvent.setup()
    const onCancel = vi.fn()
    render(<SwitchConfirmDialog open onConfirm={vi.fn()} onCancel={onCancel} />)

    await user.click(screen.getByRole("button", { name: "취소" }))

    expect(onCancel).toHaveBeenCalled()
  })
})
