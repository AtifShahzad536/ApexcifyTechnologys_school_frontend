import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { FaUserGraduate, FaChalkboardTeacher, FaBook, FaChalkboard, FaUserClock } from 'react-icons/fa';
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
    const [stats, setStats] = useState({
        students: 0,
        teachers: 0,
        classes: 0,
        subjects: 0,
        pendingApprovals: 0
    });
    const [classData, setClassData] = useState([]);
    const [roleData, setRoleData] = useState({ students: 0, teachers: 0, parents: 0 });

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            const headers = userInfo?.token ? { Authorization: `Bearer ${userInfo.token}` } : {};

            const [studentsRes, teachersRes, classesRes, subjectsRes, approvalsRes, parentsRes] = await Promise.all([
                axios.get(`${import.meta.env.VITE_API_URL}/students`),
                axios.get(`${import.meta.env.VITE_API_URL}/teachers`),
                axios.get(`${import.meta.env.VITE_API_URL}/classes`),
                axios.get(`${import.meta.env.VITE_API_URL}/subjects`),
                axios.get(`${import.meta.env.VITE_API_URL}/approvals/pending`, { headers }).catch(() => ({ data: [] })),
                axios.get(`${import.meta.env.VITE_API_URL}/parents`).catch(() => ({ data: [] }))
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
                name: `${cls.name} - ${cls.section}`,
                count: students.filter(s => s.studentClass?._id === cls._id).length
            }));
            setClassData(classDistribution);

            // Calculate Role Distribution
            setRoleData({
                students: students.length,
                teachers: teachers.length,
                parents: parents.length
            });
        } catch (error) {
            console.error(error);
        }
    };

    // Chart Data - Real data from database
    const classDistributionData = {
        labels: classData.map(c => c.name),
        datasets: [{
            label: 'Students per Class',
            data: classData.map(c => c.count),
            backgroundColor: [
                'rgba(59, 130, 246, 0.7)',
                'rgba(16, 185, 129, 0.7)',
                'rgba(245, 158, 11, 0.7)',
                'rgba(239, 68, 68, 0.7)',
                'rgba(139, 92, 246, 0.7)',
                'rgba(236, 72, 153, 0.7)',
            ],
            borderColor: [
                'rgb(59, 130, 246)',
                'rgb(16, 185, 129)',
                'rgb(245, 158, 11)',
                'rgb(239, 68, 68)',
                'rgb(139, 92, 246)',
                'rgb(236, 72, 153)',
            ],
            borderWidth: 2,
            borderRadius: 8
        }]
    };

    const roleDistributionData = {
        labels: ['Students', 'Teachers', 'Parents'],
        datasets: [{
            data: [roleData.students, roleData.teachers, roleData.parents],
            backgroundColor: [
                'rgba(59, 130, 246, 0.7)',
                'rgba(16, 185, 129, 0.7)',
                'rgba(245, 158, 11, 0.7)',
            ],
            borderColor: [
                'rgb(59, 130, 246)',
                'rgb(16, 185, 129)',
                'rgb(245, 158, 11)',
            ],
            borderWidth: 2
        }]
    };

    return (
        <div className="bg-gray-50 min-h-screen">
            <div className="mb-6">
                <h1 className="text-3xl font-extrabold text-gray-800 tracking-tight">
                    Admin <span className="text-blue-600">Dashboard</span>
                </h1>
                <p className="text-gray-500 mt-2">Overview of your school management system</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-xl p-6 text-white"
                >
                    <FaUserGraduate className="text-4xl mb-3 opacity-80" />
                    <h3 className="text-3xl font-bold mb-1">{stats.students}</h3>
                    <p className="text-blue-100 text-sm">Total Students</p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl shadow-xl p-6 text-white"
                >
                    <FaChalkboardTeacher className="text-4xl mb-3 opacity-80" />
                    <h3 className="text-3xl font-bold mb-1">{stats.teachers}</h3>
                    <p className="text-green-100 text-sm">Total Teachers</p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl shadow-xl p-6 text-white"
                >
                    <FaChalkboard className="text-4xl mb-3 opacity-80" />
                    <h3 className="text-3xl font-bold mb-1">{stats.classes}</h3>
                    <p className="text-purple-100 text-sm">Total Classes</p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl shadow-xl p-6 text-white"
                >
                    <FaBook className="text-4xl mb-3 opacity-80" />
                    <h3 className="text-3xl font-bold mb-1">{stats.subjects}</h3>
                    <p className="text-orange-100 text-sm">Total Subjects</p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="bg-gradient-to-br from-red-500 to-red-600 rounded-2xl shadow-xl p-6 text-white"
                >
                    <FaUserClock className="text-4xl mb-3 opacity-80" />
                    <h3 className="text-3xl font-bold mb-1">{stats.pendingApprovals}</h3>
                    <p className="text-red-100 text-sm">Pending Approvals</p>
                </motion.div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Class Distribution */}
                <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6">
                    <h2 className="text-xl font-bold text-gray-800 mb-4">Students per Class</h2>
                    <div className="h-80">
                        {classData.length > 0 ? (
                            <Bar
                                data={classDistributionData}
                                options={{
                                    responsive: true,
                                    maintainAspectRatio: false,
                                    plugins: {
                                        legend: {
                                            display: false
                                        }
                                    },
                                    scales: {
                                        y: {
                                            beginAtZero: true,
                                            ticks: {
                                                stepSize: 1
                                            }
                                        }
                                    }
                                }}
                            />
                        ) : (
                            <div className="flex items-center justify-center h-full text-gray-400">
                                No class data available
                            </div>
                        )}
                    </div>
                </div>

                {/* Role Distribution */}
                <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6">
                    <h2 className="text-xl font-bold text-gray-800 mb-4">User Distribution by Role</h2>
                    <div className="h-80 flex items-center justify-center">
                        <Doughnut
                            data={roleDistributionData}
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
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
