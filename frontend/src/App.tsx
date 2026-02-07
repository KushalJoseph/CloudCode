import { Routes, Route } from 'react-router-dom';
import { LandingPage } from './components/LandingPage';
import { DesignerView } from './components/DesignerView';

/**
 * Root React component that defines the application's top-level routes.
 *
 * @returns A JSX element with route definitions mapping "/" to LandingPage and "/designer" to DesignerView.
 */
function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/designer" element={<DesignerView />} />
    </Routes>
  );
}

export default App;