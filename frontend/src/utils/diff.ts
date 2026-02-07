import type { Node, Edge } from 'reactflow';

export interface DiagramDiff {
    added_nodes: Node[];
    removed_nodes: Node[];
    modified_nodes: Node[];
    added_edges: Edge[];
    removed_edges: Edge[];
}

export function calculateDiff(
    oldDiagram: { nodes: Node[], edges: Edge[] },
    newDiagram: { nodes: Node[], edges: Edge[] }
): DiagramDiff {

    // Find added nodes
    const oldNodeIds = new Set(oldDiagram.nodes.map(n => n.id));
    const added_nodes = newDiagram.nodes.filter(
        n => !oldNodeIds.has(n.id)
    );

    // Find removed nodes
    const newNodeIds = new Set(newDiagram.nodes.map(n => n.id));
    const removed_nodes = oldDiagram.nodes.filter(
        n => !newNodeIds.has(n.id)
    );

    // Find modified nodes
    const modified_nodes = newDiagram.nodes.filter(newNode => {
        const oldNode = oldDiagram.nodes.find(n => n.id === newNode.id);
        if (!oldNode) return false;

        // Deep compare terraformParams
        // Note: position changes don't count as modification for back-end
        const oldParams = JSON.stringify(oldNode.data?.terraformParams || {});
        const newParams = JSON.stringify(newNode.data?.terraformParams || {});
        return oldParams !== newParams;
    });

    // Find added edges
    const oldEdgeKeys = new Set(
        oldDiagram.edges.map(e => `${e.source}->${e.target}`)
    );
    const added_edges = newDiagram.edges.filter(
        e => !oldEdgeKeys.has(`${e.source}->${e.target}`)
    );

    // Find removed edges
    const newEdgeKeys = new Set(
        newDiagram.edges.map(e => `${e.source}->${e.target}`)
    );
    const removed_edges = oldDiagram.edges.filter(
        e => !newEdgeKeys.has(`${e.source}->${e.target}`)
    );

    return {
        added_nodes,
        removed_nodes,
        modified_nodes,
        added_edges,
        removed_edges
    };
}
