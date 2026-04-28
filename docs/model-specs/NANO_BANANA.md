# NANO_BANANA — Google Nano Banana 빌더 사양

> 인덱스: [`README.md`](./README.md) §1 모델 매트릭스 / §2 통합 적용표.

| 다루는 모델 | 옵션값 | 공식 API ID | 비고 |
|---|---|---|---|
| Nano Banana | `nano_banana` | `gemini-2.5-flash-image` | 25-08 정식 |
| Nano Banana 2 | `nano_banana_2` | `gemini-3.1-flash-image-preview` | 26-03 가이드 공개 |
| Nano Banana Pro | `nano_banana_pro` | `gemini-3-pro-image-preview` | 25-11-20 정식 |

---

## 1. 공통 사양 (기본 Nano Banana 기준)

| 항목 | 사양 |
|---|---|
| 출력 방식 | **서술형 단락**. Google 공식이 명시적으로 권장 (키워드 나열보다 묘사형 문장이 효과적). 본 프로젝트 v0.2의 **Keep / Change / Remove 3블록**은 자체 컨벤션. |
| 입력 구조 (자체 컨벤션) | `Keep:` (유지할 것) → `Change:` (적용할 변화) → `Remove:` (제거할 것). 각 블록은 `- ` 불릿. 참고 이미지 있으면 Keep 첫 줄에 `from the reference image: [역할 영문]`. 사용자 한글 요청은 Change 첫 줄에 `apply this concept: "[한글 요청]"`. |
| 입력 구조 (Google 공식) | 5종 프롬프팅 프레임워크 (필요 시 빌더 옵션으로 추가): ① 텍스트→이미지 `[Subject] + [Action] + [Location/context] + [Composition] + [Style]`, ② 멀티모달 `[Reference images] + [Relationship instruction] + [New scenario]`, ③ 대화형 편집 (변경/유지 명시), ④ 합성/스타일 전이, ⑤ 실시간 정보 (Pro/2). |
| 추천 키워드 | **동사로 시작** (`Generate`, `Create`, `Render`, `Compose`). 카메라/조명/재질 명시. 텍스트는 **따옴표로** + 폰트 명시 (`bold sans-serif`, `Century Gothic`). |
| 금지 / 비권장 | **"Use positive framing"** — Google 공식 가이드는 부정문 대신 긍정문 권장: `"empty street"` (O) vs `"no cars"` (X). 본 프로젝트 빌더의 Remove 블록은 약한 신호일 수 있음. SynthID 워터마크 자동 (제거 불가). |
| 비율 처리 | 텍스트로만: `aspect ratio 16:9`. |
| 참고 이미지 | 멀티 이미지 입력으로 캐릭터 일관성 / 다중 합성. Keep 블록 첫 줄에 역할 명시. API 호출 시 `parts` 배열에 `inlineData` 또는 `fileData`로 다수 이미지 전달. |
| 파라미터 | 빌더 출력에는 **없음**. API 단계만 처리. |

---

## 2. Nano Banana 2 — 추가/변경 사항

공식 가이드 (Google Cloud Blog 26-03-06) 기준 차이점:

- **컨텍스트**: 입력 토큰 최대 131,072, 출력 32,768.
- **해상도**: 0.5K(512px) / 1K / 2K / 4K. 기본 Banana엔 없는 **0.5K 옵션**.
- **공식 지원 비율**: 1:1, 3:2, 2:3, 3:4, 4:3, 4:5, 5:4, 9:16, 16:9, 21:9
  + **확장: 1:4, 4:1, 1:8, 8:1**.
- **이미지 입력**: 최대 14장 reference object images
  (PNG / JPEG / WebP / HEIC / HEIF).
- **실시간 정보**: 웹 검색 기반 지원.
- **C2PA Content Credentials + SynthID 워터마크 자동**.

**빌더 분기 규칙**: 모델이 `nano_banana_2`이면 Keep 블록에 다음 라인 추가:

- `target resolution: 2K (or higher)`
- `aspect ratio precise: ${ratio}`

---

## 3. Nano Banana Pro — 추가/변경 사항

기본 Nano Banana 2 사양의 상위 티어. 차이점:

- **출력 해상도**: 최대 4K. 광고/포스터/상업 인쇄물 적합.
- **컨텍스트**: 입력 65,536 / 출력 32,768.
- **이미지 입력**: 최대 14장 — 그 중 **최대 5명까지 인물 일관성 유지**.
- **텍스트 렌더링**: 다국어 (한국어 포함 10+) 정확한 렌더링이 강점.
- **편집 정밀도**: localized editing, 카메라 각도 / 색 그레이딩 / 라이팅 변경.
- **접근**: Gemini 앱 (Thinking 모델), Google Ads, Workspace, Vertex AI, Google AI Studio, Antigravity.

**빌더 분기 규칙**: 모델이 `nano_banana_pro`이면 Keep 블록에:

- `target resolution: 4K, professional print-ready`
- `text rendering: enabled, multilingual`
- (이미지 다수 시) `maintain identity across all reference images, up to 5 people`

---

## 4. Director-Level 프롬프팅 팁 (Google 공식)

게임 에셋 제작 시 결과 품질을 끌어올리는 4가지:

1. **조명 설계**: `three-point softbox`, `Chiaroscuro lighting with harsh, high contrast`, `golden hour backlighting`.
2. **카메라/렌즈/포커스**: `low-angle shot with shallow depth of field (f/1.8)`, `wide-angle lens`, `macro lens`. 하드웨어 명시: `shot on Fujifilm`, `disposable camera aesthetic`.
3. **컬러 그레이딩 / 필름 스톡**: `1980s color film, slightly grainy`, `cinematic color grading with muted teal tones`.
4. **재질 / 텍스처**: `navy blue tweed`, `ornate elven plate armor, etched with silver leaf patterns`, `minimalist ceramic coffee mug`.

---

## 5. 출처 (1차 자료)

- Nano Banana 2 제품 페이지: <https://gemini.google/overview/image-generation/>
- Nano Banana 프롬프팅 가이드 (Google Cloud Blog 26-03-06): <https://cloud.google.com/blog/products/ai-machine-learning/ultimate-prompting-guide-for-nano-banana>
- Nano Banana Pro 출시 발표 (25-11-20): <https://blog.google/innovation-and-ai/products/nano-banana-pro/>
- Nano Banana(기본) 출시 발표 (25-08): <https://blog.google/technology/google-deepmind/gemini-image-update-august-2025/>
- Gemini API 이미지 생성: <https://ai.google.dev/gemini-api/docs/image-generation>
- Vertex AI 이미지 모델: <https://cloud.google.com/vertex-ai/generative-ai/docs/image/overview>
