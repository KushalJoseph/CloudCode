import { Routes, Route } from 'react-router-dom';
import { LandingPage } from './components/LandingPage';
import { DesignerView } from './components/DesignerView';

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/designer" element={<DesignerView />} />
    </Routes>
  );
}

export default App;
