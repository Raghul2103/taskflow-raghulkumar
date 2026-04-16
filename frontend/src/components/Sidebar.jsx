import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Sidebar = ({ projects, onCreateProject, isOpen, onClose, user }) => {
    const location = useLocation();

    const sidebarContent = (
        <div className="flex flex-col h-full bg-sidebar">
            <div className="flex-1 space-y-8 overflow-y-auto">
            <div>
                <h3 className="text-muted uppercase text-[10px] font-black tracking-[0.2em] mb-6 px-4">Menu</h3>
                <ul className="space-y-1">
                    <li>
                        <Link 
                            to="/" 
                            onClick={onClose}
                            className={`flex items-center space-x-3 px-4 py-3.5 rounded-2xl transition-all duration-300 group ${
                                location.pathname === '/' 
                                ? 'premium-gradient text-white shadow-lg shadow-primary-500/20' 
                                : 'text-muted hover:bg-primary-500/5 dark:hover:bg-white/5 hover:text-primary-600 dark:hover:text-main'
                            }`}
                        >
                            <svg className="w-5 h-5 transition-transform group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                            </svg>
                            <span className="font-bold tracking-tight">Dashboard</span>
                        </Link>
                    </li>
                    <li>
                        <Link 
                            to="/my-tasks" 
                            onClick={onClose}
                            className={`flex items-center space-x-3 px-4 py-3.5 rounded-2xl transition-all duration-300 group ${
                                location.pathname === '/my-tasks' 
                                ? 'premium-gradient text-white shadow-lg shadow-primary-500/20' 
                                : 'text-muted hover:bg-primary-500/5 dark:hover:bg-white/5 hover:text-primary-600 dark:hover:text-main'
                            }`}
                        >
                            <svg className="w-5 h-5 transition-transform group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                            </svg>
                            <span className="font-bold tracking-tight">My Tasks</span>
                        </Link>
                    </li>
                </ul>
            </div>

            <div>
                <div className="flex justify-between items-center mb-6 px-4">
                    <h3 className="text-muted uppercase text-[10px] font-black tracking-[0.2em]">Projects</h3>
                    <button 
                        onClick={onCreateProject}
                        className="p-1.5 hover:bg-primary-500/10 rounded-lg text-primary-500 transition-all hover:scale-110"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                        </svg>
                    </button>
                </div>
                <ul className="space-y-1">
                    {projects?.map((project) => (
                        <li key={project._id}>
                            <Link 
                                to={`/project/${project._id}`}
                                onClick={onClose}
                                className={`flex items-center space-x-3 px-4 py-3.5 rounded-2xl transition-all duration-300 group ${
                                    location.pathname === `/project/${project._id}`
                                    ? 'bg-primary-500/10 text-primary-600 dark:text-primary-400 border border-primary-500/20'
                                    : 'text-muted hover:bg-primary-500/5 dark:hover:bg-white/5 hover:text-primary-600 dark:hover:text-main'
                                }`}
                            >
                                <div className={`w-2 h-2 rounded-full flex-shrink-0 transition-transform group-hover:scale-125 ${location.pathname === `/project/${project._id}` ? 'bg-primary-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]' : 'bg-slate-400 dark:bg-gray-600'}`}></div>
                                <div className="flex flex-col flex-1 truncate">
                                    <span className="truncate font-bold tracking-tight">{project.name}</span>
                                </div>
                                {project.taskCount > 0 && (
                                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-black ${
                                        location.pathname === `/project/${project._id}` 
                                        ? 'bg-primary-500 text-white shadow-sm' 
                                        : 'bg-slate-200 dark:bg-white/5 text-slate-600 dark:text-gray-500'
                                    }`}>
                                        {project.taskCount}
                                    </span>
                                )}
                            </Link>
                        </li>
                    ))}
                    {(!projects || projects.length === 0) && (
                        <li className="text-muted text-xs italic px-6 py-4 bg-black/5 dark:bg-white/5 rounded-2xl border border-dashed border-border-glass">
                            No projects yet
                        </li>
                    )}
                </ul>
            </div>
        </div>

        {/* User Profile Footer */}
        <div className="mt-auto pt-6 border-t border-border-glass">
            <div className="flex items-center space-x-3 px-4 py-3 bg-primary-500/5 rounded-2xl border border-primary-500/10 mb-4">
                <div className="w-10 h-10 rounded-xl premium-gradient flex items-center justify-center text-white font-black text-sm shadow-md">
                    {user?.name?.charAt(0)}
                </div>
                <div className="flex flex-col truncate">
                    <span className="text-sm font-black text-main truncate tracking-tight">{user?.name}</span>
                    <span className="text-[10px] text-muted truncate">{user?.email}</span>
                </div>
            </div>
            
            <div className="px-4 py-2 text-[10px] font-black uppercase tracking-widest text-primary-500/60 flex items-center justify-between">
                <span>TaskFlow Pro</span>
                <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
            </div>
        </div>
    </div>
);

    return (
        <>
            {/* Desktop Sidebar */}
            <aside className="hidden md:flex flex-col w-72 glass h-[calc(100vh-100px)] m-4 rounded-3xl p-6 border-border-glass shadow-premium overflow-hidden">
                {sidebarContent}
            </aside>

            {/* Mobile Sidebar Overlay */}
            {isOpen && (
                <div 
                    className="fixed inset-0 z-[70] bg-slate-900/60 backdrop-blur-sm md:hidden"
                    onClick={onClose}
                >
                    <aside 
                        className="w-72 h-full glass border-r border-border-glass p-6 animate-in slide-in-from-left duration-300 shadow-premium"
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="flex justify-between items-center mb-8">
                            <h2 className="text-main font-black text-xl ml-4 tracking-tight">Tasks</h2>
                            <button onClick={onClose} className="p-2 text-muted hover:text-main transition-colors">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        {sidebarContent}
                    </aside>
                </div>
            )}
        </>
    );
};

export default Sidebar;
