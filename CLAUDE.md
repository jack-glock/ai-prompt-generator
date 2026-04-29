# CLAUDE.md — 다음 세션용 인덱스

> 26-04-28 · 현재 **v0.5** 라이브
> 본문은 `docs/`에. 이 파일은 핵심 사실만.

## 한 줄 요약

게임 그래픽 디자이너용 이미지 프롬프트 생성기. GPT Image / Nano Banana / Midjourney / Niji **12종 모델** + **14종 스타일**. 라이트/다크 모드. Niji 전용 7항목 입력.

- GitHub: <https://github.com/jack-glock/ai-prompt-generator>
- Live: <https://ai-prompt-generator-two-ebon.vercel.app/>
- DevSync 등록: v1.4.7부터

## 기술 스택

Next.js 14.2.5 · React 18.3 · TypeScript 5.5 · Tailwind 3.4 (`darkMode:"class"`) · lucide-react. **외부 API 0건** (1차 정책).

## 핵심 파일

| 파일 | 역할 |
|---|---|
| `app/page.tsx` (~750줄) | UI 전체 |
| `lib/promptBuilder.ts` (~600줄) | 빌더 로직 + 하이라이트 토큰 |
| `app/layout.tsx` | 다크 모드 FOUC 방지 inline script |

## docs/ 지도

- `design-docs/` PROMPT_STRATEGY · UI_DESIGN
- `product-specs/` FEATURES · ACCEPTANCE
- `model-specs/` README + GPT_IMAGE / NANO_BANANA / MIDJOURNEY / NIJI + xlsx
- `exec-plans/` ROADMAP · BACKLOG
- `references/` README

## 현재 상태 (v0.5)

- 입력: 작업유형 5 / 스타일 14 / 비율 5+직접 / 참고이미지 클릭+드래그앤드롭 / 역할 5 / 금지 6 / 한글 textarea / 영어 textarea / **Niji 전용 7항목**
- 출력: 6 카드 (요약 / GPT / Nano / MJ / Niji / 수정). 모델 그룹별 드롭다운. 사용자 옵션 자리 파란색 하이라이트.
- 다크 모드: 헤더 토글 (Sun/Moon). localStorage + `prefers-color-scheme`.
- 모델 12종 기본값: gpt-image-2 · Nano Banana 2 · MJ V8.1 Alpha · Niji 7.

## 다음 작업 — v0.6 후보

1. **P1** 프롬프트 즐겨찾기 (localStorage)
2. **P1** 결과 비교 모드 (좌우 분할)
3. **P2** 추천 프롬프트 갤러리

## 컨벤션 핵심

- **자동 번역 없음** (비용 정책). 사용자가 ChatGPT 등으로 직접 번역.
- **Niji**: 8번 7항목 우선, 비면 영어 textarea 폴백. 다른 모델 무영향.
- **모델별 차등**: GPT/Nano = 영어+한글 병기, MJ/Niji = 영어만.
- **다크 모드**: 모든 색상에 `dark:` variant 동시 정의.
- **하이라이트 토큰**: `hi()` 헬퍼로 `[[B]]...[[/B]]`. 복사/저장 시 `stripHighlight()`.
- 날짜 YY-MM-DD. 파일 삭제 전 사용자 확인.

## 알려진 주의

- MJ V7부터 `--cref` → `--oref`. Niji는 여전히 `--cref`.
- Google 가이드: 부정문 대신 긍정문 권장.
- Vercel Production Branch는 `main` (확인됨).

## 빠른 명령

```bash
npm run dev          # 로컬
npx tsc --noEmit     # 타입체크
git push origin main # Vercel 자동 배포 60-90초
```
