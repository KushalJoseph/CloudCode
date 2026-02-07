import { useState } from 'react';

interface Component {
    id: string;
    name: string;
    icon: string;
    description: string;
    category: string;
}

const awsComponents: Component[] = [
    { id: 'lambda', name: 'Lambda', icon: '⚡', description: 'Serverless compute', category: 'Compute' },
    { id: 'ec2', name: 'EC2', icon: '🖥️', description: 'Virtual servers', category: 'Compute' },
    { id: 'ecs', name: 'ECS', icon: '🐳', description: 'Container service', category: 'Compute' },
    { id: 'apigateway', name: 'API Gateway', icon: '🚪', description: 'API management', category: 'Networking' },
    { id: 'alb', name: 'Load Balancer', icon: '⚖️', description: 'Traffic distribution', category: 'Networking' },
    { id: 'cloudfront', name: 'CloudFront', icon: '🌐', description: 'CDN', category: 'Networking' },
    { id: 'dynamodb', name: 'DynamoDB', icon: '🗄️', description: 'NoSQL database', category: 'Database' },
    { id: 'rds', name: 'RDS', icon: '🐘', description: 'Relational database', category: 'Database' },
    { id: 's3', name: 'S3', icon: '📦', description: 'Object storage', category: 'Storage' },
    { id: 'elasticache', name: 'ElastiCache', icon: '💾', description: 'In-memory cache', category: 'Database' },
    { id: 'sqs', name: 'SQS', icon: '📮', description: 'Message queue', category: 'Integration' },
    { id: 'sns', name: 'SNS', icon: '📣', description: 'Pub/sub messaging', category: 'Integration' },
];

const categories = ['Compute', 'Networking', 'Database', 'Storage', 'Integration'];

export const ComponentsPanel = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(categories));

    const toggleCategory = (category: string) => {
        setExpandedCategories(prev => {
            const next = new Set(prev);
            if (next.has(category)) {
                next.delete(category);
            } else {
                next.add(category);
            }
            return next;
        });
    };

    const filteredComponents = awsComponents.filter(comp =>
        comp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        comp.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleDragStart = (e: React.DragEvent, component: Component) => {
        e.dataTransfer.setData('application/json', JSON.stringify(component));
        e.dataTransfer.effectAllowed = 'copy';
    };

    return (
        <div className="w-60 border-r border-white/10 bg-slate-900 flex flex-col">
            {/* Header */}
            <div className="p-4 border-b border-white/10">
                <h2 className="text-white font-semibold mb-3">Components</h2>
                <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search..."
                    className="w-full px-3 py-2 bg-slate-800 border border-white/10 rounded-md text-white text-sm placeholder-white/40 focus:outline-none focus:border-green-500/50"
                />
            </div>

            {/* Component List */}
            <div className="flex-1 overflow-y-auto">
                {categories.map(category => {
                    const categoryComponents = filteredComponents.filter(c => c.category === category);
                    if (categoryComponents.length === 0) return null;

                    return (
                        <div key={category} className="border-b border-white/5">
                            <button
                                onClick={() => toggleCategory(category)}
                                className="w-full px-4 py-2 flex items-center justify-between text-white/60 hover:text-white text-sm"
                            >
                                <span>{category}</span>
                                <span className="text-xs">{expandedCategories.has(category) ? '▼' : '▶'}</span>
                            </button>

                            {expandedCategories.has(category) && (
                                <div className="pb-2">
                                    {categoryComponents.map(component => (
                                        <div
                                            key={component.id}
                                            draggable
                                            onDragStart={(e) => handleDragStart(e, component)}
                                            className="flex items-center gap-3 px-4 py-2 mx-2 rounded-md hover:bg-slate-800 cursor-grab active:cursor-grabbing group"
                                        >
                                            <span className="text-xs text-white/30 group-hover:text-white/50">⋮⋮</span>
                                            <span className="text-xl">{component.icon}</span>
                                            <div className="flex-1 min-w-0">
                                                <div className="text-white text-sm font-medium truncate">{component.name}</div>
                                                <div className="text-white/40 text-xs truncate">{component.description}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
