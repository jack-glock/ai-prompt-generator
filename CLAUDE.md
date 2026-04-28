# CLAUDE.md — 프로젝트 컨텍스트 (다음 세션용)

> 이 파일은 다음 AI 세션이 프로젝트 상태를 빠르게 파악하기 위한 요약본.
> 본문은 `docs/`에. **이 파일은 인덱스 + 핵심 사실만**.
>
> 마지막 갱신: 26-04-28 (v0.4 라이브 반영)

---

## 1. 프로젝트 한 줄 요약

게임 그래픽 디자이너용 **이미지 프롬프트 자동 생성기** 웹앱.
한글 메모 + 영어 입력 + 작업 유형/스타일/비율/금지 옵션을 받아
GPT Image / Nano Banana / Midjourney / Niji 12종 모델 + 16종 스타일별
영문 프롬프트를 동시 생성.

- **GitHub**: <https://github.com/jack-glock/ai-prompt-generator>
- **Live**: <https://ai-prompt-generator-two-ebon.vercel.app/>
- **DevSync 등록**: v1.4.7부터
- **현재 버전**: **v0.4** (26-04-28 라이브 반영)

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
| `app/page.tsx` | UI 전체 (660줄. 입력 사이드바 7섹션 + 6 결과 카드 + 헤더 액션 + 4 그룹 모델 드롭다운 + 드래그앤드롭) |
| `lib/promptBuilder.ts` | 프롬프트 생성 로직 (540줄. 12종 모델 분기 + 16종 스타일 + 하이라이트 토큰) |
| `CLAUDE.md` (이 파일) | 다음 세션용 컨텍스트 인덱스 |
| `AGENTS.md` | 진입점 안내판 |
| `ARCHITECTURE.md` | 기술 스택 / 폴더 구조 / 데이터 흐름 |
| `QUALITY_SCORE.md` | 품질 루브릭 |
| `SECURITY.md` | 보안 규칙 |

---

## 4. docs 디렉토리 지도

```
docs/
├── design-docs/
│   ├── PROMPT_STRATEGY.md   ← 도구별 형식이 다른 이유(전략) + 한글 처리 정책 (재개정)
│   └── UI_DESIGN.md         ← UI 설계 + v0.4 컴포넌트 구조 + 하이라이트 토큰 시스템
├── product-specs/
│   ├── FEATURES.md          ← 기능 구현 현황 (✅/🟡/⏳/❌) + 12종 모델 매트릭스
│   └── ACCEPTANCE.md        ← 수용 기준
├── model-specs/             ← 모델별 빌더 사양
│   ├── README.md            ← 인덱스 + 매트릭스 + 통합표 + 빌더 매핑
│   ├── GPT_IMAGE.md         ← GPT Image 2 / 1.5 / 1 / 1-mini (4종)
│   ├── NANO_BANANA.md       ← Nano Banana / 2 / Pro
│   ├── MIDJOURNEY.md        ← Midjourney V7 / V8 Alpha / V8.1 Alpha
│   ├── NIJI.md              ← Niji 6 / 7
│   └── MODEL_SPEC.xlsx      ← Excel 비교표 (5시트)
├── exec-plans/
│   ├── ROADMAP.md           ← 다음 릴리즈 계획 (v0.5 후보)
│   └── BACKLOG.md           ← 보류된 작업 + 사유
└── references/
    └── README.md            ← 외부 링크 인덱스 (본문은 안 둠)
```

---

## 5. 현재 상태 (26-04-28, v0.4 라이브)

**v0.4 동작 기능** — `docs/product-specs/FEATURES.md` 정본 참고.

- **입력**: 작업유형 5종 / 스타일 **16종** (디즈니/픽사 등) / 비율 5종+직접입력 / 참고이미지 클릭 또는 **드래그 앤 드롭** / 참고이미지 역할 5종 / 금지요소 6종 / 한글 textarea(메모용) / **영어 textarea(실제 프롬프트용)**.
- **출력**: 한글 요약 / GPT Image / Nano Banana / Midjourney / Niji / 수정 요청 (총 6 카드). 각 모델 그룹 카드에 **버전 드롭다운**. 사용자 입력 자리는 **파란색 하이라이트**. 실시간 미리보기 (`useMemo`). 결과 박스 복사 (토큰 자동 제거). 전체 결과 .txt 저장.
- **모델 12종**: GPT Image 2(기본)/1.5/1/mini · Nano Banana 2(기본)/기본/Pro · MJ V8.1 Alpha(기본)/V8 Alpha/V7 · Niji 7(기본)/6.
- **인프라**: GitHub 자동 동기화 → Vercel 자동 배포 (60-90초). DevSync 등록.

