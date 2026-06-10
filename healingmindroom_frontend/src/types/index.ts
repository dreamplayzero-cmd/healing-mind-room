/**
 * Healing Mind Room MVP 공통 타입 정의
 */

export interface Farm {
  id: string;
  name: string;
  location: string;
  area: string;
  description: string;
  imageUrl: string;
  themes: string[];
  targetAges: string[];
  waveType: 'alpha' | 'theta';
  programs: string[];
  contact: string;
  website?: string;
  categoryId?: number;
}

export interface WaveEstimateInput {
  fatigueScore: number;
  sleepStatus: number; // 1-5 점수
  tensionLevel: number; // 1-5 점수
}

export interface WaveEstimateResult {
  alpha: number;
  theta: number;
  dominant: 'alpha' | 'theta';
}

export interface EmotionAnalysisResult {
  primaryEmotion: string;
  score: number;
  keywords: string[];
  comfortMessage: string;
}

export interface MatcherInput {
  selectedAge: '30s' | '40s' | '50s' | '60s';
  dominantWave: 'alpha' | 'theta';
  keywords: string[];
}

export interface User {
  name: string;
  email: string;
  avatarUrl: string;
  provider: 'kakao' | 'google';
}

export interface Message {
  id: string;
  sender: 'bot' | 'user';
  type: 'text' | 'login' | 'age' | 'worryCategory' | 'diagnostic' | 'result' | 'typing' | 'farms' | 'perspectiveButtons' | 'perspectiveResult';
  content: string;
  timestamp: Date;
  data?: any; // 추가적인 객체 데이터 (예: 농장 리스트, 뇌파 분석 정보 등)
}
