import { useState, useEffect } from 'react';

interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
}

const initialMessages: Message[] = [
    {
        id: '1',
        role: 'assistant',
        content: "Welcome to CloudCode Designer! I can help you design cloud architectures, explain components, and generate Terraform code.\n\nTry asking me to:\n• Build a serverless API\n• Explain how Lambda works\n• Design a scalable web app"
    }
];

const suggestedPrompts = [
    'Build a REST API',
    'Add a database',
    'Make it scalable',
];

interface ChatPanelProps {
    initialMessage?: string;
    refinedPrompt?: string;
    onSendMessage?: (message: string) => Promise<any>;
    isLoading?: boolean;
    isOpen: boolean;
    onClose: () => void;
}

export const ChatPanel = ({ initialMessage, refinedPrompt, onSendMessage, isLoading = false, isOpen, onClose }: ChatPanelProps) => {
    const [messages, setMessages] = useState<Message[]>(initialMessages);
    const [input, setInput] = useState('');

    useEffect(() => {
        if (initialMessage) {
            const userMessage: Message = {
                id: Date.now().toString(),
                role: 'user',
                content: initialMessage,
            };

            const assistantMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: `I'll help you with "${initialMessage}". Let me analyze your requirements and suggest the best cloud architecture...`,
            };

            const newMessages = [...initialMessages, userMessage, assistantMessage];

            if (refinedPrompt) {
                newMessages.push({
                    id: (Date.now() + 2).toString(),
                    role: 'assistant',
                    content: `Here is what I built for you based on your request. Please see the diagram for more details: \n\n${refinedPrompt} \n\n` +
                        "Please let me know if you'd like to change or add something to your architecture design.",
                });
            }

            setMessages(newMessages);
        }
    }, [initialMessage, refinedPrompt]);

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;

        const userMessage: Message = {
            id: Date.now().toString(),
            role: 'user',
            content: input,
        };

        setMessages(prev => [...prev, userMessage]);
        setInput('');

        if (onSendMessage) {
            try {
                // Add temporary thinking message
                const thinkingId = (Date.now() + 1).toString();
                setMessages(prev => [...prev, {
                    id: thinkingId,
                    role: 'assistant',
                    content: 'Generating updates...'
                }]);

                const response = await onSendMessage(input);

                // Remove thinking message and add actual response
                setMessages(prev => {
                    const filtered = prev.filter(m => m.id !== thinkingId);
                    return [...filtered, {
                        id: (Date.now() + 2).toString(),
                        role: 'assistant',
                        content: `Updated infrastructure based on: "${input}"\n\nRefined Plan:\n${response.refined_prompt || 'Updates applied.'}`
                    }];
                });
            } catch (error) {
                setMessages(prev => [...prev, {
                    id: (Date.now() + 3).toString(),
                    role: 'assistant',
                    content: "Sorry, I encountered an error while updating the infrastructure."
                }]);
            }
        } else {
            // Fallback for simulation/testing without backend
            const assistantMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: `I'll help you with "${input}". Let me analyze your architecture and suggest the best approach...`,
            };
            setMessages(prev => [...prev, assistantMessage]);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const handleSuggestion = (prompt: string) => {
        setInput(prompt);
    };

// ... imports and interfaces remain the same

// ... ChatPanel component logic remains the same

    if (!isOpen) return null;

    return (
        <div className="h-full border-l border-slate-200 dark:border-white/10 bg-white/95 dark:bg-slate-950/95 backdrop-blur-2xl flex flex-col shadow-2xl transition-colors duration-300">
            {/* Header */}
            <div className="p-4 border-b border-slate-200 dark:border-white/10 flex items-center justify-between bg-gradient-to-r from-slate-50 via-slate-50 to-slate-100 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800 transition-colors">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-green-500/10 dark:bg-green-500/20 flex items-center justify-center border border-green-500/20 dark:border-green-500/30">
                        <span className="text-green-600 dark:text-green-400 text-sm">✨</span>
                    </div>
                    <div>
                        <h3 className="text-slate-900 dark:text-white font-bold text-sm">AI Architect</h3>
                        <p className="text-green-600/60 dark:text-green-400/60 text-[10px] uppercase tracking-wider font-semibold">Online</p>
                    </div>
                </div>
                <button
                    onClick={onClose}
                    className="w-8 h-8 rounded-full hover:bg-slate-200 dark:hover:bg-white/10 flex items-center justify-center text-slate-400 dark:text-white/40 hover:text-slate-900 dark:hover:text-white transition-colors"
                >
                    ✕
                </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6">
                {messages.map((message) => (
                    <div
                        key={message.id}
                        className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                        <div
                            className={`max-w-[85%] rounded-2xl p-4 shadow-sm transition-all duration-300 ${message.role === 'assistant'
                                ? 'bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-emerald-500/30 text-slate-700 dark:text-slate-200 rounded-tl-sm shadow-sm dark:shadow-[0_0_20px_-5px_rgba(16,185,129,0.3)]'
                                : 'bg-gradient-to-br from-emerald-500 to-green-600 text-white rounded-tr-sm shadow-lg shadow-emerald-500/20 dark:shadow-emerald-900/20'
                                }`}
                        >
                            <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                        </div>
                    </div>
                ))}

                {/* Suggested Prompts */}
                {messages.length === 1 && (
                    <div className="border-t border-slate-200 dark:border-white/5 pt-4 mt-2">
                        <p className="text-xs text-slate-400 dark:text-white/40 mb-3 px-1 uppercase tracking-wider font-semibold">Suggested Actions</p>
                        <div className="space-y-2">
                            {suggestedPrompts.map((prompt) => (
                                <button
                                    key={prompt}
                                    onClick={() => handleSuggestion(prompt)}
                                    className="w-full px-4 py-3 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/50 dark:hover:bg-slate-800 text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300 text-sm font-medium rounded-xl border border-slate-200 dark:border-white/5 hover:border-emerald-500/30 transition-all text-left flex items-center gap-3 group"
                                >
                                    <span className="w-6 h-6 rounded-full bg-emerald-500/10 flex items-center justify-center text-xs group-hover:scale-110 transition-transform">⚡</span>
                                    {prompt}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Input */}
            <div className="p-4 border-t border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-slate-900/50 transition-colors">
                <div className="relative flex items-end gap-2 p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl focus-within:border-emerald-500/50 focus-within:bg-slate-50 dark:focus-within:bg-slate-800/50 transition-all shadow-sm dark:shadow-inner">
                    <textarea
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Describe your cloud architecture..."
                        rows={1}
                        className="flex-1 px-3 py-2 bg-transparent text-slate-900 dark:text-white text-sm placeholder-slate-400 dark:placeholder-white/20 focus:outline-none resize-none max-h-32 min-h-[40px]"
                        style={{ height: 'auto', minHeight: '24px' }}
                    />
                    <button
                        onClick={handleSend}
                        disabled={!input.trim() || isLoading}
                        className="p-2 bg-gradient-to-br from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 disabled:from-slate-200 disabled:to-slate-300 dark:disabled:from-slate-700 dark:disabled:to-slate-800 disabled:text-slate-400 dark:disabled:text-white/20 text-white rounded-xl shadow-lg shadow-emerald-500/20 dark:shadow-emerald-900/20 transition-all hover:scale-105 active:scale-95 mb-0.5"
                    >
                        {isLoading ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                                <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
                            </svg>
                        )}
                    </button>
                </div>
                <div className="text-center mt-2">
                    <p className="text-[10px] text-slate-400 dark:text-white/20">AI generates suggestions based on best practices</p>
                </div>
            </div>
        </div>
    );
};
