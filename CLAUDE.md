# CLAUDE.md — 다음 세션용 인덱스

> 26-04-29 · 현재 **v0.7** 라이브
> 본문은 `docs/`에. 이 파일은 핵심 사실만.

## 한 줄 요약

게임 그래픽 디자이너용 이미지 프롬프트 생성기. GPT Image / Nano Banana / Midjourney / Niji **12종 모델** + **17종 스타일**. 라이트/다크 모드. **Gemini 2.5 Flash 연동**으로 AI 번역·옵션 채우기·이미지 분석 지원.

- GitHub: <https://github.com/jack-glock/ai-prompt-generator>
- Live: <https://ai-prompt-generator-two-ebon.vercel.app/>
- DevSync 등록: v1.4.7부터

## 기술 스택

Next.js 14.2.5 · React 18.3 · TypeScript 5.5 · Tailwind 3.4 (`darkMode:"class"`) · lucide-react · **Gemini 2.5 Flash API** (서버 라우트 경유, 키는 서버 전용 환경변수).

## 핵심 파일

| 파일 | 역할 |
|---|---|
| `app/page.tsx` (~1,300줄) | UI 전체 + 핸들러 |
| `lib/promptBuilder.ts` (~970줄) | 빌더 (영어 4개 + GPT/Nano 한국어 2개) + summary + revision |
| `lib/options.ts` (~640줄) | 옵션 데이터 (라벨·영어·desc 매핑) + 모델 라인업 |
| `lib/keywordExtract.ts` (~330줄) | 키워드 매칭 (단어 경계 + 한·영) |
| `lib/aiClient.ts` (~170줄) | Gemini 호출 helper + `mergeAiHints` |
| `app/api/ai/translate/route.ts` | 한글 → 영어 번역 (서버) |
| `app/api/ai/extract/route.ts` | 자유입력 → 옵션 슬롯 자동 분배 (서버) |
| `app/api/ai/analyze-image/route.ts` | Vision 이미지 분석 (서버, 역할 기반 슬롯 분리) |
| `app/layout.tsx` | 다크 모드 FOUC 방지 inline script |

## docs/ 지도

- `KNOWLEDGE_MAP.md` 저장소 운영 원칙 (AGENTS.md = 안내판, 상세는 docs/)
- `design-docs/` PROMPT_STRATEGY · UI_DESIGN
- `product-specs/` FEATURES · ACCEPTANCE
- `model-specs/` README + GPT_IMAGE / NANO_BANANA / MIDJOURNEY / NIJI + xlsx
- `exec-plans/` ROADMAP · BACKLOG · CHANGELOG (v0.7부터)
- `references/` README

## 현재 상태 (v0.7)

### 입력 영역
- 한글 자유입력 (메모) / 영어 보충 입력 (textarea 2개)
- 옵션 채우기 버튼 2개 (영어 보충 아래)
  - **키워드로 옵션 채우기** — 즉시·무료, slate 톤
  - **AI로 옵션 채우기** — Gemini 호출(~3원), emerald 톤
- 참고 이미지 1행 3슬롯 (정사각형 클릭/드롭) — 슬롯별 **역할 기반 분석 버튼**
- 작업 유형 5종 chip (캐릭터/배경/프레임/아이콘/오브젝트)
- 스타일 17종 (자동/직접 입력 포함, 각 옵션 hover 툴팁 desc)
- 비율 / 빼고 싶은 것 / 작업유형별 옵션 (캐릭터·배경·에셋)
- **옵션 그룹별 사용 토글 8개** (iOS 스위치, emerald) + localStorage

### 결과 영역
- 정리된 요청 요약 (2열 표 + 태그)
- GPT Image 카드 — 문장형, **EN/한국어 토글**
- Nano Banana 카드 — **자연어 문장형** (Google 권장), 모델별 capability 차등 (원본/2/Pro), **EN/한국어 토글**
- Midjourney 카드 — 키워드만 (dash 파라미터 없음, Discord에서 직접 추가)
- Niji 카드 — 애니 키워드만 (dash 파라미터 없음)
- 수정 요청용 카드 (Keep/Change/Remove)
- 복사 버튼은 본문 박스 우상단 floating

