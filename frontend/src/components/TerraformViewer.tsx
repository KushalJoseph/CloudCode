import { useState } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus, vs } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { useTheme } from '../context/ThemeContext';

interface TerraformViewerProps {
    code: string;
}

export const TerraformViewer = ({ code }: TerraformViewerProps) => {
    const [copied, setCopied] = useState(false);
    const { theme } = useTheme();

    const handleCopy = async () => {
        await navigator.clipboard.writeText(code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="h-full flex flex-col bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-white/10 transition-colors duration-300">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-slate-900/50">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-indigo-500/10 dark:bg-indigo-500/20 flex items-center justify-center border border-indigo-500/20 dark:border-indigo-500/30">
                        <span className="text-lg">📄</span>
                    </div>
                    <div>
                        <h3 className="text-slate-900 dark:text-white font-medium">Terraform Configuration</h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400">Generated infrastructure code</p>
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-auto relative group bg-slate-50 dark:bg-slate-950 transition-colors">
                <div className="absolute top-4 right-4 z-10 flex gap-2">
                    <button
                        onClick={handleCopy}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 border shadow-sm ${copied
                                ? 'bg-green-500/10 dark:bg-green-500/20 text-green-600 dark:text-green-400 border-green-500/20 dark:border-green-500/30'
                                : 'bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm text-slate-600 dark:text-slate-300 border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-slate-700 hover:border-slate-300 dark:hover:border-white/20'
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

                {code ? (
                    <SyntaxHighlighter
                        language="hcl"
                        style={theme === 'dark' ? vscDarkPlus : vs}
                        customStyle={{
                            margin: 0,
                            padding: '1.5rem',
                            background: 'transparent',
                            fontSize: '0.875rem',
                            lineHeight: '1.5',
                        }}
                        wrapLines={true}
                        showLineNumbers={true}
                        lineNumberStyle={{ minWidth: '2.5em', paddingRight: '1em', color: theme === 'dark' ? '#64748b' : '#94a3b8', textAlign: 'right' }}
                    >
                        {code}
                    </SyntaxHighlighter>
                ) : (
                    <div className="p-6 text-slate-400 dark:text-slate-500 text-sm font-mono italic">
                        // No Terraform code generated yet. Describe your infrastructure to generate code.
                    </div>
                )}
            </div>
        </div>
    );
};
