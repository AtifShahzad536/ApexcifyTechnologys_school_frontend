import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { FaTrophy, FaUserCheck, FaClipboardList, FaBook } from 'react-icons/fa';
import { useSelector } from 'react-redux';
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
    Legend,
    Filler
);

const StudentDashboard = () => {
    const { userInfo } = useSelector((state) => state.auth);
    const [stats, setStats] = useState({
        attendance: 0,
        totalSubjects: 0,
        avgGrade: 0,
        totalAssignments: 0
    });
    const [subjectGrades, setSubjectGrades] = useState([]);
    const [attendanceData, setAttendanceData] = useState({ present: 0, absent: 0, late: 0 });

    useEffect(() => {
        if (userInfo?._id) {
            fetchStats();
        }
    }, [userInfo]);

    const fetchStats = async () => {
        try {
            const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };

            const [attendanceRes, gradesRes, subjectsRes, assignmentsRes] = await Promise.all([
                axios.get(`${import.meta.env.VITE_API_URL}/attendance/student/${userInfo._id}/stats`, config).catch(() => ({ data: { percentage: 0, present: 0, absent: 0, late: 0, total: 0 } })),
                axios.get(`${import.meta.env.VITE_API_URL}/grades/student/${userInfo._id}/stats`, config).catch(() => ({ data: { averageMarks: 0 } })),
                axios.get(`${import.meta.env.VITE_API_URL}/subjects`, config).catch(() => ({ data: [] })),
                axios.get(`${import.meta.env.VITE_API_URL}/assignments`, config).catch(() => ({ data: [] }))
            ]);

            // Get student's grades by subject
            const studentGrades = await axios.get(`${import.meta.env.VITE_API_URL}/grades/student/${userInfo._id}`, config).catch(() => ({ data: [] }));

            // Group grades by subject
            const gradesBySubject = {};
            studentGrades.data.forEach(grade => {
                const subjectName = grade.subject?.name || 'Unknown';
                if (!gradesBySubject[subjectName]) {
                    gradesBySubject[subjectName] = [];
                }
                gradesBySubject[subjectName].push(grade.percentage);
            });

            // Calculate average per subject
            const subjectAverages = Object.keys(gradesBySubject).map(subject => ({
                name: subject,
                average: parseFloat((gradesBySubject[subject].reduce((a, b) => a + b, 0) / gradesBySubject[subject].length).toFixed(2))
            }));

            setStats({
                attendance: parseFloat(attendanceRes.data.percentage) || 0,
                totalSubjects: subjectsRes.data.length,
                avgGrade: parseFloat(gradesRes.data.averageMarks) || 0,
                totalAssignments: assignmentsRes.data.length
            });

            setSubjectGrades(subjectAverages);
            setAttendanceData({
                present: attendanceRes.data.present || 0,
                absent: attendanceRes.data.absent || 0,
                late: attendanceRes.data.late || 0
            });
        } catch (error) {
            console.error(error);
        }
    };

    // Chart Data - Real data
    const subjectPerformanceData = {
        labels: subjectGrades.map(s => s.name),
        datasets: [{
            label: 'Average Grade (%)',
            data: subjectGrades.map(s => s.average),
            backgroundColor: 'rgba(59, 130, 246, 0.7)',
            borderColor: 'rgb(59, 130, 246)',
            borderWidth: 2,
            borderRadius: 8
        }]
    };

    const attendanceChartData = {
        labels: ['Present', 'Absent', 'Late'],
        datasets: [{
            data: [attendanceData.present, attendanceData.absent, attendanceData.late],
            backgroundColor: [
                'rgba(16, 185, 129, 0.7)',
                'rgba(239, 68, 68, 0.7)',
                'rgba(245, 158, 11, 0.7)'
            ],
            borderColor: [
                'rgb(16, 185, 129)',
                'rgb(239, 68, 68)',
                'rgb(245, 158, 11)'
            ],
            borderWidth: 2
        }]
    };

    return (
        <div className="bg-gray-50 min-h-screen">
            <div className="mb-6">
                <h1 className="text-3xl font-extrabold text-gray-800 tracking-tight">
                    Student <span className="text-blue-600">Dashboard</span>
                </h1>
                <p className="text-gray-500 mt-2">Welcome back, {userInfo?.name}!</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl shadow-xl p-6 text-white"
                >
                    <FaUserCheck className="text-4xl mb-3 opacity-80" />
                    <h3 className="text-3xl font-bold mb-1">{stats.attendance}%</h3>
                    <p className="text-green-100 text-sm">Attendance</p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-xl p-6 text-white"
                >
                    <FaTrophy className="text-4xl mb-3 opacity-80" />
                    <h3 className="text-3xl font-bold mb-1">{stats.avgGrade}</h3>
                    <p className="text-blue-100 text-sm">Average Grade</p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl shadow-xl p-6 text-white"
                >
                    <FaBook className="text-4xl mb-3 opacity-80" />
                    <h3 className="text-3xl font-bold mb-1">{stats.totalSubjects}</h3>
                    <p className="text-purple-100 text-sm">Total Subjects</p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl shadow-xl p-6 text-white"
                >
                    <FaClipboardList className="text-4xl mb-3 opacity-80" />
                    <h3 className="text-3xl font-bold mb-1">{stats.totalAssignments}</h3>
                    <p className="text-orange-100 text-sm">Total Assignments</p>
                </motion.div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Subject Performance */}
                <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6">
                    <h2 className="text-xl font-bold text-gray-800 mb-4">Subject-wise Performance</h2>
                    <div className="h-80">
                        {subjectGrades.length > 0 ? (
                            <Bar
                                data={subjectPerformanceData}
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
                                            max: 100
                                        }
                                    }
                                }}
                            />
                        ) : (
                            <div className="flex items-center justify-center h-full text-gray-400">
                                No grade data available
                            </div>
                        )}
                    </div>
                </div>

                {/* Attendance Breakdown */}
                <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6">
                    <h2 className="text-xl font-bold text-gray-800 mb-4">Attendance Breakdown</h2>
                    <div className="h-80 flex items-center justify-center">
                        {(attendanceData.present + attendanceData.absent + attendanceData.late) > 0 ? (
                            <Doughnut
                                data={attendanceChartData}
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
                        ) : (
                            <div className="text-gray-400">
                                No attendance data available
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StudentDashboard;
