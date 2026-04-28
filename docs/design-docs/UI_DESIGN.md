# UI_DESIGN — UI 설계 결정

## 1. 레이아웃 원칙

- **2열 데스크톱 우선** (`lg:grid-cols-[420px_1fr]`).
  - 좌측 420px: 입력 사이드바 (고정 너비).
  - 우측 fill: 결과 카드들.
- 모바일은 1열로 자동 전환 (Tailwind `lg:` 분기).
- 카드형 UI: `rounded-3xl`, `shadow-sm`. 시각적 그룹화.
- 한 화면에서 입력과 결과가 동시에 보여야 한다 (스크롤 최소화).

---

## 2. 색상 톤

| 용도 | Tailwind 클래스 |
|---|---|
| 페이지 배경 | `bg-slate-100` |
| 카드 배경 | `bg-white` + `shadow-sm` |
| 강조 버튼 (저장·생성) | `bg-slate-900` + `text-white` |
| 칩 활성 | `bg-slate-900` + `text-white` |
| 칩 비활성 | `bg-white` + `text-slate-700` + `border-slate-200` |
| 결과 박스 본문 배경 | `bg-slate-50` |
| 복사됨 피드백 | `bg-emerald-50` + `text-emerald-700` |

이유: 게임 디자이너 기준의 **차분하고 프로페셔널한** 톤. 컬러풀한 액센트는
결과(생성될 이미지)에 양보.

---

## 3. 타이포그래피

- 본문: Tailwind 기본 (system font stack).
- 결과 박스: `font-mono` (영어 프롬프트 가독성 + 코드 같은 느낌).
- 한글 요약 결과는 일반 폰트 유지 가능하나 현재는 통일성 위해 `font-mono`.

---

## 4. 인터랙션

| 동작 | UX |
|---|---|
| 옵션(칩/체크박스) 선택 | 즉시 반영 (실시간 미리보기, `useMemo`) |
| `프롬프트 확인` 버튼 | 결과 영역으로 부드러운 스크롤 |
| `복사` 버튼 | 1.5초간 초록색 "복사됨" 표시 |
| `초기화` 버튼 | 모든 입력 + 업로드 이미지 초기화 |
| `저장` 버튼 | `prompt-YYYYMMDDHHMM.txt` 다운로드 |
| 이미지 업로드 클릭 | `<input type="file">` 트리거 |
| 업로드 완료 | `FileReader.readAsDataURL` → 미리보기 |
| 이미지 제거 (X 버튼) | state 초기화 + file input value 비움 |

---

## 5. 컴포넌트 구조

```
HomePage (app/page.tsx)
├── header
│   ├── 제목·설명
│   └── [초기화] [저장]
└── grid (lg:grid-cols-[420px_1fr])
    ├── aside (입력 사이드바)
    │   ├── Section "1. 작업 유형" + Chip[]
    │   ├── Section "2. 스타일" + Chip[]
    │   ├── Section "3. 비율" + Chip[] (+ 직접입력 input)
    │   ├── Section "4. 참고 이미지" + 업로드/미리보기 + Chip[]
    │   ├── Section "5. 금지 요소" + checkbox[]
    │   └── Section "6. 한글 요청" + textarea + 확인 버튼
    └── main (결과)
        ├── ResultCard "한글 요약"
        ├── ResultCard "GPT Image용"
        ├── ResultCard "Nano Banana용"
        ├── ResultCard "Midjourney용"
        └── ResultCard "수정 요청용"
```

작은 헬퍼 컴포넌트:
- `Section({ title, children })` — 번호 헤더 + 본문
- `Chip({ label, active, onClick })` — 알약형 토글 버튼
- `ResultCard({ title, description, content })` — 복사 버튼 포함 결과 박스

---

## 6. 접근성

- 모든 버튼은 `<button type="button">` 명시 (form submit 방지).
- `<label>`로 input 라벨 연결.
- 색만으로 상태 구분하지 않음 (활성 칩은 채움 + 색 둘 다 변경).
- 이미지 업로드 영역은 시각적 피드백(점선 → 미리보기 전환).

---

## 7. 변경 시 주의

- **칩 색상 변경하려면 `Chip` 컴포넌트 한 곳만** 수정. 호출부 변경 불필요.
- 새 옵션 추가 시 다음 셋 모두 갱신:
  1. 상수 배열 (`WORK_TYPES`, `STYLES`, `RATIOS`, `REFERENCE_ROLES`, `FORBID_ITEMS`)
  2. `lib/promptBuilder.ts` 라벨/매핑
  3. `docs/product-specs/FEATURES.md`
- 결과 카드의 `font-mono` 는 의도된 선택. 디자인 회의 없이 바꾸지 말 것.
- lucide 아이콘 변경 시 import 누락 주의 (`Copy`, `ImagePlus`, `Wand2`, `RefreshCcw`, `Save`, `Check`, `X`).
