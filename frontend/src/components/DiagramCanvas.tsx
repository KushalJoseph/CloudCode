import { useCallback, useState } from 'react';
import ReactFlow, {
    Background,
    ConnectionMode,
    BackgroundVariant,
    useReactFlow,
} from 'reactflow';
import type { Node, Connection } from 'reactflow';
import 'reactflow/dist/style.css';

import { CustomNode } from './CustomNode';
import { NodePropertiesModal } from './NodePropertiesModal';

const nodeTypes = {
    custom: CustomNode
};

interface DiagramCanvasProps {
    nodes: Node[];
    edges: any[];
    onNodesChange: any;
    onEdgesChange: any;
    onConnect: (params: Connection) => void;
    setNodes: any;
    setEdges: any;
}

export const DiagramCanvas = ({
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    setNodes,
    setEdges
}: DiagramCanvasProps) => {
    // Removed local state hooks as we now use props

    const [selectedNode, setSelectedNode] = useState<{ id: string; label: string; type: string; icon: string; color: string; description: string; resourceType?: string; terraformParams?: any; cost?: string } | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedEdge, setSelectedEdge] = useState<string | null>(null);

    // onConnect is now passed as prop

    const defaultEdgeOptions = {
        type: 'smoothstep' as const,
        animated: true,
        style: {
            stroke: '#06b6d4',
            strokeWidth: 2.5,
            cursor: 'pointer',
        },
    };

    const handleDrop = useCallback(
        (event: React.DragEvent) => {
            event.preventDefault();

            const data = event.dataTransfer.getData('application/json');
            if (!data) return;

            const component = JSON.parse(data);
            const reactFlowBounds = event.currentTarget.getBoundingClientRect();
            const position = {
                x: event.clientX - reactFlowBounds.left - 90,
                y: event.clientY - reactFlowBounds.top - 40,
            };

            const nodeId = `${component.id}-${Date.now()}`;
            const newNode: Node = {
                id: nodeId,
                type: 'custom',
                position,
                data: {
                    label: component.name,
                    service: component.name, // Required by backend schema
                    type: component.id,
                    icon: component.icon,
                    color: getColorForCategory(component.category),
                    description: component.description,
                    resourceType: component.resourceType || component.id,
                    terraformParams: component.terraformParams,
                    cost: component.cost,
                },
            };

            setNodes((nds: Node[]) => [...nds, newNode]);
        },
        [setNodes]
    );

    const handleDragOver = (event: React.DragEvent) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'copy';
    };

    const handleNodeEdit = useCallback((id: string, label: string, type: string, icon: string, color: string, description: string, resourceType?: string, terraformParams?: any, cost?: string) => {
        setSelectedNode({
            id,
            label,
            type,
            icon,
            color,
            description,
            resourceType,
            terraformParams,
            cost,
        });
        setIsModalOpen(true);
    }, []);

    const handleNodeClick = useCallback((_event: React.MouseEvent, node: Node) => {
        handleNodeEdit(
            node.id,
            node.data.label,
            node.data.type,
            node.data.icon,
            node.data.color,
            node.data.description,
            node.data.resourceType,
            node.data.terraformParams,
            node.data.cost
        );
    }, [handleNodeEdit]);

    const handleEdgeClick = useCallback((_event: React.MouseEvent, edge: any) => {
        setSelectedEdge(edge.id);
    }, []);

    const handleDeleteEdge = () => {
        if (selectedEdge) {
            setEdges((eds: any[]) => eds.filter((e) => e.id !== selectedEdge));
            setSelectedEdge(null);
        }
    };

    const handleClearCanvas = () => {
        setNodes([]);
        setEdges([]);
        setSelectedEdge(null);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedNode(null);
    };

    // Update edge styles based on selection
    const styledEdges = edges.map((edge) => ({
        ...edge,
        style: {
            ...edge.style,
            stroke: edge.id === selectedEdge ? '#ef4444' : '#06b6d4',
            strokeWidth: edge.id === selectedEdge ? 3.5 : 2.5,
        },
        animated: edge.id === selectedEdge ? false : true,
    }));

    return (
        <div className="h-full w-full flex flex-col">
            {/* Canvas */}
            <div
                className="flex-1"
                onDrop={handleDrop}
                onDragOver={handleDragOver}
            >
                <ReactFlow
                    nodes={nodes}
                    edges={styledEdges}
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                    onConnect={onConnect}
                    onNodeClick={handleNodeClick}
                    onEdgeClick={handleEdgeClick}
                    onPaneClick={() => setSelectedEdge(null)}
                    nodeTypes={nodeTypes}
                    defaultEdgeOptions={defaultEdgeOptions}
                    connectionMode={ConnectionMode.Loose}
                    connectionRadius={50}
                    connectOnClick={true}
                    isValidConnection={() => true}
                    nodesDraggable={true}
                    nodesConnectable={true}
                    nodesFocusable={false}
                    elementsSelectable={false}
                    selectNodesOnDrag={false}
                    panOnDrag={true}
                    fitView
                    className="bg-slate-950"
                >
                    <Background variant={BackgroundVariant.Dots} gap={12} size={1} color="#1e293b" />
                    <ZoomControls onClear={handleClearCanvas} />
                    {selectedEdge && (
                        <EdgeDeleteButton onDelete={handleDeleteEdge} />
                    )}
                </ReactFlow>
            </div>

            {/* Node Properties Modal */}
            <NodePropertiesModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                nodeData={selectedNode}
            />


        </div>
    );
};

