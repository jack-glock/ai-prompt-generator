# FEATURES

> 26-04-28 · v0.5 라이브 · ✅ · 🟡 · ⏳ · ❌

## 1. 입력 (사이드바 8섹션)

| 기능 | 비고 |
|---|---|
| 1. 작업 유형 5종 | 5칸 그리드 |
| 2. 스타일 16종 | 3열 그리드. 디즈니/픽사 등 |
| 3. 비율 5+직접 | 6칸. `1000x600`→`--ar 5:3` |
| 4. 참고이미지 클릭+드래그앤드롭 | Data URL. 외부 전송 없음 |
| 4. 참고이미지 역할 5종 | 3열 |
| 5. 금지 요소 6종 | 체크박스 |
| 6. 한글 textarea (메모용) | 한글 요약 + GPT/Nano 병기에만 |
| 7. 영어 textarea | 사용자 직접 번역 |
| 8. **Niji 전용 7항목** v0.5 | 외형/표정/포즈/의상/배경/화각/매체. 비면 영어 폴백 |

## 2. 출력 (6 카드)

| 카드 | 비고 |
|---|---|
| 한글 요약 | |
| GPT Image | 드롭다운 4종 (gpt-image-2 기본) |
| Nano Banana | 드롭다운 3종. Keep/Change/Remove + Pro/2 가산 |
| Midjourney | 드롭다운 3종 (V8.1 Alpha 기본). `--ar` + `--oref` |
| Niji | 드롭다운 2종 (Niji 7 기본). `--niji` + `--cref`. 8번 7항목 우선 |
| 수정 요청용 | 영문 템플릿 |

공통: 사용자 옵션 자리 파란색 하이라이트. 복사/저장 시 토큰 자동 제거. useMemo 실시간.

## 3. 헤더

다크/라이트 토글 v0.5 (Sun/Moon, localStorage) · 초기화 · 저장 (.txt 6개 결과).

## 4. 인프라

GitHub 자동 동기화 · Vercel `main` push 자동 배포 60-90초 · DevSync v1.4.7+ · `.devsync/` Git 제외.

## 5. 의도적 미구현

이미지 생성 API ❌ · 자동 번역 API ❌ (비용) · 인증/DB/PSD/MJ 자동 호출 ❌.

## 6. v0.6 후보

⏳ 즐겨찾기 (P1) · 결과 비교 모드 (P1) · 추천 갤러리 (P2) · 다국어 (P3).

## 7. 외부 의존

Next.js 14.2.5 · React 18.3 · Tailwind 3.4 · TypeScript 5.5 · lucide-react ^0.468. 번역/이미지 API ❌.

## 8. 모델 12종

| 그룹 | 옵션값 | API ID | 비고 |
|---|---|---|---|
| GPT | `gpt_image_2` | `gpt-image-2` | 기본. 자유 해상도 |
| GPT | `gpt_image_1_5` | `gpt-image-1.5` | 마이그레이션 |
| GPT | `gpt_image_1` | `gpt-image-1` | Legacy |
| GPT | `gpt_image_1_mini` | `gpt-image-1-mini` | 비용 효율 |
| Nano | `nano_banana` | `gemini-2.5-flash-image` | |
| Nano | `nano_banana_2` | `gemini-3.1-flash-image-preview` | 기본 |
| Nano | `nano_banana_pro` | `gemini-3-pro-image-preview` | 4K + 5인 일관 |
| MJ | `mj_v7` | V7 | `--oref` |
| MJ | `mj_v8_alpha` | V8 Alpha | `--hd` |
| MJ | `mj_v8_1_alpha` | V8.1 Alpha | 기본. HD 기본 |
| Niji | `niji_6` | V6 | `--niji 6` + `--cref` |
| Niji | `niji_7` | V7 | 기본. 8번 7항목 우선 |

상세는 `docs/model-specs/`.
