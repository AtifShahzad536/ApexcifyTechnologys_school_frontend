import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    FaUserGraduate,
    FaChartLine,
    FaClipboardCheck,
    FaCalendarCheck,
    FaTrophy,
    FaBook,
    FaExclamationTriangle,
    FaBell,
    FaVideo
} from 'react-icons/fa';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
    Filler
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

const ParentDashboard = () => {
    const [children, setChildren] = useState([]);
    const [loading, setLoading] = useState(true);
    const [meetings, setMeetings] = useState([]);
    const [selectedChild, setSelectedChild] = useState(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));

            // 1. Fetch Children
            const childrenRes = await axios.get(`${import.meta.env.VITE_API_URL}/parents/children`, {
                headers: { Authorization: `Bearer ${userInfo.token}` }
            });

            // 2. Fetch Events (Meetings)
            const eventsRes = await axios.get(`${import.meta.env.VITE_API_URL}/calendar/events`, {
                headers: { Authorization: `Bearer ${userInfo.token}` }
            });
            const upcomingMeetings = eventsRes.data.filter(e =>
                e.type === 'Meeting' &&
                e.isOnline &&
                new Date(e.date) >= new Date(new Date().setHours(0, 0, 0, 0))
            );
            setMeetings(upcomingMeetings);

            // 3. Fetch Stats for Children
            const childrenWithStats = await Promise.all(
                childrenRes.data.map(async (child) => {
                    const stats = await axios.get(
                        `${import.meta.env.VITE_API_URL}/parents/children/${child._id}/stats`,
                        { headers: { Authorization: `Bearer ${userInfo.token}` } }
                    );
                    return { ...child, stats: stats.data };
                })
            );

            setChildren(childrenWithStats);
            setLoading(false);
        } catch (error) {
            console.error(error);
            setLoading(false);
        }
    };

    useEffect(() => {
        if (children.length > 0 && !selectedChild) {
            setSelectedChild(children[0]);
        }
    }, [children]);

    // Calculate overall stats
    const overallStats = children.reduce((acc, child) => {
        return {
            totalChildren: children.length,
            avgAttendance: acc.avgAttendance + (parseFloat(child.stats?.attendance?.percentage) || 0),
            avgGrade: acc.avgGrade + (parseFloat(child.stats?.grades?.average) || 0),
            totalAssignments: acc.totalAssignments + (child.stats?.assignments?.total || 0),
            submittedAssignments: acc.submittedAssignments + (child.stats?.assignments?.submitted || 0)
        };
    }, { totalChildren: 0, avgAttendance: 0, avgGrade: 0, totalAssignments: 0, submittedAssignments: 0 });

    if (children.length > 0) {
        overallStats.avgAttendance = (overallStats.avgAttendance / children.length).toFixed(1);
        overallStats.avgGrade = (overallStats.avgGrade / children.length).toFixed(1);
    }

    // Chart data for selected child
    const attendanceData = {
        labels: ['Present', 'Absent'],
        datasets: [{
            data: [
                selectedChild?.stats?.attendance?.present || 0,
                (selectedChild?.stats?.attendance?.total || 0) - (selectedChild?.stats?.attendance?.present || 0)
            ],
            backgroundColor: ['#10b981', '#ef4444'],
            borderWidth: 0
        }]
    };

    const assignmentData = {
        labels: ['Submitted', 'Pending'],
        datasets: [{
            data: [
                selectedChild?.stats?.assignments?.submitted || 0,
                selectedChild?.stats?.assignments?.pending || 0
            ],
            backgroundColor: ['#3b82f6', '#f59e0b'],
            borderWidth: 0
        }]
    };

    const performanceData = {
        labels: children.map(c => c.name.split(' ')[0]),
        datasets: [{
            label: 'Average Grade',
            data: children.map(c => c.stats?.grades?.average || 0),
            backgroundColor: 'rgba(59, 130, 246, 0.5)',
            borderColor: 'rgb(59, 130, 246)',
            borderWidth: 2,
            borderRadius: 8
        }]
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-xl text-gray-600">Loading...</div>
            </div>
        );
    }

    if (children.length === 0) {
        return (
            <div className="bg-gray-50 min-h-screen">
                <div className="mb-6">
                    <h1 className="text-3xl font-extrabold text-gray-800 tracking-tight">
                        Parent <span className="text-blue-600">Dashboard</span>
                    </h1>
                    <p className="text-gray-500 mt-2">Monitor your children's academic progress</p>
                </div>
                <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-12 text-center">
                    <FaUserGraduate className="text-6xl text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-400 text-lg">No children assigned yet</p>
                    <p className="text-gray-500 text-sm mt-2">Contact admin to assign children to your account</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-gray-50 min-h-screen">
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-3xl font-extrabold text-gray-800 tracking-tight">
                    Parent <span className="text-blue-600">Dashboard</span>
                </h1>
                <p className="text-gray-500 mt-2">Monitor your children's academic progress and performance</p>
            </div>

            {/* Overall Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-xl p-6 text-white"
                >
                    <div className="flex items-center justify-between mb-4">
                        <FaUserGraduate className="text-4xl opacity-80" />
                        <div className="bg-white bg-opacity-20 rounded-lg px-3 py-1">
                            <span className="text-xs font-semibold">Total</span>
                        </div>
                    </div>
                    <h3 className="text-3xl font-bold mb-1">{overallStats.totalChildren}</h3>
                    <p className="text-blue-100 text-sm">Children</p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl shadow-xl p-6 text-white"
                >
                    <div className="flex items-center justify-between mb-4">
                        <FaCalendarCheck className="text-4xl opacity-80" />
                        <div className="bg-white bg-opacity-20 rounded-lg px-3 py-1">
                            <span className="text-xs font-semibold">Avg</span>
                        </div>
                    </div>
                    <h3 className="text-3xl font-bold mb-1">{overallStats.avgAttendance}%</h3>
                    <p className="text-green-100 text-sm">Attendance</p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl shadow-xl p-6 text-white"
                >
                    <div className="flex items-center justify-between mb-4">
                        <FaTrophy className="text-4xl opacity-80" />
                        <div className="bg-white bg-opacity-20 rounded-lg px-3 py-1">
                            <span className="text-xs font-semibold">Avg</span>
                        </div>
                    </div>
                    <h3 className="text-3xl font-bold mb-1">{overallStats.avgGrade}</h3>
                    <p className="text-purple-100 text-sm">Grade Average</p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl shadow-xl p-6 text-white"
                >
                    <div className="flex items-center justify-between mb-4">
                        <FaClipboardCheck className="text-4xl opacity-80" />
                        <div className="bg-white bg-opacity-20 rounded-lg px-3 py-1">
                            <span className="text-xs font-semibold">Total</span>
                        </div>
                    </div>
                    <h3 className="text-3xl font-bold mb-1">{overallStats.submittedAssignments}/{overallStats.totalAssignments}</h3>
                    <p className="text-orange-100 text-sm">Assignments</p>
                </motion.div>
            </div>

            {/* Online Meetings Alert */}
            {meetings.length > 0 && (
                <div className="bg-white rounded-2xl shadow-xl border border-blue-100 p-6 mb-6">
                    <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                        <FaVideo className="mr-2 text-red-500" />
                        Upcoming Online Meetings
                    </h2>
                    <div className="grid gap-4">
                        {meetings.map(meeting => (
                            <div key={meeting._id} className="flex items-center justify-between bg-blue-50 p-4 rounded-xl border border-blue-100">
                                <div>
                                    <h3 className="font-bold text-gray-800">{meeting.title}</h3>
                                    <p className="text-sm text-gray-600">{meeting.description}</p>
                                    <span className="text-xs font-mono bg-white px-2 py-1 rounded border border-blue-200 text-blue-600 mt-1 inline-block">
                                        {new Date(meeting.date).toLocaleDateString()}
                                    </span>
                                </div>
                                <a
                                    href={meeting.meetingLink || '#'}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="px-4 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors text-sm flex items-center shadow-lg shadow-blue-500/30"
                                >
                                    <FaVideo className="mr-2" />
                                    Join Meeting
                                </a>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Child Selector */}
            <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6 mb-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Select Child</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {children.map((child) => (
                        <button
                            key={child._id}
                            onClick={() => setSelectedChild(child)}
                            className={`p-4 rounded-xl border-2 transition-all text-left ${selectedChild?._id === child._id
                                ? 'border-blue-500 bg-blue-50'
                                : 'border-gray-200 hover:border-blue-300 bg-white'
                                }`}
                        >
                            <div className="flex items-center">
                                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mr-3">
                                    <FaUserGraduate className="text-white text-xl" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-800">{child.name}</h3>
                                    <p className="text-xs text-gray-600">
                                        {child.studentClass ?
                                            `${child.studentClass.name} - ${child.studentClass.section}` :
                                            'No class'
                                        }
                                    </p>
                                </div>
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            {selectedChild && (
                <>
                    {/* Charts Row */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                        {/* Attendance Chart */}
                        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6">
                            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                                <FaCalendarCheck className="text-green-600 mr-2" />
                                Attendance Overview
                            </h3>
                            <div className="h-64 flex items-center justify-center">
                                <Doughnut
                                    data={attendanceData}
                                    options={{
                                        responsive: true,
                                        maintainAspectRatio: false,
                                        plugins: {
                                            legend: {
                                                position: 'bottom'
                                            }
                                        }
                                    }}
                                />
                            </div>
                            <div className="mt-4 text-center">
                                <p className="text-2xl font-bold text-green-600">
                                    {selectedChild.stats?.attendance?.percentage || 0}%
                                </p>
                                <p className="text-sm text-gray-600">Overall Attendance</p>
                            </div>
                        </div>

                        {/* Assignment Chart */}
                        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6">
                            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                                <FaClipboardCheck className="text-blue-600 mr-2" />
                                Assignment Status
                            </h3>
                            <div className="h-64 flex items-center justify-center">
                                <Doughnut
                                    data={assignmentData}
                                    options={{
                                        responsive: true,
                                        maintainAspectRatio: false,
                                        plugins: {
                                            legend: {
                                                position: 'bottom'
                                            }
                                        }
                                    }}
                                />
                            </div>
                            <div className="mt-4 text-center">
                                <p className="text-2xl font-bold text-blue-600">
                                    {selectedChild.stats?.assignments?.submitted || 0}/{selectedChild.stats?.assignments?.total || 0}
                                </p>
                                <p className="text-sm text-gray-600">Submitted Assignments</p>
                            </div>
                        </div>

                        {/* Performance Comparison */}
                        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6">
                            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                                <FaChartLine className="text-purple-600 mr-2" />
                                Children Comparison
                            </h3>
                            <div className="h-64">
                                <Bar
                                    data={performanceData}
                                    options={{
                                        responsive: true,
                                        maintainAspectRatio: false,
                                        scales: {
                                            y: {
                                                beginAtZero: true,
                                                max: 100
                                            }
                                        },
                                        plugins: {
                                            legend: {
                                                display: false
                                            }
                                        }
                                    }}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Selected Child Details */}
                    <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center">
                                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mr-4">
                                    <FaUserGraduate className="text-white text-2xl" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-800">{selectedChild.name}</h2>
                                    <p className="text-gray-600">
                                        {selectedChild.studentClass ?
                                            `${selectedChild.studentClass.name} - ${selectedChild.studentClass.section}` :
                                            'No class assigned'
                                        }
                                        {selectedChild.rollNumber && ` • Roll: ${selectedChild.rollNumber}`}
                                    </p>
                                </div>
                            </div>
                            <Link
                                to={`/parent/children/${selectedChild._id}`}
                                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold flex items-center gap-2"
                            >
                                <FaBook />
                                View Full Details
                            </Link>
                        </div>

                        {/* Quick Stats Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 border border-green-200">
                                <div className="flex items-center justify-between mb-2">
                                    <FaCalendarCheck className="text-green-600 text-2xl" />
                                    <span className="text-xs font-semibold text-green-700 bg-green-200 px-2 py-1 rounded">
                                        Attendance
                                    </span>
                                </div>
                                <p className="text-3xl font-bold text-green-700 mb-1">
                                    {selectedChild.stats?.attendance?.percentage || 0}%
                                </p>
                                <p className="text-sm text-green-600">
                                    {selectedChild.stats?.attendance?.present || 0} / {selectedChild.stats?.attendance?.total || 0} days
                                </p>
                            </div>

                            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200">
                                <div className="flex items-center justify-between mb-2">
                                    <FaTrophy className="text-blue-600 text-2xl" />
                                    <span className="text-xs font-semibold text-blue-700 bg-blue-200 px-2 py-1 rounded">
                                        Grades
                                    </span>
                                </div>
                                <p className="text-3xl font-bold text-blue-700 mb-1">
                                    {selectedChild.stats?.grades?.average || 0}
                                </p>
                                <p className="text-sm text-blue-600">
                                    Average from {selectedChild.stats?.grades?.total || 0} grades
                                </p>
                            </div>

                            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 border border-purple-200">
                                <div className="flex items-center justify-between mb-2">
                                    <FaClipboardCheck className="text-purple-600 text-2xl" />
                                    <span className="text-xs font-semibold text-purple-700 bg-purple-200 px-2 py-1 rounded">
                                        Assignments
                                    </span>
                                </div>
                                <p className="text-3xl font-bold text-purple-700 mb-1">
                                    {selectedChild.stats?.assignments?.submitted || 0}/{selectedChild.stats?.assignments?.total || 0}
                                </p>
                                <p className="text-sm text-purple-600">
                                    {selectedChild.stats?.assignments?.pending || 0} pending
                                </p>
                            </div>
                        </div>

                        {/* Alerts */}
                        {(selectedChild.stats?.attendance?.percentage < 75 || selectedChild.stats?.assignments?.pending > 3) && (
                            <div className="mt-6 bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-lg">
                                <div className="flex items-center">
                                    <FaExclamationTriangle className="text-yellow-600 text-xl mr-3" />
                                    <div>
                                        <h4 className="font-bold text-yellow-800">Attention Required</h4>
                                        <ul className="text-sm text-yellow-700 mt-1 list-disc list-inside">
                                            {selectedChild.stats?.attendance?.percentage < 75 && (
                                                <li>Attendance is below 75% - Please ensure regular attendance</li>
                                            )}
                                            {selectedChild.stats?.assignments?.pending > 3 && (
                                                <li>{selectedChild.stats?.assignments?.pending} assignments pending - Encourage completion</li>
                                            )}
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
};

export default ParentDashboard;
