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
}

export const ChatPanel = ({ initialMessage }: ChatPanelProps) => {
    const [messages, setMessages] = useState<Message[]>(initialMessages);
    const [input, setInput] = useState('');
    const [isOpen, setIsOpen] = useState(true);

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

            setMessages([...initialMessages, userMessage, assistantMessage]);
        }
    }, [initialMessage]);

    const handleSend = () => {
        if (!input.trim()) return;

        const userMessage: Message = {
            id: Date.now().toString(),
            role: 'user',
            content: input,
        };

        const assistantMessage: Message = {
            id: (Date.now() + 1).toString(),
            role: 'assistant',
            content: `I'll help you with "${input}". Let me analyze your architecture and suggest the best approach...`,
        };

        setMessages([...messages, userMessage, assistantMessage]);
        setInput('');
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

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="absolute top-4 right-4 px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-md flex items-center gap-2 z-10"
            >
                💬 AI Chat
            </button>
        );
    }

    return (
        <div className="w-80 border-l border-white/10 bg-slate-900 flex flex-col">
            {/* Header */}
            <div className="p-4 border-b border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <span className="text-green-500">💬</span>
                    <span className="text-white font-semibold">AI Chat</span>
                </div>
                <button
                    onClick={() => setIsOpen(false)}
                    className="text-white/40 hover:text-white text-lg"
                >
                    ✕
                </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((message) => (
                    <div
                        key={message.id}
                        className={`${message.role === 'assistant'
                            ? 'bg-slate-800 border border-white/10'
                            : 'bg-green-600/20 border border-green-500/30'
                            } rounded-lg p-3`}
                    >
                        <p className="text-white/90 text-sm whitespace-pre-wrap">{message.content}</p>
                    </div>
                ))}

                {/* Suggested Prompts */}
                {messages.length === 1 && (
                    <div className="space-y-2">
                        {suggestedPrompts.map((prompt) => (
                            <button
                                key={prompt}
                                onClick={() => handleSuggestion(prompt)}
                                className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-md text-left"
                            >
                                {prompt}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Input */}
            <div className="p-4 border-t border-white/10">
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Ask to build an architecture..."
                        className="flex-1 px-3 py-2 bg-slate-800 border border-white/10 rounded-md text-white text-sm placeholder-white/40 focus:outline-none focus:border-green-500/50"
                    />
                    <button
                        onClick={handleSend}
                        disabled={!input.trim()}
                        className="px-3 py-2 bg-green-600 hover:bg-green-700 disabled:bg-slate-700 text-white rounded-md"
                    >
                        ➤
                    </button>
                </div>
            </div>
        </div>
    );
};
