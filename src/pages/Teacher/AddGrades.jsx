import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { FaPlus, FaCheckCircle } from 'react-icons/fa';
import { useSelector } from 'react-redux';

const AddGrades = () => {
    const { userInfo } = useSelector((state) => state.auth);
    const [subjects, setSubjects] = useState([]);
    const [students, setStudents] = useState([]);

    const [selectedSubject, setSelectedSubject] = useState('');
    const [selectedStudent, setSelectedStudent] = useState('');
    const [examType, setExamType] = useState('Quiz');
    const [marks, setMarks] = useState('');
    const [totalMarks, setTotalMarks] = useState('100');
    const [remarks, setRemarks] = useState('');

    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        fetchSubjects();
        fetchStudents();
    }, []);

    const fetchSubjects = async () => {
        try {
            const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/subjects?teacherId=${userInfo._id}`);
            setSubjects(data);
        } catch (error) {
            console.error(error);
        }
    };

    const fetchStudents = async () => {
        try {
            const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/students`);
            setStudents(data);
        } catch (error) {
            console.error(error);
        }
    };

    const submitHandler = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            await axios.post(`${import.meta.env.VITE_API_URL}/grades`, {
                student: selectedStudent,
                subject: selectedSubject,
                examType,
                marks: parseFloat(marks),
                totalMarks: parseFloat(totalMarks),
                remarks
            }, {
                headers: {
                    Authorization: `Bearer ${userInfo.token}`
                }
            });

            setSuccess(true);
            setTimeout(() => setSuccess(false), 3000);

            // Reset form
            setSelectedStudent('');
            setMarks('');
            setRemarks('');
            setLoading(false);
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || 'Error adding grade');
            setLoading(false);
        }
    };

    return (
        <div className="bg-gray-50 min-h-screen">
            <div className="mb-6">
                <h1 className="text-3xl font-extrabold text-gray-800 tracking-tight">
                    Add <span className="text-blue-600">Grades</span>
                </h1>
                <p className="text-gray-500 mt-2">Enter student marks and grades</p>
            </div>

            {success && (
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6 flex items-center"
                >
                    <FaCheckCircle className="mr-2" />
                    Grade added successfully!
                </motion.div>
            )}

            <div className="max-w-2xl">
                <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
                    <h2 className="text-xl font-bold mb-6 text-gray-800 flex items-center border-b pb-4 border-gray-100">
                        <FaPlus className="mr-3 text-blue-500 bg-blue-50 p-2 rounded-full text-3xl" />
                        Enter Grade Details
                    </h2>

                    <form onSubmit={submitHandler} className="space-y-4">
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
                                        {subject.name} ({subject.code})
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-600 mb-1">Student</label>
                            <select
                                value={selectedStudent}
                                onChange={(e) => setSelectedStudent(e.target.value)}
                                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 outline-none bg-gray-50 focus:bg-white"
                                required
                            >
                                <option value="">Select Student</option>
                                {students.map((student) => (
                                    <option key={student._id} value={student._id}>
                                        {student.name} - Roll: {student.rollNumber}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-600 mb-1">Exam Type</label>
                            <select
                                value={examType}
                                onChange={(e) => setExamType(e.target.value)}
                                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 outline-none bg-gray-50 focus:bg-white"
                            >
                                <option value="Quiz">Quiz</option>
                                <option value="Assignment">Assignment</option>
                                <option value="Mid-term">Mid-term</option>
                                <option value="Final">Final</option>
                                <option value="Project">Project</option>
                            </select>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-600 mb-1">Marks Obtained</label>
                                <input
                                    type="number"
                                    value={marks}
                                    onChange={(e) => setMarks(e.target.value)}
                                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 outline-none bg-gray-50 focus:bg-white"
                                    placeholder="e.g. 85"
                                    min="0"
                                    max={totalMarks}
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-600 mb-1">Total Marks</label>
                                <input
                                    type="number"
                                    value={totalMarks}
                                    onChange={(e) => setTotalMarks(e.target.value)}
                                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 outline-none bg-gray-50 focus:bg-white"
                                    placeholder="e.g. 100"
                                    min="1"
                                    required
                                />
                            </div>
                        </div>

                        {marks && totalMarks && (
                            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                                <p className="text-sm text-gray-600">Percentage: <span className="font-bold text-blue-600">{((marks / totalMarks) * 100).toFixed(2)}%</span></p>
                                <p className="text-sm text-gray-600">Grade: <span className="font-bold text-blue-600">
                                    {(() => {
                                        const percentage = (marks / totalMarks) * 100;
                                        if (percentage >= 90) return 'A+';
                                        if (percentage >= 85) return 'A';
                                        if (percentage >= 80) return 'A-';
                                        if (percentage >= 75) return 'B+';
                                        if (percentage >= 70) return 'B';
                                        if (percentage >= 65) return 'B-';
                                        if (percentage >= 60) return 'C+';
                                        if (percentage >= 55) return 'C';
                                        if (percentage >= 50) return 'C-';
                                        if (percentage >= 40) return 'D';
                                        return 'F';
                                    })()}
                                </span></p>
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-semibold text-gray-600 mb-1">Remarks (Optional)</label>
                            <textarea
                                value={remarks}
                                onChange={(e) => setRemarks(e.target.value)}
                                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 outline-none bg-gray-50 focus:bg-white"
                                rows="3"
                                placeholder="Any additional comments..."
                            />
                        </div>

                        <button
                            type="submit"
                            className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/30 mt-4"
                            disabled={loading}
                        >
                            {loading ? 'Adding...' : 'Add Grade'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AddGrades;
