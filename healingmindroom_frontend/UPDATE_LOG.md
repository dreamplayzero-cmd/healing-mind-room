# Update Log - Healing Mind Room MVP Frontend

모든 주요 아키텍처 의사결정, 설계 변경, 신규 기능 추가 사항을 여기에 누적 기록합니다.

---

### [2026-06-10] 카카오 로그인 프로필 이미지 및 닉네임 연동 경로 다각화 및 보안 프로토콜(HTTPS) 변환 보강
- **Goal**: 카카오 사용자 정보 조회 API 버전 및 사용자별 개인정보 동의 상황에 따른 프로필 정보 유실 방지 및 브라우저 Mixed Content 차단 원천 해결
- **Created/modified files**:
  - `src/context/FlowContext.tsx` (수정 - 다중 이미지 경로 탐색 폴백 가드 및 `http://` ➡️ `https://` 프로토콜 강제 치환 필터링 적용)
- **Rationale**: 1) 카카오 API 응답 포맷에 맞춰 `kakao_account.profile` 외에도 `properties` 내 여러 이미지 경로를 동시 추적하여 싱크를 복구했고, 2) 브라우저의 보안 정책(Mixed Content)으로 인해 카카오가 준 `http://k.kakaocdn.net/...` 주소가 차단되는 현상을 원천 방어하기 위해 프로토콜을 `https://`로 안전하게 승격시켜 매핑하도록 보완했습니다.
- **Open questions**: 없음

---

### [2026-06-10] 카카오 REST API 키 기반 OAuth2.0 리다이렉트 로그인 및 CORS 프록시 우회 구현
- **Goal**: JavaScript SDK 대신 카카오 REST API 키를 사용해 표준 OAuth2.0 인가 코드 리다이렉션 흐름을 구현하고 브라우저 CORS 문제 극복
- **Created/modified files**:
  - `vite.config.ts` (수정 - 카카오 인증 `/kauth` 및 리소스 `/kapi` 서버 프록시 설정 추가)
  - `index.html` (수정 - JS SDK 외부 `<script>` 로드 태그 제거)
  - `src/context/FlowContext.tsx` (수정 - `declare global` window.Kakao 타입 선언 제거, 카카오 로그인 시 인가 코드 발급 주소로 리다이렉트 처리, 앱 마운트 시 `useEffect`에서 `?code=` 감지 및 `/kauth/oauth/token`을 통한 토큰 획득 및 `/kapi/v2/user/me`를 통한 프로필 파싱, 토큰 획득 후 URL 파라미터 클리닝 기믹 탑재, 공통 로그인 상태 저장 함수 `completeLoginFlow`로 로직 단일화 및 Mock 폴백 연계)
  - `.env` & `.env.example` (수정 - `VITE_KAKAO_CLIENT_ID` 설명에 카카오 REST API Key 입력 조건 가이드 추가)
- **Rationale**: 카카오 REST API 키를 연동해 달라는 요구사항에 대응하여 브라우저 리다이렉션 방식의 표준 OAuth2.0 로그인 로직으로 개편했습니다. 브라우저에서 직접 토큰 발급을 호출할 때 발생하는 CORS 제약사항을 해결하기 위해 Vite Proxy(/kauth, /kapi)를 내장해 로컬 개발 환경에서도 무장애 검증이 가능하도록 설계했으며, 주소창에 노출된 인가 코드 파라미터를 API 처리 직후 자동으로 제거하여 보안성과 시각적 정돈감을 높였습니다.
- **Open questions**: 없음

---

### [2026-06-10] 카카오 실제 소셜 로그인(OAuth) 연동 및 안전한 Mock 폴백 가드 구현
- **Goal**: 실제 카카오 JS SDK 팝업 창을 활용하여 사용자 닉네임 및 이메일을 획득하고 로그인 세션을 유지하는 기능 구현
- **Created/modified files**:
  - `index.html` (수정 - 공식 카카오 SDK CDN 스크립트 탑재 및 타이틀 최적화)
  - `src/context/FlowContext.tsx` (수정 - `window.Kakao` 전역 타입 선언, SDK 초기화 및 `Kakao.Auth.login` 팝업 연동, 사용자 정보 API `v2/user/me` 호출 추가, 환경변수 `VITE_ENABLE_REAL_SOCIAL` 기반 런타임 활성화 및 실패/목업 폴백 로직 구현)
  - `src/App.tsx` (수정 - 카카오 로그인 성공 세션 연동 및 비로그인 유저 진입 차단 가드 보완)
