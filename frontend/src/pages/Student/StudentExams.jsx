import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaLaptop, FaCheckCircle, FaClock, FaHistory, FaStar } from 'react-icons/fa';
import { useSelector } from 'react-redux';

const StudentExams = () => {
    const { userInfo } = useSelector((state) => state.auth);
    const [exams, setExams] = useState([]);
    const [activeTab, setActiveTab] = useState('upcoming'); // upcoming | completed
    const navigate = useNavigate();

    useEffect(() => {
        if (userInfo?._id) {
            fetchExams();
        }
    }, [userInfo]);

    const fetchExams = async () => {
        try {
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/exams`, {
                headers: { Authorization: `Bearer ${userInfo.token}` }
            });
            setExams(data);
        } catch (error) {
            console.error(error);
        }
    };

    const upcomingExams = exams.filter(e => !e.submitted);
    const completedExams = exams.filter(e => e.submitted);

    const handleStartExam = (id) => {
        // Validation: Check start time
        // For demo, allowing anytime if basic check matches
        navigate(`/student/exams/${id}/take`);
    };

    return (
        <div className="bg-gray-50 min-h-screen">
            <div className="mb-6 flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-extrabold text-gray-800 tracking-tight">
                        Online <span className="text-blue-600">Exams</span>
                    </h1>
                    <p className="text-gray-500 mt-2">Take exams and view your results</p>
                </div>
                <div className="flex bg-white rounded-lg p-1 border border-gray-200">
                    <button
                        onClick={() => setActiveTab('upcoming')}
                        className={`px-4 py-2 rounded-md font-medium transition-colors ${activeTab === 'upcoming' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-50'}`}
                    >
                        Upcoming
                    </button>
                    <button
                        onClick={() => setActiveTab('completed')}
                        className={`px-4 py-2 rounded-md font-medium transition-colors ${activeTab === 'completed' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-50'}`}
                    >
                        Results
                    </button>
                </div>
            </div>

            {activeTab === 'upcoming' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {upcomingExams.length === 0 ? (
                        <div className="col-span-3 text-center py-12 text-gray-400">
                            No upcoming exams
                        </div>
                    ) : upcomingExams.map((exam) => (
                        <motion.div
                            key={exam._id}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden"
                        >
                            <div className="bg-blue-600 p-4 text-white flex justify-between items-center">
                                <span className="font-bold text-lg">{exam.subject?.name}</span>
                                <FaLaptop className="text-2xl opacity-50" />
                            </div>
                            <div className="p-6">
                                <h3 className="text-xl font-bold text-gray-800 mb-2">{exam.title}</h3>
                                <div className="space-y-2 text-sm text-gray-600 mb-6">
                                    <div className="flex items-center">
                                        <FaClock className="mr-2 text-blue-500" />
                                        Duration: {exam.duration} Minutes
                                    </div>
                                    <div className="flex items-center">
                                        <FaStar className="mr-2 text-yellow-500" />
                                        Total Marks: {exam.totalMarks}
                                    </div>
                                    <div className="flex items-center mt-2">
                                        <span className="font-semibold text-gray-700">Scheduled:</span>
                                        <span className="ml-2">{new Date(exam.startTime).toLocaleString()}</span>
                                    </div>
                                </div>
                                <button
                                    onClick={() => handleStartExam(exam._id)}
                                    // Disable if before start time? 
                                    // For simplicity enabling always or assume time passed.
                                    className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/30"
                                >
                                    Start Exam
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </div>
            ) : (
                <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
                    {completedExams.length === 0 ? (
                        <div className="p-12 text-center text-gray-400">
                            No completed exams
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-100">
                            {completedExams.map((exam) => (
                                <div key={exam._id} className="p-6 flex items-center justify-between hover:bg-gray-50 transition-colors">
                                    <div>
                                        <h3 className="font-bold text-gray-800 text-lg">{exam.title}</h3>
                                        <p className="text-sm text-gray-500">{exam.subject?.name} • {new Date(exam.startTime).toLocaleDateString()}</p>
                                    </div>
                                    <div className="flex items-center space-x-6">
                                        <div className="text-right">
                                            <p className="text-xs text-gray-400 uppercase font-bold">Score</p>
                                            <p className="text-2xl font-extrabold text-blue-600">{exam.score} <span className="text-sm text-gray-400 font-normal">/ {exam.totalMarks}</span></p>
                                        </div>
                                        <div className="h-10 w-10 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                                            <FaCheckCircle />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default StudentExams;
