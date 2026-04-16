import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import customFetch from '../services/customFetch';

const TaskModal = ({ isOpen, onClose, onSubmit, projectId }) => {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        priority: 'medium',
        status: 'todo',
        dueDate: '',
        project: projectId,
        assignee: ''
    });
    const [users, setUsers] = useState([]);
    const [currentUser, setCurrentUser] = useState(null);

    useEffect(() => {
        const userData = JSON.parse(localStorage.getItem('user'));
        setCurrentUser(userData);
    }, []);

    useEffect(() => {
        if (isOpen) {
            fetchUsers();
        }
    }, [isOpen]);

    const fetchUsers = async () => {
        try {
            const response = await customFetch.get('/auth/users');
            setUsers(response.data);
        } catch (err) {
            console.error('Failed to fetch users', err);
        }
    };

    if (!isOpen) return null;

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        if (!formData.title.trim()) {
            return toast.error('Task title is required');
        }

        onSubmit(formData);
        
        setFormData({
            title: '',
            description: '',
            priority: 'medium',
            status: 'todo',
            dueDate: '',
            project: projectId,
            assignee: ''
        });
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 dark:bg-black/60 backdrop-blur-md">
            <div className="glass w-full max-w-lg rounded-[2.5rem] p-8 md:p-10 shadow-premium relative animate-in fade-in zoom-in duration-300 border-border-glass">
                <button 
                    onClick={onClose}
                    className="absolute top-8 right-8 text-muted hover:text-main transition-colors p-2 hover:bg-slate-100 dark:hover:bg-white/5 rounded-full"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>

                <h2 className="text-2xl md:text-3xl font-black text-main mb-8 tracking-tight">Create New Task</h2>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-muted text-[10px] font-black uppercase tracking-[0.2em] mb-2.5 ml-1">Title</label>
                        <input
                            type="text"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            className="w-full bg-sidebar border border-border-glass rounded-2xl px-5 py-4 text-main font-semibold outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 transition-all placeholder:text-muted/30"
                            placeholder="What needs to be done?"
                        />
                    </div>

                    <div>
                        <label className="block text-muted text-[10px] font-black uppercase tracking-[0.2em] mb-2.5 ml-1">Description</label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            rows="3"
                            className="w-full bg-sidebar border border-border-glass rounded-2xl px-5 py-4 text-main font-semibold outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 transition-all placeholder:text-muted/30 resize-none"
                            placeholder="Add more details..."
                        ></textarea>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-muted text-[10px] font-black uppercase tracking-[0.2em] mb-2.5 ml-1">Priority</label>
                            <div className="relative">
                                <select
                                    name="priority"
                                    value={formData.priority}
                                    onChange={handleChange}
                                    className="w-full bg-sidebar border border-border-glass rounded-2xl px-5 py-4 text-main font-black text-xs tracking-widest outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 transition-all appearance-none"
                                >
                                    <option className="bg-sidebar text-main" value="low">LOW</option>
                                    <option className="bg-sidebar text-main" value="medium">MEDIUM</option>
                                    <option className="bg-sidebar text-main" value="high">HIGH</option>
                                </select>
                                <svg className="w-4 h-4 absolute right-5 top-5 text-muted pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                </svg>
                            </div>
                        </div>
                        <div>
                            <label className="block text-muted text-[10px] font-black uppercase tracking-[0.2em] mb-2.5 ml-1">Assignee</label>
                            <div className="relative">
                                <select
                                    name="assignee"
                                    value={formData.assignee}
                                    onChange={handleChange}
                                    className="w-full bg-sidebar border border-border-glass rounded-2xl px-5 py-4 text-main font-black text-xs tracking-widest outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 transition-all appearance-none"
                                >
                                    <option className="bg-sidebar text-main" value="">NONE</option>
                                    {users
                                        .filter(user => user._id !== currentUser?._id)
                                        .map(user => (
                                            <option key={user._id} className="bg-sidebar text-main" value={user._id}>
                                                {user.name.toUpperCase()}
                                            </option>
                                        ))}
                                </select>
                                <svg className="w-4 h-4 absolute right-5 top-5 text-muted pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="block text-muted text-[10px] font-black uppercase tracking-[0.2em] mb-2.5 ml-1">Due Date</label>
                        <input
                            type="date"
                            name="dueDate"
                            value={formData.dueDate}
                            onChange={handleChange}
                            className="w-full bg-sidebar border border-border-glass rounded-2xl px-5 py-4 text-main font-bold outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 transition-all"
                        />
                    </div>

                    <div className="flex space-x-4 pt-6">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-8 py-4 rounded-2xl bg-slate-100 dark:bg-white/5 border border-border-glass text-muted hover:text-main hover:bg-slate-200 dark:hover:bg-white/10 transition-all font-black text-sm uppercase tracking-widest"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="flex-1 px-8 py-4 rounded-2xl premium-gradient text-white font-black shadow-xl shadow-primary-500/30 hover:scale-[1.02] active:scale-95 transition-all text-sm uppercase tracking-widest border border-white/20"
                        >
                            Create Task
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default TaskModal;
