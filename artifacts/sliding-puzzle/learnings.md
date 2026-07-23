---
triggers: [git commit, "M app/layout.tsx", uncommitted changes, feature 단위 커밋, 다른 세션 작업]
status: verified
scope: this-repo
date: 2026-07-23
---
## Task 커밋 전에 파일이 이미 다른 이유로 uncommitted 상태인지 확인한다

**지시문**: Task 파일을 `git add`하기 전에 `git status`로 그 파일이 이미 수정된 상태(다른 세션·이전 작업에서 커밋되지 않은 변경)인지 확인하라. 이미 수정돼 있다면 `git diff <file>`로 내용을 보고, 이번 Task와 무관한 변경이 섞여 있으면 그 파일은 이번 커밋에서 제외하거나(스코프를 줄여서) 무관한 부분을 되돌린 뒤 필요한 부분만 남겨서 커밋하라. `git add -A`나 파일 단위 blanket add로 두 작업을 한 커밋에 섞지 않는다.

**에피소드**: Task 2에서 `app/layout.tsx`의 페이지 타이틀("Kanban Todo" → 퍼즐 서비스명)을 고치려 했으나, 이 파일은 이미 이전 세션(shadcn 프리셋 전환 작업)에서 폰트·테마 관련 변경이 커밋되지 않은 채 남아 있었다. 그대로 `git add app/layout.tsx`를 했다면 무관한 두 작업이 한 커밋에 섞일 뻔했다. 타이틀 변경을 되돌리고 plan.md Task 11(레트로 테마, 이미 `app/layout.tsx`를 건드리는 Task)로 미뤘다.

**증거**: commit 26d47ba (Task 2)는 `app/layout.tsx`를 포함하지 않음; `git diff app/layout.tsx`가 이 커밋 이후에도 여전히 이전 세션의 변경만 보여줌

---
triggers: [jsdom, backgroundImage, style.backgroundPosition, "url(\"...\")", CSSStyleDeclaration, Testing Library]
status: verified
scope: this-repo (jsdom 28.x, vitest 4.x)
date: 2026-07-23
---
## jsdom은 inline background 스타일을 그대로 돌려주지 않고 정규화한다

**지시문**: `element.style.backgroundImage`/`backgroundPosition` 같은 CSS shorthand 값을 jsdom에서 단언할 때는, 설정한 원본 문자열이 아니라 jsdom이 정규화한 값을 기대하라: `background-image: url(x)` → `style.backgroundImage`는 `url("x")`(따옴표 추가)로, `background-position: center`처럼 한 값짜리 shorthand는 `"center center"`(x/y 양쪽 확장)로 나온다. 처음 단언을 쓸 때 원본 문자열을 그대로 기대하지 말고, 실패 메시지의 `Received`를 그대로 기대값으로 채택하라.

**에피소드**: Task 3의 PuzzleBoard(INV-2, 정사각 크롭 슬라이싱) 테스트에서 `backgroundImage`를 `url(${url})`로, `backgroundPosition`을 `"center"`로 기대했다가 둘 다 실패했다. 구현은 맞았고 테스트 기대값만 jsdom의 직렬화 방식과 달랐다.

**증거**: commit 981d793, `puzzle-board.test.tsx`의 `[INV-2]` 테스트가 `url("...")`/`"center center"`로 수정된 뒤 통과

---
triggers: [spec-coverage.sh --tests, 테스트 미인용, S3-2, checkpoint, 통합 테스트 누락]
status: verified
scope: this-repo
date: 2026-07-23
---
## Task 안에서 로직을 구현해도, 그 기준을 직접 인용하는 테스트가 없으면 커버리지가 통과하지 않는다

**지시문**: 한 Task가 여러 판정 기준을 담당할 때, 각 기준마다 그 기준을 직접 인용하는 `[Sx-y]` 테스트가 있는지 Task를 끝내기 전에 스스로 점검하라 — 다른 기준을 검증하는 테스트가 부수적으로 그 동작도 실행한다고 해서 커버된 것이 아니다. `bun run test`가 통과해도 `scripts/spec-coverage.sh <feature> --tests`는 별도로 돌려야 한다.

