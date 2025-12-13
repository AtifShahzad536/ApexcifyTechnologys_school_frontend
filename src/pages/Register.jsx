import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

import FloatingBackground from '../components/FloatingBackground';



const Register = () => {
    // ... existing state ...
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const navigate = useNavigate();

    const submitHandler = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const { data } = await axios.post(`${import.meta.env.VITE_API_URL}/auth/register`, {
                name,
                email,
                password
            });

            setSuccess(true);
            setLoading(false);

            // Redirect to login after 3 seconds
            setTimeout(() => {
                navigate('/login');
            }, 3000);
        } catch (err) {
            const message = err.response?.data?.message || 'Registration failed';
            setError(message);
            toast.error(message);
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-blue-100 animate-gradient relative overflow-hidden">
                <FloatingBackground />
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="w-full max-w-md p-8 bg-white/90 backdrop-blur-sm rounded-2xl shadow-2xl text-center z-10"
                >
                    <div className="mb-4">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                            </svg>
                        </div>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Registration Submitted!</h2>
                    <p className="text-gray-600 mb-4">
                        Your account is pending admin approval. You will be able to login once your account is approved.
                    </p>
                    <p className="text-sm text-gray-500">
                        Redirecting to login page...
                    </p>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-blue-100 animate-gradient relative overflow-hidden">
            <FloatingBackground />
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-md p-6 md:p-8 bg-white/80 backdrop-blur-sm rounded-2xl shadow-2xl z-10"
            >
                <h2 className="mb-6 text-3xl font-extrabold text-center text-gray-800">Create Account</h2>
                <p className="text-center text-gray-600 mb-6 text-sm">
                    Register for a new account. Admin will approve and assign your role.
                </p>

                {error && (
                    <div className="p-4 mb-4 text-red-700 bg-red-100 rounded-lg border border-red-200">
                        {error}
                    </div>
                )}

                <form onSubmit={submitHandler}>
                    <div className="mb-4">
                        <label className="block mb-2 text-sm font-semibold text-gray-700">Full Name</label>
                        <input
                            type="text"
                            className="w-full px-4 py-3 text-gray-700 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Enter your full name"
                            required
                        />
                    </div>

                    <div className="mb-4">
                        <label className="block mb-2 text-sm font-semibold text-gray-700">Email Address</label>
                        <input
                            type="email"
                            className="w-full px-4 py-3 text-gray-700 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Enter your email"
                            required
                        />
                    </div>

                    <div className="mb-6">
                        <label className="block mb-2 text-sm font-semibold text-gray-700">Password</label>
                        <input
                            type="password"
                            className="w-full px-4 py-3 text-gray-700 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Create a password"
                            required
                            minLength="6"
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full px-4 py-3 font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-lg transition-all"
                        disabled={loading}
                    >
                        {loading ? 'Submitting...' : 'Create Account'}
                    </button>

                    <div className="mt-6 text-center">
                        <p className="text-sm text-gray-600">
                            Already have an account?{' '}
                            <Link to="/login" className="font-semibold text-blue-600 hover:text-blue-800">
                                Login here
                            </Link>
                        </p>
                    </div>
                </form>
            </motion.div>


        </div>
    );
};

export default Register;
