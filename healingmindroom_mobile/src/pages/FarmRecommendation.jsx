import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useAppStore from '../store/useAppStore';

export default function FarmRecommendation() {
  const navigate = useNavigate();
  const { emotionState, worryType, setRecommendedFarm, recommendedFarm } = useAppStore();

  useEffect(() => {
    // Mock logic based on state
    const farm = {
      name: worryType === '건강' ? '로즈마리 힐링농원' : '초록바람 숲속농장',
      location: '강원도 평창군',
      theme: worryType || '휴식',
      description: '푸른 자연 속에서 맑은 공기를 마시며 지친 마음을 달래보세요. 직접 식물을 가꾸며 마음의 안정을 찾을 수 있는 프로그램이 준비되어 있습니다.',
      imgUrl: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=600&h=400&fit=crop'
    };
    setRecommendedFarm(farm);
  }, [worryType, setRecommendedFarm]);

  if (!recommendedFarm) return null;

  const emotionScore = typeof emotionState === 'object' && emotionState !== null 
    ? Math.round((emotionState.fatigue + emotionState.sleep + emotionState.tension) / 3) 
    : emotionState;

  return (
    <div className="page-container fade-in">
      <h1 className="title">추천 치유공간</h1>
      <p className="subtitle">당신의 현재 상태(평균 {emotionScore}점)를 고려한 맞춤 추천입니다.</p>

      <div style={{
        borderRadius: 'var(--border-radius-lg)',
        overflow: 'hidden',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        backgroundColor: 'var(--color-surface)',
        marginBottom: '24px'
      }}>
        <img 
          src={recommendedFarm.imgUrl} 
          alt="공간 전경" 
          style={{ width: '100%', height: '200px', objectFit: 'cover' }}
        />
        <div style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '14px', color: 'var(--color-primary)', fontWeight: 'bold' }}>{recommendedFarm.theme} 치유</span>
            <span style={{ fontSize: '14px', color: 'var(--color-text-sub)' }}>{recommendedFarm.location}</span>
          </div>
          <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '12px' }}>{recommendedFarm.name}</h2>
          <p className="body-text">{recommendedFarm.description}</p>
        </div>
      </div>

      <div className="spacer" />

      <button className="btn-primary" onClick={() => navigate('/farm-list')}>
        더 많은 추천 공간 보기
      </button>
    </div>
  );
}
