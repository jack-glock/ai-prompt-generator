# NIJI — Niji 빌더 사양

> 인덱스: [`README.md`](./README.md) §1 모델 매트릭스 / §2 통합 적용표.

| 다루는 모델 | 옵션값 | 출시 / 공개 |
|---|---|---|
| Niji 6 | `niji_6` | 정식 |
| Niji 7 | `niji_7` | 26-01-09 정식 |

> Niji는 Midjourney + Spellbrush 협업의 **애니/만화 특화** 모델.

---

## 1. Niji 6 사양 (기준)

| 항목 | 사양 |
|---|---|
| 출력 방식 | **캐릭터/애니 키워드** 콤마 나열 + `--niji 6` |
| 입력 구조 | `[캐릭터 외형], [표정/감정], [포즈/액션], [의상/액세서리], [배경/환경], [화각/구도], [매체 키워드] --niji 6 --ar [비율][, --no ...][, --cref [url] --cw 100][, --sref [url] --sw 100][, --style original|cute|scenic|expressive]` |
| 추천 키워드 | **외형**(성별/연령/헤어/눈색), **표정**(`smiling`, `determined gaze`), **포즈**(`dynamic action pose`), **의상**(`fantasy armor`), **배경**(`cherry blossom courtyard`), **화각**(`close-up portrait`, `full body`, `three-quarter view`), **매체**(`anime style`, `cel shading`, `key visual`). |
| 금지 / 비권장 | 실존 작가/스튜디오 이름 자제. NSFW / 실존 미성년자 자동 차단. 캐릭터 외형이 모호하면 일관성 깨짐 — **외형 항목 명확히**. |
| 비율 처리 | V 모델과 동일. 캐릭터는 세로 권장 (`--ar 2:3`, `--ar 3:4`). |
| 참고 이미지 | **`--cref`(Character Reference)와 `--sref`(Style Reference) 공식 지원**. `--oref`는 V7 전용 — Niji 6에서는 미지원. `--cw 0~100`로 일관성 강도 조절. |
| 파라미터 | `--niji 6` 필수, `--ar`, `--no`, `--stylize 0~1000`(기본 100), `--chaos 0~100`, `--cref`, `--sref`, `--style original|cute|scenic|expressive`. |

### 1-1. `--style` 옵션 (Niji 6/7 공통)

- `--style original` — Niji 5 원본 톤 재현 (레거시).
- `--style cute` — 둥글고 부드러운 차밍한 캐릭터/소품 강조.
- `--style scenic` — 캐릭터를 배경 속에 자연스럽게 배치, 영화적 환경 연출.
- `--style expressive` — 보다 성숙하고 일러스트레이션에 가까운 톤.

미지정 시 모델 기본 스타일 적용.

---

## 2. Niji 7 — 추가/변경 사항 (26-01-09)

공식 가이드 `nijijourney.com/blog/niji-7-prompting`:

- **"Precision Prompting"** — 모델이 **요구한 것만 정확히** 그림. 디테일이
  부족하면 결과도 단순. 풍부한 결과 원하면 **프롬프트를 더 자세히** 쓸 것.
- **배경 기본 없음** → 배경 원하면 `indoors` / `outdoors` 등 명시.
- **풀바디 원하면 신발 명시** (`wearing boots`, `wearing sneakers`).
- 디테일 줄이려면: `minimal`, `simple`, `flat shading`.
- 평면 느낌 줄이려면: `golden hour`, `painted`, `depth of field`.
- 이전 모델 룩 모방: 이전 모델로 생성한 이미지를 `--sref`로 다시 입력.
- 다양성 늘리기: `--chaos 40` 등 (Web UI는 "Variety" 슬라이더).
- 애니 톤 줄이기: 스타일 설정 `default` → `raw` 전환 또는 `--raw`.
- `--cref`, `--sref`, `--style` 옵션은 Niji 6과 동일.

**빌더 분기 규칙**: 끝 파라미터를 `--niji 7`로 변경. 풀바디 작업유형이
선택되면 신발 키워드(`wearing boots`)를 자동 삽입하는 옵션 검토.

---

## 3. 게임 캐릭터 일러스트 제작 팁

- **컨셉아트 풀바디**: `[외형], [의상], wearing boots, dynamic action pose, full body, anime style --niji 7 --ar 2:3 --stylize 250 --style expressive`.
- **2D 게임 키비주얼**: `key visual, anime style, dynamic composition, [컨셉] --niji 7 --ar 16:9`.
- **캐릭터 시트**: `character reference sheet, multiple angles, front view, side view, back view --niji 7 --ar 16:9`.
- **일관성 확보**: 첫 이미지를 업스케일 → URL을 `--cref`로 재투입,
  `--cw 100` + 동일 시드 권장.
- **Niji 7 풍부한 결과**: 외형 + 의상 + 표정 + 포즈 + 배경 + 화각을
  **모두 명시**. 짧은 프롬프트는 의도적으로 단순한 결과를 냄.

---

## 4. 출처 (1차 자료)

- Niji 7 프롬프팅 가이드 (26-01-26): <https://nijijourney.com/blog/niji-7-prompting>
- Niji 7 출시 공지: <https://updates.midjourney.com/niji-v7/>
- Niji Journey 공식: <https://nijijourney.com/>
- Niji Model 페이지 (Midjourney Docs): <https://docs.midjourney.com/hc/en-us/articles/32218510124557-Niji-Model>
- Character Reference (`--cref`): <https://docs.midjourney.com/hc/en-us/articles/32162917505293-Character-Reference>
- Style Reference (`--sref`): <https://docs.midjourney.com/hc/en-us/articles/32180011136653-Style-Reference>
