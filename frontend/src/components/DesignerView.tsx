import { useEffect, useState, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useNodesState, useEdgesState, addEdge } from 'reactflow';
import type { Connection } from 'reactflow';
import { ComponentsPanel } from './ComponentsPanel';
import { DiagramCanvas } from './DiagramCanvas';
import { ChatPanel } from './ChatPanel';
import { ProjectsView } from './ProjectsView';
import { AWSLogo, GCPLogo, AzureLogo } from './CloudLogos';
import { TerraformViewer } from './TerraformViewer';
import { AnalyticsDashboard } from './AnalyticsDashboard';
import { api } from '../services/api';
import { isValidConnection, detectDanglingNodes } from '../utils/validation';
import { calculateDiff } from '../utils/diff';
import { applySmartRouting, getSmartEdge } from '../utils/smartEdges';
import { ValidationPanel } from './ValidationPanel';

interface LocationState {
    initialMessage?: string;
    cloudProvider?: string;
    nodes?: any[];
    edges?: any[];
    terraformCode?: string;
    refinedPrompt?: string;
}

export const DesignerView = () => {
    const location = useLocation();
    const state = location.state as LocationState;
    const cloudProvider = state?.cloudProvider || 'AWS';
    const [activeTab, setActiveTab] = useState<'designer' | 'projects'>('designer');
    const [viewMode, setViewMode] = useState<'diagram' | 'code' | 'analytics'>('diagram');

    // Lifted State
    const [nodes, setNodes, onNodesChange] = useNodesState(state?.nodes || []);
    const [edges, setEdges, onEdgesChange] = useEdgesState(state?.edges || []);
    const [terraformCode, setTerraformCode] = useState(state?.terraformCode || '');
    const [isLoading, setIsLoading] = useState(false);

    // Validation & Save State
    const [isSaving, setIsSaving] = useState(false);
    const [validationState, setValidationState] = useState<{
        analysis?: string;
        errors: string[];
        warnings: string[];
    }>({ errors: [], warnings: [] });
    // Keep track of the "last saved" state to calculate diffs
    const [originalDiagram, setOriginalDiagram] = useState<{ nodes: any[], edges: any[] }>({
        nodes: state?.nodes || [],
        edges: state?.edges || []
    });

    const navigate = useNavigate();

    useEffect(() => {
        // If we have state from navigation (e.g. new project or refresh with history), use that.
        // Only load from local storage if state is empty (e.g. manual URL entry or closed tab).
        if (state?.nodes?.length || state?.initialMessage || state?.terraformCode) {
            console.log('Using state from navigation, skipping local storage load');
            return;
        }

        // Load from local storage if available
        const savedState = localStorage.getItem('terraform-workbench-state');
        if (savedState) {
            try {
                const parsed = JSON.parse(savedState);
                if (parsed.nodes && parsed.nodes.length > 0) {
                    setNodes(parsed.nodes);
                    const smartEdges = applySmartRouting(parsed.nodes, parsed.edges);
                    setEdges(smartEdges);
                    setTerraformCode(parsed.terraformCode);
                    console.log('Loaded state from local storage');

                    // Also update originalDiagram to match what we loaded
                    setOriginalDiagram({
                        nodes: JSON.parse(JSON.stringify(parsed.nodes)),
                        edges: JSON.parse(JSON.stringify(parsed.edges))
                    });
                }
            } catch (e) {
                console.error('Failed to parse saved state:', e);
            }
        }
    }, [setNodes, setEdges]); // Run once on mount (or when setters change which is stable)

    useEffect(() => {
        // Log the initial message for debugging
        if (state?.initialMessage) {
            console.log('Initial message from landing page:', state.initialMessage);
            console.log('Selected cloud provider:', state.cloudProvider);
        }
    }, [state]);

    // Re-calculate edge routing when nodes move
    useEffect(() => {
        // We need to apply smart routing when nodes move, but we must avoid infinite loops.
        // applySmartRouting now checks if handles actually changed before returning a new object reference,
        // but since we are mapping, it might still return a new array.
        // Let's rely on the fact that setEdges will only trigger a re-render if the state actually changes
        // if we pass a new array reference but same content? No, React state updates always trigger if reference changes.
        // So we need to check if any edge actually changed.

        const smartEdges = applySmartRouting(nodes, edges);

        const hasChanges = smartEdges.some((edge, i) => {
            const original = edges[i];
            return edge.sourceHandle !== original?.sourceHandle ||
                edge.targetHandle !== original?.targetHandle;
        });

        if (hasChanges) {
            setEdges(smartEdges);
        }
    }, [nodes, edges, setEdges]);

    const onConnect = useCallback(
        (params: Connection) => {
            // Validation
            const sourceNode = nodes.find(n => n.id === params.source);
            const targetNode = nodes.find(n => n.id === params.target);

            if (sourceNode && targetNode) {
                const validation = isValidConnection(sourceNode, targetNode);
                if (!validation.valid) {
                    alert(`Cannot connect: ${validation.reason}`);
                    return;
                }
                if (validation.reason) {
                    console.warn(validation.reason);
                }

                // Smart Routing
                const { sourceHandle, targetHandle } = getSmartEdge(sourceNode, targetNode);

                setEdges((eds) => addEdge({
                    ...params,
                    sourceHandle,
                    targetHandle,
                    type: 'smoothstep',
                    animated: true,
                    style: {
                        stroke: '#06b6d4',
                        strokeWidth: 2.5,
                    },
                }, eds));
            }
        },
        [setEdges, nodes],
    );

    const handleSave = async () => {
        setIsSaving(true);
        setValidationState({ errors: [], warnings: [] });

        try {
            // 1. Check for dangling nodes
            const dangling = detectDanglingNodes(nodes, edges);
            if (dangling.length > 0) {
                const confirmSave = window.confirm(
                    `⚠️ ${dangling.length} unconnected components detected.\n\nContinue saving?`
                );
                if (!confirmSave) {
                    setIsSaving(false);
                    return;
                }
            }

            // 2. Calculate Diff
            const diff = calculateDiff(originalDiagram, { nodes, edges });

            // 3. Send to Backend
            const response = await api.updateInfrastructure(terraformCode, diff, { nodes, edges });

            // 4. Handle Response
            if (response.valid) {
                if (response.terraform) setTerraformCode(response.terraform);

                // Update baseline
                setOriginalDiagram({ nodes: JSON.parse(JSON.stringify(nodes)), edges: JSON.parse(JSON.stringify(edges)) });

                setValidationState({
                    analysis: response.analysis,
                    errors: [],
                    warnings: response.warnings || []
                });

                // Persist to local storage
                localStorage.setItem('terraform-workbench-state', JSON.stringify({
                    nodes,
                    edges,
                    terraformCode: response.terraform || terraformCode,
                    cloudProvider
                }));

                // Update history state so refresh works without needing to load from local storage
                navigate('.', {
                    replace: true,
                    state: {
                        ...state,
                        nodes,
                        edges,
                        terraformCode: response.terraform || terraformCode
                    }
                });
            } else {
                setValidationState({
                    analysis: response.analysis,
                    errors: response.errors || ["Unknown validation error"],
                    warnings: response.warnings || []
                });
            }

        } catch (e: any) {
            console.error(e);
            setValidationState({
                errors: [e.message || "Failed to save changes"],
                warnings: []
            });
        } finally {
            setIsSaving(false);
        }
    };

    const handleSendMessage = async (message: string) => {
        setIsLoading(true);
        try {
            // Construct current diagram context
            const currentDiagram = {
                nodes: nodes,
                edges: edges
            };

            const response = await api.generateInfrastructure(
                message,
                cloudProvider.toLowerCase(),
                terraformCode,
                currentDiagram
            );

            // Update state with new response
            // Note: We might want to merge or replace. For now, replacing is safer for consistency with backend generation.
            if (response.diagram) {
                setNodes(response.diagram.nodes);

                // Apply smart edge routing
                const smartEdges = applySmartRouting(response.diagram.nodes, response.diagram.edges);
                setEdges(smartEdges);
            }
            if (response.terraform) {
                setTerraformCode(response.terraform);
            }

            return response;
        } catch (error) {
            console.error("Failed to generate infrastructure:", error);
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

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

                    {/* Center - Diagram/Code Area */}
                    <div className="flex-1 relative flex flex-col overflow-hidden bg-slate-950">

                        {/* View Toggle - Absolute positioned */}
                        <div className="absolute top-4 right-4 z-10 bg-slate-900/90 backdrop-blur-sm border border-white/10 rounded-lg p-1 flex gap-1 shadow-xl">
                            <button
                                onClick={() => {
                                    const smartEdges = applySmartRouting(nodes, edges);
                                    setEdges(smartEdges);
                                }}
                                className="px-3 py-1.5 rounded-md text-sm font-medium text-slate-400 hover:text-white hover:bg-white/5 transition-all"
                                title="Optimize Connections"
                            >
                                ⚡
                            </button>
                            <div className="w-px bg-white/10 mx-1"></div>
                            <button
                                onClick={() => {
                                    if (window.confirm('Reset project to initial state? This will clear your saved changes.')) {
                                        localStorage.removeItem('terraform-workbench-state');
                                        window.location.reload();
                                    }
                                }}
                                className="px-3 py-1.5 rounded-md text-sm font-medium text-slate-400 hover:text-red-400 hover:bg-white/5 transition-all"
                                title="Reset Project"
                            >
                                ↺
                            </button>
                            <div className="w-px bg-white/10 mx-1"></div>
                            <button
                                onClick={handleSave}
                                disabled={isSaving}
                                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${isSaving
                                    ? 'bg-emerald-600/50 cursor-wait text-white'
                                    : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-900/20'
                                    }`}
                            >
                                {isSaving ? 'Saving...' : '💾 Save Changes'}
                            </button>
                            <div className="w-px bg-white/10 mx-1"></div>
                            <button
                                onClick={() => setViewMode('diagram')}
                                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${viewMode === 'diagram'
                                    ? 'bg-indigo-600 text-white shadow-lg'
                                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                                    }`}
                            >
                                Diagram
                            </button>
                            <button
                                onClick={() => setViewMode('code')}
                                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${viewMode === 'code'
                                    ? 'bg-indigo-600 text-white shadow-lg'
                                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                                    }`}
                            >
                                Terraform
                            </button>
                            <button
                                onClick={() => setViewMode('analytics')}
                                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${viewMode === 'analytics'
                                    ? 'bg-indigo-600 text-white shadow-lg'
                                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                                    }`}
                            >
                                Analytics
                            </button>
                        </div>

                        <ValidationPanel
                            analysis={validationState.analysis}
                            errors={validationState.errors}
                            warnings={validationState.warnings}
                            onClose={() => setValidationState({ errors: [], warnings: [] })}
                        />

                        {viewMode === 'diagram' ? (
                            <div className="flex-1 w-full h-full">
                                <DiagramCanvas
                                    nodes={nodes}
                                    edges={edges}
                                    onNodesChange={onNodesChange}
                                    onEdgesChange={onEdgesChange}
                                    onConnect={onConnect}
                                    setNodes={setNodes}
                                    setEdges={setEdges}
                                />
                            </div>
                        ) : viewMode === 'code' ? (
                            <div className="flex-1 w-full h-full overflow-hidden">
                                <TerraformViewer code={terraformCode} />
                            </div>
                        ) : (
                            <div className="flex-1 w-full h-full overflow-hidden">
                                <AnalyticsDashboard nodes={nodes} />
                            </div>
                        )}
                    </div>

                    {/* Right Panel - Chat */}
                    <ChatPanel
                        initialMessage={state?.initialMessage}
                        refinedPrompt={state?.refinedPrompt}
                        onSendMessage={handleSendMessage}
                        isLoading={isLoading}
                    />
                </div>
            ) : (
                /* Projects View */
                <ProjectsView />
            )}
        </div>
    );
};
