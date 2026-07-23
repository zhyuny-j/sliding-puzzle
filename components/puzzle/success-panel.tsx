"use client"

import * as React from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import { RefreshIcon } from "@hugeicons/core-free-icons"

import { Button } from "@/components/ui/button"
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { formatElapsedTime } from "@/lib/format-time"
import { validateNickname } from "@/lib/validate-nickname"
import type { PuzzleImage } from "@/types/puzzle"

export interface SuccessPanelProps {
  image: PuzzleImage
  elapsedMs: number
  onSubmit: (nickname: string) => void
  onReset?: () => void
}

export function SuccessPanel({ image, elapsedMs, onSubmit, onReset }: SuccessPanelProps) {
  const [nickname, setNickname] = React.useState("")
  const [error, setError] = React.useState<string | null>(null)
  const [submitted, setSubmitted] = React.useState(false)

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const result = validateNickname(nickname)
    if (!result.valid) {
      setError(result.error ?? null)
      return
    }
    setError(null)
    onSubmit(nickname.trim())
    setSubmitted(true)
  }

  return (
    <div className="flex w-full flex-col items-center gap-3">
      <p className="text-sm font-bold">Success!</p>
      <div
        data-testid="success-image"
        className="aspect-square w-full max-w-56 rounded-md border"
        style={{
          backgroundImage: `url(${image.url})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />
      <p className="text-sm">완료 시간: {formatElapsedTime(elapsedMs)}</p>
      {submitted ? (
        <p className="text-sm text-muted-foreground">제출 완료</p>
      ) : (
        <form onSubmit={handleSubmit} className="w-full max-w-56">
          <FieldGroup>
            <Field data-invalid={error ? true : undefined}>
              <FieldLabel htmlFor="success-nickname">아이디</FieldLabel>
              <Input
                id="success-nickname"
                value={nickname}
                onChange={(event) => setNickname(event.target.value)}
                aria-invalid={error ? true : undefined}
              />
              {error && <FieldError>{error}</FieldError>}
            </Field>
            <Button type="submit">제출</Button>
          </FieldGroup>
        </form>
      )}
      <Button type="button" variant="outline" onClick={() => onReset?.()}>
        <HugeiconsIcon icon={RefreshIcon} data-icon="inline-start" />
        Reset
      </Button>
    </div>
  )
}
