# CLAUDE.md — 프로젝트 컨텍스트 (다음 세션용)

> 이 파일은 다음 AI 세션이 프로젝트 상태를 빠르게 파악하기 위한 요약본.
> 본문은 `docs/`에. **이 파일은 인덱스 + 핵심 사실만**.
>
> 마지막 갱신: 26-04-28

---

## 1. 프로젝트 한 줄 요약

게임 그래픽 디자이너용 **이미지 프롬프트 자동 생성기** 웹앱.
한글 자유 입력 + 작업 유형/스타일/비율/금지 옵션을 받아
GPT Image / Nano Banana / Midjourney / Niji 용 영문 프롬프트를 동시 생성.

- **GitHub**: <https://github.com/jack-glock/ai-prompt-generator>
- **Live**: <https://ai-prompt-generator-two-ebon.vercel.app/>
- **DevSync 등록**: v1.4.7부터
- **현재 버전**: v0.2 (2.5절 영문 수정 프롬프트 적용 후 v0.2.1)

---

## 2. 기술 스택

- Next.js 14.2.5 (App Router)
- React 18.3 / TypeScript 5.5 / Tailwind CSS 3.4
- lucide-react (아이콘)
- 외부 API 미사용 (1차 정책 — `docs/exec-plans/BACKLOG.md` 참고)

---

## 3. 핵심 파일

| 파일 | 역할 |
|---|---|
| `app/page.tsx` | UI 전체 (입력 사이드바 + 결과 카드 + 헤더 액션) |
| `lib/promptBuilder.ts` | 프롬프트 생성 로직 (GPT / Nano / MJ / 수정 4종) |
| `docs/CLAUDE.md` (이 파일) | 다음 세션용 컨텍스트 인덱스 |

---

## 4. docs 디렉토리 지도

```
docs/
├── design-docs/
│   ├── PROMPT_STRATEGY.md   ← 도구별 형식이 다른 이유(전략)
│   ├── UI_DESIGN.md         ← UI 설계
│   └── MODEL_SPEC.md        ← (구) 모델 사양 통합본 — 분리됨, 처리 대기
├── product-specs/
│   ├── FEATURES.md          ← 기능 구현 현황 (✅/🟡/⏳/❌)
│   └── ACCEPTANCE.md        ← 수용 기준
├── model-specs/             ← 26-04-28 신규 — 모델별 빌더 사양
│   ├── README.md            ← 인덱스 + 매트릭스 + 통합표 + 빌더 매핑
│   ├── GPT_IMAGE.md         ← GPT Image 1.5 / 1 / 1-mini
│   ├── NANO_BANANA.md       ← Nano Banana / 2 / Pro
│   ├── MIDJOURNEY.md        ← Midjourney V7 / V8 Alpha / V8.1 Alpha
│   ├── NIJI.md              ← Niji 6 / 7
│   └── MODEL_SPEC.xlsx      ← Excel 비교표 (5시트)
├── exec-plans/
│   ├── ROADMAP.md           ← 다음 릴리즈 계획
│   └── BACKLOG.md           ← 보류된 작업 + 사유
└── references/
    └── README.md            ← 외부 링크 인덱스 (본문은 안 둠)
```

---

## 5. 현재 상태 (26-04-28)

**v0.2 동작 기능** — `docs/product-specs/FEATURES.md` 정본 참고.

- 입력: 작업유형 5종 / 스타일 7종 / 비율 5종+직접입력 / 참고이미지 업로드 /
  참고이미지 역할 5종 / 금지요소 6종 / 한글 textarea.
- 출력: 한글 요약 / GPT Image용 / Nano Banana용 / Midjourney용 / 수정 요청용
  (영문). 실시간 미리보기 (`useMemo`). 결과 박스 복사. 전체 결과 .txt 저장.
- 인프라: GitHub 자동 동기화 → Vercel 자동 배포 (60-90초). DevSync 등록.

---

## 6. 다음 작업 — v0.3 (확정)

26-04-28 세션에서 모델별 공식 가이드 조사 완료. 빌더에 모델 11종 분기 추가가
다음 v0.3 작업이다.

**작업 상태 (26-04-28 완료)**

`docs/model-specs/README.md` §3-4 정본 + 다음 항목까지 v0.3 코드 반영 완료:

