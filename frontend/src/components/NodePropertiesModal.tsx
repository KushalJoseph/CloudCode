import { useState, useEffect, useRef } from 'react';

interface NodePropertiesModalProps {
    node: {
        id: string;
        data: {
            label?: string;
            type?: string;
            icon?: string;
            color?: string;
            description?: string;
            resourceType?: string;
            terraformParams?: any;
            cost?: string;
            provider?: string;
        };
    } | null;
    isOpen: boolean;
    onClose: () => void;
    onSave: (nodeId: string, newData: any) => void;
    onDelete: (nodeId: string) => void;
}

export const NodePropertiesModal = ({
    node,
    isOpen,
    onClose,
    onSave,
    // onDelete - removed from destructuring as it is unused
}: NodePropertiesModalProps) => {
    // State for form data, initialized from node.data
    const [formData, setFormData] = useState({
        label: '',
        type: '',
        icon: '',
        cost: '',
        description: '',
        resourceType: '',
        terraformParams: {},
        color: '',
    });

    // Handle live updates
    const handleChange = (field: string, value: any) => {
        const newData = { ...formData, [field]: value };
        setFormData(newData);
        if (node) {
            onSave(node.id, newData);
        }
    };

    // Ref for the modal container to handle clicks outside
    const modalRef = useRef<HTMLDivElement>(null);

    // Effect to update formData when node prop changes
    useEffect(() => {
        if (node) {
            setFormData({
                label: node.data.label || '',
                type: node.data.type || '',
                icon: node.data.icon || '',
                cost: node.data.cost || '',
                description: node.data.description || '',
                resourceType: node.data.resourceType || '',
                terraformParams: node.data.terraformParams || {},
                color: node.data.color || '',
            });
        }
    }, [node]);



    // Handle deleting the node
    // Handle deleting the node - function removed as button is removed

    // Close modal on escape key
    useEffect(() => {
        const handleEscape = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };
        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, [onClose]);

    if (!isOpen || !node) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div
                ref={modalRef}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 transition-colors"
            >
                {/* Header */}
                <div className="px-6 py-4 border-b border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-900/50 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-white dark:bg-white/10 rounded-lg border border-slate-200 dark:border-white/10 flex items-center justify-center text-2xl shadow-sm dark:shadow-none">
                            {formData.icon || '📦'}
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-slate-900 dark:text-white leading-none mb-1">
                                {formData.type || 'Resource'}
                            </h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                                {node.id}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
                    >
                        ✕
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 space-y-5">
                    {/* Name Input */}
                    <div className="space-y-2">
                        <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                            Resource Name
                        </label>
                        <input
                            type="text"
                            value={formData.label}
                            onChange={(e) => handleChange('label', e.target.value)}
                            className="w-full px-4 py-2.5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-white/10 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-white/20 focus:outline-none focus:border-green-500/50 focus:ring-1 focus:ring-green-500/50 transition-all shadow-sm dark:shadow-inner"
                            placeholder="e.g. Primary Database"
                        />
                    </div>

                    {/* Cost Input */}
                    <div className="space-y-2">
                        <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                            Estimated Monthly Cost
                        </label>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-white/40 font-medium">$</span>
                            <input
                                type="text"
                                value={formData.cost}
                                readOnly
                                className="w-full pl-8 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-white/10 rounded-xl text-slate-500 dark:text-slate-400 font-mono shadow-sm dark:shadow-inner cursor-default"
                                placeholder="0.00"
                            />
                        </div>
                    </div>

                    {/* Metadata (Read-only for now) */}
                    <div className="p-4 bg-slate-50 dark:bg-slate-950/50 rounded-xl border border-slate-200 dark:border-white/5 space-y-2">
                        <div className="flex justify-between text-xs">
                            <span className="text-slate-500 dark:text-slate-400">Provider</span>
                            <span className="text-slate-700 dark:text-white font-medium">{node.data.provider || 'AWS'}</span>
                        </div>
                        <div className="flex justify-between text-xs">
                            <span className="text-slate-500 dark:text-slate-400">Resource Type</span>
                            <span className="text-slate-700 dark:text-white font-medium font-mono">{node.data.resourceType || 'unknown_type'}</span>
                        </div>
                        <div className="flex justify-between text-xs">
                            <span className="text-slate-500 dark:text-slate-400">Region</span>
                            <span className="text-slate-700 dark:text-white font-medium">us-east-1</span>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                {/* Footer - Removed Buttons per request */}
                <div className="px-6 py-4 border-t border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-900/50 text-xs text-center text-slate-400 dark:text-slate-500">
                    Changes are saved automatically to local state. Click "Save Changes" in the designer to persist.
                </div>
            </div>
        </div>
    );
};
