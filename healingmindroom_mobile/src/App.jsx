import { BrowserRouter, Routes, Route } from 'react-router-dom';
import SplashLogin from './pages/SplashLogin';
import PersonaSelection from './pages/PersonaSelection';
import WorryInput from './pages/WorryInput';
import AiResponse from './pages/AiResponse';
import EmotionWidget from './pages/EmotionWidget';
import FarmRecommendation from './pages/FarmRecommendation';
import FarmList from './pages/FarmList';
import FarmDetail from './pages/FarmDetail';
import MindPrescription from './pages/MindPrescription';
import TopNav from './components/TopNav';

function AppContent() {
  return (
    <>
      <TopNav />
      <Routes>
        <Route path="/" element={<SplashLogin />} />
        <Route path="/age" element={<PersonaSelection />} />
        <Route path="/worry" element={<WorryInput />} />
        <Route path="/ai-response" element={<AiResponse />} />
        <Route path="/emotion" element={<EmotionWidget />} />
        <Route path="/farm" element={<FarmRecommendation />} />
        <Route path="/farm-list" element={<FarmList />} />
        <Route path="/farm-detail/:id" element={<FarmDetail />} />
        <Route path="/prescription" element={<MindPrescription />} />
      </Routes>
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default App;
