import { useEffect, useState, useCallback, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useNodesState, useEdgesState, addEdge, MarkerType } from 'reactflow';
import type { Connection } from 'reactflow';
import { ComponentsPanel } from './ComponentsPanel';
import { DiagramCanvas } from './DiagramCanvas';
import { ChatPanel } from './ChatPanel';
import { ProjectsView } from './ProjectsView';
import { LearnView } from './LearnView';
import awsLogo from '../assets/aws_logo.png';
import gcpLogo from '../assets/google_logo.svg';
import azureLogo from '../assets/azure_logo.svg';
import { TerraformViewer } from './TerraformViewer';
import { AnalyticsDashboard } from './AnalyticsDashboard';
import { api } from '../services/api';
import { isValidConnection, detectDanglingNodes } from '../utils/validation';
import { calculateDiff } from '../utils/diff';
import { applySmartRouting, getSmartEdge } from '../utils/smartEdges';
import { ValidationPanel } from './ValidationPanel';
import { ThemeToggle } from './ThemeToggle';

interface LocationState {
    initialMessage?: string;
    cloudProvider?: string;
    projectName?: string;
    nodes?: any[];
    edges?: any[];
    terraformCode?: string;
    refinedPrompt?: string;
}

export const DesignerView = () => {
    const location = useLocation();
    const state = location.state as LocationState;
    const cloudProvider = state?.cloudProvider || 'AWS';
    const [projectName, setProjectName] = useState(state?.projectName || 'Untitled Project');
    const [isEditingName, setIsEditingName] = useState(false);
    const [activeTab, setActiveTab] = useState<'designer' | 'projects' | 'learn'>('designer');
    const [viewMode, setViewMode] = useState<'diagram' | 'code' | 'analytics'>('diagram');

    // Lifted State
    const [nodes, setNodes, onNodesChange] = useNodesState(state?.nodes || []);
    const [edges, setEdges, onEdgesChange] = useEdgesState(state?.edges || []);
    const [terraformCode, setTerraformCode] = useState(state?.terraformCode || '');
    const [isLoading, setIsLoading] = useState(false);

    // Validation & Save State
    const [isSaving, setIsSaving] = useState(false);
    
    // Layout State
    const [leftPanelWidth, setLeftPanelWidth] = useState(240);
    const [rightPanelWidth, setRightPanelWidth] = useState(400);
    const [isChatOpen, setIsChatOpen] = useState(true);
    const isResizing = useRef(false);
    const currentResizePanel = useRef<'left' | 'right' | null>(null);

    const startResizing = useCallback((e: React.MouseEvent, panel: 'left' | 'right') => {
        e.preventDefault();
        isResizing.current = true;
        currentResizePanel.current = panel;
        document.body.style.cursor = 'col-resize';
        document.body.style.userSelect = 'none';
    }, []);

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (!isResizing.current || !currentResizePanel.current) return;

            if (currentResizePanel.current === 'left') {
                const newWidth = Math.max(200, Math.min(600, e.clientX));
                setLeftPanelWidth(newWidth);
            } else {
                const newWidth = Math.max(300, Math.min(800, window.innerWidth - e.clientX));
                setRightPanelWidth(newWidth);
            }
        };

        const handleMouseUp = () => {
            isResizing.current = false;
            currentResizePanel.current = null;
            document.body.style.cursor = '';
            document.body.style.userSelect = '';
        };

        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, []);

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

                console.log('🔗 Smart Connection:', {
                    source: sourceNode.id,
                    target: targetNode.id,
                    sourceHandle,
                    targetHandle,
                    dy: targetNode.position.y - sourceNode.position.y
                });

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
                    markerEnd: {
                        type: MarkerType.ArrowClosed,
                        color: '#06b6d4',
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

                // Add arrow markers
                const edgesWithArrows = smartEdges.map((edge: any) => ({
                    ...edge,
                    markerEnd: {
                        type: MarkerType.ArrowClosed,
                        color: '#06b6d4',
                    },
                    style: {
                        stroke: '#06b6d4',
                        strokeWidth: 2.5,
                    }
                }));

                setEdges(edgesWithArrows);
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
        <div className="h-screen flex flex-col bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
            {/* Header */}
            <header className="h-14 border-b border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 flex items-center justify-between px-4 relative transition-colors duration-300">
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center shadow-sm">
                            <span className="text-white font-bold text-sm">CC</span>
                        </div>
                        <span className="text-lg font-bold bg-gradient-to-r from-green-600 to-emerald-600 dark:from-green-400 dark:to-emerald-500 bg-clip-text text-transparent">
                            CloudCode Designer
                        </span>
                    </div>
                    {cloudProvider && activeTab === 'designer' && (
                        <div className="ml-4 px-3 py-1.5 bg-green-50 dark:bg-green-600/20 border border-green-200 dark:border-green-500/30 rounded-md text-green-700 dark:text-green-400 text-sm font-medium flex items-center gap-2">
                            {cloudProvider === 'AWS' && <img src={awsLogo} alt="AWS" className="w-4 h-4 object-contain" />}
                            {cloudProvider === 'GCP' && <img src={gcpLogo} alt="GCP" className="w-4 h-4 object-contain" />}
                            {cloudProvider === 'Azure' && <img src={azureLogo} alt="Azure" className="w-4 h-4 object-contain" />}
                            <span className="text-green-400 dark:text-green-500/60">|</span>
                            {isEditingName ? (
                                <input
                                    type="text"
                                    value={projectName}
                                    onChange={(e) => setProjectName(e.target.value)}
                                    onBlur={() => setIsEditingName(false)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') setIsEditingName(false);
                                        if (e.key === 'Escape') setIsEditingName(false);
                                    }}
                                    autoFocus
                                    className="bg-transparent border-none outline-none text-green-700 dark:text-green-400 font-medium text-sm w-40 focus:ring-0"
                                />
                            ) : (
                                <span 
                                    onClick={() => setIsEditingName(true)}
                                    className="cursor-pointer hover:underline hover:text-green-600 dark:hover:text-green-300 transition-colors"
                                    title="Click to edit project name"
                                >
                                    {projectName}
                                </span>
                            )}
                        </div>
                    )}
                </div>

                <div className="absolute left-1/2 transform -translate-x-1/2 flex items-center gap-2">
                     <nav className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800/50 p-1 rounded-lg border border-slate-200 dark:border-white/5">
                        <button
                            onClick={() => setActiveTab('designer')}
                            className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${activeTab === 'designer'
                                ? 'bg-white dark:bg-slate-700 text-green-700 dark:text-green-400 shadow-sm'
                                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-white/5'
                                }`}
                        >
                            Designer
                        </button>
                        <button
                            onClick={() => setActiveTab('projects')}
                            className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${activeTab === 'projects'
                                ? 'bg-white dark:bg-slate-700 text-green-700 dark:text-green-400 shadow-sm'
                                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-white/5'
                                }`}
                        >
                            Projects
                        </button>
                        <button
                            onClick={() => setActiveTab('learn')}
                            className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${activeTab === 'learn'
                                ? 'bg-white dark:bg-slate-700 text-green-700 dark:text-green-400 shadow-sm'
                                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-white/5'
                                }`}
                        >
                            Learn
                        </button>
                    </nav>
                </div>

                <div className="flex items-center gap-3">
                     <ThemeToggle />
                </div>
            </header>

            {/* Conditional Content */}
            {activeTab === 'designer' ? (
                /* Main Content - 3 Panel Layout */
                <div className="flex-1 flex overflow-hidden">
                    {/* Left Panel - Components */}
                    <div style={{ width: leftPanelWidth }} className="flex-shrink-0 flex flex-col relative bg-slate-50 dark:bg-slate-900 border-r border-slate-200 dark:border-white/10 transition-colors duration-300">
                        <ComponentsPanel cloudProvider={cloudProvider} />
                        
                        {/* Right Resize Handle */}
                        <div
                            className="absolute top-0 right-[-4px] w-[8px] h-full cursor-col-resize z-20 hover:bg-green-500/50 transition-colors opacity-0 hover:opacity-100"
                            onMouseDown={(e) => startResizing(e, 'left')}
                        />
                    </div>

                    {/* Center - Diagram/Code Area */}
                    <div className="flex-1 relative flex flex-col overflow-hidden bg-white dark:bg-slate-950 min-w-0 transition-colors duration-300">

                        {/* View Toggle - Absolute positioned */}
                        <div className="absolute top-4 right-4 z-10 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm border border-slate-200 dark:border-white/10 rounded-lg p-1 flex gap-1 shadow-lg shadow-slate-200/50 dark:shadow-none">
                            <button
                                onClick={handleSave}
                                disabled={isSaving}
                                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${isSaving
                                    ? 'bg-emerald-600/50 cursor-wait text-white'
                                    : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-500/20 dark:shadow-emerald-900/20'
                                    }`}
                            >
                                {isSaving ? 'Saving...' : 'Save Changes'}
                            </button>
                            <div className="w-px bg-slate-200 dark:bg-white/10 mx-1"></div>
                            <button
                                onClick={() => setViewMode('diagram')}
                                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${viewMode === 'diagram'
                                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20 dark:shadow-none'
                                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5'
                                    }`}
                            >
                                Diagram
                            </button>
                            <button
                                onClick={() => setViewMode('code')}
                                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${viewMode === 'code'
                                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20 dark:shadow-none'
                                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5'
                                    }`}
                            >
                                Terraform
                            </button>
                            <button
                                onClick={() => setViewMode('analytics')}
                                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${viewMode === 'analytics'
                                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20 dark:shadow-none'
                                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5'
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
                    {isChatOpen ? (
                        <div style={{ width: rightPanelWidth }} className="flex-shrink-0 flex flex-col relative h-[calc(100vh-56px)] bg-slate-50 dark:bg-slate-900 border-l border-slate-200 dark:border-white/10 transition-colors duration-300">
                            {/* Left Resize Handle */}
                            <div
                                className="absolute top-0 left-[-4px] w-[8px] h-full cursor-col-resize z-20 hover:bg-green-500/50 transition-colors opacity-0 hover:opacity-100"
                                onMouseDown={(e) => startResizing(e, 'right')}
                            />
                            
                            <ChatPanel
                                initialMessage={state?.initialMessage}
                                refinedPrompt={state?.refinedPrompt}
                                onSendMessage={handleSendMessage}
                                isLoading={isLoading}
                                isOpen={isChatOpen}
                                onClose={() => setIsChatOpen(false)}
                            />
                        </div>
                    ) : (
                         <button
                            onClick={() => setIsChatOpen(true)}
                            className="fixed bottom-8 right-8 w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-full shadow-2xl shadow-green-500/50 flex items-center justify-center z-50 transition-all hover:scale-110 border-2 border-green-400/30"
                            title="Open AI Chat"
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth={2}
                                stroke="currentColor"
                                className="w-7 h-7"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z"
                                />
                            </svg>
                        </button>
                    )}
                </div>
            ) : activeTab === 'projects' ? (
                /* Projects View */
                <ProjectsView />
            ) : (
                /* Learn View */
                <LearnView />
            )}
        </div>
    );
};
