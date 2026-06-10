import type { EmotionAnalysisResult } from '../types';

// 로컬 키워드 분석 사전
const KEYWORD_DICTIONARY: { keys: string[]; keyword: string; emotion: string }[] = [
  { keys: ['회사', '직장', '상사', '퇴사', '일', '업무', '동료', '스트레스', '번아웃'], keyword: '직장', emotion: '스트레스' },
  { keys: ['잠', '불면', '새벽', '악몽', '피곤', '수면', '베개', '밤'], keyword: '수면', emotion: '불안/불면' },
  { keys: ['외롭', '우울', '눈물', '혼자', '고독', '슬픔', '마음', '상처'], keyword: '외로움', emotion: '우울/외로움' },
  { keys: ['나이', '은퇴', '앞날', '미래', '자식', '가족', '건강', '노후'], keyword: '노후', emotion: '미래 고민' }
];

// 세대별 기본 위로 메시지 템플릿
const DEFAULT_COMFORT_TEMPLATES: Record<string, Record<string, string>> = {
  '30s': {
    '스트레스': '치열한 커리어와 잦은 스트레스로 숨차게 달려오셨군요. 잠시 속도를 늦추고 자연의 소리에 귀 기울이며 당신만의 속도를 찾아보세요.',
    '불안/불면': '생각이 꼬리를 물어 잠 못 이루는 밤이 잦으셨네요. 오늘만큼은 모든 짐을 내려놓고 편안한 허브 향 속에 깊은 휴식을 취하시길 바랍니다.',
    '우울/외로움': '혼자서 감당하기 어려운 무거운 마음의 무게를 느낄 때가 있습니다. 늘 당신을 응원하는 자연의 품에서 따뜻한 위로를 안겨드릴게요.',
    '미래 고민': '앞으로 나아갈 방향에 대한 막막함은 성장하고 있다는 증거입니다. 지치지 않도록 조용히 숨을 고르며 마음의 탄력을 회복해 보아요.',
    '일반': '삶의 무게에 지친 당신께 따스한 흙과 풀 내음이 가득한 치유의 공간을 선물합니다. 잠시 쉬어가도 괜찮아요.'
  },
  '40s': {
    '스트레스': '가정과 직장의 모든 책임을 짊어지느라 지친 어깨를 토닥여 드리고 싶습니다. 온전히 자신만을 돌보는 치유 농장으로 떠나보시는 건 어떨까요.',
    '불안/불면': '밤이 깊어질수록 깊어지는 고민들로 머리가 무거우시겠습니다. 긴장된 신경을 사르르 녹여줄 편안한 숲속 쉼터를 추천합니다.',
    '우울/외로움': '문득 찾아오는 허전함과 우울은 잠시 멈춰 서서 스스로를 돌보라는 신호입니다. 초록 식물이 건네는 묵묵한 위로를 만나보세요.',
    '미래 고민': '인생의 중반기, 다가올 삶을 위한 재정비가 필요한 시기입니다. 숲속 고요한 방에서 내면의 진정한 목소리에 귀를 기울여 보시기 바랍니다.',
    '일반': '누군가의 든든한 버팀목이 되어주느라 정작 외면했던 나 자신의 마음을 조용히 다독이는 시간을 가져보세요.'
  },
  '50s': {
    '스트레스': '수많은 세월 동안 세상을 일구고 가정을 돌보시느라 참 고생 많으셨습니다. 이제 복잡한 생각에서 벗어나 온전히 흙을 만지며 활력을 찾아보세요.',
    '불안/불면': '몸과 마음의 변화로 깊은 잠을 이루지 못하고 계시군요. 따스한 햇볕을 쬐고 바람길을 산책하며 흐트러진 수면의 균형을 되찾으시길 소망합니다.',
    '우울/외로움': '삶의 큰 파도를 넘어서며 마주한 외로운 마음을 이해합니다. 동물들과 눈을 맞추고 정서적으로 소통하며 마음의 온기를 되찾아 보십시오.',
    '미래 고민': '새로운 인생 2막을 준비하며 느끼는 막막함은 누구나 겪는 과정입니다. 흙을 밟으며 새로운 열정과 에너지를 다시 한번 단단하게 채워보세요.',
    '일반': '자연은 서두르는 법이 없지만 결국 꽃을 피워냅니다. 서두르지 않고 당신만의 고유한 힐링처를 찾으실 수 있게 동행하겠습니다.'
  },
  '60s': {
    '스트레스': '오랜 세월 동안 흘린 땀방울 끝에 비로소 얻은 소중한 쉼의 시간입니다. 모든 긴장을 비워내고 숲의 맑은 공기와 온천으로 몸과 마음의 피로를 씻어내세요.',
    '불안/불면': '나이가 들며 찾아오는 불면은 몸의 신호를 조율해 나가는 과정입니다. 따뜻한 약초 족욕과 허브 명상으로 몸속 깊은 안정감을 깨워보십시오.',
    '우울/외로움': '문득 쓸쓸함이 찾아올 때는 흙냄새와 싱그러운 수확의 기쁨 속으로 들어가 보세요. 흙은 땀을 흘린 만큼 정직하고 맑은 에너지를 돌려줍니다.',
    '미래 고민': '걸어오신 길은 충분히 훌륭합니다. 앞으로 마주할 내일도 편안하고 안전할 수 있도록 자연 속 넉넉한 치유 공간이 당신을 감싸 안아줄 것입니다.',
    '일반': '인생의 긴 여정을 멋지게 걸어오신 당신께 소중하고 조용한 자연 속 안식처를 권해드립니다. 편히 머물다 가십시오.'
  }
};

