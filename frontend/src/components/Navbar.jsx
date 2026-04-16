import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import customFetch from '../services/customFetch';

const Navbar = ({ user, onToggleSidebar }) => {
    const navigate = useNavigate();
    const [isDark, setIsDark] = useState(() => {
        const saved = localStorage.getItem('theme');
        return saved ? saved === 'dark' : true; // Default to dark
    });

    useEffect(() => {
        if (isDark) {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        }
    }, [isDark]);

    const handleLogout = async () => {
        try {
            await customFetch.post('/auth/logout');
            localStorage.removeItem('user');
            toast.info('Logged out');
            navigate('/login');
        } catch (err) {
            console.error('Logout failed', err);
            localStorage.removeItem('user');
            navigate('/login');
        }
    };

    return (
        <nav className="glass sticky top-0 z-[60] px-4 md:px-6 py-4 flex justify-between items-center backdrop-blur-md">
            <div className="flex items-center space-x-4">
                {/* Mobile Sidebar Toggle */}
                {onToggleSidebar && (
                    <button 
                        onClick={onToggleSidebar}
                        className="md:hidden p-2 text-muted hover:text-main transition-colors"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                    </button>
                )}

                <div className="flex items-center space-x-2 cursor-pointer" onClick={() => navigate('/')}>
                    <div className="w-8 h-8 md:w-10 md:h-10 premium-gradient rounded-xl flex items-center justify-center text-white font-bold text-lg md:text-xl shadow-lg">
                        TF
                    </div>
                    <h1 className="text-xl md:text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary-400 to-indigo-400 dark:from-white dark:to-gray-400">
                        TaskFlow
                    </h1>
                </div>
            </div>
            
            <div className="flex items-center space-x-3 md:space-x-6">
                {/* Theme Toggle */}
                <button 
                    onClick={() => setIsDark(!isDark)}
                    className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 dark:hover:bg-white/5 border border-border-glass transition-all duration-300"
                    title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
                >
                    {isDark ? (
                        <svg className="w-5 h-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                    ) : (
                        <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                        </svg>
                    )}
                </button>

                <div className="hidden sm:flex flex-col items-end">
                    <span className="font-semibold text-sm md:text-base">{user?.name}</span>
                    <span className="text-muted text-[10px] md:text-xs">{user?.email}</span>
                </div>
                <button 
                    onClick={handleLogout}
                    className="px-3 py-1.5 md:px-4 md:py-2 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all duration-200 border border-red-500/20 text-xs md:text-sm font-bold"
                >
                    Logout
                </button>
            </div>
        </nav>
    );
};

export default Navbar;
