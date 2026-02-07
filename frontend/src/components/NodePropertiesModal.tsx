

interface NodePropertiesModalProps {
    isOpen: boolean;
    onClose: () => void;
    nodeData: {
        id: string;
        label: string;
        type: string;
        icon: string;
        color: string;
        description: string;
        resourceType?: string;
        terraformParams?: any;
        cost?: string;
    } | null;
}

export const NodePropertiesModal = ({ isOpen, onClose, nodeData }: NodePropertiesModalProps) => {
    if (!isOpen || !nodeData) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
            {/* Modal Container */}
            <div className="w-full max-w-2xl h-[85vh] bg-slate-900 rounded-lg shadow-2xl border border-white/10 flex flex-col">
                {/* Header */}
                <div className="h-14 border-b border-white/10 flex items-center justify-between px-6">
                    <div className="flex items-center gap-3">
                        <span className="text-2xl">{nodeData.icon}</span>
                        <h2 className="text-xl font-semibold text-white">{nodeData.label} Configuration</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 rounded-md bg-slate-800 hover:bg-red-600 text-white flex items-center justify-center transition-colors"
                        title="Close (ESC)"
                    >
                        ✕
                    </button>
                </div>

                {/* Content - Two Panel Layout */}
                <div className="flex-1 flex overflow-hidden">
                    {/* Left Panel - Properties */}
                    {/* Main Panel - Properties */}
                    <div className="w-full bg-slate-800/50 overflow-y-auto">
                        <div className="p-6 space-y-6">
                            {/* Node Info */}
                            <div>
                                <h3 className="text-sm font-semibold text-white/60 uppercase mb-3">Node Information</h3>
                                <div className="space-y-3">
                                    <div>
                                        <label className="text-xs text-white/40 block mb-1">Resource Type</label>
                                        <div className="px-3 py-2 bg-slate-900 border border-white/10 rounded-md text-white text-sm">
                                            {nodeData.resourceType}
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-xs text-white/40 block mb-1">Node ID</label>
                                        <div className="px-3 py-2 bg-slate-900 border border-white/10 rounded-md text-white/60 text-sm font-mono">
                                            {nodeData.id}
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-xs text-white/40 block mb-1">Description</label>
                                        <div className="px-3 py-2 bg-slate-900 border border-white/10 rounded-md text-white/60 text-sm">
                                            {nodeData.description}
                                        </div>
                                    </div>
                                    {nodeData.cost && (
                                        <div>
                                            <label className="text-xs text-white/40 block mb-1">Estimated Cost</label>
                                            <div className="px-3 py-2 bg-slate-900 border border-white/10 rounded-md text-green-400 text-sm font-mono">
                                                {nodeData.cost}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Terraform Configuration */}
                            {nodeData.terraformParams && (
                                <div>
                                    <h3 className="text-sm font-semibold text-white/60 uppercase mb-3">Terraform Configuration</h3>
                                    <div className="bg-slate-900 border border-white/10 rounded-md overflow-hidden">
                                        <div className="overflow-x-auto">
                                            <table className="w-full text-sm text-left">
                                                <thead className="text-xs text-white/40 uppercase bg-slate-800/50">
                                                    <tr>
                                                        <th className="px-4 py-2 font-medium">Parameter</th>
                                                        <th className="px-4 py-2 font-medium">Value</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-white/5">
                                                    {Object.entries(nodeData.terraformParams).map(([key, value]) => (
                                                        <tr key={key} className="hover:bg-white/5 transition-colors">
                                                            <td className="px-4 py-2 text-white/60 font-mono text-xs whitespace-nowrap">{key}</td>
                                                            <td className="px-4 py-2 text-blue-300 font-mono text-xs break-all">
                                                                {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Configuration */}
                            <div>
                                <h3 className="text-sm font-semibold text-white/60 uppercase mb-3">Configuration</h3>
                                <div className="space-y-3">
                                    <div>
                                        <label className="text-xs text-white/40 block mb-1">Resource Name</label>
                                        <input
                                            type="text"
                                            defaultValue={nodeData.label}
                                            className="w-full px-3 py-2 bg-slate-900 border border-white/10 rounded-md text-white text-sm focus:outline-none focus:border-green-500/50"
                                            placeholder="Enter resource name"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs text-white/40 block mb-1">Region</label>
                                        <select className="w-full px-3 py-2 bg-slate-900 border border-white/10 rounded-md text-white text-sm focus:outline-none focus:border-green-500/50">
                                            <option>us-east-1</option>
                                            <option>us-west-2</option>
                                            <option>eu-west-1</option>
                                            <option>ap-southeast-1</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-xs text-white/40 block mb-1">Environment</label>
                                        <select className="w-full px-3 py-2 bg-slate-900 border border-white/10 rounded-md text-white text-sm focus:outline-none focus:border-green-500/50">
                                            <option>Development</option>
                                            <option>Staging</option>
                                            <option>Production</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-xs text-white/40 block mb-1">Tags</label>
                                        <input
                                            type="text"
                                            className="w-full px-3 py-2 bg-slate-900 border border-white/10 rounded-md text-white text-sm focus:outline-none focus:border-green-500/50"
                                            placeholder="key=value, key2=value2"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="pt-4 border-t border-white/10">
                                <button className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md font-medium transition-colors">
                                    Save Configuration
                                </button>
                            </div>
                        </div>
                    </div>


                </div>
            </div>
        </div>
    );
};
