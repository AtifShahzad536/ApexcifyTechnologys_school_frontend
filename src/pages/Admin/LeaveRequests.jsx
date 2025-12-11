import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaCheck, FaTimes, FaClock } from 'react-icons/fa';

import toast from 'react-hot-toast';

const LeaveRequests = () => {
    const [leaves, setLeaves] = useState([]);

    const fetchPendingLeaves = async () => {
        try {
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/leaves/pending`, {
                headers: { Authorization: `Bearer ${userInfo.token}` }
            });
            setLeaves(data);
        } catch (error) {
            console.error(error);
            toast.error('Error fetching leaves');
        }
    };

    useEffect(() => {
        fetchPendingLeaves();
    }, []);

    const handleAction = async (id, status) => {
        if (!window.confirm(`Are you sure you want to ${status} this leave?`)) return;
        try {
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            await axios.put(
                `${import.meta.env.VITE_API_URL}/leaves/${id}`,
                { status },
                { headers: { Authorization: `Bearer ${userInfo.token}` } }
            );
            toast.success(`Leave ${status} successfully`);
            fetchPendingLeaves();
        } catch (error) {
            console.error(error);
            toast.error('Error updating leave status');
        }
    };

    return (
        <div className="bg-gray-50 min-h-screen">
            <div className="mb-6">
                <h1 className="text-3xl font-extrabold text-gray-800 tracking-tight">
                    Leave <span className="text-blue-600">Requests</span>
                </h1>
                <p className="text-gray-500 mt-2">Manage pending leave applications</p>
            </div>

            <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
                {leaves.length === 0 ? (
                    <div className="p-12 text-center text-gray-400">
                        <FaClock className="text-6xl mx-auto mb-4 opacity-20" />
                        <p>No pending leave requests</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        {/* Mobile View - Cards */}
                        <div className="md:hidden">
                            {leaves.map((leave) => (
                                <div key={leave._id} className="p-4 border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors">
                                    <div className="flex items-center mb-3">
                                        <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold mr-3">
                                            {leave.user?.name?.charAt(0)}
                                        </div>
                                        <div>
                                            <div className="font-bold text-gray-800">{leave.user?.name}</div>
                                            <div className="text-xs text-gray-500 capitalize">{leave.user?.role}</div>
                                        </div>
                                    </div>

                                    <div className="space-y-2 mb-4">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-500">Date:</span>
                                            <span className="font-medium text-gray-800">
                                                {new Date(leave.startDate).toLocaleDateString()} - {new Date(leave.endDate).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-500">Type:</span>
                                            <span className="font-medium text-gray-800 bg-gray-100 px-2 py-0.5 rounded text-xs">{leave.leaveType}</span>
                                        </div>
                                        <div className="bg-gray-50 p-3 rounded-lg text-sm text-gray-600 italic">
                                            "{leave.reason}"
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        <button
                                            onClick={() => handleAction(leave._id, 'Approved')}
                                            className="flex items-center justify-center px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors text-sm font-bold"
                                        >
                                            <FaCheck className="mr-2" /> Approve
                                        </button>
                                        <button
                                            onClick={() => handleAction(leave._id, 'Rejected')}
                                            className="flex items-center justify-center px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm font-bold"
                                        >
                                            <FaTimes className="mr-2" /> Reject
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Desktop View - Table */}
                        <table className="w-full hidden md:table">
                            <thead className="bg-gray-50 text-gray-600 font-semibold text-sm uppercase tracking-wider">
                                <tr>
                                    <th className="px-6 py-4 text-left">Applicant</th>
                                    <th className="px-6 py-4 text-left">Date</th>
                                    <th className="px-6 py-4 text-left">Type & Reason</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {leaves.map((leave) => (
                                    <tr key={leave._id} className="hover:bg-blue-50/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center">
                                                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold mr-3">
                                                    {leave.user?.name?.charAt(0)}
                                                </div>
                                                <div>
                                                    <div className="font-bold text-gray-800">{leave.user?.name}</div>
                                                    <div className="text-xs text-gray-500 capitalize">{leave.user?.role}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm text-gray-600">
                                                <div className="font-semibold">{new Date(leave.startDate).toLocaleDateString()}</div>
                                                <div className="text-xs">to {new Date(leave.endDate).toLocaleDateString()}</div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="inline-block px-2 py-1 rounded text-xs font-bold bg-gray-100 text-gray-600 mb-1">
                                                {leave.leaveType}
                                            </span>
                                            <p className="text-sm text-gray-600 line-clamp-2">{leave.reason}</p>
                                        </td>
                                        <td className="px-6 py-4 text-right space-x-2">
                                            <button
                                                onClick={() => handleAction(leave._id, 'Approved')}
                                                className="inline-flex items-center px-3 py-1 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors text-sm font-bold"
                                            >
                                                <FaCheck className="mr-1" /> Approve
                                            </button>
                                            <button
                                                onClick={() => handleAction(leave._id, 'Rejected')}
                                                className="inline-flex items-center px-3 py-1 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm font-bold"
                                            >
                                                <FaTimes className="mr-1" /> Reject
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default LeaveRequests;
