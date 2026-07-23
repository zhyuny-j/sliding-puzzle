# sliding-puzzle 구현 계획

## 아키텍처 결정

| 결정 | 선택 | 이유 |
|---|---|---|
| 상태 관리 | 외부 상태 라이브러리 없이 React 커스텀 훅(`hooks/use-puzzle.ts` 등)만 사용 | 단일 페이지 규모의 클라이언트 상태라 Context/외부 lib 도입 비용이 이득보다 큼 |
| 페이지 구조 | `app/page.tsx`는 얇은 서버 컴포넌트로 두고, 상태·타이머·localStorage를 쓰는 실제 화면은 `components/puzzle/puzzle-app.tsx`에 `"use client"`로 분리 | 기존 `component-example.tsx` 패턴과 동일, Next.js RSC 경계 규칙 준수 |
| 이미지 정사각 크롭 | 서버/캔버스 처리 없이 CSS(`aspect-ratio:1/1`, `background-size`, `background-position`)로 4X4 타일 슬라이싱 구현 | URL 이미지를 그대로 클라이언트에서 활용, 별도 이미지 처리 파이프라인 불필요 |
| 셔플 알고리즘 | Fisher-Yates로 섞은 뒤 permutation parity(순열 패리티) 검사로 풀 수 없는 배치면 재셔플 | INV-1(항상 풀 수 있는 배치)을 순수 함수로 보장 |
| 데이터 저장 | `localStorage`를 `services/*-storage.ts`로 래핑, 이미지 id를 key로 하는 구조로 이미지별 분리 저장 | 백엔드 없음(spec 제외 항목), S9-3 이미지별 랭킹 요구 충족 |
| 랭킹 정렬·상한 | 저장 시점에 소요 시간 오름차순 정렬 후 상위 10개만 유지 | INV-5, 무한정 누적 방지 |
| 테마 적용 방식 | `components/ui/*` 직접 수정 금지, CSS 변수 재정의·`app/globals.css` 커스텀 클래스로 레트로 스타일 적용 | `.claude/rules/shadcn-guard.md` 가드레일 |
| 데모 파일 정리 | `components/component-example.tsx`, `components/example.tsx` 삭제 | 사용자 확인 완료 — 퍼즐 화면 교체 후 미사용 코드가 되므로 제거 |

## 인프라 리소스

None (백엔드·외부 서비스 없음, 브라우저 `localStorage`만 사용)

## 데이터 모델

### PuzzleImage
- id (string, required)
- name (string, required)
- url (string, required)
- isPreset (boolean, required)

### RankingEntry
- playerId (string, required, 1~20자)
- timeMs (number, required)
- recordedAt (number, required) → 동시간 tie-break 및 표시 순서 보조용

### RankingsByImage
- [imageId: string] → RankingEntry[] (저장 시 오름차순 정렬 + 상위 10개로 절단)

## 필요 스킬

| 스킬 | 적용 Task | 용도 |
|---|---|---|
| shadcn | 2, 3, 5, 6, 8, 9, 11 | 기존 컴포넌트(Card, Button, Field, AlertDialog 등) 재사용, 스타일링 규칙 준수 |
| next-best-practices | 2 | Server/Client 컴포넌트 경계 확인 |
| vercel-react-best-practices | 3, 4 | 퍼즐 그리드 재렌더링 최적화 판단 |
| web-design-guidelines | 11 | 레트로 테마 적용 후 대비·접근성 점검 (Human review) |

## 영향 받는 파일

| 파일 경로 | 변경 유형 | 관련 Task |
|---|---|---|
| `types/puzzle.ts` | New | 2, 6 |
| `config/puzzle-presets.ts` | New | 2 |
| `lib/puzzle-shuffle.ts` | New | 1 |
| `lib/format-time.ts` | New | 3 |
| `lib/validate-nickname.ts` | New | 5 |
| `services/image-library-storage.ts` | New | 8 |
| `services/ranking-storage.ts` | New | 6 |
| `hooks/use-puzzle.ts` | New | 3, 4, 5, 7 |
| `hooks/use-image-library.ts` | New | 8 |
| `hooks/use-ranking.ts` | New | 6 |
| `components/puzzle/puzzle-app.tsx` | New | 2, 8, 9 |
| `components/puzzle/puzzle-board.tsx` | New | 3, 4, 7 |
| `components/puzzle/success-panel.tsx` | New | 5, 6, 7 |
| `components/puzzle/ranking-panel.tsx` | New | 6 |
| `components/puzzle/add-image-form.tsx` | New | 8 |
| `components/puzzle/switch-confirm-dialog.tsx` | New | 9 |
| `app/page.tsx` | Modify | 2 |
| `app/globals.css` | Modify | 11 |
| `components/component-example.tsx` | Delete | 2 |
| `components/example.tsx` | Delete | 2 |
| `e2e/sliding-puzzle-persistence.spec.ts` | New | 10 |

