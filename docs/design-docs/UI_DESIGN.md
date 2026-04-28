# UI_DESIGN

> 26-04-28 · v0.5

## 레이아웃

`lg:grid-cols-[420px_1fr]` 2열. 모바일 1열 자동. 카드 `rounded-3xl shadow-sm`.

## 색상 (라이트 / 다크)

`darkMode:"class"`. `<html>`에 `dark` 토글.

| 용도 | 라이트 | 다크 |
|---|---|---|
| 페이지 | `bg-slate-100` | `dark:bg-slate-950` |
| 카드 | `bg-white` | `dark:bg-slate-900` |
| 본문 | `text-slate-900` | `dark:text-slate-100` |
| 강조/활성 칩 | `bg-slate-900 text-white` | 반전 `dark:bg-slate-100 dark:text-slate-900` |
| 결과 박스 | `bg-slate-50` | `dark:bg-slate-800` |
| 하이라이트 | `text-blue-600` | `dark:text-blue-400` |
| 드래그/안내 | `bg-blue-50 border-blue-500` | `dark:bg-blue-950 dark:border-blue-400` |

## 다크 모드

우선순위: `localStorage('theme')` > `prefers-color-scheme` > 라이트.
FOUC 방지: `app/layout.tsx` head에 inline script.
토글: 헤더 우측 Sun/Moon. useState + useEffect로 클래스 ↔ state 동기화.

## 컴포넌트 구조

```
HomePage
├── header [다크 토글] [초기화] [저장]
└── grid
    ├── aside (Section 1~8)
    │   ├── 1 작업유형 ChipSm × 5 (5칸)
    │   ├── 2 스타일 ChipSm × 16 (3열)
    │   ├── 3 비율 ChipXs × 6 (6칸 compact)
    │   ├── 4 참고이미지 (드래그앤드롭) + ChipSm × 5
    │   ├── 5 금지 checkbox × 6
    │   ├── 6 한글 textarea + 안내
    │   ├── 7 영어 textarea + 확인 버튼
    │   └── 8 Niji 전용 input × 7  (v0.5)
    └── main: ResultCard 요약 / ModelGroupCard × 4 / ResultCard 수정
```

헬퍼: `Section` · `ChipSm` (sm) · `ChipXs` (compact) · `ResultCard` · `ModelGroupCard` · `HighlightedContent` (`[[B]]` → 파란 span).

## 하이라이트 토큰

빌더가 사용자 옵션 자리만 `[[B]]...[[/B]]` 감쌈 (`hi()`). 고정 문구는 색칠 안 함.
복사/저장 시 `stripHighlight()`로 제거.

## 인터랙션

- 옵션/드롭다운/textarea 변경 → useMemo 즉시 갱신
- 다크 토글 → 즉시 전환 + localStorage
- 드래그앤드롭 → 파란 강조 → 드롭
- 복사 → 1.5초 "복사됨" + 토큰 제거 plain text
- 저장 → `prompt-YYYYMMDDHHMM.txt` (토큰 제거)

## 변경 시 주의

- 새 옵션/모델 → 상수 배열 + `promptBuilder.ts` 매핑 + `FEATURES.md` 동시 갱신
- 새 색상 → 라이트/다크 양쪽 정의 (한쪽만이면 깨짐)
- 토큰 정규식 변경 → `HighlightedContent` + `stripHighlight` 동시
- lucide 아이콘 import 누락 주의 (`Sun`, `Moon` v0.5+)
