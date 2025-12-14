
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { FaClipboardList, FaFileUpload, FaCheckCircle, FaClock, FaExclamationCircle } from 'react-icons/fa';
import toast from 'react-hot-toast';
import { useSelector } from 'react-redux';

const Assignments = () => {
    const { userInfo } = useSelector((state) => state.auth);
    const [assignments, setAssignments] = useState([]);
    const [submissions, setSubmissions] = useState([]);
    const [filter, setFilter] = useState('All');
    const [selectedAssignment, setSelectedAssignment] = useState(null);
    const [submissionContent, setSubmissionContent] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (userInfo?._id) {
            fetchAssignments();
            fetchSubmissions();
        }
    }, [userInfo]);

    const fetchAssignments = async () => {
        try {
            const config = {
                headers: { Authorization: `Bearer ${userInfo.token}` },
            };
            // In a real app, filter by student's class
            const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/assignments`, config);
            setAssignments(data);
        } catch (error) {
            console.error(error);
        }
    };

    const fetchSubmissions = async () => {
        try {
            const config = {
                headers: { Authorization: `Bearer ${userInfo.token}` },
            };
            const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/submissions?studentId=${userInfo._id}`, config);
            setSubmissions(data);
        } catch (error) {
            console.error(error);
        }
    };

    const submitAssignment = async (e) => {
        e.preventDefault();
        if (!selectedAssignment) return;

        setLoading(true);
        try {
            const config = {
                headers: { Authorization: `Bearer ${userInfo.token}` },
            };
            await axios.post(`${import.meta.env.VITE_API_URL}/submissions`, {
                assignment: selectedAssignment._id,
                content: submissionContent
            }, config);

            toast.success('Assignment submitted successfully!');
            setSubmissionContent('');
            setSelectedAssignment(null);
            fetchSubmissions();
            setLoading(false);
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || 'Error submitting assignment');
            setLoading(false);
        }
    };

    const getSubmissionStatus = (assignmentId) => {
        const submission = submissions.find(s => s.assignment._id === assignmentId);
        if (!submission) return { status: 'Pending', color: 'yellow', icon: <FaClock /> };
        if (submission.status === 'Graded') return { status: 'Graded', color: 'green', icon: <FaCheckCircle /> };
        if (submission.status === 'Late') return { status: 'Late', color: 'red', icon: <FaExclamationCircle /> };
        return { status: 'Submitted', color: 'blue', icon: <FaCheckCircle /> };
    };

    const isOverdue = (dueDate) => {
        return new Date() > new Date(dueDate);
    };

    const filteredAssignments = assignments.filter(assignment => {
        const status = getSubmissionStatus(assignment._id).status;
        if (filter === 'All') return true;
        if (filter === 'Pending') return status === 'Pending';
        if (filter === 'Submitted') return status === 'Submitted' || status === 'Late';
        if (filter === 'Graded') return status === 'Graded';
        return true;
    });

    const getTypeColor = (type) => {
        switch (type) {
            case 'Quiz': return 'bg-purple-100 text-purple-700';
            case 'Homework': return 'bg-blue-100 text-blue-700';
            case 'Project': return 'bg-green-100 text-green-700';
            default: return 'bg-orange-100 text-orange-700';
        }
    };

    return (
        <div className="bg-gray-50 min-h-screen">
            <div className="mb-6">
                <h1 className="text-3xl font-extrabold text-gray-800 tracking-tight">
                    My <span className="text-blue-600">Assignments</span>
                </h1>
                <p className="text-gray-500 mt-2">View and submit your assignments</p>
            </div>

            {/* Filter Tabs */}
            <div className="mb-6">
                <div className="flex gap-2 flex-wrap">
                    {['All', 'Pending', 'Submitted', 'Graded'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setFilter(tab)}
                            className={`px-4 py-2 rounded-lg font-semibold transition-all ${filter === tab
                                ? 'bg-blue-600 text-white shadow-lg'
                                : 'bg-white text-gray-600 hover:bg-gray-100'
                                }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>
            </div>

            {/* Assignments List */}
            <div className="grid grid-cols-1 gap-6">
                {filteredAssignments.length === 0 ? (
                    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-12 text-center">
                        <p className="text-gray-400 text-lg">No assignments found.</p>
                    </div>
                ) : (
                    filteredAssignments.map((assignment) => {
                        const submissionStatus = getSubmissionStatus(assignment._id);
                        const submission = submissions.find(s => s.assignment._id === assignment._id);
                        const overdue = isOverdue(assignment.dueDate) && !submission;

                        return (
                            <motion.div
                                key={assignment._id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6"
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <h3 className="text-xl font-bold text-gray-800">{assignment.title}</h3>
                                            <span className={`text-xs px-3 py-1 rounded-full font-semibold ${getTypeColor(assignment.type)}`}>
                                                {assignment.type}
                                            </span>
                                        </div>
                                        <p className="text-gray-600 mb-3">{assignment.description}</p>
                                    </div>
                                    <div className={`flex items-center gap-2 px-4 py-2 rounded-lg bg-${submissionStatus.color}-50 text-${submissionStatus.color}-700`}>
                                        {submissionStatus.icon}
                                        <span className="font-semibold text-sm">{submissionStatus.status}</span>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 text-sm">
                                    <div>
                                        <p className="text-gray-500">Subject</p>
                                        <p className="font-semibold text-gray-800">{assignment.subject?.name}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-500">Due Date</p>
                                        <p className={`font-semibold ${overdue ? 'text-red-600' : 'text-gray-800'}`}>
                                            {new Date(assignment.dueDate).toLocaleDateString()}
                                            {overdue && ' (Overdue)'}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-gray-500">Total Points</p>
                                        <p className="font-semibold text-gray-800">{assignment.totalPoints}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-500">Teacher</p>
                                        <p className="font-semibold text-gray-800">{assignment.teacher?.name}</p>
                                    </div>
                                </div>

                                {assignment.instructions && (
                                    <div className="bg-blue-50 p-4 rounded-lg mb-4 border border-blue-100">
                                        <p className="text-sm font-semibold text-gray-700 mb-1">Instructions:</p>
                                        <p className="text-sm text-gray-600">{assignment.instructions}</p>
                                    </div>
                                )}

                                {submission ? (
                                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                        <div className="flex justify-between items-start mb-2">
                                            <p className="text-sm font-semibold text-gray-700">Your Submission:</p>
                                            <p className="text-xs text-gray-500">
                                                Submitted: {new Date(submission.submittedAt).toLocaleString()}
                                            </p>
                                        </div>
                                        <p className="text-sm text-gray-600 mb-3">{submission.content}</p>

                                        {submission.grade !== undefined && (
                                            <div className="flex items-center justify-between pt-3 border-t border-gray-300">
                                                <div>
                                                    <p className="text-sm font-semibold text-gray-700">Grade: <span className="text-green-600">{submission.grade}/{assignment.totalPoints}</span></p>
                                                    {submission.feedback && (
                                                        <p className="text-xs text-gray-600 mt-1">Feedback: {submission.feedback}</p>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div>
                                        {selectedAssignment?._id === assignment._id ? (
                                            <form onSubmit={submitAssignment} className="space-y-3">
                                                <textarea
                                                    value={submissionContent}
                                                    onChange={(e) => setSubmissionContent(e.target.value)}
                                                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none"
                                                    rows="4"
                                                    placeholder="Enter your submission here..."
                                                    required
                                                />
                                                <div className="flex gap-2">
                                                    <button
                                                        type="submit"
                                                        className="bg-blue-600 text-white font-semibold px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                                                        disabled={loading}
                                                    >
                                                        {loading ? 'Submitting...' : 'Submit'}
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => setSelectedAssignment(null)}
                                                        className="bg-gray-200 text-gray-700 font-semibold px-6 py-2 rounded-lg hover:bg-gray-300 transition-colors"
                                                    >
                                                        Cancel
                                                    </button>
                                                </div>
                                            </form>
                                        ) : (
                                            <button
                                                onClick={() => setSelectedAssignment(assignment)}
                                                className="w-full bg-blue-600 text-white font-semibold py-3 rounded-lg hover:bg-blue-700 transition-colors"
                                            >
                                                Submit Assignment
                                            </button>
                                        )}
                                    </div>
                                )}
                            </motion.div>
                        );
                    })
                )}
            </div>
        </div>
    );
};

export default Assignments;
