import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import customFetch from '../services/customFetch';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import TaskCard from '../components/TaskCard';
import TaskModal from '../components/TaskModal';

const ProjectDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [project, setProject] = useState(null);
    const [tasks, setTasks] = useState([]);
    const [projectsCount, setProjectsCount] = useState([]); // For sidebar context
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);
    const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    // Pagination & Search
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [search, setSearch] = useState('');

    useEffect(() => {
        const userData = JSON.parse(localStorage.getItem('user'));
        setUser(userData);
        fetchProjects(); // For sidebar
    }, []);

    useEffect(() => {
        fetchProjectData();
    }, [id, page, search]);

    const fetchProjects = async () => {
        try {
            const response = await customFetch.get('/projects?limit=100');
            setProjectsCount(response.data.projects);
        } catch (err) {
            console.error('Error fetching sidebar projects', err);
        }
    };

    const fetchProjectData = async () => {
        setLoading(true);
        try {
            const [projRes, tasksRes] = await Promise.all([
                customFetch.get(`/projects/${id}`),
                customFetch.get(`/tasks/project/${id}?page=${page}&limit=10&search=${search}`)
            ]);
            setProject(projRes.data);
            setTasks(tasksRes.data.tasks || []);
            setTotalPages(tasksRes.data.pages || 1);
        } catch (err) {
            toast.error('Failed to load project details');
            setTasks([]);
            navigate('/');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateTask = async (taskData) => {
        try {
            await customFetch.post('/tasks', { ...taskData, project: id });
            toast.success('Task created');
            fetchProjectData();
            fetchProjects();
        } catch (err) {
            toast.error(err.response?.data?.fields?.generic || err.response?.data?.error || 'Failed to create task');
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
            if (updateData.status) toast.info(`Task set to ${updateData.status.replace('_', ' ')}`);
            // Trigger background refresh to ensure sync
            fetchProjectData();
        } catch (err) {
            // Rollback on error
            setTasks(previousTasks);
            toast.error('Failed to update task. Changes reverted.');
        }
    };

    const handleDeleteTask = async (taskId) => {
        if (window.confirm('Delete this task?')) {
            const previousTasks = [...tasks];
            setTasks(tasks.filter(t => t._id !== taskId));
            
            try {
                await customFetch.delete(`/tasks/${taskId}`);
                toast.success('Task removed');
                fetchProjects(); // Refresh counts
            } catch (err) {
                setTasks(previousTasks);
                toast.error(err.response?.data?.error || 'Failed to delete task');
            }
        }
    };

    if (loading && !project) {
        return <div className="min-h-screen bg-app flex items-center justify-center text-main">Loading...</div>;
    }

    return (
        <div className="min-h-screen bg-app text-main">
            <Navbar user={user} onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
            
            <div className="flex">
                <Sidebar 
                    projects={projectsCount} 
                    onCreateProject={() => navigate('/')} 
                    isOpen={isSidebarOpen}
                    onClose={() => setIsSidebarOpen(false)}
                    user={user}
                />
                
                <main className="flex-1 p-4 md:p-8 w-full max-w-7xl mx-auto">
                    <header className="mb-12">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                            <div className="flex-1">
                                <div className="flex items-center space-x-3 mb-2 text-primary-500">
                                    <svg className="w-5 h-5 cursor-pointer hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24" onClick={() => navigate('/')}>
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                    </svg>
                                    <span className="text-sm font-black uppercase tracking-widest">Project Details</span>
                                </div>
                                <h2 className="text-3xl md:text-4xl font-black mb-3 tracking-tight">{project?.name}</h2>
                                <p className="text-muted max-w-2xl font-medium leading-relaxed">{project?.description}</p>
                            </div>
                            <button 
                                onClick={() => setIsTaskModalOpen(true)}
                                className="w-full md:w-auto px-8 py-4 rounded-2xl premium-gradient text-white font-black shadow-xl shadow-primary-500/30 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center space-x-3 border border-white/10"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                                </svg>
                                <span>Create Task</span>
                            </button>
                        </div>
                    </header>

                    {/* Task Filtering & Search */}
                    <div className="mb-8 flex flex-col md:flex-row gap-4 items-center justify-between">
                        <div className="relative w-full md:w-96 group">
                            <input 
                                type="text"
                                placeholder="Search tasks..."
                                value={search}
                                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                                className="w-full bg-sidebar border border-border-glass rounded-2xl px-5 py-4 text-main outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 transition-all pl-12 shadow-sm font-semibold"
                            />
                            <svg className="w-5 h-5 absolute left-4 top-4.5 text-muted transition-colors group-focus-within:text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                        <div className="text-muted text-[10px] font-black uppercase tracking-[0.2em] bg-slate-100 dark:bg-white/5 px-4 py-2 rounded-full border border-border-glass">
                            {tasks.length} {tasks.length === 1 ? 'Task' : 'Tasks'} Found
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {tasks?.map(task => (
                            <TaskCard 
                                key={task._id} 
                                task={task} 
                                onUpdate={handleUpdateTask}
                                onDelete={handleDeleteTask}
                                currentUser={user}
                            />
                        ))}
                        {(!tasks || tasks.length === 0) && (
                            <div className="col-span-full py-24 text-center glass rounded-[2.5rem] border-dashed border-2 border-border-glass">
                                <div className="w-20 h-20 bg-primary-500/5 rounded-full flex items-center justify-center mx-auto mb-6 text-primary-500">
                                    <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                    </svg>
                                </div>
                                <h3 className="text-2xl font-black mb-3 text-main">No Tasks Match</h3>
                                <p className="text-muted max-w-sm mx-auto font-medium">Try adjusting your search or create your inaugural task for this project.</p>
                            </div>
                        )}
                    </div>

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
                </main>
            </div>

            <TaskModal 
                isOpen={isTaskModalOpen} 
                onClose={() => setIsTaskModalOpen(false)} 
                onSubmit={handleCreateTask}
                projectId={id}
            />
        </div>
    );
};

export default ProjectDetail;
