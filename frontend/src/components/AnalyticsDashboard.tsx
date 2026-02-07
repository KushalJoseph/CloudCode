// @ts-nocheck
import { useMemo } from 'react';
// @ts-ignore
import {
    PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend,
    BarChart, Bar, XAxis, YAxis, CartesianGrid
} from 'recharts';
import type { Node } from 'reactflow';

interface AnalyticsDashboardProps {
    nodes: Node[];
}

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

        const typeData = Object.entries(typeCount).map(([name, value]) => ({ name, value }));
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

        const comparisonData = [
            { name: 'AWS', value: parseFloat(awsCost.toFixed(2)), fill: '#FF9900' },
            { name: 'Azure', value: parseFloat(azureCost.toFixed(2)), fill: '#0078D4' },
            { name: 'GCP', value: parseFloat(gcpCost.toFixed(2)), fill: '#4285F4' },
        ];

        return {
            totalResources: nodes.length,
            totalCost,
            typeData,
            costData, // Keeping this if needed, but not displaying it in the swapped chart
            comparisonData,
            mostUsedProvider: primaryProviderKey
        };
    }, [nodes]);

    const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#10b981', '#3b82f6', '#f59e0b'];

    return (
        <div className="h-full flex flex-col bg-slate-900 border-l border-white/10 overflow-auto">
            {/* Header */}
            <div className="px-8 py-6 border-b border-white/10 bg-slate-900/50">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center border border-purple-500/30">
                        <span className="text-xl">📊</span>
                    </div>
                    <div>
                        <h2 className="text-xl font-semibold text-white">Infrastructure Analytics</h2>
                        <p className="text-sm text-slate-400">Real-time insights from your design</p>
                    </div>
                </div>
            </div>

            <div className="p-8 space-y-8">
                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                        icon="☁️"
                        color="purple"
                    />
                </div>

                {/* Charts Row */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Resource Distribution */}
                    <div className="bg-slate-950/50 border border-white/10 rounded-xl p-6">
                        <h3 className="text-lg font-medium text-white mb-6">Resource Distribution</h3>
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={analytics.typeData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={100}
                                        fill="#8884d8"
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {analytics.typeData.map((_, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', borderRadius: '8px', color: '#fff' }}
                                        itemStyle={{ color: '#fff' }}
                                    />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Cross-Cloud Cost Comparison */}
                    <div className="bg-slate-950/50 border border-white/10 rounded-xl p-6">
                        <h3 className="text-lg font-medium text-white mb-6">Cross-Cloud Cost Comparison (Est.)</h3>
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={analytics.comparisonData} layout="vertical">
                                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" horizontal={false} />
                                    <XAxis type="number" stroke="#94a3b8" unit="$" />
                                    <YAxis
                                        dataKey="name"
                                        type="category"
                                        width={60}
                                        stroke="#94a3b8"
                                        tick={{ fontSize: 12, fontWeight: 500 }}
                                    />
                                    <Tooltip
                                        cursor={{ fill: '#334155', opacity: 0.2 }}
                                        contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', borderRadius: '8px', color: '#fff' }}
                                        formatter={(value: number) => [`$${value}`, 'Est. Cost']}
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
                <div className="bg-slate-950/50 border border-white/10 rounded-xl overflow-hidden">
                    <div className="px-6 py-4 border-b border-white/10">
                        <h3 className="text-lg font-medium text-white">Detailed Resource List</h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-slate-400">
                            <thead className="bg-white/5 text-slate-200 uppercase font-medium">
                                <tr>
                                    <th className="px-6 py-3">Resource Name</th>
                                    <th className="px-6 py-3">Type</th>
                                    <th className="px-6 py-3">Provider</th>
                                    <th className="px-6 py-3 text-right">Est. Cost</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {nodes.map((node) => {
                                    const type = node.data.resourceType || node.data.type || 'Unknown';
                                    const provider = type.split('_')[0] || 'Other';
                                    return (
                                        <tr key={node.id} className="hover:bg-white/5 transition-colors">
                                            <td className="px-6 py-4 font-medium text-white">{node.data.label}</td>
                                            <td className="px-6 py-4 font-mono text-xs">{type}</td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-1 rounded text-xs font-medium bg-slate-800 border border-white/10 uppercase`}>
                                                    {provider}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right text-emerald-400 font-medium">
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

const SummaryCard = ({ title, value, icon, color }: { title: string, value: string | number, icon: string, color: string }) => {
    const colorClasses: Record<string, string> = {
        blue: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
        green: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
        purple: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    };

    return (
        <div className="bg-slate-950/50 border border-white/10 rounded-xl p-6 flex items-center gap-4 hover:bg-slate-900/50 transition-colors">
            <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-2xl border ${colorClasses[color]}`}>
                {icon}
            </div>
            <div>
                <p className="text-sm text-slate-400 font-medium">{title}</p>
                <p className="text-2xl font-bold text-white mt-1">{value}</p>
            </div>
        </div>
    );
};
