import type { Node, Edge } from 'reactflow';

// Get the handle position based on relative node positions
export const getSmartEdge = (sourceNode: Node, targetNode: Node) => {
    const sourceCenter = {
        x: sourceNode.position.x + 150, // Assuming width ~300
        y: sourceNode.position.y + 100, // Assuming height ~200
    };

    const targetCenter = {
        x: targetNode.position.x + 150,
        y: targetNode.position.y + 100,
    };

    const dx = targetCenter.x - sourceCenter.x;
    const dy = targetCenter.y - sourceCenter.y;

    let sourceHandle: string = 'source-right';
    let targetHandle: string = 'target-left';

    // Prefer vertical connections if nodes are stacked
    if (Math.abs(dy) > Math.abs(dx)) {
        if (dy > 0) {
            // Target is below Source
            sourceHandle = 'source-bottom';
            targetHandle = 'target-top';
        } else {
            // Target is above Source
            sourceHandle = 'source-top';
            targetHandle = 'target-bottom';
        }
    } else {
        // Prefer horizontal connections
        if (dx > 0) {
            // Target is right of Source
            sourceHandle = 'source-right';
            targetHandle = 'target-left';
        } else {
            // Target is left of Source
            sourceHandle = 'source-left';
            targetHandle = 'target-right';
        }
    }

    return {
        sourceHandle,
        targetHandle
    };
};

export const applySmartRouting = (nodes: Node[], edges: Edge[]): Edge[] => {
    return edges.map(edge => {
        const sourceNode = nodes.find(n => n.id === edge.source);
        const targetNode = nodes.find(n => n.id === edge.target);

        if (!sourceNode || !targetNode) return edge;

        const { sourceHandle, targetHandle } = getSmartEdge(sourceNode, targetNode);

        // Only update if changed
        if (edge.sourceHandle === sourceHandle && edge.targetHandle === targetHandle) {
            return edge;
        }

        return {
            ...edge,
            sourceHandle,
            targetHandle
        };
    });
};
