/**
 * VoiceCounsel.jsx
 * Healing Mind Room Mobile — 음성 상담 컴포넌트
 *
 * Web Speech API 기반 STT + TTS 구현
 * - STT: SpeechRecognition API (브라우저 내장, API 키 불필요)
 * - TTS: SpeechSynthesis API (브라우저 내장, API 키 불필요)
 *
 * 기존 WorryInput.jsx에 독립 컴포넌트로 추가
 * 오류 시 기존 텍스트 입력 방식으로 자동 폴백
 */

import { useState, useRef, useEffect } from 'react';
import { TextToSpeech } from '@capacitor-community/text-to-speech';

// ─────────────────────────────────────────────
// STT 지원 여부 확인
// ─────────────────────────────────────────────
const isSpeechRecognitionSupported = () => {
  return !!(
    typeof window !== 'undefined' &&
    (window.SpeechRecognition || window.webkitSpeechRecognition)
  );
};

// ─────────────────────────────────────────────
// TTS 함수 — 텍스트를 음성으로 출력 (Capacitor Native TTS)
// ─────────────────────────────────────────────
export async function speakText(text, options = {}) {
  try {
    await stopSpeaking();
    if (!text || text.trim().length === 0) return;

    // 음성 전처리: 노이즈 제거 + 발음 교정 (디스클레이머 본문은 읽음)
    let speechText = text
      .replace(/---/g, ' ')          // 구분선 제거 (대시 발음 방지)
      .replace(/※/g, ' ')           // ※ 기호만 제거 (뒤 문장은 읽음)
      .replace(/30대/g, '삼십 대')
      .replace(/40대/g, '사십 대')
      .replace(/50대/g, '오십 대')
      .replace(/60대/g, '육십 대')
      .replace(/\s+/g, ' ')          // 중복 공백 정리
      .trim();

    if (options.onStart) options.onStart();
    await TextToSpeech.speak({
      text: speechText,
      rate: options.rate ?? 0.82,
      pitch: 0.88,
      volume: 1.0,
      category: 'playback',
    });
    if (options.onEnd) options.onEnd();
  } catch (e) {
    console.error('[VoiceCounsel] TTS 오류:', e);
    if (options.onError) options.onError(e);
  }
}

// ─────────────────────────────────────────────
// TTS 정지 함수
// ─────────────────────────────────────────────
export async function stopSpeaking() {
  try { await TextToSpeech.stop(); } catch (e) {}
}

export function warmUpTTS() { /* 네이티브 TTS는 워밍업 불필요 */ }

// ─────────────────────────────────────────────
// 메인 컴포넌트 — VoiceCounsel
// ─────────────────────────────────────────────

/**
 * VoiceCounsel 컴포넌트
 *
 * WorryInput.jsx에 추가해서 사용:
 * <VoiceCounsel onTranscript={(text) => setText(text)} />
 *
 * @param {Function} onTranscript - STT 결과 텍스트를 부모로 전달하는 콜백
 * @param {string} ageGroup - 연령대 (TTS 음성 조절용)
 */
