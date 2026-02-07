import { useState } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

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

            <div className="flex-1 overflow-hidden relative group bg-slate-950">
                <div className="absolute top-4 right-4 z-10 flex gap-2">
                     <button
                        onClick={handleCopy}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 border shadow-lg ${
                            copied 
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

               <SyntaxHighlighter
                    language="hcl"
                    style={vscDarkPlus}
                    customStyle={{
                        margin: 0,
                        padding: '1.5rem',
                        height: '100%',
                        fontSize: '0.875rem',
                        lineHeight: '1.5',
                        backgroundColor: 'transparent',
                    }}
                    showLineNumbers={true}
                    wrapLines={true}
                >
                    {code || "// No Terraform code generated yet. Describe your infrastructure to generate code."}
                </SyntaxHighlighter>
            </div>
        </div>
    );
};
