# ARCHITECTURE

> 26-04-28 · v0.5

## 정체성

GPT Image / Nano Banana / Midjourney / Niji 용 영어 프롬프트를 동시 생성하는 단일 페이지 웹앱. **백엔드 없음 / 외부 API 없음 / 상태 저장 없음** (다크 모드 선호만 localStorage).

## 기술 스택

Next.js 14 (App Router) · TypeScript 5 · Tailwind 3 (`darkMode:"class"`) · lucide-react · Vercel.

## 폴더

```
app/
├── layout.tsx       # 다크 FOUC 방지 inline script
├── page.tsx         # UI (입력 8섹션 + 결과 6카드)
└── globals.css      # 라이트/다크 분기
lib/
└── promptBuilder.ts # 12종 모델 + 16종 스타일 + Niji 7항목 + 토큰
docs/  AGENTS.md  ARCHITECTURE.md  CLAUDE.md  QUALITY_SCORE.md  SECURITY.md
```

## 데이터 흐름

```
입력 → useState → PromptInput → buildPromptFor() → [[B]]토큰
   → HighlightedContent 파란색 span → 6 카드
   → 복사/저장 시 stripHighlight()
```

useMemo 100ms 갱신. GPT/Nano = 영어+한글 병기, MJ/Niji = 영어만, Niji는 8번 7항목 우선.

## 의존성

```json
{ "lucide-react": "^0.468.0", "next": "14.2.5", "react": "^18.3.1", "react-dom": "^18.3.1" }
```

외부 API 호출 라이브러리 금지. 신규 패키지는 `SECURITY.md` §3 점검.

## 빌드

| 명령 | 용도 |
|---|---|
| `npm run dev` | 로컬 |
| `npx tsc --noEmit` | 타입체크 |
| `git push origin main` | Vercel 자동 배포 60-90초 |

## 외부 연결

GitHub `jack-glock/ai-prompt-generator` · Vercel `ai-prompt-generator-two-ebon.vercel.app` (Production: `main`) · DevSync `C:\Users\JACK\Desktop\DevSync-project`.

## 모델 12종

GPT 4 (gpt-image-2 기본) · Nano 3 (Nano Banana 2 기본) · MJ 3 (V8.1 Alpha 기본) · Niji 2 (Niji 7 기본). 상세는 `docs/model-specs/`.
