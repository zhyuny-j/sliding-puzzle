"use client"

import * as React from "react"

import { PRESET_IMAGES } from "@/config/puzzle-presets"
import { addImage, getAddedImages } from "@/services/image-library-storage"
import type { PuzzleImage } from "@/types/puzzle"

export type AddImageResult =
  | { ok: true; image: PuzzleImage }
  | { ok: false; error: string }

export interface UseImageLibraryResult {
  images: PuzzleImage[]
  addImageFromUrl: (url: string, name: string) => Promise<AddImageResult>
}

function loadsSuccessfully(url: string): Promise<boolean> {
  return new Promise((resolve) => {
    const probe = new Image()
    probe.onload = () => resolve(true)
    probe.onerror = () => resolve(false)
    probe.src = url
  })
}

export function useImageLibrary(): UseImageLibraryResult {
  const [addedImages, setAddedImages] = React.useState<PuzzleImage[]>([])

  React.useEffect(() => {
    setAddedImages(getAddedImages())
  }, [])

  const images = React.useMemo(() => [...PRESET_IMAGES, ...addedImages], [addedImages])

  const addImageFromUrl = React.useCallback(
    async (url: string, name: string): Promise<AddImageResult> => {
      const ok = await loadsSuccessfully(url)
      if (!ok) {
        return { ok: false, error: "이미지를 불러올 수 없습니다" }
      }

      const image: PuzzleImage = {
        id: `added-${Date.now()}-${Math.random().toString(36).slice(2)}`,
        name,
        url,
        isPreset: false,
      }
      setAddedImages(addImage(image))
      return { ok: true, image }
    },
    []
  )

  return { images, addImageFromUrl }
}
