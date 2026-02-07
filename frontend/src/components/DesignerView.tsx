import { useEffect, useState, useCallback, useRef } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useNodesState, useEdgesState, addEdge, MarkerType } from 'reactflow';
import type { Connection } from 'reactflow';
import { ComponentsPanel } from './ComponentsPanel';
import { DiagramCanvas } from './DiagramCanvas';
import { ChatPanel, initialMessages } from './ChatPanel';
import type { Message } from './ChatPanel';
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
    projectId?: string;
    initialMessage?: string;
    cloudProvider?: string;
    projectName?: string;
    nodes?: any[];
    edges?: any[];
    terraformCode?: string;
    refinedPrompt?: string;
    chatHistory?: Message[];
}

export const DesignerView = () => {
    const { projectId } = useParams<{ projectId: string }>();
    const location = useLocation();
    // Merge state with potential URL param - URL param takes precedence for ID
    const state = location.state as LocationState;
    const effectiveProjectId = projectId || state?.projectId;

    const [cloudProvider, setCloudProvider] = useState(state?.cloudProvider || 'AWS');
    const [projectName, setProjectName] = useState(state?.projectName || 'Untitled Project');
    const [isEditingName, setIsEditingName] = useState(false);
    const [activeTab, setActiveTab] = useState<'designer' | 'projects' | 'learn'>('designer');
    const [viewMode, setViewMode] = useState<'diagram' | 'code' | 'analytics'>('diagram');

    // Lifted State
    const [nodes, setNodes, onNodesChange] = useNodesState(state?.nodes || []);
    const [edges, setEdges, onEdgesChange] = useEdgesState(state?.edges || []);
    const [terraformCode, setTerraformCode] = useState(state?.terraformCode || '');
    const [messages, setMessages] = useState<Message[]>(state?.chatHistory || initialMessages);
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
        // If we have a projectId in URL but no state data, fetch it
        if (projectId && (!state?.nodes || state?.projectId !== projectId)) {
            const fetchProject = async () => {
                setIsLoading(true);
                try {
                    console.log('Fetching project from URL ID:', projectId);
                    const project = await api.projects.get(projectId);

                    setNodes(project.diagram?.nodes || []);
                    setEdges(project.diagram?.edges || []);
                    setTerraformCode(project.terraform || '');
                    setMessages(project.chat_history || initialMessages);
                    setProjectName(project.title);
                    setCloudProvider(project.provider);

                    // Update original baseline for diffing
                    setOriginalDiagram({
                        nodes: JSON.parse(JSON.stringify(project.diagram?.nodes || [])),
                        edges: JSON.parse(JSON.stringify(project.diagram?.edges || []))
                    });

                } catch (e) {
                    console.error('Failed to fetch project:', e);
                    // Could redirect to 404 or projects list here
                } finally {
                    setIsLoading(false);
                }
            };
            fetchProject();
        }
    }, [projectId, state, setNodes, setEdges]);

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

    // Track project loading state to prevent premature saving
    const [isProjectLoaded, setIsProjectLoaded] = useState(false);
    const prevNodesLength = useRef(nodes.length);

    // Initial load effect update
    useEffect(() => {
        if (state?.nodes) {
            setIsProjectLoaded(true);
            prevNodesLength.current = state.nodes.length;
        }
    }, []); // Run once on mount if state exists

    const handleSave = async (options?: { skipConfirmation?: boolean }) => {
        setIsSaving(true);
        setValidationState({ errors: [], warnings: [] });

        try {
            // 1. Check for dangling nodes (skip if auto-saving deletion)
            if (!options?.skipConfirmation) {
                const dangling = detectDanglingNodes(nodes, edges);
                if (dangling.length > 0) {
                    const confirmSave = window.confirm(
                        `⚠️ ${dangling.length} unconnected components detected.\n\nContinue saving?`
                    );
                    if (!confirmSave) {
                        setIsProjectLoaded(true); // Added as per instruction
                        return;
                    }
                }
            }

            // 2. Calculate Diff
            const diff = calculateDiff(originalDiagram, { nodes, edges });

            // 3. Send to Backend for Terraform update
            const response = await api.updateInfrastructure(terraformCode, diff, { nodes, edges });

            // 4. Handle Response
            if (response.valid) {
                const updatedTerraform = response.terraform || terraformCode;
                if (response.terraform) setTerraformCode(updatedTerraform);

                // Update baseline
                setOriginalDiagram({ nodes: JSON.parse(JSON.stringify(nodes)), edges: JSON.parse(JSON.stringify(edges)) });

                setValidationState({
                    analysis: response.analysis,
                    errors: [],
                    warnings: response.warnings || []
                });

                // 5. Persist to MongoDB if we have a project ID
                // 5. Persist to MongoDB
                let finalProjectId = effectiveProjectId;

                if (finalProjectId) {
                    await api.projects.update(finalProjectId, {
                        diagram: { nodes: nodes as any, edges: edges as any },
                        terraform: updatedTerraform,
                        chat_history: messages,
                    });
                    console.log('✅ Project saved to database');
                } else {
                    // Create new project
                    const newProject = await api.projects.create({
                        title: projectName,
                        provider: cloudProvider,
                        diagram: { nodes: nodes as any, edges: edges as any },
                        terraform: updatedTerraform,
                        chat_history: messages,
                    });
                    finalProjectId = newProject.id;
                    console.log('✅ New Project created in database');
                }

                // Update URL if it was a new project
                if (!projectId && finalProjectId) {
                    navigate(`/designer/${finalProjectId}`, { replace: true });
                }

                // Update history state so refresh works
                navigate('.', {
                    replace: true,
                    state: {
                        ...state,
                        projectId: finalProjectId,
                        nodes,
                        edges,
                        terraformCode: updatedTerraform,
                        chatHistory: messages,
                    }
                });
            } else {
                // Validation failed - Revert changes to prevent invalid state in UI
                console.warn('❌ Validation failed, reverting changes...');
                setNodes(JSON.parse(JSON.stringify(originalDiagram.nodes)));
                setEdges(JSON.parse(JSON.stringify(originalDiagram.edges)));

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

    // Auto-save on deletion
    useEffect(() => {
        if (!isProjectLoaded || isLoading) {
            prevNodesLength.current = nodes.length;
            return;
        }

        // Check if nodes were deleted
        if (nodes.length < prevNodesLength.current) {
            console.log('🗑️ Deletion detected, auto-saving...');
            // wrap in timeout to ensure state is settled? Not strictly necessary in effect but good practice
            const timer = setTimeout(() => {
                handleSave({ skipConfirmation: true });
            }, 500); // 500ms debounce/delay to let things settle
            prevNodesLength.current = nodes.length;
            return () => clearTimeout(timer);
        }

        prevNodesLength.current = nodes.length;
    }, [nodes, isProjectLoaded, isLoading]); // Dependency on nodes triggers check

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

    const handleUpdateProjectName = async () => {
        setIsEditingName(false);
        if (projectName === state?.projectName) return; // No change

        if (effectiveProjectId) {
            try {
                await api.projects.update(effectiveProjectId, { title: projectName });
                console.log('✅ Project name updated');
                // Update navigation state to reflect new name without reloading
                navigate('.', {
                    replace: true,
                    state: { ...state, projectName }
                });
            } catch (e) {
                console.error('Failed to update project name:', e);
                // Optionally revert name on failure
            }
        }
    };

    const handleClearCanvas = () => {
        setNodes([]);
        setEdges([]);
    };

    const handleNodeDataChange = (id: string, newData: any) => {
        setNodes((nds) => nds.map((node) => {
            if (node.id === id) {
                return {
                    ...node,
                    data: {
                        ...node.data,
                        ...newData
                    }
                };
            }
            return node;
        }));
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
                    {cloudProvider && (
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
                                    onBlur={handleUpdateProjectName}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') handleUpdateProjectName();
                                        if (e.key === 'Escape') {
                                            setProjectName(state?.projectName || 'Untitled Project');
                                            setIsEditingName(false);
                                        }
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
                            onClick={() => navigate('/projects')}
                            className="px-4 py-1.5 text-sm font-medium rounded-md transition-all text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-white/5"
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

            {/* Main Content - 3 Panel Layout */}
            <div className="flex-1 flex overflow-hidden">
                {activeTab === 'designer' ? (
                    <>
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
                                    onClick={() => handleSave()}
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
                                        onClear={handleClearCanvas}
                                        onNodeDataChange={handleNodeDataChange}
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
                                    messages={messages}
                                    setMessages={setMessages}
                                />
                            </div>
                        ) : (
                            <button
                                onClick={() => setIsChatOpen(true)}
                                className="fixed bottom-8 right-8 w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-full shadow-2xl shadow-green-500/50 flex items-center justify-center z-50 transition-all hover:scale-110 border-2 border-green-400/30"
                                title="Open AI Chat"
                            >
                                <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                                </svg>
                            </button>
                        )}
                    </>
                ) : (
                    /* Learn View */
                    <LearnView />
                )}
            </div>
        </div>
    );
};
