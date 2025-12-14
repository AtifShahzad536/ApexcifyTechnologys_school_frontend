import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaUserGraduate, FaEye } from 'react-icons/fa';

const MyChildren = () => {
    const [children, setChildren] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchChildren();
    }, []);

    const fetchChildren = async () => {
        try {
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/parents/children`, {
                headers: {
                    Authorization: `Bearer ${userInfo.token}`
                }
            });
            setChildren(data);
            setLoading(false);
        } catch (error) {
            console.error(error);
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-xl text-gray-600">Loading...</div>
            </div>
        );
    }

    return (
        <div className="bg-gray-50 min-h-screen">
            <div className="mb-6">
                <h1 className="text-3xl font-extrabold text-gray-800 tracking-tight">
                    My <span className="text-blue-600">Children</span>
                </h1>
                <p className="text-gray-500 mt-2">View and manage your children's information</p>
            </div>

            {children.length === 0 ? (
                <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-12 text-center">
                    <FaUserGraduate className="text-6xl text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-400 text-lg">No children assigned yet</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {children.map((child) => (
                        <motion.div
                            key={child._id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6 hover:shadow-2xl transition-shadow"
                        >
                            <div className="flex items-center mb-4">
                                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mr-4">
                                    <FaUserGraduate className="text-white text-2xl" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-gray-800">{child.name}</h3>
                                    <p className="text-sm text-gray-600">{child.email}</p>
                                </div>
                            </div>

                            <div className="space-y-2 mb-4">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Class:</span>
                                    <span className="font-semibold text-gray-800">
                                        {child.studentClass ?
                                            `${child.studentClass.name} - ${child.studentClass.section}` :
                                            'Not assigned'
                                        }
                                    </span>
                                </div>
                                {child.rollNumber && (
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">Roll Number:</span>
                                        <span className="font-semibold text-gray-800">{child.rollNumber}</span>
                                    </div>
                                )}
                            </div>

                            <Link
                                to={`/parent/children/${child._id}`}
                                className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 font-semibold"
                            >
                                <FaEye /> View Details
                            </Link>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default MyChildren;
