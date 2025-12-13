import React, { useState } from 'react';
import Sidebar from './Sidebar';
import { Outlet, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../redux/slices/authSlice';
import { FaSignOutAlt, FaBars } from 'react-icons/fa';


const Layout = () => {
    const { userInfo } = useSelector((state) => state.auth);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const handleLogout = () => {
        dispatch(logout());
        navigate('/login');
    };

    return (
        <div className="flex bg-gray-50 min-h-screen font-sans">
            <Sidebar isOpen={isSidebarOpen} toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />

            <div className={`flex-1 flex flex-col h-screen overflow-x-hidden transition-all duration-300 ${isSidebarOpen ? 'ml-0' : 'ml-0 md:ml-64'}`}>
                {/* Top Header */}
                <header className="bg-white shadow-sm border-b border-gray-200 h-16 flex items-center justify-between px-4 md:px-8 z-10 w-full sticky top-0">
                    <div className="flex items-center">
                        <button
                            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                            className="md:hidden mr-4 text-gray-600 hover:text-blue-600 focus:outline-none"
                        >
                            <FaBars className="text-xl" />
                        </button>
                        <h2 className="text-lg md:text-xl font-bold text-gray-800 truncate max-w-[200px] md:max-w-none">
                            Welcome, <span className="text-blue-600">{userInfo?.name || 'User'}</span>
                        </h2>
                    </div>

                    <div className="flex items-center space-x-3 md:space-x-6">
                        <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-base md:text-lg shadow-md">
                                {userInfo?.name?.charAt(0).toUpperCase()}
                            </div>
                            <div className="hidden md:block text-sm">
                                <p className="font-semibold text-gray-700">{userInfo?.name}</p>
                                <p className="text-xs text-blue-600 font-medium">{userInfo?.role}</p>
                            </div>
                        </div>

                        <button
                            onClick={handleLogout}
                            className="flex items-center space-x-2 px-3 md:px-4 py-2 text-gray-600 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                            title="Logout"
                        >
                            <FaSignOutAlt className="text-lg" />
                            <span className="hidden md:inline text-sm font-medium">Logout</span>
                        </button>
                    </div>
                </header>

                {/* Main Content */}
                <div className="flex-1 overflow-y-auto bg-gray-50 w-full relative">


                    <div className={`${location.pathname.startsWith('/live-class') ? 'p-0' : 'p-4 md:p-8'}`}>
                        <Outlet />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Layout;
