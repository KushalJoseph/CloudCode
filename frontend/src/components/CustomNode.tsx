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
    if (type.startsWith('google_')) return `/gcp-icons/${type}.png`;
    if (type.startsWith('azurerm_')) return `/azure-icons/${type}.png`;
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
            {/* Handles on all 4 sides - larger with unique IDs */}
            <Handle
                type="source"
                position={Position.Top}
                id="top"
                isConnectable={true}
                className="w-8 h-8 !bg-slate-400 !border-4 !border-slate-800 hover:!bg-white hover:!scale-110 !transition-all !shadow-lg !rounded-full"
                style={{ top: -16 }}
            />
            <Handle
                type="source"
                position={Position.Right}
                id="right"
                isConnectable={true}
                className="w-8 h-8 !bg-slate-400 !border-4 !border-slate-800 hover:!bg-white hover:!scale-110 !transition-all !shadow-lg !rounded-full"
                style={{ right: -16 }}
            />
            <Handle
                type="source"
                position={Position.Bottom}
                id="bottom"
                isConnectable={true}
                className="w-8 h-8 !bg-slate-400 !border-4 !border-slate-800 hover:!bg-white hover:!scale-110 !transition-all !shadow-lg !rounded-full"
                style={{ bottom: -16 }}
            />
            <Handle
                type="source"
                position={Position.Left}
                id="left"
                isConnectable={true}
                className="w-8 h-8 !bg-slate-400 !border-4 !border-slate-800 hover:!bg-white hover:!scale-110 !transition-all !shadow-lg !rounded-full"
                style={{ left: -16 }}
            />

            {/* Node card */}
            <div 
                onClick={(e) => {
                    e.stopPropagation();
                    if (data.onEdit) {
                        data.onEdit();
                    }
                }}
                className={`
                px-6 py-4 rounded-xl
                bg-slate-900/90 backdrop-blur-md
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
                    className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/20 hover:bg-black/40 flex items-center justify-center text-white text-xs transition-all opacity-0 group-hover:opacity-100"
                    title="Options"
                >
                    ⋮
                </button>

                {/* Dropdown menu */}
                {showMenu && (
                    <div className="absolute top-10 right-2 bg-slate-800 border border-white/20 rounded-md shadow-lg z-50 min-w-[120px]">
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                handleDelete();
                            }}
                            className="w-full px-4 py-2 text-left text-white hover:bg-red-600 rounded-md flex items-center gap-2 text-sm"
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
                                if (e.currentTarget.parentElement) {
                                    e.currentTarget.parentElement.className = `text-4xl mb-2 text-center text-slate-400 transition-colors duration-300 ${iconClass}`;
                                    e.currentTarget.parentElement.innerText = data.icon;
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
                <div className="text-slate-200 font-semibold text-center mb-1 transition-colors duration-300 group-hover:text-white">
                    {data.label}
                </div>

                {/* Description */}
                <div className="text-slate-400 text-xs text-center transition-colors duration-300 group-hover:text-slate-300">
                    {data.description}
                </div>
            </div>
        </div>
    );
});

CustomNode.displayName = 'CustomNode';
