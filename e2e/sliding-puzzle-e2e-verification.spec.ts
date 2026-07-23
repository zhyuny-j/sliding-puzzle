import { expect, test } from "@playwright/test"

// spec.md의 "End-to-end 검증" 절차(7단계)를 그대로 순서대로 실행한다.
const ADDED_IMAGE_URL =
  "https://images.unsplash.com/photo-1439066615861-d1af74d74000?q=80&w=600&h=600&fit=crop&auto=format"
const ADDED_IMAGE_NAME = "E2E 검증용 이미지"
const PLAYER_ID = "e2e-player"
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

// Task 10과 동일한 IDA* 솔버 — 실제 렌더된 보드를 그때그때 풀어 클릭 순서를 계산한다.
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

async function readBoard(page: import("@playwright/test").Page): Promise<number[]> {
  return page.evaluate(() => {
    return Array.from({ length: 16 }, (_, position) => {
      const el = document.querySelector(`[data-testid="tile-${position}"]`)
      const label = el?.getAttribute("aria-label") ?? ""
      return label === "빈칸" ? 0 : Number(label.replace("조각 ", ""))
    })
  })
}

async function solvePuzzle(page: import("@playwright/test").Page) {
  const board = await readBoard(page)
  const moves = solve(board)
  for (const value of moves) {
    await page.getByRole("button", { name: `조각 ${value}`, exact: true }).click()
  }
}

test("spec.md End-to-end 검증 절차 (S1→S2→S6/S8→S9→S11→S3→S13)", async ({ page }) => {
  // 1. 서비스 첫 진입 → 타이틀과 왼쪽 기본 프리셋 목록, 빈 랭킹 안내가 보인다 (S1)
  await page.goto("/")
  await page.evaluate(() => window.localStorage.clear())
  await page.reload()

  await expect(page.getByRole("heading", { name: "내가 원하는 사진으로 퍼즐 만들기" })).toBeVisible()
  await expect(page.getByText("이미지를 선택해주세요")).toBeVisible()
  await expect(page.getByText("아직 기록이 없습니다")).toBeVisible()
  const firstPreset = page.locator('button[aria-label]:not([aria-label="빈칸"])').first()
  const firstPresetName = await firstPreset.getAttribute("aria-label")
  expect(firstPresetName).toBeTruthy()

  // 2. 프리셋 이미지 하나를 클릭 → 가운데에 섞인 4X4 퍼즐이 나타나고 소요 시간이 00:00부터 흐른다 (S2)
  await firstPreset.click()
  for (let i = 0; i < 16; i++) {
    await expect(page.getByTestId(`tile-${i}`)).toBeVisible()
  }
  await expect(page.getByLabel("경과 시간")).toHaveText(/00:0[01]/)

  // 3. 빈칸에 인접한 조각을 순서대로 클릭해 퍼즐을 완성 → Success 화면과 최종 소요 시간이 나타난다 (S6, S8)
  await solvePuzzle(page)
  await expect(page.getByTestId("success-image")).toBeVisible()
  await expect(page.getByText(/완료 시간: \d{2}:\d{2}/)).toBeVisible()

  // 4. 아이디를 입력하고 제출 → 오른쪽 랭킹에 아이디와 시간이 추가된다 (S9)
  await page.getByLabel("아이디").fill(PLAYER_ID)
  await page.getByRole("button", { name: "제출" }).click()
  await expect(page.getByText(`1. ${PLAYER_ID}`)).toBeVisible()

  // 5. Reset 버튼 클릭 → 퍼즐이 다시 섞이고 시간이 00:00부터 다시 시작한다 (S11)
  await page.getByRole("button", { name: "Reset" }).click()
  await expect(page.getByTestId("success-image")).toHaveCount(0)
  for (let i = 0; i < 16; i++) {
    await expect(page.getByTestId(`tile-${i}`)).toBeVisible()
  }
  await expect(page.getByLabel("경과 시간")).toHaveText(/00:0[01]/)

  // 6. URL로 새 이미지를 이름과 함께 추가 → 목록에 추가되고 그 이미지로 퍼즐이 시작된다 (S3)
  await page.getByLabel("이미지 URL").fill(ADDED_IMAGE_URL)
  await page.getByLabel("이름").fill(ADDED_IMAGE_NAME)
  await page.getByRole("button", { name: "추가" }).click()
  await expect(page.getByText(ADDED_IMAGE_NAME).first()).toBeVisible()
  for (let i = 0; i < 16; i++) {
    await expect(page.getByTestId(`tile-${i}`)).toBeVisible()
  }

  // 7. 페이지를 새로고침 → 추가한 이미지와 4단계에서 남긴 랭킹 기록이 그대로 남아있다 (S13)
  await page.reload()
  await expect(page.getByRole("button", { name: ADDED_IMAGE_NAME })).toBeVisible()
  await page.getByRole("button", { name: firstPresetName! }).click()
  await expect(page.getByText(`1. ${PLAYER_ID}`)).toBeVisible()
})
