import { useState } from 'react';

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
    const [message, setMessage] = useState('');

    if (!isOpen || !nodeData) return null;

    const handleSend = () => {
        if (!message.trim()) return;
        // TODO: Implement AI chat functionality
        console.log('Sending message:', message);
        setMessage('');
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
        if (e.key === 'Escape') {
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
            {/* Modal Container */}
            <div className="w-[90vw] h-[85vh] bg-slate-900 rounded-lg shadow-2xl border border-white/10 flex flex-col">
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
                    <div className="w-80 border-r border-white/10 bg-slate-800/50 overflow-y-auto">
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

                    {/* Right Panel - AI Chat */}
                    <div className="flex-1 flex flex-col bg-slate-900">
                        {/* Chat Header */}
                        <div className="h-14 border-b border-white/10 flex items-center px-6">
                            <div className="flex items-center gap-2">
                                <span className="text-xl">💬</span>
                                <h3 className="text-lg font-semibold text-white">AI Assistant</h3>
                            </div>
                        </div>

                        {/* Chat Messages */}
                        <div className="flex-1 overflow-y-auto p-6">
                            <div className="max-w-3xl mx-auto space-y-4">
                                {/* Welcome Message */}
                                <div className="bg-slate-800/50 border border-white/10 rounded-lg p-4">
                                    <p className="text-white/80 text-sm">
                                        👋 Hi! I'm here to help you configure your <strong>{nodeData.label}</strong>.
                                    </p>
                                    <p className="text-white/60 text-sm mt-2">
                                        You can ask me about:
                                    </p>
                                    <ul className="text-white/60 text-sm mt-2 space-y-1 ml-4">
                                        <li>• Best practices for this resource</li>
                                        <li>• Configuration options and parameters</li>
                                        <li>• Security and compliance settings</li>
                                        <li>• Cost optimization tips</li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                        {/* Chat Input */}
                        <div className="border-t border-white/10 p-4">
                            <div className="max-w-3xl mx-auto">
                                <div className="flex items-end gap-3">
                                    <div className="flex-1 relative">
                                        <textarea
                                            value={message}
                                            onChange={(e) => setMessage(e.target.value)}
                                            onKeyDown={handleKeyDown}
                                            rows={1}
                                            placeholder={`Ask about ${nodeData.label} configuration...`}
                                            className="w-full px-4 py-3 bg-slate-800/60 border border-white/10 rounded-2xl text-white text-base placeholder-white/40 focus:outline-none focus:border-white/20 focus:bg-slate-800/80 resize-none max-h-32 overflow-y-auto"
                                            style={{ minHeight: '48px' }}
                                        />
                                    </div>
                                    <button
                                        onClick={handleSend}
                                        disabled={!message.trim()}
                                        className="p-3 bg-white/10 hover:bg-white/20 disabled:bg-white/5 disabled:cursor-not-allowed text-white rounded-xl transition-all duration-200 disabled:opacity-30 flex-shrink-0"
                                        title="Send message"
                                    >
                                        <svg
                                            className="w-5 h-5"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M5 10l7-7m0 0l7 7m-7-7v18"
                                            />
                                        </svg>
                                    </button>
                                </div>
                                <p className="text-xs text-white/40 text-center mt-2">
                                    Press Enter to send, Shift+Enter for new line, ESC to close
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