**에피소드**: Task 8에서 `handleAddImage`가 성공 시 `setSelectedImage(result.image)`를 호출하도록 구현해 S3-2("추가된 이미지 자동 선택")를 만족시켰지만, 이를 직접 증명하는 테스트를 쓰지 않았다. 단위 테스트들은 모두 통과했지만 Checkpoint(Tasks 8~9)에서 `spec-coverage.sh --tests`를 돌리자 "테스트 미인용: S3-2"가 나왔다 — 기계 검사가 사람이 놓친 누락을 잡아냈다.

**증거**: commit e051876, `puzzle-app.test.tsx`에 `[S3-2]` 테스트 추가 후 `scripts/spec-coverage.sh sliding-puzzle --tests`가 S13 계열만 남기고 통과

---
triggers: [document.hidden, visibilityState, animationend, Radix Presence, AlertDialog, data-state, 다이얼로그 안 닫힘, Browser MCP, javascript_tool, CSS animation frozen]
status: verified
scope: this-repo (radix-ui 1.4.3, tw-animate-css 1.4.0, Browser MCP 자동화 환경)
date: 2026-07-23
---
## Browser MCP 자동화 탭은 배경 탭 취급되어 CSS 애니메이션 타임라인이 멈춘다 — Radix Presence가 닫히지 않는 것처럼 보이는 건 실제 버그가 아닐 수 있다

**지시문**: Radix(`AlertDialog`/`Dialog`/`DropdownMenu` 등 Presence 기반 컴포넌트)를 Browser MCP(`javascript_tool`)로 검증할 때, 닫기 동작 후 `data-state="closed"`인데도 `getComputedStyle`상 `display`/`visibility`가 그대로면 즉시 컴포넌트 버그로 단정하지 말고 먼저 `document.hidden`/`document.visibilityState`를 확인하라. `true`/`"hidden"`이면 Chrome이 배경 탭의 CSS 애니메이션 타임라인을 멈춘 것이다 (`element.getAnimations()[0].currentTime`이 0에 고정됨) — Radix `Presence`(`@radix-ui/react-presence`)는 `animationend` DOM 이벤트로만 unmount를 트리거하므로, 이 이벤트가 영영 발생하지 않아 다이얼로그가 계속 마운트된 채 남는다. 실제 사용자의 포커스된 탭에서는 정상적으로 닫힌다. 진단 확인법: `content.dispatchEvent(new AnimationEvent('animationend', {animationName: 'exit'}))`를 수동으로 쏘면 즉시 unmount되는지 확인 — 되면 컴포넌트·CSS·Presence 로직은 정상이고 harness의 탭 가시성 문제임이 증명된다.

**에피소드**: Task 8~9 Checkpoint에서 `SwitchConfirmDialog`의 "취소" 클릭 후 다이얼로그가 DOM에서 사라지지 않는 것을 발견했다. `radix-ui`/shadcn `tailwind.css`의 `@custom-variant data-open`/`data-closed`가 `data-state`도 함께 매칭하는지부터 의심했으나(이미 매칭하도록 되어 있었음, 오탐), 실제 원인은 `document.hidden === true`(Browser MCP 탭이 배경 탭으로 취급됨)로 인한 애니메이션 타임라인 정지였다. `components/ui/alert-dialog.tsx`는 수정하지 않았다 — 코드에는 문제가 없었다.

**증거**: `content.getAnimations()[0]`이 `currentTime: 0`, `playState: "running"`에서 멈춰 있음을 확인; `document.visibilityState === "hidden"` 확인; `dispatchEvent(new AnimationEvent('animationend', {animationName:'exit'}))` 수동 발생 시 다이얼로그 즉시 unmount 확인. S12-2(확인 시 전환)도 이어서 실제 브라우저로 검증: 16 tiles, "⏱ 00:00", 새 이미지 이름 표시 확인.
