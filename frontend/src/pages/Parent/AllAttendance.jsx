import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { FaCalendarCheck, FaUserGraduate } from 'react-icons/fa';

const AllAttendance = () => {
    const [children, setChildren] = useState([]);
    const [attendanceData, setAttendanceData] = useState({});
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

            // Fetch attendance for each child
            const attendance = {};
            for (const child of childrenData) {
                const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/parents/children/${child._id}/attendance`, { headers });
                attendance[child._id] = data;
            }
            setAttendanceData(attendance);
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
                    Attendance <span className="text-blue-600">Records</span>
                </h1>
                <p className="text-gray-500 mt-2">View attendance for all your children</p>
            </div>

            {children.map((child) => (
                <motion.div
                    key={child._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6 mb-6"
                >
                    <div className="flex items-center mb-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mr-4">
                            <FaUserGraduate className="text-white text-xl" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-800">{child.name}</h2>
                            <p className="text-sm text-gray-600">
                                {child.studentClass ? `${child.studentClass.name} - ${child.studentClass.section}` : 'No class'}
                            </p>
                        </div>
                    </div>

                    {attendanceData[child._id]?.length === 0 ? (
                        <p className="text-gray-500 text-center py-8">No attendance records</p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full">
                                <thead className="bg-green-50">
                                    <tr>
                                        <th className="py-3 px-4 text-left text-xs font-bold text-green-800 uppercase">Date</th>
                                        <th className="py-3 px-4 text-left text-xs font-bold text-green-800 uppercase">Subject</th>
                                        <th className="py-3 px-4 text-left text-xs font-bold text-green-800 uppercase">Status</th>
                                        <th className="py-3 px-4 text-left text-xs font-bold text-green-800 uppercase">Marked By</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {attendanceData[child._id]?.map((record) => (
                                        <tr key={record._id} className="hover:bg-green-50/50">
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
                </motion.div>
            ))}
        </div>
    );
};

export default AllAttendance;