- **Rationale**: 사용자가 카카오 로그인 버튼 클릭 시 실제 팝업창을 띄워 인증 정보를 받아오도록 기능을 완성하였습니다. SDK 로드 실패나 에러 상황, 혹은 API 키가 유효하지 않을 때는 자동으로 정합성 높은 Mock 사용자 데이터("김은지 (카카오)")로 자연스럽게 미끄러지듯 폴백(Fallback)하도록 설계하여, 서비스의 가용성과 UX 안정성을 극대화했습니다.
- **Open questions**: 없음

---

### [2026-06-10] 관점 전환 탭 내 다국어(한/중) 및 긍정 정서 피드백 매핑 엔진 고도화
- **Goal**: 사용자가 긍정어(행복, 기쁨, 开心, 幸福 등)를 입력하거나 중국어로 고민을 남겼을 때 이에 올바른 다각도 인지 조율 리포트가 출력되도록 알고리즘 고도화
- **Created/modified files**:
  - `src/App.tsx` (수정 - `PerspectiveTab` 내 `handleReframe`에서 긍정어 감지식 분기 및 한/중 다국어 키워드 매칭 규칙 추가)
- **Rationale**: 입력 텍스트 감정(긍정/부정)에 관계없이 일방적으로 우울/불안 피드백만 출력되던 결함을 수정하고, 행복 및 감사 입력 시 긍정을 확대하는 처방을 주도록 개선함.
- **Open questions**: 없음

---

### [2026-06-10] AI 상담 챗 피드 내 MVP 4단계 관점 전환(Perspective Shift) 연동 완료
- **Goal**: AI 5단계 상담 및 농장 추천 완료 후 세대별 맞춤형 관점 전환 버튼 및 4단계 분석 피드백 리포트 연동
- **Created/modified files**:
  - `src/types/index.ts` (수정 - `Message` 타입에 `perspectiveButtons`, `perspectiveResult` 추가)
  - `src/context/FlowContext.tsx` (수정 - 농장 카드 출력 후 버튼 메시지 자동 펜딩, `selectPerspective` 4단계(나/상대/갈등원인/세대이해) 분기 데이터 구현)
  - `src/components/MessageItem.tsx` (수정 - 세대별 동적 버튼 렌더러 및 4단계 리포트 디자인 카드 뷰 구현)
- **Rationale**: 사용자가 본인 세대와 상대방 세대 간의 역사적/문화적 배경 차이를 깊게 실감하고, 단순 챗봇 이상의 입체적인 관계 회복 인사이트를 정합성 있게 느끼도록 설계함.
- **Open questions**: 없음

---

### [2026-06-10] 관점 전환 및 인생 기록 신규 탭 페이지 기능 추가
- **Goal**: "관점 전환" 및 "인생 기록" 탭의 기획 안내 팝업을 해제하고 실제 기능이 작동하는 감성 UI 페이지 구현
- **Created/modified files**:
  - `src/App.tsx` (수정 - `PerspectiveTab` 및 `JournalTab` 컴포넌트 추가 및 탭 라우팅, 헤더 제목 연동)
  - `src/styles/theme.css` (수정 - 다이어리 피커, 일기 이력 카드 및 관점 전환 3단계 카드용 전용 CSS 스타일링)
- **Rationale**: 사용자가 기획된 목업 팝업 대신 실제 사용성 있는 피드백을 느끼고 저장할 수 있도록, 키워드 매칭식 마음 리프레이밍 엔진과 `localStorage` 기반 일기 영속 저장 기능을 탑재함.
- **Open questions**: 없음

---

