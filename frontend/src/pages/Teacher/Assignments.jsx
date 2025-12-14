import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { FaClipboardList, FaPlus, FaTrash } from 'react-icons/fa';
import toast from 'react-hot-toast';
import { useSelector } from 'react-redux';

const Assignments = () => {
    const { userInfo } = useSelector((state) => state.auth);
    const [assignments, setAssignments] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [classes, setClasses] = useState([]);

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [type, setType] = useState('Assignment');
    const [selectedSubject, setSelectedSubject] = useState('');
    const [selectedClass, setSelectedClass] = useState('');
    const [dueDate, setDueDate] = useState('');
    const [totalPoints, setTotalPoints] = useState('100');
    const [instructions, setInstructions] = useState('');

    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        if (userInfo?._id) {
            fetchAssignments();
            fetchSubjects();
            fetchClasses();
        }
    }, [userInfo]);

    const fetchAssignments = async () => {
        try {
            const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/assignments?teacherId=${userInfo._id}`, {
                headers: { Authorization: `Bearer ${userInfo.token}` }
            });
            setAssignments(data);
        } catch (error) {
            console.error(error);
        }
    };

    const fetchSubjects = async () => {
        try {
            const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/subjects?teacherId=${userInfo._id}`, {
                headers: { Authorization: `Bearer ${userInfo.token}` }
            });
            setSubjects(data);
        } catch (error) {
            console.error(error);
        }
    };

    const fetchClasses = async () => {
        try {
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/classes`, {
                headers: { Authorization: `Bearer ${userInfo.token}` }
            });
            setClasses(data);
        } catch (error) {
            console.error(error);
        }
    };

    const submitHandler = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            await axios.post(`${import.meta.env.VITE_API_URL}/assignments`, {
                title,
                description,
                type,
                subject: selectedSubject,
                class: selectedClass,
                dueDate,
                totalPoints: parseFloat(totalPoints),
                instructions
            }, {
                headers: {
                    Authorization: `Bearer ${userInfo.token}`
                }
            });

            setSuccess(true);
            setTimeout(() => setSuccess(false), 3000);

            // Reset form
            setTitle('');
            setDescription('');
            setType('Assignment');
            setSelectedSubject('');
            setSelectedClass('');
            setDueDate('');
            setTotalPoints('100');
            setInstructions('');

            fetchAssignments();
            setLoading(false);
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || 'Error creating assignment');
            setLoading(false);
        }
    };

    const deleteAssignment = async (id) => {
        if (window.confirm('Are you sure you want to delete this assignment?')) {
            try {
                const userInfo = JSON.parse(localStorage.getItem('userInfo'));
                await axios.delete(`${import.meta.env.VITE_API_URL}/assignments/${id}`, {
                    headers: {
                        Authorization: `Bearer ${userInfo.token}`
                    }
                });
                fetchAssignments();
            } catch (error) {
                console.error(error);
            }
        }
    };

    const getTypeColor = (type) => {
        switch (type) {
            case 'Quiz': return 'bg-purple-100 text-purple-700';
            case 'Homework': return 'bg-blue-100 text-blue-700';
            case 'Project': return 'bg-green-100 text-green-700';
            default: return 'bg-orange-100 text-orange-700';
        }
    };

    return (
        <div className="bg-gray-50 min-h-screen">
            <div className="mb-6">
                <h1 className="text-3xl font-extrabold text-gray-800 tracking-tight">
                    Manage <span className="text-blue-600">Assignments</span>
                </h1>
                <p className="text-gray-500 mt-2">Create and manage assignments, quizzes, and homework</p>
            </div>

            {success && (
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6 flex items-center"
                >
                    ✓ Assignment created successfully!
                </motion.div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Create Form */}
                <div className="lg:col-span-1">
                    <div className="bg-white p-6 rounded-2xl shadow-xl border border-gray-100 sticky top-4">
                        <h2 className="text-xl font-bold mb-6 text-gray-800 flex items-center border-b pb-4 border-gray-100">
                            <FaPlus className="mr-3 text-blue-500 bg-blue-50 p-2 rounded-full text-3xl" />
                            Create New
                        </h2>

                        <form onSubmit={submitHandler} className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-600 mb-1">Title</label>
                                <input
                                    type="text"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 outline-none bg-gray-50 focus:bg-white"
                                    placeholder="e.g. Math Quiz - Chapter 5"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-600 mb-1">Type</label>
                                <select
                                    value={type}
                                    onChange={(e) => setType(e.target.value)}
                                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 outline-none bg-gray-50 focus:bg-white"
                                >
                                    <option value="Assignment">Assignment</option>
                                    <option value="Quiz">Quiz</option>
                                    <option value="Homework">Homework</option>
                                    <option value="Project">Project</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-600 mb-1">Subject</label>
                                <select
                                    value={selectedSubject}
                                    onChange={(e) => setSelectedSubject(e.target.value)}
                                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 outline-none bg-gray-50 focus:bg-white"
                                    required
                                >
                                    <option value="">Select Subject</option>
                                    {subjects.map((subject) => (
                                        <option key={subject._id} value={subject._id}>
                                            {subject.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-600 mb-1">Class</label>
                                <select
                                    value={selectedClass}
                                    onChange={(e) => setSelectedClass(e.target.value)}
                                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 outline-none bg-gray-50 focus:bg-white"
                                    required
                                >
                                    <option value="">Select Class</option>
                                    {classes.map((cls) => (
                                        <option key={cls._id} value={cls._id}>
                                            {cls.name} - {cls.section}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-600 mb-1">Due Date</label>
                                    <input
                                        type="date"
                                        value={dueDate}
                                        onChange={(e) => setDueDate(e.target.value)}
                                        className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 outline-none bg-gray-50 focus:bg-white"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-600 mb-1">Points</label>
                                    <input
                                        type="number"
                                        value={totalPoints}
                                        onChange={(e) => setTotalPoints(e.target.value)}
                                        className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 outline-none bg-gray-50 focus:bg-white"
                                        min="1"
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-600 mb-1">Description</label>
                                <textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 outline-none bg-gray-50 focus:bg-white"
                                    rows="3"
                                    placeholder="Brief description..."
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-600 mb-1">Instructions (Optional)</label>
                                <textarea
                                    value={instructions}
                                    onChange={(e) => setInstructions(e.target.value)}
                                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 outline-none bg-gray-50 focus:bg-white"
                                    rows="3"
                                    placeholder="Detailed instructions..."
                                />
                            </div>

                            <button
                                type="submit"
                                className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/30"
                                disabled={loading}
                            >
                                {loading ? 'Creating...' : 'Create Assignment'}
                            </button>
                        </form>
                    </div>
                </div>

                {/* Assignments List */}
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6">
                        <h2 className="text-xl font-bold text-gray-800 mb-6">My Assignments ({assignments.length})</h2>

                        {assignments.length === 0 ? (
                            <div className="text-center py-12">
                                <p className="text-gray-400 text-lg">No assignments created yet.</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {assignments.map((assignment) => (
                                    <div
                                        key={assignment._id}
                                        className="p-5 border border-gray-200 rounded-xl hover:shadow-lg transition-shadow"
                                    >
                                        <div className="flex justify-between items-start mb-3">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <h3 className="font-bold text-lg text-gray-800">{assignment.title}</h3>
                                                    <span className={`text-xs px-3 py-1 rounded-full font-semibold ${getTypeColor(assignment.type)}`}>
                                                        {assignment.type}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-gray-600 mb-2">{assignment.description}</p>
                                            </div>
                                            <button
                                                onClick={() => deleteAssignment(assignment._id)}
                                                className="text-gray-400 hover:text-red-500 transition-colors p-2"
                                            >
                                                <FaTrash />
                                            </button>
                                        </div>

                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                                            <div>
                                                <p className="text-gray-500">Subject</p>
                                                <p className="font-semibold text-gray-800">{assignment.subject?.name}</p>
                                            </div>
                                            <div>
                                                <p className="text-gray-500">Class</p>
                                                <p className="font-semibold text-gray-800">{assignment.class?.name}</p>
                                            </div>
                                            <div>
                                                <p className="text-gray-500">Due Date</p>
                                                <p className="font-semibold text-gray-800">{new Date(assignment.dueDate).toLocaleDateString()}</p>
                                            </div>
                                            <div>
                                                <p className="text-gray-500">Points</p>
                                                <p className="font-semibold text-gray-800">{assignment.totalPoints}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Assignments;
