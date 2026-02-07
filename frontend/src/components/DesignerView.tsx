import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { ComponentsPanel } from './ComponentsPanel';
import { DiagramCanvas } from './DiagramCanvas';
import { ChatPanel } from './ChatPanel';

interface LocationState {
    initialMessage?: string;
    cloudProvider?: string;
}

export const DesignerView = () => {
    const location = useLocation();
    const state = location.state as LocationState;
    const cloudProvider = state?.cloudProvider || 'AWS';

    useEffect(() => {
        // Log the initial message for debugging
        if (state?.initialMessage) {
            console.log('Initial message from landing page:', state.initialMessage);
            console.log('Selected cloud provider:', state.cloudProvider);
        }
    }, [state]);

    return (
        <div className="h-screen flex flex-col bg-slate-950">
            {/* Header */}
            <header className="h-14 border-b border-white/10 bg-slate-900 flex items-center justify-between px-4">
                <div className="flex items-center gap-3">
                    <span className="text-2xl">⚡</span>
                    <span className="text-lg font-bold text-white">CloudCode Designer</span>
                    {cloudProvider && (
                        <span className="ml-4 px-3 py-1 bg-green-600/20 border border-green-500/30 rounded-md text-green-400 text-sm font-medium">
                            {cloudProvider === 'AWS' && '☁️ AWS'}
                            {cloudProvider === 'GCP' && '🌐 GCP'}
                            {cloudProvider === 'Azure' && '⚡ Azure'}
                        </span>
                    )}
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
                <ComponentsPanel cloudProvider={cloudProvider} />

                {/* Center - Diagram Canvas */}
                <div className="flex-1 relative">
                    <DiagramCanvas />
                </div>

                {/* Right Panel - Chat */}
                <ChatPanel initialMessage={state?.initialMessage} />
            </div>
        </div>
    );
};
