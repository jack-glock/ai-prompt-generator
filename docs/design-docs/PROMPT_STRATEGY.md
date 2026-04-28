# PROMPT_STRATEGY — 프롬프트 생성 전략

## 1. 왜 도구별로 다른 형식인가

각 이미지 생성 도구는 학습 방식과 입력 처리 방식이 다르다. 따라서 효과적인
프롬프트 형태도 다르다.

| 도구 | 선호 형식 | 근거 |
|---|---|---|
| GPT Image (ChatGPT) | 자연어 문장 (지시문) | LLM 기반. 문장형 지시를 잘 해석. |
| Nano Banana | Keep / Change / Remove 구조 | 편집·반복 작업 강점. 명시적 차이 지시가 효과적. |
| Midjourney | 키워드 콤마 + `--ar` | 키워드 가중치 모델. 자연어보다 키워드가 잘 먹음. |

---

## 2. 한글 처리 정책 (26-04-28 재개정)

**한글 자유 문장은 자동 번역하지 않는다. 사용자가 한글로 메모를 적은 뒤
ChatGPT 등 외부 도구로 본인이 영어 번역해 영어 입력란에 직접 붙여넣는다.**

### 2-1. 모델별 한국어 인식 차이 (참고)

| 모델 | 한국어 인식 | 빌더 처리 |
|---|---|---|
| GPT Image 1.5 / 1 / 1-mini | 비교적 잘 이해 (텍스트 렌더링도 한글 가능) | 영어 본문 + 원문 한글 병기 |
| Nano Banana / 2 / Pro | 잘 이해 + 다국어 텍스트 렌더링 강점 | 영어 본문 + 원문 한글 병기 |
| **Midjourney V7 / V8 / V8.1** | **영어 키워드 가중치 모델 → 한국어 약함** | **영어만** |
| **Niji 6 / 7** | **동상. 영어 키워드 사실상 필수** | **영어만** |

위 차이 때문에 영어 입력이 필요. 단 자동 번역은 하지 않음 — 다음 §2-2 참고.

### 2-2. 자동 번역을 채택하지 않는 이유

26-04-28 세션에서 OpenAI API 번역(`gpt-4o-mini`) 도입을 한 차례 적용했으나
다음 사유로 즉시 철회됨:

- **별도 비용 발생**: ChatGPT 구독과 OpenAI API 요금은 완전히 별개
  결제 시스템. 이 프로젝트는 1차 정책상 외부 결제 의존을 회피.
- **무료 대안의 한계**: DeepL Free / Google Translate Free / Azure
  Translator Free 등은 무료 한도가 있으나 카드 등록 필요 + 게임 도메인
  용어 처리 약함.
- **사용자 본인 영어 능력으로 충분**: 게임 그래픽 디자이너의 경우
  영어 키워드 작성에 익숙하며, ChatGPT 웹/앱(구독 사용자가 이미 결제한
  분량 안에서)으로 한글→영어 번역 후 붙여넣는 워크플로가 비용 0원에
  달성 가능.

### 2-3. UI / 빌더 처리 방식

- **한글 textarea**: 메모용으로 유지. `request` 필드. 한글 요약 카드와
  GPT Image / Nano Banana 결과의 "원문 한글" 병기 자리에만 들어감.
- **영어 textarea**: 신규 추가. 필수 입력. `englishRequest` 필드. 모든
  모델 결과의 본문에 사용됨.
- **안내 메시지**: 한글 textarea 위에 "ChatGPT 등에서 영어로 번역 후
  아래 영어 요청 칸에 붙여넣어 주세요" 안내 표기.
- **폴백**: 영어 textarea가 비어 있으면 빌더는 한글 원문을 그대로 사용
  (v0.2와 동일한 동작). MJ / Niji 결과 품질은 떨어짐.

### 2-4. 빌더 출력 형식

- **GPT Image / Nano Banana**: 영어 본문 + 원문 한글 병기
  (예: `Original Korean brief for nuance: "..."`).
- **Midjourney / Niji**: **영어만**. 한글은 사용 안 함.

### 2-5. 선택형 옵션 처리

