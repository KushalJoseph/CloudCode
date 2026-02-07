import dagre from 'dagre';
import type { Node, Edge } from 'reactflow';
import { Position } from 'reactflow';

const dagreGraph = new dagre.graphlib.Graph();
dagreGraph.setDefaultEdgeLabel(() => ({}));

// Extent of nodes for dagre to consider
const nodeWidth = 200;
const nodeHeight = 80;

export const getLayoutedElements = (nodes: Node[], edges: Edge[], direction = 'TB') => {
    const isHorizontal = direction === 'LR';
    dagreGraph.setGraph({ rankdir: direction, compound: true });

    // 1. Add nodes to dagre
    nodes.forEach((node) => {
        // If it's a group, we might want to size it differently or handle it specially
        // For now, let's just layout everything flattened if we don't handle compound graphs
        // But dagre supports compound graphs!
        // const isGroup = node.data.isGroup;

        // We need to pass dimensions. If style has width/height, use them.
        const width = node.style?.width ? Number(node.style.width) : nodeWidth;
        const height = node.style?.height ? Number(node.style.height) : nodeHeight;

        dagreGraph.setNode(node.id, { width, height });

        if (node.parentNode) {
            dagreGraph.setParent(node.id, node.parentNode);
        }
    });

    // 2. Add edges
    edges.forEach((edge) => {
        dagreGraph.setEdge(edge.source, edge.target);
    });

    // 3. Layout
    dagre.layout(dagreGraph);

    // 4. Update node positions
    const layoutedNodes = nodes.map((node) => {
        const nodeWithPosition = dagreGraph.node(node.id);

        // We are shifting the dagre node position (anchor=center center) to the top left
        // so it matches the React Flow node anchor point (top left).

        // However, if the node has a parent, the position is RELATIVE to the parent.
        // Dagre returns absolute positions (or relative to the group in compound mode?)
        // In compound mode, coordinates are relative to the graph origin, but for children they need to be relative to parent.
        // Wait, dagre compound graph coordinates are global. usage with React Flow requires converting back to relative if using parentNode.

        // Actually, React Flow + Dagre compound examples usually suggest flattening or being careful.
        // Let's rely on simple dagre for top-level, and maybe simple grid for children if dagre fails on compound.
        // But let's try strict dagre compound first.

        // If node has parent, we need to calculate relative position.
        // Parent's position in dagre is global top-left (after shift). 
        // Child's position in dagre is global top-left (after shift).
        // Child relative = Child global - Parent global.

        const nodeWidth = node.style?.width ? Number(node.style.width) : 200;
        const nodeHeight = node.style?.height ? Number(node.style.height) : 80;

        const x = nodeWithPosition.x - nodeWidth / 2;
        const y = nodeWithPosition.y - nodeHeight / 2;

        let finalX = x;
        let finalY = y;

        if (node.parentNode) {
            const parentNode = nodes.find(n => n.id === node.parentNode);
            if (parentNode) {
                const parentDagre = dagreGraph.node(parentNode.id);
                const parentX = parentDagre.x - (parentNode.style?.width ? Number(parentNode.style.width) : 200) / 2;
                const parentY = parentDagre.y - (parentNode.style?.height ? Number(parentNode.style.height) : 80) / 2;

                finalX = x - parentX;
                finalY = y - parentY;
            }
        }

        return {
            ...node,
            targetPosition: isHorizontal ? Position.Left : Position.Top,
            sourcePosition: isHorizontal ? Position.Right : Position.Bottom,
            // We are reacting to the existing node, so we pass it all back but with new position
            position: { x: finalX, y: finalY },
        };
    });

    return { nodes: layoutedNodes, edges };
};
