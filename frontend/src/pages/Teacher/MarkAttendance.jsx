import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { FaUserCheck, FaUserTimes, FaClock, FaCheckCircle } from 'react-icons/fa';
import toast from 'react-hot-toast';
import { useSelector } from 'react-redux';

const MarkAttendance = () => {
    const { userInfo } = useSelector((state) => state.auth);
    const [classes, setClasses] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [students, setStudents] = useState([]);

    const [selectedClass, setSelectedClass] = useState('');
    const [selectedSubject, setSelectedSubject] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [attendanceData, setAttendanceData] = useState({});

    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        fetchClasses();
        fetchSubjects();
    }, []);

    useEffect(() => {
        if (selectedClass) {
            fetchStudents();
        }
    }, [selectedClass]);

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

    const fetchStudents = async () => {
        try {
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/students`, {
                headers: { Authorization: `Bearer ${userInfo.token}` }
            });
            const classStudents = data.filter(s => s.studentClass?._id === selectedClass);
            setStudents(classStudents);

            // Initialize attendance data
            const initialData = {};
            classStudents.forEach(student => {
                initialData[student._id] = 'Present';
            });
            setAttendanceData(initialData);
        } catch (error) {
            console.error(error);
        }
    };

    const handleStatusChange = (studentId, status) => {
        setAttendanceData(prev => ({
            ...prev,
            [studentId]: status
        }));
    };

    const markAllPresent = () => {
        const allPresent = {};
        students.forEach(student => {
            allPresent[student._id] = 'Present';
        });
        setAttendanceData(allPresent);
    };

    const submitAttendance = async () => {
        if (!selectedClass || !selectedSubject) return toast.error('Please select class and subject');

        setLoading(true);
        try {
            const attendanceRecords = students.map(student => ({
                student: student._id,
                status: attendanceData[student._id] || 'Present'
            }));

            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            await axios.post(`${import.meta.env.VITE_API_URL}/attendance/bulk`, {
                attendanceRecords,
                class: selectedClass,
                subject: selectedSubject,
                date
            }, {
                headers: {
                    Authorization: `Bearer ${userInfo.token}`
                }
            });

            setSuccess(true);
            setTimeout(() => setSuccess(false), 3000);
            setLoading(false);
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || 'Error marking attendance');
            setLoading(false);
        }
    };

    return (
        <div className="bg-gray-50 min-h-screen">
            <div className="mb-6">
                <h1 className="text-3xl font-extrabold text-gray-800 tracking-tight">
                    Mark <span className="text-blue-600">Attendance</span>
                </h1>
                <p className="text-gray-500 mt-2">Record student attendance for today's class</p>
            </div>

            {success && (
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6 flex items-center"
                >
                    <FaCheckCircle className="mr-2" />
                    Attendance marked successfully!
                </motion.div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
                <div>
                    <label className="block text-sm font-semibold text-gray-600 mb-2">Class</label>
                    <select
                        value={selectedClass}
                        onChange={(e) => setSelectedClass(e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                    >
                        <option value="">Select Class</option>
                        {classes.map((cls) => (
                            <option key={cls._id} value={cls._id}>
                                {cls.name} - {cls.section}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-semibold text-gray-600 mb-2">Subject</label>
                    <select
                        value={selectedSubject}
                        onChange={(e) => setSelectedSubject(e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 outline-none bg-white"
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
                    <label className="block text-sm font-semibold text-gray-600 mb-2">Date</label>
                    <input
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                    />
                </div>

                <div className="flex items-end">
                    <button
                        onClick={markAllPresent}
                        className="w-full bg-green-500 text-white font-semibold py-2.5 rounded-lg hover:bg-green-600 transition-colors"
                    >
                        Mark All Present
                    </button>
                </div>
            </div>

            {students.length > 0 && (
                <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                    <div className="p-6 border-b border-gray-100 bg-gray-50">
                        <h2 className="text-xl font-bold text-gray-800">Student List ({students.length})</h2>
                    </div>

                    <div className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {students.map((student) => (
                                <div
                                    key={student._id}
                                    className="p-4 border border-gray-200 rounded-xl hover:shadow-md transition-shadow"
                                >
                                    <div className="flex items-center justify-between mb-3">
                                        <div>
                                            <h3 className="font-bold text-gray-800">{student.name}</h3>
                                            <p className="text-xs text-gray-500">Roll: {student.rollNumber}</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-4 gap-2">
                                        {['Present', 'Absent', 'Late', 'Excused'].map((status) => (
                                            <button
                                                key={status}
                                                onClick={() => handleStatusChange(student._id, status)}
                                                className={`px-2 py-2 rounded-lg text-xs font-semibold transition-all ${attendanceData[student._id] === status
                                                    ? status === 'Present'
                                                        ? 'bg-green-500 text-white'
                                                        : status === 'Absent'
                                                            ? 'bg-red-500 text-white'
                                                            : status === 'Late'
                                                                ? 'bg-yellow-500 text-white'
                                                                : 'bg-blue-500 text-white'
                                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                                    }`}
                                            >
                                                {status.charAt(0)}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="mt-6 flex justify-end">
                            <button
                                onClick={submitAttendance}
                                disabled={loading || !selectedClass || !selectedSubject}
                                className="bg-blue-600 text-white font-bold px-8 py-3 rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? 'Submitting...' : 'Submit Attendance'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {students.length === 0 && selectedClass && (
                <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-12 text-center">
                    <p className="text-gray-400 text-lg">No students found in this class.</p>
                </div>
            )}
        </div>
    );
};

export default MarkAttendance;
