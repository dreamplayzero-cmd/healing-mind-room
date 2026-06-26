/**
 * AiResponse_with_tts.jsx
 * 기존 AiResponse.jsx에 TTS 자동 음성 출력 추가
 * 기존 코드 최소 변경 원칙 적용
 */

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAppStore from '../store/useAppStore';
import { get_response_by_mode, parseResponseIntoSteps } from '../utils/llmLogic';
import { speakText, stopSpeaking } from '../components/VoiceCounsel';

export default function AiResponse() {
  const navigate = useNavigate();
  const { ageGroup, worryType, userInput, useLlmMode, setAiResponse } = useAppStore();
  const response = useAppStore(state => state.aiResponse);
  const [loading, setLoading] = useState(true);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [ttsEnabled, setTtsEnabled] = useState(true); // TTS 토글

  useEffect(() => {
    let isMounted = true;

    async function fetchResponse() {
      try {
        const rawResponse = await get_response_by_mode(useLlmMode, ageGroup, worryType, userInput);
        if (isMounted) {
          const steps = parseResponseIntoSteps(rawResponse);
          setAiResponse(steps);
          setLoading(false);
        }
      } catch (e) {
        console.error('Error fetching AI response:', e);
        if (isMounted) {
          setAiResponse({
            step1: '오류가 발생했습니다.',
            step2: '잠시 후 다시 시도해주세요.',
            step3: '',
            step4: '',
            step5: ''
          });
          setLoading(false);
        }
      }
    }

    fetchResponse();

    return () => {
      isMounted = false;
      stopSpeaking(); // 페이지 이탈 시 TTS 정지
    };
  }, [ageGroup, worryType, userInput, useLlmMode, setAiResponse]);

  // 응답 로드 완료 시 TTS 자동 실행
  useEffect(() => {
    if (!loading && response && ttsEnabled) {
      // 감정공감 + 희망메시지만 읽기 (전체 읽으면 너무 김)
      const textToSpeak = [
        response.step1,  // 감정 공감
        response.step5,  // 희망 메시지
      ].filter(Boolean).join(' ... ');

      if (textToSpeak.trim()) {
        // 0.5초 후 TTS 시작 (화면 렌더링 후)
        const timer = setTimeout(() => {
          setIsSpeaking(true);
          speakText(textToSpeak, {
            rate: ageGroup === '60대' ? 0.76 : 0.82,
            onEnd: () => setIsSpeaking(false),
            onError: () => setIsSpeaking(false),
          });
        }, 500);

        return () => clearTimeout(timer);
      }
    }
  }, [loading, response, ttsEnabled, ageGroup]);

  // 수동 TTS 실행
  const handleSpeak = () => {
    if (!response) return;

    const fullText = [
      response.step1,
      response.step2,
      response.step3,
      response.step4,
      response.step5,
    ].filter(Boolean).join(' ... ');

    setIsSpeaking(true);
    speakText(fullText, {
      rate: ageGroup === '60대' ? 0.76 : 0.82,
      onEnd: () => setIsSpeaking(false),
      onError: () => setIsSpeaking(false),
    });
  };

  const handleStopSpeak = () => {
    stopSpeaking();
    setIsSpeaking(false);
  };

  if (loading) {
    return (
      <div className="page-container fade-in" style={{ justifyContent: 'center', alignItems: 'center' }}>
        <h2 className="title" style={{ textAlign: 'center' }}>AI가 마음을 읽고 있습니다...</h2>
        <p className="subtitle">{useLlmMode ? '(실시간 생성 중... 약 5초 소요)' : '잠시만 기다려주세요.'}</p>
      </div>
    );
  }

  return (
    <div className="page-container fade-in">
      <h1 className="title">당신을 위한 위로</h1>

      {/* 나의 고민 표시 */}
      {userInput && (
        <div style={{
          backgroundColor: 'white',
          padding: '16px',
          borderRadius: '12px',
          border: '1px solid var(--color-border)',
          marginBottom: '16px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
        }}>
          <p style={{ margin: 0, fontSize: '13px', color: 'var(--color-primary)', fontWeight: 'bold', marginBottom: '8px' }}>
            나의 고민
          </p>
          <p style={{ margin: 0, fontSize: '15px', color: 'var(--color-text-main)', lineHeight: '1.5' }}>
            "{userInput}"
          </p>
        </div>
      )}

      {/* TTS 컨트롤 바 */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        marginBottom: '16px',
        padding: '10px 14px',
        backgroundColor: '#f0faf4',
        borderRadius: '10px',
        border: '1px solid #c8e6c9',
      }}>
        <span style={{ fontSize: '13px', color: '#666', flex: 1 }}>
          🔊 음성으로 듣기
        </span>

        {/* TTS 토글 */}
        <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={ttsEnabled}
            onChange={(e) => {
              setTtsEnabled(e.target.checked);
              if (!e.target.checked) handleStopSpeak();
            }}
            style={{ width: '16px', height: '16px', minHeight: 'auto' }}
          />
          <span style={{ fontSize: '12px', color: '#2d6a4f' }}>자동</span>
        </label>

        {/* 수동 재생/정지 버튼 */}
        {isSpeaking ? (
          <button
            onClick={handleStopSpeak}
            style={{
              padding: '6px 12px',
              backgroundColor: '#e53935',
              color: 'white',
              border: 'none',
              borderRadius: '20px',
              fontSize: '12px',
              cursor: 'pointer',
            }}
          >
            ⏹ 정지
          </button>
        ) : (
          <button
            onClick={handleSpeak}
            style={{
              padding: '6px 12px',
              backgroundColor: '#2d6a4f',
              color: 'white',
              border: 'none',
              borderRadius: '20px',
              fontSize: '12px',
              cursor: 'pointer',
            }}
          >
            ▶ 전체 듣기
          </button>
        )}
      </div>

      {/* AI 응답 카드 */}
      <div style={{
        backgroundColor: 'var(--color-background)',
        padding: 'var(--spacing-lg)',
        borderRadius: 'var(--border-radius-md)',
        marginBottom: 'var(--spacing-xl)',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px'
      }}>
        <p className="body-text"><strong>1. 감정 공감</strong><br />{response?.step1}</p>
        <p className="body-text"><strong>2. 상황 분석</strong><br />{response?.step2}</p>
        <p className="body-text"><strong>3. 관점 전환</strong><br />{response?.step3}</p>
        <p className="body-text"><strong>4. 행동 제안</strong><br />{response?.step4}</p>
        <p className="body-text" style={{ fontWeight: '600', color: 'var(--color-primary)' }}>
          <strong>5. 희망 메시지</strong><br />{response?.step5}
        </p>
      </div>

      <div className="spacer" />

      <button className="btn-primary" onClick={() => {
        stopSpeaking(); // 페이지 이동 전 TTS 정지
        navigate('/emotion');
      }}>
        현재 감정 진단해보기
      </button>
    </div>
  );
}
