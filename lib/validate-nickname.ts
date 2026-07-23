export interface NicknameValidation {
  valid: boolean
  error?: string
}

const MAX_NICKNAME_LENGTH = 20

export function validateNickname(value: string): NicknameValidation {
  const trimmed = value.trim()

  if (trimmed.length === 0) {
    return { valid: false, error: "아이디를 입력해주세요" }
  }

  if (trimmed.length > MAX_NICKNAME_LENGTH) {
    return { valid: false, error: `아이디는 ${MAX_NICKNAME_LENGTH}자 이하로 입력해주세요` }
  }

  return { valid: true }
}
