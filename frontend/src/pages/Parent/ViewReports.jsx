import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { FaFileAlt, FaTrophy, FaCalendarCheck, FaClipboardList, FaDownload } from 'react-icons/fa';

const ViewReports = () => {
    const [children, setChildren] = useState([]);
    const [selectedChild, setSelectedChild] = useState(null);
    const [reports, setReports] = useState([]);
    const [selectedReport, setSelectedReport] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchChildren();
    }, []);

    useEffect(() => {
        if (selectedChild) {
            fetchReports(selectedChild._id);
        }
    }, [selectedChild]);

    const fetchChildren = async () => {
        try {
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/parents/children`, {
                headers: {
                    Authorization: `Bearer ${userInfo.token}`
                }
            });
            setChildren(data);
            if (data.length > 0) {
                setSelectedChild(data[0]);
            }
        } catch (error) {
            console.error(error);
        }
    };

    const fetchReports = async (studentId) => {
        setLoading(true);
        try {
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            const { data } = await axios.get(
                `${import.meta.env.VITE_API_URL}/reports/student/${studentId}`,
                {
                    headers: {
                        Authorization: `Bearer ${userInfo.token}`
                    }
                }
            );
            setReports(data);
            setLoading(false);
        } catch (error) {
            console.error(error);
            setLoading(false);
        }
    };

    const viewReport = async (reportId) => {
        try {
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            const { data } = await axios.get(
                `${import.meta.env.VITE_API_URL}/reports/${reportId}`,
                {
                    headers: {
                        Authorization: `Bearer ${userInfo.token}`
                    }
                }
            );
            setSelectedReport(data);
        } catch (error) {
            console.error(error);
        }
    };

    const downloadReport = () => {
        if (!selectedReport) return;

        const reportContent = `
STUDENT REPORT CARD
==================

Student: ${selectedReport.student.name}
Roll Number: ${selectedReport.student.rollNumber}
Class: ${selectedReport.class.name} - ${selectedReport.class.section}
Report Type: ${selectedReport.type}
${selectedReport.month ? `Month: ${selectedReport.month}` : ''}
${selectedReport.term ? `Term: ${selectedReport.term}` : ''}
Year: ${selectedReport.year}

ATTENDANCE
----------
Total Days: ${selectedReport.attendance.total}
Present: ${selectedReport.attendance.present}
Absent: ${selectedReport.attendance.absent}
Late: ${selectedReport.attendance.late}
Percentage: ${selectedReport.attendance.percentage}%

ACADEMIC PERFORMANCE
-------------------
${selectedReport.grades.map(g => `
${g.subject.name}: ${g.marks}/${g.totalMarks} (${g.percentage}%) - Grade: ${g.grade}`).join('')}

Overall Percentage: ${selectedReport.overallPercentage}%
Overall Grade: ${selectedReport.overallGrade}

ASSIGNMENTS
-----------
Total: ${selectedReport.assignments.total}
Submitted: ${selectedReport.assignments.submitted}
Pending: ${selectedReport.assignments.pending}
Graded: ${selectedReport.assignments.graded}

TEACHER COMMENTS
---------------
${selectedReport.teacherComments}

STRENGTHS
---------
${selectedReport.strengths.map((s, i) => `${i + 1}. ${s}`).join('\n')}

AREAS OF IMPROVEMENT
-------------------
${selectedReport.areasOfImprovement.map((a, i) => `${i + 1}. ${a}`).join('\n')}

Generated on: ${new Date(selectedReport.createdAt).toLocaleDateString()}
        `;

        const blob = new Blob([reportContent], { type: 'text/plain' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${selectedReport.student.name}-${selectedReport.type}-${selectedReport.year}.txt`;
        a.click();
    };

    if (children.length === 0) {
        return (
            <div className="bg-gray-50 min-h-screen">
                <div className="mb-6">
                    <h1 className="text-3xl font-extrabold text-gray-800 tracking-tight">
                        View <span className="text-blue-600">Reports</span>
                    </h1>
                </div>
                <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-12 text-center">
                    <p className="text-gray-400 text-lg">No children assigned</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-gray-50 min-h-screen">
            <div className="mb-6">
                <h1 className="text-3xl font-extrabold text-gray-800 tracking-tight">
                    View <span className="text-blue-600">Reports</span>
                </h1>
                <p className="text-gray-500 mt-2">Access result cards and performance reports for your children</p>
            </div>

            {/* Child Selector */}
            <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6 mb-6">
                <h2 className="text-lg font-bold text-gray-800 mb-4">Select Child</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {children.map((child) => (
                        <button
                            key={child._id}
                            onClick={() => setSelectedChild(child)}
                            className={`p-4 rounded-xl border-2 transition-all text-left ${selectedChild?._id === child._id
                                ? 'border-blue-500 bg-blue-50'
                                : 'border-gray-200 hover:border-blue-300'
                                }`}
                        >
                            <h3 className="font-bold text-gray-800">{child.name}</h3>
                            <p className="text-sm text-gray-600">
                                {child.studentClass ? `${child.studentClass.name} - ${child.studentClass.section}` : 'No class'}
                            </p>
                        </button>
                    ))}
                </div>
            </div>

            {/* Reports List */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1">
                    <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6">
                        <h2 className="text-lg font-bold text-gray-800 mb-4">Available Reports</h2>
                        {loading ? (
                            <p className="text-gray-500">Loading...</p>
                        ) : reports.length === 0 ? (
                            <p className="text-gray-400">No reports available</p>
                        ) : (
                            <div className="space-y-3">
                                {reports.map((report) => (
                                    <button
                                        key={report._id}
                                        onClick={() => viewReport(report._id)}
                                        className={`w-full p-4 rounded-xl border-2 transition-all text-left ${selectedReport?._id === report._id
                                            ? 'border-blue-500 bg-blue-50'
                                            : 'border-gray-200 hover:border-blue-300'
                                            }`}
                                    >
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="font-bold text-gray-800">{report.type}</span>
                                            <FaFileAlt className="text-blue-600" />
                                        </div>
                                        <p className="text-sm text-gray-600">
                                            {report.month || report.term} {report.year}
                                        </p>
                                        <p className="text-xs text-gray-500 mt-1">
                                            {new Date(report.createdAt).toLocaleDateString()}
                                        </p>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Report Details */}
                <div className="lg:col-span-2">
                    {selectedReport ? (
                        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8">
                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-800">{selectedReport.type}</h2>
                                    <p className="text-gray-600">
                                        {selectedReport.month || selectedReport.term} {selectedReport.year}
                                    </p>
                                </div>
                                <button
                                    onClick={downloadReport}
                                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                                >
                                    <FaDownload />
                                    Download
                                </button>
                            </div>

                            {/* Stats Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 border border-green-200">
                                    <FaCalendarCheck className="text-green-600 text-2xl mb-2" />
                                    <p className="text-sm text-green-700 font-semibold">Attendance</p>
                                    <p className="text-3xl font-bold text-green-800">{selectedReport.attendance.percentage}%</p>
                                    <p className="text-xs text-green-600">
                                        {selectedReport.attendance.present}/{selectedReport.attendance.total} days
                                    </p>
                                </div>

                                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200">
                                    <FaTrophy className="text-blue-600 text-2xl mb-2" />
                                    <p className="text-sm text-blue-700 font-semibold">Overall Grade</p>
                                    <p className="text-3xl font-bold text-blue-800">{selectedReport.overallGrade}</p>
                                    <p className="text-xs text-blue-600">{selectedReport.overallPercentage}%</p>
                                </div>

                                <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 border border-purple-200">
                                    <FaClipboardList className="text-purple-600 text-2xl mb-2" />
                                    <p className="text-sm text-purple-700 font-semibold">Assignments</p>
                                    <p className="text-3xl font-bold text-purple-800">
                                        {selectedReport.assignments.submitted}/{selectedReport.assignments.total}
                                    </p>
                                    <p className="text-xs text-purple-600">Submitted</p>
                                </div>
                            </div>

                            {/* Subject Grades */}
                            <div className="mb-6">
                                <h3 className="text-lg font-bold text-gray-800 mb-3">Subject-wise Performance</h3>
                                <div className="overflow-x-auto">
                                    <table className="min-w-full">
                                        <thead className="bg-blue-50">
                                            <tr>
                                                <th className="py-2 px-4 text-left text-xs font-bold text-blue-800">Subject</th>
                                                <th className="py-2 px-4 text-left text-xs font-bold text-blue-800">Marks</th>
                                                <th className="py-2 px-4 text-left text-xs font-bold text-blue-800">Percentage</th>
                                                <th className="py-2 px-4 text-left text-xs font-bold text-blue-800">Grade</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {selectedReport.grades.map((grade, index) => (
                                                <tr key={index}>
                                                    <td className="py-2 px-4 font-semibold text-gray-800">{grade.subject.name}</td>
                                                    <td className="py-2 px-4 text-gray-700">{grade.marks}/{grade.totalMarks}</td>
                                                    <td className="py-2 px-4 text-gray-700">{grade.percentage}%</td>
                                                    <td className="py-2 px-4">
                                                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${grade.percentage >= 90 ? 'bg-green-100 text-green-700' :
                                                            grade.percentage >= 75 ? 'bg-blue-100 text-blue-700' :
                                                                grade.percentage >= 60 ? 'bg-yellow-100 text-yellow-700' :
                                                                    'bg-red-100 text-red-700'
                                                            }`}>
                                                            {grade.grade}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Teacher Comments */}
                            {selectedReport.teacherComments && (
                                <div className="mb-6">
                                    <h3 className="text-lg font-bold text-gray-800 mb-3">Teacher's Comments</h3>
                                    <p className="text-gray-700 bg-gray-50 p-4 rounded-lg border border-gray-200">
                                        {selectedReport.teacherComments}
                                    </p>
                                </div>
                            )}

                            {/* Strengths and Improvements */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {selectedReport.strengths.length > 0 && (
                                    <div>
                                        <h3 className="text-lg font-bold text-green-700 mb-3">Strengths</h3>
                                        <ul className="space-y-2">
                                            {selectedReport.strengths.map((strength, index) => (
                                                <li key={index} className="flex items-start">
                                                    <span className="text-green-600 mr-2">✓</span>
                                                    <span className="text-gray-700">{strength}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                {selectedReport.areasOfImprovement.length > 0 && (
                                    <div>
                                        <h3 className="text-lg font-bold text-orange-700 mb-3">Areas of Improvement</h3>
                                        <ul className="space-y-2">
                                            {selectedReport.areasOfImprovement.map((area, index) => (
                                                <li key={index} className="flex items-start">
                                                    <span className="text-orange-600 mr-2">→</span>
                                                    <span className="text-gray-700">{area}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-12 text-center">
                            <FaFileAlt className="text-6xl text-gray-300 mx-auto mb-4" />
                            <p className="text-gray-400 text-lg">Select a report to view details</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ViewReports;
