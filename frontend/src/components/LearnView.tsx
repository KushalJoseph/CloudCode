import { useState, useRef, useEffect } from 'react';
import { api } from '../services/api';

interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
}

interface TopicContent {
    overview: string;
    keyServices: { name: string; provider: string; description: string }[];
    useCases: string[];
    bestPractices: string[];
}

interface LearnTopic {
    id: string;
    title: string;
    description: string;
    icon: string;
    color: string;
    prompt: string;
    content: TopicContent;
}

const learnTopics: LearnTopic[] = [
    {
        id: 'compute',
        title: 'Compute Services',
        description: 'Virtual machines, containers, and serverless computing',
        icon: '🖥️',
        color: 'from-blue-500 to-cyan-500',
        prompt: 'Explain cloud compute services like EC2, Lambda, and how to choose between VMs, containers, and serverless.',
        content: {
            overview: 'Compute services are the backbone of cloud infrastructure, providing the processing power to run applications. They range from traditional virtual machines to modern serverless functions, each suited for different workloads.',
            keyServices: [
                { name: 'EC2', provider: 'AWS', description: 'Scalable virtual machines with various instance types for different workloads' },
                { name: 'Compute Engine', provider: 'GCP', description: 'High-performance VMs with custom machine types and preemptible instances' },
                { name: 'Azure VMs', provider: 'Azure', description: 'Windows and Linux virtual machines with hybrid cloud capabilities' },
                { name: 'Lambda', provider: 'AWS', description: 'Serverless functions that run code without provisioning servers' },
                { name: 'ECS/EKS', provider: 'AWS', description: 'Container orchestration for Docker and Kubernetes workloads' },
                { name: 'Cloud Run', provider: 'GCP', description: 'Fully managed serverless container platform' },
            ],
            useCases: [
                'Web application hosting and scaling',
                'Batch processing and data analytics',
                'Machine learning model training',
                'Microservices architecture',
                'Development and testing environments',
            ],
            bestPractices: [
                'Right-size instances based on actual usage metrics',
                'Use auto-scaling to handle variable workloads',
                'Implement spot/preemptible instances for cost savings',
                'Choose between VMs, containers, and serverless based on workload needs',
                'Use reserved instances for predictable, steady-state workloads',
            ],
        },
    },
    {
        id: 'storage',
        title: 'Storage Solutions',
        description: 'Object storage, block storage, and file systems',
        icon: '💾',
        color: 'from-purple-500 to-pink-500',
        prompt: 'What are the different types of cloud storage? Explain S3, EBS, and when to use each.',
        content: {
            overview: 'Cloud storage provides durable, scalable, and accessible data storage. The three main types are object storage (for unstructured data), block storage (for databases and VMs), and file storage (for shared file systems).',
            keyServices: [
                { name: 'S3', provider: 'AWS', description: 'Object storage with 99.999999999% durability and lifecycle management' },
                { name: 'EBS', provider: 'AWS', description: 'High-performance block storage for EC2 instances' },
                { name: 'Cloud Storage', provider: 'GCP', description: 'Unified object storage with multiple storage classes' },
                { name: 'Azure Blob', provider: 'Azure', description: 'Massively scalable object storage for unstructured data' },
                { name: 'EFS', provider: 'AWS', description: 'Elastic file system for shared access across instances' },
                { name: 'Glacier', provider: 'AWS', description: 'Low-cost archive storage for long-term data retention' },
            ],
            useCases: [
                'Static website hosting and CDN origin',
                'Data lake for analytics and ML',
                'Database storage and backups',
                'Media file storage and streaming',
                'Disaster recovery and archival',
            ],
            bestPractices: [
                'Use lifecycle policies to move data to cheaper storage tiers',
                'Enable versioning for critical data protection',
                'Implement proper access controls and encryption',
                'Choose storage class based on access frequency',
                'Use cross-region replication for disaster recovery',
            ],
        },
    },
    {
        id: 'networking',
        title: 'Cloud Networking',
        description: 'VPCs, subnets, load balancers, and CDNs',
        icon: '🌐',
        color: 'from-green-500 to-emerald-500',
        prompt: 'Explain cloud networking concepts like VPCs, subnets, security groups, and load balancers.',
        content: {
            overview: 'Cloud networking enables secure, isolated, and high-performance connectivity between your cloud resources and the internet. VPCs provide network isolation, while load balancers distribute traffic.',
            keyServices: [
                { name: 'VPC', provider: 'AWS', description: 'Isolated virtual network with full control over IP addressing' },
                { name: 'Route 53', provider: 'AWS', description: 'Scalable DNS and domain registration service' },
                { name: 'CloudFront', provider: 'AWS', description: 'Global CDN for low-latency content delivery' },
                { name: 'ALB/NLB', provider: 'AWS', description: 'Application and Network load balancers for traffic distribution' },
                { name: 'Cloud CDN', provider: 'GCP', description: 'Content delivery network integrated with GCP services' },
                { name: 'API Gateway', provider: 'AWS', description: 'Managed service for creating and managing APIs' },
            ],
            useCases: [
                'Multi-tier application architecture',
                'Hybrid cloud connectivity',
                'Global application deployment',
                'API management and throttling',
                'DDoS protection and WAF',
            ],
            bestPractices: [
                'Use private subnets for backend services',
                'Implement security groups as stateful firewalls',
                'Use NAT gateways for outbound internet access',
                'Enable VPC flow logs for network monitoring',
                'Design for multi-AZ high availability',
            ],
        },
    },
    {
        id: 'databases',
        title: 'Databases',
        description: 'SQL, NoSQL, and managed database services',
        icon: '🗄️',
        color: 'from-orange-500 to-amber-500',
        prompt: 'What database options are available in the cloud? Compare RDS, DynamoDB, and Cloud SQL.',
        content: {
            overview: 'Cloud databases offer managed solutions for both relational (SQL) and non-relational (NoSQL) data storage. Managed services handle patching, backups, and scaling automatically.',
            keyServices: [
                { name: 'RDS', provider: 'AWS', description: 'Managed relational databases (MySQL, PostgreSQL, Oracle, SQL Server)' },
                { name: 'DynamoDB', provider: 'AWS', description: 'Serverless NoSQL database with single-digit millisecond latency' },
                { name: 'Aurora', provider: 'AWS', description: 'MySQL/PostgreSQL-compatible with 5x performance improvement' },
                { name: 'Cloud SQL', provider: 'GCP', description: 'Fully managed MySQL, PostgreSQL, and SQL Server' },
                { name: 'Cosmos DB', provider: 'Azure', description: 'Globally distributed, multi-model database service' },
                { name: 'ElastiCache', provider: 'AWS', description: 'In-memory caching with Redis and Memcached' },
            ],
            useCases: [
                'E-commerce transaction processing',
                'Real-time gaming leaderboards',
                'IoT data collection and analysis',
                'Session management and caching',
                'Content management systems',
            ],
            bestPractices: [
                'Choose SQL for complex queries and transactions',
                'Use NoSQL for flexible schemas and high scale',
                'Implement read replicas for read-heavy workloads',
                'Enable automated backups and point-in-time recovery',
                'Use connection pooling to manage database connections',
            ],
        },
    },
    {
        id: 'serverless',
        title: 'Serverless Architecture',
        description: 'Functions, event-driven design, and FaaS',
        icon: '⚡',
        color: 'from-yellow-500 to-orange-500',
        prompt: 'What is serverless architecture? Explain Lambda, Cloud Functions, and event-driven design patterns.',
        content: {
            overview: 'Serverless computing allows you to run code without managing servers. You pay only for actual compute time, and the platform automatically scales based on demand. Event-driven architecture connects services through events.',
            keyServices: [
                { name: 'Lambda', provider: 'AWS', description: 'Run code in response to events with automatic scaling' },
                { name: 'Cloud Functions', provider: 'GCP', description: 'Lightweight, event-driven serverless compute' },
                { name: 'Azure Functions', provider: 'Azure', description: 'Event-driven serverless compute with multiple triggers' },
                { name: 'Step Functions', provider: 'AWS', description: 'Visual workflow orchestration for serverless applications' },
                { name: 'EventBridge', provider: 'AWS', description: 'Serverless event bus for application integration' },
                { name: 'API Gateway', provider: 'AWS', description: 'Create REST and WebSocket APIs for Lambda' },
            ],
            useCases: [
                'API backends and webhooks',
                'Real-time file processing',
                'Scheduled tasks and cron jobs',
                'IoT event processing',
                'Chatbots and voice assistants',
            ],
            bestPractices: [
                'Keep functions small and focused',
                'Minimize cold start times with provisioned concurrency',
                'Use environment variables for configuration',
                'Implement proper error handling and retries',
                'Monitor with distributed tracing',
            ],
        },
    },
    {
        id: 'security',
        title: 'Cloud Security',
        description: 'IAM, encryption, and security best practices',
        icon: '🔒',
        color: 'from-red-500 to-rose-500',
        prompt: 'How do I secure my cloud infrastructure? Explain IAM, encryption, and security best practices.',
        content: {
            overview: 'Cloud security follows the shared responsibility model: the provider secures the infrastructure, while you secure your data and access. Key pillars include identity management, encryption, network security, and monitoring.',
            keyServices: [
                { name: 'IAM', provider: 'AWS', description: 'Fine-grained access control with users, roles, and policies' },
                { name: 'KMS', provider: 'AWS', description: 'Managed encryption keys for data protection' },
                { name: 'Security Hub', provider: 'AWS', description: 'Centralized security findings and compliance checks' },
                { name: 'GuardDuty', provider: 'AWS', description: 'Intelligent threat detection using ML' },
                { name: 'Cloud Armor', provider: 'GCP', description: 'DDoS protection and web application firewall' },
                { name: 'Secrets Manager', provider: 'AWS', description: 'Secure storage and rotation of secrets and credentials' },
            ],
            useCases: [
                'Compliance and regulatory requirements',
                'Multi-tenant application isolation',
                'Data protection and privacy',
                'Threat detection and incident response',
                'Zero-trust security implementation',
            ],
            bestPractices: [
                'Follow the principle of least privilege',
                'Enable MFA for all user accounts',
                'Encrypt data at rest and in transit',
                'Regularly rotate credentials and keys',
                'Implement logging and alerting for security events',
            ],
        },
    },
];

