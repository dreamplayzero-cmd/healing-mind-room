# Security & Environment Variable Guidelines - Healing Mind Room MVP

## 1. 외부 API 키 관리 (NLP API)
사용자의 고민 분석을 위해 연동하는 외부 NLP API(예: OpenAI GPT, Cohere, 또는 국내 NLP 서비스)의 인증 키는 브라우저 클라이언트 코드에 직접 하드코딩되어서는 절대 안 됩니다.

### 1.1 환경 변수 격리
- Vite 빌드 도구를 사용하므로, 환경변수는 `VITE_` 접두사를 붙여 격리합니다.
- 예: `VITE_NLP_API_KEY`, `VITE_NLP_API_URL`
- 이 값들은 프로젝트 루트의 `.env` 또는 `.env.local` 파일에 저장되며, 브라우저가 실행될 때 `import.meta.env.VITE_NLP_API_KEY`를 통해 접근됩니다.

### 1.2 클라이언트 노출 방지 대책
> [!WARNING]
> Vite 환경변수 중 `VITE_` 접두사가 붙은 값은 클라이언트 사이드 번들에 포함되어 브라우저 개발자 도구(Network, Console 등)를 통해 최종 사용자에게 유출될 수 있습니다.

- **MVP 보안 조치 (1단계)**: 개발 과정에서는 `.env.local`을 로컬에서만 사용하고 `.gitignore`에 등록하여 GitHub에 업로드되지 않도록 방지합니다.
- **프로덕션 보안 조치 (2단계)**: 실제 배포 시에는 프론트엔드 코드에서 직접 API 키를 들고 직접 호출하지 않고, **Vercel Serverless Function** 또는 **Netlify Functions**와 같은 초경량 백엔드 프록시 API를 거쳐 키를 숨기고 외부 API를 호출하도록 우회 아키텍처를 설계합니다.

## 2. 소셜 로그인 OAuth 클라이언트 ID 관리
카카오 및 구글 소셜 로그인 기능 연동에 필요한 OAuth 클라이언트 ID(`VITE_KAKAO_CLIENT_ID`, `VITE_GOOGLE_CLIENT_ID`) 역시 클라이언트 코드에 하드코딩하지 않으며 `.env.local` 에만 정의하여 관리합니다.

- **안전한 폴백 처리**: 클라이언트 ID 환경변수가 누락되었거나 로컬 환경인 경우, 실제 API 리다이렉션을 타지 않고 안전하게 브라우저 가상 팝업(Mock 소셜 로그인 모달)으로 폴백 처리되어 개발 및 검증 편의성을 보장합니다.

## 3. `.env.example` 구성
실제 비밀 키가 빠진 환경변수 명세 파일을 공유하여 다른 개발자나 시스템이 정상적으로 환경을 구축할 수 있게 돕습니다.

`d:\Intel_AI\healingmindroom\frontend\.env.example` 파일은 다음과 같이 작성됩니다.
```env
# NLP API 연동 여부 (true인 경우 실제 API 호출, false인 경우 로컬 Mock 데이터 분석 실행)
VITE_ENABLE_REAL_NLP=false

# NLP API 인증키 및 엔드포인트
VITE_NLP_API_URL=https://api.example.com/v1/nlp
VITE_NLP_API_KEY=your_nlp_api_key_here
```

## 3. Git 커밋 유출 방지 조치
- `.env`, `.env.local`, `*.key` 파일은 `.gitignore`에 즉시 추가하여 추적을 철저히 차단합니다.
- 보안 스캔 명령을 주기적으로 작동시켜 코드베이스 내에 API 키 형태나 비밀번호 형태의 문자열이 남아있는지 상시 모니터링합니다.
  - 검색 도구 활용: `rg -n "api[_-]?key|secret|password|token" .`
