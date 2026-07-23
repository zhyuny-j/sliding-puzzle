"use client"

import * as React from "react"

import { BLANK, BOARD_SIZE } from "@/lib/puzzle-shuffle"
import { formatElapsedTime } from "@/lib/format-time"
import type { PuzzleImage } from "@/types/puzzle"

export interface PuzzleBoardProps {
  image: PuzzleImage
  board: number[]
  elapsedMs: number
}

function getTileContainerStyle(position: number): React.CSSProperties {
  const row = Math.floor(position / BOARD_SIZE)
  const col = position % BOARD_SIZE
  return {
    position: "absolute",
    top: `${row * (100 / BOARD_SIZE)}%`,
    left: `${col * (100 / BOARD_SIZE)}%`,
    width: `${100 / BOARD_SIZE}%`,
    height: `${100 / BOARD_SIZE}%`,
    overflow: "hidden",
  }
}

function getTileLayerStyle(value: number, imageUrl: string): React.CSSProperties {
  const solvedIndex = value - 1
  const row = Math.floor(solvedIndex / BOARD_SIZE)
  const col = solvedIndex % BOARD_SIZE
  return {
    position: "absolute",
    top: `${-row * 100}%`,
    left: `${-col * 100}%`,
    width: `${BOARD_SIZE * 100}%`,
    height: `${BOARD_SIZE * 100}%`,
    backgroundImage: `url(${imageUrl})`,
    backgroundSize: "cover",
    backgroundPosition: "center",
  }
}

export function PuzzleBoard({ image, board, elapsedMs }: PuzzleBoardProps) {
  return (
    <div className="flex w-full flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-bold">{image.name}</span>
        <span className="text-sm" aria-label="경과 시간">
          ⏱ {formatElapsedTime(elapsedMs)}
        </span>
      </div>
      <div className="relative aspect-square w-full overflow-hidden rounded-md border">
        {board.map((value, position) => (
          <div key={position} data-testid={`tile-${position}`} style={getTileContainerStyle(position)}>
            {value !== BLANK && (
              <div data-tile-layer style={getTileLayerStyle(value, image.url)} />
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