### Gemini API 연동
- 모델: `gemini-2.5-flash`
- 비용 추정: 번역 ~1원, 옵션 추출 ~3원, 이미지 분석 ~3원 (1회당)
- 무료 티어 안에서 개인 사용 충분
- 키 보안: `process.env.GEMINI_API_KEY` (서버 라우트 전용, `NEXT_PUBLIC_` 미사용)
- 분석 완료 시 버튼 emerald → slate + ✓ (입력 바뀌면 emerald 복귀)

## 다음 작업 — v0.8 후보

1. **P1** 프롬프트 즐겨찾기 (localStorage)
2. **P1** 결과 비교 모드 (좌우 분할)
3. **P2** 추천 프롬프트 갤러리
4. **P2** 옵션 그룹 자동/수동 모드 추가 안내
5. **P3** 이미지 외부 호스팅 자동 업로드 (MJ/Niji `--sref` 자동 채우기)

## 컨벤션 핵심

- **자동 번역 없음 → AI 번역 버튼 추가** (사용자가 의식적으로 누름)
- **모델별 차등**:
  - GPT Image / Nano Banana = 영어 + 한국어 빌더 (한·영 토글)
  - MJ / Niji = 영어만 (한·영 토글 없음)
- **한글 격리 정책**:
  - 한글 메모는 GPT/Nano 한국어 토글의 "작가 메모:"에만 들어감
  - MJ/Niji 영어 빌더에는 한글 절대 미포함 (스모크 테스트로 검증)
  - 영어 보충 입력은 영어 빌더 전용 (한국어 빌더에서 제외)
  - 직접 입력에 한글이 섞이면 영어 프롬프트에서 자동 차단
- **AI 응답 빈 문자열 처리**: `mergeAiHints`에서 옵션 슬롯의 `""`은 무시 (옵션 무효화 방지). `*Custom` 필드는 빈 문자열도 의미 있음.
- **다크 모드**: 모든 색상에 `dark:` variant 동시 정의.
- **참고 이미지**: dataURL(base64)로 메모리에만. MJ/Niji에 외부 URL 자동 첨부는 안 함.
- 날짜 YY-MM-DD. 파일 삭제 전 사용자 확인.

## Gemini 응답 처리 핵심 규칙

`lib/aiClient.ts`의 `mergeAiHints`:
```
if (v == null) continue;
if (v === "" && !k.endsWith("Custom")) continue; // 옵션 슬롯 빈 문자열 무시
```

각 라우트 시스템 프롬프트:
- **NEVER use empty string "" for slot values** — null만 사용
- 각 슬롯에 정확히 일치하는 value가 없으면 "custom" + *Custom 필드에 영어 표현

이미지 분석 라우트는 **역할 기반 슬롯 분리** — 사용자가 선택한 역할(스타일/캐릭터/색감 등)에 해당하는 슬롯만 채워서 충돌 방지.

## 알려진 주의

- MJ/Niji 출력에는 dash 파라미터(`--ar`, `--no`, `--sref` 등) 안 들어감 — 사용자가 Discord에서 직접 추가.
- 참고 이미지가 있어도 GPT/Nano 출력에 텍스트 안내 없음 — 사용자가 ChatGPT/Gemini API에 이미지를 직접 첨부.
- AI 응답이 일부 슬롯만 채울 수 있음 (입력에 정보 없으면 null). 사용자가 옵션 그룹을 펼쳐 확인.
- Gemini 무료 티어 분당 요청 제한이 있음 — 짧은 시간에 많이 누르면 429.

## 빠른 명령

```bash
npm run dev          # 로컬 (포트 3000)
npx tsc --noEmit     # 타입체크
npx tsx tests/smoke.ts  # 스모크 테스트 (한글 격리 등 검증)
git push origin main # Vercel 자동 배포 60-90초
```

Vercel 환경변수 설정 (배포 후 1회):
- `GEMINI_API_KEY` = AI Studio에서 발급한 키
- Production / Preview 환경 (Sensitive 토글 ON 권장)
