import { useState } from 'react';

interface TerraformViewerProps {
    code: string;
}

export const TerraformViewer = ({ code }: TerraformViewerProps) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        await navigator.clipboard.writeText(code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="h-full flex flex-col bg-slate-900 border-l border-white/10">
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-slate-900/50">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center border border-indigo-500/30">
                        <span className="text-lg">📄</span>
                    </div>
                    <div>
                        <h3 className="text-white font-medium">Terraform Configuration</h3>
                        <p className="text-xs text-slate-400">Generated infrastructure code</p>
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-auto relative group bg-slate-950 p-4">
                <div className="absolute top-4 right-4 z-10 flex gap-2">
                    <button
                        onClick={handleCopy}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 border shadow-lg ${copied
                                ? 'bg-green-500/20 text-green-400 border-green-500/30'
                                : 'bg-slate-800/80 backdrop-blur-sm text-slate-300 border-white/10 hover:bg-slate-700 hover:border-white/20'
                            }`}
                    >
                        {copied ? (
                            <>
                                <span>✓</span>
                                <span>Copied!</span>
                            </>
                        ) : (
                            <>
                                <span>Copy</span>
                            </>
                        )}
                    </button>
                </div>

                <pre className="font-mono text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">
                    {code || "// No Terraform code generated yet. Describe your infrastructure to generate code."}
                </pre>
            </div>
        </div>
    );
};
