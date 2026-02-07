import { memo, useState, useEffect, useRef } from 'react';
import { Handle, Position, useReactFlow } from 'reactflow';

interface NodeData {
    label: string;
    type: string;
    icon: string;
    color: string;
    description: string;
    resourceType?: string;
    onEdit?: () => void;
}

const colorMap: Record<string, string> = {
    cyan: 'border-cyan-500/50 hover:border-cyan-400',
    blue: 'border-blue-500/50 hover:border-blue-400',
    purple: 'border-purple-500/50 hover:border-purple-400',
    green: 'border-emerald-500/50 hover:border-emerald-400',
    orange: 'border-orange-500/50 hover:border-orange-400'
};

const glowMap: Record<string, string> = {
    cyan: 'shadow-[0_0_20px_-5px_rgba(6,182,212,0.3)]',
    blue: 'shadow-[0_0_20px_-5px_rgba(59,130,246,0.3)]',
    purple: 'shadow-[0_0_20px_-5px_rgba(168,85,247,0.3)]',
    green: 'shadow-[0_0_20px_-5px_rgba(16,185,129,0.3)]',
    orange: 'shadow-[0_0_20px_-5px_rgba(249,115,22,0.3)]'
};

const iconColorMap: Record<string, string> = {
    cyan: 'text-cyan-400',
    blue: 'text-blue-400',
    purple: 'text-purple-400',
    green: 'text-emerald-400',
    orange: 'text-orange-400'
};

// Helper to get image path based on component type
const getImagePath = (type: string) => {
    if (!type) return null;
    if (type.startsWith('aws_')) return `/aws-icons/${type}.png`;
    if (type.startsWith('google_') || type.startsWith('gcp_')) return `/gcp-icons/${type}.png`;
    if (type.startsWith('azurerm_') || type.startsWith('azure_')) return `/azure-icons/${type}.png`;
    return null;
};