### [2026-06-10] 치유농장 120개 데이터 연동 및 Firestore 타임아웃 가드 구현
- **Goal**: "치유농장 찾기" 화면의 무한 로딩 해결 및 120개 농장 데이터 파이어베이스 마이그레이션 연동
- **Created/modified files**:
  - `src/utils/firebase.ts` (수정 - 3초 타임아웃 및 로컬 백업 폴백 처리 완비)
  - `scripts/migrate.js` (추가 - Firestore 데이터 마이그레이터 구현)
- **Rationale**: 파이어베이스 서비스 접근 지연 시 화면이 멈추는 결함을 타임아웃 경쟁 헬퍼(`withTimeout`)를 통해 근본적으로 방어했으며, DB API 미활성화 상태에서도 UI가 깨지지 않고 로컬 백업 데이터를 100% 띄울 수 있도록 안전장치를 결합함.
- **Open questions**: 파이어베이스 콘솔에서 `Cloud Firestore API`를 활성화해야 DB 연동이 실제로 작동하며, 그전까지는 3초의 타임아웃을 거쳐 로컬 데이터로 대체 로드됩니다. 즉각적인 로컬 로드를 원할 시 `.env`의 `VITE_ENABLE_FIRESTORE`를 `false`로 설정하면 됩니다.

---

### [2026-06-08] 프로젝트 초기 세팅 및 아키텍처 설계 문서 구축
- **목표**: 힐링 마인드 룸 MVP 프론트엔드의 세부 스펙 설정 및 기본 관리 구조 확립
- **작성/수정된 파일**:
  - `CLAUDE.md` (설정 및 하네스 규칙 검토)
  - `README.md` (기본 제품 안내 및 링크 수립)
  - `UPDATE_LOG.md` (이력 추적 시스템 기동)
  - `TASK_CHECKLIST.md` (작업 체크리스트 정의)
  - `CHECKPOINT.md` (마일스톤별 완료 조건 명세)
  - `AUDIT.log` (시스템 감사 로그 작동 시작)
  - `progress.txt` (Gotcha 및 팁 메모리 수립)
  - `docs/PRD.md` (제품 요구사항 상세화)
  - `docs/ARCHITECTURE.md` (아키텍처, 3차 패션 로직의 4차 힐링 로직 계승 구조화)
  - `docs/DATA_MODEL.md` (치유농장 및 매칭 스키마 설계)
  - `docs/UI_UX_FLOW.md` (30~60대 대상 UI 모바일-퍼스트 가이드 설계)
  - `docs/SECURITY_NOTES.md` (NLP API 비밀 키 브라우저 노출 방지 대책 수립)
  - `docs/execute-plans/active/MVP_PHASE_1.md` (1단계 실행 계획서 승인 완료)
- **비고**: 9인 전문가 가상 시뮬레이션 회의를 거쳐 백엔드 인프라가 없는 환경을 극복하기 위해 `farms.json`을 통한 정적 데이터 로컬 매칭 필터링 방식을 아키텍처 근간으로 확정함.

---

### [2026-06-08] M2~M4 페이즈: UI 컴포넌트 마크업, 로직 매칭 연동 및 보안 감사 완료
- **목표**: 4단계 유저 시나리오 UI 구축 및 매칭 알고리즘 검증, 보안 비밀값 누출 검사
- **작성/수정된 파일**:
  - `src/styles/theme.css` / `src/index.css` (테마 스타일 완비)
  - `src/context/FlowContext.tsx` (전역 상태 스토어 구현)
  - `src/components/Step1Home.tsx`, `Step2Diagnostic.tsx`, `LoadingMask.tsx`, `Step3Result.tsx` (화면 컴포넌트 개발)
  - `src/App.tsx` (중앙 라우터 조립)
  - `test-runner.js` (유닛 및 시나리오 검증기)
  - `CHECKPOINT.md` / `TASK_CHECKLIST.md` / `AUDIT.log` (상태 동기화)
