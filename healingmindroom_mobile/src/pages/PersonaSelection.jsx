import { useNavigate } from 'react-router-dom';
import useAppStore from '../store/useAppStore';

const PERSONAS = [
  {
    id: "jiyeon",
    name: "최지연",
    age: "30대 여성",
    category_id: 1,
    emoji: "💁🏻‍♀️",
    description: "직장 스트레스와 육아로 지친 워킹맘",
    concerns: ["직장스트레스", "번아웃", "육아", "인간관계", "미래불안", "자기계발"]
  },
  {
    id: "jungwoo", 
    name: "이정우",
    age: "40대 남성",
    category_id: 2,
    emoji: "👨🏻‍💼",
    description: "중간관리자 스트레스와 가족 부양으로 힘든 아버지",
    concerns: ["직장스트레스", "부모부양", "번아웃", "자녀교육", "건강관리", "자기계발"]
  }
];

export default function PersonaSelection() {
  const navigate = useNavigate();
  const setPersonaData = useAppStore((state) => state.setPersonaData);

  const handleSelect = (persona) => {
    setPersonaData(persona);
    navigate('/worry');
  };

  return (
    <div className="page-container fade-in persona-select-page">
      <div className="page-header">
        <h2>체험하실 페르소나를<br/>선택해주세요</h2>
        <p>당신과 가장 비슷한 분을 선택해보세요 🌿</p>
      </div>
      
      <div className="persona-buttons">
        {PERSONAS.map(persona => (
          <button
            key={persona.id}
            className="persona-card-btn"
            onClick={() => handleSelect(persona)}
          >
            <span className="persona-emoji">{persona.emoji}</span>
            <div className="persona-info">
              <strong>{persona.name} ({persona.age})</strong>
              <p>{persona.description}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