---

## 6. 다음 작업 — v0.5 (후보)

`ROADMAP.md` 정본 참고.

**P1 (다음 릴리즈 포함 후보)**

1. **프롬프트 즐겨찾기** — 입력 조합(한·영 요청 + 옵션 + 모델 선택)을 이름 붙여 저장/불러오기. localStorage.
2. **결과 비교 모드** — 두 모델/버전의 결과를 좌우 분할 비교. 현재는 세로 스택만 가능.

**P2**

3. **Niji 캐릭터 키워드 자동 분리** — 사양(`model-specs/NIJI.md`)이 권장하는 외형/표정/포즈/의상/배경/화각/매체 7항목 별도 입력 또는 자동 재구성. 현재는 사용자 영어 입력에 의존.
4. **다크 모드** — Tailwind `dark:` 적용.

---

## 7. 컨벤션 / 정책 요약

- **한글 처리** (26-04-28 재개정): **자동 번역 없음**. 사용자가 한글 textarea(메모용)에 적은 뒤, ChatGPT 등 외부 도구로 본인이 영어로 번역해 영어 textarea에 직접 붙여넣음. 근거 → `docs/design-docs/PROMPT_STRATEGY.md` §2 (재개정판).
- **모델별 차등**: GPT Image / Nano Banana는 영어 본문 + 원문 한글 병기, MJ / Niji는 영어만. 빌더 분기에서 처리.
- **외부 API**: **모두 미사용** (1차 정책 복귀). 번역 API(OpenAI 등), 이미지 생성 API 모두 호출 안 함. 근거 → `docs/exec-plans/BACKLOG.md`.
- **버전 관리**: 큰 변경은 DevSync `CHANGELOG.md`에 1~3줄 기록.
- **문서 갱신 규칙**: 작업 완료 시 `FEATURES.md` 상태 갱신 + `ROADMAP.md` 항목 제거 + (필요 시) `BACKLOG.md`로 이동.
- **날짜 표기**: YY-MM-DD 형식 (사용자 글로벌 규칙).
- **파일 삭제**: 사용자 확인 후 진행 (사용자 글로벌 규칙).
- **하이라이트 토큰**: `lib/promptBuilder.ts`의 `hi()` 헬퍼로 사용자 옵션 자리만 `[[B]]...[[/B]]`로 감쌈. `app/page.tsx`의 `HighlightedContent`가 파란색 span으로 렌더링. 복사/저장 시 `stripHighlight()`로 토큰 제거.

---

## 8. 알려진 이슈 / 주의

- **Niji 빌더 한계**: `NIJI.md` 사양은 외형/표정/포즈/의상/배경/화각/매체 7항목 분리를 권장하지만, 현재 빌더는 사용자 영어 입력을 통째로 첫 자리에 넣는다. 즉 사용자가 영어 textarea에 7항목 모두 적어 줘야 결과 품질이 좋다. v0.5 P2 후보.
- **OpenAI cookbook 가이드 추적**: 26-04-21 cookbook이 `gpt-image-2`를 새 빌드 권장으로 명시. 향후 모델 추가 시 cookbook 재확인 필요.
- **Midjourney V7부터 `--cref` → `--oref`(Omni Reference) 대체**. Niji 6/7은 여전히 `--cref` 사용 (Omni Reference 미지원).
- **Google 공식 가이드는 부정문 대신 긍정문 권장** (`"empty street"` not `"no cars"`). 현재 Nano Banana 빌더의 Remove 블록은 약한 신호일 수 있어 향후 단락형 폴백 옵션 검토 가능.

---

## 9. 빠른 명령

```bash
# 로컬 실행
npm run dev

# 빌드 검증
npm run build

# 타입체크만 빠르게
npx tsc --noEmit

# Vercel 자동 배포: main 브랜치 push 시 60-90초 후 라이브 반영
git add .
git commit -m "..."
git push origin main
```
