import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { FaClipboardList, FaUserGraduate } from 'react-icons/fa';

const AllAssignments = () => {
    const [children, setChildren] = useState([]);
    const [assignmentsData, setAssignmentsData] = useState({});
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

            // Fetch assignments for each child
            const assignments = {};
            for (const child of childrenData) {
                const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/parents/children/${child._id}/assignments`, { headers });
                assignments[child._id] = data;
            }
            setAssignmentsData(assignments);
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
                    All <span className="text-blue-600">Assignments</span>
                </h1>
                <p className="text-gray-500 mt-2">View assignments for all your children</p>
            </div>

            {children.map((child) => (
                <motion.div
                    key={child._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6 mb-6"
                >
                    <div className="flex items-center mb-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center mr-4">
                            <FaUserGraduate className="text-white text-xl" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-800">{child.name}</h2>
                            <p className="text-sm text-gray-600">
                                {child.studentClass ? `${child.studentClass.name} - ${child.studentClass.section}` : 'No class'}
                            </p>
                        </div>
                    </div>

                    {assignmentsData[child._id]?.length === 0 ? (
                        <p className="text-gray-500 text-center py-8">No assignments available</p>
                    ) : (
                        <div className="grid grid-cols-1 gap-4">
                            {assignmentsData[child._id]?.map((assignment) => (
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
                </motion.div>
            ))}
        </div>
    );
};

export default AllAssignments;
