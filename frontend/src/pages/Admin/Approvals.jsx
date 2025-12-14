
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { FaCheck, FaTimes, FaClock, FaUser, FaUserClock } from 'react-icons/fa';
import toast from 'react-hot-toast';

const Approvals = () => {
    const [pendingUsers, setPendingUsers] = useState([]);
    const [classes, setClasses] = useState([]);
    const [students, setStudents] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [showModal, setShowModal] = useState(false);

    // Form states
    const [role, setRole] = useState('Student');
    const [selectedClass, setSelectedClass] = useState('');
    const [rollNumber, setRollNumber] = useState('');
    const [selectedChildren, setSelectedChildren] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchPendingUsers();
        fetchClasses();
        fetchStudents();

        // Auto-refresh pending users every 30 seconds
        const interval = setInterval(() => {
            fetchPendingUsers();
        }, 30000);

        // Cleanup interval on unmount
        return () => clearInterval(interval);
    }, []);

    const fetchPendingUsers = async () => {
        try {
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/approvals/pending`, {
                headers: {
                    Authorization: `Bearer ${userInfo.token}`
                }
            });
            setPendingUsers(data);
        } catch (error) {
            console.error(error);
        }
    };

    const fetchClasses = async () => {
        try {
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            const { data } = await axios.get('http://localhost:5000/api/classes', {
                headers: {
                    Authorization: `Bearer ${userInfo.token}`
                }
            });
            setClasses(data);
        } catch (error) {
            console.error(error);
        }
    };

    const fetchStudents = async () => {
        try {
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/approvals/users`, {
                headers: {
                    Authorization: `Bearer ${userInfo.token}`
                }
            });
            // Filter only students
            setStudents(data.filter(u => u.role === 'Student'));
        } catch (error) {
            console.error(error);
        }
    };

    const openApprovalModal = (user) => {
        setSelectedUser(user);
        setRole('Student');
        setSelectedClass('');
        setRollNumber('');
        setSelectedChildren([]);
        setShowModal(true);
    };

    const handleApprove = async () => {
        if (!selectedUser) return;

        setLoading(true);
        try {
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            await axios.put(`http://localhost:5000/api/approvals/${selectedUser._id}/approve`, {
                role,
                studentClass: role === 'Student' ? selectedClass : null,
                rollNumber: role === 'Student' ? rollNumber : null,
                children: role === 'Parent' ? selectedChildren : null
            }, {
                headers: {
                    Authorization: `Bearer ${userInfo.token}`
                }
            });

            toast.success('User approved successfully!');
            setShowModal(false);
            fetchPendingUsers();
            setLoading(false);
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || 'Error approving user');
            setLoading(false);
        }
    };

    const handleReject = async (userId) => {
        if (!window.confirm('Are you sure you want to reject this user?')) return;

        try {
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            await axios.put(`http://localhost:5000/api/approvals/${userId}/reject`, {}, {
                headers: {
                    Authorization: `Bearer ${userInfo.token}`
                }
            });
            toast.success('User rejected');
            fetchPendingUsers();
        } catch (error) {
            console.error(error);
        }
    };

    const getTimeAgo = (date) => {
        const seconds = Math.floor((new Date() - new Date(date)) / 1000);
        const hours = Math.floor(seconds / 3600);
        if (hours < 1) return 'Just now';
        if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
        const days = Math.floor(hours / 24);
        return `${days} day${days > 1 ? 's' : ''} ago`;
    };

    return (
        <div className="bg-gray-50 min-h-screen p-4 sm:p-6">
            <div className="mb-4 sm:mb-6">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-800 tracking-tight">
                    Pending <span className="text-blue-600">Approvals</span>
                </h1>
                <p className="text-gray-500 mt-2 text-sm sm:text-base">Review and approve new user registrations</p>
            </div>

            {/* Stats */}
            <div className="mb-4 sm:mb-6 bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-center">
                <FaUserClock className="text-2xl sm:text-3xl text-blue-600 mr-3 sm:mr-4" />
                <div>
                    <p className="text-xs sm:text-sm text-gray-600">Pending Requests</p>
                    <p className="text-xl sm:text-2xl font-bold text-gray-800">{pendingUsers.length}</p>
                </div>
            </div>

            {/* Pending Users List */}
            {pendingUsers.length === 0 ? (
                <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-12 text-center">
                    <FaUserClock className="text-6xl text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-400 text-lg">No pending approval requests</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4">
                    {pendingUsers.map((user) => (
                        <motion.div
                            key={user._id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white rounded-xl shadow-lg border border-gray-200 p-4 sm:p-6 hover:shadow-xl transition-shadow overflow-hidden"
                        >
                            <div className="flex flex-col gap-3">
                                <div className="flex items-start gap-3">
                                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                                        <FaUser className="text-blue-600 text-xl" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-base sm:text-lg font-bold text-gray-800 truncate">{user.name}</h3>
                                        <p className="text-xs sm:text-sm text-gray-600 truncate">{user.email}</p>
                                        <p className="text-xs text-gray-500 mt-1">
                                            Requested: {getTimeAgo(user.requestedAt)}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex gap-2 w-full">
                                    <button
                                        onClick={() => openApprovalModal(user)}
                                        className="flex-1 bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-1.5 font-semibold text-xs sm:text-sm"
                                    >
                                        <FaCheck className="text-xs" /> Approve
                                    </button>
                                    <button
                                        onClick={() => handleReject(user._id)}
                                        className="flex-1 bg-red-600 text-white px-3 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center gap-1.5 font-semibold text-xs sm:text-sm"
                                    >
                                        <FaTimes className="text-xs" /> Reject
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}

            {/* Approval Modal */}
            <AnimatePresence>
                {showModal && selectedUser && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto"
                        onClick={() => setShowModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            className="bg-white rounded-2xl shadow-2xl p-6 sm:p-8 max-w-md w-full my-8 relative"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <h2 className="text-2xl font-bold text-gray-800 mb-4">Approve User</h2>
                            <p className="text-gray-600 mb-6">
                                Approving: <span className="font-semibold">{selectedUser.name}</span>
                            </p>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Assign Role</label>
                                    <select
                                        value={role}
                                        onChange={(e) => setRole(e.target.value)}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                    >
                                        <option value="Student">Student</option>
                                        <option value="Teacher">Teacher</option>
                                        <option value="Parent">Parent</option>
                                    </select>
                                </div>

                                {role === 'Student' && (
                                    <>
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">Assign Class</label>
                                            <select
                                                value={selectedClass}
                                                onChange={(e) => setSelectedClass(e.target.value)}
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white text-gray-900 appearance-auto"
                                                style={{ fontSize: '16px' }}
                                                required
                                            >
                                                <option value="">Select Class</option>
                                                {classes.map((cls) => (
                                                    <option key={cls._id} value={cls._id}>
                                                        {cls.name} - {cls.section}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">Roll Number</label>
                                            <input
                                                type="text"
                                                value={rollNumber}
                                                onChange={(e) => setRollNumber(e.target.value)}
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                                placeholder="e.g. 101"
                                            />
                                        </div>
                                    </>
                                )}

                                {role === 'Parent' && (
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Assign Children</label>
                                        <select
                                            multiple
                                            value={selectedChildren}
                                            onChange={(e) => setSelectedChildren(Array.from(e.target.selectedOptions, option => option.value))}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none min-h-[150px]"
                                        >
                                            {students.map(student => (
                                                <option key={student._id} value={student._id}>
                                                    {student.name} - {student.studentClass?.name || 'No Class'} ({student.rollNumber || 'No Roll'})
                                                </option>
                                            ))}
                                        </select>
                                        <p className="text-xs text-gray-500 mt-1">Hold Ctrl/Cmd to select multiple children</p>
                                    </div>
                                )}
                            </div>

                            <div className="flex gap-3 mt-6">
                                <button
                                    onClick={handleApprove}
                                    className="flex-1 bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 transition-colors"
                                    disabled={loading || (role === 'Student' && !selectedClass)}
                                >
                                    {loading ? 'Approving...' : 'Approve & Assign'}
                                </button>
                                <button
                                    onClick={() => setShowModal(false)}
                                    className="flex-1 bg-gray-200 text-gray-700 font-bold py-3 rounded-lg hover:bg-gray-300 transition-colors"
                                >
                                    Cancel
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Approvals;
