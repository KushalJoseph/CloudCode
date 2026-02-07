import type { Node, Edge } from 'reactflow';

export const initialNodes: Node[] = [
    {
        id: 'apigateway',
        type: 'custom',
        position: { x: 250, y: 50 },
        data: {
            label: 'API Gateway',
            type: 'apigateway',
            icon: '🚪',
            color: 'cyan',
            description: 'HTTP API Endpoint'
        }
    },
    {
        id: 'lambda',
        type: 'custom',
        position: { x: 250, y: 200 },
        data: {
            label: 'Lambda Function',
            type: 'lambda',
            icon: '⚡',
            color: 'blue',
            description: 'api-handler (Node.js 18)'
        }
    },
    {
        id: 'dynamodb',
        type: 'custom',
        position: { x: 50, y: 350 },
        data: {
            label: 'DynamoDB',
            type: 'dynamodb',
            icon: '🗄️',
            color: 'purple',
            description: 'app-data table'
        }
    },
    {
        id: 'elasticache',
        type: 'custom',
        position: { x: 250, y: 350 },
        data: {
            label: 'ElastiCache',
            type: 'elasticache',
            icon: '💾',
            color: 'green',
            description: 'Redis cache.t3.micro'
        }
    },
    {
        id: 'sqs',
        type: 'custom',
        position: { x: 450, y: 350 },
        data: {
            label: 'SQS Queue',
            type: 'sqs',
            icon: '📮',
            color: 'orange',
            description: 'background-jobs'
        }
    }
];

export const initialEdges: Edge[] = [
    {
        id: 'e1-2',
        source: 'apigateway',
        target: 'lambda',
        animated: true,
        style: { stroke: '#06b6d4', strokeWidth: 2 }
    },
    {
        id: 'e2-3',
        source: 'lambda',
        target: 'dynamodb',
        animated: false,
        style: { stroke: '#a78bfa', strokeWidth: 2 }
    },
    {
        id: 'e2-4',
        source: 'lambda',
        target: 'elasticache',
        animated: false,
        style: { stroke: '#34d399', strokeWidth: 2 }
    },
    {
        id: 'e2-5',
        source: 'lambda',
        target: 'sqs',
        animated: false,
        style: { stroke: '#fb923c', strokeWidth: 2 }
    }
];
