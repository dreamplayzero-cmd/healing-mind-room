# Data Model Specification - Healing Mind Room MVP

## 1. 치유농장 데이터 모델 (`Farm`)

농장 정보 데이터베이스는 `src/data/farms.json`에 정적 JSON 배열 형태로 저장됩니다.

### 1.1 스키마 정의 (`TypeScript Interface`)
```typescript
export interface Farm {
  id: string;            // 고유 ID (예: "farm-001")
  name: string;          // 농장 이름 (예: "하늘아래 초록농원")
  location: string;      // 위치/주소 (예: "강원도 평창군 ...")
  area: string;          // 지역 분류 (예: "강원", "경기", "충청", "전라", "경상", "제주")
  description: string;   // 농장 소개 및 특징
  imageUrl: string;      // 플로우AI 공간 원화 또는 매칭 테마 이미지 경로
  themes: string[];      // 치유 테마 (예: ["안정", "자연", "활동"])
  targetAges: string[];  // 주요 추천 연령대 (예: ["30s", "40s", "50s", "60s"])
  waveType: 'alpha' | 'theta'; // 추천 우세 뇌파 유형 ('alpha' = 안정이 필요한 사람에게 추천, 'theta' = 피로해소가 급격히 필요한 사람에게 추천)
  programs: string[];    // 치유 프로그램 목록 (예: ["허브차 테라피", "텃밭 가꾸기"])
  contact: string;       // 문의처 (전화번호)
  website?: string;      // 웹사이트 (선택사항)
}
```

### 1.2 JSON 데이터 예시 (`farms.json`)
```json
[
  {
    "id": "farm-001",
    "name": "초록숨 허브가든",
    "location": "경기도 양평군 서종면 123",
    "area": "경기",
    "description": "아로마 허브 향으로 마음을 진정시키고 조용한 숲속 산책을 통해 정서적 안정을 돕는 치유 농장입니다.",
    "imageUrl": "/assets/images/themes/healing_forest.webp",
    "themes": ["안정", "자연"],
    "targetAges": ["30s", "40s", "50s"],
    "waveType": "alpha",
    "programs": ["허브 에센셜 오일 추출", "싱잉볼 명상", "숲 걷기"],
    "contact": "031-123-4567",
    "website": "https://example.com/greenbreath"
  },
  {
    "id": "farm-002",
    "name": "흙이랑 팜스테이",
    "location": "충청남도 홍성군 장곡면 45",
    "area": "충청",
    "description": "신체적 활동을 통해 활력을 얻고 텃밭 채소를 직접 수확하며 일상의 피로를 날려버리는 활동형 치유 농장입니다.",
    "imageUrl": "/assets/images/themes/farming_activity.webp",
    "themes": ["활동", "자연"],
    "targetAges": ["50s", "60s"],
    "waveType": "theta",
    "programs": ["유기농 감자 수확", "흙 밟기 맨발 체험", "가마솥 밥 짓기"],
    "contact": "041-987-6543"
  }
]
```

## 2. 소셜 로그인 사용자 데이터 모델 (`User`)

카카오/구글 로그인 성공 시 발급받는 사용자 프로필 규격입니다.

### 2.1 스키마 정의
```typescript
export interface User {
  name: string;          // 사용자 이름/닉네임 (예: "홍길동")
  email: string;         // 사용자 이메일 (예: "gildong@example.com")
  avatarUrl: string;     // 프로필 아바타 이미지 주소
  provider: 'kakao' | 'google'; // 소셜 로그인 제공자
}
```

## 3. 세대별 AI 상담 데이터 모델 (`CounselingSession`)

사용자가 입력하는 고민 글과 이에 대한 분석 결과를 관리합니다.

### 2.1 스키마 정의
```typescript
export interface CounselingSession {
  selectedAge: '30s' | '40s' | '50s' | '60s'; // 선택 연령대
  worryText: string;                           // 사용자가 입력한 고민 (최대 500자)
  analyzedEmotion: {
    primary: string;                           // 주요 감정 (예: "불안", "피로", "무기력", "분노")
    score: number;                             // 감정 강도 (0.0 ~ 1.0)
    keywords: string[];                        // 추출된 핵심 키워드 (예: ["직장", "퇴사", "건강"])
  };
  aiComfortMessage: string;                    // AI가 생성한 맞춤형 위로 편지
}
```

## 3. 감정 자가진단 위젯 데이터 모델 (`DiagnosticResult`)

자가진단 위젯에서 입력받은 지표와 이를 통해 계산된 뇌파 추정값입니다.

### 3.1 스키마 정의
```typescript
export interface DiagnosticResult {
  fatigueScore: number;     // 피로도 (1 ~ 5)
  sleepStatus: 'good' | 'normal' | 'bad'; // 수면 상태
  tensionLevel: 'low' | 'medium' | 'high'; // 긴장도
  estimatedWaves: {
    alpha: number;          // 알파파(안정) 추정 비율 (0.0 ~ 1.0)
    theta: number;          // 세타파(피로) 추정 비율 (0.0 ~ 1.0)
    dominant: 'alpha' | 'theta'; // 우세 뇌파
  };
}
```

## 4. 최종 추천 매칭 결과 데이터 모델 (`Recommendation`)

사용자 분석 후 최종 매칭 결과로 출력되는 구조입니다.

### 4.1 스키마 정의
```typescript
export interface Recommendation {
  session: CounselingSession;
  diagnostic: DiagnosticResult;
  matchedFarms: Farm[];     // 적합도 점수 상위 2~3개 농장 리스트
  timestamp: string;        // 분석 수행 일시
}
```