export const CustomNode = memo(({ id, data }: { id: string; data: NodeData }) => {
    const [showMenu, setShowMenu] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);
    const { deleteElements } = useReactFlow();
    const borderClass = colorMap[data.color] || 'border-slate-600';
    const glowClass = glowMap[data.color] || '';
    const iconClass = iconColorMap[data.color] || 'text-slate-400';

    const imagePath = getImagePath(data.resourceType || data.type);

    const handleDelete = () => {
        deleteElements({ nodes: [{ id }] });
        setShowMenu(false);
    };

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setShowMenu(false);
            }
        };

        if (showMenu) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showMenu]);

    return (
        <div className="relative" ref={menuRef}>
            {/* Handles on all 4 sides - Target (Rendered first so they are behind Source) */}
            <Handle
                type="target"
                position={Position.Top}
                id="target-top"
                isConnectable={true}
                isConnectableStart={false}
                className="w-3 h-3 !bg-slate-300 dark:!bg-slate-400 !border-2 !border-slate-400 dark:!border-slate-800 !rounded-full opacity-0"
                style={{ top: -6 }}
            />
            <Handle
                type="target"
                position={Position.Right}
                id="target-right"
                isConnectable={true}
                isConnectableStart={false}
                className="w-3 h-3 !bg-slate-300 dark:!bg-slate-400 !border-2 !border-slate-400 dark:!border-slate-800 !rounded-full opacity-0"
                style={{ right: -6 }}
            />
            <Handle
                type="target"
                position={Position.Bottom}
                id="target-bottom"
                isConnectable={true}
                isConnectableStart={false}
                className="w-3 h-3 !bg-slate-300 dark:!bg-slate-400 !border-2 !border-slate-400 dark:!border-slate-800 !rounded-full opacity-0"
                style={{ bottom: -6 }}
            />
            <Handle
                type="target"
                position={Position.Left}
                id="target-left"
                isConnectable={true}
                isConnectableStart={false}
                className="w-3 h-3 !bg-slate-300 dark:!bg-slate-400 !border-2 !border-slate-400 dark:!border-slate-800 !rounded-full opacity-0"
                style={{ left: -6 }}
            />

            {/* Handles on all 4 sides - Source (Rendered last so they are on top & clickable) */}
            <Handle
                type="source"
                position={Position.Top}
                id="source-top"
                isConnectable={true}
                className="w-3 h-3 !bg-slate-300 dark:!bg-slate-400 !border-2 !border-slate-400 dark:!border-slate-800 hover:!bg-slate-600 dark:hover:!bg-white hover:!scale-110 !transition-all !rounded-full opacity-0 hover:opacity-100"
                style={{ top: -6 }}
            />
            <Handle
                type="source"
                position={Position.Right}
                id="source-right"
                isConnectable={true}
                className="w-3 h-3 !bg-slate-300 dark:!bg-slate-400 !border-2 !border-slate-400 dark:!border-slate-800 hover:!bg-slate-600 dark:hover:!bg-white hover:!scale-110 !transition-all !rounded-full opacity-0 hover:opacity-100"
                style={{ right: -6 }}
            />
            <Handle
                type="source"
                position={Position.Bottom}
                id="source-bottom"
                isConnectable={true}
                className="w-3 h-3 !bg-slate-300 dark:!bg-slate-400 !border-2 !border-slate-400 dark:!border-slate-800 hover:!bg-slate-600 dark:hover:!bg-white hover:!scale-110 !transition-all !rounded-full opacity-0 hover:opacity-100"
                style={{ bottom: -6 }}
            />
            <Handle
                type="source"
                position={Position.Left}
                id="source-left"
                isConnectable={true}
                className="w-3 h-3 !bg-slate-300 dark:!bg-slate-400 !border-2 !border-slate-400 dark:!border-slate-800 hover:!bg-slate-600 dark:hover:!bg-white hover:!scale-110 !transition-all !rounded-full opacity-0 hover:opacity-100"
                style={{ left: -6 }}
            />

            {/* Node card */}
            <div
                className={`
                px-6 py-4 rounded-xl
                bg-white/90 dark:bg-slate-900/90 backdrop-blur-md
                border-2 ${borderClass}
                ${glowClass}
                min-w-[180px]
                transition-all duration-300 hover:scale-[1.02] hover:cursor-pointer
                relative
                group
            `}>
                {/* Three-dot menu button */}
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        setShowMenu(!showMenu);
                    }}
                    className="absolute top-2 right-2 w-6 h-6 rounded-full bg-slate-200 dark:bg-black/20 hover:bg-slate-300 dark:hover:bg-black/40 flex items-center justify-center text-slate-600 dark:text-white text-xs transition-all opacity-0 group-hover:opacity-100"
                    title="Options"
                >
                    ⋮
                </button>

                {/* Dropdown menu */}
                {showMenu && (
                    <div className="absolute top-10 right-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/20 rounded-md shadow-lg z-50 min-w-[120px]">
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                handleDelete();
                            }}
                            className="w-full px-4 py-2 text-left text-slate-700 dark:text-white hover:bg-red-100 dark:hover:bg-red-600 hover:text-red-600 dark:hover:text-white rounded-md flex items-center gap-2 text-sm"
                        >
                            <span>🗑️</span>
                            <span>Delete</span>
                        </button>
                    </div>
                )}

                {/* Icon */}
                <div className={`mb-2 flex justify-center items-center h-12 transition-colors duration-300`}>
                    {imagePath ? (
                        <img
                            src={imagePath}
                            alt={data.label}
                            className="w-12 h-12 object-contain drop-shadow-md"
                            onError={(e) => {
                                e.currentTarget.style.display = 'none';
                                const parent = e.currentTarget.parentElement;
                                if (parent) {
                                    parent.className = `text-4xl mb-2 text-center text-slate-400 transition-colors duration-300 ${iconClass}`;
                                    parent.innerText = data.icon;
                                }
                            }}
                        />
                    ) : (
                        <div className={`text-4xl text-center ${iconClass}`}>
                            {data.icon}
                        </div>
                    )}
                </div>

                {/* Label */}
                <div className="text-slate-700 dark:text-slate-200 font-semibold text-center mb-1 transition-colors duration-300 group-hover:text-slate-900 dark:group-hover:text-white">
                    {data.label}
                </div>

                {/* Description */}
                <div className="text-slate-500 dark:text-slate-400 text-xs text-center transition-colors duration-300 group-hover:text-slate-600 dark:group-hover:text-slate-300">
                    {data.description}
                </div>
            </div>
        </div>
    );
});

CustomNode.displayName = 'CustomNode';
