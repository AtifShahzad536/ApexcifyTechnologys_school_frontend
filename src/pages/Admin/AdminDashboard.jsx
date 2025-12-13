import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import {
    FaUserGraduate,
    FaChalkboardTeacher,
    FaBook,
    FaChalkboard,
    FaUserClock,
    FaPlus,
    FaUserPlus,
    FaCalendarCheck,
    FaClipboardList
} from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
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
    Legend
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend
);

const AdminDashboard = () => {
    const navigate = useNavigate();
    const [stats, setStats] = useState({
        students: 0,
        teachers: 0,
        classes: 0,
        subjects: 0,
        pendingApprovals: 0
    });
    const [classData, setClassData] = useState([]);
    const [roleData, setRoleData] = useState({ students: 0, teachers: 0, parents: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            setLoading(true);
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            const headers = userInfo?.token ? { Authorization: `Bearer ${userInfo.token}` } : {};

            const [studentsRes, teachersRes, classesRes, subjectsRes, approvalsRes, parentsRes] = await Promise.all([
                axios.get(`${import.meta.env.VITE_API_URL}/students`, { headers }),
                axios.get(`${import.meta.env.VITE_API_URL}/teachers`, { headers }),
                axios.get(`${import.meta.env.VITE_API_URL}/classes`, { headers }),
                axios.get(`${import.meta.env.VITE_API_URL}/subjects`, { headers }),
                axios.get(`${import.meta.env.VITE_API_URL}/approvals/pending`, { headers }).catch(() => ({ data: [] })),
                axios.get(`${import.meta.env.VITE_API_URL}/parents`, { headers }).catch(() => ({ data: [] }))
            ]);

            const students = studentsRes.data;
            const teachers = teachersRes.data;
            const classes = classesRes.data;
            const subjects = subjectsRes.data;
            const pendingApprovals = approvalsRes.data;
            const parents = parentsRes.data;

            setStats({
                students: students.length,
                teachers: teachers.length,
                classes: classes.length,
                subjects: subjects.length,
                pendingApprovals: pendingApprovals.length
            });

            // Calculate Class Distribution
            const classDistribution = classes.map(cls => ({
                name: `${cls.name}-${cls.section}`,
                count: students.filter(s => s.studentClass?._id === cls._id).length
            }));
            setClassData(classDistribution);

            // Calculate Role Distribution
            setRoleData({
                students: students.length,
                teachers: teachers.length,
                parents: parents.length
            });
            setLoading(false);
        } catch (error) {
            console.error(error);
            setLoading(false);
        }
    };

    // Chart Data
    const classDistributionData = {
        labels: classData.map(c => c.name),
        datasets: [{
            label: 'Students',
            data: classData.map(c => c.count),
            backgroundColor: 'rgba(59, 130, 246, 0.8)',
            borderRadius: 6,
            barThickness: 30,
        }]
    };

    const roleDistributionData = {
        labels: ['Students', 'Teachers', 'Parents'],
        datasets: [{
            data: [roleData.students, roleData.teachers, roleData.parents],
            backgroundColor: [
                'rgba(59, 130, 246, 0.8)',
                'rgba(16, 185, 129, 0.8)',
                'rgba(245, 158, 11, 0.8)',
            ],
            borderWidth: 0,
            hoverOffset: 4
        }]
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1
        }
    };

    const QuickActionCard = ({ title, icon: Icon, color, onClick }) => (
        <button
            onClick={onClick}
            className="flex flex-col items-center justify-center p-6 bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all transform hover:-translate-y-1 group"
        >
            <div className={`p-4 rounded-full ${color} text-white mb-3 group-hover:scale-110 transition-transform`}>
                <Icon className="text-xl" />
            </div>
            <span className="font-semibold text-gray-700">{title}</span>
        </button>
    );

    return (
        <div className="min-h-screen bg-gray-50/50 p-6 md:p-8">
            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="max-w-7xl mx-auto space-y-8"
            >
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-extrabold text-gray-800 tracking-tight">
                            Admin <span className="text-blue-600">Dashboard</span>
                        </h1>
                        <p className="text-gray-500 mt-1">
                            {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-100 flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                            <span className="text-sm font-medium text-gray-600">System Online</span>
                        </div>
                    </div>
                </div>

                {/* KPI Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    <motion.div variants={itemVariants} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between hover:shadow-md transition-shadow">
                        <div>
                            <p className="text-sm font-medium text-gray-500">Total Students</p>
                            <h3 className="text-3xl font-bold text-gray-800 mt-1">{stats.students}</h3>
                        </div>
                        <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                            <FaUserGraduate className="text-2xl" />
                        </div>
                    </motion.div>

                    <motion.div variants={itemVariants} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between hover:shadow-md transition-shadow">
                        <div>
                            <p className="text-sm font-medium text-gray-500">Total Teachers</p>
                            <h3 className="text-3xl font-bold text-gray-800 mt-1">{stats.teachers}</h3>
                        </div>
                        <div className="p-3 bg-green-50 text-green-600 rounded-xl">
                            <FaChalkboardTeacher className="text-2xl" />
                        </div>
                    </motion.div>

                    <motion.div variants={itemVariants} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between hover:shadow-md transition-shadow">
                        <div>
                            <p className="text-sm font-medium text-gray-500">Courses</p>
                            <h3 className="text-3xl font-bold text-gray-800 mt-1">{stats.subjects}</h3>
                        </div>
                        <div className="p-3 bg-orange-50 text-orange-600 rounded-xl">
                            <FaBook className="text-2xl" />
                        </div>
                    </motion.div>

                    <motion.div variants={itemVariants} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between hover:shadow-md transition-shadow">
                        <div>
                            <p className="text-sm font-medium text-gray-500">Pending Approvals</p>
                            <h3 className="text-3xl font-bold text-gray-800 mt-1">{stats.pendingApprovals}</h3>
                        </div>
                        <div className="p-3 bg-red-50 text-red-600 rounded-xl">
                            <FaUserClock className="text-2xl" />
                        </div>
                    </motion.div>
                </div>

                {/* Quick Actions */}
                <motion.div variants={itemVariants}>
                    <h2 className="text-lg font-bold text-gray-800 mb-4">Quick Actions</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <QuickActionCard
                            title="Add Student"
                            icon={FaUserPlus}
                            color="bg-blue-500"
                            onClick={() => navigate('/admin/students')}
                        />
                        <QuickActionCard
                            title="Add Teacher"
                            icon={FaUserPlus}
                            color="bg-green-500"
                            onClick={() => navigate('/admin/teachers')}
                        />
                        <QuickActionCard
                            title="Create Class"
                            icon={FaChalkboard}
                            color="bg-purple-500"
                            onClick={() => navigate('/admin/classes')}
                        />
                        <QuickActionCard
                            title="Leave Requests"
                            icon={FaCalendarCheck}
                            color="bg-red-500"
                            onClick={() => navigate('/admin/leaves')}
                        />
                    </div>
                </motion.div>

                {/* Charts Section */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Bar Chart */}
                    <motion.div variants={itemVariants} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 lg:col-span-2">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-lg font-bold text-gray-800">Student Distribution</h2>
                            <FaClipboardList className="text-gray-400" />
                        </div>
                        <div className="h-72">
                            {classData.length > 0 ? (
                                <Bar
                                    data={classDistributionData}
                                    options={{
                                        responsive: true,
                                        maintainAspectRatio: false,
                                        plugins: { legend: { display: false } },
                                        scales: {
                                            y: { beginAtZero: true, grid: { borderDash: [2, 4] } },
                                            x: { grid: { display: false } }
                                        }
                                    }}
                                />
                            ) : (
                                <div className="flex h-full items-center justify-center text-gray-400">Loading chart data...</div>
                            )}
                        </div>
                    </motion.div>

                    {/* Donut Chart */}
                    <motion.div variants={itemVariants} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-lg font-bold text-gray-800">User Demographics</h2>
                        </div>
                        <div className="h-64 flex justify-center">
                            <Doughnut
                                data={roleDistributionData}
                                options={{
                                    responsive: true,
                                    maintainAspectRatio: false,
                                    plugins: {
                                        legend: { position: 'bottom', labels: { usePointStyle: true, padding: 20 } }
                                    },
                                    cutout: '70%'
                                }}
                            />
                        </div>
                    </motion.div>
                </div>
            </motion.div>
        </div>
    );
};

export default AdminDashboard;
