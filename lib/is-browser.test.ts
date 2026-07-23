import { describe, expect, test } from "vitest"
import { isBrowser } from "./is-browser"

describe("isBrowser", () => {
  test("jsdom 환경에서는 true를 반환한다", () => {
    expect(isBrowser()).toBe(true)
  })
})