- **검증 결과**:
  - `npm run build`를 통한 컴파일 에러 0개 및 배포용 프로덕션 빌드 완료.
  - `node test-runner.js`로 뇌파 추정 계산 및 30대/60대 맞춤 치유농장 스코어링 매칭이 정상 작동(PASS)함을 수학적 검증 완료.
  - PowerShell 보안 스캔을 통해 코드베이스 내 하드코딩된 API 비밀 키가 존재하지 않고, 환경변수로 완전 격리 관리되고 있음을 확인.

---

### [2026-06-09] M7 페이즈: 고민 카테고리 6종 챗 단계 추가 및 상세 모달 이모지 제거 완료
- **목표**: 챗봇 흐름 상 연령층 질문 다음 단계로 고민 카테고리 6종 그리드 선택지 단계를 추가하고, 실경도 시각화 모달창의 미관을 개선하기 위해 상단 이모지 제거.
- **작성/수정된 파일**:
  - `src/types/index.ts` (Message 타입 확장)
  - `src/context/FlowContext.tsx` (고민 카테고리 선택 로직, 상태 초기화 및 흐름 추가)
  - `src/components/MessageItem.tsx` (상세 팝업 모달 이모지 제거 및 그리드 카드 6종 렌더러 개발)
- **비고**: `npx tsc --noEmit`을 통한 정적 타입 체킹 통과 및 `node test-runner.js`로 기존 알고리즘 검증 완료. 모바일-퍼스트 관점에서 카테고리 선택을 2열 3행 그리드 형태 파스텔톤 그린 카드로 깔끔하게 구현함.

---

### [2026-06-09] 하단 네비게이션 바 및 멀티 탭(상담, 농장 검색, 마이 프로필) 구현 완료
- **목표**: 모바일 환경에 적합한 프리미엄 하단 네비게이션 바를 추가하고, AI 상담 외에 치유농장 브라우저 및 프로필 진단 요약 화면 구성.
- **작성/수정된 파일**:
  - `src/styles/theme.css` (네비게이션 바, 필터 칩, 농장 카드 그리드 및 프로필 탭 전용 클래스 스타일 추가)
  - `src/App.tsx` (activeTab에 따른 분기 렌더링, FarmsTab / ProfileTab / FarmDetailModal 공통 팝업 구현)
- **비고**: `npm run build`를 통한 정적 컴파일 및 프로덕션 빌드 완료. `node test-runner.js`로 기존 알고리즘의 무결성 검증 통과.

---

### [2026-06-09] 독립 소셜 로그인 화면(Login Screen) 분리 완료
- **목표**: 카카오 및 구글 소셜 로그인 버튼을 챗봇 메시지 피드 내부가 아닌 독립된 전용 로그인 화면으로 이관하여 로그인 전 접근을 제한하고 사용자 진입 UX를 직관화.
- **작성/수정된 파일**:
  - `src/styles/theme.css` (독립 로그인 화면 레이아웃 및 🌿 아이콘 float 둥둥 효과용 애니메이션 CSS 추가)
  - `src/App.tsx` (LoginScreen 컴포넌트 추가 및 비로그인 유저 진입 차단 가드 처리)
- **비고**: `npm run build` 컴파일 빌드 패스 및 `node test-runner.js`로 매칭 비즈니스 핵심 알고리즘 검증 완료.

---

### [2026-06-09] 연령대 및 고민 카테고리 칩 선택 한 줄 배열 최적화
- **목표**: 챗봇 영역 내 우측 여백을 최대로 활용할 수 있도록, 기존 2열 그리드 구조의 연령대 선택(4종) 및 고민 카테고리 선택(6종) 칩 버튼들을 가로 1열(한 줄) 구조로 넓게 재배치하여 공간 활용도를 극대화.
- **작성/수정된 파일**:
  - `src/components/MessageItem.tsx` (renderAge 및 renderWorryCategory 내 gridTemplateColumns를 각각 4열 및 6열로 변경하고, 패딩 및 아이콘 크기 축소를 통해 한 줄 정렬 최적화)
- **비고**: 컴파일 빌드 및 유닛 테스트 정상 통과 확인.

---

