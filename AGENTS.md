# AGENTS — AI Prompt Generator 안내판

> 이 파일은 **상세 문서가 아니라 안내판**이다. 어디를 먼저 읽고 무엇을 건너뛸지 알려준다.
> 세부 내용은 해당 문서를 직접 펼쳐 읽는다 (progressive disclosure).

---

## 1. 진입 순서

다음 3개를 차례로 읽으면 5분 내에 프로젝트 전체 그림이 잡힌다.

1. `ARCHITECTURE.md` — 기술 스택·폴더 구조·데이터 흐름
2. `docs/product-specs/FEATURES.md` — 현재 구현 상태 (✅/🟡/⏳/❌)
3. `docs/exec-plans/ROADMAP.md` — 다음 작업

---

## 2. 작업 의도별 추가 문서

| 하려는 일 | 펼쳐볼 곳 |
|---|---|
| 프롬프트 생성 규칙 수정 | `docs/design-docs/PROMPT_STRATEGY.md` → `lib/promptBuilder.ts` |
| UI(레이아웃·색·동작) 변경 | `docs/design-docs/UI_DESIGN.md` → `app/page.tsx` |
| 새 옵션 추가 | `docs/product-specs/FEATURES.md` → 위 두 곳 |
| 배포·CI 흐름 확인 | `ARCHITECTURE.md` §6,§7 |
| 보류된 일 확인 | `docs/exec-plans/BACKLOG.md` |
| 외부 도구·관련 프로젝트 | `docs/references/README.md` |

---

## 3. 작업 전 필수 확인

- `SECURITY.md` — 절대 어기지 말 것 (API 키, 업로드 처리 등)
- `QUALITY_SCORE.md` — 코드·문서 품질 합격 기준

---

## 4. 안 읽어도 되는 곳

| 위치 | 이유 |
|---|---|
| `node_modules/` | 의존성. `package.json`만 보면 됨 |
| `.next/` | 빌드 산출물. Git 미추적 |
| `.devsync/` | DevSync 로컬 캐시. PC별. Git 미추적 |
| `next-env.d.ts` | Next.js 자동 생성 |

---

## 5. 현재 상태 (요약)

- 버전: **v0.2** (26-04-28)
- 라이브: <https://ai-prompt-generator-two-ebon.vercel.app/>
- 저장소: <https://github.com/jack-glock/ai-prompt-generator>
- 외부 API: 미연결 (1차 의도적 제약)
- DevSync 등록: v1.4.7부터

---

## 6. 작업 종료 시 체크

- 코드 변경 → 해당 design-docs 또는 product-specs 갱신
- 새 기능 → `FEATURES.md` 추가 + `BACKLOG.md`에서 제거
- 의도적 미구현 → `BACKLOG.md`에 `P-` 표기로 사유 기록
- 날짜 표기 일관성: **YY-MM-DD** (예: 26-04-28)
- DevSync 흐름과 결합되어 있으므로 큰 변경은 `C:\Users\JACK\Desktop\DevSync-project\docs\CHANGELOG.md` 에도 한 줄 추가 검토
