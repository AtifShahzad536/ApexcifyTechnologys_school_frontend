import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { FaPlus, FaTrash } from 'react-icons/fa';
import toast from 'react-hot-toast';

const Classes = () => {
    const [classes, setClasses] = useState([]);
    const [name, setName] = useState('');
    const [section, setSection] = useState('');
    const [loading, setLoading] = useState(false);

    const fetchClasses = async () => {
        try {
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/classes`, {
                headers: { Authorization: `Bearer ${userInfo.token}` }
            });
            setClasses(data);
        } catch (error) {
            console.error(error);
            toast.error('Error fetching classes');
        }
    };

    useEffect(() => {
        fetchClasses();
    }, []);

    const submitHandler = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            const config = {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${userInfo.token}`
                },
            };
            await axios.post(`${import.meta.env.VITE_API_URL}/classes`, { name, section }, config);
            setLoading(false);
            setName('');
            setSection('');
            toast.success('Class added successfully');
            fetchClasses(); // Refresh list
        } catch (err) {
            const message = err.response?.data?.message || err.message;
            toast.error(message);
            setLoading(false);
        }
    };

    const handleDelete = async (classId) => {
        if (!window.confirm('Are you sure you want to delete this class? This action cannot be undone.')) {
            return;
        }

        try {
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            await axios.delete(`${import.meta.env.VITE_API_URL}/classes/${classId}`, {
                headers: { Authorization: `Bearer ${userInfo.token}` }
            });
            toast.success('Class deleted successfully');
            fetchClasses(); // Refresh list
        } catch (err) {
            const message = err.response?.data?.message || err.message;
            toast.error(message);
        }
    };


    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-8">Manage Classes</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Create Class Form */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="bg-white p-6 rounded-lg shadow-md h-fit"
                >
                    <h2 className="text-xl font-bold mb-4 flex items-center">
                        <FaPlus className="mr-2 text-blue-500" /> Add New Class
                    </h2>

                    <form onSubmit={submitHandler}>
                        <div className="mb-4">
                            <label className="block text-gray-700 mb-2">Class Name</label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full border rounded px-3 py-2 focus:outline-none focus:border-blue-500"
                                placeholder="e.g. Class 10"
                                required
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block text-gray-700 mb-2">Section</label>
                            <input
                                type="text"
                                value={section}
                                onChange={(e) => setSection(e.target.value)}
                                className="w-full border rounded px-3 py-2 focus:outline-none focus:border-blue-500"
                                placeholder="e.g. A"
                                required
                            />
                        </div>
                        <button
                            type="submit"
                            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 w-full"
                            disabled={loading}
                        >
                            {loading ? 'Adding...' : 'Add Class'}
                        </button>
                    </form>
                </motion.div>

                {/* Class List */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="bg-white p-6 rounded-lg shadow-md"
                >
                    <h2 className="text-xl font-bold mb-4">Class List</h2>
                    {classes.length === 0 ? (
                        <p className="text-gray-500">No classes added yet.</p>
                    ) : (
                        <>
                            {/* Mobile View - Cards */}
                            <div className="md:hidden space-y-4">
                                {classes.map((cls) => (
                                    <div key={cls._id} className="border p-4 rounded-lg bg-gray-50 flex justify-between items-center bg-white shadow-sm">
                                        <div>
                                            <span className="block font-bold text-gray-800 text-lg">{cls.name}</span>
                                            <span className="inline-block bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded font-semibold mt-1">Section {cls.section}</span>
                                        </div>
                                        <button
                                            onClick={() => handleDelete(cls._id)}
                                            className="text-red-500 hover:text-red-700 bg-white p-2 rounded-full shadow-sm border border-gray-100"
                                        >
                                            <FaTrash />
                                        </button>
                                    </div>
                                ))}
                            </div>

                            {/* Desktop View - List */}
                            <ul className="hidden md:block">
                                {classes.map((cls) => (
                                    <li key={cls._id} className="border-b py-3 flex justify-between items-center last:border-0 hover:bg-gray-50 px-2 rounded transition-colors">
                                        <div>
                                            <span className="font-semibold text-lg text-gray-800">{cls.name}</span>
                                            <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded ml-3 font-medium border border-gray-200">Section {cls.section}</span>
                                        </div>
                                        <button
                                            onClick={() => handleDelete(cls._id)}
                                            className="text-red-500 hover:text-red-700 p-2 rounded-full hover:bg-red-50 transition-colors"
                                        >
                                            <FaTrash />
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </>
                    )}
                </motion.div>
            </div>
        </div>
    );
};

export default Classes;