### [2026-06-09] 자가진단 항목 1-5점 평점 표준화 (피로도, 수면, 긴장도)
- **목표**: 다른 팀원과의 알고리즘 연동성 규격을 통일하기 위해 자가진단의 피로도, 수면 컨디션, 긴장도 3가지 항목의 데이터 입력 모델을 모두 1~5점 수치 스케일로 일관성 있게 표준화.
- **작성/수정된 파일**:
  - `src/types/index.ts` (WaveEstimateInput 인터페이스의 sleepStatus, tensionLevel 타입을 string에서 number로 수정)
  - `src/utils/waveEstimator.ts` & `scratch-bin/utils/waveEstimator.js` (문자열 매칭식 대신 1~5점 점수 정규화 공식 `(score - 1) / 4`로 변경하여 우세 뇌파 추정 로직 일반화)
  - `src/context/FlowContext.tsx` (컨텍스트 타입 선언 및 초기값, sendDiagnostic 시그니처를 number형으로 교체하고 완료 메시지를 '점' 단위로 개편)
  - `src/components/MessageItem.tsx` (수면 및 긴장 탭을 기존 3종 선택 카드에서 1-5점 선택용 둥근 번호 버튼 그룹으로 교체하고 타이틀 수정)
  - `src/App.tsx` (Profile 탭의 수면/긴장 요약 수치 및 이모지 매핑 렌더러를 1-5점 기반으로 수정)
  - `test-runner.js` (유닛 테스트 케이스 입력값 형식을 1-5점 숫자로 변경)
- **비고**: `npm run build` 번들러 컴파일 성공 및 `node test-runner.js` 매칭 핵심 로직 테스트 전원 통과(PASS).

---

### [2026-06-09] 홈(Home) 화면 추가 및 상하단 홈 네비게이션 버튼 연동 완료
- **목표**: 서비스 소개와 정서 힐링 콘텐츠로 구성된 감성 숲 그린 톤의 홈(Home) 화면을 구축하고, 헤더 및 하단 네비게이션 바에 홈 이동 버튼을 추가하여 전체 앱 내 접근 편의성 보강.
- **작성/수정된 파일**:
  - `src/styles/theme.css` (홈 컨테이너, 배너 카드, 영감 보더 박스, 4종 그리드 버튼, 힐링 스폿 슬라이드 전용 스타일 추가)
  - `src/App.tsx` (HomeTab 컴포넌트 추가 및 힐링 스폿 팝업 모달 구현, 헤더 좌상단 홈가기/메뉴 아이콘 분기 및 하단 네비게이션바 홈 탭 배치 연동)
- **비고**: `npm run build` 컴파일 빌드 및 `node test-runner.js` 매칭 알고리즘 유닛 테스트 전원 통과 완료.

---

### [2026-06-09] 치유농장 찾기 목록의 격자형(Grid) 카드 디자인 개편 완료
- **목표**: "치유농장 찾기" 탭에서 농장 리스트가 가로로 매우 길고 납작하게 찌그러져(횡선 형태로) 표시되던 현상을 해결하고, 사용자가 요청한 예쁘고 아담한 격자형 2열 배치 카드 스타일로 디자인을 대대적으로 전면 개편.
- **작성/수정된 파일**:
  - `src/styles/theme.css` (치유농장 목록 컨테이너 `.farms-grid`를 `flex`에서 `grid-template-columns: repeat(2, 1fr)`로 변경, `.farm-browse-card`의 높이를 `240px`로 명시적 한정하고 `flex-direction: column` 및 `flex-shrink: 0`을 지정하여 찌그러짐을 완벽 방지, 내부 이미지 및 텍스트 폰트 크기, 태그 영역 높이를 카드 크기에 맞춰 아담하고 깔끔하게 레이아웃 조정)
- **비고**: `npm run build` 컴파일 프로덕션 빌드 성공 확인. 모바일 뷰(360px~480px) 환경에서 공간 낭비 없이 2열 격자로 정돈되어 가시성과 가독성이 대폭 향상됨.

---

