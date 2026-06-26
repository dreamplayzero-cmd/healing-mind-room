import React, { useState } from 'react';
import type { Message, Farm } from '../types';
import { useFlow } from '../context/FlowContext';

interface MessageItemProps {
  message: Message;
}

export const MessageItem: React.FC<MessageItemProps> = ({ message }) => {
  const {
    login,
    selectAge,
    selectWorryCategory,
    sendDiagnostic,
    resetFlow,
    selectedAge,
    step,
    selectPerspective
  } = useFlow();

  const [selectedFarm, setSelectedFarm] = useState<Farm | null>(null);

  const isBot = message.sender === 'bot';

  // 1. 소셜 로그인 컴포넌트 렌더러
  const renderLogin = () => {
    const [loggingIn, setLoggingIn] = useState<'kakao' | 'google' | null>(null);

    const triggerLogin = async (provider: 'kakao' | 'google') => {
      setLoggingIn(provider);
      await login(provider);
      setLoggingIn(null);
    };

    return (
      <div className="chat-card-panel fade-in">
        <div className="chat-card-title">🔑 소셜 로그인으로 입장하기</div>
        <button
          onClick={() => triggerLogin('kakao')}
          disabled={loggingIn !== null}
          style={{
            width: '100%',
            height: '48px',
            background: '#FEE500',
            color: '#191919',
            border: 'none',
            borderRadius: 'var(--radius-md)',
            fontSize: '14px',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            marginBottom: '10px'
          }}
        >
          {loggingIn === 'kakao' ? '잠시만 기다려주세요... 🌿' : '💬 카카오로 3초 간편 로그인'}
        </button>
        <button
          onClick={() => triggerLogin('google')}
          disabled={loggingIn !== null}
          style={{
            width: '100%',
            height: '48px',
            background: '#FFFFFF',
            color: 'var(--text-main)',
            border: '1.5px solid #e2e8f0',
            borderRadius: 'var(--radius-md)',
            fontSize: '14px',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px'
          }}
        >
          {loggingIn === 'google' ? '잠시만 기다려주세요... 🌿' : '🌐 Google 계정으로 로그인'}
        </button>
      </div>
    );
  };

  // 2. 연령대 선택 렌더러
  const renderAge = () => {
    const ages: ('30s' | '40s' | '50s' | '60s')[] = ['30s', '40s', '50s', '60s'];
    const ageLabels: Record<string, string> = {
      '30s': '30대',
      '40s': '40대',
      '50s': '50대',
      '60s': '60대 이상'
    };

    return (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', marginTop: '8px', width: '100%', maxWidth: '420px' }}>
        {ages.map((age) => (
          <button
            key={age}
            onClick={() => selectAge(age)}
            style={{
              height: '40px',
              border: '1.5px solid var(--green-pale)',
              borderRadius: 'var(--radius-md)',
              background: 'white',
              color: 'var(--green-dark)',
              fontWeight: 700,
              cursor: 'pointer',
              fontSize: '13px',
              boxShadow: '0 2px 6px rgba(45,106,79,0.05)'
            }}
          >
            {ageLabels[age]}
          </button>
        ))}
      </div>
    );
  };

  // 3. 자가진단 위젯 렌더러
  const renderDiagnostic = () => {
    const [fatigue, setFatigue] = useState<number>(3);
    const [sleep, setSleep] = useState<number>(3);
    const [tension, setTension] = useState<number>(3);
    const [sending, setSending] = useState(false);

    const fatigueEmojis = ['😊', '🙂', '😐', '😟', '😩'];
    const sleepEmojis = ['🌧', '⛅', '🌤', '🌤', '☀️']; 
    const tensionEmojis = ['🌱', '🌿', '🍃', '⚡', '🔥']; 

    const fatigueLabels = ['매우 가뿐', '가뿐', '보통', '피곤', '매우 피곤'];
    const sleepLabels = ['매우 불면', '약간 불면', '보통', '좋음', '매우 숙면'];
    const tensionLabels = ['매우 안정', '안정', '보통', '약간 예민', '매우 예민'];

    const handleSend = async () => {
      if (sleep > 0 && tension > 0) {
        setSending(true);
        await sendDiagnostic(fatigue, sleep, tension);
        setSending(false);
      }
    };

    const renderScoreSelector = (
      val: number,
      setVal: (v: number) => void,
      leftIcon: string,
      rightIcon: string
    ) => {
      const scores = [1, 2, 3, 4, 5];
      return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px' }}>
          <span style={{ fontSize: '16px', filter: 'grayscale(0.2)' }}>{leftIcon}</span>
          <div style={{ display: 'flex', gap: '8px', flexGrow: 1, justifyContent: 'space-between' }}>
            {scores.map((num) => (
              <button
                key={num}
                type="button"
                onClick={() => setVal(num)}
                style={{
                  flex: 1,
                  height: '32px',
                  borderRadius: '16px',
                  border: '1.2px solid var(--glass-border)',
                  background: val === num ? 'var(--green-mid)' : 'white',
                  color: val === num ? 'white' : 'var(--text-main)',
                  fontWeight: 700,
                  fontSize: '12px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'var(--transition-smooth)',
                  boxShadow: val === num ? '0 3px 8px rgba(45,106,79,0.2)' : 'none'
                }}
              >
                {num}
              </button>
            ))}
          </div>
          <span style={{ fontSize: '16px', filter: 'grayscale(0.2)' }}>{rightIcon}</span>
        </div>
      );
    };

    return (
      <div className="chat-card-panel fade-in" style={{ width: '100%', maxWidth: '380px' }}>
        <div className="chat-card-title">🧠 스트레스 & 신체 자가진단 (1-5점)</div>

        {/* 피로도 */}
        <div style={{ marginBottom: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: 700, color: 'var(--text-main)' }}>
            <span>현재 피로도</span>
            <span style={{ color: 'var(--green-mid)' }}>{fatigueEmojis[fatigue-1]} {fatigueLabels[fatigue-1]} ({fatigue}점)</span>
          </div>
          {renderScoreSelector(fatigue, setFatigue, '😊', '😩')}
        </div>

        {/* 수면 */}
        <div style={{ marginBottom: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: 700, color: 'var(--text-main)' }}>
            <span>수면 컨디션</span>
            <span style={{ color: 'var(--green-mid)' }}>{sleepEmojis[sleep-1]} {sleepLabels[sleep-1]} ({sleep}점)</span>
          </div>
          {renderScoreSelector(sleep, setSleep, '🌧', '☀️')}
        </div>

        {/* 긴장 */}
        <div style={{ marginBottom: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: 700, color: 'var(--text-main)' }}>
            <span>심리 긴장도</span>
            <span style={{ color: 'var(--green-mid)' }}>{tensionEmojis[tension-1]} {tensionLabels[tension-1]} ({tension}점)</span>
          </div>
          {renderScoreSelector(tension, setTension, '🌱', '🔥')}
        </div>

        <button
          onClick={handleSend}
          disabled={sending}
          className="btn-healing"
          style={{ height: '40px', borderRadius: 'var(--radius-sm)', fontSize: '13px' }}
        >
          {sending ? '자가진단 분석 중...' : '진단 결과 전송하기 🌿'}
        </button>
      </div>
    );
  };

  // 4. 최종 추천 결과 렌더러
  const renderResult = () => {
    const { waves } = message.data || {};

    if (!waves) return null;

    const alphaPct = Math.round(waves.alpha * 100);
    const thetaPct = Math.round(waves.theta * 100);

    return (
      <div className="chat-card-panel fade-in" style={{ width: '100%', maxWidth: '420px', background: '#f8fafc' }}>
        <div className="chat-card-title">📊 마음 치유 보고서 (뇌파 상태)</div>

        <div style={{ marginBottom: '16px', background: 'white', padding: '12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--glass-border)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontWeight: 700, marginBottom: '6px' }}>
            <span style={{ color: 'var(--green-mid)' }}>알파파 (안정) {alphaPct}%</span>
            <span style={{ color: 'var(--purple-soft)' }}>세타파 (피로) {thetaPct}%</span>
          </div>
          <div style={{ height: '14px', width: '100%', background: '#e2e8f0', borderRadius: '7px', overflow: 'hidden', display: 'flex' }}>
            <div style={{ width: `${waves.alpha * 100}%`, background: 'var(--green-mid)', transition: 'width 1s ease' }} />
            <div style={{ width: `${waves.theta * 100}%`, background: 'var(--purple-soft)', transition: 'width 1s ease' }} />
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '8px', lineHeight: '1.4' }}>
            {waves.dominant === 'alpha'
              ? '🌿 당신은 안정이 유도되는 알파파 우세형입니다. 사색과 숲길 멍때리기에 적합합니다.'
              : '🚜 당신은 신체 피로를 씻어줄 세타파 해소형입니다. 흙을 가꾸고 농작물을 수확해 보세요.'}
          </div>
        </div>

        <div style={{ 
          background: '#eafaf1', 
          padding: '14px 16px', 
          borderRadius: 'var(--radius-sm)', 
          borderLeft: '4px solid var(--green-mid)',
          textAlign: 'left',
          boxShadow: '0 2px 8px rgba(45, 106, 79, 0.03)',
          marginBottom: step !== 'step3' ? '12px' : '0'
        }}>
          <div style={{ fontSize: '11px', fontWeight: 800, color: 'var(--green-dark)', marginBottom: '4px' }}>💬 뇌파 자가진단 한마디</div>
          <div style={{ fontSize: '13px', color: 'var(--text-main)', fontWeight: 700, lineHeight: '1.5' }}>
            {message.content}
          </div>
        </div>

        {/* 대기 안내 가이드 추가 (최종 결과 도달 전까지만 노출) */}
        {step !== 'step3' && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 12px',
            background: '#ebf9f1',
            borderRadius: 'var(--radius-sm)',
            fontSize: '11.5px',
            color: 'var(--green-dark)',
            fontWeight: 700,
            border: '1px solid var(--green-pale)',
            boxShadow: '0 2px 6px rgba(45,106,79,0.02)'
          }}>
            <span style={{ fontSize: '14px', animation: 'floatLogo 1.5s infinite', display: 'inline-block' }}>⏳</span>
            <span>AI 마음 처방(5단계)과 맞춤 추천 농장을 불러오고 있습니다...</span>
          </div>
        )}
      </div>
    );
  };

  // 4.5. 추천 치유농장 카드 렌더러
  const renderFarms = () => {
    const { farms } = message.data || {};

    if (!farms) return null;

    return (
      <div className="chat-card-panel fade-in" style={{ width: '100%', maxWidth: '420px', background: '#f8fafc' }}>
        <div style={{ marginBottom: '16px' }}>
          <div style={{ fontSize: '13px', fontWeight: 800, color: 'var(--green-dark)', marginBottom: '8px', textAlign: 'left' }}>
            🏕️ 맞춤 추천 치유농장 (클릭 시 농장 상세 정보 확인)
          </div>
          
          {farms.map((farm: Farm) => {
            // 개별 카드 내에서 상태 관리를 위해 단순화된 스켈레톤 상태 적용을 위해 
            // 별도의 로컬 상태 대신 img의 onLoad 속성을 활용하여 컨테이너 스타일 제어
            return (
              <div
                key={farm.id}
                onClick={() => setSelectedFarm(farm)}
                style={{
                  background: 'white',
                  border: '1.5px solid var(--glass-border)',
                  borderRadius: 'var(--radius-sm)',
                  marginBottom: '16px',
                  cursor: 'pointer',
                  transition: 'var(--transition-smooth)',
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.borderColor = 'var(--green-mid)';
                  e.currentTarget.style.boxShadow = '0 6px 16px rgba(45, 106, 79, 0.08)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.borderColor = 'var(--glass-border)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                {/* 16:9 이미지 영역 */}
                <div style={{ position: 'relative', width: '100%', aspectRatio: '16/9', backgroundColor: '#e2e8f0', overflow: 'hidden' }}>
                  {/* 스켈레톤 애니메이션 CSS가 전역에 없으므로 인라인 애니메이션(펄스 효과) 모방 */}
                  <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%)', backgroundSize: '200% 100%', animation: 'pulse 1.5s infinite' }} />
                  <img 
                    src={farm.imageUrl || '/assets/placeholder-image.png'} 
                    alt={farm.name} 
                    style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0, transition: 'opacity 0.3s' }}
                    onLoad={(e) => { e.currentTarget.style.opacity = '1'; }}
                    onError={(e) => { e.currentTarget.src = '/assets/placeholder-image.png'; e.currentTarget.style.opacity = '1'; }}
                  />
                  <div style={{ position: 'absolute', top: '10px', left: '10px', fontSize: '18px', background: 'rgba(0,0,0,0.4)', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {farm.waveType === 'alpha' ? '🏡' : '🚜'}
                  </div>
                </div>

                <div style={{ padding: '14px', textAlign: 'left' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <span style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text-main)', lineHeight: '1.2' }}>{farm.name}</span>
                    <span style={{ fontSize: '11px', background: 'var(--green-pale)', color: 'var(--green-dark)', padding: '2px 8px', borderRadius: '12px', fontWeight: 700 }}>
                      {farm.area}
                    </span>
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--green-mid)', fontWeight: 600, marginTop: '6px' }}>📍 {farm.location}</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '8px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {farm.description}
                  </div>
                </div>
              </div>
            );
          })}

          <button
            onClick={resetFlow}
            className="btn-healing"
            style={{
              marginTop: '12px',
              height: '40px',
              borderRadius: 'var(--radius-sm)',
              fontSize: '13px',
              background: 'white',
              border: '1.5px solid var(--green-mid)',
              color: 'var(--green-dark)',
              fontWeight: 700,
              cursor: 'pointer',
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px'
            }}
          >
            🔄 처음부터 다시 진단하기
          </button>
        </div>

        {selectedFarm && (
          <div
            onClick={() => setSelectedFarm(null)}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(27, 46, 37, 0.6)',
              backdropFilter: 'blur(8px)',
              zIndex: 999,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '16px',
              animation: 'fadeIn 0.2s ease-out'
            }}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              style={{
                background: 'white',
                borderRadius: 'var(--radius-lg)',
                maxWidth: '440px',
                width: '100%',
                overflow: 'hidden',
                boxShadow: '0 20px 48px rgba(0,0,0,0.15)',
                position: 'relative'
              }}
            >
              <div style={{
                height: '220px',
                width: '100%',
                backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.65) 100%), url('${selectedFarm.imageUrl}')`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '64px',
                boxShadow: 'inset 0 -40px 80px rgba(0,0,0,0.2)'
              }}>
                <button
                  onClick={() => setSelectedFarm(null)}
                  style={{
                    position: 'absolute',
                    top: '12px',
                    right: '12px',
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    background: 'rgba(0,0,0,0.4)',
                    color: 'white',
                    border: 'none',
                    fontSize: '16px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  ×
                </button>

                <div style={{
                  position: 'absolute',
                  bottom: '12px',
                  left: '16px',
                  color: 'white',
                  textShadow: '1px 1px 3px rgba(0,0,0,0.6)',
                  textAlign: 'left'
                }}>
                  <span style={{ fontSize: '10px', background: 'rgba(0,0,0,0.5)', padding: '2px 6px', borderRadius: '8px', fontWeight: 700 }}>
                    AI 맞춤 치유농장 추천
                  </span>
                  <h3 style={{ fontSize: '18px', fontWeight: 900, marginTop: '2px' }}>{selectedFarm.name}</h3>
                </div>
              </div>

              <div style={{ padding: '20px', textAlign: 'left' }}>
                <p style={{ fontSize: '13px', color: 'var(--text-main)', lineHeight: '1.6', marginBottom: '16px' }}>
                  {selectedFarm.description}
                </p>

                <div style={{ marginBottom: '16px' }}>
                  <h5 style={{ fontSize: '12px', fontWeight: 700, color: 'var(--green-dark)', marginBottom: '6px' }}>
                    🎯 주요 치유 프로그램
                  </h5>
                  <ul style={{ listStyleType: 'none', paddingLeft: 0 }}>
                    {selectedFarm.programs.map((prog, idx) => (
                      <li
                        key={idx}
                        style={{
                          fontSize: '12px',
                          color: 'var(--text-muted)',
                          padding: '3px 0',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}
                      >
                        <span style={{ color: 'var(--green-mid)' }}>•</span> {prog}
                      </li>
                    ))}
                  </ul>
                </div>

                <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '12px', fontSize: '11px', color: 'var(--text-muted)' }}>
                  <div style={{ marginBottom: '3px' }}>📍 <b>위치</b>: {selectedFarm.location}</div>
                  <div>📞 <b>전화문의</b>: {selectedFarm.contact}</div>
                </div>

                <div style={{ display: 'flex', gap: '8px', marginTop: '20px' }}>
                  <button
                    className="btn-healing"
                    onClick={() => {
                      setSelectedFarm(null);
                      window.location.hash = 'farms';
                    }}
                    style={{ flex: 1, height: '40px', fontSize: '13px' }}
                  >
                    더 많은 농장 찾아보기
                  </button>
                  <button
                    className="btn-healing"
                    onClick={() => setSelectedFarm(null)}
                    style={{ flex: 1, height: '40px', fontSize: '13px', background: 'white', color: 'var(--green-dark)', border: '1.5px solid var(--green-mid)' }}
                  >
                    닫고 돌아가기
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  // 5. 고민 카테고리 렌더러
  const renderWorryCategory = () => {
    const worryCategoriesByAge: Record<string, { value: string; icon: string }[]> = {
      '30s': [
        { value: '직장스트레스', icon: '💼' },
        { value: '번아웃', icon: '🔋' },
        { value: '육아', icon: '👶' },
        { value: '인간관계', icon: '👥' },
        { value: '미래불안', icon: '🔮' },
        { value: '자기계발', icon: '💡' }
      ],
      '40s': [
        { value: '직장스트레스', icon: '💼' },
        { value: '부모부양', icon: '👴' },
        { value: '번아웃', icon: '🔋' },
        { value: '자녀교육', icon: '📖' },
        { value: '자기계발', icon: '💡' },
        { value: '건강관리', icon: '🏃' }
      ],
      '50s': [
        { value: '은퇴준비', icon: '🚜' },
        { value: '인간관계', icon: '👥' },
        { value: '건강관리', icon: '🏃' },
        { value: '귀농탐색', icon: '🌿' },
        { value: '미래불안', icon: '🔮' }
      ],
      '60s': [
        { value: '은퇴적응', icon: '🏡' },
        { value: '외로움', icon: '🕊️' },
        { value: '건강관리', icon: '🏃' },
        { value: '가족관계', icon: '👨‍👩‍👧‍👦' },
        { value: '삶의의미', icon: '✨' }
      ]
    };

    const categories = worryCategoriesByAge[selectedAge || '30s'] || worryCategoriesByAge['30s'];

    return (
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(74px, 1fr))',
        gap: '8px',
        marginTop: '10px',
        width: '100%',
        maxWidth: '520px',
        animation: 'fadeIn 0.3s ease-out'
      }}>
        {categories.map((cat) => (
          <button
            key={cat.value}
            onClick={() => selectWorryCategory(cat.value)}
            style={{
              background: '#ebf9f1',
              border: 'none',
              borderRadius: '12px',
              padding: '12px 4px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'transform 0.2s ease, box-shadow 0.2s ease',
              boxShadow: '0 2px 8px rgba(45, 106, 79, 0.04)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 6px 16px rgba(45, 106, 79, 0.08)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 2px 8px rgba(45, 106, 79, 0.04)';
            }}
          >
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              background: '#d4f2e1',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '16px',
              marginBottom: '6px'
            }}>
              {cat.icon}
            </div>
            <span style={{
              fontSize: '10px',
              fontWeight: 700,
              color: '#1b3d2f',
              whiteSpace: 'nowrap'
            }}>
              {cat.value}
            </span>
          </button>
        ))}
      </div>
    );
  };


  // 6. 타이핑 로더 렌더러
  const renderTyping = () => {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', textAlign: 'left' }}>
        <div className="typing-dots">
          <span></span>
          <span></span>
          <span></span>
        </div>
        {message.content && (
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontStyle: 'italic', marginTop: '4px' }}>
            {message.content}
          </div>
        )}
      </div>
    );
  };

  // [신규] 관점 전환 대상 선택 버튼 렌더러
  const renderPerspectiveButtons = () => {
    const buttonsMap: Record<string, string[]> = {
      '30s': ['부모님 눈으로 보기', '상사·동료 눈으로 보기'],
      '40s': ['자녀 눈으로 보기', '배우자 눈으로 보기', '부모님 눈으로 보기'],
      '50s': ['자녀 눈으로 보기', '배우자 눈으로 보기', '부모님 눈으로 보기'],
      '60s': ['자녀 눈으로 보기', '배우자 눈으로 보기', '손주 눈으로 보기']
    };

    const targetButtons = buttonsMap[selectedAge || '30s'] || buttonsMap['30s'];

    return (
      <div className="chat-card-panel fade-in" style={{ width: '100%', maxWidth: '380px' }}>
        <div className="chat-card-title">🔄 상대방 눈으로 바라보기 (관점 전환)</div>
        <p style={{ fontSize: '11px', color: 'var(--text-muted)', lineHeight: '1.4', marginBottom: '12px', textAlign: 'left' }}>
          갈등 상대방의 눈으로 내 고민을 재해석하고 세대 간 차이와 맥락을 시뮬레이션해 봅니다.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {targetButtons.map((btnLabel) => (
            <button
              key={btnLabel}
              onClick={() => selectPerspective(btnLabel.replace(' 눈으로 보기', ''))}
              className="btn-healing"
              style={{
                height: '38px',
                fontSize: '12.5px',
                background: 'white',
                border: '1.5px solid var(--green-mid)',
                color: 'var(--green-dark)',
                fontWeight: 700,
                boxShadow: 'none',
                cursor: 'pointer',
                borderRadius: '8px'
              }}
            >
              👁️ {btnLabel}
            </button>
          ))}
        </div>
      </div>
    );
  };

  // [신규] 4단계 관점 전환 분석 결과 렌더러
  const renderPerspectiveResult = () => {
    const { target, myView, partnerView, conflictAnalysis, generationalUnderstanding } = message.data || {};

    if (!target) return null;

    return (
      <div className="chat-card-panel fade-in" style={{ width: '100%', maxWidth: '420px', background: '#f8fafc' }}>
        <div className="chat-card-title">🔄 세대 인지 재조율 리포트 ({target} 시각)</div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '6px' }}>
          <div style={{ background: 'white', padding: '12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--glass-border)', textAlign: 'left' }}>
            <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--green-dark)', display: 'block', marginBottom: '4px' }}>
              1️⃣ 나의 입장 (My Perspective)
            </span>
            <p style={{ fontSize: '12.5px', color: 'var(--text-main)', lineHeight: '1.5', margin: 0 }}>{myView}</p>
          </div>

          <div style={{ background: 'white', padding: '12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--glass-border)', textAlign: 'left' }}>
            <span style={{ fontSize: '11px', fontWeight: 800, color: '#00b4d8', display: 'block', marginBottom: '4px' }}>
              2️⃣ 상대방 ({target})의 입장
            </span>
            <p style={{ fontSize: '12.5px', color: 'var(--text-main)', lineHeight: '1.5', margin: 0 }}>{partnerView}</p>
          </div>

          <div style={{ background: 'white', padding: '12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--glass-border)', textAlign: 'left' }}>
            <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--accent-color)', display: 'block', marginBottom: '4px' }}>
              3️⃣ 감정 및 갈등 원인 분석
            </span>
            <p style={{ fontSize: '12.5px', color: 'var(--text-main)', lineHeight: '1.5', margin: 0 }}>{conflictAnalysis}</p>
          </div>

          <div style={{ background: 'white', padding: '12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--glass-border)', textAlign: 'left' }}>
            <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--purple-soft)', display: 'block', marginBottom: '4px' }}>
              4️⃣ 세대적 맥락과 문화적 이해
            </span>
            <p style={{ fontSize: '12.5px', color: 'var(--text-main)', lineHeight: '1.5', margin: 0 }}>{generationalUnderstanding}</p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={`chat-bubble ${isBot ? 'bot' : 'user'}`}>
      {message.type === 'text' && message.content}
      {message.type === 'login' && renderLogin()}
      {message.type === 'age' && renderAge()}
      {message.type === 'worryCategory' && renderWorryCategory()}
      {message.type === 'diagnostic' && renderDiagnostic()}
      {message.type === 'result' && renderResult()}
      {message.type === 'farms' && renderFarms()}
      {message.type === 'typing' && renderTyping()}
      {message.type === 'perspectiveButtons' && renderPerspectiveButtons()}
      {message.type === 'perspectiveResult' && renderPerspectiveResult()}
    </div>
  );
};
