import { describe, expect, test, vi } from "vitest"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { ImageLibraryGrid } from "./image-library-grid"
import type { PuzzleImage } from "@/types/puzzle"

const preset: PuzzleImage = {
  id: "preset-1",
  name: "산",
  url: "https://example.com/mountain.jpg",
  isPreset: true,
}

const added: PuzzleImage = {
  id: "added-1",
  name: "바다 풍경",
  url: "https://example.com/sea.jpg",
  isPreset: false,
}

describe("ImageLibraryGrid", () => {
  test("이미지를 클릭하면 onSelectImage가 호출된다", async () => {
    const user = userEvent.setup()
    const onSelectImage = vi.fn()
    render(
      <ImageLibraryGrid
        images={[preset]}
        selectedImageId={null}
        onSelectImage={onSelectImage}
        onRemoveImage={vi.fn()}
      />
    )

    await user.click(screen.getByRole("button", { name: "산" }))

    expect(onSelectImage).toHaveBeenCalledWith(preset)
  })

  test("[S14-3] 기본 프리셋 이미지에는 삭제 버튼이 없다", () => {
    render(
      <ImageLibraryGrid
        images={[preset]}
        selectedImageId={null}
        onSelectImage={vi.fn()}
        onRemoveImage={vi.fn()}
      />
    )

    expect(screen.queryByRole("button", { name: "산 삭제" })).not.toBeInTheDocument()
  })

  test("[S14-1] 추가한 이미지의 삭제 버튼을 클릭하면 onRemoveImage가 호출된다", async () => {
    const user = userEvent.setup()
    const onRemoveImage = vi.fn()
    render(
      <ImageLibraryGrid
        images={[added]}
        selectedImageId={null}
        onSelectImage={vi.fn()}
        onRemoveImage={onRemoveImage}
      />
    )

    await user.click(screen.getByRole("button", { name: "바다 풍경 삭제" }))

    expect(onRemoveImage).toHaveBeenCalledWith("added-1")
  })
})
