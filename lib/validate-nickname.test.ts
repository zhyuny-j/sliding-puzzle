import { describe, expect, test } from "vitest"
import { validateNickname } from "./validate-nickname"

describe("validateNickname", () => {
  test("[S10] 빈 문자열은 유효하지 않고 안내 메시지를 반환한다", () => {
    expect(validateNickname("")).toEqual({
      valid: false,
      error: "아이디를 입력해주세요",
    })
  })

  test("[S10] 공백만 있는 값도 빈 값으로 취급한다", () => {
    expect(validateNickname("   ")).toEqual({
      valid: false,
      error: "아이디를 입력해주세요",
    })
  })

  test("21자 이상이면 유효하지 않다", () => {
    const result = validateNickname("a".repeat(21))
    expect(result.valid).toBe(false)
  })

  test("1~20자의 값은 유효하다", () => {
    expect(validateNickname("player1")).toEqual({ valid: true })
  })
})
