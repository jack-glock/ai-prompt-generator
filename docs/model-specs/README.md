# model-specs — 모델별 빌더 사양 인덱스

> `lib/promptBuilder.ts`가 각 이미지 모델에 맞게 프롬프트를 생성할 때
> 따라야 하는 **공식 사양 기반 적용표**.
>
> 작성일: 26-04-28
> 기준: 26-04-28 시점 각 벤더의 공식 Docs / 공식 블로그 / 공식 변경 노트.
> 본문은 모델 그룹별 파일로 분리. 본 README는 **인덱스 + 매트릭스**.

---

## 0. 본문 인덱스

| 파일 | 다루는 모델 |
|---|---|
| [`GPT_IMAGE.md`](./GPT_IMAGE.md) | OpenAI GPT Image 1.5 / 1 / 1-mini |
| [`NANO_BANANA.md`](./NANO_BANANA.md) | Google Nano Banana / 2 / Pro |
| [`MIDJOURNEY.md`](./MIDJOURNEY.md) | Midjourney V7 / V8 Alpha / V8.1 Alpha |
| [`NIJI.md`](./NIJI.md) | Niji 6 / 7 |

관련 문서:

- `../design-docs/PROMPT_STRATEGY.md` — 도구별 형식이 다른 이유(전략).
- `../product-specs/FEATURES.md` — 빌더 구현 상태.

---

## 1. 지원 모델 매트릭스 (26-04-28 검증, 정정판)

| # | 모델 그룹 | 옵션값 | 공식 명칭 / API ID | 출시 / 공개 시점 | 비고 |
|---|---|---|---|---|---|
| 1 | OpenAI GPT Image | `gpt_image_2` | `gpt-image-2` | 정식 (26-04-21 가이드) | **새 빌드 기본 권장**, 자유 해상도 |
| 2 | OpenAI GPT Image | `gpt_image_1_5` | `gpt-image-1.5` | 정식 | 마이그레이션 호환 |
| 3 | OpenAI GPT Image | `gpt_image_1` | `gpt-image-1` | 정식 | Legacy 호환 |
| 4 | OpenAI GPT Image | `gpt_image_1_mini` | `gpt-image-1-mini` | 정식 | 비용 효율 |
| 5 | Google Nano Banana | `nano_banana` | `gemini-2.5-flash-image` | 정식 (25-08) | 별칭: Nano Banana |
| 6 | Google Nano Banana | `nano_banana_2` | `gemini-3.1-flash-image-preview` | Preview (26-03 가이드) | 별칭: Nano Banana 2 |
| 7 | Google Nano Banana | `nano_banana_pro` | `gemini-3-pro-image-preview` | 정식 (25-11-20) | 별칭: Nano Banana Pro |
| 8 | Midjourney | `mj_v7` | Midjourney V7 | 정식 | Discord + 메인 사이트 |
| 9 | Midjourney | `mj_v8_alpha` | Midjourney V8 Alpha | 알파 (26-03-17) | `alpha.midjourney.com` 한정 |
| 10 | Midjourney | `mj_v8_1_alpha` | Midjourney V8.1 Alpha | 알파 (26-04-14) | `alpha.midjourney.com` 한정 |
| 11 | Niji | `niji_6` | Niji V6 | 정식 | `--niji 6` |
| 12 | Niji | `niji_7` | Niji V7 | 정식 (26-01-09) | `--niji 7`, "Precision Prompting" |

**용어 정리**

- **`gpt-image-2`** 는 26-04-28 cookbook 프롬프팅 가이드 재확인으로 추가됨.
  사용자가 평소 부르던 "GPT Image 2"가 실제로 존재하는 공식 모델임이
  확인됨 (이전 README 표기 철회).
- "Nano Banana 2"는 Google이 공식 마케팅 명칭으로 사용. 공식 API ID는
  `gemini-3.1-flash-image-preview`.
- DALL·E 2 / DALL·E 3 는 26-05-12 부로 지원 종료 — 본 도구에서 다루지 않음.

**UI 정책 결론**

- GPT Image: 드롭다운에 **gpt-image-2 / 1.5 / 1 / 1-mini 4종** 노출. 기본값 = **gpt-image-2**.
- Nano Banana: Nano Banana / 2 / Pro 3종 노출. 기본값 = 2 (Preview 라벨 표기).
- Midjourney: V7 / V8 Alpha / V8.1 Alpha 3종 노출. 알파 라벨 옆 `(Alpha)` 뱃지. 기본값 = V8.1 Alpha.
- Niji: 6 / 7 2종. 기본값 = 7.

**한국어 인식 차이 (v0.3 영어 입력 정책 근거)**

| 모델 | 한국어 인식 | 빌더 처리 |
|---|---|---|
| GPT Image (1.5 / 1 / mini) | 비교적 잘 이해 (한글 텍스트 렌더링도 가능) | 영어 본문 + 원문 한글 병기 |
| Nano Banana (기본/2/Pro) | 잘 이해 + 다국어 텍스트 렌더링 강점 | 영어 본문 + 원문 한글 병기 |
| **Midjourney (V7/V8/V8.1)** | **영어 키워드 가중치 모델 → 한국어 약함** | **영어만** |
| **Niji (6/7)** | **동상. 영어 키워드 사실상 필수** | **영어만** |

→ v0.3 정책: **자동 번역 미사용, 사용자가 영어 직접 입력**.
근거 → `../design-docs/PROMPT_STRATEGY.md` §2 (재개정판).

---

## 2. 통합 적용표 (한눈에 보기)

