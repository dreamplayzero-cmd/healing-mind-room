import React, { createContext, useContext, useState, useEffect } from 'react';
import type { Farm, WaveEstimateResult, EmotionAnalysisResult, User, Message } from '../types';
import { estimateWaves } from '../utils/waveEstimator';
import { analyzeWorry } from '../utils/emotionAnalyzer';
import { matchFarms } from '../utils/matcher';
import { getMatchingFarms } from '../utils/firebase';
import counselResponses from '../data/counsel_responses.json';

export type FlowStep = 'login' | 'step1' | 'step2' | 'loading' | 'step3' | 'followup';

interface FlowContextType {
  step: FlowStep;
  user: User | null;
  selectedAge: '30s' | '40s' | '50s' | '60s' | '';
  selectedWorryCategory: string;
  worryText: string;
  fatigueScore: number;
  sleepStatus: number;
  tensionLevel: number;
  waves: WaveEstimateResult | null;
  nlpResult: EmotionAnalysisResult | null;
  matchedFarms: Farm[];
  
  // 챗봇 대화 관련 상태 및 함수
  messages: Message[];
  isTyping: boolean;
  
  login: (provider: 'kakao' | 'google', personaId?: '30s' | '40s' | '50s' | '60s') => Promise<void>;
  logout: () => void;
  selectAge: (age: '30s' | '40s' | '50s' | '60s') => Promise<void>;
  selectWorryCategory: (category: string) => Promise<void>;
  sendWorry: (text: string) => Promise<void>;
  sendDiagnostic: (fatigue: number, sleep: number, tension: number) => Promise<void>;
  resetFlow: () => void;
  selectPerspective: (target: string) => Promise<void>;
  skipPerspective: () => Promise<void>;
  sendFollowup: (text: string) => Promise<void>;
}

const FlowContext = createContext<FlowContextType | undefined>(undefined);

