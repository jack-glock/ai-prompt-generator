# ARCHITECTURE — AI Prompt Generator

> 마지막 갱신: 26-04-28 (v0.4 라이브 반영)

## 1. 정체성

한글/영어 이미지 요청을 입력하면 **GPT Image / Nano Banana / Midjourney / Niji** 용 영어 프롬프트를 동시 생성하는 단일 페이지 웹앱.

- **백엔드 없음.** 모든 로직은 브라우저에서 동작.
- **외부 API 호출 없음.** 번역기·이미지 생성 API 모두 미연결 (1차 정책).
- **상태 저장 없음.** 새로고침하면 입력은 초기화 (의도적).
- **사용자 영어 직접 입력.** 한글 textarea(메모용) + 영어 textarea(빌더용) 분리. ChatGPT 등 외부 도구로 사용자 본인이 번역해 붙여넣음.

---

## 2. 기술 스택

| 레이어 | 선택 | 채택 이유 |
|---|---|---|
| 프레임워크 | Next.js 14 (App Router) | Vercel 자동 배포, RSC 기본, 사용자 익숙 |
| 언어 | TypeScript 5 | `PromptInput` / `PromptOutput` / `ModelKey` 타입 강제로 빌더 안전성 확보 |
| 스타일 | Tailwind CSS 3 | 디자이너가 픽셀 단위 직접 조정 |
| 아이콘 | lucide-react ^0.468 | 라인 스타일 일관성 |
| 호스팅 | Vercel | GitHub push → 자동 빌드·배포 |

---

## 3. 폴더 구조

```
D:\AI Prompt Generator\
├── app/
│   ├── layout.tsx          # 전체 레이아웃 (한국어 페이지)
│   ├── page.tsx            # 메인 화면 (입력 사이드바 + 6 결과 카드)
│   └── globals.css         # Tailwind + 전역 스타일
├── lib/
│   └── promptBuilder.ts    # 프롬프트 생성 핵심 로직 (12종 모델 분기 + 하이라이트 토큰)
├── docs/
│   ├── design-docs/        # 설계 문서 (PROMPT_STRATEGY, UI_DESIGN)
│   ├── product-specs/      # 수용 기준 (FEATURES, ACCEPTANCE)
│   ├── model-specs/        # 모델별 빌더 사양 (README + 4 모델 + xlsx 비교표)
│   ├── references/         # 외부 레퍼런스 인덱스
│   └── exec-plans/         # 실행 계획 (ROADMAP, BACKLOG)
├── AGENTS.md               # 진입점 안내판
├── ARCHITECTURE.md         # 이 파일
├── CLAUDE.md               # 다음 세션용 컨텍스트 인덱스
├── QUALITY_SCORE.md        # 품질 루브릭
├── SECURITY.md             # 보안 규칙
├── package.json            # 의존성
├── tailwind.config.ts      # Tailwind 설정 (brand 컬러)
├── tsconfig.json           # TypeScript 설정 (`@/*` 경로 별칭)
└── next.config.mjs         # Next.js 설정
```

핵심 코드는 **2개 파일만** 본질적이다:
- `app/page.tsx` (UI · 약 660줄, v0.4 기준)
- `lib/promptBuilder.ts` (로직 · 약 540줄, v0.4 기준)

---

## 4. 데이터 흐름

```
[사용자 입력 — 한글 textarea + 영어 textarea + 옵션들 + 모델 드롭다운 4종]
    ↓ React state (useState)
[PromptInput 객체]  ← lib/promptBuilder.ts 정의
   = { request, englishRequest, workType, style, ratio, ..., forbid }
    ↓ buildPrompts() / buildPromptFor(model, input) · useMemo로 입력 변경 시 자동 재계산
[빌더 출력 — 사용자 옵션 자리는 [[B]]...[[/B]] 토큰으로 감쌈]
    ↓ HighlightedContent 컴포넌트가 토큰 파싱 → <span text-blue-600>
[화면 렌더링 — 6개 카드(요약/GPT/Nano/MJ/Niji/수정)]
    ↓ [복사] 버튼 → stripHighlight() 후 navigator.clipboard.writeText
[사용자 클립보드 — 토큰 없는 plain text]
```

특징:
- **단방향**. 결과는 입력에서만 파생. 결과를 다시 편집해서 입력으로 되돌리지 않음.
- **실시간**. 생성 버튼 누를 필요 없음. `useMemo` 덕분에 100ms 이내 갱신.
- **모델별 차등 처리**: GPT/Nano는 영어+한글 병기, MJ/Niji는 영어만.

---

## 5. 의존성

```json
"dependencies": {
  "lucide-react": "^0.468.0",
  "next": "14.2.5",
  "react": "^18.3.1",
  "react-dom": "^18.3.1"
}
```

- 외부 API 호출 라이브러리(axios, swr 등)는 **금지** (1차 정책).
- 자동 번역 SDK(openai 등)는 **미사용** (26-04-28 정책 결정).
- 상태 관리 라이브러리(redux, zustand 등) **불필요** — 단일 페이지 useState로 충분.
- 신규 패키지 도입 시 `SECURITY.md` §3 점검.

---

## 6. 빌드·실행

| 명령 | 용도 |
|---|---|
| `npm install` | 의존성 다운로드 (`package.json` 변경 시) |
| `npm run dev` | 로컬 개발 서버 → <http://localhost:3000> |
| `npm run build` | 프로덕션 빌드 (push 전 검증 권장) |
| `npm run start` | 빌드 결과 로컬 실행 |
| `npx tsc --noEmit` | TypeScript 타입체크 (빌드 없이 빠르게) |
| `git push origin main` | Vercel 자동 배포 트리거 (60~90초 후 라이브 반영) |

---

## 7. 외부 연결

| 대상 | 위치 | 트리거 |
|---|---|---|
| GitHub | `jack-glock/ai-prompt-generator` | `git push origin main` |
| Vercel | `ai-prompt-generator-two-ebon.vercel.app` | GitHub `main` push 자동 감지 |
| DevSync | `C:\Users\JACK\Desktop\DevSync-project` | DevSync 대시보드의 퇴근 저장·받기·올리기 |

상세 흐름과 관련 프로젝트는 `docs/references/README.md` 참조.

---

## 8. 지원 모델 (v0.4 — 12종)

| 그룹 | 종 | 기본값 |
|---|---|---|
| OpenAI GPT Image | 4종 (gpt-image-2 / 1.5 / 1 / 1-mini) | gpt-image-2 |
| Google Nano Banana | 3종 (Nano Banana / 2 / Pro) | Nano Banana 2 |
| Midjourney | 3종 (V7 / V8 Alpha / V8.1 Alpha) | V8.1 Alpha |
| Niji | 2종 (6 / 7) | Niji 7 |

상세 사양은 `docs/model-specs/`.
