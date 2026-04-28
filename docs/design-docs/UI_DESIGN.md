# UI_DESIGN — UI 설계 결정

> 마지막 갱신: 26-04-28 (v0.4 라이브 반영)

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
| **결과 본문 사용자 옵션 자리** (v0.4) | **`text-blue-600`** (파란색 하이라이트) |
| 복사됨 피드백 | `bg-emerald-50` + `text-emerald-700` |
| **드래그 오버 강조** (v0.4) | `border-blue-500` + `bg-blue-50` + `text-blue-700` |
| **안내 박스** (v0.4) | `bg-blue-50` + `text-blue-800` |

이유: 게임 디자이너 기준의 **차분하고 프로페셔널한** 톤. 컬러풀한 액센트는
결과(생성될 이미지)에 양보. 파란색은 **사용자 입력 자리 식별** 용도로만 사용.

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
| 모델 그룹 카드의 버전 드롭다운 변경 | 결과 즉시 갱신 (예: V8.1 ↔ V8 시 `--hd` 추가/제거) |
| 한글 / 영어 textarea 입력 | 즉시 반영 (한글은 요약 + GPT/Nano 병기, 영어는 모든 모델 본문) |
| `프롬프트 확인` 버튼 | 결과 영역으로 부드러운 스크롤 |
| `복사` 버튼 | 1.5초간 초록색 "복사됨" 표시. 클립보드에는 하이라이트 토큰 제거된 plain text |
| `초기화` 버튼 | 모든 입력 + 업로드 이미지 + 모델 드롭다운 초기화 |
| `저장` 버튼 | `prompt-YYYYMMDDHHMM.txt` 다운로드 (토큰 제거된 plain text) |
| 이미지 업로드 클릭 | `<input type="file">` 트리거 |
| **이미지 드래그 앤 드롭** (v0.4) | 박스 위에 파일 끌면 파란색 강조 → 드롭 시 미리보기 |
| 업로드 완료 | `FileReader.readAsDataURL` → 미리보기 |
| 이미지 제거 (X 버튼) | state 초기화 + file input value 비움 |

---

## 5. 컴포넌트 구조 (v0.4)

```
HomePage (app/page.tsx)
├── header
│   ├── 제목·설명
│   └── [초기화] [저장]
└── grid (lg:grid-cols-[420px_1fr])
    ├── aside (입력 사이드바)
    │   ├── Section "1. 작업 유형" + ChipSm[] (5칸 그리드)
    │   ├── Section "2. 스타일" + ChipSm[] (3열 그리드, 16종)
    │   ├── Section "3. 비율" + ChipXs[] (6칸 그리드, compact) (+ 직접입력 input)
    │   ├── Section "4. 참고 이미지" (드래그앤드롭 컨테이너 + 업로드/미리보기 + ChipSm[])
    │   ├── Section "5. 금지 요소" + checkbox[]
    │   ├── Section "6. 한글 요청 (메모용)" + 안내 박스 + textarea
    │   └── Section "7. 영어 요청 (실제 프롬프트용)" + textarea + 확인 버튼
    └── main (결과)
        ├── ResultCard "한글 요약"
        ├── ModelGroupCard "GPT Image" (드롭다운 4종)
        ├── ModelGroupCard "Nano Banana" (드롭다운 3종)
        ├── ModelGroupCard "Midjourney" (드롭다운 3종)
        ├── ModelGroupCard "Niji" (드롭다운 2종)
        └── ResultCard "수정 요청용 프롬프트"
```

작은 헬퍼 컴포넌트:
- `Section({ title, children })` — 번호 헤더 + 본문
- `ChipSm({ label, active, onClick })` — 일반 그리드용 칩 (`px-2 py-2 text-sm`, `w-full`)
- `ChipXs({ label, active, onClick })` — compact 칩 (`px-1.5 py-1.5 text-xs truncate`, 6칸 그리드용)
- `HighlightedContent({ content })` — `[[B]]...[[/B]]` 토큰 파싱 + 파란색 span 렌더링
- `ResultCard({ title, description, content })` — 단순 결과 박스 (요약/수정요청용)
- `ModelGroupCard({ title, description, options, selected, onSelect, content })` — 모델 그룹 카드 (드롭다운 + 결과 + 복사)

---

## 6. 하이라이트 토큰 시스템 (v0.4)

빌더(`lib/promptBuilder.ts`)는 사용자 입력/선택 자리를 `[[B]]...[[/B]]` 토큰으로 감싼다. 빌더 자체가 추가한 고정 문구(예: `Create`, `It should be`, `// model: ...`)는 색칠하지 않는다.

| 단계 | 처리 |
|---|---|
| 빌더 출력 | `[[B]]Jurassic banner[[/B]], [[B]]game banner...[[/B]], high quality, ...` |
| 화면 렌더링 (`HighlightedContent`) | 정규식 `/(\[\[B\]\][\s\S]*?\[\[\/B\]\])/g`로 split → 매치된 부분은 `<span className="text-blue-600">`, 나머지는 plain |
| 복사 / 저장 (`stripHighlight`) | 정규식 `/\[\[\/?B\]\]/g`로 토큰 제거 후 클립보드 / .txt 출력 |

빌더에서 토큰을 추가하려면 `hi(text)` 헬퍼 호출. 새 사용자 옵션 추가 시 동일하게 감싸면 자동으로 파란색 처리됨.

---

## 7. 접근성

- 모든 버튼은 `<button type="button">` 명시 (form submit 방지).
- `<label>`로 input 라벨 연결.
- 색만으로 상태 구분하지 않음 (활성 칩은 채움 + 색 둘 다 변경, 드래그 오버는 테두리 + 배경 + 텍스트 모두 변경).
- 이미지 업로드 영역은 시각적 피드백(점선 → 미리보기 전환).
- 파란색 하이라이트는 색만이 아니라 사용자 입력 자리라는 시맨틱이 함께 전달됨 (안내 메시지 "파란색은 사용자 옵션·입력 자리입니다" 명시).

---

## 8. 변경 시 주의

- **칩 색상 변경하려면 `ChipSm`/`ChipXs` 컴포넌트 한 곳만** 수정. 호출부 변경 불필요.
- 새 작업 유형/스타일/모델 추가 시 다음 셋 모두 갱신:
  1. 상수 배열 (`WORK_TYPES`, `STYLES`, `RATIOS`, `REFERENCE_ROLES`, `FORBID_ITEMS`, `GPT_OPTIONS` 등)
  2. `lib/promptBuilder.ts` 라벨/매핑 (`WORK_TYPE_LABEL`, `STYLE_LABEL`, `MODEL_LABEL`, `*_EN`)
  3. `docs/product-specs/FEATURES.md` 행 갱신
- 결과 카드의 `font-mono`는 의도된 선택. 디자인 회의 없이 바꾸지 말 것.
- lucide 아이콘 변경 시 import 누락 주의 (`Copy`, `ImagePlus`, `Wand2`, `RefreshCcw`, `Save`, `Check`, `X`, `Info`).
- **하이라이트 토큰 시스템 변경 시** `HighlightedContent` 정규식과 `stripHighlight` 정규식이 일치하도록 동시 수정.
