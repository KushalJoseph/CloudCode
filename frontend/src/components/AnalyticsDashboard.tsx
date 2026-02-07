// @ts-nocheck
import { useMemo } from 'react';
// @ts-ignore
import {
    PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend,
    BarChart, Bar, XAxis, YAxis, CartesianGrid
} from 'recharts';
import type { Node } from 'reactflow';
import awsLogo from '../assets/aws_logo.png';
import azureLogo from '../assets/azure_logo.svg';
import gcpLogo from '../assets/google_logo.svg';

interface AnalyticsDashboardProps {
    nodes: Node[];
}

const SummaryCard = ({ title, value, icon, color, subtext }: { title: string, value: string | number, icon: React.ReactNode, color: string, subtext?: string }) => {
    const colorClasses: Record<string, string> = {
        blue: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-500/20',
        green: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20',
        purple: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-500/20',
        yellow: 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-200 dark:border-yellow-500/20',
    };

    return (
        <div className="bg-white dark:bg-slate-950/50 border border-slate-200 dark:border-white/10 rounded-xl p-6 flex items-center gap-4 hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors shadow-sm dark:shadow-none">
            <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-2xl border ${colorClasses[color]}`}>
                {typeof icon === 'string' ? icon : icon}
            </div>
            <div>
                <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">{title}</p>
                <div className="flex items-baseline gap-2">
                    <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{value}</p>
                    {subtext && <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">{subtext}</span>}
                </div>
            </div>
        </div>
    );
};

const RESOURCE_NAMES: Record<string, string> = {
    // AWS
    'aws_instance': 'EC2 Instance',
    'aws_lambda_function': 'Lambda Function',
    'aws_s3_bucket': 'S3 Bucket',
    'aws_db_instance': 'RDS Database',
    'aws_dynamodb_table': 'DynamoDB Table',
    'aws_vpc': 'VPC',
    'aws_lb': 'Load Balancer',
    'aws_apigatewayv2_api': 'API Gateway',
    'aws_ecs_service': 'ECS Service',
    'aws_eks_cluster': 'EKS Cluster',
    'aws_elasticache_cluster': 'ElastiCache',
    'aws_cloudfront_distribution': 'CloudFront',
    'aws_route53_zone': 'Route 53',
    'aws_sns_topic': 'SNS Topic',
    'aws_sqs_queue': 'SQS Queue',
    'aws_iam_role': 'IAM Role',
    'aws_wafv2_web_acl': 'WAF Web ACL',
    // GCP
    'gcp_compute_instance': 'Compute Instance',
    'gcp_cloud_function': 'Cloud Function',
    'gcp_cloud_storage': 'Cloud Storage',
    'gcp_cloud_sql': 'Cloud SQL',
    'gcp_firestore': 'Firestore',
    'gcp_vpc': 'VPC Network',
    'gcp_load_balancer': 'Load Balancer',
    'gcp_cloud_run': 'Cloud Run',
    'gcp_kubernetes': 'Kubernetes Cluster',
    'gcp_app_engine': 'App Engine',
    'gcp_bigquery': 'BigQuery Dataset',
    'gcp_redis': 'Redis Instance',
    'gcp_pubsub': 'Pub/Sub Topic',
    'gcp_dns': 'Cloud DNS',
    'gcp_armor': 'Cloud Armor',
    // Azure
    'azure_vm': 'Virtual Machine',
    'azure_function_apps': 'Function App',
    'azure_kubernetes': 'Kubernetes Service',
    'azure_container_registry': 'Container Registry',
    'azure_app_service': 'App Service',
    'azure_storage_account': 'Storage Account',
    'azure_sql_server': 'SQL Server',
    'azure_cosmos_db': 'Cosmos DB',
    'azure_virtual_network': 'Virtual Network',
    'azure_load_balancer': 'Load Balancer',
    'azure_application_gateway': 'Application Gateway',
    'azure_dns_zone': 'DNS Zone',
    'azure_key_vault': 'Key Vault',
};

export const AnalyticsDashboard = ({ nodes }: AnalyticsDashboardProps) => {
    // calculate analytics data
    const analytics = useMemo(() => {
        let totalCost = 0;
        const typeCount: Record<string, number> = {};
        const costByType: Record<string, number> = {};
        const providerCount: Record<string, number> = {};

        nodes.forEach(node => {
            const data = node.data;
            const type = data.resourceType || data.type || 'Unknown';
            const provider = type.split('_')[0] || 'Other';

            // Cost calculation (mock parsing if string "15.00/mo")
            let cost = 0;
            if (data.cost) {
                const costMatch = data.cost.match(/[\d.]+/);
                if (costMatch) {
                    cost = parseFloat(costMatch[0]);
                }
            }
            totalCost += cost;

            // Counts
            typeCount[type] = (typeCount[type] || 0) + 1;
            providerCount[provider] = (providerCount[provider] || 0) + 1;

            // Cost by type
            costByType[type] = (costByType[type] || 0) + cost;
        });

        const typeData = Object.entries(typeCount).map(([type, value]) => ({ 
            name: RESOURCE_NAMES[type] || type, 
            value 
        }));
        const costData = Object.entries(costByType).map(([name, value]) => ({ name, value }));

        // Sort for better visualization
        typeData.sort((a, b) => b.value - a.value);
        costData.sort((a, b) => b.value - a.value);

        const primaryProviderKey = Object.entries(providerCount).sort((a, b) => b[1] - a[1])[0]?.[0] || 'aws';

        // Cross-cloud cost estimation heuristics
        let awsCost = 0, gcpCost = 0, azureCost = 0;

        // Normalize based on the primary provider detected
        if (primaryProviderKey === 'google') {
            gcpCost = totalCost;
            awsCost = totalCost * 1.15;
            azureCost = totalCost * 1.08;
        } else if (primaryProviderKey === 'azurerm') {
            azureCost = totalCost;
            awsCost = totalCost * 1.08;
            gcpCost = totalCost * 0.92;
        } else {
            // Default to AWS baseline (works for 'aws' and 'Other')
            awsCost = totalCost;
            gcpCost = totalCost * 0.85;
            azureCost = totalCost * 0.92;
        }

        const providerLogos: Record<string, string> = {
            aws: awsLogo,
            azurerm: azureLogo,
            google: gcpLogo,
        };

        const comparisonData = [
            { name: 'AWS', value: parseFloat(awsCost.toFixed(2)), fill: '#FF9900' },
            { name: 'Azure', value: parseFloat(azureCost.toFixed(2)), fill: '#0078D4' },
            { name: 'GCP', value: parseFloat(gcpCost.toFixed(2)), fill: '#4285F4' },
        ];

        // Find cheapest provider
        const cheapestProvider = comparisonData.reduce((prev, current) => {
            return (prev.value < current.value) ? prev : current;
        });

        // Calculate potential savings based on current provider vs cheapest
        // If current provider is cheapest, savings is 0
        // We need to identify the "current" provider cost to compare against.
        // We can use totalCost as the "current" cost
        // const currentCost = totalCost;
        const savings = Math.max(0, totalCost - cheapestProvider.value);

        return {
            totalResources: nodes.length,
            totalCost,
            typeData,
            costData, // Keeping this if needed, but not displaying it in the swapped chart
            comparisonData,
            mostUsedProvider: primaryProviderKey,
            cheapestProvider,
            savings,
            providerLogos
        };
    }, [nodes]);

    const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#10b981', '#3b82f6', '#f59e0b'];

    return (
        <div className="h-full flex flex-col bg-slate-50 dark:bg-slate-900 border-l border-slate-200 dark:border-white/10 overflow-auto transition-colors duration-300">
            {/* Header */}
            <div className="px-8 py-6 border-b border-slate-200 dark:border-white/10 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-purple-500/10 dark:bg-purple-500/20 flex items-center justify-center border border-purple-500/20 dark:border-purple-500/30">
                        <span className="text-xl">📊</span>
                    </div>
                    <div>
                        <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Infrastructure Analytics</h2>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Real-time insights from your design</p>
                    </div>
                </div>
            </div>

            <div className="p-8 space-y-8">
                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <SummaryCard
                        title="Total Resources"
                        value={analytics.totalResources}
                        icon="📦"
                        color="blue"
                    />
                    <SummaryCard
                        title="Estimated Monthly Cost"
                        value={`$${analytics.totalCost.toFixed(2)}`}
                        icon="💰"
                        color="green"
                    />
                    <SummaryCard
                        title="Primary Provider"
                        value={analytics.mostUsedProvider.toUpperCase()}
                        icon={
                            <img 
                                src={analytics.providerLogos[analytics.mostUsedProvider] || awsLogo} 
                                alt={analytics.mostUsedProvider} 
                                className="w-8 h-8 object-contain"
                            />
                        }
                        color="purple"
                    />
                    <SummaryCard
                        title="Cheapest Provider"
                        value={analytics.cheapestProvider.name}
                        icon="🏷️"
                        color="yellow"
                        subtext={analytics.savings > 0 ? `Save $${analytics.savings.toFixed(2)}` : 'Best Price'}
                    />
                </div>

                {/* Charts Row */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Resource Distribution */}
                    <div className="bg-white dark:bg-slate-950/50 border border-slate-200 dark:border-white/10 rounded-xl p-6 shadow-sm dark:shadow-none transition-colors">
                        <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-6">Resource Distribution</h3>
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={analytics.typeData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={50}
                                        outerRadius={80}
                                        fill="#8884d8"
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {analytics.typeData.map((_, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{ backgroundColor: 'var(--tooltip-bg, #1e293b)', borderColor: 'var(--tooltip-border, #334155)', borderRadius: '8px', color: 'var(--tooltip-text, #fff)' }}
                                        itemStyle={{ color: 'var(--tooltip-text, #fff)' }}
                                        wrapperClassName="dark:!bg-slate-800 !bg-white !border-slate-200 dark:!border-slate-700 !text-slate-900 dark:!text-white shadow-lg"
                                    />
                                    <Legend formatter={(value) => <span className="text-slate-600 dark:text-slate-300">{value}</span>} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Cross-Cloud Cost Comparison */}
                    <div className="bg-white dark:bg-slate-950/50 border border-slate-200 dark:border-white/10 rounded-xl p-6 flex flex-col shadow-sm dark:shadow-none transition-colors">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-lg font-medium text-slate-900 dark:text-white">Cross-Cloud Cost Comparison (Est.)</h3>
                            {analytics.savings > 0 && (
                                <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-400/10 px-2 py-1 rounded border border-emerald-200 dark:border-emerald-400/20">
                                    Switch to {analytics.cheapestProvider.name} to save ${(analytics.savings).toFixed(2)}
                                </span>
                            )}
                        </div>
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={analytics.comparisonData} layout="vertical">
                                    <CartesianGrid strokeDasharray="3 3" stroke="#94a3b8" strokeOpacity={0.2} horizontal={false} />
                                    <XAxis type="number" stroke="#94a3b8" unit="$" tick={{ fill: '#94a3b8' }} />
                                    <YAxis
                                        dataKey="name"
                                        type="category"
                                        width={60}
                                        stroke="#94a3b8"
                                        tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 500 }}
                                    />
                                    <Tooltip
                                        cursor={{ fill: '#94a3b8', opacity: 0.1 }}
                                        contentStyle={{ backgroundColor: 'var(--tooltip-bg, #1e293b)', borderColor: 'var(--tooltip-border, #334155)', borderRadius: '8px', color: 'var(--tooltip-text, #fff)' }}
                                        itemStyle={{ color: 'var(--tooltip-text, #fff)' }}
                                        wrapperClassName="dark:!bg-slate-800 !bg-white !border-slate-200 dark:!border-slate-700 !text-slate-900 dark:!text-white shadow-lg"
                                        formatter={(value: any) => [`$${value}`, 'Est. Cost']}
                                    />
                                    <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={30}>
                                        {
                                            analytics.comparisonData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.fill} />
                                            ))
                                        }
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                {/* Resource Table */}
                <div className="bg-white dark:bg-slate-950/50 border border-slate-200 dark:border-white/10 rounded-xl overflow-hidden shadow-sm dark:shadow-none transition-colors">
                    <div className="px-6 py-4 border-b border-slate-200 dark:border-white/10">
                        <h3 className="text-lg font-medium text-slate-900 dark:text-white">Detailed Resource List</h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-slate-500 dark:text-slate-400">
                            <thead className="bg-slate-50 dark:bg-white/5 text-slate-700 dark:text-slate-200 uppercase font-medium">
                                <tr>
                                    <th className="px-6 py-3">Resource Name</th>
                                    <th className="px-6 py-3">Type</th>
                                    <th className="px-6 py-3">Provider</th>
                                    <th className="px-6 py-3 text-right">Est. Cost</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200 dark:divide-white/5">
                                {nodes.map((node) => {
                                    const type = node.data.resourceType || node.data.type || 'Unknown';
                                    const provider = type.split('_')[0] || 'Other';
                                    return (
                                        <tr key={node.id} className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                                            <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">{node.data.label}</td>
                                            <td className="px-6 py-4 font-mono text-xs">{type}</td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-1 rounded text-xs font-medium bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-white/10 uppercase`}>
                                                    {provider}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right text-emerald-600 dark:text-emerald-400 font-medium">
                                                {node.data.cost || '$0.00'}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};


