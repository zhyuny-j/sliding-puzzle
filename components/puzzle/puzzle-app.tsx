"use client"

import * as React from "react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PRESET_IMAGES } from "@/config/puzzle-presets"
import { usePuzzle } from "@/hooks/use-puzzle"
import { useRanking } from "@/hooks/use-ranking"
import type { PuzzleImage } from "@/types/puzzle"
import { PuzzleBoard } from "./puzzle-board"
import { RankingPanel } from "./ranking-panel"
import { SuccessPanel } from "./success-panel"

export function PuzzleApp() {
  const [selectedImage, setSelectedImage] = React.useState<PuzzleImage | null>(null)
  const { board, elapsedMs, moveTile, isSolved, reset } = usePuzzle(selectedImage)
  const { rankings, submitRanking } = useRanking(selectedImage?.id ?? null)

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-4 p-4 sm:p-6">
      <h1 className="text-xl font-bold">내가 원하는 사진으로 퍼즐 만들기</h1>

      <div className="flex flex-col gap-4 @container md:grid md:grid-cols-[240px_1fr_260px]">
        <Card>
          <CardHeader>
            <CardTitle>기본 퍼즐</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-2">
              {PRESET_IMAGES.map((image) => (
                <button
                  key={image.id}
                  type="button"
                  aria-label={image.name}
                  onClick={() => setSelectedImage(image)}
                  data-selected={selectedImage?.id === image.id}
                  className="aspect-square rounded-md border bg-cover bg-center data-[selected=true]:ring-2 data-[selected=true]:ring-ring"
                  style={{ backgroundImage: `url(${image.url})` }}
                />
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="items-center justify-center">
          <CardContent className="flex min-h-70 flex-col items-center justify-center gap-2">
            {selectedImage && isSolved ? (
              <SuccessPanel
                image={selectedImage}
                elapsedMs={elapsedMs}
                onSubmit={(nickname) => submitRanking(nickname, elapsedMs)}
                onReset={reset}
              />
            ) : selectedImage ? (
              <PuzzleBoard
                image={selectedImage}
                board={board}
                elapsedMs={elapsedMs}
                onTileClick={moveTile}
                onReset={reset}
              />
            ) : (
              <p className="text-sm text-muted-foreground">이미지를 선택해주세요</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <RankingPanel imageName={selectedImage?.name ?? null} rankings={rankings} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
