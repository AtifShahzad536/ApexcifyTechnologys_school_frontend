import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { FaCalendarAlt, FaPlus, FaTrash, FaClock, FaChalkboardTeacher } from 'react-icons/fa';
import toast from 'react-hot-toast';
import Calendar from 'react-calendar'; // You might need to install this or use a simple grid
import 'react-calendar/dist/Calendar.css'; // Assuming standard css import if we had the package

// Since I can't install packages easily, I'll build a custom simple calendar view or rely on standard HTML date inputs for now.
// Actually, I'll build a custom Month View for events.

const SchoolCalendar = () => {
    const [events, setEvents] = useState([]);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [date, setDate] = useState('');
    const [type, setType] = useState('Event');
    const [isOnlineEvent, setIsOnlineEvent] = useState(false);
    const [meetingLink, setMeetingLink] = useState('');
    const [loading, setLoading] = useState(false);

    const [activeTab, setActiveTab] = useState('events');
    const [classes, setClasses] = useState([]);
    const [selectedClass, setSelectedClass] = useState('');
    const [timetable, setTimetable] = useState({ days: [] });
    // Timetable Form State
    const [day, setDay] = useState('Monday');
    const [subject, setSubject] = useState('');
    const [teacher, setTeacher] = useState('');
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');
    const [isOnlineClass, setIsOnlineClass] = useState(false);
    const [teachers, setTeachers] = useState([]);
    const [subjects, setSubjects] = useState([]);

    useEffect(() => {
        fetchEvents();
    }, []);

    useEffect(() => {
        if (activeTab === 'timetable') {
            fetchClasses();
            fetchTeachersAndSubjects();
        }
    }, [activeTab]);

    useEffect(() => {
        if (selectedClass) {
            fetchTimetable();
        }
    }, [selectedClass]);

    const fetchEvents = async () => {
        try {
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            const eventsRes = await axios.get(`${import.meta.env.VITE_API_URL}/calendar/events`, {
                headers: { Authorization: `Bearer ${userInfo.token}` }
            });
            setEvents(eventsRes.data);
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
        } catch (error) { console.error(error); }
    };

    const fetchTeachersAndSubjects = async () => {
        try {
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
            const [tRes, sRes] = await Promise.all([
                axios.get(`${import.meta.env.VITE_API_URL}/teachers`, config),
                axios.get(`${import.meta.env.VITE_API_URL}/subjects`, config)
            ]);
            setTeachers(tRes.data);
            setSubjects(sRes.data);
        } catch (error) { console.error(error); }
    };

    const fetchTimetable = async () => {
        try {
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/calendar/timetable/${selectedClass}`, {
                headers: { Authorization: `Bearer ${userInfo.token}` }
            });
            setTimetable(data || { days: [] });
        } catch (error) {
            console.error(error);
            setTimetable({ days: [] });
        }
    };

    const handleAddEvent = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            await axios.post(
                `${import.meta.env.VITE_API_URL}/calendar/events`,
                { title, description, date, type, isOnline: isOnlineEvent, meetingLink },
                { headers: { Authorization: `Bearer ${userInfo.token}` } }
            );
            setTitle('');
            setDescription('');
            setDate('');
            setType('Event');
            setIsOnlineEvent(false);
            setMeetingLink('');
            fetchEvents();
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this event?')) return;
        try {
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            await axios.delete(`${import.meta.env.VITE_API_URL}/calendar/events/${id}`, {
                headers: { Authorization: `Bearer ${userInfo.token}` }
            });
            fetchEvents();
        } catch (error) {
            console.error(error);
        }
    };

    const handleAddPeriod = async () => {
        if (!selectedClass || !subject || !teacher || !startTime || !endTime) return toast.error('Please fill all fields');
        setLoading(true);
        try {
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));

            // Construct new timetable state locally first or just push to backend? 
            // Better to push whole structure.
            let updatedDays = [...(timetable.days || [])];
            let dayIndex = updatedDays.findIndex(d => d.day === day);

            const newPeriod = { subject, teacher, startTime, endTime, isOnline: isOnlineClass };

            if (dayIndex >= 0) {
                updatedDays[dayIndex].periods.push(newPeriod);
            } else {
                updatedDays.push({ day, periods: [newPeriod] });
            }

            const payloadDays = updatedDays.map(d => ({
                ...d,
                day: d.day || d.name, // Handle legacy 'name' property
                periods: d.periods.map(p => ({
                    ...p,
                    subject: typeof p.subject === 'object' ? p.subject?._id : p.subject,
                    teacher: typeof p.teacher === 'object' ? p.teacher?._id : p.teacher
                }))
            }));

            const { data } = await axios.post(
                `${import.meta.env.VITE_API_URL}/calendar/timetable`,
                { classId: selectedClass, days: payloadDays },
                { headers: { Authorization: `Bearer ${userInfo.token}` } }
            );
            setTimetable(data);
            setSubject(''); setTeacher(''); setStartTime(''); setEndTime(''); setIsOnlineClass(false);
        } catch (error) {
            console.error('Timetable Save Error:', error.response?.data || error.message);
            toast.error(error.response?.data?.message || 'Error updating timetable');
        } finally {
            setLoading(false);
        }
    };

    // Simple Event List Grouped by Month could be better than a full calendar for now
    // But let's verify if `react-calendar` is installed. Check package.json? 
    // Assuming it's NOT installed, I'll stick to a list view for robustness.

    return (
        <div className="bg-gray-50 min-h-screen">
            <div className="mb-6 flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-extrabold text-gray-800 tracking-tight">
                        School <span className="text-blue-600">Calendar & Timetable</span>
                    </h1>
                    <p className="text-gray-500 mt-2">Manage school events and class schedules</p>
                </div>
                <div className="flex bg-white rounded-lg p-1 border border-gray-200">
                    <button
                        onClick={() => setActiveTab('events')}
                        className={`px-4 py-2 rounded-md font-medium transition-colors ${activeTab === 'events' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-50'}`}
                    >
                        Events
                    </button>
                    <button
                        onClick={() => setActiveTab('timetable')}
                        className={`px-4 py-2 rounded-md font-medium transition-colors ${activeTab === 'timetable' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-50'}`}
                    >
                        Timetable
                    </button>
                </div>
            </div>

            {activeTab === 'events' ? (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Add Event Form */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6">
                            <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                                <FaPlus className="mr-2 text-blue-600" />
                                Add Event
                            </h2>
                            <form onSubmit={handleAddEvent} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-600 mb-1">Title</label>
                                    <input
                                        type="text"
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 outline-none"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-600 mb-1">Type</label>
                                    <select
                                        value={type}
                                        onChange={(e) => setType(e.target.value)}
                                        className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 outline-none"
                                    >
                                        <option value="Holiday">Holiday</option>
                                        <option value="Exam">Exam</option>
                                        <option value="Activity">Activity</option>
                                        <option value="Meeting">Meeting</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-600 mb-1">Date</label>
                                    <input
                                        type="date"
                                        value={date}
                                        onChange={(e) => setDate(e.target.value)}
                                        className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 outline-none"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-600 mb-1">Description</label>
                                    <textarea
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 outline-none"
                                        rows="2"
                                    />
                                </div>
                                <div className="flex items-center">
                                    <input
                                        type="checkbox"
                                        checked={isOnlineEvent}
                                        onChange={(e) => setIsOnlineEvent(e.target.checked)}
                                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                    />
                                    <label className="ml-2 block text-sm font-semibold text-gray-600">
                                        Online Meeting?
                                    </label>
                                </div>
                                {isOnlineEvent && (
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-600 mb-1">Meeting Link</label>
                                        <input
                                            type="text"
                                            value={meetingLink}
                                            onChange={(e) => setMeetingLink(e.target.value)}
                                            placeholder="https://zoom.us/j/..."
                                            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 outline-none"
                                        />
                                    </div>
                                )}
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/30"
                                >
                                    {loading ? 'Adding...' : 'Add Event'}
                                </button>
                            </form>
                        </div>
                    </div>

                    {/* Upcoming Events */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6">
                            <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
                                <FaCalendarAlt className="mr-3 text-blue-600" />
                                Upcoming Events
                            </h2>

                            {events.length === 0 ? (
                                <p className="text-gray-400 text-center py-8">No events scheduled</p>
                            ) : (
                                <div className="space-y-4">
                                    {events.map((event) => (
                                        <motion.div
                                            key={event._id}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            className="flex items-center justify-between p-4 border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors"
                                        >
                                            <div className="flex items-center space-x-4">
                                                <div className="flex-shrink-0 w-16 text-center bg-blue-50 rounded-lg p-2 text-blue-800">
                                                    <div className="text-xs font-bold uppercase">{new Date(event.date).toLocaleString('default', { month: 'short' })}</div>
                                                    <div className="text-xl font-extrabold">{new Date(event.date).getDate()}</div>
                                                </div>
                                                <div>
                                                    <h3 className="font-bold text-gray-800">{event.title}</h3>
                                                    <p className="text-xs text-gray-500 bg-gray-200 px-2 py-0.5 rounded-full inline-block mb-1">{event.type}</p>
                                                    <p className="text-sm text-gray-600">{event.description}</p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => handleDelete(event._id)}
                                                className="text-red-500 hover:text-red-700 p-2 rounded-full hover:bg-red-50"
                                            >
                                                <FaTrash />
                                            </button>
                                        </motion.div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            ) : (
                <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <div className="md:col-span-1 border-r border-gray-100 pr-6">
                            <h3 className="font-bold text-gray-800 mb-4">Timetable Settings</h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-600 mb-1">Class</label>
                                    <select
                                        value={selectedClass}
                                        onChange={(e) => setSelectedClass(e.target.value)}
                                        className="w-full border border-gray-300 rounded-lg px-4 py-2.5 outline-none"
                                    >
                                        <option value="">Select Class</option>
                                        {classes.map(c => <option key={c._id} value={c._id}>{c.name} - {c.section}</option>)}
                                    </select>
                                </div>
                                <hr />
                                <h4 className="font-semibold text-sm text-gray-500">Add Period</h4>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 mb-1">Day</label>
                                    <select value={day} onChange={(e) => setDay(e.target.value)} className="w-full border border-gray-300 rounded px-2 py-1">
                                        {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map(d => <option key={d} value={d}>{d}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 mb-1">Subject</label>
                                    <select value={subject} onChange={(e) => setSubject(e.target.value)} className="w-full border border-gray-300 rounded px-2 py-1">
                                        <option value="">Select Subject</option>
                                        {subjects.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 mb-1">Teacher</label>
                                    <select value={teacher} onChange={(e) => setTeacher(e.target.value)} className="w-full border border-gray-300 rounded px-2 py-1">
                                        <option value="">Select Teacher</option>
                                        {teachers.map(t => <option key={t._id} value={t._id}>{t.name}</option>)}
                                    </select>
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-500 mb-1">Start</label>
                                        <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} className="w-full border border-gray-300 rounded px-2 py-1" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-500 mb-1">End</label>
                                        <input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} className="w-full border border-gray-300 rounded px-2 py-1" />
                                    </div>
                                </div>
                                <div className="flex items-center pt-2">
                                    <input
                                        type="checkbox"
                                        checked={isOnlineClass}
                                        onChange={(e) => setIsOnlineClass(e.target.checked)}
                                        className="w-3 h-3 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                    />
                                    <label className="ml-2 block text-xs font-semibold text-gray-600">
                                        Online Class?
                                    </label>
                                </div>
                                <button
                                    onClick={handleAddPeriod}
                                    disabled={loading || !selectedClass}
                                    className="w-full bg-blue-600 text-white font-bold py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm"
                                >
                                    Add Period
                                </button>
                            </div>
                        </div>
                        <div className="md:col-span-3">
                            {!selectedClass ? <p className="text-gray-400 text-center py-10">Select a class to manage timetable</p> : (
                                <div className="space-y-6">
                                    {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map((d) => {
                                        const dayData = timetable.days?.find(td => td.day === d);
                                        if (!dayData && activeTab === 'timetable') return null; // Only show days we have periods for? No, show all days if managing
                                        return (
                                            <div key={d} className="border border-gray-200 rounded-xl overflow-hidden">
                                                <div className="bg-gray-50 px-4 py-2 font-bold text-gray-700 border-b border-gray-200">{d}</div>
                                                <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                                    {dayData?.periods.length > 0 ? dayData.periods.map((period, idx) => (
                                                        <div key={idx} className="bg-blue-50 rounded-lg p-3 border border-blue-100 flex justify-between items-start">
                                                            <div>
                                                                <p className="font-bold text-blue-800">{period.subject?.name}</p>
                                                                <p className="text-xs text-blue-600">{period.teacher?.name}</p>
                                                                <div className="flex items-center mt-2 text-xs text-gray-500">
                                                                    <FaClock className="mr-1" />
                                                                    {period.startTime} - {period.endTime}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )) : <p className="text-gray-400 text-sm italic">No classes scheduled</p>}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SchoolCalendar;
