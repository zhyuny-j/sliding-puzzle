import { expect, test } from "@playwright/test"

const ADDED_IMAGE_URL =
  "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=600&h=600&fit=crop&auto=format"
const ADDED_IMAGE_NAME = "영속성 테스트 이미지"
const PLAYER_ID = "player1"
const BOARD_SIZE = 4
const BLANK = 0

function manhattan(board: number[]): number {
  let dist = 0
  for (let i = 0; i < board.length; i++) {
    const value = board[i]
    if (value === BLANK) continue
    const targetIndex = value - 1
    const curR = Math.floor(i / BOARD_SIZE)
    const curC = i % BOARD_SIZE
    const tgtR = Math.floor(targetIndex / BOARD_SIZE)
    const tgtC = targetIndex % BOARD_SIZE
    dist += Math.abs(curR - tgtR) + Math.abs(curC - tgtC)
  }
  return dist
}

function neighbors(blankIndex: number): number[] {
  const r = Math.floor(blankIndex / BOARD_SIZE)
  const c = blankIndex % BOARD_SIZE
  const result: number[] = []
  if (r > 0) result.push(blankIndex - BOARD_SIZE)
  if (r < BOARD_SIZE - 1) result.push(blankIndex + BOARD_SIZE)
  if (c > 0) result.push(blankIndex - 1)
  if (c < BOARD_SIZE - 1) result.push(blankIndex + 1)
  return result
}

function isSolved(board: number[]): boolean {
  return board.every((value, index) => (index === board.length - 1 ? value === BLANK : value === index + 1))
}

// IDA* solver (Manhattan-distance heuristic) — 실제로 렌더된 셔플 보드를 그대로 풀어서
// 조각 값(aria-label 기준) 클릭 순서를 계산한다. 셔플 알고리즘을 하드코딩하지 않기 위해
// Math.random을 스텁하는 대신 매 실행 시 실제 화면의 보드를 읽어 그때그때 푼다.
function solve(startBoard: number[]): number[] {
  let threshold = manhattan(startBoard)
  const path: number[] = []

  function search(board: number[], g: number, bound: number, lastMoveIdx: number): number | true {
    const f = g + manhattan(board)
    if (f > bound) return f
    if (isSolved(board)) return true

    let min = Infinity
    const blankIndex = board.indexOf(BLANK)
    for (const n of neighbors(blankIndex)) {
      if (n === lastMoveIdx) continue
      const movedValue = board[n]
      const newBoard = board.slice()
      ;[newBoard[blankIndex], newBoard[n]] = [newBoard[n], newBoard[blankIndex]]
      path.push(movedValue)
      const t = search(newBoard, g + 1, bound, blankIndex)
      if (t === true) return true
      if (t < min) min = t
      path.pop()
    }
    return min
  }

  for (;;) {
    const t = search(startBoard, 0, threshold, -1)
    if (t === true) return path
    threshold = t as number
  }
}

test("[S13-1][S13-2][INV-3] 이미지 추가 후 퍼즐을 완성하고 랭킹을 남기면, 새로고침 후에도 이미지 목록과 랭킹이 유지된다", async ({
  page,
}) => {
  test.slow() // 퍼즐을 실제로 풀이하는 클릭 시퀀스가 많아 병렬 실행 시 기본 30s 예산을 넘길 수 있다

  await page.goto("/")
  await page.evaluate(() => window.localStorage.clear())
  await page.reload()

  await page.getByLabel("이미지 URL").fill(ADDED_IMAGE_URL)
  await page.getByLabel("이름").fill(ADDED_IMAGE_NAME)
  await page.getByRole("button", { name: "추가" }).click()

  for (let i = 0; i < 16; i++) {
    await expect(page.getByTestId(`tile-${i}`)).toBeVisible()
  }

  const initialBoard = await page.evaluate(() => {
    return Array.from({ length: 16 }, (_, position) => {
      const el = document.querySelector(`[data-testid="tile-${position}"]`)
      const label = el?.getAttribute("aria-label") ?? ""
      return label === "빈칸" ? 0 : Number(label.replace("조각 ", ""))
    })
  })

  const moves = solve(initialBoard)
  for (const value of moves) {
    await page.getByRole("button", { name: `조각 ${value}`, exact: true }).click()
  }

  await expect(page.getByTestId("success-image")).toBeVisible()

  await page.getByLabel("아이디").fill(PLAYER_ID)
  await page.getByRole("button", { name: "제출" }).click()
  await expect(page.getByText("제출 완료")).toBeVisible()

  await page.reload()

  await expect(page.getByRole("button", { name: ADDED_IMAGE_NAME })).toBeVisible()

  await page.getByRole("button", { name: ADDED_IMAGE_NAME }).click()

  await expect(page.getByText(`1. ${PLAYER_ID}`)).toBeVisible()
})
