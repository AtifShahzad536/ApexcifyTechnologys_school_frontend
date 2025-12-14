import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { FaCalendarAlt, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import { useSelector } from 'react-redux';

const MyAttendance = () => {
    const { userInfo } = useSelector((state) => state.auth);
    const [attendance, setAttendance] = useState([]);
    const [stats, setStats] = useState(null);

    useEffect(() => {
        if (userInfo?._id) {
            fetchAttendance();
            fetchStats();
        }
    }, [userInfo]);

    const fetchAttendance = async () => {
        try {
            const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/attendance/student/${userInfo._id}`, {
                headers: { Authorization: `Bearer ${userInfo.token}` }
            });
            setAttendance(data);
        } catch (error) {
            console.error(error);
        }
    };

    const fetchStats = async () => {
        try {
            const { data } = await axios.get(`http://localhost:5000/api/attendance/student/${userInfo._id}/stats`, {
                headers: { Authorization: `Bearer ${userInfo.token}` }
            });
            setStats(data);
        } catch (error) {
            console.error(error);
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'Present':
                return <FaCheckCircle className="text-green-500" />;
            case 'Absent':
                return <FaTimesCircle className="text-red-500" />;
            case 'Late':
                return <FaClock className="text-yellow-500" />;
            case 'Excused':
                return <FaCheckCircle className="text-blue-500" />;
            default:
                return null;
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Present':
                return 'bg-green-50 text-green-700 border-green-200';
            case 'Absent':
                return 'bg-red-50 text-red-700 border-red-200';
            case 'Late':
                return 'bg-yellow-50 text-yellow-700 border-yellow-200';
            case 'Excused':
                return 'bg-blue-50 text-blue-700 border-blue-200';
            default:
                return 'bg-gray-50 text-gray-700 border-gray-200';
        }
    };

    return (
        <div className="bg-gray-50 min-h-screen">
            <div className="mb-6">
                <h1 className="text-3xl font-extrabold text-gray-800 tracking-tight">
                    My <span className="text-blue-600">Attendance</span>
                </h1>
                <p className="text-gray-500 mt-2">Track your attendance record</p>
            </div>

            {/* Statistics */}
            {stats && (
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white p-5 rounded-2xl shadow-lg border border-gray-100"
                    >
                        <p className="text-sm text-gray-500 mb-1">Total Days</p>
                        <p className="text-3xl font-bold text-gray-800">{stats.total}</p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="bg-gradient-to-br from-green-500 to-green-700 p-5 rounded-2xl shadow-lg text-white"
                    >
                        <p className="text-sm text-white text-opacity-80 mb-1">Present</p>
                        <p className="text-3xl font-bold">{stats.present}</p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="bg-gradient-to-br from-red-500 to-red-700 p-5 rounded-2xl shadow-lg text-white"
                    >
                        <p className="text-sm text-white text-opacity-80 mb-1">Absent</p>
                        <p className="text-3xl font-bold">{stats.absent}</p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="bg-gradient-to-br from-yellow-500 to-yellow-700 p-5 rounded-2xl shadow-lg text-white"
                    >
                        <p className="text-sm text-white text-opacity-80 mb-1">Late</p>
                        <p className="text-3xl font-bold">{stats.late}</p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="bg-gradient-to-br from-blue-500 to-blue-700 p-5 rounded-2xl shadow-lg text-white"
                    >
                        <p className="text-sm text-white text-opacity-80 mb-1">Percentage</p>
                        <p className="text-3xl font-bold">{stats.percentage}%</p>
                    </motion.div>
                </div>
            )}

            {/* Attendance List */}
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100 bg-gray-50 flex items-center gap-2">
                    <FaCalendarAlt className="text-blue-500" />
                    <h2 className="text-xl font-bold text-gray-800">Attendance History ({attendance.length})</h2>
                </div>

                <div className="p-6">
                    {attendance.length === 0 ? (
                        <div className="text-center py-12">
                            <p className="text-gray-400 text-lg">No attendance records found.</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {attendance.map((record) => (
                                <div
                                    key={record._id}
                                    className="p-4 border border-gray-200 rounded-xl hover:shadow-md transition-shadow flex items-center justify-between"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="text-2xl">
                                            {getStatusIcon(record.status)}
                                        </div>
                                        <div>
                                            <p className="font-semibold text-gray-800">{record.subject?.name || 'General'}</p>
                                            <p className="text-sm text-gray-500">
                                                {new Date(record.date).toLocaleDateString('en-US', {
                                                    weekday: 'long',
                                                    year: 'numeric',
                                                    month: 'long',
                                                    day: 'numeric'
                                                })}
                                            </p>
                                        </div>
                                    </div>
                                    <div>
                                        <span className={`px-4 py-2 rounded-lg font-semibold text-sm border ${getStatusColor(record.status)}`}>
                                            {record.status}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MyAttendance;
