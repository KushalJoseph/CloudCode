import { ComponentsPanel } from './components/ComponentsPanel';
import { DiagramCanvas } from './components/DiagramCanvas';
import { ChatPanel } from './components/ChatPanel';

function App() {
  return (
    <div className="h-screen flex flex-col bg-slate-950">
      {/* Header */}
      <header className="h-14 border-b border-white/10 bg-slate-900 flex items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <span className="text-2xl">⚡</span>
          <span className="text-lg font-bold text-white">Prompt to Infrastructure</span>
        </div>
        <nav className="flex items-center gap-6">
          <button className="px-4 py-1.5 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-md flex items-center gap-2">
            <span>🎨</span> Designer
          </button>
          <button className="text-white/60 hover:text-white text-sm">Projects</button>
          <button className="text-white/60 hover:text-white text-sm">Learn</button>
        </nav>
      </header>

      {/* Main Content - 3 Panel Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - Components */}
        <ComponentsPanel />

        {/* Center - Diagram Canvas */}
        <div className="flex-1 relative">
          <DiagramCanvas />
        </div>

        {/* Right Panel - Chat */}
        <ChatPanel />
      </div>
    </div>
  );
}

export default App;