export default function VoiceCounsel({ onTranscript, ageGroup = '30대' }) {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState('');
  const [isSupported, setIsSupported] = useState(false);

  const recognitionRef = useRef(null);

  // 지원 여부 확인
  useEffect(() => {
    setIsSupported(isSpeechRecognitionSupported());



    return () => {
      stopSpeaking();
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch (e) {}
      }
    };
  }, []);

  // ── STT 시작 ────────────────────────────────
  const startListening = () => {
    setError('');

    if (!isSpeechRecognitionSupported()) {
      setError('이 브라우저는 음성 인식을 지원하지 않아요. 텍스트로 입력해주세요.');
      return;
    }

    try {
      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;

      const recognition = new SpeechRecognition();
      recognitionRef.current = recognition;

      // 한국어 설정
      recognition.lang = 'ko-KR';
      recognition.continuous = false;       // 단일 발화
      recognition.interimResults = true;    // 중간 결과 표시
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setIsListening(true);
        setTranscript('');
      };

      recognition.onresult = (event) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          if (result.isFinal) {
            finalTranscript += result[0].transcript;
          } else {
            interimTranscript += result[0].transcript;
          }
        }

        const currentText = finalTranscript || interimTranscript;
        setTranscript(currentText);
        
        // 최종 결과를 ref에 저장 (onend에서 부모로 전달)
        recognitionRef.transcriptBuffer = currentText;
      };

      recognition.onerror = (event) => {
        setIsListening(false);
        switch (event.error) {
          case 'not-allowed':
            setError('마이크 권한이 필요해요. 브라우저 설정에서 마이크를 허용해주세요.');
            break;
          case 'no-speech':
            setError('음성이 감지되지 않았어요. 다시 시도해주세요.');
            break;
          case 'network':
            setError('네트워크 오류가 발생했어요. 텍스트로 입력해주세요.');
            break;
          default:
            setError('음성 인식 오류가 발생했어요. 텍스트로 입력해주세요.');
        }
      };

      recognition.onend = () => {
        setIsListening(false);
        // 음성 인식이 완전히 끝났을 때 부모(텍스트창)로 전달
        if (recognitionRef.transcriptBuffer && onTranscript) {
          onTranscript(recognitionRef.transcriptBuffer.trim());
        }
        recognitionRef.transcriptBuffer = ''; // 버퍼 초기화
      };

      recognition.start();

    } catch (e) {
      console.error('[VoiceCounsel] STT 시작 오류:', e);
      setIsListening(false);
      setError('음성 인식을 시작할 수 없어요. 텍스트로 입력해주세요.');
    }
  };

  // ── STT 중지 ────────────────────────────────
  const stopListening = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        console.warn('[VoiceCounsel] STT 중지 오류:', e);
      }
    }
    setIsListening(false);
  };

  // ── TTS — 안내 문구 읽기 ─────────────────────
  const speakGuide = () => {
    const guideText = ageGroup === '60대'
      ? '마이크 버튼을 누르신 후 고민을 말씀해 주세요. 듣고 있겠습니다.'
      : '마이크 버튼을 누르고 고민을 말해보세요.';

    setIsSpeaking(true);
    speakText(guideText, {
      rate: ageGroup === '60대' ? 0.76 : 0.82,
      onEnd: () => setIsSpeaking(false),
      onError: () => setIsSpeaking(false),
    });
  };

  // 미지원 브라우저 폴백
  if (!isSupported) {
    return null; // 지원 안 되면 컴포넌트 숨김 (텍스트 입력만 표시)
  }

  return (
    <div style={{
      marginBottom: '20px',
      padding: '16px',
      backgroundColor: '#f0faf4',
      borderRadius: '12px',
      border: '1px solid #c8e6c9',
    }}>
      {/* 제목 */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '12px',
      }}>
        <span style={{ fontSize: '15px', fontWeight: '600', color: '#1a3a2a' }}>
          🎙️ 말로 상담하기
        </span>
        {/* TTS 안내 버튼 */}
        <button
          onClick={speakGuide}
          disabled={isSpeaking}
          style={{
            fontSize: '12px',
            padding: '4px 10px',
            backgroundColor: isSpeaking ? '#ccc' : 'white',
            border: '1px solid #c8e6c9',
            borderRadius: '20px',
            color: '#2d6a4f',
            cursor: isSpeaking ? 'not-allowed' : 'pointer',
          }}
        >
          {isSpeaking ? '🔊 읽는 중...' : '🔈 안내 듣기'}
        </button>
      </div>

      {/* 마이크 버튼 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <button
          onClick={isListening ? stopListening : startListening}
          style={{
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            border: 'none',
            backgroundColor: isListening ? '#e53935' : '#2d6a4f',
            color: 'white',
            fontSize: '24px',
            cursor: 'pointer',
            flexShrink: 0,
            transition: 'all 0.2s',
            boxShadow: isListening
              ? '0 0 0 4px rgba(229,57,53,0.3)'
              : '0 2px 8px rgba(0,0,0,0.2)',
            animation: isListening ? 'pulse 1.5s infinite' : 'none',
          }}
        >
          {isListening ? '⏹' : '🎤'}
        </button>

        <div style={{ flex: 1 }}>
          {isListening ? (
            <p style={{ fontSize: '14px', color: '#e53935', fontWeight: '500', margin: 0 }}>
              🔴 듣고 있어요... 말씀해 주세요
            </p>
          ) : transcript ? (
            <p style={{ fontSize: '14px', color: '#1a3a2a', margin: 0 }}>
              ✅ 인식 완료: <strong>{transcript}</strong>
            </p>
          ) : (
            <p style={{ fontSize: '14px', color: '#666', margin: 0 }}>
              버튼을 눌러 고민을 말해보세요
            </p>
          )}
        </div>
      </div>

      {/* 오류 메시지 */}
      {error && (
        <div style={{
          marginTop: '10px',
          padding: '8px 12px',
          backgroundColor: '#fff3e0',
          borderRadius: '8px',
          fontSize: '13px',
          color: '#e65100',
        }}>
          ⚠️ {error}
        </div>
      )}

      {/* 펄스 애니메이션 스타일 */}
      <style>{`
        @keyframes pulse {
          0% { box-shadow: 0 0 0 0 rgba(229,57,53,0.4); }
          70% { box-shadow: 0 0 0 12px rgba(229,57,53,0); }
          100% { box-shadow: 0 0 0 0 rgba(229,57,53,0); }
        }
      `}</style>
    </div>
  );
}
