import { useCallback, useState, useEffect } from 'react';
import ReactFlow, {
    Background,
    useNodesState,
    useEdgesState,
    ConnectionMode,
    BackgroundVariant,
    addEdge,
    useReactFlow,
} from 'reactflow';
import type { Node, Connection } from 'reactflow';
import 'reactflow/dist/style.css';

import { CustomNode } from './CustomNode';
import { NodePropertiesModal } from './NodePropertiesModal';
import { initialNodes, initialEdges } from '../data/diagramNodes';

const nodeTypes = {
    custom: CustomNode
};

export const DiagramCanvas = () => {
    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
    const [selectedNode, setSelectedNode] = useState<{ id: string; label: string; type: string; icon: string; color: string; description: string } | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedEdge, setSelectedEdge] = useState<string | null>(null);

    const onConnect = useCallback(
        (params: Connection) => setEdges((eds) => addEdge({
            ...params,
            type: 'smoothstep',
            animated: true,
            style: {
                stroke: '#06b6d4',
                strokeWidth: 2.5,
            },
        }, eds)),
        [setEdges],
    );

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
                    type: component.id,
                    icon: component.icon,
                    color: getColorForCategory(component.category),
                    description: component.description,
                    onEdit: () => handleNodeEdit(nodeId, component.name, component.id, component.icon, getColorForCategory(component.category), component.description),
                },
            };

            setNodes((nds) => [...nds, newNode]);
        },
        [setNodes]
    );

    const handleDragOver = (event: React.DragEvent) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'copy';
    };

    const handleNodeEdit = useCallback((id: string, label: string, type: string, icon: string, color: string, description: string) => {
        setSelectedNode({
            id,
            label,
            type,
            icon,
            color,
            description,
        });
        setIsModalOpen(true);
    }, []);

    // Ensure all nodes have the onEdit callback
    useEffect(() => {
        setNodes((nds) =>
            nds.map((node) => ({
                ...node,
                data: {
                    ...node.data,
                    onEdit: () => handleNodeEdit(
                        node.id,
                        node.data.label,
                        node.data.type,
                        node.data.icon,
                        node.data.color,
                        node.data.description
                    ),
                },
            }))
        );
    }, [handleNodeEdit, setNodes]);

    const handleEdgeClick = useCallback((_event: React.MouseEvent, edge: any) => {
        setSelectedEdge(edge.id);
    }, []);

    const handleDeleteEdge = () => {
        if (selectedEdge) {
            setEdges((eds) => eds.filter((e) => e.id !== selectedEdge));
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
    const { zoomIn, zoomOut } = useReactFlow();

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
