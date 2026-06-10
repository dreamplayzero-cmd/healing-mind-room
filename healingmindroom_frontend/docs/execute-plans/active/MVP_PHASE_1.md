# Execute Plan: MVP Phase 1 - Frontend Framework & Core Screens

본 문서는 Healing Mind Room MVP 1단계 개발에 관한 실행 계획 및 검증 단계를 기술합니다.

## 1. 개요 & 마일스톤 목표
- **목표**: Vite + React + TS 기반의 프로젝트 보일러플레이트를 완성하고, MVP 4단계 흐름을 담은 싱글 페이지 애플리케이션(SPA)의 기본 UI 프레임을 Vanilla CSS로 구현합니다.
- **기간**: 2026.06.08 ~ 2026.06.12

## 2. 세부 개발 태스크

### 2.1 프로젝트 기초 구성 및 환경설정
- [ ] Vite React/TypeScript 프로젝트 뼈대 생성 및 구조화.
- [ ] `.env` 및 `.gitignore` 설정.
- [ ] 글로벌 CSS 테마 변수(`theme.css`) 구성 (내추럴 그린 & 내추럴 샌드 계열).

### 2.2 공통 컴포넌트 개발
- [ ] `Layout`: 힐링 무드의 글래스모피즘 카드를 중앙에 배치하는 프레임.
- [ ] `Header` / `Footer`: 로고 및 심플한 네비게이션.

### 2.3 4단계 화면 마크업 및 스타일링
- [ ] **Step 1 (Home)**: 연령대 카드 버튼 리스트 및 고민 작성 TextArea 마크업.
- [ ] **Step 2 (Diagnostic)**: 수치 조절 피로도 슬라이더 위젯, 수면 및 긴장도 선택 카드 리스트.
- [ ] **Step 3 (Result)**: 뇌파 분석 게이지 UI, 120개 농장 중 매칭된 2~3개 농장 상세 카드 Carousel UI.
- [ ] **Step 4 (Visualization)**: 각 추천 농장 배경으로 어우러지는 Flow AI 공간 원화 전체화면 시각화 팝업/모달.

## 3. 검증 계획 (Verification)
- **로컬 서버 빌드 및 구동**: `npm run dev` 시 에러 없이 로컬 호스트 진입 확인.
- **반응형 테스트**: Chrome DevTools를 이용해 360px 모바일 화면부터 1200px 데스크톱 화면까지 글래스모피즘 카드 레이아웃이 유연하게 축소/확장되는지 확인.
- **Flow 전환 검사**: 각 단계별 필수 값이 채워졌을 때 "다음 단계" 버튼이 상태값에 의존해 정상 전환(State-driven rendering)되는지 검증.
