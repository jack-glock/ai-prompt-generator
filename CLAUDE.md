# CLAUDE.md — 다음 세션용 인덱스

> 26-05-06 · 현재 **v0.8** 라이브
> 본문은 `docs/`에. 이 파일은 핵심 사실만.

## 한 줄 요약

게임 그래픽 디자이너용 이미지 프롬프트 생성기. GPT Image / Nano Banana / Midjourney / Niji **12종 모델** + **17종 스타일 (4 카테고리)**. **Clay 디자인 시스템** 적용 (따뜻한 크림/오트 톤). 라이트/다크 모드. **Gemini 2.5 Flash 연동**으로 AI 번역·옵션 채우기·이미지 분석 지원.

- GitHub: <https://github.com/jack-glock/ai-prompt-generator>
- Live: <https://ai-prompt-generator-two-ebon.vercel.app/>
- DevSync 등록: v1.4.7부터

## 기술 스택

Next.js 14.2.5 · React 18.3 · TypeScript 5.5 · Tailwind 3.4 (`darkMode:"class"`) · lucide-react · **Gemini 2.5 Flash API** (서버 라우트 경유, 키는 서버 전용 환경변수).

## 핵심 파일

| 파일 | 역할 |
|---|---|
| `app/page.tsx` (~1,700줄) | UI 전체 + 핸들러 + Sticky 옵션 헤더 |
| `app/globals.css` | Clay 디자인 토큰 (CSS 변수) + clay-shadow / clay-hover 유틸 |
| `lib/promptBuilder.ts` (~870줄) | 빌더 (영어 4개 + GPT/Nano 한국어 2개) + summary + revision |
| `lib/options.ts` (~640줄) | 옵션 데이터, 모델 라인업, **STYLE_CATEGORIES** (4 카테고리) |
| `lib/keywordExtract.ts` (~330줄) | 키워드 매칭 (단어 경계 + 한·영) |
| `lib/aiClient.ts` (~170줄) | Gemini 호출 helper + `mergeAiHints` |
| `lib/imageUtils.ts` (~60줄) | 이미지 1024px 캡 자동 리사이즈 (Canvas API) |
| `app/api/ai/translate/route.ts` | 한글 → 영어 번역 (서버) |
| `app/api/ai/extract/route.ts` | 자유입력 → 옵션 슬롯 자동 분배 (서버) |
| `app/api/ai/analyze-image/route.ts` | Vision 이미지 분석 + 한국어 description (역할 기반 슬롯 분리) |
| `app/layout.tsx` | 다크 모드 FOUC 방지 inline script |

## docs/ 지도

- `KNOWLEDGE_MAP.md` 저장소 운영 원칙
- `design-docs/` PROMPT_STRATEGY · UI_DESIGN
- `product-specs/` FEATURES · ACCEPTANCE
- `model-specs/` README + GPT_IMAGE / NANO_BANANA / MIDJOURNEY / NIJI + xlsx
- `exec-plans/` ROADMAP · BACKLOG · CHANGELOG
- `references/` README

## 현재 상태 (v0.8)

### 레이아웃 (Sticky 헤더 + 좌우 컬럼)

```
[헤더: 멀티 모델 이미지 프롬프트 도구 + 다크/초기화 버튼]
[Sticky 옵션 헤더 — 스크롤해도 상단 고정]
  ├─ 1행: [작업 유형 (좌, 540px)] [스타일 (우, 1fr)]
  ├─ 2행: 비율 (전체 폭, 10종)
  └─ 3행: 안내문 (텍스트만, 박스 없음)
[좌측 컬럼 540px]               [우측 컬럼 1fr]
  메모 / 번역 / 영어 보충         정리된 요청 요약
  키워드/AI 옵션 채우기 버튼      GPT Image 카드
  참고 이미지 (헤더+슬롯)         Nano Banana 카드
  캐릭터/배경/에셋 옵션          Midjourney 카드
                                 Niji 카드
                                 수정 요청용 카드
```

