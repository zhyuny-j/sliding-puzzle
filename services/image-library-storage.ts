import { isBrowser } from "@/lib/is-browser"
import type { PuzzleImage } from "@/types/puzzle"

const STORAGE_KEY = "sliding-puzzle:added-images"

export function getAddedImages(): PuzzleImage[] {
  if (!isBrowser()) return []
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function addImage(image: PuzzleImage): PuzzleImage[] {
  const next = [...getAddedImages(), image]
  if (isBrowser()) {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
    } catch {
      // localStorage 쓰기 실패(용량 초과, 프라이빗 브라우징 등)해도 화면에는 추가된 이미지를 보여준다
    }
  }
  return next
}

export function removeImage(imageId: string): PuzzleImage[] {
  const next = getAddedImages().filter((image) => image.id !== imageId)
  if (isBrowser()) {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
    } catch {
      // localStorage 쓰기 실패(용량 초과, 프라이빗 브라우징 등)해도 화면에는 삭제된 목록을 보여준다
    }
  }
  return next
}
