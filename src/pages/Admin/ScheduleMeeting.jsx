import React, { useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { FaCalendarAlt, FaVideo, FaLink, FaClock, FaAlignLeft } from 'react-icons/fa';
import toast from 'react-hot-toast';

const ScheduleMeeting = () => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [date, setDate] = useState('');
    const [time, setTime] = useState(''); // Adding time explicitly for clarity, though date field might handle datetime
    const [meetingLink, setMeetingLink] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        // Combine date and time if separated, or just use date string if input type="datetime-local"
        // Let's use datetime-local for the date input for simplicity in this new form

        try {
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };

            await axios.post(
                `${import.meta.env.VITE_API_URL}/calendar/events`,
                {
                    title,
                    description,
                    date, // This should be a full ISO string or value from datetime-local
                    type: 'Meeting',
                    isOnline: true,
                    meetingLink
                },
                config
            );

            toast.success('Meeting scheduled successfully!');
            setTitle('');
            setDescription('');
            setDate('');
            setMeetingLink('');
        } catch (error) {
            console.error('Error scheduling meeting:', error);
            toast.error(error.response?.data?.message || 'Failed to schedule meeting');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-gray-50 min-h-screen">
            <div className="mb-8">
                <h1 className="text-3xl font-extrabold text-gray-800 tracking-tight flex items-center">
                    <FaCalendarAlt className="mr-3 text-blue-600" />
                    Schedule <span className="text-blue-600 ml-2">Parent Meeting</span>
                </h1>
                <p className="text-gray-500 mt-2">Create new online meeting events for parents and teachers.</p>
            </div>

            <div className="max-w-2xl bg-white rounded-2xl shadow-xl border border-gray-200 p-8">
                <form onSubmit={handleSubmit} className="space-y-6">

                    {/* Title */}
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center">
                            <FaAlignLeft className="mr-2 text-blue-500" /> Meeting Title
                        </label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none transition-shadow"
                            placeholder="e.g., Parent-Teacher Conference, Annual General Meeting"
                            required
                        />
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Description</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none transition-shadow min-h-[100px]"
                            placeholder="Agenda or details about the meeting..."
                        />
                    </div>

                    {/* Date & Time */}
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center">
                            <FaClock className="mr-2 text-blue-500" /> Date & Time
                        </label>
                        <input
                            type="datetime-local"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none transition-shadow text-gray-600"
                            required
                        />
                    </div>

                    {/* Link */}
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center">
                            <FaLink className="mr-2 text-blue-500" /> Meeting Link (Optional)
                        </label>
                        <input
                            type="text"
                            value={meetingLink}
                            onChange={(e) => setMeetingLink(e.target.value)}
                            className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none transition-shadow"
                            placeholder="https://zoom.us/j/..."
                        />
                        <p className="text-xs text-gray-400 mt-1">Leave empty if you will provide a link later.</p>
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold py-4 rounded-xl hover:shadow-lg hover:from-blue-700 hover:to-indigo-700 transition-all flex justify-center items-center"
                    >
                        {loading ? 'Scheduling...' : (
                            <>
                                <FaVideo className="mr-2" /> Schedule Meeting
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ScheduleMeeting;
