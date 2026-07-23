"use client"

import { HugeiconsIcon } from "@hugeicons/react"
import { CancelCircleIcon } from "@hugeicons/core-free-icons"

import type { PuzzleImage } from "@/types/puzzle"

export interface ImageLibraryGridProps {
  images: PuzzleImage[]
  selectedImageId: string | null
  onSelectImage: (image: PuzzleImage) => void
  onRemoveImage: (imageId: string) => void
}

export function ImageLibraryGrid({
  images,
  selectedImageId,
  onSelectImage,
  onRemoveImage,
}: ImageLibraryGridProps) {
  return (
    <div className="grid grid-cols-3 gap-2">
      {images.map((image) => (
        <div key={image.id} className="group relative">
          <button
            type="button"
            aria-label={image.name}
            onClick={() => onSelectImage(image)}
            data-selected={selectedImageId === image.id}
            className="aspect-square w-full rounded-md border bg-cover bg-center data-[selected=true]:ring-2 data-[selected=true]:ring-ring"
            style={{ backgroundImage: `url(${image.url})` }}
          />
          {!image.isPreset && (
            <button
              type="button"
              aria-label={`${image.name} 삭제`}
              onClick={() => onRemoveImage(image.id)}
              className="absolute top-1 right-1 hidden size-5 items-center justify-center rounded-full bg-destructive text-destructive-foreground group-hover:flex group-focus-within:flex"
            >
              <HugeiconsIcon icon={CancelCircleIcon} size={14} />
            </button>
          )}
        </div>
      ))}
    </div>
  )
}
