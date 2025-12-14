import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { FaTrophy, FaDownload } from 'react-icons/fa';
import { useSelector } from 'react-redux';

const MyResults = () => {
    const { userInfo } = useSelector((state) => state.auth);
    const [results, setResults] = useState([]);

    useEffect(() => {
        if (userInfo?._id) {
            fetchResults();
        }
    }, [userInfo]);

    const fetchResults = async () => {
        try {
            const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/results/student/${userInfo._id}`);
            setResults(data);
        } catch (error) {
            console.error(error);
        }
    };

    const getGradeColor = (grade) => {
        if (grade.startsWith('A')) return 'text-green-600 bg-green-50';
        if (grade.startsWith('B')) return 'text-blue-600 bg-blue-50';
        if (grade.startsWith('C')) return 'text-yellow-600 bg-yellow-50';
        if (grade === 'D') return 'text-orange-600 bg-orange-50';
        return 'text-red-600 bg-red-50';
    };

    return (
        <div className="bg-gray-50 min-h-screen">
            <div className="mb-6">
                <h1 className="text-3xl font-extrabold text-gray-800 tracking-tight">
                    My <span className="text-blue-600">Results</span>
                </h1>
                <p className="text-gray-500 mt-2">View your academic results and report cards</p>
            </div>

            {results.length === 0 ? (
                <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-12 text-center">
                    <p className="text-gray-400 text-lg">No results available yet.</p>
                    <p className="text-gray-400 text-sm mt-2">Results will appear here once published by your teachers.</p>
                </div>
            ) : (
                <div className="space-y-6">
                    {results.map((result) => (
                        <motion.div
                            key={result._id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden"
                        >
                            {/* Header */}
                            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h2 className="text-2xl font-bold">{result.term}</h2>
                                        <p className="text-blue-100 mt-1">{result.academicYear}</p>
                                        <p className="text-sm text-blue-100 mt-2">
                                            {result.class?.name} - {result.class?.section}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <div className={`inline-block px-4 py-2 rounded-lg font-bold text-2xl ${result.status === 'Pass'
                                            ? 'bg-green-500 text-white'
                                            : 'bg-red-500 text-white'
                                            }`}>
                                            {result.status}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Summary Stats */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6 bg-gray-50 border-b border-gray-200">
                                <div className="text-center">
                                    <p className="text-sm text-gray-500 mb-1">Total Marks</p>
                                    <p className="text-2xl font-bold text-gray-800">{result.totalMarks}</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-sm text-gray-500 mb-1">Obtained</p>
                                    <p className="text-2xl font-bold text-gray-800">{result.obtainedMarks}</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-sm text-gray-500 mb-1">Percentage</p>
                                    <p className="text-2xl font-bold text-blue-600">{result.percentage.toFixed(2)}%</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-sm text-gray-500 mb-1">Grade</p>
                                    <p className={`text-2xl font-bold px-3 py-1 rounded-lg inline-block ${getGradeColor(result.grade)}`}>
                                        {result.grade}
                                    </p>
                                </div>
                            </div>

                            {/* Subject-wise Results */}
                            <div className="p-6">
                                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                                    <FaTrophy className="text-yellow-500" />
                                    Subject-wise Performance
                                </h3>
                                <div className="overflow-x-auto">
                                    <table className="min-w-full">
                                        <thead className="bg-blue-50">
                                            <tr>
                                                <th className="py-3 px-4 text-left text-xs font-bold text-blue-800 uppercase">Subject</th>
                                                <th className="py-3 px-4 text-center text-xs font-bold text-blue-800 uppercase">Total Marks</th>
                                                <th className="py-3 px-4 text-center text-xs font-bold text-blue-800 uppercase">Obtained</th>
                                                <th className="py-3 px-4 text-center text-xs font-bold text-blue-800 uppercase">Percentage</th>
                                                <th className="py-3 px-4 text-center text-xs font-bold text-blue-800 uppercase">Grade</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {result.subjects?.map((subjectResult, index) => {
                                                const percentage = (subjectResult.obtainedMarks / subjectResult.totalMarks * 100).toFixed(2);
                                                return (
                                                    <tr key={index} className="hover:bg-blue-50/50 transition-colors">
                                                        <td className="py-3 px-4 font-semibold text-gray-800">
                                                            {subjectResult.subject?.name}
                                                        </td>
                                                        <td className="py-3 px-4 text-center text-gray-600">
                                                            {subjectResult.totalMarks}
                                                        </td>
                                                        <td className="py-3 px-4 text-center text-gray-600">
                                                            {subjectResult.obtainedMarks}
                                                        </td>
                                                        <td className="py-3 px-4 text-center font-semibold text-blue-600">
                                                            {percentage}%
                                                        </td>
                                                        <td className="py-3 px-4 text-center">
                                                            <span className={`px-3 py-1 rounded-lg font-bold ${getGradeColor(subjectResult.grade)}`}>
                                                                {subjectResult.grade}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Attendance */}
                            {result.attendance && (
                                <div className="px-6 pb-6">
                                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                                        <p className="text-sm text-gray-600">
                                            Attendance: <span className="font-bold text-blue-600">{result.attendance}%</span>
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* Remarks */}
                            {result.remarks && (
                                <div className="px-6 pb-6">
                                    <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-100">
                                        <p className="text-sm font-semibold text-gray-700 mb-1">Remarks:</p>
                                        <p className="text-sm text-gray-600 italic">"{result.remarks}"</p>
                                    </div>
                                </div>
                            )}

                            {/* Footer */}
                            <div className="px-6 pb-6">
                                <button className="w-full bg-blue-600 text-white font-semibold py-3 rounded-xl hover:bg-blue-700 transition-colors flex items-center justify-center gap-2">
                                    <FaDownload />
                                    Download Report Card
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default MyResults;
