import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { FaBook } from 'react-icons/fa';
import { useSelector } from 'react-redux';

const MySubjects = () => {
    const { userInfo } = useSelector((state) => state.auth);
    const [subjects, setSubjects] = useState([]);

    useEffect(() => {
        if (userInfo?._id) {
            fetchSubjects();
        }
    }, [userInfo]);

    const fetchSubjects = async () => {
        try {
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            // Get student's class first
            const { data: studentData } = await axios.get(`${import.meta.env.VITE_API_URL}/students`, {
                headers: { Authorization: `Bearer ${userInfo.token}` }
            });
            const student = studentData.find(s => s._id === userInfo._id);

            if (student?.studentClass) {
                // Get subjects for student's class
                const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/subjects?classId=${student.studentClass._id}`, {
                    headers: { Authorization: `Bearer ${userInfo.token}` }
                });
                setSubjects(data);
            }
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div className="bg-gray-50 min-h-screen">
            <div className="mb-6">
                <h1 className="text-3xl font-extrabold text-gray-800 tracking-tight">
                    My <span className="text-blue-600">Subjects</span>
                </h1>
                <p className="text-gray-500 mt-2">View your enrolled subjects and teachers</p>
            </div>

            {subjects.length === 0 ? (
                <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-12 text-center">
                    <p className="text-gray-400 text-lg">No subjects found.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {subjects.map((subject) => (
                        <motion.div
                            key={subject._id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-2xl shadow-xl border border-blue-100 hover:shadow-2xl transition-shadow"
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className="bg-blue-600 p-3 rounded-xl">
                                    <FaBook className="text-2xl text-white" />
                                </div>
                                <span className="text-xs bg-blue-600 text-white px-3 py-1 rounded-full font-medium">
                                    {subject.code}
                                </span>
                            </div>

                            <h3 className="text-xl font-bold text-gray-800 mb-2">{subject.name}</h3>

                            <div className="space-y-2 text-sm mt-4">
                                <div className="flex items-center justify-between py-2 border-t border-blue-200">
                                    <span className="text-gray-600">Teacher:</span>
                                    <span className="font-semibold text-gray-800">{subject.teacher?.name}</span>
                                </div>
                                <div className="flex items-center justify-between py-2 border-t border-blue-200">
                                    <span className="text-gray-600">Credits:</span>
                                    <span className="font-semibold text-gray-800">{subject.credits}</span>
                                </div>
                            </div>

                            {subject.description && (
                                <p className="mt-4 text-xs text-gray-700 italic bg-white bg-opacity-50 p-3 rounded-lg border border-blue-200">
                                    {subject.description}
                                </p>
                            )}
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default MySubjects;
