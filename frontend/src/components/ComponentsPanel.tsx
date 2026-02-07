import { useState } from 'react';

interface Component {
    id: string;
    name: string;
    icon: string;
    description: string;
    category: string;
    resourceType?: string;
    terraformParams?: any;
    cost?: string;
}

interface ComponentsPanelProps {
    cloudProvider?: string;
}

// AWS Terraform Components
const awsComponents: Component[] = [
    {
        id: 'ec2_instance',
        name: 'EC2 Instance',
        icon: '🖥️',
        description: 'Virtual server',
        category: 'Compute',
        resourceType: 'aws_instance',
        terraformParams: {
            ami: 'ami-0c02fb55956c7d316',
            instance_type: 't3.micro',
            key_name: 'default-key',
        },
        cost: '$8.50/month',
    },
    {
        id: 'lambda_function',
        name: 'Lambda Function',
        icon: '⚡',
        description: 'Serverless function',
        category: 'Compute',
        resourceType: 'aws_lambda_function',
        terraformParams: {
            function_name: 'my-function',
            runtime: 'nodejs18.x',
            handler: 'index.handler',
            memory_size: 512,
            timeout: 30,
        },
        cost: '$0.20/million reqs',
    },
    {
        id: 's3_bucket',
        name: 'S3 Bucket',
        icon: '📦',
        description: 'Object storage',
        category: 'Storage',
        resourceType: 'aws_s3_bucket',
        terraformParams: {
            bucket: 'my-app-bucket',
            force_destroy: true,
        },
        cost: '$0.023/GB',
    },
    {
        id: 'rds_db',
        name: 'RDS Database',
        icon: '🗄️',
        description: 'Relational database',
        category: 'Database',
        resourceType: 'aws_db_instance',
        terraformParams: {
            identifier: 'my-db',
            engine: 'postgres',
            instance_class: 'db.t3.micro',
            allocated_storage: 20,
            username: 'dbadmin',
        },
        cost: '$15.00/month',
    },
    {
        id: 'dynamodb_table',
        name: 'DynamoDB Table',
        icon: '⚡',
        description: 'NoSQL database',
        category: 'Database',
        resourceType: 'aws_dynamodb_table',
        terraformParams: {
            name: 'my-table',
            billing_mode: 'PAY_PER_REQUEST',
            hash_key: 'id',
            attribute: [{ name: 'id', type: 'S' }],
        },
        cost: '$0.25/GB',
    },
    {
        id: 'vpc',
        name: 'VPC',
        icon: '🌐',
        description: 'Virtual network',
        category: 'Networking',
        resourceType: 'aws_vpc',
        terraformParams: {
            cidr_block: '10.0.0.0/16',
            enable_dns_hostnames: true,
        },
        cost: '$0.00/month',
    },
    {
        id: 'load_balancer',
        name: 'Load Balancer',
        icon: '⚖️',
        description: 'Traffic distribution',
        category: 'Networking',
        resourceType: 'aws_lb',
        terraformParams: {
            name: 'my-alb',
            load_balancer_type: 'application',
            ip_address_type: 'ipv4',
        },
        cost: '$16.00/month',
    },
    {
        id: 'api_gateway',
        name: 'API Gateway',
        icon: '🚪',
        description: 'REST API',
        category: 'Networking',
        resourceType: 'aws_apigatewayv2_api',
        terraformParams: {
            name: 'my-api',
            protocol_type: 'HTTP',
            cors_configuration: {
                allow_origins: ['*'],
                allow_methods: ['GET', 'POST', 'PUT', 'DELETE'],
            },
        },
        cost: '$1.00/million reqs',
    },
    {
        id: 'ecs_service',
        name: 'ECS Service',
        icon: '🐳',
        description: 'Container orchestration',
        category: 'Compute',
        resourceType: 'aws_ecs_service',
        terraformParams: {
            name: 'my-service',
            launch_type: 'FARGATE',
            desired_count: 1,
        },
        cost: '$0.04/vCPU/hour',
    },
    {
        id: 'eks_cluster',
        name: 'EKS Cluster',
        icon: '☸️',
        description: 'Kubernetes cluster',
        category: 'Compute',
        resourceType: 'aws_eks_cluster',
        terraformParams: {
            name: 'my-cluster',
            version: '1.27',
        },
        cost: '$0.10/hour',
    },
    {
        id: 'elasticache_cluster',
        name: 'ElastiCache',
        icon: '🧠',
        description: 'Redis/Memcached',
        category: 'Database',
        resourceType: 'aws_elasticache_cluster',
        terraformParams: {
            cluster_id: 'my-cache',
            engine: 'redis',
            node_type: 'cache.t3.micro',
            num_cache_nodes: 1,
        },
        cost: '$0.016/hour',
    },
    {
        id: 'cloudfront_distribution',
        name: 'CloudFront',
        icon: '⚡',
        description: 'CDN distribution',
        category: 'Networking',
        resourceType: 'aws_cloudfront_distribution',
        terraformParams: {
            enabled: true,
            is_ipv6_enabled: true,
            price_class: 'PriceClass_100',
        },
        cost: '$0.085/GB',
    },
    {
        id: 'route53_zone',
        name: 'Route 53',
        icon: '🌐',
        description: 'DNS management',
        category: 'Networking',
        resourceType: 'aws_route53_zone',
        terraformParams: {
            name: 'example.com',
            vpc_id: 'vpc-12345678',
        },
        cost: '$0.50/zone/month',
    },
    {
        id: 'sns_topic',
        name: 'SNS Topic',
        icon: '📢',
        description: 'Pub/Sub messaging',
        category: 'Application',
        resourceType: 'aws_sns_topic',
        terraformParams: {
            name: 'my-topic',
            display_name: 'My Topic',
        },
        cost: '$0.50/million reqs',
    },
    {
        id: 'sqs_queue',
        name: 'SQS Queue',
        icon: '📨',
        description: 'Message queue',
        category: 'Application',
        resourceType: 'aws_sqs_queue',
        terraformParams: {
            name: 'my-queue',
            delay_seconds: 0,
            max_message_size: 262144,
            message_retention_seconds: 345600,
            receive_wait_time_seconds: 0,
        },
        cost: '$0.40/million reqs',
    },
    {
        id: 'iam_role',
        name: 'IAM Role',
        icon: '🔒',
        description: 'Identity management',
        category: 'Security',
        resourceType: 'aws_iam_role',
        terraformParams: {
            name: 'my-role',
            assume_role_policy: '{}',
        },
        cost: 'Free',
    },
    {
        id: 'waf_web_acl',
        name: 'WAF Web ACL',
        icon: '🛡️',
        description: 'Web Application Firewall',
        category: 'Security',
        resourceType: 'aws_wafv2_web_acl',
        terraformParams: {
            name: 'my-web-acl',
            scope: 'REGIONAL',
            default_action: { allow: {} },
            visibility_config: { cloudwatch_metrics_enabled: true, metric_name: 'my-web-acl', sampled_requests_enabled: true },
        },
        cost: '$5.00/month',
    },
];

