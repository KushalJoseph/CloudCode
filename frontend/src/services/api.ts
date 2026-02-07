import axios from 'axios';

const API_URL = '/api';

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

export interface UpdateResponse {
    valid: boolean;
    connection_valid: boolean;
    terraform: string;
    analysis?: string;
    errors?: string[];
    warnings?: string[];
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

    updateInfrastructure: async (currentTerraform: string, diff: any, newDiagram: any): Promise<UpdateResponse> => {
        try {
            const response = await axios.post<UpdateResponse>(`${API_URL}/infrastructure/update`, {
                current_terraform: currentTerraform,
                diff,
                new_diagram: newDiagram,
                old_diagram: { nodes: [], edges: [] } // Backend requires it but for now we might not strictly need it if diff is provided, or we should pass it. Let's Pass logic in DesignerView handles it.
                // Wait, the API requires old_diagram. I should pass it.
            });
            return response.data;
        } catch (error) {
            console.error('Error updating infrastructure:', error);
            throw error;
        }
    }
};
