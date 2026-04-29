# FEATURES

> 26-04-29 · v0.7 라이브 · ✅ · 🟡 · ⏳ · ❌

## 1. 입력 (사이드바)

| 기능 | 비고 |
|---|---|
| 1. 원본 한글 메모 (textarea) | 한국어 토글의 "작가 메모:"에만 들어감. MJ/Niji 미포함. |
| 2. 영어 보충 입력 (textarea) | 모든 영어 빌더에 그대로 반영. 한국어 빌더에서는 제외. |
| 3. **AI 번역 버튼** ✅ v0.7 | 한글 메모 → 영어 보충에 자동 채움 (Gemini, ~1원). |
| 4. **AI 옵션 채우기 버튼** ✅ v0.7 | 한글/영어 입력을 분석해 옵션 슬롯 자동 분배 (Gemini, ~3원). |
| 5. 키워드로 옵션 채우기 (즉시) | 정해진 키워드 매칭. 무료. |
| 6. 참고 이미지 1행 3슬롯 ✅ v0.7 | 정사각형 클릭/드롭. dataURL만, 외부 전송 X. |
| 7. **슬롯별 AI 분석 버튼** ✅ v0.7 | 역할 기반 슬롯 분리로 충돌 방지 (Gemini, ~3원). |
| 8. 작업 유형 5종 chip | 캐릭터/배경/프레임/아이콘/오브젝트 |
| 9. 스타일 17종 + 자동/직접입력 | 각 칩 hover 툴팁 desc |
| 10. 비율 5+직접입력 | `1000x600` → 단순 비율 환산은 코드만 |
| 11. 빼고 싶은 것 15종 | 체크박스 + 직접 입력 |
| 12. 작업유형별 옵션 (캐릭터/배경/에셋) | Section으로 통일된 디자인 |
| 13. **옵션 그룹 사용 토글 8개** ✅ v0.6 | iOS 스위치 (emerald). localStorage 저장. |
| 14. Section 접기·펼치기 | 헤더 hover 툴팁 |

## 2. 출력 (6 카드)

| 카드 | 비고 |
|---|---|
| 정리된 요청 요약 | 2열 표 + 태그 (negative/reference). enabled OFF 그룹 자동 숨김. |
| GPT Image | 드롭다운 4종 (gpt-image-2 기본). 문장형. **EN/한국어 토글** ✅ v0.7. |
| Nano Banana | 드롭다운 3종 (nano_banana_2 기본). **자연어 문장형 (Google 권장)** ✅ v0.7. 모델별 capability 차등. **EN/한국어 토글**. |
| Midjourney | 드롭다운 3종 (V8.1 Alpha 기본). 키워드만 (dash 파라미터 없음, 사용자가 Discord에서 직접 추가). |
| Niji | 드롭다운 2종 (Niji 7 기본). 애니 키워드만. |
| 수정 요청용 | Keep/Change/Remove/Do not change 영문 템플릿 |

공통: 복사 버튼은 본문 박스 우상단 floating. AI 분석 완료 시 버튼 emerald → slate + ✓.

## 3. 헤더

다크/라이트 토글 (Sun/Moon, localStorage) · 초기화.

## 4. AI 통합 (v0.7)

| 항목 | 비고 |
|---|---|
| 모델 | Gemini 2.5 Flash |
| 비용 | 번역 ~1원 / 옵션 추출 ~3원 / 이미지 분석 ~3원 |
| 키 보안 | 서버 환경변수 `GEMINI_API_KEY` (클라이언트 미노출) |
| 호출 방식 | Next.js API Route (`/api/ai/translate`, `/extract`, `/analyze-image`) |
| 자동 실행 | ❌ 모두 사용자 수동 클릭 |
| 빈 문자열 처리 | `mergeAiHints`에서 옵션 슬롯 빈 문자열 무시 |
| 시각 피드백 | 분석 완료 시 버튼 색 변경 + ✓ + 입력 변경 시 자동 복귀 |

## 5. 인프라

- GitHub 자동 동기화
- Vercel `main` push 자동 배포 60-90초
- Vercel 환경변수: `GEMINI_API_KEY` (Production + Preview, Sensitive)
- DevSync v1.4.7+ · `.devsync/` Git 제외

## 6. 의도적 미구현

- ❌ 이미지 생성 API 직접 연동
- ❌ 사용자 인증 / 서버 DB
- ❌ MJ/Niji `--sref` 자동 채우기 (외부 호스팅 필요)
- ❌ 참고 이미지의 GPT/Nano 텍스트 안내 (사용자가 도구에 직접 첨부)

## 7. 검증 / 테스트

- `npx tsc --noEmit` 통과
- `npx tsx tests/smoke.ts` — 39+ 케이스 (한글 격리, MJ/Niji dash 미포함 등)
- `mergeAiHints` 정밀 검증 — 25/25 통과
