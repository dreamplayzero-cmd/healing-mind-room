import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAppStore from '../store/useAppStore';
import { validateAndExecuteBrainwave, getWaveTypeForFarmMatch } from '../utils/brainwaveValidator';

const getLabel = (type, score) => {
  if (!score) return '';
  if (type === 'fatigue') {
    if (score <= 2) return '😊 좋음';
    if (score === 3) return '😕 보통';
    return '😫 나쁨';
  }
  if (type === 'sleep') {
    if (score <= 2) return '☀️ 좋음';
    if (score === 3) return '☁️ 보통';
    return '🌧️ 나쁨';
  }
  if (type === 'tension') {
    if (score <= 2) return '🍃 좋음';
    if (score === 3) return '🌿 보통';
    return '🔥 높음';
  }
  return '';
};

export default function EmotionWidget() {
  const navigate = useNavigate();
  const { setEmotionState, ageGroup } = useAppStore((state) => ({
    setEmotionState: state.setEmotionState,
    ageGroup: state.ageGroup,
  }));

  const [fatigue, setFatigue] = useState(null);
  const [sleep, setSleep] = useState(null);
  const [tension, setTension] = useState(null);

  const handleNext = () => {
    if (!fatigue || !sleep || !tension) return;

    // ── 알파파/세타파 통합 검증 파이프라인 실행 ──
    const validationResult = validateAndExecuteBrainwave(
      fatigue,
      sleep,
      tension,
      ageGroup || '30대'
    );

    // 개발 환경에서 검증 로그 출력
    if (import.meta.env.DEV) {
      console.log('=== 뇌파 검증 파이프라인 로그 ===');
      console.log(validationResult.validationLog);
      console.log(`Validation_Success: ${validationResult.validationSuccess}`);
      console.log(`알파파: ${validationResult.alphaPercent}% / 세타파: ${validationResult.thetaPercent}%`);
      console.log(`matchScore: ${validationResult.matchScore}`);
    }

    // 치유농장 매칭 타입 결정
    const waveType = getWaveTypeForFarmMatch(validationResult);

    // store에 검증된 뇌파 결과 저장
    setEmotionState({
      fatigue: validationResult.sanitizedInputs.fatigueScore,
      sleep: validationResult.sanitizedInputs.sleepStatus,
      tension: validationResult.sanitizedInputs.tensionLevel,
      // 검증된 뇌파 결과
      alphaPercent: validationResult.alphaPercent,
      thetaPercent: validationResult.thetaPercent,
      dominant: validationResult.dominant,
      matchScore: validationResult.matchScore,
      statusMessage: validationResult.statusMessage,
      waveType,
      validationSuccess: validationResult.validationSuccess,
      disclaimer: validationResult.disclaimer,
    });

    navigate('/farm');
  };

  const renderRow = (title, type, value, setValue, leftEmoji, rightEmoji) => (
    <div style={{ marginBottom: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
        <strong style={{ fontSize: '16px', color: 'var(--color-text-main)' }}>{title}</strong>
        {value && (
          <span style={{ fontSize: '14px', color: 'var(--color-primary)', fontWeight: 'bold' }}>
            {getLabel(type, value)} ({value}점)
          </span>
        )}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
        <span style={{ fontSize: '24px' }}>{leftEmoji}</span>
        {[1, 2, 3, 4, 5].map(num => (
          <button
            key={num}
            onClick={() => setValue(num)}
            style={{
              width: '40px',
              height: '40px',
              padding: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '50%',
              backgroundColor: value === num ? 'var(--color-primary)' : 'var(--color-background)',
              color: value === num ? 'white' : 'var(--color-text-main)',
              border: value === num ? 'none' : '1px solid var(--color-border)',
              fontSize: '16px',
              fontWeight: 'bold',
              transition: 'all 0.2s',
            }}
          >
            {num}
          </button>
        ))}
        <span style={{ fontSize: '24px' }}>{rightEmoji}</span>
      </div>
    </div>
  );

  return (
    <div className="page-container fade-in">
      <div style={{
        backgroundColor: 'white',
        padding: '24px 20px',
        borderRadius: '16px',
        border: '1px solid var(--color-border)',
      }}>
        <h2 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '24px', color: '#1a3a2a' }}>
          🧠 스트레스 & 신체 자가진단 (1-5점)
        </h2>

        {renderRow('현재 피로도', 'fatigue', fatigue, setFatigue, '😊', '😫')}
        {renderRow('수면 컨디션', 'sleep', sleep, setSleep, '🌧️', '☀️')}
        {renderRow('심리 긴장도', 'tension', tension, setTension, '🌱', '🔥')}

        {/* 학술 출처 안내 */}
        <div style={{
          marginTop: '16px',
          padding: '10px 14px',
          backgroundColor: '#f0faf4',
          borderRadius: '8px',
          fontSize: '11px',
          color: '#666',
          lineHeight: '1.5',
        }}>
          🔬 농촌진흥청 국책연구 기반 뇌파 안정도 추정 위젯
        </div>

        <div style={{ marginTop: '16px' }}>
          <button
            onClick={handleNext}
            disabled={!fatigue || !sleep || !tension}
            style={{
              width: '100%',
              padding: '16px',
              borderRadius: '12px',
              border: '2px solid #1a3a2a',
              backgroundColor: '#f5f5f5',
              color: '#1a3a2a',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: (!fatigue || !sleep || !tension) ? 'not-allowed' : 'pointer',
              opacity: (!fatigue || !sleep || !tension) ? 0.5 : 1,
            }}
          >
            진단 결과 전송하기 🌿
          </button>
        </div>
      </div>
    </div>
  );
}
