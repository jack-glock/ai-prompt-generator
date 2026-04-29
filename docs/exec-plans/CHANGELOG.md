# CHANGELOG

> 26-04-29 기준. 메이저 변경만 기록. 세부 작업은 `BACKLOG.md` / `ROADMAP.md` 참고.

## v0.7 — Gemini API 연동 + UX 정비 (26-04-29)

### Gemini 2.5 Flash 연동
- 서버 라우트 3종 (`/api/ai/translate`, `/api/ai/extract`, `/api/ai/analyze-image`) 신설
- API 키는 서버 환경변수(`GEMINI_API_KEY`)에서만 접근, 클라이언트 번들 미노출
- 클라이언트 helper `lib/aiClient.ts` (`aiTranslateKoreanToEnglish` / `aiExtractOptions` / `aiAnalyzeImage` / `mergeAiHints`)

### AI 기능 3종 (모두 사용자 수동 클릭)
- **AI로 영어 번역하기** — 한글 메모 → 영어 보충 입력에 자연스러운 영어로 채움
- **AI로 옵션 채우기** — 한글/영어 자유입력을 분석해 옵션 슬롯에 분배. 매핑 안 되는 디테일은 `custom` + `*Custom` 영어 표현
- **AI로 참고 이미지 분석하기** — 슬롯별 개별 버튼. 사용자가 선택한 **역할에 해당하는 슬롯만** 채워서 충돌 방지

### 빌더 형식 개편 (Google 권장 반영)
- Nano Banana 빌더를 **자연어 서술 문장형**으로 변경 (이전 구조형 `Goal:/Subject:/Style:` 폐기)
- **스타일을 첫 문장에 단독 배치** — 모델이 가장 강한 신호로 받음
- 모델별 capability 차등 한 문장 (Nano 원본/2/Pro)
- MJ/Niji 출력에서 **모든 dash 파라미터 제거** (`--ar`, `--no`, `--sref/--oref/--cref/--niji`, `--hd`) — 사용자가 Discord/사이트에서 직접 추가
- GPT/Nano 출력에서 "Reference: ..." 라인 제거 — 사용자가 도구에 이미지 직접 첨부

### UX 정비
- 옵션 채우기 두 버튼을 영어 보충 입력 바로 아래로 이동 (메모 → 영어 → 옵션 채우기 흐름)
- 키워드/AI 버튼 색상 통일 (slate / emerald outlined, 같은 크기)
- 참고 이미지 슬롯을 **1행 3개 가로 배치** + 정사각형 클릭/드롭 박스
- AI 분석 완료 시 버튼이 emerald → slate + ✓ 아이콘으로 변경 (입력이 바뀌면 emerald로 복귀)
- 분석 결과 메시지 표시 시간 4초 → 7초

### 정책 정리
- 한국어 빌더에서 **영어 보충 입력 제외** (한글 메모와 중복 방지)
- 한국어 빌더에서 **옵션의 영어 customText 미노출** (한글만 깔끔하게)
- AI 응답의 빈 문자열 옵션 슬롯은 **`mergeAiHints`에서 무시** (옵션 무효화 방지)
- AI extract 시스템 프롬프트에 "NEVER use empty string for slot values" 강제

### 검증
- `tsc --noEmit` 통과
- 스모크 테스트 39+ 통과 (한글 격리, 영어 보충 반영, 작업 유형 분기, 모델별 미누출 등)
- `mergeAiHints` 정밀 검증 25/25 통과 (정상 응답·빈 문자열·null·custom·일부 슬롯·빌더 출력·enabled OFF)
- 라이브 동작 확인 (사용자 콘솔에서 `[AI extract hints]` 정상 응답 확인)

---

## v0.6 — 작업 유형 5종 + 옵션 시스템 + 한글 격리 (26-04-29)

> v0.6은 v0.7과 같은 날 빠르게 발전한 시리즈입니다. 주요 마일스톤:

### v0.6 (스펙 기반 대규모 재구조화)
- 작업 유형 5종(캐릭터/배경/프레임/아이콘/오브젝트), 배너 제거
- 옵션 데이터 분리 (`lib/options.ts`)
- 한글 자유입력은 메모로만, 최종 영어 프롬프트에 절대 미포함
- 영어 보충 입력만 영어 모델 프롬프트에 그대로 반영
- 작업 유형별 옵션 블록 (캐릭터/배경/에셋)
- 더보기 8개 항목 (머리/의상/포즈/보이는 범위/보는 각도/캐릭터 방향/캐릭터 시트/장소)
- 참고 이미지 3장 + 역할별 파라미터
- 키워드 매칭 자동 정리 (`lib/keywordExtract.ts`)
- 17종 스타일 (모바일 게임 제거, 애니/망가 분리, 3D animation 추가)
- 스타일 옵션 한 줄 툴팁 desc

### v0.6.x 누적 개선
- 영어 키워드 단어 경계 매칭 (`female` 안의 `male` 충돌 해결, premium 룰 정리)
- 옵션 그룹 on/off 토글 8개 (iOS 스위치, localStorage `apg.enabled`)
- Section 컴포넌트 collapsible + 헤더 hover 툴팁
- GPT Image / Nano Banana 한·영 토글 (한국어 빌더 추가)
- 사이드바 정렬 (참고이미지를 영어 보충 다음으로) + 첫 화면 안내 박스
- 라벨 명확화 + 카드 hint 단순화

---

## v0.5 — 다크 모드 + Niji 7항목 입력 (26-04-28)

- 라이트/다크 모드 토글
- Niji 전용 7항목 입력 (외형/표정/포즈/의상/배경/화각/매체)
- 모델 12종 분기 (GPT 4 / Nano 3 / MJ 3 / Niji 2)

## 그 이전

- v0.4: 모델 12종 + 16종 스타일 + 드래그앤드롭 + 결과 하이라이트
- v0.1~v0.3: 초기 빌더, 단일 모델, 기본 UI