선택형(작업 유형/스타일/비율/금지/참고 이미지 역할)은 기존대로 미리
매핑된 영어 키워드 사용 — 번역 불필요.

- `WORK_TYPE_EN`, `STYLE_EN`, `REFERENCE_ROLE_EN` (`lib/promptBuilder.ts`)

### 2-6. 향후 자동 번역 재도입 검토 조건

- 사용자 사용 빈도가 높아져 매번 ChatGPT로 옮겨 붙이는 부담이 커질 때.
- 무료/저렴한 번역 API의 도메인 용어 처리가 검증될 때.
- 그 시점에 OpenAI API / DeepL / Azure 중 재선택. 사양은 본 §2-2 참고.

---

## 3. 형식별 세부 규칙

### 3-1. GPT Image
- 마침표 있는 완전 문장 5~7개.
- 첫 문장: 무엇을 만들지 (`Create a ...`).
- 참고 이미지가 있으면 둘째 문장: `Use the attached reference image to ...`.
- 그 다음: 사용자 한글 요청을 따옴표로 인용.
- 그 다음: 스타일 → 비율·구도 → 금지 사항 → 마무리.

### 3-2. Nano Banana
세 블록 필수:
```
Keep:
- ...
Change:
- ...
Remove:
- ...
```
- 참고 이미지 있을 시 `Keep` 첫 줄에 reference 역할 명시.
- 사용자 요청 → `Change` 첫 줄에 인용.
- 금지 요소 → `Remove`.

### 3-3. Midjourney
- 콤마로 구분된 키워드 나열.
- 순서: `사용자 요청 → 작업 유형 키워드 → 스타일 키워드 → "high quality, clean composition" → 부정 키워드 → 끝에 --ar W:H`.
- 픽셀 단위 비율(예: `1000x600`)은 GCD로 가장 단순한 비율로 환산 (`--ar 5:3`).
- 참고 이미지 있을 시 `--cref [reference_image_url]` 자리표시 안내 포함 (실 URL은 사용자가 채움).

### 3-4. 수정 요청용 (Revision)
- **영문 템플릿**. v0.2.1부터 한글 → 영문 전환 완료.
- 5개 섹션:
  1. `Original brief`
  2. `What to change` (사용자가 채울 자리)
  3. `What to keep`
  4. `Must avoid`
  5. (이미지 있을 시) reference role 유지 항목

---

## 4. 비율 처리

| 입력 | GPT Image | Midjourney |
|---|---|---|
| `16:9`, `4:3`, `1:1`, `3:4` | `${ratio} aspect ratio` | `--ar ${ratio}` |
| `1000x600` | `1000x600 pixels` | `--ar 5:3` (GCD 환산) |
| `custom` (예: `1920x1080`) | `1920x1080 pixels` | `--ar 16:9` (GCD 환산) |

`gcd()` 헬퍼는 `lib/promptBuilder.ts` 안에 정의.

---

## 5. 금지 요소 매핑

체크박스 6종 → 영문 매핑은 `forbidToEnglish()`에 고정.

| 한글 라벨 | 영문 |
|---|---|
| 텍스트 금지 | `no text` |
| 로고 금지 | `no logo` |
| 노이즈 금지 | `no noise` |
| 지저분한 텍스처 금지 | `no messy or dirty textures` |
| 반짝이 금지 | `no sparkles or glitter` |
| 과한 디테일 금지 | `avoid excessive detail, keep it clean` |

새 항목 추가 시 한글·영문 두 매핑 모두 갱신 필요.

---

## 6. 변경 시 주의

- 새 작업 유형/스타일 추가 → `WORK_TYPES`/`STYLES` 상수 + `WORK_TYPE_EN`/`STYLE_EN` 매핑 + `FEATURES.md` 동시 갱신.
- 형식별 규칙 변경 → 사용자 결과물에 영향. v0.x 마이너 버전 올리고 `CHANGELOG`(DevSync 측) 기록 검토.
- 영문 변환을 강화하려면 외부 번역 API 도입 → 그 경우 `SECURITY.md` §4 적용.
