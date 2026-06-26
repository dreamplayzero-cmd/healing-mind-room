import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAppStore from '../store/useAppStore';
import { FARMS } from '../data/farmData';

export default function FarmList() {
  const navigate = useNavigate();
  const { ageGroup, worryType } = useAppStore();
  const [filteredFarms, setFilteredFarms] = useState([]);

  useEffect(() => {
    // 1. 먼저 사용자의 연령대(ageGroup)에 맞는 농장들만 엄격하게 필터링 (8개 중 선택)
    let ageMatched = FARMS.filter(f => f.targetAge.includes(ageGroup));
    
    // 2. 그 중에서도 고민(worryType)이 정확히 일치하는 것을 맨 앞으로 정렬
    ageMatched.sort((a, b) => {
      if (a.theme === worryType && b.theme !== worryType) return -1;
      if (b.theme === worryType && a.theme !== worryType) return 1;
      return 0;
    });

    // 3. 만약 연령대 필터링 결과가 아예 없다면 (예비 방어코드) 전체에서 고민 일치하는 것 위주로
    if (ageMatched.length === 0) {
      ageMatched = FARMS.filter(f => f.theme === worryType);
      if (ageMatched.length === 0) ageMatched = FARMS;
    }
    
    setFilteredFarms(ageMatched.slice(0, 4)); // 상위 4개 노출
  }, [ageGroup, worryType]);

  return (
    <div className="page-container fade-in">
      <h1 className="title" style={{ fontSize: '20px', marginBottom: '8px' }}>
        🏕️ 맞춤 추천 치유공간
      </h1>
      <p className="subtitle" style={{ fontSize: '13px', marginBottom: '24px' }}>
        클릭 시 공간 상세 정보를 확인하실 수 있습니다.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginBottom: '32px' }}>
        {filteredFarms.map(farm => (
          <div 
            key={farm.id}
            style={{
              backgroundColor: 'white',
              borderRadius: '16px',
              border: '1px solid var(--color-border)',
              overflow: 'hidden',
              boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
              cursor: 'pointer'
            }}
            onClick={() => {
              navigate(`/farm-detail/${farm.id}`);
            }}
          >
            <div style={{ position: 'relative', width: '100%', aspectRatio: '16/9', backgroundColor: '#e2e8f0' }}>
              <img 
                src={farm.imgUrl} 
                alt={farm.name} 
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                onError={(e) => {
                  // 파이어베이스 주소가 없거나 깨졌을 때, 각 농장마다 다른 기본 임시 이미지가 나오도록 설정
                  e.currentTarget.src = `https://picsum.photos/seed/${farm.id}/600/400`; 
                }}
              />
            </div>
            
            <div style={{ padding: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: 'var(--color-text-main)', margin: 0 }}>
                  {farm.name}
                </h3>
                <span style={{ 
                  fontSize: '12px', 
                  backgroundColor: 'var(--color-background)', 
                  color: 'var(--color-primary)', 
                  padding: '4px 10px', 
                  borderRadius: '12px', 
                  fontWeight: 'bold' 
                }}>
                  {farm.region}
                </span>
              </div>
              
              <div style={{ fontSize: '13px', color: 'var(--color-primary)', fontWeight: 'bold', marginBottom: '12px' }}>
                📍 {farm.location}
              </div>
              
              <p style={{ fontSize: '13px', color: 'var(--color-text-sub)', lineHeight: '1.5', margin: 0 }}>
                {farm.description}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="spacer" />

      <button className="btn-primary" onClick={() => navigate('/prescription')}>
        오늘의 마음 처방전 발급받기
      </button>
    </div>
  );
}
