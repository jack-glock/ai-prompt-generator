# PROMPT_STRATEGY — 프롬프트 생성 전략

> 최종 갱신: 26-04-29 · v0.7 라이브 반영.

## 1. 왜 도구별로 다른 형식인가

각 이미지 생성 도구는 학습 방식과 입력 처리 방식이 다르다. 따라서 효과적인
프롬프트 형태도 다르다.

| 도구 | 선호 형식 | 근거 |
|---|---|---|
| GPT Image (ChatGPT) | 자연어 문장 (지시문) | LLM 기반. 문장형 지시를 잘 해석. |
| **Nano Banana** | **자연어 서술 문장** (Google 공식 권장) | "Trained to understand narrative natural language, not structured lists." |
| Midjourney | 키워드 콤마 (`--` 파라미터는 사용자 직접 추가) | 키워드 가중치 모델. 자연어보다 키워드가 잘 먹음. |
| Niji | 애니 키워드 콤마 (`--` 파라미터는 사용자 직접 추가) | 동상. |

> v0.7 기준 변경점: Nano Banana를 이전 "Keep/Change/Remove" 또는 "Goal/Subject/Style/..." 구조에서 **자연어 서술 문장형**으로 전환. Google AI Developers 공식 가이드 + Cloud Blog 권장 따름.

---

## 2. 한글 처리 정책 (26-04-29 v0.7)

### 2-1. AI 번역 채택 (수동)

- **AI로 영어 번역하기** 버튼 — 사용자가 의식적으로 클릭. 자동 실행 X.
- 모델: **Gemini 2.5 Flash** (1회 ~1원, 무료 티어 충분).
- 흐름: 한글 메모 → AI 번역 → 영어 보충 입력에 자동 채움.

이전 v0.6까지는 "자동 번역 없음, 사용자가 ChatGPT로 옮겨 붙이기"였으나
v0.7부터 본 도구 안에서 직접 처리.

### 2-2. 한글 격리 정책

- **한글 메모**:
  - GPT Image / Nano Banana **한국어 토글**의 "작가 메모:" 라인에만 들어감
  - MJ / Niji 영어 빌더에는 **절대 미포함** (스모크 테스트로 검증)
- **영어 보충 입력**:
  - 영어 빌더(GPT/Nano 영어, MJ, Niji)에 그대로 반영
  - 한국어 빌더에서는 **제외** (한글 메모와 중복 방지)
- **직접 입력**(옵션의 custom 텍스트):
  - 한글이 섞이면 영어 프롬프트에서 **자동 차단** (`containsKorean()`)
  - 한국어 빌더에서도 옵션의 영어 customText는 **노출하지 않음** (한글만 깔끔하게)
- **AI 응답에 한글 누출 없음**: 시스템 프롬프트가 영어 value만 응답하도록 강제.

### 2-3. 모델별 한국어 인식 차이

| 모델 | 한국어 인식 | 빌더 처리 |
|---|---|---|
| GPT Image (1.5 / 1 / 1-mini / 2) | 비교적 잘 이해 | 영어 + 한국어 토글 |
| Nano Banana (원본 / 2 / Pro) | 잘 이해 + 다국어 텍스트 렌더링 (Pro) | 영어 + 한국어 토글 |
| Midjourney V7 / V8 / V8.1 | 영어 키워드 가중치 → 한국어 약함 | **영어만** (토글 없음) |
| Niji 6 / 7 | 동상 | **영어만** (토글 없음) |

---

## 3. 형식별 세부 규칙 (v0.7)

### 3-1. GPT Image
- 마침표 있는 완전 문장. 자연어 지시문.
- 흐름: `Create [작업유형]. Key details: [main]. Additional direction from the artist: [영어 보충]. Render it in [style]. Compose at [비율] aspect ratio with a clear focal point and balanced layout. Important constraints: [negative]. Keep the result production-ready ...`
- 참고 이미지 텍스트 안내 **없음** (사용자가 ChatGPT에 직접 첨부).
- 한국어 토글 시: 같은 정보를 자연스러운 한국어 문장으로. 작가 메모 라인 포함.

