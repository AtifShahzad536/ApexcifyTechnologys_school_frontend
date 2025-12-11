import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { FaPlus, FaTrash } from 'react-icons/fa';

const Classes = () => {
    const [classes, setClasses] = useState([]);
    const [name, setName] = useState('');
    const [section, setSection] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchClasses = async () => {
        try {
            const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/classes`);
            setClasses(data);
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        fetchClasses();
    }, []);

    const submitHandler = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const config = {
                headers: { 'Content-Type': 'application/json' },
            };
            await axios.post(`${import.meta.env.VITE_API_URL}/classes`, { name, section }, config);
            setLoading(false);
            setName('');
            setSection('');
            fetchClasses(); // Refresh list
        } catch (err) {
            setError(err.response?.data?.message || err.message);
            setLoading(false);
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
                    {error && <div className="bg-red-100 text-red-700 p-2 rounded mb-4">{error}</div>}
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
                        <ul>
                            {classes.map((cls) => (
                                <li key={cls._id} className="border-b py-3 flex justify-between items-center last:border-0">
                                    <div>
                                        <span className="font-semibold text-lg">{cls.name}</span>
                                        <span className="bg-gray-200 text-xs px-2 py-1 rounded ml-2 text-gray-700">Section {cls.section}</span>
                                    </div>
                                    <button className="text-red-500 hover:text-red-700">
                                        <FaTrash />
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}
                </motion.div>
            </div>
        </div>
    );
};

export default Classes;
