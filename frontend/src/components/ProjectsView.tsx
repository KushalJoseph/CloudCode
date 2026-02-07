import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import awsLogo from '../assets/aws_logo.png';
import gcpLogo from '../assets/google_logo.svg';
import azureLogo from '../assets/azure_logo.svg';

type CloudProvider = 'AWS' | 'GCP' | 'Azure';

interface Project {
    id: string;
    title: string;
    description: string;
    provider: CloudProvider;
    createdAt: string;
    updatedAt: string;
}

const STORAGE_KEY = 'cloudcode-projects';

// Utility to generate unique IDs
const generateId = () => `proj_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

// Cloud provider options
const providers: Array<{ value: CloudProvider; label: string; icon: string }> = [
    { value: 'AWS', label: 'Amazon Web Services', icon: awsLogo },
    { value: 'GCP', label: 'Google Cloud Platform', icon: gcpLogo },
    { value: 'Azure', label: 'Microsoft Azure', icon: azureLogo },
];

// ... imports and interfaces remain the same

// ... mockProjects constant remains the same

export const ProjectsView = () => {
    const navigate = useNavigate();
    const [projects, setProjects] = useState<Project[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [viewMode, setViewMode] = useState<'tile' | 'list'>('tile');

    // Modal states
    const [showNewProjectModal, setShowNewProjectModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedProject, setSelectedProject] = useState<Project | null>(null);
    const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

    // Form states
    const [newTitle, setNewTitle] = useState('');
    const [newDescription, setNewDescription] = useState('');
    const [newProvider, setNewProvider] = useState<CloudProvider>('AWS');
    const [deleteConfirmText, setDeleteConfirmText] = useState('');

    // Load projects from localStorage
    useEffect(() => {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            try {
                setProjects(JSON.parse(saved));
            } catch (e) {
                console.error('Failed to parse saved projects:', e);
            }
        }
    }, []);

    // Save projects to localStorage
    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
    }, [projects]);

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = () => setActiveMenuId(null);
        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, []);

    const filteredProjects = projects.filter(project =>
        project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.description.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleCreateProject = () => {
        if (!newTitle.trim()) return;

        const now = new Date().toLocaleDateString();
        const newProject: Project = {
            id: generateId(),
            title: newTitle.trim(),
            description: newDescription.trim() || 'No description',
            provider: newProvider,
            createdAt: now,
            updatedAt: now,
        };

        setProjects(prev => [newProject, ...prev]);
        setShowNewProjectModal(false);
        resetForm();

        // Navigate to designer with project info
        navigate('/designer', {
            state: {
                projectName: newProject.title,
                cloudProvider: newProject.provider,
                nodes: [],
                edges: [],
            },
        });
    };

    const handleOpenProject = (project: Project) => {
        navigate('/designer', {
            state: {
                projectName: project.title,
                cloudProvider: project.provider,
                nodes: [],
                edges: [],
            },
        });
    };

    const handleDeleteProject = () => {
        if (!selectedProject) return;
        const expectedText = `delete ${selectedProject.title}`;
        if (deleteConfirmText !== expectedText) return;

        setProjects(prev => prev.filter(p => p.id !== selectedProject.id));
        setShowDeleteModal(false);
        setSelectedProject(null);
        setDeleteConfirmText('');
    };

    const handleDuplicateProject = (project: Project) => {
        const now = new Date().toLocaleDateString();
        const duplicate: Project = {
            ...project,
            id: generateId(),
            title: `Copy of ${project.title}`,
            createdAt: now,
            updatedAt: now,
        };
        setProjects(prev => [duplicate, ...prev]);
        setActiveMenuId(null);
    };

    const openDeleteModal = (project: Project) => {
        setSelectedProject(project);
        setShowDeleteModal(true);
        setActiveMenuId(null);
    };

    const resetForm = () => {
        setNewTitle('');
        setNewDescription('');
        setNewProvider('AWS');
    };

    const toggleMenu = (e: React.MouseEvent, projectId: string) => {
        e.stopPropagation();
        setActiveMenuId(activeMenuId === projectId ? null : projectId);
    };

    const getProviderIcon = (provider: CloudProvider) => {
        return providers.find(p => p.value === provider)?.icon;
    };

    return (
        <div className="h-full flex flex-col bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
            {/* Header */}
            <div className="p-8 border-b border-slate-200 dark:border-white/10">
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Your Projects</h1>
                <p className="text-slate-500 dark:text-white/60 text-sm">Create, manage, and design your cloud architectures</p>
            </div>

            {/* Controls */}
            <div className="px-8 py-4 border-b border-slate-200 dark:border-white/10 flex items-center justify-between bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm">
                <div className="flex items-center gap-4">
                    {/* Search */}
                    <div className="relative">
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search projects..."
                            className="w-64 px-4 py-2 pl-10 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-lg text-slate-900 dark:text-white text-sm placeholder-slate-400 dark:placeholder-white/40 focus:outline-none focus:border-green-500/50 transition-colors"
                        />
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-white/40">🔍</span>
                    </div>

                    {/* View Toggle */}
                    <div className="flex items-center bg-slate-200 dark:bg-slate-900 border border-slate-300 dark:border-white/10 rounded-lg p-1">
                        <button
                            onClick={() => setViewMode('tile')}
                            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${viewMode === 'tile'
                                ? 'bg-green-600 text-white'
                                : 'text-slate-600 dark:text-white/60 hover:text-slate-900 dark:hover:text-white'
                                }`}
                        >
                            <span className="flex items-center gap-1.5">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                                </svg>
                                Tiles
                            </span>
                        </button>
                        <button
                            onClick={() => setViewMode('list')}
                            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${viewMode === 'list'
                                ? 'bg-green-600 text-white'
                                : 'text-slate-600 dark:text-white/60 hover:text-slate-900 dark:hover:text-white'
                                }`}
                        >
                            <span className="flex items-center gap-1.5">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                </svg>
                                List
                            </span>
                        </button>
                    </div>
                </div>

                {/* New Project Button */}
                <button
                    onClick={() => setShowNewProjectModal(true)}
                    className="px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white text-sm font-medium rounded-lg flex items-center gap-2 transition-all shadow-lg shadow-green-900/20 hover:shadow-green-900/40"
                >
                    <span className="text-lg">+</span>
                    New Project
                </button>
            </div>

            {/* Projects Grid/List */}
            <div className="flex-1 overflow-y-auto p-8">
                {viewMode === 'tile' ? (
                    // Tile View
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filteredProjects.map((project) => (
                            <div
                                key={project.id}
                                onClick={() => handleOpenProject(project)}
                                className="group relative bg-white dark:bg-gradient-to-br dark:from-slate-900 dark:to-slate-900/50 border border-slate-200 dark:border-white/10 rounded-xl p-6 hover:border-green-500/50 hover:shadow-lg hover:shadow-green-900/10 transition-all cursor-pointer"
                            >
                                {/* Three Dot Menu */}
                                <div className="absolute top-4 right-4">
                                    <button
                                        onClick={(e) => toggleMenu(e, project.id)}
                                        className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 dark:text-white/40 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition-all opacity-0 group-hover:opacity-100"
                                    >
                                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                            <circle cx="12" cy="6" r="1.5" />
                                            <circle cx="12" cy="12" r="1.5" />
                                            <circle cx="12" cy="18" r="1.5" />
                                        </svg>
                                    </button>

                                    {/* Dropdown Menu */}
                                    {activeMenuId === project.id && (
                                        <div className="absolute right-0 top-10 w-44 bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-lg shadow-xl overflow-hidden z-50">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleDuplicateProject(project);
                                                }}
                                                className="w-full px-4 py-2.5 text-left text-sm text-slate-600 dark:text-white/80 hover:bg-slate-50 dark:hover:bg-white/10 hover:text-slate-900 dark:hover:text-white transition-colors flex items-center gap-2"
                                            >
                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                                </svg>
                                                Duplicate
                                            </button>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    openDeleteModal(project);
                                                }}
                                                className="w-full px-4 py-2.5 text-left text-sm text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 hover:text-red-600 dark:hover:text-red-300 transition-colors flex items-center gap-2"
                                            >
                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                                Delete
                                            </button>
                                        </div>
                                    )}
                                </div>

                                {/* Provider Icon */}
                                <div className="flex justify-center mb-5">
                                    <div className="w-16 h-16 bg-gradient-to-br from-green-500/10 to-emerald-500/5 dark:from-green-600/20 dark:to-emerald-600/10 border border-green-500/20 rounded-xl flex items-center justify-center">
                                        <img
                                            src={getProviderIcon(project.provider)}
                                            alt={project.provider}
                                            className="w-10 h-10 object-contain"
                                        />
                                    </div>
                                </div>

                                {/* Project Info */}
                                <div className="space-y-2 text-center">
                                    <h3 className="text-slate-900 dark:text-white font-semibold text-lg truncate">{project.title}</h3>
                                    <p className="text-slate-500 dark:text-white/50 text-sm line-clamp-2 min-h-[2.5rem]">{project.description}</p>
                                    <div className="flex items-center justify-center gap-2 pt-2">
                                        <span className="px-2.5 py-1 bg-green-50 dark:bg-green-600/20 border border-green-200 dark:border-green-500/30 rounded-lg text-green-600 dark:text-green-400 text-xs font-medium">
                                            {project.provider}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    // List View
                    <div className="space-y-2">
                        {/* List Header */}
                        <div className="grid grid-cols-[1fr_2fr_120px_120px_50px] gap-4 px-4 py-2 text-xs text-slate-500 dark:text-white/40 font-medium uppercase tracking-wide">
                            <span>Name</span>
                            <span>Description</span>
                            <span>Provider</span>
                            <span>Updated</span>
                            <span></span>
                        </div>

                        {filteredProjects.map((project) => (
                            <div
                                key={project.id}
                                onClick={() => handleOpenProject(project)}
                                className="group grid grid-cols-[1fr_2fr_120px_120px_50px] gap-4 items-center px-4 py-3 bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-white/5 rounded-lg hover:border-green-500/30 hover:bg-slate-50 dark:hover:bg-slate-900 transition-all cursor-pointer shadow-sm dark:shadow-none"
                            >
                                <span className="text-slate-900 dark:text-white font-medium truncate">{project.title}</span>
                                <span className="text-slate-500 dark:text-white/50 text-sm truncate">{project.description}</span>
                                <div className="flex items-center gap-2">
                                    <img
                                        src={getProviderIcon(project.provider)}
                                        alt={project.provider}
                                        className="w-5 h-5 object-contain"
                                    />
                                    <span className="text-slate-600 dark:text-white/60 text-sm">{project.provider}</span>
                                </div>
                                <span className="text-slate-500 dark:text-white/40 text-sm">{project.updatedAt}</span>

                                {/* Three Dot Menu */}
                                <div className="relative flex justify-end">
                                    <button
                                        onClick={(e) => toggleMenu(e, project.id)}
                                        className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 dark:text-white/40 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition-all opacity-0 group-hover:opacity-100"
                                    >
                                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                            <circle cx="12" cy="6" r="1.5" />
                                            <circle cx="12" cy="12" r="1.5" />
                                            <circle cx="12" cy="18" r="1.5" />
                                        </svg>
                                    </button>

                                    {activeMenuId === project.id && (
                                        <div className="absolute right-0 top-10 w-44 bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-lg shadow-xl overflow-hidden z-50">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleDuplicateProject(project);
                                                }}
                                                className="w-full px-4 py-2.5 text-left text-sm text-slate-600 dark:text-white/80 hover:bg-slate-50 dark:hover:bg-white/10 hover:text-slate-900 dark:hover:text-white transition-colors flex items-center gap-2"
                                            >
                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                                </svg>
                                                Duplicate
                                            </button>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    openDeleteModal(project);
                                                }}
                                                className="w-full px-4 py-2.5 text-left text-sm text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 hover:text-red-600 dark:hover:text-red-300 transition-colors flex items-center gap-2"
                                            >
                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                                Delete
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Empty State */}
                {filteredProjects.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-64 text-slate-400 dark:text-white/40">
                        <div className="w-20 h-20 mb-4 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-white/10 flex items-center justify-center">
                            <span className="text-4xl">📁</span>
                        </div>
                        <p className="text-lg font-medium text-slate-500 dark:text-white/60">No projects found</p>
                        <p className="text-sm mt-1">
                            {searchQuery ? 'Try adjusting your search' : 'Click "+ New Project" to get started'}
                        </p>
                    </div>
                )}
            </div>

            {/* New Project Modal */}
            {showNewProjectModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl w-full max-w-md p-6 shadow-2xl animate-scale-in transition-colors">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Create New Project</h2>
                            <button
                                onClick={() => {
                                    setShowNewProjectModal(false);
                                    resetForm();
                                }}
                                className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-500 dark:text-white/40 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition-all"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="space-y-4">
                            {/* Project Title */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-white/70 mb-2">
                                    Project Title <span className="text-red-500 dark:text-red-400">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={newTitle}
                                    onChange={(e) => setNewTitle(e.target.value)}
                                    placeholder="My Cloud Architecture"
                                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-white/30 focus:outline-none focus:border-green-500/50 transition-colors"
                                />
                            </div>

                            {/* Project Description */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-white/70 mb-2">
                                    Description
                                </label>
                                <textarea
                                    value={newDescription}
                                    onChange={(e) => setNewDescription(e.target.value)}
                                    placeholder="A brief description of your project..."
                                    rows={3}
                                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-white/30 focus:outline-none focus:border-green-500/50 transition-colors resize-none"
                                />
                            </div>

                            {/* Cloud Provider */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-white/70 mb-2">
                                    Cloud Provider
                                </label>
                                <div className="grid grid-cols-3 gap-3">
                                    {providers.map((provider) => (
                                        <button
                                            key={provider.value}
                                            onClick={() => setNewProvider(provider.value)}
                                            className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${newProvider === provider.value
                                                ? 'border-green-500 bg-green-50 dark:bg-green-500/10'
                                                : 'border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-800 hover:border-slate-300 dark:hover:border-white/20'
                                                }`}
                                        >
                                            <img src={provider.icon} alt={provider.label} className="w-8 h-8 object-contain" />
                                            <span className={`text-xs font-medium ${newProvider === provider.value ? 'text-green-600 dark:text-green-400' : 'text-slate-500 dark:text-white/60'}`}>
                                                {provider.value}
                                            </span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={() => {
                                    setShowNewProjectModal(false);
                                    resetForm();
                                }}
                                className="flex-1 px-4 py-3 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-white/70 rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 transition-all font-medium"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleCreateProject}
                                disabled={!newTitle.trim()}
                                className={`flex-1 px-4 py-3 rounded-xl font-medium transition-all ${newTitle.trim()
                                    ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:from-green-500 hover:to-emerald-500 shadow-lg shadow-green-900/30'
                                    : 'bg-slate-100 dark:bg-white/10 text-slate-400 dark:text-white/30 cursor-not-allowed'
                                    }`}
                            >
                                Create Project
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {showDeleteModal && selectedProject && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl w-full max-w-md p-6 shadow-2xl animate-scale-in transition-colors">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Delete Project</h2>
                            <button
                                onClick={() => {
                                    setShowDeleteModal(false);
                                    setSelectedProject(null);
                                    setDeleteConfirmText('');
                                }}
                                className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-500 dark:text-white/40 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition-all"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="mb-6">
                            <div className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-xl mb-4">
                                <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-500/20 flex items-center justify-center shrink-0">
                                    <svg className="w-5 h-5 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                    </svg>
                                </div>
                                <p className="text-sm text-slate-600 dark:text-white/80">
                                    This action cannot be undone. This will permanently delete <strong className="text-slate-900 dark:text-white">{selectedProject.title}</strong>.
                                </p>
                            </div>

                            <label className="block text-sm font-medium text-slate-700 dark:text-white/70 mb-2">
                                Type <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-red-600 dark:text-red-400">delete {selectedProject.title}</code> to confirm
                            </label>
                            <input
                                type="text"
                                value={deleteConfirmText}
                                onChange={(e) => setDeleteConfirmText(e.target.value)}
                                onPaste={(e) => e.preventDefault()}
                                placeholder={`delete ${selectedProject.title}`}
                                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-white/20 focus:outline-none focus:border-red-500/50 transition-colors font-mono"
                            />
                        </div>

                        {/* Actions */}
                        <div className="flex gap-3">
                            <button
                                onClick={() => {
                                    setShowDeleteModal(false);
                                    setSelectedProject(null);
                                    setDeleteConfirmText('');
                                }}
                                className="flex-1 px-4 py-3 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-white/70 rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 transition-all font-medium"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDeleteProject}
                                disabled={deleteConfirmText !== `delete ${selectedProject.title}`}
                                className={`flex-1 px-4 py-3 rounded-xl font-medium transition-all ${deleteConfirmText === `delete ${selectedProject.title}`
                                    ? 'bg-red-600 text-white hover:bg-red-500 shadow-lg shadow-red-900/30'
                                    : 'bg-slate-100 dark:bg-white/10 text-slate-400 dark:text-white/30 cursor-not-allowed'
                                    }`}
                            >
                                Delete Project
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
