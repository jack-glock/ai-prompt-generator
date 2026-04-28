# FEATURES — 기능 현황

> 각 기능의 **구현 상태**. 새 기능 추가하면 여기에 즉시 반영.
>
> 마지막 갱신: 26-04-28 (v0.4 라이브 반영)

범례: ✅ 동작 · 🟡 부분 · ⏳ 계획 · ❌ 영구 제외

---

## 1. 입력 영역

| 기능 | 상태 | 비고 |
|---|---|---|
| 한글 요청 textarea (메모용) | ✅ | 자유 입력. 한글 요약 카드 + GPT/Nano 결과의 원문 병기에만 사용 |
| **영어 요청 textarea (실제 프롬프트용)** | ✅ v0.4 | 사용자가 ChatGPT 등으로 한글을 영어 번역해 직접 붙여넣기 |
| 작업 유형 5종 (배너/캐릭터/프레임/배경/아이콘) | ✅ | `WORK_TYPES` 상수. 한 줄 5칸 그리드 |
| **스타일 16종** | ✅ v0.4 | 기존 7종 + 신규 9종 (애니/망가, 치비, 픽셀 아트, 콘셉트 아트, 플랫/벡터, 사이버펑크, 다크 판타지, 슬롯 프리미엄, 디즈니/픽사). 3열 그리드 |
| 비율 5종 + 직접 입력 | ✅ | `1000x600` → `--ar 5:3` 자동 환산. 6칸 한 줄 그리드 |
| 참고 이미지 클릭 업로드 | ✅ | Data URL 미리보기. 외부 전송 없음 |
| **참고 이미지 드래그 앤 드롭** | ✅ v0.4 | 박스 위에 파일 끌어다 놓기. dragOver 시 파란색 강조 |
| 참고 이미지 역할 5종 (스타일/구도/색감/캐릭터/재질) | ✅ | 업로드 시 프롬프트에 자동 반영. 3열 그리드 |
| 금지 요소 체크박스 6종 | ✅ |  |

---

## 2. 출력 영역

| 기능 | 상태 | 비고 |
|---|---|---|
| 한글 요약 카드 | ✅ | 입력 확인용 |
| **GPT Image 카드 + 버전 드롭다운 4종** | ✅ v0.4 | gpt-image-2 (기본) / 1.5 / 1 / 1-mini |
| **Nano Banana 카드 + 버전 드롭다운 3종** | ✅ v0.4 | Nano Banana 2 (기본) / Nano Banana / Pro. Pro/2 가산 라인 차등 |
| **Midjourney 카드 + 버전 드롭다운 3종** | ✅ v0.4 | V8.1 Alpha (기본) / V8 Alpha / V7. V7부터 `--cref` → `--oref` 교체 |
| **Niji 카드 + 버전 드롭다운 2종** | ✅ v0.4 | Niji 7 (기본) / Niji 6. `--niji 6/7` + `--cref` 사용 |
| 수정 요청용 (영문 템플릿) | ✅ | v0.2.1부터 영문 |
| 결과 박스 복사 버튼 | ✅ | clipboard API + execCommand fallback. v0.4부터 하이라이트 토큰 자동 제거 |
| **사용자 입력 자리 파란색 하이라이트** | ✅ v0.4 | 빌더가 `[[B]]...[[/B]]` 토큰 삽입. 컴포넌트가 `<span text-blue-600>`으로 렌더링 |
| 실시간 미리보기 | ✅ | useMemo, 100ms 이내 갱신 |
| 모델 그룹별 카드 (`ModelGroupCard`) | ✅ v0.4 | 카드 헤더에 select 드롭다운 + 복사 버튼 |

---

## 3. 헤더 액션

| 기능 | 상태 | 비고 |
|---|---|---|
| 초기화 (모든 입력 기본값) | ✅ | dragOver, 영어 textarea, 모델 드롭다운까지 모두 리셋 |
| 저장 (전체 결과 .txt 다운로드) | ✅ | 6개 결과(요약/GPT/Nano/MJ/Niji/수정). 하이라이트 토큰 제거 후 plain text 저장 |

---

## 4. 인프라