// Zoom Controls Component - Must be inside ReactFlow
const ZoomControls = ({ onClear }: { onClear: () => void }) => {
    const { zoomIn, zoomOut, getNodes } = useReactFlow();

    const handleDownload = async () => {
        try {
            const { toPng } = await import('html-to-image');
            const { getRectOfNodes, getTransformForBounds } = await import('reactflow');

            const nodes = getNodes();
            if (nodes.length === 0) return;

            // Calculate the bounds of all nodes
            const nodesBounds = getRectOfNodes(nodes);
            
            // Calculate a transform that centers the nodes in the viewport
            // and adds some padding
            const transform = getTransformForBounds(
                nodesBounds,
                nodesBounds.width,
                nodesBounds.height,
                0.5, // minZoom (optional)
                2,   // maxZoom (optional)
                0.1  // padding
            );

            // Select the viewport element (ReactFlow specific class)
            // We use querySelector inside the react-flow container
            const viewport = document.querySelector('.react-flow__viewport') as HTMLElement;
            
            if (!viewport) return;

            const dataUrl = await toPng(viewport, {
                backgroundColor: '#020617', // slate-950
                width: nodesBounds.width + 100, // Add some padding to image
                height: nodesBounds.height + 100,
                style: {
                    width: `${nodesBounds.width}px`,
                    height: `${nodesBounds.height}px`,
                    transform: `translate(${transform[0]}px, ${transform[1]}px) scale(${transform[2]})`,
                },
            });

            const link = document.createElement('a');
            link.download = 'infrastructure-diagram.png';
            link.href = dataUrl;
            link.click();
        } catch (error) {
            console.error('Failed to download diagram:', error);
            alert('Failed to download diagram. See console for details.');
        }
    };

    return (
        <div className="absolute bottom-6 left-6 flex flex-col gap-2 z-10">
            <button
                onClick={() => zoomIn()}
                className="w-10 h-10 bg-slate-800 hover:bg-slate-700 border border-white/20 rounded-lg text-white font-bold flex items-center justify-center transition-all hover:scale-105"
                title="Zoom In"
            >
                +
            </button>
            <button
                onClick={() => zoomOut()}
                className="w-10 h-10 bg-slate-800 hover:bg-slate-700 border border-white/20 rounded-lg text-white font-bold flex items-center justify-center transition-all hover:scale-105"
                title="Zoom Out"
            >
                −
            </button>
            <button
                onClick={handleDownload}
                className="w-10 h-10 bg-slate-800 hover:bg-slate-700 border border-white/20 rounded-lg text-white font-bold flex items-center justify-center transition-all hover:scale-105"
                title="Download Diagram (PNG)"
            >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="7 10 12 15 17 10" />
                    <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
            </button>
            <button
                onClick={onClear}
                className="w-10 h-10 bg-red-600 hover:bg-red-700 border border-red-500/30 rounded-lg text-white font-bold flex items-center justify-center transition-all hover:scale-105"
                title="Clear Canvas"
            >
                🗑️
            </button>
        </div>
    );
};

// Edge Delete Button Component - Shows when edge is selected
const EdgeDeleteButton = ({ onDelete }: { onDelete: () => void }) => {
    return (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50">
            <button
                onClick={onDelete}
                className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 border-2 border-white text-white font-semibold flex items-center gap-2 shadow-xl transition-all hover:scale-105"
            >
                <span>🗑️</span>
                <span>Delete Connection</span>
            </button>
        </div>
    );
};

function getColorForCategory(category: string): string {
    const colors: Record<string, string> = {
        'Compute': 'blue',
        'Networking': 'cyan',
        'Database': 'purple',
        'Storage': 'orange',
        'Integration': 'green',
    };
    return colors[category] || 'blue';
}
