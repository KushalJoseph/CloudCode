import React from 'react';

interface ValidationPanelProps {
    analysis?: string;
    errors?: string[];
    warnings?: string[];
    onClose: () => void;
}

// ... imports and interfaces remain the same

export const ValidationPanel: React.FC<ValidationPanelProps> = ({
    analysis,
    errors = [],
    warnings = [],
    onClose
}) => {
    if (!analysis && errors.length === 0 && warnings.length === 0) return null;

    const hasErrors = errors.length > 0;
    const hasWarnings = warnings.length > 0;

    return (
        <div className="absolute bottom-6 right-6 w-96 max-h-[80vh] flex flex-col gap-2 z-50 animate-in fade-in slide-in-from-bottom-4 duration-300">

            {/* Analysis / Success Message */}
            {analysis && !hasErrors && (
                <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-green-200 dark:border-green-500/30 rounded-lg shadow-xl dark:shadow-2xl overflow-hidden transition-colors">
                    <div className="bg-green-50 dark:bg-green-500/10 px-4 py-2 border-b border-green-100 dark:border-green-500/20 flex justify-between items-center transition-colors">
                        <span className="text-green-700 dark:text-green-400 font-semibold text-sm flex items-center gap-2">
                            <span>✅</span> Update Successful
                        </span>
                        <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors">
                            ✕
                        </button>
                    </div>
                    <div className="p-4">
                        <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">{analysis}</p>
                    </div>
                </div>
            )}

            {/* Errors */}
            {hasErrors && (
                <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-red-200 dark:border-red-500/30 rounded-lg shadow-xl dark:shadow-2xl overflow-hidden transition-colors">
                    <div className="bg-red-50 dark:bg-red-500/10 px-4 py-2 border-b border-red-100 dark:border-red-500/20 flex justify-between items-center transition-colors">
                        <span className="text-red-700 dark:text-red-400 font-semibold text-sm flex items-center gap-2">
                            <span>❌</span> Validation Errors
                        </span>
                        <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors">
                            ✕
                        </button>
                    </div>
                    <div className="p-4">
                        {analysis && <p className="text-slate-500 dark:text-slate-400 text-xs mb-3 italic">{analysis}</p>}
                        <ul className="space-y-2">
                            {errors.map((error, i) => (
                                <li key={i} className="text-red-600 dark:text-red-300 text-sm flex gap-2 items-start">
                                    <span className="mt-1">•</span>
                                    <span>{error}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            )}

            {/* Warnings */}
            {hasWarnings && (
                <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-yellow-200 dark:border-yellow-500/30 rounded-lg shadow-xl dark:shadow-2xl overflow-hidden transition-colors">
                    <div className="bg-yellow-50 dark:bg-yellow-500/10 px-4 py-2 border-b border-yellow-100 dark:border-yellow-500/20 flex justify-between items-center transition-colors">
                        <span className="text-yellow-700 dark:text-yellow-400 font-semibold text-sm flex items-center gap-2">
                            <span>⚠️</span> Warnings
                        </span>
                        {!hasErrors && !analysis && (
                            <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors">
                                ✕
                            </button>
                        )}
                    </div>
                    <div className="p-4">
                        <ul className="space-y-2">
                            {warnings.map((warning, i) => (
                                <li key={i} className="text-yellow-700 dark:text-yellow-300 text-sm flex gap-2 items-start">
                                    <span className="mt-1">•</span>
                                    <span>{warning}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            )}
        </div>
    );
};
