import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { FaFileAlt, FaSearch, FaDownload, FaFilter, FaChartBar, FaFileDownload } from 'react-icons/fa';
import toast from 'react-hot-toast';
import { Bar } from 'react-chartjs-2';

const AttendanceReports = () => {
    const [students, setStudents] = useState([]);
    const [classes, setClasses] = useState([]);
    const [selectedClass, setSelectedClass] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchClasses();
    }, []);

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

    const fetchReport = async () => {
        setLoading(true);
        try {
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            const params = new URLSearchParams();
            if (selectedClass) params.append('classId', selectedClass);
            if (startDate) params.append('startDate', startDate);
            if (endDate) params.append('endDate', endDate);

            const { data } = await axios.get(
                `${import.meta.env.VITE_API_URL}/attendance/reports/all-students?${params.toString()}`,
                {
                    headers: {
                        Authorization: `Bearer ${userInfo.token}`
                    }
                }
            );
            setStudents(data);
            setLoading(false);
        } catch (error) {
            console.error(error);
            toast.error('Error fetching report');
            setLoading(false);
        }
    };

    const exportToCSV = () => {
        const headers = ['Name', 'Roll Number', 'Class', 'Total Days', 'Present', 'Absent', 'Late', 'Percentage'];
        const rows = students.map(s => [
            s.name,
            s.rollNumber || 'N/A',
            s.class ? `${s.class.name} - ${s.class.section}` : 'N/A',
            s.attendance.total,
            s.attendance.present,
            s.attendance.absent,
            s.attendance.late,
            `${s.attendance.percentage}%`
        ]);

        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `attendance-report-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
    };

    const chartData = {
        labels: students.slice(0, 10).map(s => s.name.split(' ')[0]),
        datasets: [{
            label: 'Attendance %',
            data: students.slice(0, 10).map(s => s.attendance.percentage),
            backgroundColor: students.slice(0, 10).map(s =>
                s.attendance.percentage >= 75 ? 'rgba(34, 197, 94, 0.7)' : 'rgba(239, 68, 68, 0.7)'
            ),
            borderColor: students.slice(0, 10).map(s =>
                s.attendance.percentage >= 75 ? 'rgb(34, 197, 94)' : 'rgb(239, 68, 68)'
            ),
            borderWidth: 2,
            borderRadius: 8
        }]
    };

    return (
        <div className="bg-gray-50 min-h-screen">
            <div className="mb-6">
                <h1 className="text-3xl font-extrabold text-gray-800 tracking-tight">
                    Attendance <span className="text-blue-600">Reports</span>
                </h1>
                <p className="text-gray-500 mt-2">View and export student attendance statistics</p>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6 mb-6">
                <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                    <FaFilter className="mr-2 text-blue-600" />
                    Filters
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                        <label className="block text-sm font-semibold text-gray-600 mb-2">Class</label>
                        <select
                            value={selectedClass}
                            onChange={(e) => setSelectedClass(e.target.value)}
                            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 outline-none text-base"
                        >
                            <option value="">All Classes</option>
                            {classes.map((cls) => (
                                <option key={cls._id} value={cls._id}>
                                    {cls.name} - {cls.section}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-gray-600 mb-2">Start Date</label>
                        <input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 outline-none text-base"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-gray-600 mb-2">End Date</label>
                        <input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 outline-none text-base"
                        />
                    </div>
                    <div className="flex items-end">
                        <button
                            onClick={fetchReport}
                            disabled={loading}
                            className="w-full bg-blue-600 text-white font-semibold py-2.5 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                        >
                            {loading ? 'Loading...' : 'Generate Report'}
                        </button>
                    </div>
                </div>
            </div>

            {students.length > 0 && (
                <>
                    {/* Chart */}
                    <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-4 md:p-6 mb-6">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-lg font-bold text-gray-800 flex items-center">
                                <FaChartBar className="mr-2 text-blue-600" />
                                Top 10 Students (Sorted by Attendance %)
                            </h2>
                        </div>
                        <div className="h-64 md:h-80">
                            <Bar
                                data={chartData}
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

                    {/* Table / List View */}
                    <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
                        <div className="p-4 md:p-6 border-b border-gray-200 flex flex-col md:flex-row justify-between items-center gap-4">
                            <h2 className="text-lg font-bold text-gray-800">
                                Student Attendance ({students.length} students)
                            </h2>
                            <button
                                onClick={exportToCSV}
                                className="w-full md:w-auto bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2 font-semibold"
                            >
                                <FaFileDownload />
                                Export CSV
                            </button>
                        </div>

                        {/* Mobile Card View */}
                        <div className="md:hidden p-4 space-y-4">
                            {students.map((student) => (
                                <div key={student._id} className="bg-gray-50 p-4 rounded-xl border border-gray-200 shadow-sm">
                                    <div className="flex justify-between items-start mb-3">
                                        <div>
                                            <h3 className="font-bold text-gray-800 text-lg">{student.name}</h3>
                                            <p className="text-xs text-gray-500">Roll: {student.rollNumber || 'N/A'}</p>
                                        </div>
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${student.attendance.percentage >= 75 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                            }`}>
                                            {student.attendance.percentage}%
                                        </span>
                                    </div>

                                    <div className="grid grid-cols-2 gap-2 text-sm text-gray-700 mb-3">
                                        <div className="bg-white p-2 rounded border border-gray-100">
                                            <span className="text-xs text-gray-500 block">Class</span>
                                            <span className="font-semibold">{student.class ? `${student.class.name}-${student.class.section}` : 'N/A'}</span>
                                        </div>
                                        <div className="bg-white p-2 rounded border border-gray-100">
                                            <span className="text-xs text-gray-500 block">Total Days</span>
                                            <span className="font-semibold">{student.attendance.total}</span>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-3 gap-2 text-center text-xs font-bold">
                                        <div className="bg-green-50 text-green-700 p-2 rounded">
                                            Present: {student.attendance.present}
                                        </div>
                                        <div className="bg-red-50 text-red-700 p-2 rounded">
                                            Absent: {student.attendance.absent}
                                        </div>
                                        <div className="bg-yellow-50 text-yellow-700 p-2 rounded">
                                            Late: {student.attendance.late}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Desktop Table View */}
                        <div className="hidden md:block overflow-x-auto">
                            <table className="min-w-full">
                                <thead className="bg-blue-50">
                                    <tr>
                                        <th className="py-3 px-4 text-left text-xs font-bold text-blue-800 uppercase">Name</th>
                                        <th className="py-3 px-4 text-left text-xs font-bold text-blue-800 uppercase">Roll</th>
                                        <th className="py-3 px-4 text-left text-xs font-bold text-blue-800 uppercase">Class</th>
                                        <th className="py-3 px-4 text-left text-xs font-bold text-blue-800 uppercase">Total</th>
                                        <th className="py-3 px-4 text-left text-xs font-bold text-blue-800 uppercase">Present</th>
                                        <th className="py-3 px-4 text-left text-xs font-bold text-blue-800 uppercase">Absent</th>
                                        <th className="py-3 px-4 text-left text-xs font-bold text-blue-800 uppercase">Late</th>
                                        <th className="py-3 px-4 text-left text-xs font-bold text-blue-800 uppercase">%</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {students.map((student) => (
                                        <tr key={student._id} className="hover:bg-blue-50/50">
                                            <td className="py-3 px-4 font-semibold text-gray-800">{student.name}</td>
                                            <td className="py-3 px-4 text-gray-700">{student.rollNumber || 'N/A'}</td>
                                            <td className="py-3 px-4 text-gray-700">
                                                {student.class ? `${student.class.name} - ${student.class.section}` : 'N/A'}
                                            </td>
                                            <td className="py-3 px-4 text-gray-700">{student.attendance.total}</td>
                                            <td className="py-3 px-4 text-green-700 font-semibold">{student.attendance.present}</td>
                                            <td className="py-3 px-4 text-red-700 font-semibold">{student.attendance.absent}</td>
                                            <td className="py-3 px-4 text-yellow-700 font-semibold">{student.attendance.late}</td>
                                            <td className="py-3 px-4">
                                                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${student.attendance.percentage >= 90 ? 'bg-green-100 text-green-700' :
                                                    student.attendance.percentage >= 75 ? 'bg-blue-100 text-blue-700' :
                                                        student.attendance.percentage >= 60 ? 'bg-yellow-100 text-yellow-700' :
                                                            'bg-red-100 text-red-700'
                                                    }`}>
                                                    {student.attendance.percentage}%
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </>
            )}

            {students.length === 0 && !loading && (
                <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-12 text-center">
                    <p className="text-gray-400 text-lg">Click "Generate Report" to view attendance statistics</p>
                </div>
            )}
        </div>
    );
};

export default AttendanceReports;
