import { afterEach, beforeEach, describe, expect, test, vi } from "vitest"
import { act, renderHook, waitFor } from "@testing-library/react"
import { useImageLibrary } from "./use-image-library"
import { PRESET_IMAGES } from "@/config/puzzle-presets"

class FakeImage {
  onload: (() => void) | null = null
  onerror: (() => void) | null = null
  private _src = ""

  set src(value: string) {
    this._src = value
    if (value.includes("broken")) {
      queueMicrotask(() => this.onerror?.())
    } else {
      queueMicrotask(() => this.onload?.())
    }
  }

  get src() {
    return this._src
  }
}

describe("useImageLibrary", () => {
  beforeEach(() => {
    window.localStorage.clear()
    vi.stubGlobal("Image", FakeImage)
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  test("초기 목록은 기본 프리셋으로 시작한다", () => {
    const { result } = renderHook(() => useImageLibrary())
    expect(result.current.images).toEqual(PRESET_IMAGES)
  })

  test("[S3-1] 유효한 URL을 추가하면 목록에 새 이미지가 나타난다", async () => {
    const { result } = renderHook(() => useImageLibrary())

    let addResult: Awaited<ReturnType<typeof result.current.addImageFromUrl>> | undefined
    await act(async () => {
      addResult = await result.current.addImageFromUrl(
        "https://example.com/sea.jpg",
        "바다 풍경"
      )
    })

    expect(addResult?.ok).toBe(true)
    await waitFor(() => {
      expect(result.current.images).toHaveLength(PRESET_IMAGES.length + 1)
    })
    expect(result.current.images.at(-1)).toMatchObject({
      name: "바다 풍경",
      url: "https://example.com/sea.jpg",
      isPreset: false,
    })
  })

  test("[S4] 깨진 URL을 추가하면 실패를 반환하고 목록이 늘어나지 않는다", async () => {
    const { result } = renderHook(() => useImageLibrary())

    let addResult: Awaited<ReturnType<typeof result.current.addImageFromUrl>> | undefined
    await act(async () => {
      addResult = await result.current.addImageFromUrl(
        "https://example.com/broken-link.jpg",
        "깨진 이미지"
      )
    })

    expect(addResult?.ok).toBe(false)
    expect(result.current.images).toEqual(PRESET_IMAGES)
  })
})
