import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import customFetch from '../services/customFetch';

const Register = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: ''
    });
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Basic validation
        if (!formData.name.trim() || !formData.email.trim() || !formData.password.trim()) {
            return toast.error('Please fill in all fields');
        }

        try {
            const response = await customFetch.post('/auth/register', formData);
            toast.success(response.data.message || 'Registration successful! Please login.');
            navigate('/login');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Registration failed');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-app p-4 font-sans text-main selection:bg-primary-500 selection:text-white transition-colors duration-500">
            <div className="glass w-full max-w-md p-10 rounded-[3rem] shadow-premium space-y-10 animate-in fade-in zoom-in duration-500 border-border-glass">
                <div className="text-center">
                    <h1 className="text-5xl font-black text-main mb-3 tracking-tighter">Join TaskFlow</h1>
                    <p className="text-muted font-bold tracking-tight">Create your account to start managing tasks.</p>
                </div>

                <form className="space-y-6" onSubmit={handleSubmit}>
                    <div className="space-y-5">
                        <div className="group">
                            <label className="block text-muted text-[10px] font-black uppercase tracking-[0.2em] mb-2.5 ml-2 transition-colors group-focus-within:text-primary-600">Full Name</label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                className="w-full bg-sidebar border border-border-glass rounded-[1.25rem] px-6 py-4 text-main font-semibold outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 transition-all duration-300 placeholder:text-muted/20 shadow-inner"
                                placeholder="John Doe"
                                required
                            />
                        </div>
                        <div className="group">
                            <label className="block text-muted text-[10px] font-black uppercase tracking-[0.2em] mb-2.5 ml-2 transition-colors group-focus-within:text-primary-600">Email Address</label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                className="w-full bg-sidebar border border-border-glass rounded-[1.25rem] px-6 py-4 text-main font-semibold outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 transition-all duration-300 placeholder:text-muted/20 shadow-inner"
                                placeholder="name@example.com"
                                required
                            />
                        </div>
                        <div className="group">
                            <label className="block text-muted text-[10px] font-black uppercase tracking-[0.2em] mb-2.5 ml-2 transition-colors group-focus-within:text-primary-600">Password</label>
                            <input
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
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
                        Create Account
                    </button>
                    
                    <div className="text-center pt-2">
                        <p className="text-muted text-sm font-bold">
                            Already have an account?{' '}
                            <Link to="/login" className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors underline decoration-2 underline-offset-4">
                                Sign In
                            </Link>
                        </p>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Register;
