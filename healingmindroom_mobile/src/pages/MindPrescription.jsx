import { useNavigate } from 'react-router-dom';
import useAppStore from '../store/useAppStore';

export default function MindPrescription() {
  const navigate = useNavigate();
  const { worryType, recommendedFarm, resetStore } = useAppStore();

  const handleRestart = () => {
    resetStore();
    navigate('/');
  };

  return (
    <div className="page-container fade-in" style={{ backgroundColor: 'var(--color-primary-light)' }}>
      <div style={{
        backgroundColor: 'var(--color-surface)',
        borderRadius: 'var(--border-radius-lg)',
        padding: '32px 24px',
        textAlign: 'center',
        boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
      }}>
        <h1 className="title" style={{ color: 'var(--color-primary)', marginBottom: '8px' }}>마음 처방전</h1>
        <p className="small-text" style={{ marginBottom: '32px' }}>발급일: {new Date().toLocaleDateString()}</p>
        
        <div style={{ textAlign: 'left', marginBottom: '32px' }}>
          <p className="body-text" style={{ marginBottom: '16px' }}>
            <strong>증상:</strong> {worryType} 관련 스트레스 및 피로
          </p>
          <p className="body-text" style={{ marginBottom: '16px' }}>
            <strong>처방:</strong> 주말 하루, 모든 것을 내려놓고 자연 속에서 온전한 휴식을 취할 것.
          </p>
          <p className="body-text">
            <strong>추천 목적지:</strong> {recommendedFarm?.name || '맞춤 치유공간'}
          </p>
        </div>

        <div style={{ borderTop: '2px dashed var(--color-border)', margin: '24px 0' }} />

        <p className="body-text" style={{ fontStyle: 'italic', color: 'var(--color-text-sub)' }}>
          "당신의 마음은 가장 소중한 정원입니다. <br/>가끔은 잡초를 뽑고 물을 주는 시간이 필요해요."
        </p>
      </div>

      <div className="spacer" />

      <button className="btn-secondary" onClick={handleRestart} style={{ backgroundColor: 'white', border: 'none' }}>
        처음으로 돌아가기
      </button>
    </div>
  );
}
