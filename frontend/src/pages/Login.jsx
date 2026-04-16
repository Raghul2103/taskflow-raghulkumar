import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import customFetch from '../services/customFetch';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await customFetch.post('/auth/login', { email, password });
            localStorage.setItem('user', JSON.stringify(response.data));
            toast.success('Login Successful!');
            navigate('/');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Login failed. Please check your credentials.');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-app p-4 font-sans text-main selection:bg-primary-500 selection:text-white transition-colors duration-500">
            <div className="glass w-full max-w-md p-10 rounded-[3rem] shadow-premium space-y-10 animate-in fade-in zoom-in duration-500 border-border-glass">
                <div className="text-center">
                    <h1 className="text-5xl font-black text-main mb-3 tracking-tighter">TaskFlow</h1>
                    <p className="text-muted font-bold tracking-tight">Management, redefined.</p>
                </div>

                <form className="space-y-8" onSubmit={handleSubmit}>
                    <div className="space-y-5">
                        <div className="group">
                            <label className="block text-muted text-[10px] font-black uppercase tracking-[0.2em] mb-2.5 ml-2 transition-colors group-focus-within:text-primary-600">Email Address</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-sidebar border border-border-glass rounded-[1.25rem] px-6 py-4 text-main font-semibold outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 transition-all duration-300 placeholder:text-muted/20 shadow-inner"
                                placeholder="name@example.com"
                                required
                            />
                        </div>
                        <div className="group">
                            <label className="block text-muted text-[10px] font-black uppercase tracking-[0.2em] mb-2.5 ml-2 transition-colors group-focus-within:text-primary-600">Password</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-sidebar border border-border-glass rounded-[1.25rem] px-6 py-4 text-main font-semibold outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 transition-all duration-300 placeholder:text-muted/20 shadow-inner"
                                placeholder="••••••••"
                                required
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="w-full py-5 rounded-[1.25rem] premium-gradient text-white font-black shadow-xl shadow-primary-500/30 hover:scale-[1.02] active:scale-95 transition-all text-sm uppercase tracking-[0.2em] border border-white/20"
                    >
                        Sign In
                    </button>
                    
                    <div className="text-center pt-2">
                        <p className="text-muted text-sm font-bold">
                            Don't have an account?{' '}
                            <Link to="/register" className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors underline decoration-2 underline-offset-4">
                                Create Account
                            </Link>
                        </p>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Login;
