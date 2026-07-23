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

---
triggers: [Playwright, page.addInitScript, Math.random, Next.js dev, HMR, Fast Refresh, next dev, E2E flaky, 상태 초기화, 셔플 결정론]
status: verified
scope: this-repo (Next.js 16.1.6 dev server, Playwright)
date: 2026-07-23
---
## Playwright E2E에서 `window.Math.random`을 전역 스텁하면 Next.js dev 서버의 HMR이 예상치 않게 재연결되어 컴포넌트가 리마운트되고 비영속 state가 사라진다

**지시문**: 셔플처럼 `Math.random`에 의존하는 로직을 Playwright E2E에서 결정론적으로 만들고 싶어도 `page.addInitScript(() => { window.Math.random = () => 0 })`로 전역을 덮어쓰지 않는다. `next dev`(HMR/Fast Refresh) 환경에서 이 스텁을 걸면 원인 불명의 추가 HMR 재연결이 발생하고, 그 사이 `localStorage`에 저장되지 않는 React state(`useState`로만 관리되는 `selectedImage` 등)가 리마운트로 초기화돼 있을 수 있다 — `add-image-form`은 성공 시 필드를 비웠는데도(성공 경로 확정) 정작 화면은 "이미지를 선택해주세요"로 돌아가 있는 모순된 상태로 나타났다. 대신 화면에 실제로 렌더된 보드를 `page.evaluate`로 읽어(`aria-label="조각 N"` 파싱) 그 값을 그대로 풀이(IDA* 등)해 클릭 순서를 계산하면, 셔플 알고리즘을 스텁하지 않고도 결정론적으로 완주할 수 있다.

**에피소드**: Task 10 E2E(`e2e/sliding-puzzle-persistence.spec.ts`)에서 셔플 결과를 고정하려고 `Math.random` 스텁 + 미리 계산한 47수 이동 시퀀스를 하드코딩했으나, 매 실행마다 `tile-0`이 끝내 나타나지 않고 타임아웃됐다. 디버그 로그로 `[HMR] connected`가 예상보다 한 번 더 찍히는 것과, add-image 폼 필드는 비어 있는데(성공) 화면은 빈 상태로 돌아간 것을 확인해 리마운트로 인한 state 유실을 의심했다. 스텁을 제거하고 실제 렌더된 보드를 읽어 그때그때 IDA*로 풀이하는 방식으로 바꾸자 즉시 통과했다(8.7s).

**증거**: `sliding-puzzle-persistence.spec.ts`의 동적 solve() 방식으로 `[S13-1][S13-2][INV-3]` 테스트 1개 통과; `bun run test`(72 passed), `bun run typecheck`, `scripts/spec-coverage.sh sliding-puzzle --tests` 전체 통과.

---
triggers: [Turbopack, .next 캐시, CSS 변수 반영 안 됨, :root, @theme inline, HMR CSS 안 먹음, next dev 재시작]
status: verified
scope: this-repo (Next.js 16.1.6, Turbopack dev)
date: 2026-07-23
---
## `app/globals.css`의 `:root`/`.dark` CSS 변수를 수정해도 Turbopack dev 서버가 오래된 값을 계속 서빙할 수 있다 — `.next` 캐시를 지우고 재시작해야 한다

**지시문**: `globals.css`에서 `:root`/`.dark`의 CSS 커스텀 프로퍼티(`--primary` 등)를 바꿨는데 브라우저에 반영되지 않으면(리로드해도 동일), 먼저 서빙되는 CSS 청크를 직접 `curl`로 받아 실제 값이 바뀌었는지 확인한다. 바뀌지 않았다면 dev 서버를 재시작하는 것만으로는 부족할 수 있다 — `.next` 디렉터리를 통째로 삭제(`rm -rf .next`)한 뒤 재시작해야 Turbopack이 해당 CSS를 다시 컴파일한다. HMR이 살아있는 상태에서의 일반적인 컴포넌트/로직 변경은 즉시 반영되지만, 이 세션에서는 `:root` 레벨 CSS 변수 변경이 캐시된 청크 해시(`[root-of-the-server]__*.css`)로 재사용되어 반영되지 않는 것을 관찰했다.

