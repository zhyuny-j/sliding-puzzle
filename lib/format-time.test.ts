import { describe, expect, test } from "vitest"
import { formatElapsedTime } from "./format-time"

describe("formatElapsedTime", () => {
  test("[INV-4] 0ms는 00:00으로 표시된다", () => {
    expect(formatElapsedTime(0)).toBe("00:00")
  })

  test("[INV-4] 47초는 00:47로 표시된다", () => {
    expect(formatElapsedTime(47_000)).toBe("00:47")
  })

  test("[INV-4] 2분 5초는 02:05로 표시된다", () => {
    expect(formatElapsedTime(125_000)).toBe("02:05")
  })

  test("[INV-4] 밀리초 단위는 초 단위로 내림한다", () => {
    expect(formatElapsedTime(47_900)).toBe("00:47")
  })
})
