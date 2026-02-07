import { Routes, Route } from 'react-router-dom';
import { LandingPage } from './components/LandingPage';
import { DesignerView } from './components/DesignerView';
import { ThemeProvider } from './context/ThemeContext';

function App() {
  return (
    <ThemeProvider>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/designer" element={<DesignerView />} />
      </Routes>
    </ThemeProvider>
  );
}

export default App;
