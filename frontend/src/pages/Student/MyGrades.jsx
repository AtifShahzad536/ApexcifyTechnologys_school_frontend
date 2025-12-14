import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { FaTrophy, FaChartLine } from 'react-icons/fa';
import { useSelector } from 'react-redux';

const MyGrades = () => {
    const { userInfo } = useSelector((state) => state.auth);
    const [grades, setGrades] = useState([]);
    const [stats, setStats] = useState(null);
    const [filter, setFilter] = useState('All');

    useEffect(() => {
        if (userInfo?._id) {
            fetchGrades();
            fetchStats();
        }
    }, [userInfo]);

    const fetchGrades = async () => {
        try {
            const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/grades/student/${userInfo._id}`, {
                headers: { Authorization: `Bearer ${userInfo.token}` }
            });
            setGrades(data);
        } catch (error) {
            console.error(error);
        }
    };

    const fetchStats = async () => {
        try {
            const { data } = await axios.get(`http://localhost:5000/api/grades/student/${userInfo._id}/stats`, {
                headers: { Authorization: `Bearer ${userInfo.token}` }
            });
            setStats(data);
        } catch (error) {
            console.error(error);
        }
    };

    const filteredGrades = filter === 'All'
        ? grades
        : grades.filter(g => g.examType === filter);

    const getGradeColor = (grade) => {
        if (grade.startsWith('A')) return 'text-green-600 bg-green-50 border-green-200';
        if (grade.startsWith('B')) return 'text-blue-600 bg-blue-50 border-blue-200';
        if (grade.startsWith('C')) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
        if (grade === 'D') return 'text-orange-600 bg-orange-50 border-orange-200';
        return 'text-red-600 bg-red-50 border-red-200';
    };

    return (
        <div className="bg-gray-50 min-h-screen">
            <div className="mb-6">
                <h1 className="text-3xl font-extrabold text-gray-800 tracking-tight">
                    My <span className="text-blue-600">Grades</span>
                </h1>
                <p className="text-gray-500 mt-2">Track your academic performance</p>
            </div>

            {/* Statistics */}
            {stats && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-gradient-to-br from-blue-500 to-blue-700 p-6 rounded-2xl shadow-lg text-white"
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-white text-opacity-80 text-sm font-medium uppercase">Total Grades</p>
                                <p className="text-4xl font-extrabold mt-1">{stats.totalGrades}</p>
                            </div>
                            <FaTrophy className="text-4xl opacity-30" />
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="bg-gradient-to-br from-green-500 to-green-700 p-6 rounded-2xl shadow-lg text-white"
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-white text-opacity-80 text-sm font-medium uppercase">Average</p>
                                <p className="text-4xl font-extrabold mt-1">{stats.averageMarks}%</p>
                            </div>
                            <FaChartLine className="text-4xl opacity-30" />
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="bg-gradient-to-br from-purple-500 to-purple-700 p-6 rounded-2xl shadow-lg text-white"
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-white text-opacity-80 text-sm font-medium uppercase">Subjects</p>
                                <p className="text-4xl font-extrabold mt-1">{Object.keys(stats.subjectWise || {}).length}</p>
                            </div>
                            <FaTrophy className="text-4xl opacity-30" />
                        </div>
                    </motion.div>
                </div>
            )}

            {/* Filter */}
            <div className="mb-6">
                <div className="flex gap-2 flex-wrap">
                    {['All', 'Quiz', 'Assignment', 'Mid-term', 'Final', 'Project'].map((type) => (
                        <button
                            key={type}
                            onClick={() => setFilter(type)}
                            className={`px-4 py-2 rounded-lg font-semibold transition-all ${filter === type
                                ? 'bg-blue-600 text-white shadow-lg'
                                : 'bg-white text-gray-600 hover:bg-gray-100'
                                }`}
                        >
                            {type}
                        </button>
                    ))}
                </div>
            </div>

            {/* Grades List */}
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100 bg-gray-50">
                    <h2 className="text-xl font-bold text-gray-800">Grade History ({filteredGrades.length})</h2>
                </div>

                <div className="p-6">
                    {filteredGrades.length === 0 ? (
                        <div className="text-center py-12">
                            <p className="text-gray-400 text-lg">No grades found.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {filteredGrades.map((grade) => (
                                <div
                                    key={grade._id}
                                    className="p-5 border border-gray-200 rounded-xl hover:shadow-md transition-shadow"
                                >
                                    <div className="flex justify-between items-start mb-3">
                                        <div>
                                            <h3 className="font-bold text-lg text-gray-800">{grade.subject?.name}</h3>
                                            <p className="text-sm text-gray-500">{grade.subject?.code}</p>
                                        </div>
                                        <div className="text-right">
                                            <span className={`text-2xl font-bold px-3 py-1 rounded-lg border ${getGradeColor(grade.grade)}`}>
                                                {grade.grade}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                        <div>
                                            <p className="text-gray-500">Exam Type</p>
                                            <p className="font-semibold text-gray-800">{grade.examType}</p>
                                        </div>
                                        <div>
                                            <p className="text-gray-500">Marks</p>
                                            <p className="font-semibold text-gray-800">{grade.marks}/{grade.totalMarks}</p>
                                        </div>
                                        <div>
                                            <p className="text-gray-500">Percentage</p>
                                            <p className="font-semibold text-gray-800">{((grade.marks / grade.totalMarks) * 100).toFixed(2)}%</p>
                                        </div>
                                        <div>
                                            <p className="text-gray-500">Date</p>
                                            <p className="font-semibold text-gray-800">{new Date(grade.date).toLocaleDateString()}</p>
                                        </div>
                                    </div>

                                    {grade.remarks && (
                                        <div className="mt-3 pt-3 border-t border-gray-200">
                                            <p className="text-sm text-gray-600 italic">"{grade.remarks}"</p>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MyGrades;
