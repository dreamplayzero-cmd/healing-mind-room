import { create } from 'zustand';

const useAppStore = create((set) => ({
  // Persona Selection
  persona: null,
  concerns: [],
  setPersonaData: (personaData) => set({ 
    persona: personaData,
    ageGroup: personaData.age.includes('30대') ? '30대' : '40대', // Map persona age to backend's "30대" or "40대"
    concerns: personaData.concerns
  }),

  // Page 2: Age Group (Kept for compatibility)
  ageGroup: '',
  setAgeGroup: (age) => set({ ageGroup: age }),

  // LLM Toggle
  useLlmMode: false,
  setUseLlmMode: (mode) => set({ useLlmMode: mode }),

  // Page 3: Worry Type & Input
  worryType: '',
  userInput: '',
  setWorryInput: (type, input) => set({ worryType: type, userInput: input }),

  // Page 4: AI Response
  aiResponse: null,
  setAiResponse: (response) => set({ aiResponse: response }),

  // Page 5: Emotion Widget
  emotionState: null,
  setEmotionState: (emotion) => set({ emotionState: emotion }),

  // Page 6: Recommended Farm
  recommendedFarm: null,
  setRecommendedFarm: (farm) => set({ recommendedFarm: farm }),

  // Reset store (for returning to start)
  resetStore: () => set({
    persona: null,
    concerns: [],
    ageGroup: '',
    useLlmMode: false,
    worryType: '',
    userInput: '',
    aiResponse: null,
    emotionState: null,
    recommendedFarm: null,
  })
}));

export default useAppStore;
