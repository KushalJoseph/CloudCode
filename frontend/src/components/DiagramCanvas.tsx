import { useCallback, useState } from 'react';
import ReactFlow, {
    Background,
    Controls,
    MiniMap,
    useNodesState,
    useEdgesState,
    ConnectionMode,
    BackgroundVariant,
    addEdge,
} from 'reactflow';
import type { Node, Connection } from 'reactflow';
import 'reactflow/dist/style.css';

import { CustomNode } from './CustomNode';
import { initialNodes, initialEdges } from '../data/diagramNodes';

const nodeTypes = {
    custom: CustomNode
};

export const DiagramCanvas = () => {
    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
    const [showGrid, setShowGrid] = useState(true);

    const onConnect = useCallback(
        (params: Connection) => setEdges((eds) => addEdge(params, eds)),
        [setEdges],
    );

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
                    nodeTypes={nodeTypes}
                    connectionMode={ConnectionMode.Loose}
                    fitView
                    className="bg-slate-950"
                >
                    {showGrid && (
                        <Background
                            variant={BackgroundVariant.Dots}
                            color="#334155"
                            gap={20}
                            size={2}
                        />
                    )}
                    <Controls
                        className="!bg-slate-800 !border-white/10 !shadow-lg"
                        showInteractive={false}
                    />
                    <MiniMap
                        className="!bg-slate-800 !border-white/10"
                        maskColor="rgba(15, 23, 42, 0.8)"
                        nodeColor="#3b82f6"
                    />
                </ReactFlow>
            </div>

            {/* Bottom Toolbar */}
            <div className="h-14 border-t border-white/10 bg-slate-900 flex items-center justify-center gap-2 px-4">
                <button className="p-2 rounded-md bg-slate-800 hover:bg-slate-700 text-white/60 hover:text-white" title="Zoom In">
                    🔍+
                </button>
                <button className="p-2 rounded-md bg-slate-800 hover:bg-slate-700 text-white/60 hover:text-white" title="Zoom Out">
                    🔍-
                </button>
                <button className="p-2 rounded-md bg-slate-800 hover:bg-slate-700 text-white/60 hover:text-white" title="Fit View">
                    ⛶
                </button>
                <div className="w-px h-6 bg-white/10 mx-2" />
                <button
                    onClick={() => setShowGrid(!showGrid)}
                    className={`p-2 rounded-md ${showGrid ? 'bg-green-600 text-white' : 'bg-slate-800 text-white/60'} hover:opacity-80`}
                    title="Toggle Grid"
                >
                    ⊞
                </button>
                <button
                    onClick={handleClear}
                    className="p-2 rounded-md bg-slate-800 hover:bg-red-600 text-white/60 hover:text-white"
                    title="Clear Canvas"
                >
                    🗑️
                </button>
                <button className="p-2 rounded-md bg-slate-800 hover:bg-slate-700 text-white/60 hover:text-white" title="Download">
                    ⬇️
                </button>
                <div className="w-px h-6 bg-white/10 mx-2" />
                <button className="px-4 py-2 rounded-md bg-green-600 hover:bg-green-700 text-white font-medium" title="Run">
                    ▶ Run
                </button>
            </div>
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
