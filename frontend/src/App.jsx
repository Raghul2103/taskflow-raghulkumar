import React from 'react';
import customFetch from './services/customFetch';

import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import ProjectDetail from './pages/ProjectDetail';
import MyTasks from './pages/MyTasks';

const ProtectedRoute = ({ children }) => {
    const userString = localStorage.getItem('user');
    let user = null;
    try {
        user = userString ? JSON.parse(userString) : null;
    } catch (e) {
        localStorage.removeItem('user');
        user = null;
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }
    return children;
};

const PublicRoute = ({ children }) => {
    const userString = localStorage.getItem('user');
    let user = null;
    try {
        user = userString ? JSON.parse(userString) : null;
    } catch (e) {
        user = null;
    }

    if (user) {
        return <Navigate to="/" replace />;
    }
    return children;
};

function App() {
    React.useEffect(() => {
        const checkSession = async () => {
            const userString = localStorage.getItem('user');
            if (userString) {
                try {
                    // Call /api/auth/me to verify cookie is still valid
                    const response = await customFetch.get('/auth/me');
                    // Update user info in localStorage just in case it changed
                    localStorage.setItem('user', JSON.stringify(response.data));
                } catch (err) {
                    // Cookie invalid or missing, clear storage
                    localStorage.removeItem('user');
                    window.location.href = '/login';
                }
            }
        };
        checkSession();
    }, []);

    return (
        <Router>
            <ToastContainer 
                position="top-right"
                autoClose={3000}
                hideProgressBar={false}
                newestOnTop
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="dark"
            />
            <Routes>
                <Route 
                    path="/login" 
                    element={
                        <PublicRoute>
                            <Login />
                        </PublicRoute>
                    } 
                />
                <Route 
                    path="/register" 
                    element={
                        <PublicRoute>
                            <Register />
                        </PublicRoute>
                    } 
                />
                <Route 
                    path="/" 
                    element={
                        <ProtectedRoute>
                            <Dashboard />
                        </ProtectedRoute>
                    } 
                />
                <Route 
                    path="/my-tasks" 
                    element={
                        <ProtectedRoute>
                            <MyTasks />
                        </ProtectedRoute>
                    } 
                />
                <Route 
                    path="/project/:id" 
                    element={
                        <ProtectedRoute>
                            <ProjectDetail />
                        </ProtectedRoute>
                    } 
                />
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </Router>
    );
}

export default App;
