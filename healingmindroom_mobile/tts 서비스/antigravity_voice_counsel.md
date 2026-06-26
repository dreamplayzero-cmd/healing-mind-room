# Antigravity 프롬프트 — 모바일 STT+TTS 음성 상담 기능 추가

아래 프롬프트를 Antigravity 대화창에 붙여넣기 하세요.
첨부 파일 3개를 함께 드래그앤드롭 해주세요.

---

## 📎 첨부 파일 3개

1. VoiceCounsel.jsx
2. WorryInput_with_voice.jsx
3. AiResponse_with_tts.jsx

---

## 📋 붙여넣기용 프롬프트

```
아래 작업을 순서대로 진행해줘.
첨부한 파일 3개를 활용해서 모바일앱에
STT(음성 입력) + TTS(음성 출력) 기능을 추가해줘.

---

## 작업 1. src/components/ 폴더 생성 및 VoiceCounsel.jsx 추가

healingmindroom_mobile/src/components/ 폴더를 새로 만들고
첨부한 VoiceCounsel.jsx 파일을 그 안에 넣어줘.

경로: healingmindroom_mobile/src/components/VoiceCounsel.jsx

---

## 작업 2. WorryInput.jsx 교체

healingmindroom_mobile/src/pages/WorryInput.jsx 파일을
첨부한 WorryInput_with_voice.jsx 내용으로 교체해줘.

변경 핵심:
- VoiceCounsel 컴포넌트 import 추가
- 고민 유형 버튼과 텍스트 입력창 사이에 VoiceCounsel 컴포넌트 추가
- 음성 인식 결과가 텍스트창에 자동 입력되는 handleVoiceTranscript 함수 추가

---

## 작업 3. AiResponse.jsx 교체

healingmindroom_mobile/src/pages/AiResponse.jsx 파일을
첨부한 AiResponse_with_tts.jsx 내용으로 교체해줘.

변경 핵심:
- speakText, stopSpeaking 함수 import 추가
- AI 응답 로드 완료 시 감정공감 + 희망메시지 자동 음성 출력
- 수동 전체 듣기 / 정지 버튼 추가
- TTS 자동 토글 (ON/OFF) 추가
- 페이지 이동 시 TTS 자동 정지

---

## 작업 4. 빌드 및 테스트

npm run build 실행 후 아래 사항 확인해줘:
- 빌드 에러 없음 확인
- import 경로 정확한지 확인
  (../components/VoiceCounsel 경로)

---

## 완료 후 체크리스트

- [ ] src/components/VoiceCounsel.jsx 파일 존재 확인
- [ ] WorryInput.jsx에 VoiceCounsel import 확인
- [ ] AiResponse.jsx에 speakText import 확인
- [ ] npm run build 에러 없음 확인
- [ ] 마이크 버튼 UI 표시 확인
- [ ] TTS 컨트롤 바 UI 표시 확인
```

---

## 💡 테스트 방법

### STT 테스트
1. npm run dev 실행
2. 고민 입력 페이지에서 🎤 버튼 클릭
3. 브라우저 마이크 권한 허용
4. 고민 말하기
5. 텍스트창에 자동 입력 확인

### TTS 테스트
1. 고민 입력 후 전송
2. AI 응답 페이지 로드
3. 0.5초 후 자동으로 감정공감 + 희망메시지 음성 출력 확인
4. "전체 듣기" 버튼으로 수동 실행 확인
5. "정지" 버튼으로 중지 확인

---

## ⚠️ 오류 대응

### 마이크 권한 거부 시
```
"마이크 권한이 필요해요" 메시지 자동 표시
→ 텍스트 입력창으로 폴백
→ 앱 크래시 없음
```

### STT 미지원 브라우저 시
```
VoiceCounsel 컴포넌트 자동 숨김
→ 기존 텍스트 입력 방식만 표시
→ 앱 크래시 없음
```

### TTS 오류 시
```
콘솔 경고만 출력
→ UI에 영향 없음
→ 앱 크래시 없음
```

---

## 📱 Android Capacitor 배포

빌드 성공 확인 후:
```
npx cap sync
npx cap open android
→ Android Studio에서 Run
```

---

## 🎯 발표 시연 시나리오

```
"이번에는 말로 상담해보겠습니다."
→ 🎤 버튼 클릭
→ "요즘 직장생활이 너무 힘들어요" 말하기
→ 텍스트창 자동 입력 확인
→ 마음 전송하기 클릭
→ AI 응답 페이지 로드
→ 자동으로 위로 메시지 음성 출력
→ "말로 하는 AI 힐링 상담이 완성됐습니다!"
```

---

*작성일: 2026년 6월*
*적용 대상: healingmindroom_mobile*
*기능: STT(음성입력) + TTS(음성출력) 음성 상담*
*API 키 불필요: Web Speech API 브라우저 내장 활용*