**에피소드**: Task 11에서 레트로 팔레트로 `--primary`를 마젠타(`oklch(0.68 0.24 340)`)로 바꿨지만, 브라우저에서는 계속 원래 인디고 색이 보였다. `getComputedStyle`로 확인해도 이전 값이었다. 서빙되는 CSS 청크를 `curl`로 직접 받아보니 옛 값이 그대로 있었다 — dev 서버를 단순 재시작(`preview_stop`+`preview_start`)해도 동일 청크 해시가 재사용되며 변하지 않았고, `.next`를 삭제한 뒤에야 새 값이 반영됐다.

**증거**: `curl .../[root-of-the-server]__4baccfb0._.css`가 `.next` 삭제 전에는 `--primary: #432dd7`, 삭제 후 재시작하면 `--primary: #f147c6`로 바뀌는 것을 확인.

---
triggers: [next/font/google, 한글 폰트, Press_Start_2P, 픽셀 폰트, subsets, Hangul, font fallback, letter-spacing 이상, 폰트 metrics]
status: verified
scope: this-repo (next/font/google, Next.js 16.1.6)
date: 2026-07-23
---
## 라틴 전용 웹폰트를 한글 텍스트에 적용하면 폰트가 조용히 fallback되면서 글자 간격이 깨진다 — next/font/google `subsets`의 타입이 허용하는 값이 실제 스크립트 지원과 무관할 수 있다

**지시문**: 레트로/픽셀 느낌을 내려고 `Press_Start_2P` 같은 라틴 전용 디스플레이 폰트를 한글이 포함된 heading에 적용하지 않는다 — 해당 폰트에 한글 글리프가 없으면 브라우저가 문자 단위로 폴백 폰트를 쓰면서도 원래 폰트의 넓은 advance width 메트릭을 참조해, 단어 사이에 비정상적으로 큰 공백이 생긴다(겉보기엔 `letter-spacing` 버그처럼 보이지만 실제로는 font-fallback 메트릭 불일치). 한글이 포함된 프로젝트에서 게임/레트로 톤의 heading 폰트가 필요하면 `Do_Hyeon`, `Black_Han_Sans`처럼 실제로 한글 글리프를 제공하는 Google Fonts를 쓴다. 단, next/font/google의 TypeScript 타입상 `subsets` 허용값이 `["latin"]`뿐인 한글 전용 폰트도 있다(`Do_Hyeon` 확인) — 이 타입은 실제 스크립트 커버리지와 무관하므로 `subsets: ["latin"]`으로 지정해도 한글이 정상 렌더링되는지 반드시 실제 브라우저로 확인한다.

**에피소드**: Task 11에서 타이틀에 `Press_Start_2P`를 `--font-heading`으로 적용했더니, 실제 브라우저 스크린샷에서 "내가 원하는 사진으로 퍼즐 만들기"가 단어마다 큰 간격이 뜬 채로 깨져 보였다. `Black_Han_Sans({subsets:["korean"]})`로 바꾸려 하자 `tsc`가 `Type '"korean"' is not assignable to type '"latin"'` 에러를 냈고, `Do_Hyeon`도 동일했다 — 두 폰트 모두 next/font/google 타입 선언상 `subsets`가 `["latin"]`만 허용했다. `Do_Hyeon({subsets:["latin"]})`으로 지정하고 실제 브라우저에서 확인하니 한글이 정상적인 간격으로 렌더링됐다(타입의 "latin" 라벨이 실제 글리프 커버리지를 반영하지 않음).

**증거**: Claude in Chrome 스크린샷으로 `Press_Start_2P` 적용 시 "내가 원하는 사진으로 퍼즐 만들기"의 단어 간격이 비정상적으로 벌어진 것을 확인; `Do_Hyeon`으로 교체 후 동일 화면에서 정상 렌더링 확인. `bun run typecheck`/`bun run build` 모두 통과.
