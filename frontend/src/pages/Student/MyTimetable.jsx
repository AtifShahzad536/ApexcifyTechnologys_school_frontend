import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaCalendarAlt, FaClock, FaChalkboardTeacher, FaMapMarkerAlt, FaVideo } from 'react-icons/fa';
import { useSelector } from 'react-redux';

const MyTimetable = () => {
    const { userInfo } = useSelector((state) => state.auth);
    const navigate = useNavigate();
    const [timetable, setTimetable] = useState(null);
    const [events, setEvents] = useState([]);
    const [activeTab, setActiveTab] = useState('timetable');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (userInfo?._id) {
            fetchData();
        }
    }, [userInfo]);

    const fetchData = async () => {
        try {
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));

            // Fetch events
            const eventsRes = await axios.get(`${import.meta.env.VITE_API_URL}/calendar/events`, {
                headers: { Authorization: `Bearer ${userInfo.token}` }
            });
            setEvents(eventsRes.data);

            // Fetch student class and timetable
            const studentProfile = await axios.get(`${import.meta.env.VITE_API_URL}/students/${userInfo._id}`, {
                headers: { Authorization: `Bearer ${userInfo.token}` }
            });


            // Handle both populated object and direct ID string
            const classData = studentProfile.data.studentClass;
            const classId = typeof classData === 'object' ? classData?._id : classData;


            if (classId) {
                const timetableRes = await axios.get(`${import.meta.env.VITE_API_URL}/calendar/timetable/${classId}`, {
                    headers: { Authorization: `Bearer ${userInfo.token}` }
                });

                setTimetable(timetableRes.data);
            } else {

                // Could set a specific state to show "No class assigned"
            }
            setLoading(false);
        } catch (error) {
            console.error('Fetch Timetable Error:', error);



            setLoading(false);
        }
    };

    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });

    return (
        <div className="bg-gray-50 min-h-screen">
            <div className="mb-6 flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-extrabold text-gray-800 tracking-tight">
                        My <span className="text-blue-600">Schedule</span>
                    </h1>
                    <p className="text-gray-500 mt-2">View your classes and upcoming events</p>
                </div>
                <div className="flex bg-white rounded-lg p-1 border border-gray-200">
                    <button
                        onClick={() => setActiveTab('timetable')}
                        className={`px-4 py-2 rounded-md font-medium transition-colors ${activeTab === 'timetable' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-50'}`}
                    >
                        Timetable
                    </button>
                    <button
                        onClick={() => setActiveTab('events')}
                        className={`px-4 py-2 rounded-md font-medium transition-colors ${activeTab === 'events' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-50'}`}
                    >
                        Events
                    </button>
                </div>
            </div>

            {activeTab === 'timetable' ? (
                <div className="space-y-6">
                    {!timetable ? (
                        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-12 text-center text-gray-400">
                            Timetable not available yet. (Ensure you are assigned to a class)
                        </div>
                    ) : (
                        days.map((day) => {
                            // Robust check for day property (handle legacy 'name' if exists)
                            const dayData = timetable.days?.find(td => (td.day || td.name) === day);
                            const isToday = day === today;

                            return (
                                <motion.div
                                    key={day}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className={`bg-white rounded-2xl shadow-md border overflow-hidden ${isToday ? 'border-blue-500 ring-4 ring-blue-500/10' : 'border-gray-200'}`}
                                >
                                    <div className={`px-6 py-3 font-bold flex justify-between items-center ${isToday ? 'bg-blue-600 text-white' : 'bg-gray-50 text-gray-700 border-b border-gray-200'}`}>
                                        <span>{day}</span>
                                        {isToday && <span className="text-xs bg-white/20 px-2 py-1 rounded">Today</span>}
                                    </div>

                                    <div className="p-6">
                                        {!dayData || dayData.periods.length === 0 ? (
                                            <p className="text-gray-400 text-sm italic">No classes scheduled</p>
                                        ) : (
                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                                {dayData.periods.sort((a, b) => a.startTime.localeCompare(b.startTime)).map((period, idx) => (
                                                    <div key={idx} className="bg-gray-50 rounded-xl p-4 border border-gray-100 hover:border-blue-300 transition-colors group">
                                                        <div className="flex justify-between items-start mb-2">
                                                            <span className="font-bold text-gray-800 text-lg">{period.subject?.name}</span>
                                                            <span className="text-xs font-mono bg-white px-2 py-1 rounded border border-gray-200 text-gray-600">
                                                                {period.startTime} - {period.endTime}
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center justify-between mt-2">
                                                            <div className="flex items-center text-sm text-gray-600">
                                                                <FaChalkboardTeacher className="mr-2 text-blue-500" />
                                                                {period.teacher?.name}
                                                            </div>
                                                            {period.isOnline && (
                                                                <button
                                                                    onClick={() => {
                                                                        // Use ClassID + SubjectName to ensure consistency
                                                                        const safeClassName = period.subject?.name.replace(/\s+/g, '') || 'Class';
                                                                        const roomId = `EduManager-${timetable.class}-${safeClassName}`;
                                                                        navigate(`/live-class/${roomId}`);
                                                                    }}
                                                                    className="flex items-center px-3 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded-full hover:bg-blue-600 hover:text-white transition-all transform hover:scale-105 shadow-sm"
                                                                    title="Join Live Class"
                                                                >
                                                                    <FaVideo className="mr-1" />
                                                                    Join Live
                                                                </button>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            );
                        })
                    )}
                </div>
            ) : (
                <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6">
                    <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
                        <FaCalendarAlt className="mr-3 text-blue-600" />
                        Upcoming Events
                    </h2>

                    {events.length === 0 ? (
                        <p className="text-gray-400 text-center py-8">No events scheduled</p>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {events.map((event) => (
                                <motion.div
                                    key={event._id}
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="border border-gray-100 rounded-xl p-4 hover:shadow-lg transition-all bg-gray-50"
                                >
                                    <div className="flex items-start space-x-4">
                                        <div className="flex-shrink-0 w-16 text-center bg-white rounded-lg p-2 shadow-sm border border-gray-100">
                                            <div className="text-xs font-bold uppercase text-blue-600">{new Date(event.date).toLocaleString('default', { month: 'short' })}</div>
                                            <div className="text-2xl font-extrabold text-gray-800">{new Date(event.date).getDate()}</div>
                                        </div>
                                        <div>
                                            <span className={`text-xs px-2 py-1 rounded-full font-medium mb-2 inline-block ${event.type === 'Holiday' ? 'bg-green-100 text-green-700' :
                                                event.type === 'Exam' ? 'bg-red-100 text-red-700' :
                                                    'bg-blue-100 text-blue-700'
                                                }`}>
                                                {event.type}
                                            </span>
                                            <h3 className="font-bold text-gray-800 line-clamp-1">{event.title}</h3>
                                            <p className="text-sm text-gray-600 line-clamp-2 mt-1">{event.description}</p>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default MyTimetable;
