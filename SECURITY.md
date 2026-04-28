# SECURITY — 절대 어기지 말 것

## 1. 비밀 정보 처리

- **API 키·토큰을 코드나 커밋에 절대 포함하지 않는다.**
  1차 버전은 외부 API 미사용이지만 추후 도입 시 `.env.local` 사용.
- `.env*.local` 은 `.gitignore`에 이미 등재되어 있다. 새 환경변수 추가 시 검증.
- 클라이언트(브라우저)에 노출되어야 하는 값은 `NEXT_PUBLIC_` 접두사 — 단, **공개 가능한 값에만** 사용.

## 2. 사용자 데이터 처리

- **참고 이미지 업로드는 브라우저 메모리(state)에만 보관한다.**
  - 현재 구현: `FileReader.readAsDataURL` → React state. 외부 전송 없음.
  - 변경 시 네트워크 탭으로 외부 요청 발생 여부 재확인.
- 사용자가 입력한 한글 요청도 외부로 전송하지 않는다. 프론트엔드 상태에서만 처리.
- 결과 다운로드는 클라이언트 `Blob` + `URL.createObjectURL`. 서버 경유 없음.

## 3. 의존성 관리

- 새 npm 패키지 추가 시 `npm audit` 결과 확인.
  - **critical 취약점 발견 시 추가 보류** + `BACKLOG.md`에 기록.
- 기본 의존성(lucide-react / next / react / react-dom) 외 추가는 신중히.
- `package.json` 갱신 시 `package-lock.json`도 같이 커밋해 재현성 확보.

## 4. 외부 입력 / 통신

- 1차 버전은 외부 API 호출 없음 → XSS·CSRF·SSRF 위험 거의 없음.
- 향후 이미지 생성 API 연동 시 다음을 만족해야 함:
  - API 키는 **서버 환경변수** (Vercel Environment Variables)에 보관
  - 호출은 Next.js Route Handler (`app/api/*/route.ts`) 경유. 클라이언트 직접 호출 금지.
  - 에러 메시지에 키·내부 경로 노출 안 됨
  - 사용자 업로드 이미지를 외부 API에 보낼 경우 **사전 사용자 동의** UX 추가

## 5. 배포

- `main` 브랜치에 push되면 Vercel이 즉시 프로덕션 반영.
  - **민감 변경(인증·결제·외부 API)은 별도 브랜치에서 검증 후 머지.**
- `.vercel/` 디렉토리는 `.gitignore`에 이미 등재.

## 6. DevSync 연동

- `.devsync/` 폴더는 PC별 로컬 데이터 (포트, 캐시 등). **Git 추적 금지** (`.gitignore` 등재 완료).
- DevSync의 `pc_specific: true` 정책 일관성 유지.
- 프로젝트 단독 변경이 DevSync 본체에 영향을 주지 않도록 주의.

## 7. 의심스러우면 멈춘다

- 인증·권한·결제·외부 호출과 관련된 변경은 **단독 진행 금지**. 사용자 확인 먼저.
- 익명 크리덴셜·"임시 키"·하드코딩된 토큰이 보이면 즉시 작업 중단 + 사용자에게 보고.
- 출처 불명의 `npx`·`curl|bash` 명령 실행 금지.