### 입력 영역
- **메모/입력 영역** (Section 헤더 박스 없이 textarea만, placeholder가 라벨 역할):
  - 한글 자유입력 + AI 번역 버튼 (포메그라네이트 핑크)
  - 영어 보충 입력
- **옵션 채우기 버튼**:
  - **키워드로 옵션 채우기** (메인) — 매치아 그린, 큰 버튼
  - **더 풍부하게 — AI로 옵션 채우기 (~6원)** (보조) — 포메그라네이트 핑크, 작은 버튼
- **참고 이미지** (커스텀 헤더):
  - 헤더: `[참고 이미지] [#2 토글] [#3 토글] [사용 중 토글]`
  - **#1 슬롯은 항상 표시**, **#2 #3은 헤더 토글로 켜고 끔**
  - 슬롯 내부: [이미지 100x100 정사각, 좌상단 #N 배지, 우상단 X 오버레이] | [역할 select + AI 분석 버튼 + 한국어 설명 접힘식 textarea]
  - **클립보드 붙여넣기 (Ctrl+V) 지원** — 슬롯 포커스 후 Ctrl+V로 이미지 자동 첨부
  - 1024px 캡 자동 리사이즈

### Sticky 옵션 헤더
- **작업 유형** (5종 chip) — 캐릭터/배경/프레임/아이콘/오브젝트
- **스타일** — 4 카테고리(2D 일러스트 / 3D 입체 / 프리미엄 무드 / UI 전용) → 클릭 시 펼침. 1단계 chip + 2단계 펼침
- **비율** (10종) — 16:9, 2:1, 3:2, 4:3, 1:1, 3:4, 2:3, 1:2, 9:16, 직접 입력. 가로→정사각→세로 순서
- **직접 입력 inline 입력칸** — chip 옆에 즉시 펼쳐짐, 다시 클릭 시 자동으로 닫힘 (토글)
- **안내문** — 박스 없이 텍스트만

### 작업 유형별 옵션 (좌측 컬럼 본문)
- 캐릭터: 성별 / 연령 / 체형 / 머리 / 의상 / 포즈 / 보이는 범위 / 시야각 / 캐릭터 방향 / 캐릭터 시트 (10그룹)
- 배경: 장소 / 시간대 / 분위기 / 빛 느낌 / 색감 / 깊이 / 복잡도 / 배치 / 시야각 / 보이는 범위
- 에셋: 형태 / 표면 / 차원 / 장식 / 배경 처리 / 에셋 조건

### 결과 영역
- 정리된 요청 요약 (2열 표, dashed 구분선)
- GPT Image 카드 — 문장형, **EN/한국어 토글 (블루베리 블루)**, 한국어 기본값(localStorage)
- Nano Banana 카드 — 자연어 문장형, **EN/한국어 토글**, 모델별 해상도 멘션 제거됨
- Midjourney 카드 — 키워드만 (dash 파라미터 없음)
- Niji 카드 — 애니 키워드만 (dash 파라미터 없음)
- 수정 요청용 카드 (Keep/Change/Remove)

### Gemini API 연동
- 모델: `gemini-2.5-flash` (모든 라우트)
- 비용 추정: 번역 ~1-2원, 옵션 추출 ~6원, 이미지 분석 ~3-5원 (1회당)
- 무료 티어(1500 RPD, 15 RPM) 안에서 개인 사용 충분
- 키 보안: `process.env.GEMINI_API_KEY` (서버 라우트 전용)
- analyze-image 라우트: 한국어 description 반환 + finishReason/blockReason 검출 + 친절한 에러 안내

## Clay 디자인 시스템 (v0.8 신규)

### 색상 토큰 (`app/globals.css` CSS 변수)

| 토큰 | 라이트 | 다크 | 용도 |
|---|---|---|---|
| `--clay-cream` | `#faf9f7` | `#1c1a17` | 페이지 배경 |
| `--clay-white` | `#ffffff` | `#2a2723` | 카드 배경 |
| `--oat-border` | `#dad4c8` | `#3a352e` | 보더 |
| `--clay-black` | `#1a1a1a` | `#f5f3ee` | 본문 텍스트 |
| `--warm-silver` | `#9f9b93` | `#8a8479` | 보조 텍스트 |

### 강조색 역할

| 색 | hex | 용도 |
|---|---|---|
| **매치아 그린** | `#078a52` | 메인 CTA + chip 활성 |
| **블루베리 블루** | `#01418d` | 토글 ON + EN/한국어 언어 탭 |
| **포메그라네이트 핑크** | `#fc7981` | AI 사용 버튼 (번역·옵션 채우기·이미지 분석) |
| **우베 퍼플** | `#43089f` | 슬롯 #2 #3 토글 |

### CSS 유틸리티 (globals.css)
- `.clay-shadow` — 멀티레이어 (다운캐스트 + 인셋 하이라이트)
- `.clay-hover` — 살짝 들어올림 + 하드 오프셋 쉐도우
- `.clay-hover-strong` — 메인 CTA용 (회전 + 강한 쉐도우)
- `.clay-pressed` — 활성 chip의 "들어간" 느낌

### 라운드 통일
- 모든 주요 박스(헤더, sticky, aside, 결과 카드, 요약, 수정 요청용): **24px** 통일

## 다음 작업 — v0.9 후보

1. **P1** 프롬프트 즐겨찾기 (localStorage)
2. **P1** 결과 비교 모드 (좌우 분할)
3. **P2** 추천 프롬프트 갤러리
4. **P3** 이미지 외부 호스팅 자동 업로드 (MJ/Niji `--sref` 자동 채우기)

## 컨벤션 핵심

- **자동 번역 없음 → AI 번역 버튼** (사용자가 의식적으로 누름)
- **모델별 차등**:
  - GPT Image / Nano Banana = 영어 + 한국어 빌더 (한·영 토글, **한국어 기본값** + localStorage 기억)
  - MJ / Niji = 영어만
- **한글 격리 정책**:
  - 한글 메모는 GPT/Nano 한국어 토글의 "작가 메모:"에만
  - MJ/Niji 영어 빌더에 한글 절대 미포함 (스모크 테스트 검증)
  - 영어 보충 입력은 영어 빌더 전용
  - 직접 입력 한글 자동 차단
- **AI 응답 빈 문자열 처리**: `mergeAiHints`에서 옵션 슬롯 `""` 무시. `*Custom`은 빈 문자열도 의미 있음.
- **다크 모드**: 모든 색상에 `dark:` variant 동시 정의 (Clay 토큰 사용)
- **참고 이미지**: dataURL(base64)로 메모리에만. 1024px 자동 리사이즈. MJ/Niji에 외부 URL 자동 첨부 안 함.
- **"game" 키워드 제거** (v0.8): 모든 영어 프롬프트에서 "game" 표현 빠짐 (예: "a character illustration", "single icon")
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

이미지 분석 라우트:
- **역할 기반 슬롯 분리** — 사용자가 선택한 역할(스타일/캐릭터/색감 등)에 해당하는 슬롯만 채워서 충돌 방지
- **한국어 description 추가 반환** — "AI가 본 이미지" 영역에 표시 (편집 가능, 복사 가능)
- finishReason / blockReason 검출해 SAFETY 등 거절 사유를 사용자에게 명확히 안내

## 알려진 주의

- MJ/Niji 출력에 dash 파라미터(`--ar`, `--no`, `--sref` 등) 안 들어감 — 사용자가 Discord에서 직접 추가
- 참고 이미지가 있어도 GPT/Nano 출력에 텍스트 안내 없음 — 사용자가 ChatGPT/Gemini API에 이미지를 직접 첨부
- Gemini 무료 티어 분당 요청 제한(15 RPM) — 짧은 시간에 많이 누르면 429

## 빠른 명령

```bash
npm run dev             # 로컬 (포트 3000)
npx tsc --noEmit        # 타입체크
npx tsx tests/smoke.ts  # 스모크 테스트 (한글 격리 등 검증)
git push origin main    # Vercel 자동 배포 60-90초
```

Vercel 환경변수:
- `GEMINI_API_KEY` = AI Studio에서 발급한 키 (Production / Preview, Sensitive ON 권장)