const initialMessages: Message[] = [
    {
        id: '1',
        role: 'assistant',
        content: "👋 Welcome to **CloudCode Learn**!\n\nI'm your cloud computing tutor. I can help you understand:\n\n• Cloud fundamentals and architecture patterns\n• AWS, GCP, and Azure services\n• Infrastructure as Code with Terraform\n• Security and best practices\n\nSelect a topic to learn more, or ask me anything!"
    }
];

const suggestedPrompts = [
    'What is cloud computing?',
    'Compare AWS vs GCP vs Azure',
    'Explain Infrastructure as Code',
];

export const LearnView = () => {
    const [messages, setMessages] = useState<Message[]>(initialMessages);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [selectedTopic, setSelectedTopic] = useState<LearnTopic | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async (messageText?: string) => {
        const text = messageText || input;
        if (!text.trim() || isLoading) return;

        const userMessage: Message = {
            id: Date.now().toString(),
            role: 'user',
            content: text,
        };

        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            const history = messages.slice(-6).map(m => ({
                role: m.role,
                content: m.content
            }));

            const response = await api.learnChat(text, history);

            const assistantMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: response.response,
            };
            setMessages(prev => [...prev, assistantMessage]);
        } catch (error) {
            const errorMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: "I'm sorry, I encountered an error while processing your question. Please try again.",
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const handleTopicClick = (topic: LearnTopic) => {
        setSelectedTopic(topic);
    };

    const handleBackToTopics = () => {
        setSelectedTopic(null);
    };

    const handleAskAboutTopic = () => {
        if (selectedTopic) {
            handleSend(selectedTopic.prompt);
        }
    };

    // Render Topic Detail View
    if (selectedTopic) {
        return (
            <div className="h-full flex bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
                {/* Topic Detail Content */}
                <div className="flex-1 flex flex-col overflow-hidden">
                    {/* Header with Back Button */}
                    <div className="p-6 border-b border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900">
                        <button
                            onClick={handleBackToTopics}
                            className="flex items-center gap-2 text-slate-500 dark:text-white/60 hover:text-slate-900 dark:hover:text-white mb-4 transition-colors"
                        >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                            Back to Topics
                        </button>
                        <div className="flex items-center gap-4">
                            <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${selectedTopic.color} flex items-center justify-center text-3xl shadow-lg`}>
                                {selectedTopic.icon}
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                                    {selectedTopic.title}
                                </h1>
                                <p className="text-slate-500 dark:text-white/60">
                                    {selectedTopic.description}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-6">
                        {/* Overview */}
                        <section className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-white/10 rounded-xl p-6">
                            <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                                <span className="text-xl">📖</span> Overview
                            </h2>
                            <p className="text-slate-600 dark:text-white/70 leading-relaxed">
                                {selectedTopic.content.overview}
                            </p>
                        </section>

                        {/* Key Services */}
                        <section className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-white/10 rounded-xl p-6">
                            <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                                <span className="text-xl">🛠️</span> Key Services
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {selectedTopic.content.keyServices.map((service, index) => (
                                    <div
                                        key={index}
                                        className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-100 dark:border-white/5"
                                    >
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="font-semibold text-slate-900 dark:text-white">{service.name}</span>
                                            <span className="text-xs px-2 py-0.5 bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400 rounded-full">
                                                {service.provider}
                                            </span>
                                        </div>
                                        <p className="text-sm text-slate-500 dark:text-white/50">{service.description}</p>
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* Use Cases & Best Practices */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <section className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-white/10 rounded-xl p-6">
                                <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                                    <span className="text-xl">💡</span> Use Cases
                                </h2>
                                <ul className="space-y-2">
                                    {selectedTopic.content.useCases.map((useCase, index) => (
                                        <li key={index} className="flex items-start gap-2 text-slate-600 dark:text-white/70 text-sm">
                                            <span className="text-green-500 mt-0.5">✓</span>
                                            {useCase}
                                        </li>
                                    ))}
                                </ul>
                            </section>

                            <section className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-white/10 rounded-xl p-6">
                                <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                                    <span className="text-xl">⭐</span> Best Practices
                                </h2>
                                <ul className="space-y-2">
                                    {selectedTopic.content.bestPractices.map((practice, index) => (
                                        <li key={index} className="flex items-start gap-2 text-slate-600 dark:text-white/70 text-sm">
                                            <span className="text-blue-500 mt-0.5">→</span>
                                            {practice}
                                        </li>
                                    ))}
                                </ul>
                            </section>
                        </div>

                        {/* Ask AI Button */}
                        <div className="flex justify-center pt-4">
                            <button
                                onClick={handleAskAboutTopic}
                                className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white font-medium rounded-xl shadow-lg shadow-green-500/20 transition-all hover:scale-105 flex items-center gap-2"
                            >
                                <span>🤖</span>
                                Ask AI for More Details
                            </button>
                        </div>
                    </div>
                </div>

                {/* Right Panel - Chat (same as main view) */}
                <div className="w-[400px] flex-shrink-0 flex flex-col h-full border-l border-slate-200 dark:border-white/10 bg-white/95 dark:bg-slate-950/95 backdrop-blur-2xl transition-colors duration-300">
                    {/* Chat Header */}
                    <div className="p-4 border-b border-slate-200 dark:border-white/10 flex items-center gap-3 bg-gradient-to-r from-slate-50 via-slate-50 to-slate-100 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-green-500/30">
                            <span className="text-white text-lg">🎓</span>
                        </div>
                        <div>
                            <h3 className="text-slate-900 dark:text-white font-bold text-sm">Cloud Tutor</h3>
                            <p className="text-green-600/60 dark:text-green-400/60 text-[10px] uppercase tracking-wider font-semibold">
                                Ask anything
                            </p>
                        </div>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                        {messages.map((message) => (
                            <div
                                key={message.id}
                                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                                <div
                                    className={`max-w-[85%] rounded-2xl p-4 shadow-sm ${message.role === 'assistant'
                                        ? 'bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-emerald-500/30 text-slate-700 dark:text-slate-200 rounded-tl-sm'
                                        : 'bg-gradient-to-br from-emerald-500 to-green-600 text-white rounded-tr-sm shadow-lg shadow-emerald-500/20'
                                        }`}
                                >
                                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                                </div>
                            </div>
                        ))}

                        {isLoading && (
                            <div className="flex justify-start">
                                <div className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-emerald-500/30 rounded-2xl rounded-tl-sm p-4">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                        <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                        <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                    </div>
                                </div>
                            </div>
                        )}

                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input */}
                    <div className="p-4 border-t border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-slate-900/50">
                        <div className="relative flex items-end gap-2 p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl focus-within:border-emerald-500/50 transition-all shadow-sm">
                            <textarea
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder="Ask about cloud computing..."
                                rows={1}
                                className="flex-1 px-3 py-2 bg-transparent text-slate-900 dark:text-white text-sm placeholder-slate-400 dark:placeholder-white/20 focus:outline-none resize-none max-h-32 min-h-[40px]"
                            />
                            <button
                                onClick={() => handleSend()}
                                disabled={!input.trim() || isLoading}
                                className="p-2 bg-gradient-to-br from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 disabled:from-slate-200 disabled:to-slate-300 dark:disabled:from-slate-700 dark:disabled:to-slate-800 disabled:text-slate-400 dark:disabled:text-white/20 text-white rounded-xl shadow-lg shadow-emerald-500/20 transition-all hover:scale-105 active:scale-95 mb-0.5"
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
                            <p className="text-[10px] text-slate-400 dark:text-white/20">
                                Powered by AI • Learn at your own pace
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Main Topics View
    return (
        <div className="h-full flex bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
            {/* Left Content - Educational Topics */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Hero Section */}
                <div className="p-8 pb-4">
                    <div className="max-w-4xl">
                        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
                            Learn Cloud Computing
                        </h1>
                        <p className="text-slate-500 dark:text-white/60 text-lg">
                            Master cloud concepts with interactive lessons and AI-powered tutoring
                        </p>
                    </div>
                </div>

                {/* Topic Cards */}
                <div className="flex-1 overflow-y-auto px-8 pb-8">
                    <div className="max-w-4xl">
                        <h2 className="text-sm font-semibold text-slate-400 dark:text-white/40 uppercase tracking-wider mb-4">
                            Learning Topics
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {learnTopics.map((topic) => (
                                <button
                                    key={topic.id}
                                    onClick={() => handleTopicClick(topic)}
                                    className="group relative bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-white/10 rounded-xl p-5 text-left hover:border-green-500/50 hover:shadow-lg hover:shadow-green-900/10 transition-all"
                                >
                                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${topic.color} flex items-center justify-center text-2xl mb-4 shadow-lg group-hover:scale-110 transition-transform`}>
                                        {topic.icon}
                                    </div>
                                    <h3 className="text-slate-900 dark:text-white font-semibold mb-1">
                                        {topic.title}
                                    </h3>
                                    <p className="text-slate-500 dark:text-white/50 text-sm">
                                        {topic.description}
                                    </p>
                                    <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <span className="text-green-500 dark:text-green-400 text-xl">→</span>
                                    </div>
                                </button>
                            ))}
                        </div>

                        {/* Quick Facts */}
                        <div className="mt-8 p-6 bg-gradient-to-br from-green-500/10 to-emerald-500/5 dark:from-green-600/20 dark:to-emerald-600/10 border border-green-500/20 rounded-xl">
                            <h3 className="text-green-700 dark:text-green-400 font-semibold mb-3 flex items-center gap-2">
                                <span className="text-xl">💡</span> Did You Know?
                            </h3>
                            <p className="text-slate-600 dark:text-white/70 text-sm leading-relaxed">
                                Cloud computing enables on-demand access to computing resources like servers, storage, and applications over the internet. The three major providers—AWS, GCP, and Azure—together control over 65% of the global cloud infrastructure market.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Panel - Chat */}
            <div className="w-[400px] flex-shrink-0 flex flex-col h-full border-l border-slate-200 dark:border-white/10 bg-white/95 dark:bg-slate-950/95 backdrop-blur-2xl transition-colors duration-300">
                {/* Chat Header */}
                <div className="p-4 border-b border-slate-200 dark:border-white/10 flex items-center gap-3 bg-gradient-to-r from-slate-50 via-slate-50 to-slate-100 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-green-500/30">
                        <span className="text-white text-lg">🎓</span>
                    </div>
                    <div>
                        <h3 className="text-slate-900 dark:text-white font-bold text-sm">Cloud Tutor</h3>
                        <p className="text-green-600/60 dark:text-green-400/60 text-[10px] uppercase tracking-wider font-semibold">
                            Ask anything
                        </p>
                    </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {messages.map((message) => (
                        <div
                            key={message.id}
                            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                            <div
                                className={`max-w-[85%] rounded-2xl p-4 shadow-sm ${message.role === 'assistant'
                                    ? 'bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-emerald-500/30 text-slate-700 dark:text-slate-200 rounded-tl-sm'
                                    : 'bg-gradient-to-br from-emerald-500 to-green-600 text-white rounded-tr-sm shadow-lg shadow-emerald-500/20'
                                    }`}
                            >
                                <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                            </div>
                        </div>
                    ))}

                    {isLoading && (
                        <div className="flex justify-start">
                            <div className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-emerald-500/30 rounded-2xl rounded-tl-sm p-4">
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                    <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                    <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Suggested Prompts */}
                    {messages.length === 1 && (
                        <div className="border-t border-slate-200 dark:border-white/5 pt-4 mt-2">
                            <p className="text-xs text-slate-400 dark:text-white/40 mb-3 px-1 uppercase tracking-wider font-semibold">
                                Popular Questions
                            </p>
                            <div className="space-y-2">
                                {suggestedPrompts.map((prompt) => (
                                    <button
                                        key={prompt}
                                        onClick={() => handleSend(prompt)}
                                        className="w-full px-4 py-3 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/50 dark:hover:bg-slate-800 text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300 text-sm font-medium rounded-xl border border-slate-200 dark:border-white/5 hover:border-emerald-500/30 transition-all text-left flex items-center gap-3 group"
                                    >
                                        <span className="w-6 h-6 rounded-full bg-emerald-500/10 flex items-center justify-center text-xs group-hover:scale-110 transition-transform">
                                            💬
                                        </span>
                                        {prompt}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div className="p-4 border-t border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-slate-900/50">
                    <div className="relative flex items-end gap-2 p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl focus-within:border-emerald-500/50 transition-all shadow-sm">
                        <textarea
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Ask about cloud computing..."
                            rows={1}
                            className="flex-1 px-3 py-2 bg-transparent text-slate-900 dark:text-white text-sm placeholder-slate-400 dark:placeholder-white/20 focus:outline-none resize-none max-h-32 min-h-[40px]"
                        />
                        <button
                            onClick={() => handleSend()}
                            disabled={!input.trim() || isLoading}
                            className="p-2 bg-gradient-to-br from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 disabled:from-slate-200 disabled:to-slate-300 dark:disabled:from-slate-700 dark:disabled:to-slate-800 disabled:text-slate-400 dark:disabled:text-white/20 text-white rounded-xl shadow-lg shadow-emerald-500/20 transition-all hover:scale-105 active:scale-95 mb-0.5"
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
                        <p className="text-[10px] text-slate-400 dark:text-white/20">
                            Powered by AI • Learn at your own pace
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};
