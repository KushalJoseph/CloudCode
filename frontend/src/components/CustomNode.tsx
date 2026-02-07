import { memo } from 'react';
import { Handle, Position } from 'reactflow';

interface CustomNodeProps {
    data: {
        label: string;
        type: string;
        icon: string;
        color: string;
        description: string;
    };
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

export const CustomNode = memo(({ data }: CustomNodeProps) => {
    const gradientClass = colorMap[data.color] || 'from-gray-500 to-gray-600';
    const shadowClass = shadowMap[data.color] || 'shadow-gray-500/50';

    return (
        <div className="relative">
            {/* Input handle (top) */}
            <Handle
                type="target"
                position={Position.Top}
                className="w-3 h-3 !bg-cyan-400"
            />

            {/* Node card */}
            <div className={`
        px-6 py-4 rounded-lg 
        bg-gradient-to-br ${gradientClass}
        shadow-lg ${shadowClass}
        border border-white/20
        backdrop-blur-sm
        min-w-[180px]
        transition-transform hover:scale-105
      `}>
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

            {/* Output handle (bottom) */}
            <Handle
                type="source"
                position={Position.Bottom}
                className="w-3 h-3 !bg-cyan-400"
            />
        </div>
    );
});

CustomNode.displayName = 'CustomNode';