## Tasks

크기(S/M) 기준은 신규·수정되는 구현 파일 수로 센다. Colocated 테스트 파일(`*.test.ts(x)`)은 구현 파일 1개당 자연히 따라붙는 것으로 보고 별도로 세지 않는다.

### Task 1: 셔플 알고리즘과 solvability 보장 ✅ 완료 (commit 2e0a28e)

- **담당 판정 기준**: S5, INV-1
- **크기**: S (1~2 파일)
- **의존성**: None
- **참조**:
  - spec.md 의존성 참고자료 (Wikipedia Sliding puzzle — 순열 패리티)
- **구현 대상**:
  - `lib/puzzle-shuffle.ts` (해결 상태 보드 생성, 역순 개수 계산, solvability 판정, 항상 풀 수 있는 셔플 생성)
  - `lib/puzzle-shuffle.test.ts`
- **검증**: `bun run test -- puzzle-shuffle` — 셔플을 반복 실행해 매번 `isSolvable(board) === true`인지, 초기 정렬 상태와 달라지는지 확인 (`[S5]`, `[INV-1]` 인용)

---

### Task 2: 페이지 셸 + 기본 프리셋 이미지 목록 + 빈 상태 ✅ 완료 (commit 26d47ba)

- **담당 판정 기준**: S1-1, S1-2, S1-3, S1-4
- **크기**: M (3~5 파일)
- **의존성**: None
- **참조**:
  - shadcn (Card, Button 컴포넌트 재사용)
  - next-best-practices (Server/Client 경계 — `component-example.tsx`의 기존 client wrapper 패턴 참고)
- **구현 대상**:
  - `types/puzzle.ts`
  - `config/puzzle-presets.ts` (프리셋 이미지 4~6장, 이름 포함)
  - `components/puzzle/puzzle-app.tsx` (`"use client"`, 타이틀 + 3분할 레이아웃 + 이미지 미선택 시 빈 상태 안내)
  - `components/puzzle/puzzle-app.test.tsx`
  - `app/page.tsx` (Modify: `ComponentExample` → `PuzzleApp`)
  - `components/component-example.tsx`, `components/example.tsx` (Delete)
- **검증**: `bun run test -- puzzle-app` (`[S1-1]`~`[S1-4]` 인용), `bun run typecheck`

---

### Task 3: 프리셋 이미지 선택 → 퍼즐 시작 (그리드 렌더링·정사각 크롭·타이머) ✅ 완료 (commit 981d793)

- **담당 판정 기준**: S2-1, S2-2, S2-3, S2-4, INV-2, INV-4
- **크기**: M (3~5 파일)
- **의존성**: Task 1 (셔플), Task 2 (레이아웃·프리셋 목록)
- **참조**:
  - vercel-react-best-practices (`rerender-` 카테고리 — 그리드 리렌더 최소화)
- **구현 대상**:
  - `hooks/use-puzzle.ts` (선택된 이미지로 보드 초기화, 타이머 시작)
  - `hooks/use-puzzle.test.ts`
  - `lib/format-time.ts` (ms → `mm:ss`)
  - `lib/format-time.test.ts`
  - `components/puzzle/puzzle-board.tsx` (4X4 그리드, 타일 배경 슬라이싱으로 정사각 크롭 표현, 타이머 표시)
  - `components/puzzle/puzzle-board.test.tsx`
- **검증**: `bun run test -- use-puzzle format-time puzzle-board` (`[S2-1]`~`[S2-4]`, `[INV-2]`, `[INV-4]` 인용)

---

### Checkpoint: Tasks 1~3 이후
- [ ] 모든 테스트 통과: `bun run test`
- [ ] 빌드 성공: `bun run build`
- [ ] 커버리지 검사 통과: `scripts/spec-coverage.sh sliding-puzzle --tests`
- [ ] 프리셋 이미지를 선택하면 셔플된 4X4 퍼즐과 타이머가 나타나는 흐름이 end-to-end로 동작

---

### Task 4: 조각 이동 인터랙션 ✅ 완료 (commit 4686f63)

- **담당 판정 기준**: S6-1, S7
- **크기**: S (1~2 파일)
- **의존성**: Task 3
- **구현 대상**:
  - `hooks/use-puzzle.ts` (Modify: `moveTile` 로직 추가)
  - `components/puzzle/puzzle-board.tsx` (Modify: 타일 클릭 핸들러)
- **검증**: `bun run test -- use-puzzle puzzle-board` (`[S6-1]`, `[S7]` 인용)

---

### Task 5: 퍼즐 완성 판정 + Success 화면 + 빈 아이디 검증 ✅ 완료 (commit 73801ac)

