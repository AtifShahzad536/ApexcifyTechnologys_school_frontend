import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { FaHome, FaUserGraduate, FaChalkboardTeacher, FaChalkboard, FaBook, FaUserCheck, FaTrophy, FaChartLine, FaChevronDown, FaChevronRight, FaClipboardList, FaClock, FaEdit, FaFileAlt, FaCalendarAlt, FaLaptop, FaMoneyBillAlt, FaTimes, FaVideo, FaPlus } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

const Sidebar = ({ isOpen, toggleSidebar }) => {
    const { userInfo } = useSelector((state) => state.auth);
    const location = useLocation();
    const [openMenus, setOpenMenus] = useState({});
    const [pendingCount, setPendingCount] = useState(0);

    const isActive = (path) => location.pathname === path;
    const isParentActive = (paths) => paths.some(path => location.pathname.startsWith(path));

    const toggleMenu = (menuKey) => {
        setOpenMenus(prev => ({
            ...prev,
            [menuKey]: !prev[menuKey]
        }));
    };

    // Fetch pending approval count
    const fetchPendingCount = async () => {
        try {
            if (userInfo?.role === 'Admin' && userInfo?.token) {
                const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/approvals/count`, {
                    headers: { Authorization: `Bearer ${userInfo.token}` }
                });
                setPendingCount(data.count || 0);
            }
        } catch (error) {
            console.error('Error fetching pending count:', error);
        }
    };

    // Poll for pending approvals every 30 seconds
    useEffect(() => {
        if (userInfo?.role === 'Admin') {
            fetchPendingCount(); // Initial fetch
            const interval = setInterval(fetchPendingCount, 30000); // Poll every 30 seconds
            return () => clearInterval(interval); // Cleanup on unmount
        }
    }, [userInfo]);

    // Navigation structure with submenus
    const navStructure = {
        Admin: [
            { path: '/admin/dashboard', label: 'Dashboard', icon: <FaHome /> },
            { path: '/admin/live-classes', label: 'Live Classes', icon: <FaVideo /> },
            { path: '/admin/schedule-meeting', label: 'Schedule Meeting', icon: <FaPlus /> },
            {
                path: '/admin/approvals',
                label: 'Pending Approvals',
                icon: <FaClock />,
                badge: pendingCount > 0 ? pendingCount : null
            },
            {
                label: 'Academic',
                icon: <FaBook />,
                key: 'admin-academic',
                submenu: [
                    { path: '/admin/classes', label: 'Classes', icon: <FaChalkboard /> },
                    { path: '/admin/subjects', label: 'Subjects', icon: <FaBook /> },
                ]
            },
            {
                label: 'Users',
                icon: <FaUserGraduate />,
                key: 'admin-users',
                submenu: [
                    { path: '/admin/manage-users', label: 'Manage Users', icon: <FaEdit /> },
                    { path: '/admin/students', label: 'Students', icon: <FaUserGraduate /> },
                    { path: '/admin/teachers', label: 'Teachers', icon: <FaChalkboardTeacher /> },
                ]
            },
            {
                label: 'Reports',
                icon: <FaChartLine />,
                key: 'admin-reports',
                submenu: [
                    { path: '/admin/reports/attendance', label: 'Attendance Report', icon: <FaUserCheck /> },
                ]
            },
            {
                label: 'School Calendar',
                icon: <FaCalendarAlt />,
                key: 'admin-calendar',
                submenu: [
                    { path: '/admin/calendar', label: 'Calendar & Timetable', icon: <FaCalendarAlt /> },
                    { path: '/admin/leaves', label: 'Leave Requests', icon: <FaClock /> },
                    { path: '/admin/fees', label: 'Fee Management', icon: <FaMoneyBillAlt /> },
                ]
            },
        ],
        Teacher: [
            { path: '/teacher/dashboard', label: 'Dashboard', icon: <FaHome /> },
            { path: '/teacher/live-classes', label: 'Live Classes', icon: <FaVideo /> },
            { path: '/teacher/classes', label: 'My Classes', icon: <FaChalkboard /> },
            {
                label: 'Management',
                icon: <FaTrophy />,
                key: 'teacher-management',
                submenu: [
                    { path: '/teacher/assignments', label: 'Assignments', icon: <FaClipboardList /> },
                    { path: '/teacher/attendance', label: 'Mark Attendance', icon: <FaUserCheck /> },
                    { path: '/teacher/grades', label: 'Add Grades', icon: <FaTrophy /> },
                    { path: '/teacher/materials', label: 'Course Materials', icon: <FaBook /> },
                    { path: '/teacher/leave', label: 'Apply Leave', icon: <FaClock /> },
                    { path: '/teacher/exams/create', label: 'Create Exam', icon: <FaLaptop /> },
                ]
            },
            {
                label: 'Reports',
                icon: <FaChartLine />,
                key: 'teacher-reports',
                submenu: [
                    { path: '/teacher/reports/attendance', label: 'Attendance Report', icon: <FaUserCheck /> },
                    { path: '/teacher/reports/generate', label: 'Generate Reports', icon: <FaFileAlt /> },
                ]
            },
        ],
        Student: [
            { path: '/student/dashboard', label: 'Dashboard', icon: <FaHome /> },
            { path: '/student/live-classes', label: 'Live Classes', icon: <FaVideo /> },
            {
                label: 'Course Content',
                icon: <FaBook />,
                key: 'student-course-content',
                submenu: [
                    { path: '/student/subjects', label: 'My Subjects', icon: <FaBook /> },
                    { path: '/student/assignments', label: 'Assignments', icon: <FaClipboardList /> },
                    { path: '/student/materials', label: 'Study Materials', icon: <FaBook /> },
                ]
            },
            { path: '/student/timetable', label: 'Timetable', icon: <FaCalendarAlt /> },
            { path: '/student/exams', label: 'Online Exams', icon: <FaLaptop /> },
            { path: '/student/leave', label: 'Apply Leave', icon: <FaClock /> },
            {
                label: 'Academic',
                icon: <FaTrophy />,
                key: 'student-academic',
                submenu: [
                    { path: '/student/grades', label: 'My Grades', icon: <FaTrophy /> },
                    { path: '/student/attendance', label: 'My Attendance', icon: <FaUserCheck /> },
                    { path: '/student/results', label: 'My Results', icon: <FaChartLine /> },
                ]
            },
        ],
        Parent: [
            { path: '/parent/dashboard', label: 'Dashboard', icon: <FaHome /> },
            { path: '/parent/live-classes', label: 'Live Classes', icon: <FaVideo /> },
            { path: '/parent/children', label: 'My Children', icon: <FaUserGraduate /> },
            {
                label: 'Academic',
                icon: <FaBook />,
                key: 'parent-academic',
                submenu: [
                    { path: '/parent/grades', label: 'All Grades', icon: <FaTrophy /> },
                    { path: '/parent/attendance', label: 'Attendance', icon: <FaUserCheck /> },
                    { path: '/parent/assignments', label: 'Assignments', icon: <FaClipboardList /> },
                ]
            },
            {
                label: 'Reports',
                icon: <FaFileAlt />,
                key: 'parent-reports',
                submenu: [
                    { path: '/parent/reports', label: 'View Reports', icon: <FaFileAlt /> },
                    { path: '/parent/fees', label: 'Fee Payment', icon: <FaMoneyBillAlt /> },
                ]
            },
        ]
    };

    const currentNav = navStructure[userInfo?.role] || [];

    return (
        <>
            {/* Mobile Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 md:hidden"
                    onClick={toggleSidebar}
                />
            )}

            {/* Sidebar */}
            <div
                className={`w-64 h-screen bg-white border-r border-gray-200 fixed left-0 top-0 overflow-y-auto z-50 flex flex-col font-sans transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
                    }`}
            >
                {/* Logo Section */}
                <div className="h-16 flex items-center justify-between px-8 border-b border-gray-100">
                    <div className="flex items-center justify-center">
                        <div className="bg-blue-600 p-2 rounded-lg mr-3 shadow-lg shadow-blue-500/30">
                            <FaBook className="text-lg text-white" />
                        </div>
                        <h1 className="text-xl font-extrabold tracking-tight text-gray-800">
                            Edu<span className="text-blue-600">Manager</span>
                        </h1>
                    </div>
                    {/* Close Button for Mobile */}
                    <button onClick={toggleSidebar} className="md:hidden text-gray-500 hover:text-red-500 transition-colors p-2 rounded-lg hover:bg-gray-100">
                        <FaTimes className="text-xl" />
                    </button>
                </div>

                {/* Navigation */}
                <nav className="flex-1 px-4 overflow-y-auto custom-scrollbar pb-4">
                    <ul className="space-y-1">
                        {currentNav.map((item, index) => {
                            if (item.submenu) {
                                // Parent menu with submenu
                                const isOpen = openMenus[item.key];
                                const hasActiveChild = isParentActive(item.submenu.map(sub => sub.path));

                                return (
                                    <li key={item.key || index}>
                                        <button
                                            onClick={() => toggleMenu(item.key)}
                                            className={`w-full flex items-center justify-between px-4 py-3.5 rounded-xl transition-all duration-300 ${hasActiveChild
                                                ? 'bg-blue-50 text-blue-600'
                                                : 'text-gray-500 hover:bg-blue-50 hover:text-blue-600'
                                                }`}
                                        >
                                            <div className="flex items-center">
                                                <span className={`mr-4 text-xl ${hasActiveChild ? 'text-blue-500' : 'text-gray-400'}`}>
                                                    {item.icon}
                                                </span>
                                                <span className="font-semibold text-sm tracking-wide">{item.label}</span>
                                            </div>
                                            {isOpen ? <FaChevronDown className="text-sm" /> : <FaChevronRight className="text-sm" />}
                                        </button>

                                        <AnimatePresence>
                                            {isOpen && (
                                                <motion.ul
                                                    initial={{ height: 0, opacity: 0 }}
                                                    animate={{ height: 'auto', opacity: 1 }}
                                                    exit={{ height: 0, opacity: 0 }}
                                                    transition={{ duration: 0.2 }}
                                                    className="ml-4 mt-1 space-y-1 overflow-hidden"
                                                >
                                                    {item.submenu.map((subItem) => (
                                                        <li key={subItem.path}>
                                                            <Link
                                                                to={subItem.path}
                                                                className={`flex items-center px-4 py-2.5 rounded-lg transition-all duration-300 ${isActive(subItem.path)
                                                                    ? 'bg-blue-600 text-white shadow-md'
                                                                    : 'text-gray-500 hover:bg-blue-50 hover:text-blue-600'
                                                                    }`}
                                                            >
                                                                <span className={`mr-3 text-base ${isActive(subItem.path) ? 'text-white' : 'text-gray-400'}`}>
                                                                    {subItem.icon}
                                                                </span>
                                                                <span className="font-medium text-sm">{subItem.label}</span>
                                                            </Link>
                                                        </li>
                                                    ))}
                                                </motion.ul>
                                            )}
                                        </AnimatePresence>
                                    </li>
                                );
                            } else {
                                // Regular menu item
                                return (
                                    <li key={item.path}>
                                        <Link
                                            to={item.path}
                                            className={`flex items-center justify-between px-4 py-3.5 rounded-xl transition-all duration-300 group relative overflow-hidden ${isActive(item.path)
                                                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25 translate-x-1'
                                                : 'text-gray-500 hover:bg-blue-50 hover:text-blue-600'
                                                }`}
                                        >
                                            <div className="flex items-center">
                                                <span className={`mr-4 text-xl relative z-10 transition-colors duration-300 ${isActive(item.path) ? 'text-white' : 'text-gray-400 group-hover:text-blue-500'
                                                    }`}>
                                                    {item.icon}
                                                </span>
                                                <span className="font-semibold text-sm tracking-wide relative z-10">{item.label}</span>
                                            </div>

                                            {/* Badge for count */}
                                            {item.badge && (
                                                <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${isActive(item.path)
                                                    ? 'bg-white text-blue-600'
                                                    : 'bg-red-500 text-white'
                                                    }`}>
                                                    {item.badge}
                                                </span>
                                            )}

                                            {/* Active State Decoration */}
                                            {isActive(item.path) && (
                                                <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-1 h-8 bg-white/20 rounded-l-full" />
                                            )}
                                        </Link>
                                    </li>
                                );
                            }
                        })}
                    </ul>
                </nav>
            </div>
        </>
    );
};

export default Sidebar;
