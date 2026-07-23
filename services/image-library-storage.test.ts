import { beforeEach, describe, expect, test } from "vitest"
import { addImage, getAddedImages } from "./image-library-storage"
import type { PuzzleImage } from "@/types/puzzle"

function image(id: string, name: string): PuzzleImage {
  return { id, name, url: `https://example.com/${id}.jpg`, isPreset: false }
}

describe("image-library-storage", () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  test("추가된 이미지가 없으면 빈 배열을 반환한다", () => {
    expect(getAddedImages()).toEqual([])
  })

  test("[S3-1] addImage는 새 이미지를 추가하고 반환한다", () => {
    const result = addImage(image("img-1", "바다 풍경"))
    expect(result).toEqual([image("img-1", "바다 풍경")])
    expect(getAddedImages()).toEqual([image("img-1", "바다 풍경")])
  })

  test("여러 번 추가하면 순서대로 누적된다", () => {
    addImage(image("img-1", "바다 풍경"))
    const result = addImage(image("img-2", "산"))
    expect(result.map((i) => i.name)).toEqual(["바다 풍경", "산"])
  })
})