| 기능 | 상태 | 비고 |
|---|---|---|
| GitHub 자동 동기화 | ✅ | jack-glock/ai-prompt-generator |
| Vercel 자동 배포 | ✅ | `main` push → 60~90초 후 라이브 반영 |
| DevSync 등록 | ✅ | v1.4.7부터 |
| `.devsync/` Git 제외 | ✅ | `.gitignore`에 등재 |
| **현재 버전** | ✅ | **v0.4** (26-04-28 라이브) |

---

## 5. 의도적 미구현 (1차 정책)

| 기능 | 상태 | 사유 |
|---|---|---|
| 실제 이미지 생성 API 호출 | ❌ | 1차 정책. 키 관리·비용 회피 |
| 자동 번역 API (OpenAI/DeepL/Google/Azure) | ❌ | 26-04-28 정책 결정. 비용 부담 + ChatGPT 구독과 별개 결제 사유. 사용자가 영어 직접 입력 |
| 사용자 인증 / 로그인 | ❌ | 1차 정책. 1인 사용 |
| 데이터베이스 / 서버 상태 | ❌ | 1차 정책. 정적 페이지 유지 |
| PSD 자동화 | ❌ | 1차 정책 |
| Midjourney 자동 호출 | ❌ | 1차 정책 |

---

## 6. 검토 중 (다음 릴리즈 후보)

| 기능 | 상태 | 참고 |
|---|---|---|
| 프롬프트 즐겨찾기 (localStorage) | ⏳ | `BACKLOG.md` P1 |
| 결과 비교 모드 (좌우 분할) | ⏳ | `BACKLOG.md` P1 |
| 다크 모드 | ⏳ | `BACKLOG.md` P2 |
| Niji 캐릭터 키워드 자동 분리 (외형/표정/포즈/의상/배경/화각/매체) | ⏳ | `model-specs/NIJI.md` §2 |
| 다국어 UI | ⏳ | `BACKLOG.md` P3 |

---

## 7. 외부 의존

| 도구 | 사용 여부 |
|---|---|
| Next.js 14.2.5 | ✅ |
| React 18.3 | ✅ |
| Tailwind CSS 3.4 | ✅ |
| TypeScript 5.5 | ✅ |
| lucide-react ^0.468 | ✅ |
| 번역 API (OpenAI/DeepL/Google/Azure) | ❌ (현 정책 미사용) |
| 이미지 생성 API (OpenAI, Midjourney 등) | ❌ (1차 정책) |

---

## 8. 지원 모델 매트릭스 (12종, 26-04-28 검증)

| 그룹 | 옵션값 | 공식 ID | 비고 |
|---|---|---|---|
| GPT Image | `gpt_image_2` | `gpt-image-2` | 기본값. 새 빌드 권장. 자유 해상도 |
| GPT Image | `gpt_image_1_5` | `gpt-image-1.5` | 마이그레이션 호환 |
| GPT Image | `gpt_image_1` | `gpt-image-1` | Legacy 호환 |
| GPT Image | `gpt_image_1_mini` | `gpt-image-1-mini` | 비용 효율 |
| Nano Banana | `nano_banana` | `gemini-2.5-flash-image` | 기본 버전 |
| Nano Banana | `nano_banana_2` | `gemini-3.1-flash-image-preview` | 기본값 |
| Nano Banana | `nano_banana_pro` | `gemini-3-pro-image-preview` | 4K + 인물 5명 일관성 |
| Midjourney | `mj_v7` | Midjourney V7 | `--oref` 기본 |
| Midjourney | `mj_v8_alpha` | Midjourney V8 Alpha | 26-03-17, `--hd` |
| Midjourney | `mj_v8_1_alpha` | Midjourney V8.1 Alpha | 기본값. HD 기본 |
| Niji | `niji_6` | Niji V6 | `--niji 6` + `--cref` |
| Niji | `niji_7` | Niji V7 | 기본값. 26-01-09. Precision Prompting |

상세 사양은 `docs/model-specs/`.

---

## 갱신 규칙

- 작업 완료 → 해당 행 상태 **`✅`** 로 변경
- 신규 기능 → 적절한 섹션에 행 추가
- 영구 미구현 결정 → `❌` + `BACKLOG.md`에 `P-` 사유 기록
