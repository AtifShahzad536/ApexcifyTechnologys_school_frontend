import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { login, logout } from '../redux/slices/authSlice';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';

import FloatingBackground from '../components/FloatingBackground';


const Login = () => {
    // ... existing state and logic ...
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const dispatch = useDispatch();
    const navigate = useNavigate();

    const { userInfo, loading, error } = useSelector((state) => state.auth);

    useEffect(() => {
        if (userInfo) {
            if (userInfo.role === 'Admin') navigate('/admin/dashboard');
            else if (userInfo.role === 'Teacher') navigate('/teacher/dashboard');
            else if (userInfo.role === 'Student') navigate('/student/dashboard');
            else if (userInfo.role === 'Parent') navigate('/parent/dashboard');
            else {
                // Prevent infinite loop if role is unknown or invalid
                console.error("Unknown role in userInfo:", userInfo);
                dispatch(logout()); // Clear invalid session
            }
        }
    }, [userInfo, navigate]);

    const submitHandler = (e) => {
        e.preventDefault();
        dispatch(login({ email, password }));
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-100 via-white to-blue-50 animate-gradient relative overflow-hidden">
            <FloatingBackground />
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-md p-6 md:p-8 bg-white/80 backdrop-blur-sm rounded shadow-md z-10"
            >
                <h2 className="mb-6 text-2xl font-bold text-center text-gray-800">Login</h2>
                {error && <div className="p-3 mb-4 text-red-700 bg-red-100 rounded">{error}</div>}
                <form onSubmit={submitHandler}>
                    <div className="mb-4">
                        <label className="block mb-2 text-sm font-bold text-gray-700">Email</label>
                        <input
                            type="email"
                            className="w-full px-3 py-2 leading-tight text-gray-700 border rounded shadow appearance-none focus:outline-none focus:shadow-outline"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Enter email"
                            required
                        />
                    </div>
                    <div className="mb-6">
                        <label className="block mb-2 text-sm font-bold text-gray-700">Password</label>
                        <input
                            type="password"
                            className="w-full px-3 py-2 mb-3 leading-tight text-gray-700 border rounded shadow appearance-none focus:outline-none focus:shadow-outline"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter password"
                            required
                        />
                    </div>
                    <div className="flex items-center justify-between">
                        <button
                            type="submit"
                            className="w-full px-4 py-2 font-bold text-white bg-blue-500 rounded hover:bg-blue-700 focus:outline-none focus:shadow-outline"
                            disabled={loading}
                        >
                            {loading ? 'Loading...' : 'Sign In'}
                        </button>
                    </div>
                    <div className="mt-4 text-center">
                        <p className="text-sm text-gray-600">
                            Don't have an account?{' '}
                            <Link to="/register" className="font-bold text-blue-500 hover:text-blue-800">
                                Sign Up
                            </Link>
                        </p>
                    </div>
                </form>
            </motion.div>


        </div>
    );
};

export default Login;