// GCP Terraform Components
const gcpComponents: Component[] = [
    { id: 'google_compute_instance', name: 'Compute Instance', icon: '🖥️', description: 'Virtual machine', category: 'Compute', resourceType: 'gcp_compute_instance' },
    { id: 'google_cloudfunctions_function', name: 'Cloud Function', icon: '⚡', description: 'Serverless function', category: 'Compute', resourceType: 'gcp_cloud_function' },
    { id: 'google_storage_bucket', name: 'Cloud Storage', icon: '�', description: 'Object storage', category: 'Storage', resourceType: 'gcp_cloud_storage' },
    { id: 'google_sql_database_instance', name: 'Cloud SQL', icon: '�️', description: 'Managed database', category: 'Database', resourceType: 'gcp_cloud_sql' },
    { id: 'google_firestore_database', name: 'Firestore', icon: '🔥', description: 'NoSQL database', category: 'Database', resourceType: 'gcp_firestore' },
    { id: 'google_compute_network', name: 'VPC Network', icon: '🌐', description: 'Virtual network', category: 'Networking', resourceType: 'gcp_vpc' },
    { id: 'google_compute_url_map', name: 'Load Balancer', icon: '⚖️', description: 'HTTP(S) load balancer', category: 'Networking', resourceType: 'gcp_load_balancer' },
    { id: 'google_cloud_run_service', name: 'Cloud Run', icon: '�', description: 'Containerized app', category: 'Compute', resourceType: 'gcp_cloud_run' },
];