/**
 * 사용자의 연령대와 고민 글을 입력받아 NLP 감정 분석을 수행합니다.
 */
export async function analyzeWorry(
  worryText: string,
  age: '30s' | '40s' | '50s' | '60s'
): Promise<EmotionAnalysisResult> {
  const enableRealNlp = import.meta.env.VITE_ENABLE_REAL_NLP === 'true';
  const apiKey = import.meta.env.VITE_NLP_API_KEY;
  const apiUrl = import.meta.env.VITE_NLP_API_URL;

  if (enableRealNlp && apiKey && apiUrl) {
    try {
      // 1. 외부 NLP API 연동 시도 (예: OpenAI Chat Completions API 표준 호출 규격)
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: `당신은 심리상담 치료사입니다. 사용자의 연령대(${age})와 고민 글을 읽고 1) 주요 감정(스트레스, 불안/불면, 우울/외로움, 미래 고민 중 택1), 2) 감정 강도 점수(0.0~1.0), 3) 핵심 고민 키워드 3개, 4) 그 연령대에 최적화된 따뜻한 위로 편지(3~4문장)를 JSON 규격으로 반환하십시오. 반드시 JSON 키값은 primaryEmotion, score, keywords, comfortMessage 여야 합니다. 한국어로만 답변하시오.`
            },
            {
              role: 'user',
              content: worryText
            }
          ],
          response_format: { type: 'json_object' }
        })
      });

      if (response.ok) {
        const data = await response.json();
        const nlpResult = JSON.parse(data.choices[0].message.content);
        return {
          primaryEmotion: nlpResult.primaryEmotion || '스트레스',
          score: Number(nlpResult.score) || 0.8,
          keywords: Array.isArray(nlpResult.keywords) ? nlpResult.keywords : [],
          comfortMessage: nlpResult.comfortMessage || '힘든 마음을 들어주고 함께 할 치유 농장을 소개합니다.'
        };
      }
    } catch (e) {
      console.warn('Real NLP API failed, falling back to local analyzer.', e);
    }
  }

  // 2. 외부 API 미활성화 또는 실패 시 로컬 분석기 (Fallback) 작동
  return analyzeWorryLocally(worryText, age);
}

/**
 * 로컬 사전 기반 고민 텍스트 키워드 분석
 */
function analyzeWorryLocally(
  worryText: string,
  age: '30s' | '40s' | '50s' | '60s'
): EmotionAnalysisResult {
  const matchedKeywords: string[] = [];
  let detectedEmotion = '일반';

  // 고민 텍스트를 돌며 사전 키워드 일치 확인
  KEYWORD_DICTIONARY.forEach((entry) => {
    const isMatched = entry.keys.some((key) => worryText.includes(key));
    if (isMatched) {
      matchedKeywords.push(entry.keyword);
      detectedEmotion = entry.emotion; // 가장 마지막 매칭된 감정을 임시 설정 (우선순위 부여 가능)
    }
  });

  // 매칭된 키워드가 없으면 임의 키워드 추출
  if (matchedKeywords.length === 0) {
    matchedKeywords.push('마음', '휴식');
  }

  // 연령대와 감정에 부합하는 위로 편지 매칭
  const ageComfortTemplates = DEFAULT_COMFORT_TEMPLATES[age] || DEFAULT_COMFORT_TEMPLATES['30s'];
  const comfortMessage = ageComfortTemplates[detectedEmotion] || ageComfortTemplates['일반'];

  return {
    primaryEmotion: detectedEmotion === '일반' ? '스트레스' : detectedEmotion,
    score: matchedKeywords.length > 0 ? Math.min(0.9, 0.5 + matchedKeywords.length * 0.1) : 0.6,
    keywords: matchedKeywords,
    comfortMessage
  };
}