### 3-2. Nano Banana (자연어 문장형, Google 권장)
- **스타일을 첫 문장**으로 단독 배치 — 모델이 가장 강한 신호로 받음.
- 형식:
  ```
  [Style cap] with [rest of style].
  A [work] featuring [details].
  [English supplement].
  Compose at [aspect] aspect ratio with a clear focal point and balanced layout.
  [모델별 capability — 원본/2/Pro 차등].
  Avoid [negatives].
  ```
- 모델별 capability 마지막 문장:
  - **원본**: `Render in commercial game asset quality with clean, readable design.`
  - **2**: `Render in 2K or higher resolution with refined detail and precise aspect ratio. Maintain a coherent, polished result.`
  - **Pro**: `Render in 4K resolution with intricate details and professional print-ready quality. Render any text exactly as specified, with multilingual support enabled.`
- 참고 이미지 텍스트 안내 **없음** (사용자가 Gemini에 직접 첨부).
- 한국어 토글 시: 자연스러운 한국어 문장으로. "고급 판타지 스타일." 별도 첫 문장 → "캐릭터를 만들어 주세요. 주요 묘사: ..." → 작가 메모 → 구도 → 모델별 quality → 빼주세요.

### 3-3. Midjourney
- 콤마 구분 키워드만.
- 순서: `[작업유형 키워드], [메인 토큰], [영어 보충], [style 키워드], "clean composition", "polished design"`
- **dash 파라미터(`--ar`, `--no`, `--sref/--oref`, `--hd`) 절대 미포함** — 사용자가 Discord나 사이트에서 직접 추가.
- 픽셀 비율 변환 코드는 유지(`aspectRatioForMidjourney`)되지만 출력에는 안 들어감.

### 3-4. Niji
- 동일하게 키워드만, `anime style` 시작.
- `--niji 7` 같은 dash 파라미터도 사용자가 직접 추가.

### 3-5. 수정 요청용 (Revision)
- 영문 템플릿. Keep / Change / Remove / Do not change 구조.
- 5개 섹션. 사용자가 "What to change" 부분만 채워서 사용.

---

## 4. AI 분석 응답 처리 (`mergeAiHints`)

`lib/aiClient.ts`의 `mergeAiHints` 함수가 AI 응답을 PromptInput에 병합.

### 4-1. 빈 문자열 처리 (v0.7 핵심 버그 수정)
```ts
if (v == null) continue;
if (v === "" && !k.endsWith("Custom")) continue; // 옵션 슬롯 빈 문자열 무시
```

- AI가 미지정 슬롯을 `null` 대신 `""`로 응답해도 옵션이 무효화되지 않음.
- `*Custom` 필드는 빈 문자열 OK (= 입력 없음).

### 4-2. AI extract 라우트 시스템 프롬프트
- "NEVER use empty string for slot values. Always use null when nothing is specified."
- 매핑 안 되는 디테일은 `custom` + `*Custom` 영어 표현.

### 4-3. AI 이미지 분석 라우트 (역할 기반 슬롯 분리)
- 사용자가 선택한 **역할(스타일/캐릭터/색감/포즈/구도/재질/의상/배경)에 해당하는 슬롯만** 채움.
- 다른 역할 슬롯은 시스템 프롬프트에서 아예 제외 → 충돌 방지.
- 응답은 dotted-path → nested 구조로 변환.

---

## 5. 비율 처리

- 픽셀 단위 (예: `1000x600`) 입력 시 GCD로 단순 비율로 환산 가능 (`--ar 5:3`).
- v0.7 기준 MJ/Niji 출력에는 안 들어가지만, 코드는 유지.
- GPT/Nano 출력에는 그대로 텍스트로 들어감 (`Compose at 1000x600 pixels`).

---

## 6. 옵션 그룹 on/off

- 8그룹 (작업유형/스타일/비율/빼고싶은것/참고이미지/캐릭터/배경/에셋).
- OFF면 빌더가 그 그룹의 토큰을 수집하지 않음 (`collectMainTokens`, `collectStyle`, `collectNegatives`).
- 작업유형 OFF 시 `"an illustration"`으로 폴백.
- localStorage `apg.enabled`에 저장.
- 요약 카드도 enabled OFF 그룹은 표시 안 함 (빌더와 일관성).
