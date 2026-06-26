import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import useAppStore from '../store/useAppStore';
import Modal from './Modal';

export default function TopNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const resetStore = useAppStore(state => state.resetStore);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  // 안 보여야 하는 경로들 (스플래시 화면, 페르소나 선택 화면)
  const hiddenPaths = ['/', '/age'];
  if (hiddenPaths.includes(location.pathname)) return null;

  const handleLogout = () => {
    resetStore();
    setIsLogoutModalOpen(false);
    navigate('/');
  };

  return (
    <>
      <div style={{
        display: 'flex',
        justifyContent: 'flex-end',
        padding: '16px 20px 0',
        backgroundColor: 'var(--color-surface)',
        position: 'sticky',
        top: 0,
        zIndex: 100
      }}>
        <button 
          onClick={() => setIsLogoutModalOpen(true)}
          style={{
            background: 'none',
            border: '1px solid var(--color-border)',
            padding: '6px 12px',
            borderRadius: '20px',
            fontSize: '12px',
            color: 'var(--color-text-sub)',
            minHeight: 'auto',
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
            <polyline points="16 17 21 12 16 7"></polyline>
            <line x1="21" y1="12" x2="9" y2="12"></line>
          </svg>
          로그아웃
        </button>
      </div>

      <Modal 
        isOpen={isLogoutModalOpen}
        title="로그아웃"
        content={"정말 로그아웃 하시겠습니까?\n모든 진행 상황이 초기화됩니다."}
        confirmText="로그아웃"
        cancelText="취소"
        onConfirm={handleLogout}
        onCancel={() => setIsLogoutModalOpen(false)}
      />
    </>
  );
}
