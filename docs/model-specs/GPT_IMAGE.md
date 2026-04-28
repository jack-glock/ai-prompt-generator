# GPT_IMAGE — OpenAI GPT Image 빌더 사양

> 인덱스: [`README.md`](./README.md) §1 모델 매트릭스 / §2 통합 적용표.
> 정정 이력: 26-04-28 — `gpt-image-2`가 cookbook 프롬프팅 가이드에서 정식
> 모델로 확인되어 추가. 이전 매트릭스의 "GPT Image 2 미확인" 표기 철회.

| 다루는 모델 | 옵션값 | 공식 ID | 비고 |
|---|---|---|---|
| **GPT Image 2 (최신 권장)** | `gpt_image_2` | `gpt-image-2` | **새 빌드 기본 권장**. 최강 품질·텍스트·편집·인물 합성. |
| GPT Image 1.5 | `gpt_image_1_5` | `gpt-image-1.5` | 마이그레이션 호환용. |
| GPT Image 1 | `gpt_image_1` | `gpt-image-1` | Legacy 호환용만. |
| GPT Image 1-mini | `gpt_image_1_mini` | `gpt-image-1-mini` | 비용/처리량 우선 (대량 생성). |

> 26-04-21 OpenAI cookbook 가이드 기준. 본 도구는 4종 모두 노출, 기본값은
> `gpt-image-2`.

---

## 1. 사양

| 항목 | 사양 |
|---|---|
| 출력 방식 | **자연어 문장형 지시문**. 5~7문장, 200~800자 권장. |
| 입력 구조 | ① `Create [작업유형 영문 묘사].` ② (이미지 있을 시) `Use the attached reference image to [역할 영문].` ③ `The concept from the designer is: "[한글 요청]".` ④ `It should be [스타일 영문 문장].` ⑤ `Compose the image at [비율 표기], with a clear focal point and balanced composition.` ⑥ (금지 있을 시) `Important constraints: [금지 영문, 콤마구분].` ⑦ `Keep the result production-ready for game art use, with clean edges and consistent lighting.` |
| 추천 키워드 | 장면/스타일/구도/조명/분위기 명시적 묘사. **텍스트는 따옴표로**: `a sign that reads "POTION SHOP"`. 게임 에셋 표지: `production-ready`, `clean edges`, `consistent lighting`. |
| 금지 / 비권장 | 키워드 단순 나열 비권장. 모순 스타일 동시 지정 금지. 부정문(`no/without`) 인식률 약함 — 가능하면 원하는 것을 직접 명시. |
| 비율 처리 | 빌더 출력 문장: `16:9`/`4:3`/`1:1`/`3:4` → `${ratio} aspect ratio`, 픽셀(`1920x1080`) → `${ratio} pixels`. **API `size` 파라미터 매핑(참고)**: 1.5/1/mini는 `1024x1024`/`1536x1024`/`1024x1536`/`auto`. **`gpt-image-2`는 자유 해상도** (제약: max edge<3840 / 16의 배수 / 종횡비 ≤ 3:1 / 픽셀 655,360 ~ 8,294,400). 2K(`2560x1440`), 4K(`3840x2160`)까지 지원. |
| 참고 이미지 | 문장 ②로 자연어 지시. API에서는 `/v1/images/edits` 또는 Responses API의 `image_generation` 툴에 첨부. **`gpt-image-1.5`는 첫 5장까지 high fidelity 보존**, `gpt-image-1` / `mini`는 첫 1장. `input_fidelity:"high"` 권장. **`gpt-image-2`는 `input_fidelity` 비활성** — 출력이 이미 고품질. |
| 파라미터 | 빌더 출력에는 **없음** (자연어만). API 단계: `quality`(low/medium/high/auto), `background`(transparent/opaque/auto, png·webp만), `output_format`(png/jpeg/webp), `output_compression`(0-100, jpeg·webp), `moderation`(auto/low), Responses API의 `action`(auto/generate/edit, 1.5 + chatgpt-image-latest만). |

---

## 2. 버전별 차이

빌더 출력 텍스트 자체는 4종 모두 동일. 모델 메타데이터(주석 `// model: <id>`)만 다르게 기록.

| 항목 | gpt-image-2 | gpt-image-1.5 | gpt-image-1 | gpt-image-1-mini |
|---|---|---|---|---|
| outputQuality | low/medium/high | low/medium/high | low/medium/high | low/medium/high |
| input_fidelity | **비활성** (기본 고품질) | low/high | low/high | low/high |
| size | **자유** (제약 만족 시) | 고정 3종 + auto | 고정 3종 + auto | 고정 3종 + auto |
| 권장 용도 | **새 빌드 기본** | 마이그레이션 호환 | Legacy 호환만 | 비용 효율 (대량) |

`gpt-image-2` 권장 사이즈 (cookbook 기준): 1024x1024, 1024x1536, 1536x1024, 2560x1440 (2K), 3840x2160 (4K, 실험적).

---

## 3. 게임 에셋 제작 팁

- **투명 배경 스프라이트**: API 호출 시 `background:"transparent"` +
  `output_format:"png"`.
- **타일/아이콘 시트**: `size:"1024x1024"` + 프롬프트에 `on a uniform grid, centered`.
- **컨셉아트 세로 키비주얼**: `size:"1024x1536"` + `quality:"high"`.
- **UI 텍스트 요소**: 텍스트 렌더링이 강점 — 버튼/배너 텍스트를 따옴표로
  직접 명시. 폰트 묘사도 같이 (`bold sans-serif`).
- **캐릭터 시트 일관성**: 1.5는 첫 5장까지 high fidelity → 동일 캐릭터의
  여러 각도 이미지를 한 번에 입력.

---

## 4. 제한사항

- Latency: 복잡 프롬프트는 최대 2분.
- Text Rendering: DALL·E 대비 크게 개선됐으나 정확한 위치/크기는 여전히 어려움.
- Consistency: 다회 호출 시 캐릭터/브랜드 요소 일관성이 항상 보장되진 않음.
- Composition Control: 구조적·레이아웃 민감 구도는 어려울 수 있음.
- 콘텐츠 모더레이션: `moderation` 파라미터로 `auto`(기본) / `low` 제어.
- 조직 검증: `gpt-image-*` 사용 전 API Organization Verification 필요.

---

## 5. 출처 (1차 자료)

- 이미지 생성 가이드: <https://developers.openai.com/api/docs/guides/image-generation>
- 프롬프팅 가이드 (Cookbook): <https://developers.openai.com/cookbook/examples/multimodal/image-gen-models-prompting-guide>
- API 레퍼런스: <https://platform.openai.com/docs/api-reference/images>
- 모델 페이지: <https://platform.openai.com/docs/models/gpt-image-1>
