import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaChartLine, FaCalendarCheck, FaClipboardList, FaTrophy, FaUserGraduate } from 'react-icons/fa';

const ChildDetails = () => {
    const { id } = useParams();
    const [activeTab, setActiveTab] = useState('grades');
    const [child, setChild] = useState(null);
    const [grades, setGrades] = useState([]);
    const [attendance, setAttendance] = useState([]);
    const [assignments, setAssignments] = useState([]);
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchChildData();
    }, [id]);

    const fetchChildData = async () => {
        try {
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            const headers = {
                Authorization: `Bearer ${userInfo.token}`
            };

            // Fetch all data
            const [childrenRes, gradesRes, attendanceRes, assignmentsRes, resultsRes] = await Promise.all([
                axios.get(`${import.meta.env.VITE_API_URL}/parents/children`, { headers }),
                axios.get(`${import.meta.env.VITE_API_URL}/parents/children/${id}/grades`, { headers }),
                axios.get(`${import.meta.env.VITE_API_URL}/parents/children/${id}/attendance`, { headers }),
                axios.get(`${import.meta.env.VITE_API_URL}/parents/children/${id}/assignments`, { headers }),
                axios.get(`${import.meta.env.VITE_API_URL}/parents/children/${id}/results`, { headers })
            ]);

            const currentChild = childrenRes.data.find(c => c._id === id);
            setChild(currentChild);
            setGrades(gradesRes.data);
            setAttendance(attendanceRes.data);
            setAssignments(assignmentsRes.data);
            setResults(resultsRes.data);
            setLoading(false);
        } catch (error) {
            console.error(error);
            setLoading(false);
        }
    };

    const tabs = [
        { id: 'grades', label: 'Grades', icon: <FaChartLine /> },
        { id: 'attendance', label: 'Attendance', icon: <FaCalendarCheck /> },
        { id: 'assignments', label: 'Assignments', icon: <FaClipboardList /> },
        { id: 'results', label: 'Results', icon: <FaTrophy /> }
    ];

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-xl text-gray-600">Loading...</div>
            </div>
        );
    }

    return (
        <div className="bg-gray-50 min-h-screen">
            {/* Child Header */}
            <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6 mb-6">
                <div className="flex items-center">
                    <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mr-6">
                        <FaUserGraduate className="text-white text-3xl" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-extrabold text-gray-800">{child?.name}</h1>
                        <p className="text-gray-600 mt-1">
                            {child?.studentClass ?
                                `${child.studentClass.name} - ${child.studentClass.section}` :
                                'No class assigned'
                            }
                        </p>
                        {child?.rollNumber && (
                            <p className="text-sm text-gray-500 mt-1">Roll Number: {child.rollNumber}</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="bg-white rounded-2xl shadow-xl border border-gray-200 mb-6">
                <div className="flex border-b border-gray-200">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex-1 flex items-center justify-center gap-2 py-4 px-6 font-semibold transition-colors ${activeTab === tab.id
                                ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                                : 'text-gray-600 hover:text-blue-600 hover:bg-gray-50'
                                }`}
                        >
                            {tab.icon}
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Tab Content */}
                <div className="p-6">
                    {activeTab === 'grades' && (
                        <div>
                            <h2 className="text-xl font-bold text-gray-800 mb-4">Grades</h2>
                            {grades.length === 0 ? (
                                <p className="text-gray-500 text-center py-8">No grades available</p>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="min-w-full">
                                        <thead className="bg-blue-50">
                                            <tr>
                                                <th className="py-3 px-4 text-left text-xs font-bold text-blue-800 uppercase">Subject</th>
                                                <th className="py-3 px-4 text-left text-xs font-bold text-blue-800 uppercase">Marks</th>
                                                <th className="py-3 px-4 text-left text-xs font-bold text-blue-800 uppercase">Total</th>
                                                <th className="py-3 px-4 text-left text-xs font-bold text-blue-800 uppercase">Percentage</th>
                                                <th className="py-3 px-4 text-left text-xs font-bold text-blue-800 uppercase">Grade</th>
                                                <th className="py-3 px-4 text-left text-xs font-bold text-blue-800 uppercase">Teacher</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {grades.map((grade) => (
                                                <tr key={grade._id} className="hover:bg-blue-50/50">
                                                    <td className="py-3 px-4 font-semibold text-gray-800">
                                                        {grade.subject?.name || 'N/A'}
                                                    </td>
                                                    <td className="py-3 px-4 text-gray-700">{grade.marks}</td>
                                                    <td className="py-3 px-4 text-gray-700">{grade.totalMarks}</td>
                                                    <td className="py-3 px-4">
                                                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${grade.percentage >= 90 ? 'bg-green-100 text-green-700' :
                                                            grade.percentage >= 75 ? 'bg-blue-100 text-blue-700' :
                                                                grade.percentage >= 60 ? 'bg-yellow-100 text-yellow-700' :
                                                                    'bg-red-100 text-red-700'
                                                            }`}>
                                                            {grade.percentage}%
                                                        </span>
                                                    </td>
                                                    <td className="py-3 px-4 font-semibold text-gray-800">{grade.grade}</td>
                                                    <td className="py-3 px-4 text-gray-600">{grade.teacher?.name || 'N/A'}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'attendance' && (
                        <div>
                            <h2 className="text-xl font-bold text-gray-800 mb-4">Attendance</h2>
                            {attendance.length === 0 ? (
                                <p className="text-gray-500 text-center py-8">No attendance records</p>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="min-w-full">
                                        <thead className="bg-blue-50">
                                            <tr>
                                                <th className="py-3 px-4 text-left text-xs font-bold text-blue-800 uppercase">Date</th>
                                                <th className="py-3 px-4 text-left text-xs font-bold text-blue-800 uppercase">Subject</th>
                                                <th className="py-3 px-4 text-left text-xs font-bold text-blue-800 uppercase">Status</th>
                                                <th className="py-3 px-4 text-left text-xs font-bold text-blue-800 uppercase">Marked By</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {attendance.map((record) => (
                                                <tr key={record._id} className="hover:bg-blue-50/50">
                                                    <td className="py-3 px-4 text-gray-700">
                                                        {new Date(record.date).toLocaleDateString()}
                                                    </td>
                                                    <td className="py-3 px-4 font-semibold text-gray-800">
                                                        {record.subject?.name || 'N/A'}
                                                    </td>
                                                    <td className="py-3 px-4">
                                                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${record.status === 'Present' ? 'bg-green-100 text-green-700' :
                                                            record.status === 'Absent' ? 'bg-red-100 text-red-700' :
                                                                'bg-yellow-100 text-yellow-700'
                                                            }`}>
                                                            {record.status}
                                                        </span>
                                                    </td>
                                                    <td className="py-3 px-4 text-gray-600">{record.markedBy?.name || 'N/A'}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'assignments' && (
                        <div>
                            <h2 className="text-xl font-bold text-gray-800 mb-4">Assignments</h2>
                            {assignments.length === 0 ? (
                                <p className="text-gray-500 text-center py-8">No assignments available</p>
                            ) : (
                                <div className="grid grid-cols-1 gap-4">
                                    {assignments.map((assignment) => (
                                        <div key={assignment._id} className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                                            <div className="flex justify-between items-start">
                                                <div className="flex-1">
                                                    <h3 className="font-bold text-gray-800 text-lg">{assignment.title}</h3>
                                                    <p className="text-sm text-gray-600 mt-1">{assignment.description}</p>
                                                    <div className="flex gap-4 mt-3 text-sm">
                                                        <span className="text-gray-600">
                                                            Subject: <span className="font-semibold">{assignment.subject?.name}</span>
                                                        </span>
                                                        <span className="text-gray-600">
                                                            Due: <span className="font-semibold">
                                                                {new Date(assignment.dueDate).toLocaleDateString()}
                                                            </span>
                                                        </span>
                                                    </div>
                                                </div>
                                                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${assignment.status === 'Graded' ? 'bg-green-100 text-green-700' :
                                                    assignment.status === 'Submitted' ? 'bg-blue-100 text-blue-700' :
                                                        'bg-orange-100 text-orange-700'
                                                    }`}>
                                                    {assignment.status}
                                                </span>
                                            </div>
                                            {assignment.submission && assignment.submission.grade && (
                                                <div className="mt-3 pt-3 border-t border-gray-300">
                                                    <p className="text-sm text-gray-600">
                                                        Grade: <span className="font-bold text-blue-600">{assignment.submission.grade}</span>
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'results' && (
                        <div>
                            <h2 className="text-xl font-bold text-gray-800 mb-4">Term Results</h2>
                            {results.length === 0 ? (
                                <p className="text-gray-500 text-center py-8">No results available</p>
                            ) : (
                                <div className="grid grid-cols-1 gap-4">
                                    {results.map((result) => (
                                        <div key={result._id} className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
                                            <div className="flex justify-between items-start mb-4">
                                                <div>
                                                    <h3 className="text-xl font-bold text-gray-800">
                                                        {result.term} - {result.year}
                                                    </h3>
                                                    <p className="text-sm text-gray-600 mt-1">
                                                        {result.class?.name} - {result.class?.section}
                                                    </p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-3xl font-bold text-blue-600">{result.percentage}%</p>
                                                    <p className="text-sm text-gray-600">Overall</p>
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <p className="text-sm text-gray-600">Total Marks</p>
                                                    <p className="text-lg font-bold text-gray-800">{result.totalMarks}</p>
                                                </div>
                                                <div>
                                                    <p className="text-sm text-gray-600">Obtained Marks</p>
                                                    <p className="text-lg font-bold text-gray-800">{result.obtainedMarks}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ChildDetails;
