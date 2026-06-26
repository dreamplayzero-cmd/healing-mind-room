import { useParams, useNavigate } from 'react-router-dom';
import { FARMS } from '../data/farmData';
import { useEffect, useState } from 'react';

export default function FarmDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [farm, setFarm] = useState(null);

  useEffect(() => {
    const foundFarm = FARMS.find(f => f.id === parseInt(id));
    if (foundFarm) {
      setFarm(foundFarm);
    } else {
      // If not found, go back
      navigate('/farm-list');
    }
  }, [id, navigate]);

  if (!farm) return null;

  return (
    <div className="page-container fade-in" style={{ padding: 0 }}>
      {/* 뒤로가기 헤더 */}
      <div style={{
        position: 'absolute',
        top: '16px',
        left: '16px',
        zIndex: 10,
      }}>
        <button 
          onClick={() => navigate(-1)}
          style={{
            background: 'rgba(255, 255, 255, 0.8)',
            border: 'none',
            borderRadius: '50%',
            width: '40px',
            height: '40px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            padding: 0,
            minHeight: 'auto'
          }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6"></polyline>
          </svg>
        </button>
      </div>

      {/* 전체 이미지 */}
      <div style={{ width: '100%', height: '300px', backgroundColor: '#e2e8f0' }}>
        <img 
          src={farm.imgUrl} 
          alt={farm.name} 
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          onError={(e) => {
            e.currentTarget.src = `https://picsum.photos/seed/${farm.id}/600/400`; 
          }}
        />
      </div>

      {/* 힐링공간 소개 및 연락처 */}
      <div style={{ padding: '24px', backgroundColor: 'var(--color-surface)', flexGrow: 1, borderTopLeftRadius: '24px', borderTopRightRadius: '24px', marginTop: '-24px', position: 'relative', zIndex: 5 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--color-text-main)', margin: 0 }}>
            {farm.name}
          </h1>
          <span style={{ 
            fontSize: '13px', 
            backgroundColor: 'var(--color-background)', 
            color: 'var(--color-primary)', 
            padding: '6px 12px', 
            borderRadius: '16px', 
            fontWeight: 'bold' 
          }}>
            {farm.region}
          </span>
        </div>

        <div style={{ fontSize: '15px', color: 'var(--color-primary)', fontWeight: 'bold', marginBottom: '24px' }}>
          📍 {farm.location}
        </div>

        <div style={{ marginBottom: '32px' }}>
          <h3 style={{ fontSize: '16px', color: 'var(--color-text-main)', marginBottom: '8px', fontWeight: 'bold' }}>힐링공간 소개</h3>
          <p style={{ fontSize: '15px', color: 'var(--color-text-sub)', lineHeight: '1.6', margin: 0 }}>
            {farm.description}
          </p>
        </div>

        <div style={{ marginBottom: '32px', padding: '16px', backgroundColor: '#f8f9fa', borderRadius: '12px' }}>
          <h3 style={{ fontSize: '15px', color: 'var(--color-text-main)', marginBottom: '8px', fontWeight: 'bold' }}>📞 연락처 및 예약문의</h3>
          <p style={{ fontSize: '15px', color: 'var(--color-primary)', fontWeight: 'bold', margin: 0 }}>
            {farm.contact || '0507-1234-5678'}
          </p>
        </div>

        <div className="spacer" />

        {/* 마음처방전 이동 버튼 (화면 하단) */}
        <button 
          className="btn-primary" 
          onClick={() => navigate('/prescription')}
          style={{ width: '100%', padding: '16px 0', fontSize: '16px' }}
        >
          오늘의 마음 처방전 발급받기
        </button>
      </div>
    </div>
  );
}
