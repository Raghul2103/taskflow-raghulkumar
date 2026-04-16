import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import customFetch from '../services/customFetch';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import ProjectCard from '../components/ProjectCard';

const Dashboard = () => {
    const [projects, setProjects] = useState([]);
    const [sidebarProjects, setSidebarProjects] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [newProject, setNewProject] = useState({ name: '', description: '', deadline: '' });

    // Pagination & Filter State
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [search, setSearch] = useState('');

    useEffect(() => {
        const userData = JSON.parse(localStorage.getItem('user'));
        setUser(userData);
        fetchStats();
        fetchSidebarProjects();
    }, []);

    useEffect(() => {
        fetchProjects();
    }, [page, search]);

    const fetchSidebarProjects = async () => {
        try {
            const response = await customFetch.get('/projects?limit=100');
            setSidebarProjects(response.data.projects);
        } catch (err) {
            console.error('Error fetching sidebar projects', err);
        }
    };

    const fetchStats = async () => {
        try {
            const response = await customFetch.get('/projects/stats');
            setStats(response.data);
        } catch (err) {
            console.error('Error fetching stats', err);
        }
    };

    const fetchProjects = async () => {
        setLoading(true);
        try {
            const params = `page=${page}&limit=6&search=${search}`;
            const response = await customFetch.get(`/projects?${params}`);
            setProjects(response.data.projects);
            setTotalPages(response.data.pages);
        } catch (err) {
            console.error('Error fetching projects', err);
            setProjects([]); // Ensure it's never undefined
        } finally {
            setLoading(false);
        }
    };

    const handleCreateProject = async (e) => {
        e.preventDefault();
        if (!newProject.name.trim() || !newProject.description.trim()) {
            return toast.error('Project name and description are required');
        }

        try {
            await customFetch.post('/projects', newProject);
            toast.success('Project created successfully!');
            setIsCreateModalOpen(false);
            setNewProject({ name: '', description: '', deadline: '' });
            fetchProjects();
            fetchSidebarProjects();
            fetchStats();
        } catch (err) {
            toast.error('Failed to create project');
        }
    };

    const handleDeleteProject = async (id) => {
        if (window.confirm('Delete this project? All tasks will be lost.')) {
            try {
                await customFetch.delete(`/projects/${id}`);
                toast.success('Project deleted');
                fetchProjects();
                fetchSidebarProjects();
                fetchStats();
            } catch (err) {
                toast.error('Failed to delete project');
            }
        }
    };

    return (
        <div className="min-h-screen bg-app text-main overflow-x-hidden">
            <Navbar user={user} onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
            
            <div className="flex">
                <Sidebar 
                    projects={sidebarProjects} 
                    onCreateProject={() => setIsCreateModalOpen(true)} 
                    isOpen={isSidebarOpen}
                    onClose={() => setIsSidebarOpen(false)}
                    user={user}
                />
                
                <main className="flex-1 p-4 md:p-8 w-full max-w-7xl mx-auto">
                    {/* Hero Stats Section */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-12">
                        <div className="glass p-6 rounded-3xl border-l-4 border-blue-500 relative group overflow-hidden shadow-sm hover:shadow-md transition-all duration-300">

                            <h3 className="text-blue-600 dark:text-blue-400 text-xs font-black uppercase tracking-widest mb-2">Projects</h3>
                            <p className="text-3xl md:text-4xl font-bold font-sans">{stats?.totalProjects || 0}</p>
                            <div className="mt-4 h-1 w-full bg-white/10 rounded-full overflow-hidden">
                                <div 
                                    className="h-full bg-blue-500 transition-all duration-1000" 
                                    style={{ width: stats?.totalProjects > 0 ? '100%' : '0%' }}
                                ></div>
                            </div>
                        </div>

                        <div className="glass p-6 rounded-3xl border-l-4 border-indigo-500 relative group overflow-hidden shadow-sm hover:shadow-md transition-all duration-300">
                            <h3 className="text-indigo-600 dark:text-indigo-400 text-xs font-black uppercase tracking-widest mb-2">Total Tasks</h3>
                            <p className="text-3xl md:text-4xl font-bold font-sans">{stats?.totalTasks || 0}</p>
                            <div className="mt-4 h-1 w-full bg-white/10 rounded-full overflow-hidden">
                                <div 
                                    className="h-full bg-indigo-500 transition-all duration-1000" 
                                    style={{ width: stats?.totalTasks > 0 ? '100%' : '0%' }}
                                ></div>
                            </div>
                        </div>

                        <div className="glass p-6 rounded-3xl border-l-4 border-green-500 relative group overflow-hidden shadow-sm hover:shadow-md transition-all duration-300">
                            <h3 className="text-green-600 dark:text-green-400 text-xs font-black uppercase tracking-widest mb-2">Completed</h3>
                            <p className="text-3xl md:text-4xl font-bold font-sans text-green-500">{stats?.completedTasks || 0}</p>
                            <div className="mt-4 h-1 w-full bg-white/10 rounded-full overflow-hidden">
                                <div className="h-full bg-green-500 transition-all duration-1000" style={{ width: stats?.totalTasks > 0 ? `${(stats.completedTasks/stats.totalTasks)*100}%` : '0%' }}></div>
                            </div>
                        </div>

                        <div className="glass p-6 rounded-3xl border-l-4 border-amber-500 relative group overflow-hidden shadow-sm hover:shadow-md transition-all duration-300">
                            <h3 className="text-amber-600 dark:text-amber-400 text-xs font-black uppercase tracking-widest mb-2">Pending</h3>
                            <p className="text-3xl md:text-4xl font-bold font-sans text-amber-500">{stats?.pendingTasks || 0}</p>
                            <div className="mt-4 h-1 w-full bg-white/10 rounded-full overflow-hidden">
                                <div className="h-full bg-amber-500 transition-all duration-1000" style={{ width: stats?.totalTasks > 0 ? `${(stats.pendingTasks/stats.totalTasks)*100}%` : '0%' }}></div>
                            </div>
                        </div>
                    </div>

                    <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 space-y-4 md:space-y-0">
                        <div>
                            <h2 className="text-2xl md:text-3xl font-black mb-2 tracking-tight">My Projects</h2>
                            <div className="flex items-center space-x-4">
                                <p className="text-muted text-sm md:text-base">Click on a project to view tasks</p>
                                <div className="relative group">
                                    <input 
                                        type="text"
                                        placeholder="Search projects..."
                                        value={search}
                                        onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                                        className="bg-white/5 border border-border-glass rounded-xl px-4 py-1.5 text-sm text-main outline-none focus:border-primary-500 transition-all w-40 md:w-64"
                                    />
                                    <svg className="w-4 h-4 absolute right-3 top-2.5 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                </div>
                            </div>
                        </div>
                        <button 
                            onClick={() => setIsCreateModalOpen(true)}
                            className="w-full md:w-auto px-6 py-3 rounded-xl premium-gradient text-white font-bold shadow-lg shadow-primary-500/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center space-x-2 border border-white/10"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                            </svg>
                            <span>New Project</span>
                        </button>
                    </header>

                    {loading ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="glass h-64 rounded-3xl animate-pulse"></div>
                            ))}
                        </div>
                    ) : (
                        <>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {projects?.map(project => (
                                    <ProjectCard 
                                        key={project._id} 
                                        project={project} 
                                        onDelete={handleDeleteProject}
                                    />
                                ))}
                                {(!projects || projects.length === 0) && (
                                    <div className="col-span-full py-20 text-center glass rounded-3xl border-dashed border-2 border-border-glass">
                                        <h3 className="text-xl font-bold mb-2 text-muted">No Projects Found</h3>
                                        <button 
                                            onClick={() => setIsCreateModalOpen(true)}
                                            className="text-primary-500 font-bold hover:underline mt-4"
                                        >
                                            Create your first project
                                        </button>
                                    </div>
                                )}
                            </div>
                            
                            {/* Pagination Controls */}
                            {totalPages > 1 && (
                                <div className="flex justify-center items-center space-x-4 mt-12 pb-10">
                                    <button 
                                        onClick={() => setPage(p => Math.max(1, p - 1))}
                                        disabled={page === 1}
                                        className="p-3 rounded-2xl glass border border-border-glass text-main disabled:opacity-20 hover:bg-white/5 transition-all"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                                        </svg>
                                    </button>
                                    <span className="text-sm font-bold text-muted">Page {page} of {totalPages}</span>
                                    <button 
                                        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                        disabled={page === totalPages}
                                        className="p-3 rounded-2xl glass border border-border-glass text-main disabled:opacity-20 hover:bg-white/5 transition-all"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                                        </svg>
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </main>
            </div>

            {/* Create Project Modal */}
            {isCreateModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="glass w-full max-w-lg rounded-3xl p-8 shadow-2xl relative border-white/10 animate-in fade-in zoom-in duration-300">
                        <button 
                            onClick={() => setIsCreateModalOpen(false)}
                            className="absolute top-6 right-6 text-muted hover:text-main"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>

                        <h2 className="text-2xl font-black text-main mb-6 tracking-tight">Create New Project</h2>

                        <form onSubmit={handleCreateProject} className="space-y-6">
                            <div>
                                <label className="block text-muted text-xs font-black uppercase tracking-widest mb-2 ml-1">Project Name</label>
                                <input
                                    type="text"
                                    value={newProject.name}
                                    onChange={(e) => setNewProject({...newProject, name: e.target.value})}
                                    className="w-full bg-sidebar border border-border-glass rounded-xl px-4 py-3 text-main outline-none focus:border-primary-500 transition-colors"
                                    placeholder="e.g. Website Redesign"
                                />
                            </div>

                            <div>
                                <label className="block text-muted text-xs font-black uppercase tracking-widest mb-2 ml-1">Description</label>
                                <textarea
                                    value={newProject.description}
                                    onChange={(e) => setNewProject({...newProject, description: e.target.value})}
                                    rows="3"
                                    className="w-full bg-sidebar border border-border-glass rounded-xl px-4 py-3 text-main outline-none focus:border-primary-500 transition-colors"
                                    placeholder="Brief details about the project..."
                                ></textarea>
                            </div>

                            <div>
                                <label className="block text-muted text-xs font-black uppercase tracking-widest mb-2 ml-1">Deadline (Optional)</label>
                                <input
                                    type="date"
                                    value={newProject.deadline}
                                    onChange={(e) => setNewProject({...newProject, deadline: e.target.value})}
                                    className="w-full bg-sidebar border border-border-glass rounded-xl px-4 py-3 text-main outline-none focus:border-primary-500 transition-colors"
                                />
                            </div>

                            <button
                                type="submit"
                                className="w-full py-4 rounded-xl premium-gradient text-white font-bold shadow-lg shadow-primary-500/20 hover:scale-[1.01] active:scale-95 transition-all border border-white/10"
                            >
                                Create Project
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Dashboard;
