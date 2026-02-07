import { Routes, Route } from 'react-router-dom';
import { LandingPage } from './components/LandingPage';
import { DesignerView } from './components/DesignerView';
import { LoginView } from './components/LoginView';
import { ProjectsView } from './components/ProjectsView';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from '@descope/react-sdk';

function App() {
  const projectId = import.meta.env.VITE_DESCOPE_PROJECT_ID || 'PID_PLACEHOLDER';

  return (
    <AuthProvider projectId={projectId}>
      <ThemeProvider>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginView />} />
          <Route path="/designer" element={<DesignerView />} />
          <Route path="/designer/:projectId" element={<DesignerView />} />
          <Route path="/projects" element={<ProjectsView />} />
        </Routes>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;
