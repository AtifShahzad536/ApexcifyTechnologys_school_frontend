import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { FaTrophy, FaUserGraduate } from 'react-icons/fa';

const AllGrades = () => {
    const [children, setChildren] = useState([]);
    const [gradesData, setGradesData] = useState({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            const headers = { Authorization: `Bearer ${userInfo.token}` };

            // Fetch children
            const { data: childrenData } = await axios.get(`${import.meta.env.VITE_API_URL}/parents/children`, { headers });
            setChildren(childrenData);

            // Fetch grades for each child
            const grades = {};
            for (const child of childrenData) {
                const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/parents/children/${child._id}/grades`, { headers });
                grades[child._id] = data;
            }
            setGradesData(grades);
            setLoading(false);
        } catch (error) {
            console.error(error);
            setLoading(false);
        }
    };

    if (loading) {
        return <div className="flex items-center justify-center min-h-screen"><div className="text-xl text-gray-600">Loading...</div></div>;
    }

    return (
        <div className="bg-gray-50 min-h-screen">
            <div className="mb-6">
                <h1 className="text-3xl font-extrabold text-gray-800 tracking-tight">
                    All <span className="text-blue-600">Grades</span>
                </h1>
                <p className="text-gray-500 mt-2">View grades for all your children</p>
            </div>

            {children.map((child) => (
                <motion.div
                    key={child._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6 mb-6"
                >
                    <div className="flex items-center mb-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mr-4">
                            <FaUserGraduate className="text-white text-xl" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-800">{child.name}</h2>
                            <p className="text-sm text-gray-600">
                                {child.studentClass ? `${child.studentClass.name} - ${child.studentClass.section}` : 'No class'}
                            </p>
                        </div>
                    </div>

                    {gradesData[child._id]?.length === 0 ? (
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
                                    {gradesData[child._id]?.map((grade) => (
                                        <tr key={grade._id} className="hover:bg-blue-50/50">
                                            <td className="py-3 px-4 font-semibold text-gray-800">{grade.subject?.name || 'N/A'}</td>
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
                </motion.div>
            ))}
        </div>
    );
};

export default AllGrades;
