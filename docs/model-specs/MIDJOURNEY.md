# MIDJOURNEY — Midjourney 빌더 사양

> 인덱스: [`README.md`](./README.md) §1 모델 매트릭스 / §2 통합 적용표.

| 다루는 모델 | 옵션값 | 출시 / 공개 |
|---|---|---|
| Midjourney V7 | `mj_v7` | 정식 |
| Midjourney V8 Alpha | `mj_v8_alpha` | 26-03-17 (alpha 한정) |
| Midjourney V8.1 Alpha | `mj_v8_1_alpha` | 26-04-14 (alpha 한정) |

---

## 1. V7 사양 (기준)

| 항목 | 사양 |
|---|---|
| 출력 방식 | **콤마 구분 키워드** + 끝에 파라미터 |
| 입력 구조 | `[한글 요청], [작업유형 키워드], [스타일 키워드], high quality, clean composition[, 부정 키워드] --ar [비율][ --oref [url] --ow 100][ --sref [url] --sw 100]` |
| 추천 키워드 | 핵심 이미지 키워드 / 매체 키워드 (`game banner`, `concept art`) / 분위기 (`dramatic lighting`) / 품질 (`high quality, clean composition`) |
| 금지 / 비권장 | 긴 설명문 비권장. 실존 작가 이름은 가이드라인 위반 가능. NSFW / 실존 미성년자 자동 차단. |
| 비율 처리 | `${ratio}` → `--ar ${ratio}`. `1000x600` → `--ar 5:3`. 픽셀(`1920x1080`) → GCD 환산 (`--ar 16:9`). 헬퍼 `gcd()` (`lib/promptBuilder.ts`). |
| 참고 이미지 | **V7부터 `--oref`(Omni Reference)가 `--cref`를 대체**. `--oref [url] --ow 0~1000` (기본 100). 스타일 참고는 `--sref [url] --sw 0~1000`. |
| 파라미터 | `--ar`, `--no`, `--raw`, `--stylize 0~1000`(기본 100), `--chaos 0~100`(기본 0), `--sref`, `--oref`, `--ow`, `--sw`. |

---

## 2. V8 Alpha — 추가/변경 사항 (26-03-17)

공식 변경 노트 `updates.midjourney.com/v8-alpha/`:

- **접근**: `alpha.midjourney.com` 한정. Discord/메인 사이트 미지원.
- **신규 파라미터**: **`--hd`** (네이티브 2K), **`--q 4`** (추가 일관성).
- **텍스트 렌더링 강화** — 따옴표 사용 권장 (`"POTION SHOP"`).
- **기본 스타일링이 강함** → 사실/통제 출력 시 **`--raw` 즉시 추가** 권장.
- **속도**: 표준 작업이 V7 대비 4~5배 빠름.
- `--oref`, `--sref`, `--ar`, `--no`, `--stylize` 등 V7 파라미터 그대로.

**빌더 분기 규칙**: V7 출력에 `--hd`를 끝에 자동 추가. Raw 톤 옵션이
켜진 경우 `--raw`도 추가. 결과 끝에
`(generated for alpha.midjourney.com)` 주석 표기 권장.

---

## 3. V8.1 Alpha — 추가/변경 사항 (26-04-14)

공식 변경 노트 `updates.midjourney.com/v8-1-alpha/`:

- **기본 출력이 HD(2K)** → `--hd` 명시 불필요. SD로 낮추려면 설정 패널.
- 미적 톤이 V7과 유사하게 회귀 (V8.0의 과도한 스타일 제거).
- **이미지 프롬프트 / 이미지 가중치(`::weight`) 다시 사용 가능**.
- **속도/비용**: HD 3배 빠르고 3배 저렴. 표준 50% 빠르고 25% 저렴.
- 사실 출력에는 여전히 `--raw` 권장.

**빌더 분기 규칙**: `--hd` 자동 추가 안 함, 그 외는 V7과 동일 구조.
주석에 `(alpha.midjourney.com, V8.1 default HD)` 표기.

---

## 4. 게임 에셋 제작 팁

- **배너 / 키비주얼**: `game banner, [컨셉], dramatic lighting, high quality, clean composition --ar 16:9`.
- **캐릭터 컨셉**: `concept art, full body, [캐릭터 외형], [의상], dynamic pose --ar 2:3 --stylize 250`.
- **타일러블 텍스처**: `seamless tileable texture, [재질], top-down --ar 1:1 --tile`.
- **일관성 확보**: 첫 이미지를 업스케일 → URL을 `--oref`로 재투입.
- **알파 모델**: 텍스트가 들어가는 배너/UI라면 V8 Alpha 이상 + 따옴표 인용 권장.

---

## 5. 출처 (1차 자료)

- Midjourney 변경 노트 (Alpha): <https://alpha.midjourney.com/updates>
- Version 페이지: <https://docs.midjourney.com/hc/en-us/articles/32199405667853-Version>
- V8 Alpha 공지: <https://updates.midjourney.com/v8-alpha/>
- V8.1 Alpha 공지: <https://updates.midjourney.com/v8-1-alpha/>
- Omni Reference (`--oref`): <https://docs.midjourney.com/hc/en-us/articles/36285124473997-Omni-Reference>
- Style Reference (`--sref`): <https://docs.midjourney.com/hc/en-us/articles/32180011136653-Style-Reference>
- Character Reference (`--cref`, V6/Niji 전용): <https://docs.midjourney.com/hc/en-us/articles/32162917505293-Character-Reference>
- Parameter List: <https://docs.midjourney.com/hc/en-us/articles/32859204029709-Parameter-List>
- Draft / Conversational Modes: <https://docs.midjourney.com/hc/en-us/articles/35577175650957-Draft-Conversational-Modes>
