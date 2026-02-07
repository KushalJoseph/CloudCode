import { useCallback, useState } from 'react';
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

            const newNode: Node = {
                id: `${component.id}-${Date.now()}`,
                type: 'custom',
                position,
                data: {
                    label: component.name,
                    type: component.id,
                    icon: component.icon,
                    color: getColorForCategory(component.category),
                    description: component.description,
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

    const handleNodeClick = useCallback((_event: React.MouseEvent, node: Node) => {
        setSelectedNode({
            id: node.id,
            label: node.data.label,
            type: node.data.type,
            icon: node.data.icon,
            color: node.data.color,
            description: node.data.description,
        });
        setIsModalOpen(true);
    }, []);

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedNode(null);
    };

    const handleClear = () => {
        setNodes([]);
        setEdges([]);
    };

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
                    edges={edges}
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                    onConnect={onConnect}
                    onNodeClick={handleNodeClick}
                    nodeTypes={nodeTypes}
                    defaultEdgeOptions={defaultEdgeOptions}
                    connectionMode={ConnectionMode.Loose}
                    fitView
                    className="bg-slate-950"
                >
                    <Background
                        variant={BackgroundVariant.Dots}
                        color="#334155"
                        gap={20}
                        size={2}
                    />
                    <ZoomControls onClear={handleClear} />
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
        <div className="absolute bottom-4 right-4 flex flex-col gap-2 z-10">
            <button
                onClick={() => zoomIn()}
                className="w-10 h-10 rounded-lg bg-slate-800/90 hover:bg-slate-700 border border-white/10 text-white flex items-center justify-center shadow-lg transition-all hover:scale-105"
                title="Zoom In"
            >
                <span className="text-lg">+</span>
            </button>
            <button
                onClick={() => zoomOut()}
                className="w-10 h-10 rounded-lg bg-slate-800/90 hover:bg-slate-700 border border-white/10 text-white flex items-center justify-center shadow-lg transition-all hover:scale-105"
                title="Zoom Out"
            >
                <span className="text-lg">−</span>
            </button>
            <div className="w-10 h-px bg-white/20 my-1" />
            <button
                onClick={onClear}
                className="w-10 h-10 rounded-lg bg-slate-800/90 hover:bg-red-600 border border-white/10 text-white flex items-center justify-center shadow-lg transition-all hover:scale-105"
                title="Clear Canvas"
            >
                <span className="text-lg">🗑️</span>
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