| 모델 | 출력 방식 | 반드시 넣을 것 | 주의할 것 | 비율 표기 | 참고 이미지 표기 |
|---|---|---|---|---|---|
| GPT Image 1.5 / 1 / 1-mini | 긴 문장형 | 장면·스타일·구도·조명·금지 | 키워드 나열 비권장, 부정문 약함 | `${ratio} aspect ratio` 또는 `${px} pixels` | 자연어 ② 문장 + `input_fidelity:"high"` |
| Nano Banana | 서술형 단락 / Keep·Change·Remove | 동사 시작, 카메라·조명·재질 명시 | **부정문 대신 긍정문** ("empty street", not "no cars") | `aspect ratio ${ratio}` | Keep 첫 줄에 역할 |
| Nano Banana 2 | 동상 + 0.5K/2K/4K, 확장 비율 | `target resolution`, 정밀 비율 | 워터마크 자동 (SynthID + C2PA) | 1:1 ~ 21:9 + 1:4/4:1/1:8/8:1 | 최대 14장 멀티 입력 |
| Nano Banana Pro | 동상 + 4K, 인물 5명 일관성 | `text rendering: multilingual`, identity 유지 | 동상 | 동상 | 멀티 + 인물 일관성 |
| Midjourney V7 | 키워드 + 파라미터 | 핵심 키워드, `--ar`, `--no` | 긴 설명문 금지 | `--ar W:H` (GCD 환산) | `--oref [url] --ow 100` (+ `--sref`) |
| Midjourney V8 Alpha | 동상 + `--hd`, `--raw` 권장 | 텍스트는 따옴표로 | alpha 사이트 한정 | `--ar` + `--hd` | V7과 동일 |
| Midjourney V8.1 Alpha | 동상 (`--hd` 자동, 생략) | 이미지 가중치(`::weight`) 활용 가능 | alpha 사이트 한정 | `--ar` (HD 기본) | V7과 동일 |
| Niji 6 | 캐릭터/애니 키워드 + `--niji 6` | 외형·표정·포즈·의상·배경·화각 | 외형 모호 시 일관성 깨짐 | `--ar` (세로 권장) | `--cref [url] --cw 100` (+ `--sref`) |
| Niji 7 | 동상 + `--niji 7` | **풍부한 디테일 = 풍부한 결과** | 기본 배경 없음 → `indoors`/`outdoors` 명시, 풀바디 원하면 신발 명시 | 동상 | 동상 |

상세 사양은 각 모델 파일 참조.

---

## 3. 빌더 함수 매핑 (v0.3 작업 범위)

`lib/promptBuilder.ts`에 추가/수정할 시그니처.

```ts
export type ModelKey =
  | "gpt_image_2"
  | "gpt_image_1_5"
  | "gpt_image_1"
  | "gpt_image_1_mini"
  | "nano_banana"
  | "nano_banana_2"
  | "nano_banana_pro"
  | "mj_v7"
  | "mj_v8_alpha"
  | "mj_v8_1_alpha"
  | "niji_6"
  | "niji_7";

buildPromptFor(model: ModelKey, input: PromptInput): string
```

| ModelKey | 기존 함수 → 신규 함수 | 변경점 |
|---|---|---|
| `gpt_image_1_5` / `1` / `1_mini` | `buildGptImage` 그대로 | 끝에 `// model: <id>` 주석 (선택) |
| `nano_banana` | `buildNanoBanana` 그대로 | 없음 |
| `nano_banana_2` | `buildNanoBanana` + 가산 | Keep에 `target resolution: 2K`, 확장 비율 표기 |
| `nano_banana_pro` | `buildNanoBanana` + 가산 | Keep에 `target resolution: 4K`, 인물 일관성 |
| `mj_v7` | `buildMidjourney` 수정 | **`--cref` → `--oref`로 교체** |
| `mj_v8_alpha` | 신규 `buildMidjourneyV8Alpha` | V7 + `--hd` (옵션 `--raw`) |
| `mj_v8_1_alpha` | 신규 `buildMidjourneyV81Alpha` | V7 (HD 기본, `--hd` 생략) |
| `niji_6` | 신규 `buildNiji` | 캐릭터 키워드 순서, `--niji 6`, `--cref` 유지 |
| `niji_7` | `buildNiji` + 버전 변경 | `--niji 7`, 풀바디면 `wearing boots` 등 |

**실시간 미리보기 영향**

현재 `app/page.tsx`는 5개 결과 카드(요약/GPT/Nano/MJ/수정)를 항상 모두
렌더링한다. v0.3에서는 **모델 그룹별 4개 카드(GPT / Nano / MJ / Niji)**
유지 + **각 카드 내부에 버전 드롭다운**. 한글 요약과 수정 요청 카드는
그대로 유지. Niji 카드는 신규 추가.

---

## 4. 다음 작업 (v0.3 후보)

1. `lib/promptBuilder.ts`에 `ModelKey` 타입 + 위 매핑 함수 추가.
2. `app/page.tsx`에 모델 그룹별 버전 드롭다운 4개 추가
   (GPT Image / Nano Banana / Midjourney / Niji).
3. 결과 카드 구조 조정 (위 §3 참고). Niji 카드는 신규 추가.
4. `FEATURES.md`에 모델 11종 행 추가, 상태 갱신.
5. `ROADMAP.md`에서 본 항목 제거.
6. DevSync `CHANGELOG.md`에 1~3줄 기록.

---

## 5. 갱신 규칙

- 모델 신규 출시 / SKU 변경 시: 본 README §1 매트릭스 갱신 + 해당 모델
  파일 갱신 + `FEATURES.md` 동시 반영.
- "Preview" → "정식"으로 승격할 때는 출처 URL 1개 이상 첨부.
- 새 모델 그룹 추가 시 별도 파일(`<GROUP>.md`) 생성 + 본 인덱스 §0 추가.
