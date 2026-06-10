# Healing Mind Room (치유농장 매칭 플랫폼) - Frontend MVP

> **30~60대 현대인을 위한 감성 자가진단 및 맞춤형 치유농장 추천 서비스**

Healing Mind Room은 일상생활 속 스트레스와 지친 감정 상태에 직면한 중장년층(30s-60s)에게 NLP 감정 상담 및 프론트엔드 자가진단 위젯을 기반으로 전국 120개 치유농장 중 최적의 힐링 공간을 추천하고, AI 원화를 통한 심리적 안정을 도모하는 플랫폼입니다.

---

## 🗺️ 서비스 핵심 4단계 흐름

1. **Step 1: 세대별 AI 상담**
   - 연령대(30대~60대)를 선택하고 마음속 고민을 텍스트로 자유롭게 작성합니다. NLP 감정 진단과 세대별 맞춤 위로를 전달받습니다.
2. **Step 2: 감정 자가진단 위젯**
   - 3차 패션 프로젝트의 지표 수집 구조를 발전시켜, 피로도 슬라이더 및 수면/긴장 상태 체크 위젯을 통해 알파파/세타파 상태를 추정합니다.
3. **Step 3: 치유농장 매칭**
   - 계산된 뇌파 추정치와 고민 키워드, 연령대 정보를 기반으로 120여 개의 치유농장 중 개인 맞춤 농장을 실시간으로 필터링하여 매칭합니다.
4. **Step 4: 공간 원화 시각화**
   - 매칭된 농장의 성격에 맞추어 Flow AI로 특수 제작된 몽환적이고 평화로운 힐링 공간 원화를 화면 가득 시각화하여 따뜻한 시각적 치유를 선사합니다.

---

## 🛠️ 기술 스택 (Technology Stack)

- **Core**: React 18, TypeScript, Vite
- **Styling**: Vanilla CSS (CSS Variables 및 Glassmorphism 테마 적용)
- **State Management**: React Context API & Hooks (경량 상태 모델)
- **Validation**: Jest / React Testing Library (핵심 알고리즘 검증)
- **Deployment**: Vercel / Netlify (Serverless 프록시 API를 활용한 보안 설계)

---

## 📁 주요 문서 링크

- [PRD.md](file:///d:/Intel_AI/healingmindroom/frontend/docs/PRD.md): 상세 제품 기획 및 기능 정의 명세
- [ARCHITECTURE.md](file:///d:/Intel_AI/healingmindroom/frontend/docs/ARCHITECTURE.md): 시스템 설계, 폴더 구조, 위젯 로직 계승 구조 명세
- [DATA_MODEL.md](file:///d:/Intel_AI/healingmindroom/frontend/docs/DATA_MODEL.md): 치유농장 데이터 스키마 및 AI 상담 데이터 스키마 상세 정의
- [UI_UX_FLOW.md](file:///d:/Intel_AI/healingmindroom/frontend/docs/UI_UX_FLOW.md): 테마 컬러, 반응형 레이아웃, 화면 간 인터랙션 설계
- [SECURITY_NOTES.md](file:///d:/Intel_AI/healingmindroom/frontend/docs/SECURITY_NOTES.md): 환경 변수(.env) 및 API 키 유출 방지 전략
- [MVP_PHASE_1.md](file:///d:/Intel_AI/healingmindroom/frontend/docs/execute-plans/active/MVP_PHASE_1.md): 1단계 구현 및 실행 설계서

---

## 🚀 시작하기

### 1) 환경 변수 설정
`.env.example` 파일을 복사하여 `.env` 파일을 생성하고 설정을 입력합니다.
```bash
cp .env.example .env
```

### 2) 의존성 패키지 설치
```bash
npm install
```

### 3) 로컬 개발 서버 기동
```bash
npm run dev
```
