import axios from 'axios';

const API_URL = 'http://localhost:8000/api';

export interface NodeData {
    label: string;
    service: string;
    resourceType: string;
    icon: string;
    color: string;
    terraformParams: Record<string, any>;
    description?: string;
    cost?: string;
}

export interface Node {
    id: string;
    type: string;
    data: NodeData;
    position: { x: number; y: number };
}

export interface Edge {
    id: string;
    source: string;
    target: string;
    label?: string;
    animated: boolean;
}

export interface Diagram {
    nodes: Node[];
    edges: Edge[];
}

export interface GenerateResponse {
    refined_prompt: string;
    terraform: string;
    diagram: Diagram;
}

export const api = {
    generateInfrastructure: async (prompt: string, cloudProvider: string, currentTerraform?: string, currentDiagram?: any): Promise<GenerateResponse> => {
        try {
            const response = await axios.post<GenerateResponse>(`${API_URL}/infrastructure/generate`, {
                prompt,
                cloud_provider: cloudProvider,
                current_terraform: currentTerraform,
                current_diagram: currentDiagram,
            });
            return response.data;
        } catch (error) {
            console.error('Error generating infrastructure:', error);
            throw error;
        }
    },
};
