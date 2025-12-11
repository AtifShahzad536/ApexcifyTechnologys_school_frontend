import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { FaPlus, FaTrash } from 'react-icons/fa';

const Teachers = () => {
    const [teachers, setTeachers] = useState([]);

    // Form States
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [qualification, setQualification] = useState('');
    const [phone, setPhone] = useState('');

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchTeachers = async () => {
        try {
            const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/teachers`);
            setTeachers(data);
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        fetchTeachers();
    }, []);

    const submitHandler = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const config = {
                headers: { 'Content-Type': 'application/json' },
            };
            await axios.post('http://localhost:5000/api/teachers', {
                name, email, password, qualification, phone
            }, config);

            setLoading(false);
            // Reset Form
            setName(''); setEmail(''); setPassword(''); setQualification(''); setPhone('');
            fetchTeachers(); // Refresh list
        } catch (err) {
            setError(err.response?.data?.message || err.message);
            setLoading(false);
        }
    };

    return (
        <div className="bg-gray-50 min-h-screen">
            <div className="mb-6 flex justify-between items-center">
                <h1 className="text-3xl font-extrabold text-gray-800 tracking-tight">
                    Manage <span className="text-blue-600">Teachers</span>
                </h1>
                <span className="text-sm text-gray-500 bg-white px-3 py-1 rounded-full shadow-sm border border-gray-100">
                    Total Teachers: <span className="font-bold text-gray-800">{teachers.length}</span>
                </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Create Teacher Form */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white p-6 rounded-2xl shadow-xl border border-gray-100 h-fit lg:col-span-1"
                >
                    <h2 className="text-xl font-bold mb-6 text-gray-800 flex items-center border-b pb-4 border-gray-100">
                        <FaPlus className="mr-3 text-blue-500 bg-blue-50 p-2 rounded-full text-3xl" />
                        Add New Teacher
                    </h2>
                    {error && (
                        <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm border border-red-100 flex items-center">
                            <span className="mr-2">⚠️</span> {error}
                        </div>
                    )}
                    <form onSubmit={submitHandler} className="space-y-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-600 mb-1">Full Name</label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all bg-gray-50 focus:bg-white"
                                placeholder="e.g. Dr. Jane Smith"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-600 mb-1">Email Address</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all bg-gray-50 focus:bg-white"
                                placeholder="jane@example.com"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-600 mb-1">Password</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all bg-gray-50 focus:bg-white"
                                placeholder="••••••••"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-600 mb-1">Qualification</label>
                            <input
                                type="text"
                                value={qualification}
                                onChange={(e) => setQualification(e.target.value)}
                                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all bg-gray-50 focus:bg-white"
                                placeholder="M.Sc. Mathematics"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-600 mb-1">Phone</label>
                            <input
                                type="text"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all bg-gray-50 focus:bg-white"
                                placeholder="+1 234 567 890"
                            />
                        </div>

                        <button
                            type="submit"
                            className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/30 mt-4"
                            disabled={loading}
                        >
                            {loading ? 'Adding...' : 'Add Teacher'}
                        </button>
                    </form>
                </motion.div>

                {/* Teacher List */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="bg-white rounded-2xl shadow-xl border border-gray-100 lg:col-span-2 overflow-hidden flex flex-col h-[600px]"
                >
                    <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                        <h2 className="text-xl font-bold text-gray-800">Teacher Directory</h2>
                        <input
                            type="text"
                            placeholder="Search teachers..."
                            className="border border-gray-300 rounded-lg px-4 py-1.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                    </div>

                    <div className="overflow-y-auto overflow-x-auto flex-1 p-4">
                        {teachers.length === 0 ? (
                            <div className="text-center py-20">
                                <p className="text-gray-400 text-lg">No teachers found.</p>
                                <p className="text-gray-400 text-sm">Add a new teacher to get started.</p>
                            </div>
                        ) : (
                            <table className="min-w-full">
                                <thead className="bg-blue-50 rounded-lg text-blue-800">
                                    <tr>
                                        <th className="py-3 px-4 text-left text-xs font-bold uppercase tracking-wider rounded-l-lg">Name</th>
                                        <th className="py-3 px-4 text-left text-xs font-bold uppercase tracking-wider">Contact</th>
                                        <th className="py-3 px-4 text-left text-xs font-bold uppercase tracking-wider">Qualification</th>
                                        <th className="py-3 px-4 text-right text-xs font-bold uppercase tracking-wider rounded-r-lg">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {teachers.map((teacher) => (
                                        <tr key={teacher._id} className="hover:bg-blue-50/50 transition-colors group">
                                            <td className="py-4 px-4">
                                                <div className="font-semibold text-gray-800">{teacher.name}</div>
                                            </td>
                                            <td className="py-4 px-4 text-sm text-gray-500">
                                                <div className="flex flex-col">
                                                    <span>{teacher.email}</span>
                                                    <span className="text-xs text-gray-400">{teacher.phone}</span>
                                                </div>
                                            </td>
                                            <td className="py-4 px-4 text-sm text-gray-600">
                                                <span className="bg-gray-100 px-2 py-1 rounded text-xs font-medium">
                                                    {teacher.qualification || 'N/A'}
                                                </span>
                                            </td>
                                            <td className="py-4 px-4 text-right">
                                                <button className="text-gray-400 hover:text-red-500 transition-colors p-2 rounded-full hover:bg-red-50">
                                                    <FaTrash />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default Teachers;
