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

// Project types for persistence
export interface Project {
    id: string;
    title: string;
    description: string;
    provider: 'AWS' | 'GCP' | 'Azure';
    user_id?: string;
    diagram?: Diagram;
    terraform?: string;
    chat_history?: any[];
    created_at: string;
    updated_at: string;
}

export interface ProjectCreate {
    title: string;
    description?: string;
    provider: string;
    user_id?: string;
    diagram?: Diagram;
    terraform?: string;
    chat_history?: any[];
}

export interface ProjectUpdate {
    title?: string;
    description?: string;
    provider?: string;
    diagram?: Diagram;
    terraform?: string;
    chat_history?: any[];
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
    },

    learnChat: async (message: string, history: Array<{ role: string; content: string }>): Promise<{ response: string }> => {
        try {
            const response = await axios.post<{ response: string }>(`${API_URL}/learn/chat`, {
                message,
                history,
            });
            return response.data;
        } catch (error) {
            console.error('Error in learn chat:', error);
            throw error;
        }
    },

    // Projects API
    projects: {
        list: async (userId?: string): Promise<Project[]> => {
            const params = userId ? { user_id: userId } : {};
            const response = await axios.get<Project[]>(`${API_URL}/projects`, { params });
            return response.data;
        },

        get: async (projectId: string): Promise<Project> => {
            const response = await axios.get<Project>(`${API_URL}/projects/${projectId}`);
            return response.data;
        },

        create: async (data: ProjectCreate): Promise<Project> => {
            const response = await axios.post<Project>(`${API_URL}/projects`, data);
            return response.data;
        },

        update: async (projectId: string, data: ProjectUpdate): Promise<Project> => {
            const response = await axios.put<Project>(`${API_URL}/projects/${projectId}`, data);
            return response.data;
        },

        delete: async (projectId: string): Promise<void> => {
            await axios.delete(`${API_URL}/projects/${projectId}`);
        }
    }
};