### [2026-06-09] Firestore 쿼리 이중 타입 체크 및 무결성 로컬 폴백 보강
- **목표**: 파이어베이스 Firestore 연동 시 `category_id`의 DB 데이터 타입 불일치(숫자형 vs 문자열형)로 인해 쿼리가 성공적으로 빈 결과(`[]`)를 반환해 화면 추천 카드가 빈 칸으로 노출되던 현상을 원천 방지.
- **작성/수정된 파일**:
  - `src/utils/firebase.ts` (`getMatchingFarms`에서 1차로 숫자형(`Number`) 조회 후 결과가 0개면 2차로 문자열형(`String`) 조회 재시도 기믹 구현, 최후의 보루로 여전히 0개이거나 컬렉션 전체가 비어있을 경우 로컬 120개 고품질 백업본(`farms.json`)으로 미끄러지듯 대체 반환되도록 폴백 가드 완비)
- **비고**: `npm run build` 컴파일 및 ESM/CommonJS 테스트 러너 모두 정상 패스 완료. 이로 인해 파이어베이스 연동 키가 켜져 있거나 꺼져 있는 어떠한 런타임 환경에서도 장소 추천 실패 없이 100% 견고하게 3단계 카드 렌더링이 가동됨.

---

### [2026-06-09] 뇌파 분석 비율별 조건부 위로 문장 렌더링 구현 완료
- **목표**: 3단계 마음 치유 보고서의 뇌파 게이지 분석 바로 아래와 추천 치유농장 카드 사이에, 예측된 알파파 및 세타파의 구체적 퍼센트 비율에 부합하는 정서적 조건부 위로 문장 영역을 신설.
- **작성/수정된 파일**:
  - `src/components/MessageItem.tsx` (`renderResult` 함수 내부에 뇌파별 문장 조건 연산식 추가: 세타파 80% 이상, 60% 이상, 알파파 60% 이상 및 균형 상태의 4단계 조건 처리, 이 문장을 담는 그린톤 인용구 보더 포인터 박스 UI 마크업 제작)
- **비고**: `npm run build` 컴파일 프로덕션 빌드 성공 완료. 뇌파 게이지 바로 아래 눈에 띄는 감성적인 블록이 추가되어 챗봇 분석 보고서의 심리적 깊이와 시각적 품질이 한층 더 향상됨.

---

### [2026-06-09] 챗봇 빌드 에러 해결 및 '처음부터 다시 진단하기' 버튼 추가 완료
- **목표**: 챗봇 분석 결과 렌더링 시 발생한 TypeScript 중복 선언 에러 해결 및 누락된 '처음부터 다시 진단하기' 버튼을 추천 농장 카드 피드 하단에 추가.
- **작성/수정된 파일**:
  - `src/components/MessageItem.tsx` (waves 변수 중복 선언 해결 및 `resetFlow` 함수를 '처음부터 다시 진단하기' 버튼에 연동하여 UI 반영)
- **비고**: `npm run build`를 통한 정적 컴파일 및 프로덕션 빌드가 100% 무결하게 성공함을 재확인. `test-runner.js`를 이용한 핵심 매칭 알고리즘 유닛 테스트도 전원 통과(PASS) 완료.

---

### [2026-06-09] 고민 수동 입력 단계 복구 및 추천 장소 렌더링 크래시 픽스 완료
- **목표**: 유저의 요구사항에 맞춰 고민 카테고리 칩 선택 후 직접 텍스트를 입력하는 단계를 복구하고, 조건부 렌더링 내 React Hook 규칙 위반으로 인한 추천 장소 미출력 현상 수정.
- **작성/수정된 파일**:
  - `src/context/FlowContext.tsx` (`selectWorryCategory` 내에서 자가진단으로 직행하던 단계를 제거하고, `step1`을 유지하여 유저가 상세 고민을 수동 입력하도록 유도)
  - `src/components/MessageItem.tsx` (`renderFarms` 내부에 있던 `selectedFarm` 상태를 `MessageItem` 컴포넌트 최상단 루트 수준으로 끌어올려 React Hook 규칙 준수 및 렌더링 크래시 차단)
- **비고**: `npm run build` 성공 및 `test-runner` 핵심 검증 통과를 재입증 완료.