1. ✅ `lib/promptBuilder.ts`에 `ModelKey` 타입 + 11개 분기 함수 추가.
2. ✅ `app/page.tsx`에 모델 그룹별 버전 드롭다운 4개 추가
   (GPT Image / Nano Banana / Midjourney / Niji).
3. ✅ 결과 카드 4개 (그룹별) 유지 + Niji 카드 신규 추가. 한글 요약과
   수정 요청 카드는 그대로.
4. ✅ **영어 textarea 신규 추가** — 사용자가 ChatGPT 등으로 한글을 영어
   번역해 직접 붙여넣는 방식. 자동 번역 API는 비용/정책 사유로 미사용.
5. ⏳ `FEATURES.md`에 모델 11종 행 + 영어 입력 행 추가 (미적용 — 다음 갱신).
6. ⏳ DevSync `CHANGELOG.md`에 1~3줄 기록 (미적용 — 다음 갱신).

**다음 ROADMAP 후보**: `ROADMAP.md`의 P1(즐겨찾기, 결과 비교 모드) /
P2(다크 모드, 추천 프롬프트 갤러리) 등.

**검증된 모델 (모두 26-04-28 시점 정식 또는 Alpha)**

- OpenAI: **`gpt-image-2` (최신 권장)** / `gpt-image-1.5` / `gpt-image-1` /
  `gpt-image-1-mini` — 26-04-21 cookbook 가이드 기준 4종 모두 정식.
- Google: `gemini-2.5-flash-image` (Nano Banana) /
  `gemini-3.1-flash-image-preview` (Nano Banana 2) /
  `gemini-3-pro-image-preview` (Nano Banana Pro)
- Midjourney: V7 / V8 Alpha (26-03-17) / V8.1 Alpha (26-04-14)
- Niji: 6 / 7 (26-01-09)

> ✅ 26-04-28 정정: `gpt-image-2`는 cookbook 프롬프팅 가이드에 명시된
> 공식 모델임. 이전 "공식 명칭에 없음" 표기 철회.

---

## 7. 컨벤션 / 정책 요약

- **한글 처리** (26-04-28 재개정): **자동 번역 없음**. 사용자가 한글
  textarea(메모용)에 적은 뒤, ChatGPT 등 외부 도구로 본인이 영어로
  번역해 영어 textarea에 직접 붙여넣음. 근거 →
  `docs/design-docs/PROMPT_STRATEGY.md` §2 (재개정판).
- **모델별 차등**: GPT Image / Nano Banana는 영어 본문 + 원문 한글 병기,
  MJ / Niji는 영어만. 빌더 분기에서 처리.
- **외부 API**: **모두 미사용** (1차 정책 복귀). 번역 API(OpenAI 등),
  이미지 생성 API 모두 호출 안 함. 근거 → `docs/exec-plans/BACKLOG.md`.
- **버전 관리**: 큰 변경은 DevSync `CHANGELOG.md`에 1~3줄 기록.
- **문서 갱신 규칙**: 작업 완료 시 `FEATURES.md` 상태 갱신 + `ROADMAP.md`
  항목 제거 + (필요 시) `BACKLOG.md`로 이동.
- **날짜 표기**: YY-MM-DD 형식 (사용자 글로벌 규칙).
- **파일 삭제**: 사용자 확인 후 진행 (사용자 글로벌 규칙).

---

## 8. 알려진 이슈 / 주의

- 현재 빌더는 모든 결과를 항상 5개 카드로 동시 출력 — v0.3에서 모델 그룹별
  드롭다운으로 단순화 예정.
- Midjourney V7부터 `--cref` → `--oref`(Omni Reference) 대체. 현재 빌더는
  여전히 `--cref`를 자리표시로 출력 → v0.3에서 수정 필요.
- Google 공식 가이드는 부정문 대신 긍정문 권장 (`"empty street"` not
  `"no cars"`). 현재 Nano Banana 빌더의 Remove 블록은 약한 신호일 수 있어
  v0.3에서 단락형 폴백 옵션 검토.

---

## 9. 빠른 명령

```bash
# 로컬 실행
npm run dev

# 빌드 검증
npm run build

# Vercel 자동 배포: main 브랜치 push 시 60-90초 후 라이브 반영
```
