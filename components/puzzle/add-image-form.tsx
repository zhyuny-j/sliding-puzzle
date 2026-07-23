"use client"

import * as React from "react"

import { Button } from "@/components/ui/button"
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import type { AddImageResult } from "@/hooks/use-image-library"

export interface AddImageFormProps {
  onAddImage: (url: string, name: string) => Promise<AddImageResult>
}

export function AddImageForm({ onAddImage }: AddImageFormProps) {
  const [url, setUrl] = React.useState("")
  const [name, setName] = React.useState("")
  const [error, setError] = React.useState<string | null>(null)
  const [submitting, setSubmitting] = React.useState(false)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSubmitting(true)
    const result = await onAddImage(url, name)
    setSubmitting(false)

    if (!result.ok) {
      setError(result.error)
      return
    }

    setError(null)
    setUrl("")
    setName("")
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2">
      <FieldGroup>
        <Field data-invalid={error ? true : undefined}>
          <FieldLabel htmlFor="image-url">이미지 URL</FieldLabel>
          <Input
            id="image-url"
            value={url}
            onChange={(event) => setUrl(event.target.value)}
            aria-invalid={error ? true : undefined}
            required
          />
          {error && <FieldError>{error}</FieldError>}
        </Field>
        <Field>
          <FieldLabel htmlFor="image-name">이름</FieldLabel>
          <Input
            id="image-name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            required
          />
        </Field>
        <Button type="submit" disabled={submitting}>
          추가
        </Button>
      </FieldGroup>
    </form>
  )
}
