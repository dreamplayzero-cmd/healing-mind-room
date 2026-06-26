import React, { useEffect, useRef, useState } from 'react';
import { FlowProvider, useFlow } from './context/FlowContext';
import { MessageItem } from './components/MessageItem';
import { getAllFarmsFromFirestore } from './utils/firebase';
import type { Farm } from './types';

// 치유농장 상세 팝업 모달 컴포넌트
const FarmDetailModal: React.FC<{ farm: Farm; onClose: () => void }> = ({ farm, onClose }) => {
  return (
    <div
      onClick={onClose}
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
          backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.65) 100%), url('${farm.imageUrl}')`,
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
            onClick={onClose}
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
              AI 맞춤 치유공간 추천
            </span>
            <h3 style={{ fontSize: '18px', fontWeight: 900, marginTop: '2px' }}>{farm.name}</h3>
          </div>
        </div>

        <div style={{ padding: '20px', textAlign: 'left' }}>
          <p style={{ fontSize: '13px', color: 'var(--text-main)', lineHeight: '1.6', marginBottom: '16px' }}>
            {farm.description}
          </p>

          <div style={{ marginBottom: '16px' }}>
            <h5 style={{ fontSize: '12px', fontWeight: 700, color: 'var(--green-dark)', marginBottom: '6px' }}>
              🎯 주요 치유 프로그램
            </h5>
            <ul style={{ listStyleType: 'none', paddingLeft: 0 }}>
              {farm.programs.map((prog, idx) => (
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
            <div style={{ marginBottom: '3px' }}>📍 <b>위치</b>: {farm.location}</div>
            <div>📞 <b>전화문의</b>: {farm.contact}</div>
          </div>

          <div style={{ display: 'flex', gap: '8px', marginTop: '20px' }}>
            <button
              className="btn-healing"
              onClick={() => {
                onClose();
                window.location.hash = 'result';
              }}
              style={{ flex: 1, height: '40px', fontSize: '13px' }}
            >
              마음 처방전으로 이동 💌
            </button>
            <button
              className="btn-healing"
              onClick={onClose}
              style={{ flex: 1, height: '40px', fontSize: '13px', background: 'white', color: 'var(--green-dark)', border: '1.5px solid var(--green-mid)' }}
            >
              닫고 돌아가기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// 치유농장 검색 및 필터링 둘러보기 컴포넌트
const FarmsTab: React.FC<{ onSelectFarm: (farm: Farm) => void }> = ({ onSelectFarm }) => {
  const [farms, setFarms] = useState<Farm[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [area, setArea] = useState('전체');
  const [theme, setTheme] = useState('전체');
  const [wave, setWave] = useState('전체');

  const areas = ['전체', '경기', '강원', '충청', '전라', '경상', '제주'];
  const themes = ['전체', '안정', '활동', '자연'];
  const wavesOpts = [
    { value: '전체', label: '전체 뇌파' },
    { value: 'alpha', label: '알파파 (안정)' },
    { value: 'theta', label: '세타파 (피로해소)' }
  ];

  useEffect(() => {
    let active = true;
    const loadFarms = async () => {
      setLoading(true);
      const data = await getAllFarmsFromFirestore();
      if (active) {
        setFarms(data);
        setLoading(false);
      }
    };
    loadFarms();
    return () => {
      active = false;
    };
  }, []);

  const filteredFarms = farms.filter(farm => {
    const matchesQuery = farm.name.toLowerCase().includes(query.toLowerCase()) || 
                         farm.description.toLowerCase().includes(query.toLowerCase());
    const matchesArea = area === '전체' || farm.area === area;
    const matchesTheme = theme === '전체' || farm.themes.includes(theme);
    const matchesWave = wave === '전체' || farm.waveType === wave;
    return matchesQuery && matchesArea && matchesTheme && matchesWave;
  });

  return (
    <div className="farms-container">
      <div className="farms-search-filter">
        <input 
          type="text" 
          className="search-box"
          placeholder="치유공간 이름 또는 설명 검색..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        
        <div className="filter-group">
          <div className="filter-label">📍 지역 선택</div>
          <div className="filter-options">
            {areas.map(a => (
              <button 
                key={a}
                onClick={() => setArea(a)}
                className={`filter-chip ${area === a ? 'active' : ''}`}
              >
                {a}
              </button>
            ))}
          </div>
        </div>

        <div className="filter-group">
          <div className="filter-label">🌿 테마 선택</div>
          <div className="filter-options">
            {themes.map(t => (
              <button 
                key={t}
                onClick={() => setTheme(t)}
                className={`filter-chip ${theme === t ? 'active' : ''}`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        <div className="filter-group">
          <div className="filter-label">🧠 뇌파 유형</div>
          <div className="filter-options">
            {wavesOpts.map(w => (
              <button 
                key={w.value}
                onClick={() => setWave(w.value)}
                className={`filter-chip ${wave === w.value ? 'active' : ''}`}
              >
                {w.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="farms-grid">
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--green-mid)', fontSize: '14px', fontWeight: 700 }}>
            <span style={{ display: 'inline-block', animation: 'floatLogo 1.5s infinite', marginRight: '6px' }}>🌿</span> 치유공간 로드 중...
          </div>
        ) : filteredFarms.length > 0 ? (
          (() => {
            const seenImages = new Set<string>();
            let backupIndex = 0;
            const backupImages = [
              'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?auto=format&fit=crop&w=800&q=80',
              'https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=800&q=80',
              'https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07?auto=format&fit=crop&w=800&q=80',
              'https://images.unsplash.com/photo-1518495973542-4542c06a5843?auto=format&fit=crop&w=800&q=80',
              'https://images.unsplash.com/photo-1444312645910-ffa973656eba?auto=format&fit=crop&w=800&q=80',
            ];

            return filteredFarms.map(farm => {
              let finalImageUrl = farm.imageUrl || '/assets/placeholder-image.png';
              if (seenImages.has(finalImageUrl)) {
                finalImageUrl = backupImages[backupIndex % backupImages.length];
                backupIndex++;
              }
              seenImages.add(finalImageUrl);

              return (
                <div 
                  key={farm.id}
                  className="farm-browse-card"
                  onClick={() => onSelectFarm({ ...farm, imageUrl: finalImageUrl })}
                >
                  <div 
                    className="farm-card-image"
                    style={{ backgroundImage: `url('${finalImageUrl}')` }}
                  />
                  <div className="farm-card-body">
                    <div className="farm-card-header">
                      <span className="farm-card-name">{farm.name}</span>
                      <span className="farm-card-area">{farm.area}</span>
                    </div>
                    <div className="farm-card-desc">{farm.description}</div>
                    <div className="farm-card-tags">
                      <span className="farm-card-tag">📍 {farm.location.split(' ')[1] || farm.area}</span>
                      <span className="farm-card-tag">{farm.waveType === 'alpha' ? '🧠 알파파 우세' : '🧠 세타파 해소'}</span>
                      {farm.themes.map(t => (
                        <span key={t} className="farm-card-tag">#{t}</span>
                      ))}
                    </div>
                  </div>
                </div>
              );
            });
          })()
        ) : (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)', fontSize: '13px' }}>
            검색 결과에 맞는 치유공간이 없습니다. 🌱
          </div>
        )}
      </div>
    </div>
  );
};

// ==========================================
// [신규] 관점 전환 훈련 컴포넌트
// ==========================================
const PerspectiveTab: React.FC = () => {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ fact: string; positive: string; action: string } | null>(null);

  const handleReframe = () => {
    if (text.trim().length < 3) return;
    setLoading(true);
    setResult(null);

    // 1.5초 후 결과 표시 (정화 연출)
    setTimeout(() => {
      let fact = "현재 느끼는 과도한 불안이나 부정적 생각은 감정의 일시적인 필터가 씌워진 상태이며, 실제 최악의 시나리오가 실현될 확률은 극히 낮습니다.";
      let positive = "이러한 힘든 순간을 회피하지 않고 텍스트로 기록하며 마주하려는 태도 자체가 이미 마음의 면역력을 회복해가고 있다는 좋은 반증입니다.";
      let action = "지금 즉시 눈을 감고 4초간 숨을 들이마시고 4초간 멈춘 뒤 6초간 천천히 내쉬는 호흡을 3회 반복하고, 가벼운 스트레칭으로 신체의 물리적 긴장을 풀어주세요.";

      const cleanText = text.toLowerCase();

      // 1. 긍정 정서 판정 (기쁨, 감사, 행복, 긍정어 - 한국어 & 중국어)
      const positiveKeywords = [
        '행복', '기쁨', '감사', '좋다', '행운', '즐거', '사랑', '성공', '해냈다', '해내다',
        '开心', '幸福', '感谢', '高兴', '棒', '快乐', '顺利', '喜悦', '爱', '很好'
      ];
      const isPositive = positiveKeywords.some(kw => cleanText.includes(kw));

      if (isPositive) {
        fact = "오늘 느낀 감사와 기쁨은 당신의 뇌에 긍정적인 신경 회로를 형성하는 아주 소중한 자산입니다. 행복을 당연시하지 않고 알아차린 감수성이 돋보입니다.";
        positive = "이 맑고 따뜻한 감정 온도를 마음에 담아두면, 나중에 예기치 못한 힘든 상황이 찾아왔을 때 이를 유연하게 극복할 수 있는 튼튼한 정서적 쿠션(Resilience)이 됩니다.";
        action = "오늘 밤 잠들기 전 눈을 감고 기뻤던 순간의 구체적 감각(소리, 풍경, 상대방의 표정)을 30초간 조용히 떠올려 뇌에 깊이 각인시키거나, 다이어리에 오늘의 기록을 새겨보세요.";
      }
      // 2. 직장 및 업무 관련 (한국어 & 중국어)
      else if (
        cleanText.includes('회사') || cleanText.includes('업무') || cleanText.includes('실수') || 
        cleanText.includes('상사') || cleanText.includes('발표') || cleanText.includes('일') ||
        cleanText.includes('工作') || cleanText.includes('老板') || cleanText.includes('同事') || 
        cleanText.includes('加班') || cleanText.includes('失误') || cleanText.includes('累')
      ) {
        fact = "업무상 실수는 시스템과 커뮤니케이션의 조율 과정에서 언제든 일어날 수 있는 자연스러운 이벤트이며, 이것이 당신이라는 사람의 총체적 가치나 유능함을 대변하지 않습니다.";
        positive = "이번 실수는 업무 프로세스의 취약점을 조기에 파악하고 보완하는 계기가 될 것이며, 장기적으로는 더 꼼꼼하고 유능한 실무자로 발돋움하는 귀중한 밑거름이 됩니다.";
        action = "실수의 원인을 시간 순서로 차분히 정리하여 간단한 보완 개선안을 서면(이메일 또는 메모)으로 기록하고, 상사에게 간결하게 공유하여 적극적이고 프로페셔널한 대처를 보여주세요.";
      }
      // 3. 인간관계 및 가족 (한국어 & 중국어)
      else if (
        cleanText.includes('친구') || cleanText.includes('관계') || cleanText.includes('가족') || 
        cleanText.includes('부모') || cleanText.includes('다툼') || cleanText.includes('화') ||
        cleanText.includes('朋友') || cleanText.includes('关系') || cleanText.includes('家人') || 
        cleanText.includes('父母') || cleanText.includes('吵架') || cleanText.includes('生气')
      ) {
        fact = "상대방의 차가운 태도나 날선 반응은 당신의 부족함 때문이 아니라, 상대방이 가진 개인적 상황, 스트레스, 혹은 미성숙한 감정 조절 때문인 경우가 지배적입니다.";
        positive = "일어난 갈등을 솔직하게 마주해봄으로써 나와 타인 사이에 건강한 정서적 경계선(Boundary)을 명확히 정의하고, 더 편안하고 성숙한 소통 방식을 실험하는 시작점이 될 수 있습니다.";
        action = "우선 당장의 감정적 소모를 막기 위해 해당 인물과의 대화를 반나절 동안 보류해 감정을 가라앉히고, 나를 조건 없이 격려하고 이해해줄 수 있는 신뢰하는 사람과 가벼운 커피 타임을 가져보세요.";
      }
      // 4. 재정, 취업 및 미래 불안 (한국어 & 중국어)
      else if (
        cleanText.includes('돈') || cleanText.includes('재정') || cleanText.includes('취업') || 
        cleanText.includes('미래') || cleanText.includes('불안') || cleanText.includes('걱정') ||
        cleanText.includes('钱') || cleanText.includes('未来') || cleanText.includes('焦虑') || 
        cleanText.includes('担心')
      ) {
        fact = "미래에 대한 불안은 뇌가 위험에 대비하기 위해 보내는 지극히 정상적인 생존 신호이지만, 아직 일어나지 않은 머릿속의 상상들이 현실을 위협하지는 못합니다.";
        positive = "미래를 걱정한다는 것은 삶을 진지하게 대하고 더 나은 삶을 향해 나아가고자 하는 의지가 마음속 깊이 가득 차 있음을 증명하는 긍정적인 신호입니다.";
        action = "불안을 야기하는 불확실한 미래의 요소 대신, 오늘 하루 내가 통제할 수 있는 일(예: 방 청소하기, 30분 책 읽기, 건강한 식사하기) 중 가장 작은 한 가지를 정해 즉시 실행해 보세요.";
      }

      setResult({ fact, positive, action });
      setLoading(false);
    }, 1500);
  };

  return (
    <div className="perspective-container">
      <div className="perspective-input-section">
        <h3 className="perspective-title">🔄 관점 전환 (Perspective Shift)</h3>
        <p className="perspective-subtitle">
          마음속을 지배하고 있는 부정적인 생각이나 왜곡된 감정을 있는 그대로 적어주세요. 
          더 객관적이고 건강한 시각으로 바라볼 수 있도록 정서 조율을 도와드립니다.
        </p>
        <textarea
          className="perspective-textarea"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="예: 오늘 회의에서 실수해서 동료들이 날 무능하게 생각할까 봐 너무 불안하고 걱정돼요."
        />
        <button
          className="btn-healing"
          onClick={handleReframe}
          disabled={text.trim().length < 3 || loading}
          style={{ height: '44px', fontSize: '14px', marginTop: '6px' }}
        >
          {loading ? '생각을 다듬고 있습니다... 🌿' : '새로운 관점으로 전환하기 ➔'}
        </button>
      </div>

      {loading && (
        <div className="reframing-loader">
          <div className="reframing-spinner" />
          <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>생각의 필터를 정화하는 중...</span>
        </div>
      )}

      {result && !loading && (
        <div className="perspective-results">
          <div className="perspective-result-header">✨ 3가지 다각도 마음 조율</div>
          
          <div className="perspective-card fact">
            <span className="perspective-card-label fact">🔍 객관적 팩트 체크 (Fact Check)</span>
            <p className="perspective-card-text">{result.fact}</p>
          </div>

          <div className="perspective-card positive">
            <span className="perspective-card-label positive">🌿 긍정적 재해석 (Positive Reframe)</span>
            <p className="perspective-card-text">{result.positive}</p>
          </div>

          <div className="perspective-card action">
            <span className="perspective-card-label action">🎯 미래 지향적 행동 (Future Action)</span>
            <p className="perspective-card-text">{result.action}</p>
          </div>
        </div>
      )}
    </div>
  );
};

interface JournalEntry {
  id: string;
  date: string;
  emotion: 'joy' | 'calm' | 'tired' | 'sad' | 'angry';
  content: string;
}

// ==========================================
// [신규] 인생 기록 다이어리 컴포넌트
// ==========================================
const JournalTab: React.FC = () => {
  const [selectedEmotion, setSelectedEmotion] = useState<'joy' | 'calm' | 'tired' | 'sad' | 'angry'>('calm');
  const [content, setContent] = useState('');
  const [entries, setEntries] = useState<JournalEntry[]>([]);

  // 컴포넌트 마운트 시 기존 일기 데이터 로드
  useEffect(() => {
    const saved = localStorage.getItem('healing_journals');
    if (saved) {
      try {
        setEntries(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse journal history:", e);
      }
    }
  }, []);

  const handleSave = () => {
    if (content.trim().length < 5) return;

    const newEntry: JournalEntry = {
      id: `journal-${Date.now()}`,
      date: new Date().toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        weekday: 'short',
        hour: '2-digit',
        minute: '2-digit'
      }),
      emotion: selectedEmotion,
      content: content
    };

    const updated = [newEntry, ...entries];
    setEntries(updated);
    localStorage.setItem('healing_journals', JSON.stringify(updated));
    setContent('');
  };

  const handleDelete = (id: string) => {
    const updated = entries.filter(e => e.id !== id);
    setEntries(updated);
    localStorage.setItem('healing_journals', JSON.stringify(updated));
  };

  const emotionMap = {
    joy: { emoji: '☀️', label: '기쁨/활력', className: 'joy' },
    calm: { emoji: '🌤', label: '평온/안정', className: 'calm' },
    tired: { emoji: '⛅', label: '피로/번아웃', className: 'tired' },
    sad: { emoji: '🌧', label: '슬픔/우울', className: 'sad' },
    angry: { emoji: '⚡', label: '스트레스/분노', className: 'angry' }
  };

  return (
    <div className="journal-container">
      <div className="journal-write-card">
        <span className="emotion-picker-label">🧠 오늘의 마음 날씨 선택</span>
        <div className="emotion-picker-group">
          {(Object.keys(emotionMap) as Array<keyof typeof emotionMap>).map((key) => {
            const item = emotionMap[key];
            return (
              <button
                key={key}
                onClick={() => setSelectedEmotion(key)}
                className={`emotion-btn ${selectedEmotion === key ? `active ${item.className}` : ''}`}
              >
                <span className="emotion-emoji">{item.emoji}</span>
                <span className="emotion-text">{item.label}</span>
              </button>
            );
          })}
        </div>

        <textarea
          className="journal-textarea"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="오늘 하루 있었던 감정과 감사한 일, 속마음을 정갈하게 적어보세요. (최소 5자)"
        />

        <button
          className="btn-healing"
          onClick={handleSave}
          disabled={content.trim().length < 5}
          style={{ height: '42px', fontSize: '13px' }}
        >
          오늘의 마음 기록하기 🌱
        </button>
      </div>

      <div className="journal-history-section">
        <h4 className="journal-history-title">📖 축적된 인생 기록 ({entries.length})</h4>
        
        {entries.length > 0 ? (
          <div className="journal-history-list">
            {entries.map((entry) => {
              const info = emotionMap[entry.emotion] || emotionMap.calm;
              return (
                <div key={entry.id} className="journal-history-card">
                  <div className="journal-card-header">
                    <span className="journal-card-date">{entry.date}</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span className={`journal-card-badge ${info.className}`}>
                        {info.emoji} {info.label}
                      </span>
                      <button
                        onClick={() => handleDelete(entry.id)}
                        style={{
                          border: 'none',
                          background: 'none',
                          color: '#f87171',
                          cursor: 'pointer',
                          fontSize: '11px',
                          fontWeight: 700
                        }}
                      >
                        삭제
                      </button>
                    </div>
                  </div>
                  <p className="journal-card-content">{entry.content}</p>
                </div>
              );
            })}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '40px 20px', background: 'white', borderRadius: 'var(--radius-md)', border: '1.5px solid var(--glass-border)', color: 'var(--text-muted)', fontSize: '12px' }}>
            기록된 일기가 없습니다. 오늘 하루의 감정을 첫 페이지에 새겨보세요. ✏️
          </div>
        )}
      </div>
    </div>
  );
};


// 최종 마음 처방전 컴포넌트
const ResultTab: React.FC<{ onSelectFarm: (farm: Farm) => void }> = ({ onSelectFarm }) => {
  const {
    user,
    logout,
    selectedWorryCategory,
    worryText,
    waves,
    matchedFarms,
    resetFlow,
    selectedAge
  } = useFlow();

  if (!user || !waves) {
    return (
      <div className="profile-container" style={{ justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>💌</div>
        <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--green-dark)', marginBottom: '8px' }}>마음 처방전이 아직 준비되지 않았어요</div>
        <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '20px' }}>
          AI 치유방에서 대화를 나누고 진단을 완료하시면<br />나만을 위한 맞춤 처방전이 발급됩니다. 🌱
        </div>
      </div>
    );
  }

  const getFlowerImage = (age: string) => {
    switch (age) {
      case '30s':
        return "url('https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07?auto=format&fit=crop&w=800&q=80')"; // 화사함 1
      case '40s':
        return "url('https://images.unsplash.com/photo-1472214103451-9374bd1c798e?auto=format&fit=crop&w=800&q=80')"; // 화사함 2
      case '50s':
        return "url('https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=800&q=80')"; // 차분함 1
      case '60s':
        return "url('https://images.unsplash.com/photo-1518495973542-4542c06a5843?auto=format&fit=crop&w=800&q=80')"; // 차분함 2
      default:
        return "url('https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07?auto=format&fit=crop&w=800&q=80')";
    }
  };

  return (
    <div className="profile-container" style={{ padding: '20px 16px', background: '#f8fafc' }}>
      <div style={{ textAlign: 'center', marginBottom: '24px', animation: 'fadeIn 0.8s ease-out' }}>
        <div style={{ fontSize: '12px', fontWeight: 800, color: 'var(--green-mid)', marginBottom: '8px' }}>나만을 위한 위로의 메시지</div>
        <h2 style={{ fontSize: '22px', fontWeight: 900, color: 'var(--text-main)', marginBottom: '16px' }}>
          {user.name} 님의 마음 처방전 💌
        </h2>
        <div style={{
          width: '100%',
          height: '200px',
          borderRadius: 'var(--radius-md)',
          backgroundImage: getFlowerImage(selectedAge),
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
          marginBottom: '20px',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{
            position: 'absolute',
            top: 0, left: 0, right: 0, bottom: 0,
            background: 'linear-gradient(to bottom, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.6) 100%)',
            display: 'flex',
            alignItems: 'flex-end',
            padding: '16px',
            textAlign: 'left'
          }}>
            <p style={{ color: 'white', fontSize: '13px', lineHeight: '1.6', fontWeight: 600, textShadow: '1px 1px 4px rgba(0,0,0,0.8)' }}>
              "바람이 나뭇가지를 흔들 듯,<br/>때로는 시련이 우리의 마음을 흔들지만<br/>그 흔들림 속에서 우리는 더 깊이 뿌리내립니다."
            </p>
          </div>
        </div>
      </div>

      <div className="section-card" style={{ animation: 'fadeIn 1s ease-out', borderLeft: '4px solid var(--green-mid)' }}>
        <p style={{ fontSize: '14px', color: 'var(--text-main)', lineHeight: '1.7', fontWeight: 600 }}>
          {user.name} 님, 최근 <b>{selectedWorryCategory || '여러 가지 일들'}</b>로 인해 많이 지치셨죠.<br/><br/>
          당신의 뇌파는 현재 <b>{waves.dominant === 'alpha' ? '알파파(휴식)' : '세타파(치유)'}</b> 상태의 안정이 가장 필요하다고 말하고 있습니다.<br/>
          잠시 모든 짐을 내려놓고, 흐르는 물소리와 푸른 나무들이 있는 곳으로 떠나보는 건 어떨까요?<br/><br/>
          자연은 언제나 당신을 있는 그대로 품어줄 준비가 되어 있습니다. 🌿
        </p>
      </div>

      {worryText && (
        <div className="section-card" style={{ animation: 'fadeIn 1.1s ease-out', background: '#f0fdf4', border: '1px solid #bbf7d0' }}>
          <div style={{ fontSize: '12px', fontWeight: 800, color: 'var(--green-mid)', marginBottom: '8px' }}>📝 기록하신 고민 내용</div>
          <p style={{ fontSize: '13px', color: 'var(--text-main)', lineHeight: '1.6', fontStyle: 'italic' }}>
            "{worryText}"
          </p>
        </div>
      )}

      {matchedFarms.length > 0 && (
        <div className="section-card" style={{ animation: 'fadeIn 1.2s ease-out' }}>
          <div className="section-title">🏕️ 당신에게 꼭 맞는 추천 공간</div>
          <div
            onClick={() => onSelectFarm(matchedFarms[0])}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px',
              background: 'white',
              borderRadius: 'var(--radius-sm)',
              border: '1.2px solid var(--glass-border)',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
            }}
          >
            <div style={{
              width: '60px',
              height: '60px',
              borderRadius: '8px',
              backgroundImage: `url('${matchedFarms[0].imageUrl}')`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              flexShrink: 0
            }} />
            <div style={{ flexGrow: 1, textAlign: 'left' }}>
              <div style={{ fontSize: '14px', fontWeight: 800, color: 'var(--text-main)', marginBottom: '4px' }}>{matchedFarms[0].name}</div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{matchedFarms[0].location}</div>
            </div>
            <div style={{ fontSize: '16px', color: 'var(--green-mid)' }}>➔</div>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', gap: '10px', marginTop: '20px', paddingTop: '16px' }}>
        <button
          onClick={resetFlow}
          className="btn-healing"
          style={{ flex: 1, height: '44px', background: 'white', border: '1.5px solid var(--green-mid)', color: 'var(--green-dark)', fontSize: '13px' }}
        >
          처음부터 다시하기 🔄
        </button>
        <button
          onClick={logout}
          className="btn-healing"
          style={{ flex: 1, height: '44px', background: '#fff0f0', border: '1.5px solid #ffd1d1', color: '#e53e3e', fontSize: '13px', boxShadow: 'none' }}
        >
          로그아웃 👤
        </button>
      </div>

      <div style={{ 
        marginTop: '20px', 
        textAlign: 'right', 
        fontSize: '11px', 
        color: 'var(--text-muted)', 
        fontWeight: 600 
      }}>
        🔬 농촌진흥청 국책연구 기반 뇌파 안정도 추정 위젯
      </div>
    </div>
  );
};

// 독립 로그인 화면 컴포넌트
const LoginScreen = () => {
  const { login } = useFlow();
  const [loggingIn, setLoggingIn] = useState<'kakao' | 'google' | null>(null);
  const [selectedProvider, setSelectedProvider] = useState<'kakao' | 'google' | null>(null);

  const triggerLogin = async (provider: 'kakao' | 'google') => {
    setLoggingIn(provider);
    await new Promise(resolve => setTimeout(resolve, 600));
    setLoggingIn(null);
    setSelectedProvider(provider);
  };

  const selectPersona = async (personaId: '30s' | '40s' | '50s' | '60s') => {
    setLoggingIn(selectedProvider);
    await login(selectedProvider!, personaId);
    setLoggingIn(null);
  };

  const personaButtonStyle = {
    width: '100%',
    height: '52px',
    background: '#FFFFFF',
    color: 'var(--text-main)',
    border: '1.5px solid #e2e8f0',
    borderRadius: 'var(--radius-md)',
    fontSize: '15px',
    fontWeight: 700,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
    transition: 'all 0.2s ease',
    marginBottom: '12px'
  };

  return (
    <div className="login-screen">
      <div className="login-card">
        {!selectedProvider && (
          <>
            <div className="login-logo">🌿</div>
            <h1 className="login-title">마음 치유의 방</h1>
            <div className="login-subtitle">Cozy & Calm Mind Healing Room</div>
          </>
        )}
        <p className="login-desc">
          {selectedProvider ? '체험하실 페르소나를 선택해주세요. 🌱' : (
            <>당신만을 위한 조용하고 평온한 치유공간입니다.<br />소셜 로그인을 통해 3초 만에 안전하게 입장하세요. 🌱</>
          )}
        </p>
        
        <div className="login-buttons-container">
          {!selectedProvider ? (
            <>
              <button
                onClick={() => triggerLogin('kakao')}
                disabled={loggingIn !== null}
                style={{
                  width: '100%',
                  height: '52px',
                  background: '#FEE500',
                  color: '#191919',
                  border: 'none',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '15px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '10px',
                  boxShadow: '0 4px 12px rgba(254, 229, 0, 0.15)',
                  transition: 'all 0.2s ease',
                  marginBottom: '12px'
                }}
              >
                {loggingIn === 'kakao' ? '인증 진행 중... 🌿' : '💬 카카오로 3초 간편 로그인'}
              </button>
              <button
                onClick={() => triggerLogin('google')}
                disabled={loggingIn !== null}
                style={{
                  ...personaButtonStyle,
                  marginBottom: '0'
                }}
              >
                {loggingIn === 'google' ? '인증 진행 중... 🌿' : '🌐 Google 계정으로 로그인'}
              </button>
            </>
          ) : (
            <>
              <button onClick={() => selectPersona('30s')} disabled={loggingIn !== null} style={personaButtonStyle}>
                {loggingIn !== null ? '입장 중... 🌿' : '👩🏻‍🦰 최지연 (30대 여성) 페르소나 시작'}
              </button>
              <button onClick={() => selectPersona('40s')} disabled={loggingIn !== null} style={personaButtonStyle}>
                {loggingIn !== null ? '입장 중... 🌿' : '👨🏻 이정우 (40대 남성) 페르소나 시작'}
              </button>
              <button onClick={() => selectPersona('50s')} disabled={loggingIn !== null} style={personaButtonStyle}>
                {loggingIn !== null ? '입장 중... 🌿' : '👩🏻 전미경 (50대 여성) 페르소나 시작'}
              </button>
              <button onClick={() => selectPersona('60s')} disabled={loggingIn !== null} style={{ ...personaButtonStyle, marginBottom: '0' }}>
                {loggingIn !== null ? '입장 중... 🌿' : '👨🏻‍🦳 김영수 (60대 남성) 페르소나 시작'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

// 안내 및 기능 소개 팝업 모달 컴포넌트
const InfoModal: React.FC<{ title: string; desc: string; icon: string; onClose: () => void }> = ({ title, desc, icon, onClose }) => {
  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(27, 46, 37, 0.6)',
        backdropFilter: 'blur(8px)',
        zIndex: 1000,
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
          maxWidth: '380px',
          width: '100%',
          padding: '24px',
          boxShadow: '0 20px 48px rgba(0,0,0,0.15)',
          position: 'relative',
          textAlign: 'center'
        }}
      >
        <div style={{ fontSize: '48px', marginBottom: '12px' }}>{icon}</div>
        <h3 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--green-dark)', marginBottom: '8px' }}>{title}</h3>
        <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: '1.6', marginBottom: '20px' }}>{desc}</p>
        <button
          className="btn-healing"
          onClick={onClose}
          style={{ height: '40px', fontSize: '13px', width: '100%' }}
        >
          확인
        </button>
      </div>
    </div>
  );
};

// 홈 화면 컴포넌트
const HomeTab: React.FC<{ 
  onNavigateToTab: (tab: 'chat' | 'farms' | 'perspective' | 'journal') => void;
  onShowInfo: (title: string, desc: string, icon: string) => void;
}> = ({ onNavigateToTab, onShowInfo }) => {
  return (
    <div className="home-container">
      {/* 웰컴 섹션 */}
      <div className="home-welcome">
        <h2>어서오세요,<br />당신의 마음을 위한 공간입니다.</h2>
        <p>오늘 하루, 어떤 감정이 당신을 스쳐갔나요?</p>
      </div>

      {/* Start AI Counseling 메인 배너 */}
      <button 
        className="home-cta-card" 
        onClick={() => onNavigateToTab('chat')}
      >
        <div className="home-cta-title">💬 Start AI Counseling</div>
        <div className="home-cta-sub">당신의 이야기를 편안하게 들려주세요</div>
      </button>

      {/* 오늘의 영감 */}
      <div className="inspiration-card">
        <div className="inspiration-icon-wrapper">✨</div>
        <div className="inspiration-content">
          <span className="inspiration-label">오늘의 영감</span>
          <span className="inspiration-quote">
            "가장 어두운 밤에도 별은 빛납니다. 당신의 내면에도 그 빛이 존재합니다."
          </span>
        </div>
      </div>

      {/* 자주 찾는 공간 */}
      <div>
        <h3 className="home-section-title">자주 찾는 공간</h3>
        <div className="spaces-grid">
          <div 
            className="space-card" 
            onClick={() => onNavigateToTab('chat')}
          >
            <div className="space-icon-wrapper" style={{ background: '#ffeef0', color: '#ff6b6b' }}>🧠</div>
            <div className="space-info">
              <span className="space-name">AI 상담</span>
              <span className="space-sub">(AI Counseling)</span>
            </div>
          </div>
          
          <div 
            className="space-card" 
            onClick={() => onNavigateToTab('perspective')}
          >
            <div className="space-icon-wrapper" style={{ background: '#e6f9ff', color: '#00b4d8' }}>🔄</div>
            <div className="space-info">
              <span className="space-name">관점 전환</span>
              <span className="space-sub">(Perspective Shift)</span>
            </div>
          </div>

          <div 
            className="space-card" 
            onClick={() => onNavigateToTab('farms')}
          >
            <div className="space-icon-wrapper" style={{ background: '#eafaf1', color: '#2d6a4f' }}>🌿</div>
            <div className="space-info">
              <span className="space-name">치유 공간</span>
              <span className="space-sub">(Healing Spaces)</span>
            </div>
          </div>

          <div 
            className="space-card" 
            onClick={() => onNavigateToTab('journal')}
          >
            <div className="space-icon-wrapper" style={{ background: '#f5f0ff', color: '#7c6fcd' }}>📖</div>
            <div className="space-info">
              <span className="space-name">인생 기록</span>
              <span className="space-sub">(Life Journal)</span>
            </div>
          </div>
        </div>
      </div>

      {/* 오늘의 추천 힐링 스폿 */}
      <div>
        <h3 className="home-section-title">오늘의 추천 힐링 스폿</h3>
        <div className="spots-scroll">
          
          <div 
            className="spot-card"
            style={{ backgroundImage: `url(https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?q=80&w=300&auto=format&fit=crop)` }}
            onClick={() => onShowInfo(
              '자연의 소리: 고요한 호숫가 산책',
              '새벽 안개 속에서 고요하게 일렁이는 호수의 잔잔한 물결 소리와 숲속 새들의 청아한 지저귐을 고스란히 담았습니다. 눈을 지그시 감고 호숫가 자갈길을 걷는 소리를 상상하며 3분간 깊은 호흡을 들이마시고 내쉬어 보세요. 🌊',
              '🌊'
            )}
          >
            <div className="spot-image-overlay">
              <span className="spot-tag">자연의 소리</span>
              <span className="spot-title">고요한 호숫가 산책</span>
            </div>
          </div>

          <div 
            className="spot-card"
            style={{ backgroundImage: `url(https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?q=80&w=300&auto=format&fit=crop)` }}
            onClick={() => onShowInfo(
              '명상 가이드: 아침 이슬 명상',
              '싱그러운 아침 이슬을 가득 머금은 초록색 편백나무 잎사귀의 맑고 상쾌한 숲내음을 명상 가이드 음성과 함께 즐깁니다. 마음을 차분히 내려놓고 온전한 쉼에 다가가는 아침 기상 루틴 브레스 명상입니다. 🌿',
              '🧘‍♀️'
            )}
          >
            <div className="spot-image-overlay">
              <span className="spot-tag">명상 가이드</span>
              <span className="spot-title">아침 이슬 명상</span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

// 메인 치유의 방 앱 조립체
const HealingRoomApp: React.FC = () => {
  const {
    messages,
    isTyping,
    step,
    user,
    logout,
    sendWorry,
    sendFollowup
  } = useFlow();

  const [activeTab, setActiveTab] = useState<'home' | 'chat' | 'farms' | 'result' | 'perspective' | 'journal'>(() => {
    const hash = window.location.hash.replace('#', '');
    return ['home', 'chat', 'farms', 'result', 'perspective', 'journal'].includes(hash) ? hash as any : 'home';
  });

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '');
      if (['home', 'chat', 'farms', 'result', 'perspective', 'journal'].includes(hash)) {
        setActiveTab(hash as any);
      } else if (!hash) {
        setActiveTab('home');
      }
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const navigateToTab = (tab: 'home' | 'chat' | 'farms' | 'result' | 'perspective' | 'journal') => {
    if (tab !== activeTab) {
      window.history.pushState(null, '', `#${tab}`);
      setActiveTab(tab);
    }
  };
  const [selectedFarm, setSelectedFarm] = useState<Farm | null>(null);
  const [infoModalContent, setInfoModalContent] = useState<{ title: string; desc: string; icon: string } | null>(null);

  const [inputWorry, setInputWorry] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // 대화 추가 시 자동 스크롤 하단 이동
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping, activeTab]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    const minLen = step === 'followup' ? 2 : 10;
    if (inputWorry.trim().length >= minLen && !sending) {
      setSending(true);
      if (step === 'followup') {
        await sendFollowup(inputWorry);
      } else {
        await sendWorry(inputWorry);
      }
      setInputWorry('');
      setSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      const minLen = step === 'followup' ? 2 : 10;
      if (inputWorry.trim().length >= minLen) {
        handleSend(e);
      }
    }
  };

  // 고민 입력 필드 활성화 여부 (최초 고민 입력 step1 + 추천 이후 추가질문 followup)
  const isInputActive = step === 'step1' || step === 'followup';

  // 비로그인 사용자에게는 전용 로그인 화면 노출
  if (!user) {
    return <LoginScreen />;
  }

  return (
    <div className="chat-container">
      
      {/* 1. 헤더 영역 (홈가기 및 햄버거 아이콘 포함) */}
      <header className="chat-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {activeTab !== 'home' ? (
            <button
              onClick={() => navigateToTab('home')}
              title="홈으로 돌아가기"
              style={{
                border: 'none',
                background: 'none',
                fontSize: '20px',
                cursor: 'pointer',
                color: 'var(--green-dark)',
                display: 'flex',
                alignItems: 'center',
                padding: '4px'
              }}
            >
              🏠
            </button>
          ) : (
            <span style={{ fontSize: '20px', color: 'var(--green-dark)', padding: '4px', cursor: 'default' }}>☰</span>
          )}
          <h1 style={{ fontSize: activeTab === 'home' ? '18px' : '17px' }}>
            {activeTab === 'home' && 'Healing Mind Room'}
            {activeTab === 'chat' && '🌿 마음 치유의 방'}
            {activeTab === 'farms' && '🏕️ 치유장소'}
            {activeTab === 'result' && '👤 마이 프로필'}
            {activeTab === 'perspective' && '🔄 관점 전환 훈련'}
            {activeTab === 'journal' && '📖 인생 기록 다이어리'}
          </h1>
        </div>
        
        {user && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', fontWeight: 700 }}>
            <img 
              src={user.avatarUrl} 
              alt="Profile" 
              style={{
                width: '24px',
                height: '24px',
                borderRadius: '50%',
                background: 'var(--green-pale)'
              }}
            />
            <span style={{ color: 'var(--green-dark)' }}>{user.name}</span>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                window.location.hash = '';
                logout();
              }}
              style={{
                border: 'none',
                background: 'none',
                color: 'var(--accent-color)',
                cursor: 'pointer',
                fontWeight: 700,
                fontSize: '11px',
                marginLeft: '4px',
                position: 'relative',
                zIndex: 50,
                pointerEvents: 'auto',
                padding: '4px 8px'
              }}
            >
              로그아웃
            </button>
          </div>
        )}
      </header>

      {/* 2. 메인 콘텐츠 영역 */}
      <div className="main-content-area">
        {activeTab === 'home' && (
          <HomeTab 
            onNavigateToTab={(tab) => navigateToTab(tab)} 
            onShowInfo={(title, desc, icon) => setInfoModalContent({ title, desc, icon })} 
          />
        )}

        {activeTab === 'chat' && (
          <div className="tab-content" style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
            {/* 대화 말풍선 스크롤 영역 */}
            <div className="chat-messages">
              {messages.map((msg) => (
                <MessageItem key={msg.id} message={msg} />
              ))}
              
              {/* 타이핑 효과 피드백 */}
              {isTyping && (
                <div className="chat-bubble bot">
                  <div className="typing-dots">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              )}

              {/* 스크롤 앵커 */}
              <div ref={messagesEndRef} />
            </div>

            {/* 최하단 입력 패널 (Step 1 고민 수집 시에만 개방) */}
            <form onSubmit={handleSend} className="chat-input-panel">
              <input
                type="text"
                className="chat-input"
                value={inputWorry}
                onChange={(e) => setInputWorry(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={!isInputActive || sending}
                placeholder={
                  step === 'login'
                    ? "소셜 로그인을 대기 중입니다..."
                    : step === 'followup'
                    ? "더 궁금한 점이 있으면 자유롭게 물어보세요 🌿"
                    : isInputActive 
                    ? "여기에 마음속 고민을 10자 이상 적어주세요..." 
                    : "대화창 내의 가이드에 맞춰 진행해 주세요 💚"
                }
              />
              <button
                type="submit"
                className="btn-send"
                disabled={!isInputActive || inputWorry.trim().length < (step === 'followup' ? 2 : 10) || sending}
              >
                {sending ? '...' : '➔'}
              </button>
            </form>
          </div>
        )}

        {activeTab === 'farms' && (
          <FarmsTab onSelectFarm={(farm) => setSelectedFarm(farm)} />
        )}

        {activeTab === 'result' && (
          <ResultTab onSelectFarm={(farm) => setSelectedFarm(farm)} />
        )}

        {activeTab === 'perspective' && (
          <PerspectiveTab />
        )}

        {activeTab === 'journal' && (
          <JournalTab />
        )}
      </div>

      {/* 3. 하단 네비게이션 바 */}
      <nav className="bottom-nav">
        <button 
          onClick={() => navigateToTab('home')} 
          className={`nav-item ${activeTab === 'home' ? 'active' : ''}`}
        >
          <span className="nav-icon">🏠</span>
          <span>홈</span>
        </button>
        <button 
          onClick={() => navigateToTab('chat')} 
          className={`nav-item ${activeTab === 'chat' ? 'active' : ''}`}
        >
          <span className="nav-icon">💬</span>
          <span>AI 치유방</span>
        </button>
        <button 
          onClick={() => navigateToTab('farms')} 
          className={`nav-item ${activeTab === 'farms' ? 'active' : ''}`}
        >
          <span className="nav-icon">🏕️</span>
          <span>치유장소</span>
        </button>
        <button 
          onClick={() => navigateToTab('result')} 
          className={`nav-item ${activeTab === 'result' ? 'active' : ''}`}
        >
          <span className="nav-icon">💌</span>
          <span>마음 처방전</span>
        </button>
      </nav>

      {/* 상세 팝업 모달 공통 렌더러 */}
      {selectedFarm && (
        <FarmDetailModal farm={selectedFarm} onClose={() => setSelectedFarm(null)} />
      )}

      {/* 기능 안내 공통 팝업 모달 */}
      {infoModalContent && (
        <InfoModal 
          title={infoModalContent.title} 
          desc={infoModalContent.desc} 
          icon={infoModalContent.icon} 
          onClose={() => setInfoModalContent(null)} 
        />
      )}

    </div>
  );
};

function App() {
  return (
    <FlowProvider>
      <HealingRoomApp />
    </FlowProvider>
  );
}

export default App;

