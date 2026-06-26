# Antigravity 프롬프트 — 모바일 알파파/세타파 검증 파이프라인 적용

아래 프롬프트를 Antigravity 대화창에 그대로 붙여넣기 하세요.

---

## 📋 붙여넣기용 프롬프트

```
아래 두 가지 작업을 순서대로 진행해줘.

---

## 작업 1. brainwaveValidator.js 파일 추가

brainwaveValidator.js 파일을 아래 경로에 추가해줘:
healingmindroom_mobile/src/utils/brainwaveValidator.js

이 파일은 알파파/세타파 통합 검증 파이프라인 모듈이야.
3단계 구조로 되어 있어:
- Step 1: 입력값 검증 (null/NaN/음수/범위초과 → 기본값 3 자동 치환)
- Step 2: 연산 안정장치 (에러 시 베이스라인 α:50% θ:50% 폴백)
- Step 3: 아웃풋 바운딩 (0.05~0.95 범위 보정, matchScore 생성)

---

## 작업 2. EmotionWidget.jsx 교체

EmotionWidget_updated.jsx 파일 내용으로
기존 healingmindroom_mobile/src/pages/EmotionWidget.jsx를 교체해줘.

변경된 핵심 내용:
1. brainwaveValidator 모듈 import 추가
2. handleNext() 함수에서 validateAndExecuteBrainwave() 호출
3. store에 저장되는 emotionState에 뇌파 검증 결과 추가:
   - alphaPercent / thetaPercent / dominant
   - matchScore / statusMessage / waveType
   - validationSuccess / disclaimer
4. 농진청 학술 레퍼런스 안내 문구 추가

---

## 완료 후 확인사항

- [ ] src/utils/brainwaveValidator.js 파일 존재 확인
- [ ] EmotionWidget.jsx import 문 확인
      import { validateAndExecuteBrainwave, getWaveTypeForFarmMatch } from '../utils/brainwaveValidator'
- [ ] npm run build 실행 → 에러 없음 확인
- [ ] 개발자 도구 콘솔에서 Validation_Success: True 로그 확인
- [ ] 피로도/수면/긴장도 선택 후 진단 결과 전송 정상 작동 확인
- [ ] FarmRecommendation.jsx에서 emotionState.alphaPercent 값 정상 수신 확인
- [ ] npm run build → npx cap sync → 모바일 배포 완료
```

---

## 📁 파일 적용 위치 요약

| 파일명 | 적용 경로 | 작업 |
|---|---|---|
| `brainwaveValidator.js` | `src/utils/brainwaveValidator.js` | 신규 추가 |
| `EmotionWidget_updated.jsx` | `src/pages/EmotionWidget.jsx` | 기존 파일 교체 |

---

## 💡 useAppStore.js 확인사항

교체 후 FarmRecommendation.jsx에서 아래 값들을 활용 가능해요:

```javascript
const emotionState = useAppStore((state) => state.emotionState);

// 사용 가능한 값들
emotionState.alphaPercent    // 알파파 % (예: 48)
emotionState.thetaPercent    // 세타파 % (예: 52)
emotionState.dominant        // 우세 뇌파 ('alpha' | 'theta')
emotionState.matchScore      // 농장 매칭 점수 (0~100)
emotionState.statusMessage   // 뇌파 상태 메시지
emotionState.waveType        // 농장 필터 타입 ('alpha' | 'theta' | 'balanced')
emotionState.validationSuccess  // 검증 성공 여부
emotionState.disclaimer      // 학술 면책 문구
```

---

## 🔬 학술 레퍼런스 (발표용)

```
농촌진흥청 국책연구
'치유농업 활동의 뇌파 안정도 파라미터 표준 규격'
국제 학술지(NCBI, HEE) 게재 기준
알파파(8~13Hz 안정) / 세타파(4~8Hz 피로) 기반 설계
```

---

*작성일: 2026년 6월*
*적용 대상: healingmindroom_mobile*
*파일: brainwaveValidator.js + EmotionWidget_updated.jsx*