// Azure Terraform Components
const azureComponents: Component[] = [
    { id: 'azurerm_linux_virtual_machine', name: 'Virtual Machine', icon: '🖥️', description: 'Linux VM', category: 'Compute', resourceType: 'azure_vm' },
    { id: 'azurerm_function_app', name: 'Function App', icon: '⚡', description: 'Serverless function', category: 'Compute', resourceType: 'azure_function_apps' },
    { id: 'azurerm_storage_account', name: 'Storage Account', icon: '�', description: 'Blob storage', category: 'Storage', resourceType: 'azure_storage_account' },
    { id: 'azurerm_mssql_server', name: 'SQL Server', icon: '�️', description: 'SQL database', category: 'Database', resourceType: 'azure_sql_server' },
    { id: 'azurerm_cosmosdb_account', name: 'Cosmos DB', icon: '🌟', description: 'NoSQL database', category: 'Database', resourceType: 'azure_cosmos_db' },
    { id: 'azurerm_virtual_network', name: 'Virtual Network', icon: '🌐', description: 'VNet', category: 'Networking', resourceType: 'azure_virtual_network' },
    { id: 'azurerm_lb', name: 'Load Balancer', icon: '⚖️', description: 'Traffic distribution', category: 'Networking' },
    { id: 'azurerm_app_service', name: 'App Service', icon: '�', description: 'Web app hosting', category: 'Compute', resourceType: 'azure_app_service' },
];

const allCategories = ['Compute', 'Storage', 'Database', 'Networking', 'Application', 'Security'];

export const ComponentsPanel = ({ cloudProvider = 'AWS' }: ComponentsPanelProps) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(allCategories));

    // Select components based on cloud provider
    const components = cloudProvider === 'GCP'
        ? gcpComponents
        : cloudProvider === 'Azure'
            ? azureComponents
            : awsComponents;

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

    const filteredComponents = components.filter(comp =>
        comp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        comp.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        comp.id.toLowerCase().includes(searchTerm.toLowerCase())
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
                {allCategories.map((category: string) => {
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

                                            {/* Icon - Image for all providers, Emoji fallback */}
                                            {['AWS', 'GCP', 'Azure'].includes(cloudProvider) ? (
                                                <div className="w-8 h-8 flex-shrink-0 flex items-center justify-center bg-white/10 p-1 rounded-sm">
                                                    <img
                                                        src={`/${cloudProvider.toLowerCase() === 'aws' ? 'aws-icons' : cloudProvider.toLowerCase() === 'gcp' ? 'gcp-icons' : 'azure-icons'}/${component.resourceType || component.id}.png`}
                                                        alt={component.name}
                                                        className="w-full h-full object-contain"
                                                        onError={(e) => {
                                                            e.currentTarget.style.display = 'none';
                                                            e.currentTarget.parentElement!.innerHTML = `<span class="text-xl">${component.icon}</span>`;
                                                            e.currentTarget.parentElement!.className = "w-8 h-8 flex-shrink-0 flex items-center justify-center";
                                                        }}
                                                    />
                                                </div>
                                            ) : (
                                                <span className="text-xl w-8 h-8 flex items-center justify-center">{component.icon}</span>
                                            )}

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
