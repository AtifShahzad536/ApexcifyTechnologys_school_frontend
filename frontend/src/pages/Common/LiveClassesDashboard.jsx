import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { FaVideo, FaChalkboardTeacher, FaCalendarAlt, FaExternalLinkAlt } from 'react-icons/fa';
import { motion } from 'framer-motion';

const LiveClassesDashboard = () => {
    const { userInfo } = useSelector((state) => state.auth);
    const navigate = useNavigate();
    const [meetings, setMeetings] = useState([]);
    const [subjects, setSubjects] = useState([]); // For Teachers
    const [timetable, setTimetable] = useState(null); // For Students
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (userInfo?._id) {
            fetchData();
        }
    }, [userInfo]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };

            // 1. Fetch Meetings (Common for all)
            const eventsRes = await axios.get(`${import.meta.env.VITE_API_URL}/calendar/events`, config);
            const onlineMeetings = eventsRes.data.filter(
                e => e.type === 'Meeting' && e.isOnline && new Date(e.date) >= new Date(new Date().setHours(0, 0, 0, 0))
            );
            setMeetings(onlineMeetings);

            // 2. Fetch Role-Specific Data
            if (userInfo.role === 'Teacher') {
                const subjectsRes = await axios.get(`${import.meta.env.VITE_API_URL}/subjects?teacherId=${userInfo._id}`, config);
                setSubjects(subjectsRes.data);
            } else if (userInfo.role === 'Student') {
                // Fetch student's profile to get class
                const profileRes = await axios.get(`${import.meta.env.VITE_API_URL}/students/${userInfo._id}`, config);
                const classObj = profileRes.data.studentClass;
                const classId = classObj?._id || classObj;

                if (classId) {
                    // Fetch timetable to find which subjects have online classes
                    const timetableRes = await axios.get(`${import.meta.env.VITE_API_URL}/calendar/timetable/${classId}`, config);
                    const timetableData = timetableRes.data;

                    // Get all unique subject IDs that have online periods
                    const onlineSubjectIds = new Set();
                    timetableData?.days?.forEach(day => {
                        day.periods?.forEach(period => {
                            if (period.isOnline && period.subject?._id) {
                                onlineSubjectIds.add(period.subject._id);
                            }
                        });
                    });

                    // Fetch all subjects for the class
                    const subjectsRes = await axios.get(`${import.meta.env.VITE_API_URL}/subjects?classId=${classId}`, config);

                    // Filter to show only subjects that have online classes configured
                    const onlineSubjects = subjectsRes.data.filter(subject =>
                        onlineSubjectIds.has(subject._id)
                    );

                    setSubjects(onlineSubjects);
                    setTimetable(timetableData);
                }
            }

            setLoading(false);
        } catch (error) {
            console.error(error);
            setLoading(false);
        }
    };

    const handleJoinClass = (subjectOrPeriod, isTeacher) => {
        // Unified Room Generation Logic
        let subjectName = "";
        let classId = "";

        if (isTeacher) {
            // subjectOrPeriod is 'subject' object
            subjectName = subjectOrPeriod.name;
            classId = subjectOrPeriod.class?._id;
        } else {
            // subjectOrPeriod is 'period' object
            subjectName = subjectOrPeriod.subject?.name;
            classId = timetable?.class;
        }

        if (subjectName && classId) {
            const safeClassName = subjectName.replace(/\s+/g, '');
            const roomId = `EduManager-${classId}-${safeClassName}`;
            navigate(`/live-class/${roomId}`);
        }
    };

    const cardVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
    };

    return (
        <div className="bg-gray-50 min-h-screen">
            <div className="mb-8">
                <h1 className="text-3xl font-extrabold text-gray-800 tracking-tight flex items-center">
                    <FaVideo className="mr-3 text-blue-600" />
                    Live <span className="text-blue-600 ml-2">Classes & Meetings</span>
                </h1>
                <p className="text-gray-500 mt-2">Manage and join your online video sessions from one place.</p>
            </div>

            {/* Safety Check for User Info */}
            {!userInfo ? (
                <div className="text-center py-8 text-gray-500">
                    <p>Loading user information...</p>
                </div>
            ) : (
                <>
                    {/* SECTION 1: LIVE CLASSES (Teacher/Student Only) */}
                    {(userInfo.role === 'Teacher' || userInfo.role === 'Student') && (
                        <div className="mb-10">
                            <h2 className="text-xl font-bold text-gray-700 mb-4 border-l-4 border-blue-500 pl-3">
                                {userInfo.role === 'Teacher' ? 'Your Classrooms' : 'Your Scheduled Classes'}
                            </h2>

                            {loading ? (
                                <p className="text-gray-400">Loading...</p>
                            ) : (userInfo.role === 'Teacher' && subjects.length === 0) ? (
                                <p className="text-gray-400 italic">No subjects assigned.</p>
                            ) : (userInfo.role === 'Student' && subjects.length === 0) ? (
                                <p className="text-gray-400 italic">No subjects found for your class.</p>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {/* Teacher View */}
                                    {userInfo.role === 'Teacher' && subjects.map((subject) => (
                                        <motion.div
                                            key={subject._id}
                                            variants={cardVariants}
                                            initial="hidden"
                                            animate="visible"
                                            className="bg-white rounded-xl shadow-md p-6 border border-gray-100 hover:shadow-lg transition-shadow"
                                        >
                                            <div className="flex justify-between items-start mb-4">
                                                <div>
                                                    <h3 className="font-bold text-lg text-gray-800">{subject.name}</h3>
                                                    <p className="text-sm text-gray-500">Class: {subject.class?.name}</p>
                                                </div>
                                                <div className="bg-blue-100 p-2 rounded-lg text-blue-600">
                                                    <FaChalkboardTeacher />
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => handleJoinClass(subject, true)}
                                                className="w-full py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center"
                                            >
                                                <FaVideo className="mr-2" /> Start Class
                                            </button>
                                        </motion.div>
                                    ))}

                                    {/* Student View - Show All Subjects */}
                                    {userInfo.role === 'Student' && subjects.map((subject) => (
                                        <motion.div
                                            key={subject._id}
                                            variants={cardVariants}
                                            initial="hidden"
                                            animate="visible"
                                            className="bg-white rounded-xl shadow-md p-6 border border-gray-100 hover:shadow-lg transition-shadow"
                                        >
                                            <div className="flex justify-between items-start mb-4">
                                                <div>
                                                    <h3 className="font-bold text-lg text-gray-800">{subject.name}</h3>
                                                    <p className="text-sm text-gray-500">Teacher: {subject.teacher?.name}</p>
                                                </div>
                                                <div className="bg-green-100 p-2 rounded-lg text-green-600">
                                                    <FaChalkboardTeacher />
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => handleJoinClass(subject, true)}
                                                className="w-full py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors flex items-center justify-center"
                                            >
                                                <FaVideo className="mr-2" /> Join Class
                                            </button>
                                        </motion.div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* SECTION 2: MEETINGS (Admin/Teacher/Parent Only) */}
                    {userInfo.role !== 'Student' && (
                        <div>
                            <h2 className="text-xl font-bold text-gray-700 mb-4 border-l-4 border-purple-500 pl-3">
                                Upcoming Meetings
                            </h2>
                            {meetings.length === 0 ? (
                                <div className="bg-white p-6 rounded-xl border border-gray-200 text-center text-gray-400 italic">
                                    No online meetings scheduled.
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {meetings.map((meeting) => (
                                        <motion.div
                                            key={meeting._id}
                                            variants={cardVariants}
                                            initial="hidden"
                                            animate="visible"
                                            className="bg-white rounded-xl shadow-md p-6 border border-gray-100 relative overflow-hidden"
                                        >
                                            <div className="absolute top-0 right-0 bg-purple-100 text-purple-700 px-3 py-1 rounded-bl-xl text-xs font-bold">
                                                {new Date(meeting.date).toDateString()}
                                            </div>
                                            <h3 className="font-bold text-lg text-gray-800 mt-2">{meeting.title}</h3>
                                            <p className="text-sm text-gray-600 mt-1 mb-4 line-clamp-2">{meeting.description}</p>

                                            <div className="space-y-2">
                                                <button
                                                    onClick={() => navigate(`/live-class/Meeting-${meeting._id}`)}
                                                    className="w-full py-2 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors flex items-center justify-center"
                                                >
                                                    <FaVideo className="mr-2" /> Join Meeting Room
                                                </button>

                                                {meeting.meetingLink && (
                                                    <a
                                                        href={meeting.meetingLink}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="w-full py-2 bg-white border border-purple-200 text-purple-600 rounded-lg font-semibold hover:bg-purple-50 transition-colors flex items-center justify-center text-sm"
                                                    >
                                                        <FaExternalLinkAlt className="mr-2" /> External Link
                                                    </a>
                                                )}
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default LiveClassesDashboard;