export const FlowProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [step, setStep] = useState<FlowStep>('login');
  const [user, setUser] = useState<User | null>(null);
  const [selectedAge, setSelectedAge] = useState<'30s' | '40s' | '50s' | '60s' | ''>('');
  const [selectedWorryCategory, setSelectedWorryCategory] = useState<string>('');
  const [worryText, setWorryText] = useState<string>('');
  
  // 자가진단 상태
  const [fatigueScore, setFatigueScore] = useState<number>(3);
  const [sleepStatus, setSleepStatus] = useState<number>(0);
  const [tensionLevel, setTensionLevel] = useState<number>(0);
  
  // 결과 상태
  const [waves, setWaves] = useState<WaveEstimateResult | null>(null);
  const [nlpResult, setNlpResult] = useState<EmotionAnalysisResult | null>(null);
  const [matchedFarms, setMatchedFarms] = useState<Farm[]>([]);

  // 챗봇 상태
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState<boolean>(false);

  // 고유 메시지 ID 생성기
  const createId = () => Math.random().toString(36).substring(2, 9);

  // 1. 초기 웰컴 메시지 기동
  useEffect(() => {
    const savedSession = localStorage.getItem('healing_session');
    if (savedSession) {
      try {
        const parsedUser = JSON.parse(savedSession);
        setUser(parsedUser);
        setStep('step1');
        
        // 로그인 완료된 유저 복구 시 환영 챗 기동
        setMessages([
          {
            id: createId(),
            sender: 'bot',
            type: 'text',
            content: `마음 치유의 방에 오신 것을 환영합니다 🌿`,
            timestamp: new Date()
          },
          {
            id: createId(),
            sender: 'bot',
            type: 'text',
            content: `안녕하세요, ${parsedUser.name} 님! 오늘 당신의 지친 마음을 위로해 드릴게요. 먼저 연령대를 알려주시겠어요?`,
            timestamp: new Date()
          },
          {
            id: createId(),
            sender: 'bot',
            type: 'age',
            content: '',
            timestamp: new Date()
          }
        ]);
      } catch (e) {
        localStorage.removeItem('healing_session');
        initWelcomeMessages();
      }
    } else {
      initWelcomeMessages();
    }
  }, []);

  const initWelcomeMessages = () => {
    setMessages([
      {
        id: createId(),
        sender: 'bot',
        type: 'text',
        content: `마음 치유의 방에 오신 것을 환영합니다 🌿`,
        timestamp: new Date()
      },
      {
        id: createId(),
        sender: 'bot',
        type: 'text',
        content: `당신만을 위한 조용하고 평온한 치유공간입니다. 소셜 로그인을 통해 3초 만에 안전하게 입장하세요.`,
        timestamp: new Date()
      },
      {
        id: createId(),
        sender: 'bot',
        type: 'login',
        content: '',
        timestamp: new Date()
      }
    ]);
  };

  // 공통 로그인 성공 완료 처리 함수
  const completeLoginFlow = (loggedInUser: User, provider: 'kakao' | 'google', personaId?: '30s' | '40s' | '50s' | '60s') => {
    setUser(loggedInUser);
    localStorage.setItem('healing_session', JSON.stringify(loggedInUser));
    
    setStep('step1');

    if (personaId) {
      // 페르소나 로그인 시 연령대 선택 생략
      setSelectedAge(personaId as any);

      setMessages((prev) => [
        ...prev.filter(m => m.type !== 'login'),
        {
          id: createId(),
          sender: 'user',
          type: 'text',
          content: `${personaId === '30s' ? '최지연 (30대 여성)' : personaId === '40s' ? '이정우 (40대 남성)' : personaId === '50s' ? '전미경 (50대 여성)' : '김영수 (60대 남성)'} 페르소나 시작`,
          timestamp: new Date()
        },
        {
          id: createId(),
          sender: 'bot',
          type: 'text',
          content: `반갑습니다, ${loggedInUser.name} 님! 🌿\n오늘 마음의 짐을 정리해 줄 어울리는 치유공간을 찾아드리겠습니다.`,
          timestamp: new Date()
        },
        {
          id: createId(),
          sender: 'bot',
          type: 'text',
          content: `어떤 고민이 있으신가요? 솔직한 마음을 들려주세요. 함께 돌보아 드릴게요.`,
          timestamp: new Date()
        },
        {
          id: createId(),
          sender: 'bot',
          type: 'worryCategory',
          content: '',
          timestamp: new Date()
        }
      ]);
    } else {
      // 일반 소셜 로그인 시 기존 흐름 유지
      setMessages((prev) => [
        ...prev.filter(m => m.type !== 'login'),
        {
          id: createId(),
          sender: 'user',
          type: 'text',
          content: `${provider === 'kakao' ? '카카오' : '구글'} 간편 로그인 완료`,
          timestamp: new Date()
        },
        {
          id: createId(),
          sender: 'bot',
          type: 'text',
          content: `반갑습니다, ${loggedInUser.name} 님! 🌿\n오늘 마음의 짐을 정리해 줄 어울리는 치유공간을 찾아드리겠습니다.`,
          timestamp: new Date()
        },
        {
          id: createId(),
          sender: 'bot',
          type: 'text',
          content: `먼저 ${loggedInUser.name} 님의 연령대를 알려주시겠어요?`,
          timestamp: new Date()
        },
        {
          id: createId(),
          sender: 'bot',
          type: 'age',
          content: '',
          timestamp: new Date()
        }
      ]);
    }
  };

  // 카카오 OAuth 인가 코드(?code=xxx) 감지 및 토큰 교환 처리
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const code = searchParams.get('code');
    const enableRealSocial = import.meta.env.VITE_ENABLE_REAL_SOCIAL === 'true';
    const kakaoClientId = import.meta.env.VITE_KAKAO_CLIENT_ID || "";

    if (code && enableRealSocial && kakaoClientId && kakaoClientId !== 'your_kakao_client_id_here') {
      const processKakaoLogin = async () => {
        try {
          console.log("📡 인가 코드 감지, 카카오 토큰 요청 중... code:", code);
          const redirectUri = window.location.origin;

          // Vite Proxy (/kauth)를 사용하여 CORS 우회 요청
          const tokenResponse = await fetch('/kauth/oauth/token', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8'
            },
            body: new URLSearchParams({
              grant_type: 'authorization_code',
              client_id: kakaoClientId,
              redirect_uri: redirectUri,
              code: code
            })
          });

          if (!tokenResponse.ok) {
            throw new Error(`Token request failed with status ${tokenResponse.status}`);
          }

          const tokenData = await tokenResponse.json();
          const accessToken = tokenData.access_token;
          console.log("✅ 토큰 획득 완료, 사용자 정보 가져오는 중...");

          // Vite Proxy (/kapi)를 사용하여 사용자 정보 요청
          const userResponse = await fetch('/kapi/v2/user/me', {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8'
            }
          });

          if (!userResponse.ok) {
            throw new Error(`User info request failed with status ${userResponse.status}`);
          }

          const userData = await userResponse.json();
          const properties = userData.properties;
          const kakaoAccount = userData.kakao_account;
          const profile = kakaoAccount?.profile;

          // 다양한 카카오 프로필 이미지 경로 및 기본 아바타 폴백 보완
          let avatarUrl = profile?.profile_image_url || 
                          profile?.thumbnail_image_url || 
                          properties?.profile_image || 
                          properties?.thumbnail_image || 
                          'https://api.dicebear.com/7.x/adventurer/svg?seed=kakao';

          // http:// 주소를 https:// 주소로 변환하여 Mixed Content에 의한 브라우저 로드 차단 원천 방어
          if (avatarUrl.startsWith('http://')) {
            avatarUrl = avatarUrl.replace('http://', 'https://');
          }

          const loggedInUser: User = {
            name: profile?.nickname || properties?.nickname || '카카오 사용자',
            email: kakaoAccount?.email || 'kakao_user@example.com',
            avatarUrl: avatarUrl,
            provider: 'kakao'
          };

          // 성공 로그인 상태 저장
          completeLoginFlow(loggedInUser, 'kakao');
        } catch (err: any) {
          console.error("❌ 카카오 REST API 로그인 실패, 목업으로 폴백합니다:", err);
          // 비개발자 사용자의 디버깅을 위해 구체적인 오류 원인 alert 경고창 노출
          alert(`[카카오 로그인 연동 실패 알림]\n카카오 로그인은 성공했으나, 사용자 정보를 가져오는 도중 에러가 발생했습니다.\n\n오류 내용: ${err.message || err}\n\n*원인 분석: 백엔드 서버가 없는 정적 웹앱 환경에서는 카카오의 보안 정책(CORS)에 의해 REST API 토큰 요청이 브라우저에서 차단될 수 있습니다. 안전을 위해 가상 사용자('최지연')로 연결합니다.`);
          // 실패 시 안전하게 Mock 유저로 폴백
          const fallbackUser: User = {
            name: '30대 사용자',
            email: '30s@example.com',
            avatarUrl: 'https://api.dicebear.com/7.x/adventurer/svg?seed=30s&skinColor=f2d3b1',
            provider: 'kakao'
          };
          completeLoginFlow(fallbackUser, 'kakao', '30s');
        } finally {
          // URL 파라미터에서 code 제거하여 깨끗하게 정돈
          const cleanUrl = window.location.pathname + window.location.hash;
          window.history.replaceState({}, document.title, cleanUrl);
        }
      };

      processKakaoLogin();
    }
  }, []);

  // 2. 소셜 로그인 연동 (실제 Kakao REST API 연동 및 Mock 폴백)
  const login = async (provider: 'kakao' | 'google', personaId?: '30s' | '40s' | '50s' | '60s') => {
    const enableRealSocial = import.meta.env.VITE_ENABLE_REAL_SOCIAL === 'true';
    const kakaoClientId = import.meta.env.VITE_KAKAO_CLIENT_ID || "";
    
    if (provider === 'kakao' && enableRealSocial && kakaoClientId && kakaoClientId !== 'your_kakao_client_id_here') {
      console.log("📡 카카오 REST OAuth 로그인 시작 (리다이렉션)...");
      const redirectUri = window.location.origin;
      const kakaoAuthUrl = `https://kauth.kakao.com/oauth/authorize?client_id=${kakaoClientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code`;
      
      // 카카오 로그인 인증창으로 페이지 리다이렉트
      window.location.href = kakaoAuthUrl;
      return; // 리다이렉트되므로 아래 코드는 타지 않음
    }

    // 구글 로그인 또는 실제 모드 꺼짐 / 키 누락 시 Mock 로그인 처리
    await new Promise((resolve) => setTimeout(resolve, 1000));
    
    let personaName = '테스트 사용자';
    let personaAvatar = 'https://api.dicebear.com/7.x/adventurer/svg?seed=user';
    
    if (personaId === '30s') {
      personaName = '최지연 (30대 여성)';
      personaAvatar = 'https://api.dicebear.com/7.x/adventurer/svg?seed=jiyeon&skinColor=f2d3b1';
    } else if (personaId === '40s') {
      personaName = '이정우 (40대 남성)';
      personaAvatar = 'https://api.dicebear.com/7.x/adventurer/svg?seed=jungwoo&skinColor=f2d3b1';
    } else if (personaId === '50s') {
      personaName = '전미경 (50대 여성)';
      personaAvatar = 'https://api.dicebear.com/7.x/adventurer/svg?seed=mikyung_50_v9&skinColor=f2d3b1&hair=long05&hairColor=4a3123&glasses=variant04';
    } else if (personaId === '60s') {
      personaName = '김영수 (60대 남성)';
      // 60대 김영수 어르신: 하얀 피부, 하얀 백발(hairColor=e6e6e6) 추가
      personaAvatar = 'https://api.dicebear.com/7.x/adventurer/svg?seed=youngsoo&skinColor=f2d3b1&hairColor=e6e6e6,b6b6b6';
    }

    const loggedInUser: User = personaId 
      ? {
          name: personaName,
          email: `${personaId}@example.com`,
          avatarUrl: personaAvatar,
          provider: provider
        }
      : {
          name: '일반 로그인 사용자',
          email: 'user@example.com',
          avatarUrl: 'https://api.dicebear.com/7.x/adventurer/svg?seed=general',
          provider: provider
        };

    completeLoginFlow(loggedInUser, provider, personaId);
  };

  // 3. 로그아웃
  const logout = () => {
    window.location.hash = '';
    setUser(null);
    localStorage.removeItem('healing_session');
    
    setSelectedAge('');
    setSelectedWorryCategory('');
    setWorryText('');
    setFatigueScore(3);
    setSleepStatus(0);
    setTensionLevel(0);
    setWaves(null);
    setNlpResult(null);
    setMatchedFarms([]);
    
    setStep('login');
    initWelcomeMessages();
  };

  // 4. 연령대 선택 처리
  const selectAge = async (age: '30s' | '40s' | '50s' | '60s') => {
    setSelectedAge(age);
    const ageLabels: Record<string, string> = {
      '30s': '30대',
      '40s': '40대',
      '50s': '50대',
      '60s': '60대 이상'
    };

    // 유저의 말풍선 응답 추가
    setMessages((prev) => [
      ...prev.filter(m => m.type !== 'age'),
      {
        id: createId(),
        sender: 'user',
        type: 'text',
        content: `${ageLabels[age]}입니다.`,
        timestamp: new Date()
      }
    ]);

    // 봇 타이핑 애니메이션 연출
    setIsTyping(true);
    await new Promise((resolve) => setTimeout(resolve, 800));
    setIsTyping(false);

    setMessages((prev) => [
      ...prev,
      {
        id: createId(),
        sender: 'bot',
        type: 'text',
        content: `어떤 고민이 있으신가요? 솔직한 마음을 들려주세요. 함께 돌보아 드릴게요.`,
        timestamp: new Date()
      },
      {
        id: createId(),
        sender: 'bot',
        type: 'worryCategory',
        content: '',
        timestamp: new Date()
      }
    ]);
  };

  const selectWorryCategory = async (category: string) => {
    setSelectedWorryCategory(category);

    // 유저의 말풍선 응답 추가
    setMessages((prev) => [
      ...prev.filter(m => m.type !== 'worryCategory'),
      {
        id: createId(),
        sender: 'user',
        type: 'text',
        content: `${category} 고민이 있습니다.`,
        timestamp: new Date()
      }
    ]);

    // 봇 타이핑 애니메이션 연출
    setIsTyping(true);
    await new Promise((resolve) => setTimeout(resolve, 800));
    setIsTyping(false);

    setMessages((prev) => [
      ...prev,
      {
        id: createId(),
        sender: 'bot',
        type: 'text',
        content: `선택하신 고민 카테고리에 대해 좀 더 들려주세요. 상세한 마음의 어려움을 아래 입력창에 10자 이상 자유롭게 적어 전송해 주시면 세심하게 분석해 드릴게요. 🌿`,
        timestamp: new Date()
      }
    ]);
  };


  // 5. 고민 텍스트 전송 및 NLP 감정 진단 편지
  const sendWorry = async (text: string) => {
    setWorryText(text);

    // 유저 고민 말풍선 추가
    setMessages((prev) => [
      ...prev,
      {
        id: createId(),
        sender: 'user',
        type: 'text',
        content: text,
        timestamp: new Date()
      }
    ]);

    setIsTyping(true);
    // 고민 NLP 분석 연동
    const emotionResult = await analyzeWorry(text, selectedAge || '30s');
    setNlpResult(emotionResult);
    
    await new Promise((resolve) => setTimeout(resolve, 1200));
    setIsTyping(false);

    setMessages((prev) => [
      ...prev,
      {
        id: createId(),
        sender: 'bot',
        type: 'text',
        content: `고민을 신중히 들여다보았습니다. 마음이 많이 피곤하셨을 것 같아요. 분석 결과와 따뜻한 위로 편지를 보냅니다.`,
        timestamp: new Date()
      },
      {
        id: createId(),
        sender: 'bot',
        type: 'text',
        content: `💌 위로의 편지\n\n"${emotionResult.comfortMessage}"\n\n(분석 키워드: ${emotionResult.keywords.map(k=>`#${k}`).join(' ')})`,
        timestamp: new Date()
      },
      {
        id: createId(),
        sender: 'bot',
        type: 'text',
        content: `더 정확한 맞춤 치유처 추천을 위해, 현재 느끼는 신체/정신 피로도를 아래 위젯에 입력해 전송해 주세요.`,
        timestamp: new Date()
      },
      {
        id: createId(),
        sender: 'bot',
        type: 'diagnostic',
        content: '',
        timestamp: new Date()
      }
    ]);

    setStep('step2');
  };

  // 6. 자가진단 위젯 전송 및 최종 치유농장 스코어링 추천
  const sendDiagnostic = async (
    fatigue: number,
    sleep: number,
    tension: number
  ) => {
    setFatigueScore(fatigue);
    setSleepStatus(sleep);
    setTensionLevel(tension);

    // 유저 응답 추가
    setMessages((prev) => [
      ...prev.filter(m => m.type !== 'diagnostic'),
      {
        id: createId(),
        sender: 'user',
        type: 'text',
        content: `피로도 ${fatigue}점, 수면 컨디션 ${sleep}점, 심리 긴장도 ${tension}점 상태로 자가진단을 완료했습니다.`,
        timestamp: new Date()
      }
    ]);

    // 로딩 상태 전환 연출
    setStep('loading');
    
    // 뇌파 추정기 구동
    const waveResult = estimateWaves({
      fatigueScore: fatigue,
      sleepStatus: sleep,
      tensionLevel: tension
    });
    setWaves(waveResult);

    // 1.5초 동안 심호흡 가이드 봇 대답 기동
    setMessages((prev) => [
      ...prev,
      {
        id: createId(),
        sender: 'bot',
        type: 'typing',
        content: '가볍게 숨을 들이마시고... 천천히 내쉬세요. 마음의 뇌파 상태를 분석하고 있습니다...',
        timestamp: new Date()
      }
    ]);

    const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
    await delay(1500);

    // 뇌파 게이지 결과 박스(result) 추가 및 위로 메시지 노출
    const thetaPercent = Math.round(waveResult.theta * 100);
    let waveMessage = "";
    if (thetaPercent >= 80) {
      waveMessage = "정말 많이 버티셨어요. 지금 당장 쉬어도 괜찮아요. 아래 치유공간을 추천드려요 🌿";
    } else if (thetaPercent >= 60) {
      waveMessage = "많이 지치셨군요. 잠깐이라도 자연 속에서 숨을 고르는 시간이 필요할 것 같아요 🌿";
    } else if (thetaPercent <= 40) {
      waveMessage = "마음이 비교적 안정된 상태예요. 이 여유로운 마음으로 자연을 느껴보세요 🌿";
    } else {
      waveMessage = "균형을 찾고 계시는 것 같아요. 자연 속 산책이 그 균형을 더 단단하게 해줄 거예요 🌿";
    }

    // 로딩 메시지 지우고 뇌파 게이지 버블 생성
    setMessages((prev) => [
      ...prev.filter(m => m.type !== 'typing'),
      {
        id: createId(),
        sender: 'bot',
        type: 'result',
        content: waveMessage,
        timestamp: new Date(),
        data: {
          waves: waveResult
        }
      }
    ]);

    setIsTyping(true);

    // Firestore/로컬폴백을 통해 실시간 카테고리별 농장 30개 로드 시작
    let recommendedFarms: Farm[] = [];
    try {
      const ageToCategoryId: Record<string, number> = {
        '30s': 1,
        '40s': 2,
        '50s': 3,
        '60s': 4
      };
      const categoryId = ageToCategoryId[selectedAge || '30s'] || 1;
      const candidates = await getMatchingFarms(categoryId);

      // 30개 후보군 중 최종 추천 3개 매칭 (고민 유형을 검색어 키워드로 주입)
      recommendedFarms = matchFarms(candidates, {
        selectedAge: selectedAge || '30s',
        dominantWave: waveResult.dominant,
        keywords: selectedWorryCategory ? [selectedWorryCategory] : []
      });
    } catch (matchError) {
      console.error("❌ 농장 매칭 중 오류 발생:", matchError);
      recommendedFarms = [];
    }
    setMatchedFarms(recommendedFarms);

    // AI 5단계 응답 순차 표시 및 최종 추천 농장 연출까지 타이핑 로더 유지
    setIsTyping(true);

    // 하드코딩된 이름을 실제 유저 이름 및 올바른 한글 조사로 치환하는 헬퍼
    const cleanName = user ? user.name.split(' ')[0] : '사용자';
    const replaceDynamicNames = (text: string, name: string) => {
      if (!text) return '';
      return text
        .replace(/수진씨는/g, `${name}님은`)
        .replace(/정훈님은/g, `${name}님은`)
        .replace(/미경님은/g, `${name}님은`)
        .replace(/수진씨가/g, `${name}님이`)
        .replace(/정훈님이/g, `${name}님이`)
        .replace(/미경님이/g, `${name}님이`)
        .replace(/수진씨를/g, `${name}님을`)
        .replace(/정훈님을/g, `${name}님을`)
        .replace(/미경님을/g, `${name}님을`)
        .replace(/수진씨/g, `${name}님`)
        .replace(/정훈님/g, `${name}님`)
        .replace(/미경님/g, `${name}님`);
    };

    try {
      const ageLabelMap: Record<string, string> = {
        '20s': '30대',
        '30s': '30대',
        '40s': '40대',
        '50s': '50대',
        '60s': '60대'
      };
      const ageLabel = ageLabelMap[selectedAge || '30s'] || '30대';
      const responsesDb = (counselResponses as any).default || counselResponses;
      let responseData = responsesDb[ageLabel]?.[selectedWorryCategory];

      // 배열일 경우 랜덤으로 하나 선택 (3가지 변주 지원)
      if (Array.isArray(responseData)) {
        responseData = responseData[Math.floor(Math.random() * responseData.length)];
      }

      if (responseData) {
        // [신규] 사용자가 입력했던 고민을 5단계 답변 직전에 한 번 더 노출
        if (worryText) {
          setMessages((prev) => [
            ...prev,
            {
              id: createId(),
              sender: 'user',
              type: 'text',
              content: worryText,
              timestamp: new Date()
            }
          ]);
          await delay(500);
        }

        const responseSteps = [
          { label: '감정공감', text: responseData.감정공감 },
          { label: '상황분석', text: responseData.상황분석 },
          { label: '관점전환', text: responseData.관점전환 },
          { label: '행동제안', text: responseData.행동제안 },
          { label: '희망메시지', text: responseData.희망메시지 }
        ];

        for (let i = 0; i < responseSteps.length; i++) {
          await delay(1200); // 봇이 답변을 고민/작성하는 타이핑 딜레이

          const filteredText = replaceDynamicNames(responseSteps[i].text, cleanName);

          setMessages((prev) => [
            ...prev,
            {
              id: createId(),
              sender: 'bot',
              type: 'text',
              content: `[${responseSteps[i].label}] ${filteredText}`,
              timestamp: new Date()
            }
          ]);
          
          await delay(300); // 말풍선 사이의 0.3초 쉬는 텀 (로딩은 계속 노출됨)
        }
      } else {
        console.warn(`⚠️ JSON에서 다음 키의 매칭 데이터를 찾지 못했습니다: 연령대 "${ageLabel}", 고민유형 "${selectedWorryCategory}"`);
      }
    } catch (counselError) {
      console.error("❌ 5단계 고민 상담 챗 연출 중 오류 발생:", counselError);
    }

    // [순서 변경] 5단계 답변 직후 → 관점 전환 버튼을 먼저 노출 (선택 사항)
    //   · 사용자가 관점 전환을 보거나(selectPerspective) 건너뛰면(skipPerspective)
    //     그 다음에 추가 질문 안내 → 치유농장 추천 카드(맨 마지막) 순으로 표시됩니다.
    try {
      await delay(800);
      setIsTyping(false); // 5단계 답변까지 모두 준비되면 로더 해제

      setMessages((prev) => [
        ...prev,
        {
          id: createId(),
          sender: 'bot',
          type: 'perspectiveButtons',
          content: '혹시 이 고민과 관련해 갈등이나 스트레스를 유발하는 상대방이 있나요? 원하시면 상대방의 눈으로 상황을 바라보는 관점 전환을 먼저 해볼 수 있어요. 필요 없으시면 건너뛰고 바로 추천을 받으셔도 됩니다. 🔄',
          timestamp: new Date()
        }
      ]);
    } catch (perspError) {
      console.error("❌ 관점 전환 버튼 버블 전송 중 오류 발생:", perspError);
      setIsTyping(false); // 에러 상황 발생 시에도 로더 해제 안전 보장
    }

    setStep('step3');
  };


  // 다시 시작하기
  const resetFlow = () => {
    setSelectedAge('');
    setSelectedWorryCategory('');
    setWorryText('');
    setFatigueScore(3);
    setSleepStatus(0);
    setTensionLevel(0);
    setWaves(null);
    setNlpResult(null);
    setMatchedFarms([]);
    
    setStep('step1');

    setMessages([
      {
        id: createId(),
        sender: 'bot',
        type: 'text',
        content: `처음부터 다시 진단을 시작합니다. ${user?.name || ''} 님의 연령대를 다시 알려주세요.`,
        timestamp: new Date()
      },
      {
        id: createId(),
        sender: 'bot',
        type: 'age',
        content: '',
        timestamp: new Date()
      }
    ]);
  };

  // [신규] 갈등 상대방 입장 재해석 관점 전환 함수
  const selectPerspective = async (target: string) => {
    // 유저 응답 메시지 추가 (기존 버튼 창 제거하고 유저 말풍선 띄움)
    setMessages((prev) => [
      ...prev.filter(m => m.type !== 'perspectiveButtons'),
      {
        id: createId(),
        sender: 'user',
        type: 'text',
        content: `상대방 [${target}]의 눈으로 보기`,
        timestamp: new Date()
      }
    ]);

    setIsTyping(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsTyping(false);

    // 4단계 관점 전환 결과 데이터 빌드
    let myView = "";
    let partnerView = "";
    let conflictAnalysis = "";
    let generationalUnderstanding = "";
    let fact = "";
    let positive = "";
    let action = "";

    const cleanName = user ? user.name.split(' ')[0] : '사용자';

    // 매칭 룰 정의 (전 연령 및 대상 맞춤 관점 전환 추천 로직 강화)
    if (target.includes('부모님')) {
      myView = `부모님의 과도한 간섭이나 조언이 나를 신뢰하지 못하는 불신감이나 독립성 침해로 느껴져 답답해하고 있습니다.`;
      partnerView = `험난한 세상 속에서 자녀가 시행착오나 실패 없이 안전하고 보장된 삶을 살기를 바라는 애정과 보호 본능이 있습니다. 다만 표현 방식이 과거 수직적 통제 형태로 표출되는 것입니다.`;
      conflictAnalysis = `자녀의 '자율성 욕구'와 부모의 '보장성(안전) 욕구'의 충돌입니다. 부모 입장에서는 여전히 자녀를 보호해야 할 미성숙한 존재로 파악하고 있어 의사소통 장벽이 생깁니다.`;
      generationalUnderstanding = `부모 세대(50~60대)는 고도 성장기와 외환 위기(IMF)를 거쳐 성실성과 안정성이 생존의 기본 지표였습니다. 반면 30대 자녀 세대는 저성장 시대 속에서 개인의 행복과 상호 존중을 더 지향하는 세대적 가치 차이가 존재합니다.`;
      fact = "부모님의 참견은 나를 무시하는 것이 아니라 불안에서 기인한 서툰 사랑의 표현입니다.";
      positive = "그 불안의 이면에는 내가 상처받지 않기를 바라는 깊은 애정이 숨어 있습니다.";
      action = "감정적으로 맞부딪히기보다, 나의 구체적인 계획을 담담하게 공유하며 안심시켜 드리는 대화를 시도해보세요.";
    } else if (target.includes('상사') || target.includes('동료')) {
      myView = `내 업무 페이스와 자율성이 과하게 통제받거나 비효율적인 소통을 강요당하고 있다고 느끼며, 심리적 압박감을 호소합니다.`;
      partnerView = `조직 책임자로서 전체 리스크와 데드라인을 완벽히 통제해야 한다는 긴장감이 큽니다. 업무 진행 가시성이 확보되지 않으면 불안을 느끼고 과도한 개입(마이크로매니징)을 선택하게 됩니다.`;
      conflictAnalysis = `업무 모니터링 강도에 대한 수용력 차이입니다. 결과물 중심의 신뢰 위임을 바라는 실무자와 중간 과정의 철저한 추적 및 대면 피드백을 바라는 상사의 방식 차이입니다.`;
      generationalUnderstanding = `상사 세대는 수직적 군대식 기업 문화 속에서 대면 커뮤니케이션과 상사의 지시에 절대적으로 부응하며 생존해 왔습니다. 반면 20~30대 실무자는 수평적 구조와 합리적 소통 표준을 중시하기 때문에 생기는 간극입니다.`;
      fact = "상사의 잦은 확인은 나를 불신해서가 아니라 본인의 업무 리스크 통제 불안 때문입니다.";
      positive = "선제적으로 진행 상황을 공유하면 상사의 불안이 낮아지고 나의 자율성도 확보될 수 있습니다.";
      action = "요청받기 전에 먼저 짤막한 중간 보고 메시지를 보내 상사에게 예측 가능성을 제공해보세요.";
    } else if (target.includes('자녀')) {
      myView = `자녀가 인생의 시행착오를 겪지 않도록 도움을 주고 싶으나, 내 조언을 잔소리로 치부하고 멀어지려 하는 모습에 섭섭함과 서운함을 느낍니다.`;
      partnerView = `자신이 온전한 성인으로 자립하여 책임을 지는 주체임을 증명하고 싶어 하며, 부모의 조언이 나의 무능력을 암시하거나 경계를 허무는 침입으로 받아들여 방어 태세를 취합니다.`;
      conflictAnalysis = `부모의 애정 어린 '개입 의지'와 자녀의 완전한 '독립 권리' 사이의 충돌입니다. 소통 방식이 쌍방 소통이 아닌 일방적 훈계 형태로 전달되어 관계의 서먹함을 증폭시킵니다.`;
      generationalUnderstanding = `조부모와 부모 밑에서 효도와 부모의 지도를 절대적 규범으로 수용하며 자란 이전 세대와 달리, 현재의 자녀 세대는 개성 존중, 수평적 대화, 개인 정보 및 사생활 영역 수호를 절대적 권리로 훈련받고 성장했습니다.`;
      fact = "자녀의 거부는 나를 미워해서가 아니라 자신의 독립적 공간을 지키려는 건강한 성장 과정입니다.";
      positive = "스스로 선택하고 책임지려는 자녀의 태도는 미래를 살아갈 중요한 생존 근육이 됩니다.";
      action = "조언이나 해결책 대신, 자녀의 결정을 믿고 한 걸음 뒤에서 응원하는 지지자의 역할로 포지션을 전환해보세요.";
    } else if (target.includes('배우자')) {
      myView = `가장 든든한 동반자가 나의 일상적 고단함과 감정의 깊이를 몰라주고 회피하거나 차갑게 대하는 것 같아 정서적 고립감과 섭섭함을 느끼고 있습니다.`;
      partnerView = `배우자 또한 가정 유지와 각자 역할 수행의 누적된 스트레스로 심리 에너지가 바닥나 있습니다. 대화를 피하거나 단순 해결책만 던지는 것은 상대를 거부하는 것이 아니라 자신의 한계에서 오는 방어 기제입니다.`;
      conflictAnalysis = `정서적 위로(공감)를 기대하는 욕구와 실질적 과제 해결(논리)을 선호하는 문제 대처 방식의 어긋남입니다. 대화가 비난이나 요구로 흐르며 방어와 단절이 반복되고 있습니다.`;
      generationalUnderstanding = `가부장적 역할 분담 가치관과 동등한 동반자적 공유 가치관이 섞여 있는 과도기적 가정의 양상입니다. 일상 속 소소한 고마움을 구체적인 언어로 소통하는 훈련이 부족한 문화적 배경도 기인합니다.`;
      fact = "배우자의 회피나 차가운 태도는 나를 무시하는 것이 아니라 스스로의 심리적 여력이 소진된 상태일 수 있습니다.";
      positive = "서로 각자의 방식으로 책임을 다하고 있다는 점을 인정하면, 요구하기 전에 공감할 수 있는 틈이 생깁니다.";
      action = "서운함을 토로하기 전에 오늘 하루 각자의 고단함을 인정하는 따뜻한 인사말을 먼저 건네보세요.";
    } else if (target.includes('손주')) {
      myView = `손주에게 따뜻하고 아낌없는 내리사랑을 전달하고 싶으나, 다가오지 않고 기기에만 몰두하는 냉소적 태도에 멀어짐과 섭섭함을 느낍니다.`;
      partnerView = `조부모의 사랑은 마음속으로 고맙게 생각하나, 소통 주제가 다르고 잔소리나 훈계를 들을까 봐 어색함을 피해 자신에게 가장 익숙하고 재미있는 스마트 세상으로 숨는 경향이 있습니다.`;
      conflictAnalysis = `면대면 감정 공유를 중시하는 조부모의 소통 표준과 비대면 텍스트/디지털 매체를 자연스럽게 여기는 손주 세대의 소통 표준이 충돌하는 현상입니다.`;
      generationalUnderstanding = `태어날 때부터 스마트폰과 유튜브를 공기처럼 들이마신 디지털 네이티브 세대의 절대적 특징입니다. 이들에게 기기 몰입은 무례함의 표시가 아니라, 감정을 표현하고 외부를 탐색하는 가장 친숙한 방식일 뿐입니다.`;
      fact = "손주의 디지털 기기 몰입은 나에 대한 거부가 아니라 그들 세대의 자연스러운 기본 소통 방식입니다.";
      positive = "손주가 흥미를 가지는 디지털 세상이나 요즘 문화를 조부모가 호기심을 가지고 물어본다면 훌륭한 대화의 연결고리가 될 수 있습니다.";
      action = "손주가 즐겨보는 콘텐츠에 대해 가르치려 하기보다 배우려는 자세로 가벼운 질문을 던져보세요.";
    } else {
      myView = `가족이라는 가장 안전한 집단 내에서조차 나의 고통과 힘듦이 외면받거나 도구로 쓰이는 듯해 소외감과 관계 회의감을 느끼고 있습니다.`;
      partnerView = `가족 구성원 개개인도 급변하는 경쟁 사회에서 살아남기 위한 각자의 불안과 스트레스를 견뎌내느라 타인을 수용할 여유 에너지가 극도로 상실된 상태입니다.`;
      conflictAnalysis = `가족이라는 친밀함의 맹점으로 인해 최소한의 정서적 경계를 지키지 않고 말과 감정을 배설함으로써 깊은 상처를 주고받는 대화 악순환에 기여하고 있습니다.`;
      generationalUnderstanding = `과거의 '가족을 위한 개인의 전폭적 희생' 패러다임과 현대의 '개인의 자유와 권리 우선' 패러다임이 한 집안의 좁은 공간 내에서 세대 간 타협 없이 직면하고 있기 때문입니다.`;
      fact = "나에게 상처를 주는 타인 역시 각자의 불안과 생존의 무게를 견디고 있는 불완전한 개인들입니다.";
      positive = "가족이라는 틀에 얽매여 무조건 이해받기를 기대하기보다, 나와 타인의 심리적 경계를 분리하는 법을 배울 기회입니다.";
      action = "상대방의 부정적 감정을 내 것으로 흡수하지 말고, 일정한 정서적 거리두기를 연습하며 나만의 치유공간을 확보하세요.";
    }

    setMessages((prev) => [
      ...prev,
      {
        id: createId(),
        sender: 'bot',
        type: 'perspectiveResult',
        content: `[상대방 입장에서 바라보기] 🔄\n\n${cleanName}님과 상대방의 입장을 4단계로 분석한 다각도 보고서입니다. 서로 다른 세대적 맥락을 읽어보며 마음을 짓누르던 섭섭함이나 분노의 무게가 가벼워지기를 소망합니다. 🌿`,
        timestamp: new Date(),
        data: {
          target,
          myView,
          partnerView,
          conflictAnalysis,
          generationalUnderstanding,
          fact,
          positive,
          action
        }
      },
      // [신규] 추가 질문 안내 — 아래 입력창(칸)이 활성화됩니다
      {
        id: createId(),
        sender: 'bot',
        type: 'text',
        content: `여기까지 5단계 마음 처방과 관점 전환을 모두 살펴보았어요. 더 궁금한 점이 있으신가요? 아래 입력창에 자유롭게 적어 보내주시면 함께 살펴볼게요. 🌿`,
        timestamp: new Date()
      },
      // 맞춤 추천 치유농장 카드 — 흐름의 맨 마지막에 표시 ('다시 시작하기' 버튼 포함)
      {
        id: createId(),
        sender: 'bot',
        type: 'farms', // Farms타입 버블에 '다시시작' 버튼 렌더러가 이미 탑재되어 있으므로 매핑
        content: '',
        timestamp: new Date(),
        data: {
          farms: matchedFarms
        }
      }
    ]);

    // 추가 질문 입력칸 활성화
    setStep('followup');
  };

  // [신규] 관점 전환을 원치 않는 사용자: 건너뛰고 바로 추가질문 안내 + 치유농장으로 진행
  const skipPerspective = async () => {
    setMessages((prev) => [
      ...prev.filter(m => m.type !== 'perspectiveButtons'),
      {
        id: createId(),
        sender: 'user',
        type: 'text',
        content: '관점 전환은 건너뛰고 추천을 받을게요.',
        timestamp: new Date()
      }
    ]);

    setIsTyping(true);
    await new Promise((resolve) => setTimeout(resolve, 700));
    setIsTyping(false);

    setMessages((prev) => [
      ...prev,
      {
        id: createId(),
        sender: 'bot',
        type: 'text',
        content: `여기까지 5단계 마음 처방을 모두 살펴보았어요. 더 궁금한 점이 있으신가요? 아래 입력창에 자유롭게 적어 보내주시면 함께 살펴볼게요. 🌿`,
        timestamp: new Date()
      },
      {
        id: createId(),
        sender: 'bot',
        type: 'farms',
        content: '',
        timestamp: new Date(),
        data: {
          farms: matchedFarms
        }
      }
    ]);

    setStep('followup');
  };

  // [신규] 추가 질문 처리 — 추천 이후에도 사용자가 자유롭게 더 물어볼 수 있도록 응답
  const sendFollowup = async (text: string) => {
    setMessages((prev) => [
      ...prev,
      {
        id: createId(),
        sender: 'user',
        type: 'text',
        content: text,
        timestamp: new Date()
      }
    ]);

    setIsTyping(true);
    let comfort = '';
    try {
      const followupEmotion = await analyzeWorry(text, selectedAge || '30s');
      comfort = followupEmotion.comfortMessage;
    } catch (e) {
      comfort = '';
    }
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsTyping(false);

    setMessages((prev) => [
      ...prev,
      {
        id: createId(),
        sender: 'bot',
        type: 'text',
        content: comfort
          ? `말씀해 주셔서 고마워요. ${comfort}`
          : `말씀해 주셔서 고마워요. 지금 느끼시는 마음을 천천히 들여다보며, 오늘 할 수 있는 가장 작은 한 걸음부터 함께 찾아봐요. 🌿`,
        timestamp: new Date()
      },
      {
        id: createId(),
        sender: 'bot',
        type: 'text',
        content: `더 나누고 싶은 이야기가 있다면 아래 입력창에 편히 적어주세요. 새로운 진단을 원하시면 위 추천 카드의 "처음부터 다시 진단하기"를 눌러주세요. 🌱`,
        timestamp: new Date()
      }
    ]);
  };

  return (
    <FlowContext.Provider
      value={{
        step,
        user,
        selectedAge,
        selectedWorryCategory,
        worryText,
        fatigueScore,
        sleepStatus,
        tensionLevel,
        waves,
        nlpResult,
        matchedFarms,
        messages,
        isTyping,
        login,
        logout,
        selectAge,
        selectWorryCategory,
        sendWorry,
        sendDiagnostic,
        resetFlow,
        selectPerspective,
        skipPerspective,
        sendFollowup
      }}
    >
      {children}
    </FlowContext.Provider>
  );
};

export const useFlow = () => {
  const context = useContext(FlowContext);
  if (!context) {
    throw new Error('useFlow must be used within a FlowProvider');
  }
  return context;
};
