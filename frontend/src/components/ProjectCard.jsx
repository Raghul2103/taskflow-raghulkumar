import React from 'react';
import { Link } from 'react-router-dom';

const ProjectCard = ({ project, onDelete }) => {
    return (
        <div className="glass p-6 rounded-3xl card-hover relative group border-border-glass shadow-premium hover:border-primary-500/30">
            <div className="flex justify-between items-start mb-5">
                <div className="w-14 h-14 premium-gradient rounded-2xl flex items-center justify-center text-white text-2xl font-black shadow-xl shadow-primary-500/20 transition-transform group-hover:scale-110">
                    {project.name.charAt(0).toUpperCase()}
                </div>
                <button 
                    onClick={() => onDelete(project._id)}
                    className="opacity-0 group-hover:opacity-100 p-2.5 text-muted hover:text-red-500 hover:bg-red-50/50 dark:hover:bg-red-500/10 rounded-xl transition-all"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                </button>
            </div>
            
            <Link to={`/project/${project._id}`}>
                <h3 className="text-xl font-black text-main mb-2 group-hover:text-primary-600 transition-colors tracking-tight">
                    {project.name}
                </h3>
                <p className="text-muted text-sm line-clamp-2 mb-6 font-medium leading-relaxed">
                    {project.description}
                </p>
                
                <div className="flex flex-wrap items-center justify-between gap-4 pt-5 border-t border-border-glass">
                    <div className="flex items-center space-x-2 bg-slate-100 dark:bg-white/5 px-3 py-1.5 rounded-full border border-border-glass">
                        <svg className="w-3.5 h-3.5 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span className="text-[10px] font-black uppercase tracking-wider text-muted">
                            {project.deadline ? new Date(project.deadline).toLocaleDateString() : 'No deadline'}
                        </span>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                        <div className="flex flex-col items-end">
                            <span className="text-sm font-black text-main leading-none">{project.taskCount || 0}</span>
                            <span className="text-[9px] font-bold text-muted uppercase tracking-tighter">Tasks</span>
                        </div>
                        <div className="w-8 h-8 rounded-full bg-primary-500/10 flex items-center justify-center text-primary-500 group-hover:bg-primary-500 group-hover:text-white transition-all shadow-sm">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                            </svg>
                        </div>
                    </div>
                </div>
            </Link>
        </div>
    );
};

export default ProjectCard;
