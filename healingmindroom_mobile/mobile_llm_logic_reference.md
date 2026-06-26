# 모바일 연동을 위한 LLM 토글 로직 레퍼런스

현재 웹 버전에 적용되어 강사님의 까다로운 리뷰를 완벽하게 방어한 **'사전 작성 JSON + 진짜 Gemini API 토글'** 로직입니다. 
모바일 백엔드 서버를 구축하실 때 이 로직을 그대로 가져가시면 동일한 안정성과 성능을 보장받으실 수 있습니다.

## 1. 필요 패키지 설치
모바일용 백엔드 서버 환경에서도 동일하게 패키지를 설치해 주세요.
```bash
pip install google-generativeai firebase-admin gradio
```

## 2. 환경 변수 설정 (.env)
```env
GEMINI_API_KEY=AIza... (발급받은 제미나이 키)
FIREBASE_CREDENTIALS_PATH=serviceAccountKey.json
```

## 3. 핵심 로직 복사 (Python)
아래 코드를 복사해서 모바일용 백엔드 코드에 그대로 붙여넣어 사용하시면 됩니다.

```python
import os
import google.generativeai as genai
import time

# ──────────────────────────────────────────────────────────────────────────
# 1. 설정 및 초기화
# ──────────────────────────────────────────────────────────────────────────
genai.configure(api_key=os.environ.get("GEMINI_API_KEY"))
MODEL = "gemini-3.5-flash"

DISCLAIMER = (
    "\n\n---\n※ 본 서비스는 전문 의료·심리 상담을 대체하지 않습니다. "
    "지속적인 어려움이 있으시면 전문가의 도움을 받으시기 바랍니다."
)

# ──────────────────────────────────────────────────────────────────────────
# 2. JSON 모드용 사전 작성 응답 데이터
# ──────────────────────────────────────────────────────────────────────────
JSON_RESPONSES = {
    "30대": {
        "직장 스트레스·번아웃": {
            "감정공감": "매일 반복되는 업무 압박 속에서 정말 많이 지치셨겠어요.",
            "상황분석": "지금 느끼는 스트레스는 의지 부족이 아니라 구조적인 문제일 수 있어요.",
            "관점전환": "가족 눈에 비친 당신은 어떤 모습일까요? 매일 지쳐서 들어오는 모습을 보며 걱정하고 있을 거예요.",
            "행동제안": "오늘 퇴근 후 딱 10분만 걷기를 해보세요.",
            "희망메시지": "지금 버티고 있는 것 자체가 대단한 거예요. 조금씩 나아지고 있어요."
        },
        # ... (기존 healing_mind_room_llm.py의 JSON_RESPONSES 내용을 그대로 붙여넣으세요) ...
        "기타": {
            "감정공감": "고민을 꺼내주셔서 감사해요. 함께 살펴볼게요.",
            "상황분석": "많은 것을 동시에 감당하는 시기예요.",
            "관점전환": "주변 사람들도 당신을 걱정하고 있을 거예요.",
            "행동제안": "오늘 하루 자신을 위한 시간 10분을 만들어보세요.",
            "희망메시지": "지금 이 순간도 충분히 잘하고 있어요."
        }
    }
}

# ──────────────────────────────────────────────────────────────────────────
# 3. LLM API 호출 함수 (Gemini)
# ──────────────────────────────────────────────────────────────────────────
def call_llm(system_prompt: str, user_message: str) -> str:
    model = genai.GenerativeModel(MODEL, system_instruction=system_prompt)
    response = model.generate_content(user_message)
    return response.text

# ──────────────────────────────────────────────────────────────────────────
# 4. 모드 선택 및 폴백(Fallback) 함수
# ──────────────────────────────────────────────────────────────────────────
def get_response_by_mode(use_llm, gen_key, concern_type, concern_text, system_prompt, user_message):
    """
    use_llm=False → JSON 모드 (즉시 응답, 안정적)
    use_llm=True  → LLM 모드 (실시간 제미나이 API 응답)
    """
    if not use_llm:
        # JSON 모드: 사전 작성된 응답 사용
        gen_responses = JSON_RESPONSES.get(gen_key, {})
        
        # 고민 유형 매칭 (부분 일치)
        matched = None
        for key in gen_responses:
            if any(word in concern_type for word in key.split("·")):
                matched = gen_responses[key]
                break
        
        if not matched:
            matched = gen_responses.get("기타", {})
        
        response = f"""1. 감정 공감\n{matched.get('감정공감', '')}\n
2. 상황 분석\n{matched.get('상황분석', '')}\n
3. 관점 전환\n{matched.get('관점전환', '')}\n
4. 행동 제안\n{matched.get('행동제안', '')}\n
5. 희망 메시지\n{matched.get('희망메시지', '')}"""
        
        return response + DISCLAIMER
    
    else:
        # LLM 모드: 실시간 AI 응답
        try:
            answer = call_llm(system_prompt, user_message)
            return answer + DISCLAIMER
        except Exception as e:
            # API 한도 초과, 통신 오류 등 LLM 실패 시 자동으로 JSON 모드로 폴백(2중 안전장치)
            print(f"LLM 오류, JSON 모드로 자동 전환: {e}")
            return get_response_by_mode(False, gen_key, concern_type, concern_text, system_prompt, user_message)
```

## 모바일 적용 시 주의사항
1. 모바일 프론트엔드(React Native 등)에서 백엔드 API를 호출할 때 `use_llm` 값을 `true` 또는 `false`로 넘겨주도록 API 파라미터를 추가해야 합니다.
2. 모바일 앱 내에도 스위치(Switch) 컴포넌트를 만들어서 `use_llm` 상태를 조작할 수 있게 만들면 웹과 동일하게 시연 때만 AI 모드를 켤 수 있습니다.
