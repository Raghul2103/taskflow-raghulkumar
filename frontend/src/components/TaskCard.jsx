import React from 'react';

const TaskCard = ({ task, onUpdate, onDelete, currentUser }) => {
    // Permission check: Only creator or project owner can delete
    const canDelete = currentUser && (
        task.creator === currentUser._id || 
        task.creator === currentUser.id ||
        task.project?.owner === currentUser._id ||
        task.project?.owner === currentUser.id ||
        task.project === currentUser._id || // in case project is populated to ID
        (typeof task.project === 'object' && (task.project.owner === currentUser._id || task.project.owner === currentUser.id))
    );

    const priorityColors = {
        high: 'text-red-600 bg-red-100 border-red-200 dark:text-red-400 dark:bg-red-900/20 dark:border-red-800',
        medium: 'text-amber-600 bg-amber-100 border-amber-200 dark:text-amber-400 dark:bg-amber-900/20 dark:border-amber-800',
        low: 'text-emerald-600 bg-emerald-100 border-emerald-200 dark:text-emerald-400 dark:bg-emerald-900/20 dark:border-emerald-800',
    };

    const handleStatusChange = (e) => {
        onUpdate(task._id, { status: e.target.value });
    };

    return (
        <div className="glass p-6 rounded-3xl relative group border-l-4 border-l-primary-500 transition-all card-hover hover:border-r-primary-500/10 shadow-premium">
            <div className="flex justify-between items-start mb-4">
                <span className={`text-[9px] uppercase font-black px-2.5 py-1 rounded-full border shadow-sm ${priorityColors[task.priority]}`}>
                    {task.priority}
                </span>
                <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {canDelete && (
                        <button 
                            onClick={() => onDelete(task._id)}
                            className="p-2 text-muted hover:text-red-500 rounded-xl hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                        </button>
                    )}
                </div>
            </div>

            <h4 className="text-main font-black text-lg mb-2 tracking-tight leading-tight">{task.title}</h4>
            <p className="text-muted text-sm mb-6 line-clamp-2 font-medium leading-relaxed">{task.description}</p>
            
            <div className="flex flex-wrap items-center justify-between gap-4 mt-auto pt-5 border-t border-border-glass">
                <div className="relative">
                    <select 
                        value={task.status} 
                        onChange={handleStatusChange}
                        className={`text-[10px] font-black tracking-widest px-4 py-2 rounded-xl border outline-none cursor-pointer transition-all bg-sidebar text-main border-border-glass focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 appearance-none pr-8`}
                    >
                        <option className="bg-sidebar text-main" value="todo">TO DO</option>
                        <option className="bg-sidebar text-main" value="in_progress">IN PROGRESS</option>
                        <option className="bg-sidebar text-main" value="done">DONE</option>
                    </select>
                    <svg className="w-3 h-3 absolute right-3 top-2.5 text-muted pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                </div>

                {task.dueDate && (
                    <div className="flex items-center space-x-2 bg-slate-100 dark:bg-white/5 px-3 py-1.5 rounded-full border border-border-glass">
                        <svg className="w-3.5 h-3.5 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="text-[10px] font-black uppercase tracking-wider text-muted">
                            {new Date(task.dueDate).toLocaleDateString()}
                        </span>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TaskCard;
