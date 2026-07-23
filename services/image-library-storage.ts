import type { PuzzleImage } from "@/types/puzzle"

const STORAGE_KEY = "sliding-puzzle:added-images"

function isBrowser(): boolean {
  return typeof window !== "undefined"
}

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
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  }
  return next
}
