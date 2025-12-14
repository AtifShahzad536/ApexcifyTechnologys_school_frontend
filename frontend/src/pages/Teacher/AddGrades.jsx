import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { FaPlus, FaCheckCircle, FaSave, FaCalculator } from 'react-icons/fa';
import { useSelector } from 'react-redux';

const AddGrades = () => {
    const { userInfo } = useSelector((state) => state.auth);
    const [students, setStudents] = useState([]);
    const [classSubjects, setClassSubjects] = useState([]);

    const [selectedStudent, setSelectedStudent] = useState('');
    const [examType, setExamType] = useState('Quiz');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

    // State to store grades for multiple subjects: { subjectId: { marks: '', totalMarks: '100', remarks: '' } }
    const [gradeInputs, setGradeInputs] = useState({});

    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        fetchStudents();
    }, []);

    // When student changes, fetch their class subjects
    useEffect(() => {
        if (selectedStudent) {
            const student = students.find(s => s._id === selectedStudent);
            if (student && student.studentClass) {
                fetchClassSubjects(student.studentClass._id);
            } else {
                setClassSubjects([]);
            }
            // Reset grades when student changes
            setGradeInputs({});
        } else {
            setClassSubjects([]);
        }
    }, [selectedStudent]);

    const fetchStudents = async () => {
        try {
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/students`, {
                headers: { Authorization: `Bearer ${userInfo.token}` }
            });
            setStudents(data);
        } catch (error) {
            console.error(error);
            toast.error('Failed to fetch students');
        }
    };

    const fetchClassSubjects = async (classId) => {
        try {
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            // Fetch subjects for this specific class
            const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/subjects?classId=${classId}`, {
                headers: { Authorization: `Bearer ${userInfo.token}` }
            });
            setClassSubjects(data);

            // Initialize grade inputs for found subjects
            const initialInputs = {};
            data.forEach(sub => {
                initialInputs[sub._id] = { marks: '', totalMarks: '100', remarks: '' };
            });
            setGradeInputs(initialInputs);

        } catch (error) {
            console.error(error);
            toast.error('Failed to fetch class subjects. Ensure subjects are assigned to this class.');
        }
    };

    const handleInputChange = (subjectId, field, value) => {
        setGradeInputs(prev => ({
            ...prev,
            [subjectId]: {
                ...prev[subjectId],
                [field]: value
            }
        }));
    };

    const submitHandler = async (e) => {
        e.preventDefault();
        setLoading(true);

        const gradesToSubmit = Object.keys(gradeInputs)
            .filter(subjectId => gradeInputs[subjectId].marks !== '' && gradeInputs[subjectId].marks !== null) // Only submit if marks are entered
            .map(subjectId => ({
                student: selectedStudent,
                subject: subjectId,
                examType,
                marks: parseFloat(gradeInputs[subjectId].marks),
                totalMarks: parseFloat(gradeInputs[subjectId].totalMarks),
                remarks: gradeInputs[subjectId].remarks,
                date: new Date(date)
            }));

        if (gradesToSubmit.length === 0) {
            toast.error('Please enter marks for at least one subject');
            setLoading(false);
            return;
        }

        try {
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));

            // Send requests concurrently
            await Promise.all(gradesToSubmit.map(gradeData =>
                axios.post(`${import.meta.env.VITE_API_URL}/grades`, gradeData, {
                    headers: { Authorization: `Bearer ${userInfo.token}` }
                })
            ));

            setSuccess(true);
            setTimeout(() => setSuccess(false), 3000);

            // Clear inputs for entered grades to prevent double submission, 
            // but keep the student selected so they can add more if needed or see empty boxes?
            // User likely wants to clear everything to move to next student?
            // Let's reset the inputs but keep student/class selected, user can change student easily.
            const resetInputs = {};
            classSubjects.forEach(sub => {
                resetInputs[sub._id] = { marks: '', totalMarks: '100', remarks: '' };
            });
            setGradeInputs(resetInputs);

            toast.success(`Successfully added ${gradesToSubmit.length} grades!`);
            setLoading(false);
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || 'Error adding grades');
            setLoading(false);
        }
    };

    const calculatePercentage = (marks, total) => {
        if (!marks || !total) return 0;
        return ((parseFloat(marks) / parseFloat(total)) * 100).toFixed(1);
    };

    const calculateGrade = (percentage) => {
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
    };

    return (
        <div className="bg-gray-50 min-h-screen">
            <div className="mb-6">
                <h1 className="text-3xl font-extrabold text-gray-800 tracking-tight">
                    Add <span className="text-blue-600">Grades</span>
                </h1>
                <p className="text-gray-500 mt-2">Enter marks for all subjects at once</p>
            </div>

            {success && (
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6 flex items-center shadow-sm"
                >
                    <FaCheckCircle className="mr-2" />
                    Grades added successfully!
                </motion.div>
            )}

            <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6 md:p-8">
                <form onSubmit={submitHandler}>
                    {/* Top Controls */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Select Student</label>
                            <select
                                value={selectedStudent}
                                onChange={(e) => setSelectedStudent(e.target.value)}
                                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none bg-gray-50 focus:bg-white transition-all"
                                required
                            >
                                <option value="">-- Choose Student --</option>
                                {students.map((student) => (
                                    <option key={student._id} value={student._id}>
                                        {student.name} ({student.studentClass?.name || 'No Class'})
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Exam Type</label>
                            <select
                                value={examType}
                                onChange={(e) => setExamType(e.target.value)}
                                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none bg-gray-50 focus:bg-white transition-all"
                            >
                                <option value="Quiz">Quiz</option>
                                <option value="Assignment">Assignment</option>
                                <option value="Mid-term">Mid-term</option>
                                <option value="Final">Final</option>
                                <option value="Project">Project</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Date</label>
                            <input
                                type="date"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none bg-gray-50 focus:bg-white transition-all"
                                required
                            />
                        </div>
                    </div>

                    {/* Bulk Entry Table */}
                    {selectedStudent && classSubjects.length > 0 ? (
                        <div className="overflow-x-auto rounded-xl border border-gray-200 mb-6">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Subject</th>
                                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider w-32">Total</th>
                                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider w-32">Obtained</th>
                                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider w-24">Grade</th>
                                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Remarks</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {classSubjects.map((subject) => {
                                        const inputs = gradeInputs[subject._id] || { marks: '', totalMarks: '100', remarks: '' };
                                        const percentage = calculatePercentage(inputs.marks, inputs.totalMarks);
                                        const grade = calculateGrade(percentage);
                                        const isPass = percentage >= 40;

                                        return (
                                            <tr key={subject._id} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        <div className="ml-0">
                                                            <div className="text-sm font-bold text-gray-900">{subject.name}</div>
                                                            <div className="text-xs text-gray-500">{subject.code}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <input
                                                        type="number"
                                                        value={inputs.totalMarks}
                                                        onChange={(e) => handleInputChange(subject._id, 'totalMarks', e.target.value)}
                                                        className="w-24 border border-gray-300 rounded px-2 py-1 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                                        min="1"
                                                    />
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <input
                                                        type="number"
                                                        value={inputs.marks}
                                                        onChange={(e) => handleInputChange(subject._id, 'marks', e.target.value)}
                                                        className={`w-24 border rounded px-2 py-1 text-sm focus:ring-2 focus:ring-blue-500 outline-none font-bold ${inputs.marks ? 'border-gray-300' : 'border-blue-300 bg-blue-50'}`}
                                                        placeholder="Marks"
                                                        min="0"
                                                        max={inputs.totalMarks}
                                                    />
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    {inputs.marks ? (
                                                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${isPass ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                            {grade} ({percentage}%)
                                                        </span>
                                                    ) : (
                                                        <span className="text-gray-400 text-xs">-</span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <input
                                                        type="text"
                                                        value={inputs.remarks}
                                                        onChange={(e) => handleInputChange(subject._id, 'remarks', e.target.value)}
                                                        className="w-full border border-gray-300 rounded px-2 py-1 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                                        placeholder="Optional..."
                                                    />
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300 mb-6">
                            <FaCalculator className="mx-auto text-4xl text-gray-300 mb-3" />
                            <p className="text-gray-500 font-medium">
                                {selectedStudent ? 'No subjects found for this student\'s class.' : 'Select a student to view their subjects and enter marks.'}
                            </p>
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading || !selectedStudent || classSubjects.length === 0}
                        className={`w-full py-4 rounded-xl text-white font-bold text-lg shadow-lg transition-all flex items-center justify-center gap-2 ${loading || !selectedStudent || classSubjects.length === 0
                                ? 'bg-gray-400 cursor-not-allowed'
                                : 'bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 shadow-blue-500/30 hover:shadow-blue-500/50 transform hover:-translate-y-1'
                            }`}
                    >
                        {loading ? 'Saving Grades...' : (
                            <>
                                <FaSave /> Save All Grades
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AddGrades;
