import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import customFetch from '../services/customFetch';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import TaskCard from '../components/TaskCard';

const MyTasks = () => {
    const [tasks, setTasks] = useState([]);
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    // Pagination & Filter State
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [search, setSearch] = useState('');
    const [status, setStatus] = useState('');

    useEffect(() => {
        const userData = JSON.parse(localStorage.getItem('user'));
        setUser(userData);
        fetchProjects();
    }, []);

    useEffect(() => {
        fetchMyTasks();
    }, [page, search, status]);

    const fetchMyTasks = async () => {
        setLoading(true);
        try {
            const params = `page=${page}&limit=10&search=${search}&status=${status}`;
            const response = await customFetch.get(`/tasks/my-tasks?${params}`);
            setTasks(response.data.tasks || []);
            setTotalPages(response.data.pages || 1);
        } catch (err) {
            console.error('Error fetching my tasks', err);
            setTasks([]);
            toast.error('Failed to load your tasks');
        } finally {
            setLoading(false);
        }
    };

    const fetchProjects = async () => {
        try {
            const response = await customFetch.get('/projects?limit=100');
            setProjects(response.data.projects);
        } catch (err) {
            console.error('Error fetching projects', err);
        }
    };

    const handleUpdateTask = async (taskId, updateData) => {
        // Optimistic UI for status updates
        const previousTasks = [...tasks];
        
        if (updateData.status) {
            setTasks(tasks.map(t => t._id === taskId ? { ...t, status: updateData.status } : t));
        }

        try {
            await customFetch.put(`/tasks/${taskId}`, updateData);
            if (updateData.status) toast.info(`Status updated`);
            // Trigger background refresh to ensure sync
            fetchMyTasks();
        } catch (err) {
            // Rollback on error
            setTasks(previousTasks);
            toast.error('Failed to update task. Changes reverted.');
        }
    };

    const handleDeleteTask = async (taskId) => {
        if (window.confirm('Are you sure you want to delete this task? (Only owners or creators can delete)')) {
            const previousTasks = [...tasks];
            setTasks(tasks.filter(t => t._id !== taskId));

            try {
                await customFetch.delete(`/tasks/${taskId}`);
                toast.success('Task deleted');
                fetchProjects(); // Refresh counts
            } catch (err) {
                setTasks(previousTasks);
                toast.error(err.response?.data?.error || 'Failed to delete task');
            }
        }
    };

    // Group tasks by project
    const groupedTasks = tasks.reduce((acc, task) => {
        const projectName = task.project?.name || 'Unknown Project';
        if (!acc[projectName]) acc[projectName] = [];
        acc[projectName].push(task);
        return acc;
    }, {});

    return (
        <div className="min-h-screen bg-app text-main overflow-x-hidden">
            <Navbar user={user} onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
            <div className="flex">
                <Sidebar 
                    projects={projects} 
                    onCreateProject={() => {}} 
                    isOpen={isSidebarOpen}
                    onClose={() => setIsSidebarOpen(false)}
                    user={user}
                />
                
                <main className="flex-1 p-4 md:p-8 w-full max-w-7xl mx-auto">
                    <header className="mb-10">
                        <h2 className="text-3xl md:text-4xl font-black mb-3 tracking-tight">My Assigned Tasks</h2>
                        <p className="text-muted font-medium">Core responsibilities from all your active projects.</p>
                    </header>

                    {/* Filter Bar */}
                    <div className="flex flex-col md:flex-row gap-6 mb-10 items-center justify-between">
                        <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
                            <div className="relative group w-full md:w-80">
                                <input 
                                    type="text"
                                    placeholder="Search tasks..."
                                    value={search}
                                    onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                                    className="w-full bg-sidebar border border-border-glass rounded-2xl px-5 py-4 text-main font-semibold outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 transition-all pl-12 shadow-sm"
                                />
                                <svg className="w-5 h-5 absolute left-4 top-4.5 text-muted transition-colors group-focus-within:text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>
                            <div className="relative">
                                <select 
                                    value={status}
                                    onChange={(e) => { setStatus(e.target.value); setPage(1); }}
                                    className="w-full md:w-48 bg-sidebar border border-border-glass rounded-2xl px-5 py-4 text-main font-black uppercase tracking-widest text-[11px] outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 transition-all cursor-pointer appearance-none pr-10 shadow-sm"
                                >
                                    <option className="bg-sidebar text-main" value="">ALL STATUSES</option>
                                    <option className="bg-sidebar text-main" value="todo">TO DO</option>
                                    <option className="bg-sidebar text-main" value="in_progress">IN PROGRESS</option>
                                    <option className="bg-sidebar text-main" value="done">DONE</option>
                                </select>
                                <svg className="w-4 h-4 absolute right-5 top-5 text-muted pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    {loading && tasks.length === 0 ? (
                        <div className="animate-pulse space-y-12">
                            {[1].map(i => (
                                <div key={i} className="space-y-6">
                                    <div className="h-4 w-48 bg-slate-200 dark:bg-white/5 rounded-full"></div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        <div className="h-64 bg-slate-100 dark:bg-white/5 rounded-[2.5rem]"></div>
                                        <div className="h-64 bg-slate-100 dark:bg-white/5 rounded-[2.5rem]"></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="space-y-16">
                            {Object.entries(groupedTasks).map(([projectName, projectTasks]) => (
                                <section key={projectName}>
                                    <h3 className="text-muted uppercase text-[10px] font-black tracking-[0.2em] mb-8 flex items-center space-x-3 ml-2">
                                        <div className="w-2 h-2 rounded-full bg-primary-500 shadow-[0_0_10px_rgba(59,130,246,0.6)]"></div>
                                        <span>{projectName}</span>
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {projectTasks?.map(task => (
                                            <TaskCard 
                                                key={task._id} 
                                                task={task} 
                                                onUpdate={handleUpdateTask}
                                                onDelete={handleDeleteTask}
                                                currentUser={user}
                                            />
                                        ))}
                                    </div>
                                </section>
                            ))}
                            {(!tasks || tasks.length === 0) && (
                                <div className="py-32 text-center glass rounded-[3rem] border-dashed border-2 border-border-glass shadow-premium">
                                    <div className="w-20 h-20 bg-primary-500/5 rounded-full flex items-center justify-center mx-auto mb-8 text-primary-500">
                                        <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                        </svg>
                                    </div>
                                    <h3 className="text-2xl font-black mb-3 text-main">No Tasks Match Filtering</h3>
                                    <p className="text-muted max-w-sm mx-auto font-medium">You don't have any tasks matching your current search or filters.</p>
                                </div>
                            )}

                            {/* Pagination */}
                            {totalPages > 1 && (
                                <div className="flex justify-center items-center space-x-8 mt-16 pb-12">
                                    <button 
                                        onClick={() => setPage(p => Math.max(1, p - 1))}
                                        disabled={page === 1}
                                        className="p-4 rounded-[1.5rem] glass border border-border-glass text-main disabled:opacity-30 hover:bg-primary-500/5 transition-all shadow-premium"
                                    >
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                                        </svg>
                                    </button>
                                    <div className="flex flex-col items-center">
                                        <span className="text-[10px] text-muted font-black uppercase tracking-[0.2em] mb-1">Page</span>
                                        <span className="text-2xl font-black text-main">{page} <span className="text-slate-300 dark:text-slate-700">/</span> {totalPages}</span>
                                    </div>
                                    <button 
                                        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                        disabled={page === totalPages}
                                        className="p-4 rounded-[1.5rem] glass border border-border-glass text-main disabled:opacity-30 hover:bg-primary-500/5 transition-all shadow-premium"
                                    >
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                                        </svg>
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
};

export default MyTasks;