- **담당 판정 기준**: S8-1, S8-2, S8-3, S8-4, S10
- **크기**: M (3~5 파일)
- **의존성**: Task 4
- **참조**:
  - shadcn (Field + FieldDescription으로 `data-invalid`/`aria-invalid` 검증 상태 표현)
- **구현 대상**:
  - `lib/validate-nickname.ts` (1~20자, 공백 불가)
  - `lib/validate-nickname.test.ts`
  - `hooks/use-puzzle.ts` (Modify: 완성 판정 시 타이머 정지)
  - `components/puzzle/success-panel.tsx` (완성 이미지, 최종 시간, 아이디 입력 — wireframe의 `success`/`ranked` 화면처럼 가운데 패널 콘텐츠를 교체하는 인라인 컴포넌트다. 왼쪽·오른쪽 패널을 가리는 전체 화면 모달이 아니다)
  - `components/puzzle/success-panel.test.tsx`
- **검증**: `bun run test -- use-puzzle success-panel validate-nickname` (`[S8-1]`~`[S8-4]`, `[S10]` 인용)

---

### Checkpoint: Tasks 4~5 이후
- [ ] 모든 테스트 통과: `bun run test`
- [ ] 빌드 성공: `bun run build`
- [ ] 커버리지 검사 통과: `scripts/spec-coverage.sh sliding-puzzle --tests`
- [ ] 조각을 순서대로 클릭해 퍼즐을 완성하면 Success 화면이 뜨는 흐름이 end-to-end로 동작

---

### Task 6: 아이디 제출 → 랭킹 반영·표시 ✅ 완료 (commit 863e061)

- **담당 판정 기준**: S9-1, S9-2, S9-3, INV-5
- **크기**: M (3~5 파일)
- **의존성**: Task 5
- **구현 대상**:
  - `types/puzzle.ts` (Modify: `RankingEntry` 추가)
  - `services/ranking-storage.ts` (이미지별 저장, 정렬, 상위 10개 절단)
  - `services/ranking-storage.test.ts`
  - `hooks/use-ranking.ts`
  - `hooks/use-ranking.test.ts`
  - `components/puzzle/ranking-panel.tsx`
  - `components/puzzle/ranking-panel.test.tsx`
  - `components/puzzle/success-panel.tsx` (Modify: 제출 핸들러 연결)
- **검증**: `bun run test -- ranking-storage use-ranking ranking-panel success-panel` (`[S9-1]`~`[S9-3]`, `[INV-5]` 인용)

---

### Task 7: Reset 버튼 ✅ 완료 (commit 47d89c3)

- **담당 판정 기준**: S11-1, S11-2, S11-3
- **크기**: S (1~2 파일, `puzzle-board.tsx`/`success-panel.tsx`는 기존 파일에 버튼을 추가하는 Modify라 신규 구현 파일은 `use-puzzle.ts` 훅 로직뿐이다)
- **의존성**: Task 3, Task 5
- **구현 대상**:
  - `hooks/use-puzzle.ts` (Modify: `reset` 함수 — 재셔플, 타이머 초기화, 완성 상태 해제)
  - `components/puzzle/puzzle-board.tsx` (Modify: Reset 버튼 — 진행 중 상태, S11 Given의 첫 번째 경우)
  - `components/puzzle/success-panel.tsx` (Modify: Reset 버튼 — S11 Given은 "진행 중이거나 **완성된 상태**"를 모두 포함하므로, Success/랭킹 반영 화면에도 동일한 Reset이 있어야 S11-3을 충족한다)
- **검증**: `bun run test -- use-puzzle puzzle-board success-panel` (`[S11-1]`~`[S11-3]` 인용)

---

### Checkpoint: Tasks 6~7 이후
- [ ] 모든 테스트 통과: `bun run test`
- [ ] 빌드 성공: `bun run build`
- [ ] 커버리지 검사 통과: `scripts/spec-coverage.sh sliding-puzzle --tests`
- [ ] 완성 → 아이디 제출 → 랭킹 반영 → Reset까지 한 사이클이 end-to-end로 동작

---

### Task 8: URL로 이미지 추가 (성공/실패) ✅ 완료 (commit 7acd643)

- **담당 판정 기준**: S3-1, S3-2, S4
- **크기**: M (3~5 파일)
- **의존성**: Task 2, Task 3 (S3-2가 "추가된 이미지로 퍼즐이 시작되고 타이머가 흐른다"를 요구하므로 Task 3의 `use-puzzle`/`puzzle-board`가 먼저 존재해야 한다)
- **참조**:
  - shadcn (FieldGroup + Field, `data-invalid` 검증 패턴)