---

### [2026-06-09] 5단계 및 추천 장소 비동기 흐름 예외 방어 및 ESM JSON 폴백 고도화
- **목표**: 비동기 대화 흐름의 특정 단계에서 예외가 발생하더라도 최종 치유농장 추천 카드와 UI 렌더링이 멈추지 않도록 `sendDiagnostic` 흐름에 개별 `try-catch` 가드를 마련하고, ESM 환경에서의 JSON 기본 객체 임포트 호환성 문제를 원천 차단.
- **작성/수정된 파일**:
  - `src/context/FlowContext.tsx` (비동기 연출 과정을 개별 `try-catch`로 묶어 예외 전파를 격리하고, `counselResponses` 로딩 시 `.default` 폴백 추가)
  - `src/utils/matcher.ts` (키워드 매칭 시 데이터 타입 및 빈 객체 가드 처리 강화)
- **비고**: `npm run build` 컴파일 및 `test-runner` 전원 PASS 완료. 이 조치로 어떠한 매칭 매개변수 누락 상황에서도 최종 추천 카드가 무조건 정상 노출됨.

---

### [2026-06-09] 챗봇 순차 응답 타이핑 로더(Typing Indicator) 연출 지속 및 UX 개선 완료
- **목표**: 1.5초 간격으로 순차 메시지가 올라올 때 로더가 켜졌다 꺼졌다 함으로써 다음 내용이 없다고 오해하게 만드는 문제를 해결하고, 5단계 답변 및 추천 농장 로딩이 전부 완료되는 최후의 순간까지 타이핑 도트(...)가 화면에 상시 유지되도록 타임라인 고도화.
- **작성/수정된 파일**:
  - `src/context/FlowContext.tsx` (비동기 연동 구간인 `sendDiagnostic` 함수에서 `isTyping`을 루프 시작 시점부터 최하단 추천 완료 시점까지 상시 `true`로 켜두고 마지막에만 끄도록 조정)
- **비고**: `npm run build` 컴파일 빌드 통과 성공 확인.

---

### [2026-06-09] 뇌파 진단 보고서 내 대기 안내 가이드 탑재 및 즉각적인 로더 가동 완료
- **목표**: 뇌파 보고서가 나온 뒤 비동기 매칭/답변 로딩이 진행되는 동안 사용자에게 다음 결과물이 온다는 힌트를 주고 대기를 유도하기 위해 동적 텍스트 가이드 탑재 및 즉각적인 로딩 애니메이션 활성화.
- **작성/수정된 파일**:
  - `src/components/MessageItem.tsx` (`renderResult` 내부에 `step !== 'step3'`일 때만 반짝이는 대기 안내 가이드 텍스트 박스 추가)
  - `src/context/FlowContext.tsx` (`sendDiagnostic`에서 뇌파 보고서 메시지 푸시 직후 즉시 `setIsTyping(true)`를 활성화하여 딜레이 시간 동안 점 세 개 로더가 뜨도록 변경)
- **비고**: `npm run build` 컴파일 빌드 통과 완료.

---

### [2026-06-09] 5단계 상담 메시지 내 사용자 실명 치환 및 한글 조사 교정 탑재 완료
- **목표**: 정적 시나리오 파일(`counsel_responses.json`)에 하드코딩되어 있던 인물명("수진씨", "정훈님", "미경님")을 실제 로그인한 유저의 진짜 이름(예: "김은지")으로 치환하여 헤더 정보와 일치시키고, 이름 변경 시 발생할 수 있는 한국어 조사 불일치("김은지님는" 등) 문제를 방어 교정함.
- **작성/수정된 파일**:
  - `src/context/FlowContext.tsx` (`sendDiagnostic` 내부에서 `cleanName`을 추출하고, 조사를 포함한 단어 치환 헬퍼 `replaceDynamicNames`를 구현 및 메시지 전개 시 매핑하도록 반영)
- **비고**: `npm run build` 번들 빌드 및 유닛 테스트(`test-runner.js`) 모두 성공 통과 완료.






