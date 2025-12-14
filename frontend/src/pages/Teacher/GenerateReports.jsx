
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FaFileAlt, FaCalendar, FaCheck } from 'react-icons/fa';
import toast from 'react-hot-toast';

const GenerateReports = () => {
    const [students, setStudents] = useState([]);
    const [classes, setClasses] = useState([]);
    const [selectedStudent, setSelectedStudent] = useState('');
    const [type, setType] = useState('Monthly Performance');
    const [month, setMonth] = useState('');
    const [year, setYear] = useState(new Date().getFullYear());
    const [term, setTerm] = useState('Mid-term');
    const [teacherComments, setTeacherComments] = useState('');
    const [strengths, setStrengths] = useState('');
    const [improvements, setImprovements] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        fetchStudents();
        fetchClasses();
    }, []);

    const fetchStudents = async () => {
        try {
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/students`, {
                headers: { Authorization: `Bearer ${userInfo.token}` }
            });
            setStudents(data);
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

    const handleGenerate = async () => {
        if (!selectedStudent || !type) return toast.error('Please select a student');

        setLoading(true);
        try {
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            const { data } = await axios.post(
                `${import.meta.env.VITE_API_URL}/reports/generate`,
                {
                    studentId: selectedStudent,
                    type,
                    month: type === 'Monthly Performance' ? month : undefined,
                    year,
                    term: type === 'Result Card' ? term : undefined,
                    teacherComments,
                    strengths: strengths.split('\n').filter(s => s.trim()),
                    areasOfImprovement: improvements.split('\n').filter(i => i.trim())
                },
                {
                    headers: {
                        Authorization: `Bearer ${userInfo.token}`
                    }
                }
            );

            // Auto-publish the report
            await axios.put(
                `${import.meta.env.VITE_API_URL}/reports/${data._id}/publish`,
                {},
                {
                    headers: {
                        Authorization: `Bearer ${userInfo.token}`
                    }
                }
            );

            setSuccess(true);
            setTimeout(() => setSuccess(false), 3000);

            // Reset form
            setSelectedStudent('');
            setTeacherComments('');
            setStrengths('');
            setImprovements('');
            setLoading(false);
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || 'Error generating report');
            setLoading(false);
        }
    };

    const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];

    return (
        <div className="bg-gray-50 min-h-screen">
            <div className="mb-6">
                <h1 className="text-3xl font-extrabold text-gray-800 tracking-tight">
                    Generate <span className="text-blue-600">Reports</span>
                </h1>
                <p className="text-gray-500 mt-2">Create result cards and performance reports for students</p>
            </div>

            {success && (
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6 flex items-center"
                >
                    <FaCheck className="mr-2" />
                    Report generated and published successfully! Parents can now view it.
                </motion.div>
            )}

            <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8 max-w-3xl">
                <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
                    <FaFileAlt className="mr-3 text-blue-600" />
                    Report Details
                </h2>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-semibold text-gray-600 mb-2">Student</label>
                        <select
                            value={selectedStudent}
                            onChange={(e) => setSelectedStudent(e.target.value)}
                            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 outline-none"
                        >
                            <option value="">Select Student</option>
                            {students.map((student) => (
                                <option key={student._id} value={student._id}>
                                    {student.name} - Roll: {student.rollNumber}
                                </option>
                            ))}
                        </select>
                        <p className="text-sm text-gray-500 mt-1">
                            {/* Link to Add Grades */}
                            Don't see marks on report? <Link to="/teacher/grades" className="text-blue-600 hover:text-blue-800 font-semibold underline">Add missing grades here</Link> first.
                        </p>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-600 mb-2">Report Type</label>
                        <select
                            value={type}
                            onChange={(e) => setType(e.target.value)}
                            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 outline-none"
                        >
                            <option value="Monthly Performance">Monthly Performance</option>
                            <option value="Result Card">Result Card</option>
                        </select>
                    </div>

                    {type === 'Monthly Performance' && (
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-600 mb-2">Month</label>
                                <select
                                    value={month}
                                    onChange={(e) => setMonth(e.target.value)}
                                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 outline-none"
                                >
                                    <option value="">Select Month</option>
                                    {months.map((m) => (
                                        <option key={m} value={m}>{m}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-600 mb-2">Year</label>
                                <input
                                    type="number"
                                    value={year}
                                    onChange={(e) => setYear(e.target.value)}
                                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                            </div>
                        </div>
                    )}

                    {type === 'Result Card' && (
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-600 mb-2">Term</label>
                                <select
                                    value={term}
                                    onChange={(e) => setTerm(e.target.value)}
                                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 outline-none"
                                >
                                    <option value="Mid-term">Mid-term</option>
                                    <option value="Final">Final</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-600 mb-2">Year</label>
                                <input
                                    type="number"
                                    value={year}
                                    onChange={(e) => setYear(e.target.value)}
                                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                            </div>
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-semibold text-gray-600 mb-2">Teacher Comments</label>
                        <textarea
                            value={teacherComments}
                            onChange={(e) => setTeacherComments(e.target.value)}
                            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 outline-none"
                            rows="3"
                            placeholder="Overall comments about student's performance..."
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-600 mb-2">Strengths (one per line)</label>
                        <textarea
                            value={strengths}
                            onChange={(e) => setStrengths(e.target.value)}
                            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 outline-none"
                            rows="3"
                            placeholder="Good participation in class&#10;Excellent problem-solving skills&#10;Shows leadership qualities"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-600 mb-2">Areas of Improvement (one per line)</label>
                        <textarea
                            value={improvements}
                            onChange={(e) => setImprovements(e.target.value)}
                            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 outline-none"
                            rows="3"
                            placeholder="Needs to improve time management&#10;Should focus more on homework&#10;Can work on handwriting"
                        />
                    </div>

                    <button
                        onClick={handleGenerate}
                        disabled={loading}
                        className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/30 disabled:opacity-50"
                    >
                        {loading ? 'Generating...' : 'Generate & Publish Report'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default GenerateReports;
