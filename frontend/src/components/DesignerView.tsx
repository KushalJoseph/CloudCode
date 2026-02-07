import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { ComponentsPanel } from './ComponentsPanel';
import { DiagramCanvas } from './DiagramCanvas';
import { ChatPanel } from './ChatPanel';
import { ProjectsView } from './ProjectsView';
import { AWSLogo, GCPLogo, AzureLogo } from './CloudLogos';

interface LocationState {
    initialMessage?: string;
    cloudProvider?: string;
}

export const DesignerView = () => {
    const location = useLocation();
    const state = location.state as LocationState;
    const cloudProvider = state?.cloudProvider || 'AWS';
    const [activeTab, setActiveTab] = useState<'designer' | 'projects'>('designer');

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
            <header className="h-14 border-b border-white/10 bg-slate-900 flex items-center justify-center px-4 relative">
                <div className="absolute left-4 flex items-center gap-3">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
                            <span className="text-white font-bold text-sm">CC</span>
                        </div>
                        <span className="text-lg font-bold bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent">
                            CloudCode Designer
                        </span>
                    </div>
                    {cloudProvider && activeTab === 'designer' && (
                        <span className="ml-4 px-3 py-1.5 bg-green-600/20 border border-green-500/30 rounded-md text-green-400 text-sm font-medium flex items-center gap-2">
                            {cloudProvider === 'AWS' && <><AWSLogo className="w-4 h-4" /> AWS</>}
                            {cloudProvider === 'GCP' && <><GCPLogo className="w-4 h-4" /> GCP</>}
                            {cloudProvider === 'Azure' && <><AzureLogo className="w-4 h-4" /> Azure</>}
                        </span>
                    )}
                </div>
                <nav className="flex items-center gap-2">
                    <button
                        onClick={() => setActiveTab('designer')}
                        className={`px-6 py-2 text-sm font-medium rounded-lg transition-all ${activeTab === 'designer'
                            ? 'bg-green-600 text-white border-2 border-green-500'
                            : 'text-white/60 hover:text-white hover:bg-white/5'
                            }`}
                    >
                        Designer
                    </button>
                    <button
                        onClick={() => setActiveTab('projects')}
                        className={`px-6 py-2 text-sm font-medium rounded-lg transition-all ${activeTab === 'projects'
                            ? 'bg-green-600 text-white border-2 border-green-500'
                            : 'text-white/60 hover:text-white hover:bg-white/5'
                            }`}
                    >
                        Projects
                    </button>
                </nav>
            </header>

            {/* Conditional Content */}
            {activeTab === 'designer' ? (
                /* Main Content - 3 Panel Layout */
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
            ) : (
                /* Projects View */
                <ProjectsView />
            )}
        </div>
    );
};
