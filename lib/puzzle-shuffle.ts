export const BOARD_SIZE = 4
export const BLANK = 0

export function createSolvedBoard(): number[] {
  const board = Array.from({ length: BOARD_SIZE * BOARD_SIZE - 1 }, (_, i) => i + 1)
  board.push(BLANK)
  return board
}

export function countInversions(board: number[]): number {
  const tiles = board.filter((value) => value !== BLANK)
  let inversions = 0
  for (let i = 0; i < tiles.length; i++) {
    for (let j = i + 1; j < tiles.length; j++) {
      if (tiles[i] > tiles[j]) inversions++
    }
  }
  return inversions
}

/**
 * 4-wide 15 퍼즐의 solvability 규칙(Wikipedia: Sliding puzzle):
 * (역순 개수 + 빈칸의 아래에서부터 행 번호)가 홀수여야 풀 수 있다.
 */
export function isSolvable(board: number[]): boolean {
  const inversions = countInversions(board)
  const blankIndex = board.indexOf(BLANK)
  const blankRow = Math.floor(blankIndex / BOARD_SIZE)
  const blankRowFromBottom = BOARD_SIZE - blankRow
  return (inversions + blankRowFromBottom) % 2 === 1
}

export function isSolvedBoard(board: number[]): boolean {
  const solved = createSolvedBoard()
  return board.length === solved.length && board.every((value, index) => value === solved[index])
}

function shuffleArray<T>(items: T[], random: () => number): T[] {
  const result = [...items]
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1))
    ;[result[i], result[j]] = [result[j], result[i]]
  }
  return result
}

export function generateSolvableShuffle(random: () => number = Math.random): number[] {
  const solved = createSolvedBoard()
  const board = shuffleArray(solved, random)

  if (!isSolvable(board)) {
    const firstNonBlank = board.findIndex((value) => value !== BLANK)
    const secondNonBlank = board.findIndex(
      (value, index) => value !== BLANK && index !== firstNonBlank
    )
    ;[board[firstNonBlank], board[secondNonBlank]] = [
      board[secondNonBlank],
      board[firstNonBlank],
    ]
  }

  if (board.every((value, index) => value === solved[index])) {
    return generateSolvableShuffle(random)
  }

  return board
}
