import { useNavigate } from 'react-router-dom';

export default function SplashLogin() {
  const navigate = useNavigate();

  return (
    // 1. 배경 이미지를 전체에 적용 (Scaffold > body > Container)
    <div 
      style={{ 
        width: '100%',
        flexGrow: 1,
        backgroundImage: 'url("/main_marbled_background.png")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      {/* 2. 내부 핵심 UI는 SafeArea 안에 배치 (웹의 env(safe-area-inset-*) 활용) */}
      <div 
        style={{
          flexGrow: 1,
          paddingTop: 'env(safe-area-inset-top, 0px)',
          paddingBottom: 'env(safe-area-inset-bottom, 0px)',
          paddingLeft: 'env(safe-area-inset-left, 0px)',
          paddingRight: 'env(safe-area-inset-right, 0px)',
          display: 'flex'
        }}
      >
        {/* Center */}
        <div 
          style={{
            flexGrow: 1,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center'
          }}
        >
          {/* Padding (EdgeInsets.all(24.0)) */}
          <div 
            style={{
              width: '100%',
              padding: '24px',
              boxSizing: 'border-box'
            }}
          >
            {/* 하얀색 라운드 카드 영역 */}
            <div 
              className="fade-in"
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.85)',
                backdropFilter: 'blur(10px)',
                WebkitBackdropFilter: 'blur(10px)',
                borderRadius: '20px',
                padding: '36px 20px',
                width: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
              }}
            >
              <div style={{ fontSize: '44px', marginBottom: '12px', filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.1))' }}>🌿</div>
              <h1 style={{ color: '#1A3C40', fontSize: '24px', fontWeight: '800', marginBottom: '6px', letterSpacing: '-0.5px' }}>마음 치유의 방</h1>
              <p style={{ color: '#2C5F2D', fontSize: '13px', fontWeight: '700', marginBottom: '24px' }}>Cozy &amp; Calm Mind Healing Room</p>
              
              <p style={{ color: '#555555', fontSize: '12px', lineHeight: '1.5', marginBottom: '32px', wordBreak: 'keep-all' }}>
                당신만을 위한 조용하고 평온한 치유공간입니다.<br />
                소셜 로그인을 통해 3초 만에 안전하게 입장하세요. ☕
              </p>

              <button 
                style={{ 
                  width: '100%', 
                  backgroundColor: '#FEE500', 
                  color: '#000000', 
                  border: 'none',
                  borderRadius: '10px',
                  padding: '14px',
                  fontSize: '14px',
                  fontWeight: '700',
                  marginBottom: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  cursor: 'pointer',
                  boxShadow: '0 2px 8px rgba(254, 229, 0, 0.3)'
                }}
                onClick={() => navigate('/age')}
              >
                <span style={{ fontSize: '18px' }}>💬</span> 카카오로 3초 간편 로그인
              </button>

              <button 
                style={{ 
                  width: '100%', 
                  backgroundColor: '#FFFFFF', 
                  color: '#333333', 
                  border: '1px solid #DDDDDD',
                  borderRadius: '10px',
                  padding: '14px',
                  fontSize: '14px',
                  fontWeight: '600',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  cursor: 'pointer',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)'
                }}
                onClick={() => navigate('/age')}
              >
                <span style={{ fontSize: '18px' }}>🌐</span> Google 계정으로 로그인
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
