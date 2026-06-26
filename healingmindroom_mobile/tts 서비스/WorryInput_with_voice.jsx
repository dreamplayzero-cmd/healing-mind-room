/**
 * WorryInput_with_voice.jsx
 * 기존 WorryInput.jsx에 VoiceCounsel 컴포넌트 추가
 * 기존 코드 최소 변경 원칙 적용
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAppStore from '../store/useAppStore';
import VoiceCounsel from '../components/VoiceCounsel';

export default function WorryInput() {
  const navigate = useNavigate();
  const setWorryInput = useAppStore((state) => state.setWorryInput);
  const useLlmMode = useAppStore((state) => state.useLlmMode);
  const setUseLlmMode = useAppStore((state) => state.setUseLlmMode);
  const concerns = useAppStore((state) => state.concerns);
  const ageGroup = useAppStore((state) => state.ageGroup);

  const [selectedType, setSelectedType] = useState('');
  const [text, setText] = useState('');

  const types = concerns && concerns.length > 0
    ? concerns
    : ['인간관계', '건강', '진로/직장', '가족', '기타'];

  const handleSubmit = () => {
    if (!selectedType || !text.trim()) return;
    setWorryInput(selectedType, text);
    navigate('/ai-response');
  };

  // STT 결과를 텍스트창에 자동 입력
  const handleVoiceTranscript = (voiceText) => {
    setText((prev) => {
      // 기존 텍스트가 있으면 이어붙이기, 없으면 새로 시작
      if (prev.trim()) return prev + ' ' + voiceText;
      return voiceText;
    });
  };

  return (
    <div className="page-container fade-in">
      <h1 className="title">어떤 고민이 있으신가요?</h1>
      <p className="subtitle">분야를 선택하고 편하게 적어주세요.</p>

      {/* LLM Mode Toggle */}
      <div style={{
        marginBottom: '24px',
        padding: '16px',
        backgroundColor: 'var(--color-background)',
        borderRadius: 'var(--border-radius-sm)',
        display: 'flex',
        alignItems: 'center',
        gap: '12px'
      }}>
        <input
          type="checkbox"
          id="llm-toggle"
          checked={useLlmMode}
          onChange={(e) => setUseLlmMode(e.target.checked)}
          style={{ width: '20px', height: '20px', minHeight: 'auto' }}
        />
        <label htmlFor="llm-toggle" style={{ cursor: 'pointer', fontWeight: '500' }}>
          🤖 AI 실시간 응답 모드 (체크 시 5초 소요)
        </label>
      </div>

      {/* 고민 유형 선택 */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '24px' }}>
        {types.map((t) => (
          <button
            key={t}
            onClick={() => setSelectedType(t)}
            style={{
              flex: '1 1 calc(50% - 8px)',
              backgroundColor: selectedType === t ? 'var(--color-primary)' : 'var(--color-background)',
              color: selectedType === t ? 'white' : 'var(--color-text-main)',
              border: selectedType === t ? 'none' : '1px solid var(--color-border)',
            }}
          >
            {t}
          </button>
        ))}
      </div>

      {/* ── 음성 상담 컴포넌트 (신규 추가) ── */}
      <VoiceCounsel
        onTranscript={handleVoiceTranscript}
        ageGroup={ageGroup}
      />

      {/* 텍스트 입력창 */}
      <textarea
        placeholder="요즘 마음을 무겁게 하는 생각들을 자유롭게 적어보세요... (음성 입력 후 자동으로 채워져요)"
        value={text}
        onChange={(e) => setText(e.target.value)}
        style={{ flexGrow: 1, marginBottom: '24px', resize: 'none' }}
      />

      {/* 전송 버튼 */}
      <button
        className="btn-primary"
        onClick={handleSubmit}
        disabled={!selectedType || !text.trim()}
        style={{ opacity: (!selectedType || !text.trim()) ? 0.5 : 1 }}
      >
        마음 전송하기
      </button>
    </div>
  );
}
