import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { FaUserGraduate, FaChalkboardTeacher, FaUserShield, FaUsers, FaEdit, FaTrash, FaSearch } from 'react-icons/fa';
import toast from 'react-hot-toast';



const ManageUsers = () => {
    const [users, setUsers] = useState([]);
    const [classes, setClasses] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [students, setStudents] = useState([]); // New State
    const [searchTerm, setSearchTerm] = useState('');
    const [filterRole, setFilterRole] = useState('All');

    const [selectedUser, setSelectedUser] = useState(null);
    const [showModal, setShowModal] = useState(false);

    // Edit form states
    const [editRole, setEditRole] = useState('');
    const [editClass, setEditClass] = useState('');
    const [editRollNumber, setEditRollNumber] = useState('');
    const [selectedChildren, setSelectedChildren] = useState([]); // New State
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchUsers();
        fetchClasses();
        fetchSubjects();
        fetchStudents(); // Fetch students
    }, []);

    const fetchUsers = async () => {
        try {
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/approvals/users`, {
                headers: {
                    Authorization: `Bearer ${userInfo.token}`
                }
            });
            setUsers(data);
        } catch (error) {
            console.error(error);
        }
    };

    // Helper to fetch all students independently or derive from users if acceptable. 
    // Since 'users' contains all approved users including students, we might not need a separate API call if 'users' is already populated.
    // However, fetchUsers updates 'users' state. 
    // Let's rely on 'users' state for students list to avoid extra API call if possible, 
    // BUT 'users' state might be filtered or empty initially. 
    // Safer to just filter `data` in `fetchUsers` or generic `fetchStudents`.
    // Actually, `fetchUsers` gets all approved users. So I can just derive students from `users` state or fetch them separately to be sure.
    // Let's implement `fetchStudents` specifically to ensure we have a clean list even if main list is paginated in future.
    // For now, reuse the /approvals/users endpoint.

    const fetchStudents = async () => {
        try {
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/approvals/users`, {
                headers: { Authorization: `Bearer ${userInfo.token}` }
            });
            setStudents(data.filter(u => u.role === 'Student'));
        } catch (error) {
            console.error(error);
        }
    };

    const fetchClasses = async () => {
        try {
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/classes`, {
                headers: { Authorization: `Bearer ${userInfo.token}` }
            });
            setClasses(data);
        } catch (error) {
            console.error(error);
        }
    };

    const fetchSubjects = async () => {
        try {
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/subjects`, {
                headers: { Authorization: `Bearer ${userInfo.token}` }
            });
            setSubjects(data);
        } catch (error) {
            console.error(error);
        }
    };

    const openEditModal = (user) => {
        setSelectedUser(user);
        setEditRole(user.role || 'Student');
        setEditClass(user.studentClass?._id || '');
        setEditRollNumber(user.rollNumber || '');
        // Map children to IDs. Handle case where children might be populated objects or just IDs.
        // Based on controller, it populates children.
        setSelectedChildren(user.children ? user.children.map(c => c._id || c) : []);
        setShowModal(true);
    };

    const handleUpdate = async () => {
        if (!selectedUser) return;

        setLoading(true);
        try {
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            await axios.put(`${import.meta.env.VITE_API_URL}/approvals/${selectedUser._id}/update`, {
                role: editRole,
                studentClass: editRole === 'Student' ? editClass : null,
                rollNumber: editRole === 'Student' ? editRollNumber : null,
                children: editRole === 'Parent' ? selectedChildren : [] // Send children
            }, {
                headers: {
                    Authorization: `Bearer ${userInfo.token}`
                }
            });

            toast.success('User updated successfully!');
            setShowModal(false);
            fetchUsers();
            setLoading(false);
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || 'Error updating user');
            setLoading(false);
        }
    };

    const handleDelete = async (userId, userName) => {
        if (!window.confirm(`Are you sure you want to delete ${userName}?`)) return;

        try {
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            await axios.delete(`${import.meta.env.VITE_API_URL}/approvals/users/${userId}`, {
                headers: { Authorization: `Bearer ${userInfo.token}` }
            });
            toast.success('User deleted successfully');
            fetchUsers(); // Refresh list
        } catch (error) {
            const message = error.response?.data?.message || error.message;
            toast.error(message);
        }
    };

    const getRoleConfig = (role) => {
        switch (role) {
            case 'Student':
                return { icon: FaUserGraduate, bgColor: 'bg-blue-100', textColor: 'text-blue-600', badgeColor: 'bg-blue-100 text-blue-700' };
            case 'Teacher':
                return { icon: FaChalkboardTeacher, bgColor: 'bg-green-100', textColor: 'text-green-600', badgeColor: 'bg-green-100 text-green-700' };
            case 'Parent':
                return { icon: FaUsers, bgColor: 'bg-purple-100', textColor: 'text-purple-600', badgeColor: 'bg-purple-100 text-purple-700' };
            case 'Admin':
                return { icon: FaUserShield, bgColor: 'bg-red-100', textColor: 'text-red-600', badgeColor: 'bg-red-100 text-red-700' };
            default:
                return { icon: FaUserGraduate, bgColor: 'bg-gray-100', textColor: 'text-gray-600', badgeColor: 'bg-gray-100 text-gray-700' };
        }
    };

    const filteredUsers = users.filter(user => {
        const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesRole = filterRole === 'All' || user.role === filterRole;
        return matchesSearch && matchesRole;
    });

    return (
        <div className="bg-gray-50 min-h-screen overflow-x-hidden">
            <div className="mb-6">
                <h1 className="text-3xl font-extrabold text-gray-800 tracking-tight">
                    Manage <span className="text-blue-600">Users</span>
                </h1>
                <p className="text-gray-500 mt-2">Edit user details, assign classes and roles</p>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-4 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="relative">
                        <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search by name or email..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-base"
                        />
                    </div>
                    <div>
                        <select
                            value={filterRole}
                            onChange={(e) => setFilterRole(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-base"
                        >
                            <option value="All">All Roles</option>
                            <option value="Student">Students</option>
                            <option value="Teacher">Teachers</option>
                            <option value="Parent">Parents</option>
                            <option value="Admin">Admins</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Mobile View - Cards */}
            <div className="md:hidden space-y-4 mb-6">
                {filteredUsers.map((user) => {
                    const roleConfig = getRoleConfig(user.role);
                    const RoleIcon = roleConfig.icon;
                    return (
                        <div key={user._id} className="bg-white p-4 rounded-xl shadow-md border border-gray-200">
                            <div className="flex items-center mb-4">
                                <div className={`w-12 h-12 rounded-full flex items-center justify-center mr-4 ${roleConfig.bgColor}`}>
                                    <RoleIcon className={`text-xl ${roleConfig.textColor}`} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-800 text-lg">{user.name}</h3>
                                    <p className="text-sm text-gray-500 break-all">{user.email}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3 mb-4">
                                <div className="bg-gray-50 p-2 rounded-lg">
                                    <span className="block text-xs font-bold text-gray-400 uppercase">Role</span>
                                    <span className={`text-sm font-semibold ${roleConfig.textColor}`}>{user.role || 'N/A'}</span>
                                </div>
                                <div className="bg-gray-50 p-2 rounded-lg">
                                    <span className="block text-xs font-bold text-gray-400 uppercase">Class</span>
                                    <span className="text-sm font-semibold text-gray-700">
                                        {user.studentClass ? `${user.studentClass.name}-${user.studentClass.section}` : '-'}
                                    </span>
                                </div>
                                <div className="bg-gray-50 p-2 rounded-lg">
                                    <span className="block text-xs font-bold text-gray-400 uppercase">Roll No</span>
                                    <span className="text-sm font-semibold text-gray-700">{user.rollNumber || '-'}</span>
                                </div>
                            </div>

                            <div className="flex gap-2">
                                <button
                                    onClick={() => openEditModal(user)}
                                    className="flex-1 bg-blue-600 text-white py-2.5 rounded-lg font-semibold flex items-center justify-center gap-2 hover:bg-blue-700 transition"
                                >
                                    <FaEdit /> Edit
                                </button>
                                <button
                                    onClick={() => handleDelete(user._id, user.name)}
                                    className="flex-1 bg-red-500 text-white py-2.5 rounded-lg font-semibold flex items-center justify-center gap-2 hover:bg-red-600 transition"
                                >
                                    <FaTrash /> Delete
                                </button>
                            </div>
                        </div>
                    );
                })}
                {filteredUsers.length === 0 && (
                    <div className="text-center py-8 text-gray-400">No users found</div>
                )}
            </div>

            {/* Desktop View - Table */}
            <div className="hidden md:block bg-white rounded-xl shadow-lg border border-gray-200">
                <div className="overflow-x-auto w-full custom-scrollbar">
                    <table className="min-w-full">
                        <thead className="bg-blue-50">
                            <tr>
                                <th className="py-3 px-4 text-left text-xs font-bold text-blue-800 uppercase">Name</th>
                                <th className="py-3 px-4 text-left text-xs font-bold text-blue-800 uppercase">Email</th>
                                <th className="py-3 px-4 text-left text-xs font-bold text-blue-800 uppercase">Role</th>
                                <th className="py-3 px-4 text-left text-xs font-bold text-blue-800 uppercase">Class</th>
                                <th className="py-3 px-4 text-left text-xs font-bold text-blue-800 uppercase">Roll No</th>
                                <th className="py-3 px-4 text-center text-xs font-bold text-blue-800 uppercase">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredUsers.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="py-12 text-center text-gray-400">
                                        No users found
                                    </td>
                                </tr>
                            ) : (
                                filteredUsers.map((user) => {
                                    const roleConfig = getRoleConfig(user.role);
                                    const RoleIcon = roleConfig.icon;
                                    return (
                                        <tr key={user._id} className="hover:bg-blue-50/50 transition-colors">
                                            <td className="py-3 px-4">
                                                <div className="flex items-center">
                                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${roleConfig.bgColor}`}>
                                                        <RoleIcon className={roleConfig.textColor} />
                                                    </div>
                                                    <span className="font-semibold text-gray-800">{user.name}</span>
                                                </div>
                                            </td>
                                            <td className="py-3 px-4 text-gray-600">{user.email}</td>
                                            <td className="py-3 px-4">
                                                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${roleConfig.badgeColor}`}>
                                                    {user.role || 'Not Assigned'}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4 text-gray-600">
                                                {user.studentClass ?
                                                    `${user.studentClass.name} - ${user.studentClass.section}` :
                                                    <span className="text-orange-500 italic">Unassigned</span>
                                                }
                                            </td>
                                            <td className="py-3 px-4 text-gray-600">
                                                {user.rollNumber || <span className="text-gray-400 italic">-</span>}
                                            </td>
                                            <td className="py-3 px-4 text-center">
                                                <div className="flex gap-2 justify-center">
                                                    <button
                                                        onClick={() => openEditModal(user)}
                                                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center gap-2 font-semibold text-sm"
                                                    >
                                                        <FaEdit /> Edit
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(user._id, user.name)}
                                                        className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors inline-flex items-center gap-2 font-semibold text-sm"
                                                    >
                                                        <FaTrash /> Delete
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Edit Modal */}
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
                            <h2 className="text-2xl font-bold text-gray-800 mb-4">Edit User Details</h2>
                            <p className="text-gray-600 mb-6">
                                Editing: <span className="font-semibold">{selectedUser.name}</span>
                            </p>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Role</label>
                                    <select
                                        value={editRole}
                                        onChange={(e) => setEditRole(e.target.value)}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                    >
                                        <option value="Student">Student</option>
                                        <option value="Teacher">Teacher</option>
                                        <option value="Parent">Parent</option>
                                        <option value="Admin">Admin</option>
                                    </select>
                                </div>

                                {editRole === 'Student' && (
                                    <>
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">Assign Class</label>
                                            <select
                                                value={editClass}
                                                onChange={(e) => setEditClass(e.target.value)}
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white text-gray-900 appearance-auto"
                                                style={{ fontSize: '16px' }}
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
                                                value={editRollNumber}
                                                onChange={(e) => setEditRollNumber(e.target.value)}
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                                placeholder="e.g. 101"
                                            />
                                        </div>
                                    </>
                                )}

                                {editRole === 'Parent' && (
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Assign Children</label>
                                        <div className="border border-gray-300 rounded-lg overflow-y-auto max-h-48 divide-y divide-gray-100">
                                            {students.map(student => (
                                                <div
                                                    key={student._id}
                                                    onClick={() => setSelectedChildren(prev => prev.includes(student._id) ? prev.filter(id => id !== student._id) : [...prev, student._id])}
                                                    className={`p-3 flex items-center cursor-pointer transition-colors ${selectedChildren.includes(student._id) ? 'bg-blue-50' : 'hover:bg-gray-50'}`}
                                                >
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedChildren.includes(student._id)}
                                                        onChange={() => { }} // handled by div click
                                                        className="mr-3 h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
                                                    />
                                                    <div>
                                                        <p className="text-sm font-semibold text-gray-800">{student.name}</p>
                                                        <p className="text-xs text-gray-500">{student.email}</p>
                                                    </div>
                                                </div>
                                            ))}
                                            {students.length === 0 && (
                                                <div className="p-4 text-center text-gray-400 text-sm">No students found</div>
                                            )}
                                        </div>
                                        <p className="text-xs text-gray-400 mt-1">Select one or more students to link as children.</p>
                                    </div>
                                )}
                            </div>

                            <div className="flex gap-3 mt-6">
                                <button
                                    onClick={handleUpdate}
                                    className="flex-1 bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 transition-colors"
                                    disabled={loading}
                                >
                                    {loading ? 'Updating...' : 'Update User'}
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

export default ManageUsers;
