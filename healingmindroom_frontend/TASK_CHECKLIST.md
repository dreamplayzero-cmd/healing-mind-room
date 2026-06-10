# Task Checklist - Healing Mind Room Frontend MVP

## 🟩 Phase 1: 기획 및 아키텍처 설계
- [x] 9인 전문가 시뮬레이션 및 계획안 승인 받기
- [x] 필수 설계 문서 5종 구축 (`docs/PRD.md`, `docs/ARCHITECTURE.md`, `docs/DATA_MODEL.md`, `docs/UI_UX_FLOW.md`, `docs/SECURITY_NOTES.md`)
- [x] 프로젝트 관리 파일 구축 (`README.md`, `UPDATE_LOG.md`, `TASK_CHECKLIST.md`, `CHECKPOINT.md`, `AUDIT.log`, `progress.txt`)
- [x] 실행 설계서 구축 (`docs/execute-plans/active/MVP_PHASE_1.md`)

## 🟨 Phase 2: 개발 보일러플레이트 및 환경 구축
- [x] Vite React/TS 기반 소스 디렉터리 구성 (`src/components/`, `src/utils/`, `src/styles/` 등)
- [x] `.gitignore` 및 `.env.local` 세팅 완료
- [x] 글로벌 CSS 테마 변수 구성 (`styles/theme.css`)
- [x] 전역 힐링 컨텍스트 스토어 구성 (`context/FlowContext.tsx`)

## 🟦 Phase 3: UI 마크업 및 스타일링 (Vanilla CSS)
- [x] 공통 힐링 테마 레이아웃 (`Layout`) 마크업
- [x] Step 1: 연령대 카드 선택 칩 & 고민 입력 텍스트 아레아 UI
- [x] Step 2: 자가진단 3대 위젯 (피로도 슬라이더, 수면/긴장 카드형 버튼) UI
- [x] Step 3: 뇌파 분석 게이지 차트 & 치유농장 2~3개 카드 리스트 UI
- [x] Step 4: 농장 카드 클릭 시 오버레이되는 Flow AI 공간 원화 뷰어 모달

## 🟪 Phase 4: 비즈니스 로직 및 외부 API 연동
- [x] 피로도/수면/긴장도 가중치를 합산해 알파파/세타파를 뽑아내는 `waveEstimator.ts` 로직 구현
- [x] 120개 치유농장 정적 DB `farms.json` 생성 및 점수 매칭 `matcher.ts` 로직 구현
- [x] API 환경변수값에 따라 Mock 데이터 및 실제 NLP 결과를 스위칭하는 `emotionAnalyzer.ts` 구현

## 🟥 Phase 5: 검증 및 배포 준비
- [x] 뇌파 추정기 계산 공식 단위 테스트 작성
- [x] 슬라이더 입력값에 따른 분기 매칭 통합 시나리오 테스트
- [x] Vercel 빌드 및 배포 테스트 (동작 검토)

## 🟫 Phase 6: 소셜 로그인 연동
- [x] 카카오/구글 로그인 카드 UI 컴포넌트 (`Step0Login.tsx`) 구축
- [x] 전역 인증 세션 관리 및 라우팅 가드 구축 (`FlowContext.tsx` & `App.tsx`)
- [x] 로컬스토리지 `healing_session` 세션 영속화 연동 완료

## ⬛ Phase 7: 대화형 챗봇 인터페이스 전면 전환
- [x] 기존 카드 전환 레이아웃을 1:1 모바일 메신저 프레임으로 대개편
- [x] 소셜 로그인, 연령대 선택, 진단 위젯, 농장 매칭 결과를 대화 말풍선 카드로 연동 완료
- [x] 대화 메시지 누적 시 최신 대화로 부드럽게 스크롤해 주는 자동 스크롤 메커니즘 탑재 완료
- [x] 봇의 타이핑 애니메이션(...) 적용을 통한 사람다운 대화 힐링 UX 구현 완료
- [x] 고민 입력창 단계적 제어 및 구형 컴포넌트 청소 완료