- **구현 대상**:
  - `services/image-library-storage.ts` (이미지 목록 localStorage 저장/로드)
  - `services/image-library-storage.test.ts`
  - `hooks/use-image-library.ts` (`addImage` — `Image` 로드 성공/실패 확인 후 추가)
  - `hooks/use-image-library.test.ts`
  - `components/puzzle/add-image-form.tsx` (URL·이름 입력, 에러 메시지)
  - `components/puzzle/add-image-form.test.tsx`
  - `components/puzzle/puzzle-app.tsx` (Modify: 폼 연결, 추가 시 자동 선택)
- **검증**: `bun run test -- image-library-storage use-image-library add-image-form` (`[S3-1]`, `[S3-2]`, `[S4]` 인용)

---

### Task 9: 진행 중 다른 이미지로 전환 시 확인 ✅ 완료 (commit 8a1fdad)

- **담당 판정 기준**: S12-1, S12-2, S12-3
- **크기**: S (1~2 파일)
- **의존성**: Task 3, Task 8
- **참조**:
  - shadcn (기존 설치된 AlertDialog 컴포넌트 재사용 — 신규 컴포넌트 설치 불필요)
- **구현 대상**:
  - `components/puzzle/switch-confirm-dialog.tsx` (AlertDialog 기반)
  - `components/puzzle/switch-confirm-dialog.test.tsx`
  - `components/puzzle/puzzle-app.tsx` (Modify: 진행 중 다른 이미지 클릭 시 다이얼로그 개입)
- **검증**: `bun run test -- switch-confirm-dialog puzzle-app` (`[S12-1]`~`[S12-3]` 인용)

---

### Checkpoint: Tasks 8~9 이후
- [ ] 모든 테스트 통과: `bun run test`
- [ ] 빌드 성공: `bun run build`
- [ ] 커버리지 검사 통과: `scripts/spec-coverage.sh sliding-puzzle --tests`
- [ ] URL로 이미지를 추가하고, 진행 중 다른 이미지로 전환을 시도하는 흐름이 end-to-end로 동작

---

### Task 10: 새로고침 시 이미지 목록·랭킹 유지 (영속성 통합 검증) ✅ 완료

- **담당 판정 기준**: S13-1, S13-2, INV-3
- **크기**: S (1~2 파일)
- **의존성**: Task 6 (랭킹 저장), Task 8 (이미지 저장)
- **구현 대상**:
  - `e2e/sliding-puzzle-persistence.spec.ts` (Playwright: 이미지 추가 → 랭킹 등록 → reload → 유지 확인)
  - 위 테스트 실행 중 마운트 시 저장소 로드 누락이 발견되면 `hooks/use-image-library.ts` / `hooks/use-ranking.ts`에 최소 수정 (Modify)
- **검증**: `bun run test:e2e -- sliding-puzzle-persistence` (`[S13-1]`, `[S13-2]`, `[INV-3]` 인용)

---

### Task 11: 레트로 게임 스타일 테마 적용 ✅ 완료

**검증 방식 참고**: `artifacts/sliding-puzzle/evidence/task-11.png` 파일 저장 대신, 세션 내 실제 브라우저(Claude in Chrome)로 확인한 스크린샷을 사용자에게 인라인으로 제시했다 — 이 harness에서는 Browser MCP 스크린샷이 "pane not displayed"로 실패하고, Claude in Chrome의 `save_to_disk`도 로컬 파일 경로를 반환하지 않아 디스크 저장 경로를 확인할 수 없었다.

- **담당 판정 기준**: 없음 (spec 범위에 명시된 시각 요구사항이나 개별 시나리오 ID가 없음)
- **크기**: M (3~5 파일)
- **의존성**: Task 2, 3, 5, 6, 7, 8, 9 (테마를 입힐 컴포넌트가 모두 존재해야 함)
- **참조**:
  - shadcn (CSS 변수 재정의 우선순위, `components/ui/*` 직접 수정 금지 — `.claude/rules/shadcn-guard.md`)
  - web-design-guidelines (대비·접근성 확인)
- **구현 대상**:
  - `app/globals.css` (Modify: 레트로 팔레트 CSS 변수, 픽셀 보더·스캔라인 유틸리티 클래스)
  - `app/layout.tsx` (Modify: 필요 시 픽셀 폰트 적용 확인)
- **검증**: Human review — 자동화 불가(디자인 판단). 스크린샷을 `artifacts/sliding-puzzle/evidence/task-11.png`에 저장하고, 레트로 게임 톤(픽셀 폰트/보더, 고채도 팔레트)과 텍스트 대비를 리뷰어가 확인

---

### 최종 Checkpoint
- [ ] spec.md의 **End-to-end 검증** 절차를 실행하고, 통과한 판정 기준의 체크박스를 spec.md에서 켠다 (체크는 실행 증거로만 켠다)

## 미결정 항목

- 없음
