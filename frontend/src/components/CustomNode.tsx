import { memo, useState, useEffect, useRef } from 'react';
import { Handle, Position, useReactFlow } from 'reactflow';

interface NodeData {
    label: string;
    type: string;
    icon: string;
    color: string;
    description: string;
    onEdit?: () => void;
}

const colorMap: Record<string, string> = {
    cyan: 'from-cyan-500 to-blue-500',
    blue: 'from-blue-500 to-indigo-500',
    purple: 'from-purple-500 to-pink-500',
    green: 'from-green-500 to-emerald-500',
    orange: 'from-orange-500 to-red-500'
};

const shadowMap: Record<string, string> = {
    cyan: 'shadow-cyan-500/50',
    blue: 'shadow-blue-500/50',
    purple: 'shadow-purple-500/50',
    green: 'shadow-green-500/50',
    orange: 'shadow-orange-500/50'
};

export const CustomNode = memo(({ id, data }: { id: string; data: NodeData }) => {
    const [showMenu, setShowMenu] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);
    const { deleteElements } = useReactFlow();
    const gradientClass = colorMap[data.color] || 'from-gray-500 to-gray-600';
    const shadowClass = shadowMap[data.color] || 'shadow-gray-500/50';

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
                className="w-10 h-10 !bg-cyan-400 !border-3 !border-white hover:!bg-cyan-300 hover:!scale-125 !transition-all !shadow-lg"
                style={{ top: -20 }}
            />
            <Handle
                type="source"
                position={Position.Right}
                id="right"
                isConnectable={true}
                className="w-10 h-10 !bg-cyan-400 !border-3 !border-white hover:!bg-cyan-300 hover:!scale-125 !transition-all !shadow-lg"
                style={{ right: -20 }}
            />
            <Handle
                type="source"
                position={Position.Bottom}
                id="bottom"
                isConnectable={true}
                className="w-10 h-10 !bg-cyan-400 !border-3 !border-white hover:!bg-cyan-300 hover:!scale-125 !transition-all !shadow-lg"
                style={{ bottom: -20 }}
            />
            <Handle
                type="source"
                position={Position.Left}
                id="left"
                isConnectable={true}
                className="w-10 h-10 !bg-cyan-400 !border-3 !border-white hover:!bg-cyan-300 hover:!scale-125 !transition-all !shadow-lg"
                style={{ left: -20 }}
            />

            {/* Node card */}
            <div className={`
px-6 py-4 rounded-lg 
bg-gradient-to-br ${gradientClass}
shadow-lg ${shadowClass}
        border border-white/20
min-w-[180px]
transition-transform hover:scale-105
relative
    `}>
                {/* Three-dot menu button */}
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        setShowMenu(!showMenu);
                    }}
                    className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/20 hover:bg-black/40 flex items-center justify-center text-white text-xs transition-all"
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
                                setShowMenu(false);
                                if (data.onEdit) {
                                    data.onEdit();
                                }
                            }}
                            className="w-full px-4 py-2 text-left text-white hover:bg-blue-600 rounded-t-md flex items-center gap-2 text-sm"
                        >
                            <span>✏️</span>
                            <span>Edit</span>
                        </button>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                handleDelete();
                            }}
                            className="w-full px-4 py-2 text-left text-white hover:bg-red-600 rounded-b-md flex items-center gap-2 text-sm"
                        >
                            <span>🗑️</span>
                            <span>Delete</span>
                        </button>
                    </div>
                )}

                {/* Icon */}
                <div className="text-4xl mb-2 text-center">
                    {data.icon}
                </div>

                {/* Label */}
                <div className="text-white font-semibold text-center mb-1">
                    {data.label}
                </div>

                {/* Description */}
                <div className="text-white/80 text-xs text-center">
                    {data.description}
                </div>
            </div>
        </div>
    );
});

CustomNode.displayName = 'CustomNode';
