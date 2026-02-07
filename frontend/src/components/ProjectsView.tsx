import { useState } from 'react';
import { AWSLogo, GCPLogo, AzureLogo } from './CloudLogos';

interface Project {
    id: string;
    title: string;
    description: string;
    provider: 'AWS' | 'GCP' | 'Azure';
    components: number;
    messages: number;
    updatedAt: string;
    status: 'active' | 'archived';
}

const mockProjects: Project[] = [
    {
        id: '1',
        title: 'Untitled Project',
        description: 'A new circuit project',
        provider: 'AWS',
        components: 0,
        messages: 1,
        updatedAt: '2/6/2026',
        status: 'active',
    },
];

export const ProjectsView = () => {
    const [searchQuery, setSearchQuery] = useState('');

    const filteredProjects = mockProjects.filter(project =>
        project.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="h-screen flex flex-col bg-slate-950">
            {/* Header */}
            <div className="p-8 border-b border-white/10">
                <h1 className="text-3xl font-bold text-white mb-2">Your Projects</h1>
                <p className="text-white/60 text-sm">Create, manage, and share your circuit designs</p>
            </div>

            {/* Controls */}
            <div className="px-8 py-4 border-b border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    {/* Search */}
                    <div className="relative">
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search projects..."
                            className="w-64 px-4 py-2 pl-10 bg-slate-900 border border-white/10 rounded-lg text-white text-sm placeholder-white/40 focus:outline-none focus:border-green-500/50"
                        />
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40">🔍</span>
                    </div>
                </div>

                {/* New Project Button */}
                <button className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg flex items-center gap-2 transition-all">
                    <span className="text-lg">+</span>
                    New Project
                </button>
            </div>

            {/* Projects Grid */}
            <div className="flex-1 overflow-y-auto p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredProjects.map((project) => (
                        <div
                            key={project.id}
                            className="group relative bg-slate-900 border-2 border-green-500/30 rounded-xl p-6 hover:border-green-500 transition-all cursor-pointer"
                        >
                            {/* Icon */}
                            <div className="flex justify-center mb-6">
                                <div className="w-16 h-16 bg-green-600/20 border-2 border-green-500/30 rounded-lg flex items-center justify-center">
                                    <span className="text-3xl">⚡</span>
                                </div>
                            </div>

                            {/* Project Info */}
                            <div className="space-y-2 text-center">
                                <h3 className="text-white font-semibold text-lg">{project.title}</h3>
                                <p className="text-white/60 text-sm">{project.description}</p>
                                <div className="flex items-center justify-center gap-2 pt-2">
                                    <span className="px-2 py-1.5 bg-blue-600/20 border border-blue-500/30 rounded text-blue-400 text-xs font-medium flex items-center gap-1.5">
                                        {project.provider === 'AWS' && <><AWSLogo className="w-3.5 h-3.5" /> AWS</>}
                                        {project.provider === 'GCP' && <><GCPLogo className="w-3.5 h-3.5" /> GCP</>}
                                        {project.provider === 'Azure' && <><AzureLogo className="w-3.5 h-3.5" /> Azure</>}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Empty State */}
                {filteredProjects.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-64 text-white/40">
                        <span className="text-6xl mb-4">📁</span>
                        <p className="text-lg">No projects found</p>
                        <p className="text-sm">Try adjusting your search or create a new project</p>
                    </div>
                )}
            </div>
        </div>
    );
};
