
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { FaPlus, FaTrash, FaSave } from 'react-icons/fa';
import toast from 'react-hot-toast';
import { useSelector } from 'react-redux';

const CreateExam = () => {
    const { userInfo } = useSelector((state) => state.auth);
    const [title, setTitle] = useState('');
    const [subject, setSubject] = useState('');
    const [subjects, setSubjects] = useState([]);
    const [startTime, setStartTime] = useState('');
    const [duration, setDuration] = useState(30);
    const [questions, setQuestions] = useState([
        { questionText: '', options: ['', '', '', ''], correctOption: 0, marks: 1 }
    ]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (userInfo?._id) {
            fetchSubjects();
        }
    }, [userInfo]);

    const fetchSubjects = async () => {
        try {
            const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/subjects?teacherId=${userInfo._id}`, {
                headers: { Authorization: `Bearer ${userInfo.token}` }
            });
            setSubjects(data);
        } catch (error) {
            console.error(error);
        }
    };

    const handleQuestionChange = (index, field, value) => {
        const newQuestions = [...questions];
        newQuestions[index][field] = value;
        setQuestions(newQuestions);
    };

    const handleOptionChange = (qIndex, oIndex, value) => {
        const newQuestions = [...questions];
        newQuestions[qIndex].options[oIndex] = value;
        setQuestions(newQuestions);
    };

    const addQuestion = () => {
        setQuestions([...questions, { questionText: '', options: ['', '', '', ''], correctOption: 0, marks: 1 }]);
    };

    const removeQuestion = (index) => {
        const newQuestions = questions.filter((_, i) => i !== index);
        setQuestions(newQuestions);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            const selectedSubject = subjects.find(s => s._id === subject);

            await axios.post(
                `${import.meta.env.VITE_API_URL}/exams`,
                {
                    title,
                    subject,
                    class: selectedSubject.class._id, // Assume populated
                    startTime,
                    duration,
                    questions
                },
                { headers: { Authorization: `Bearer ${userInfo.token}` } }
            );
            toast.success('Exam Created Successfully');
            // Reset form
            setTitle(''); setSubject(''); setStartTime(''); setDuration(30);
            setQuestions([{ questionText: '', options: ['', '', '', ''], correctOption: 0, marks: 1 }]);
        } catch (error) {
            console.error(error);
            toast.error('Error creating exam');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-gray-50 min-h-screen">
            <div className="mb-6">
                <h1 className="text-3xl font-extrabold text-gray-800 tracking-tight">
                    Create <span className="text-blue-600">Exam</span>
                </h1>
                <p className="text-gray-500 mt-2">Set up questions and schedule online exams</p>
            </div>

            <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-semibold text-gray-600 mb-1">Exam Title</label>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 outline-none"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-600 mb-1">Subject</label>
                            <select
                                value={subject}
                                onChange={(e) => setSubject(e.target.value)}
                                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 outline-none"
                                required
                            >
                                <option value="">Select Subject</option>
                                {subjects.map(s => <option key={s._id} value={s._id}>{s.name} ({s.class?.name})</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-600 mb-1">Start Time</label>
                            <input
                                type="datetime-local"
                                value={startTime}
                                onChange={(e) => setStartTime(e.target.value)}
                                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 outline-none"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-600 mb-1">Duration (Minutes)</label>
                            <input
                                type="number"
                                value={duration}
                                onChange={(e) => setDuration(e.target.value)}
                                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 outline-none"
                                required
                            />
                        </div>
                    </div>

                    <hr className="border-gray-200" />

                    <h3 className="text-lg font-bold text-gray-800">Questions</h3>

                    {questions.map((q, qIndex) => (
                        <div key={qIndex} className="bg-gray-50 p-4 rounded-xl border border-gray-200 relative">
                            <div className="flex justify-between items-start mb-4">
                                <h4 className="font-bold text-gray-700">Question {qIndex + 1}</h4>
                                {questions.length > 1 && (
                                    <button type="button" onClick={() => removeQuestion(qIndex)} className="text-red-500 hover:text-red-700">
                                        <FaTrash />
                                    </button>
                                )}
                            </div>

                            <div className="mb-4">
                                <input
                                    type="text"
                                    placeholder="Question Text"
                                    value={q.questionText}
                                    onChange={(e) => handleQuestionChange(qIndex, 'questionText', e.target.value)}
                                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 outline-none mb-2"
                                    required
                                />
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-semibold text-gray-600">Marks:</span>
                                    <input
                                        type="number"
                                        value={q.marks}
                                        onChange={(e) => handleQuestionChange(qIndex, 'marks', e.target.value)}
                                        className="w-20 border border-gray-300 rounded-lg px-2 py-1 outline-none text-sm"
                                        min="1"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {q.options.map((opt, oIndex) => (
                                    <div key={oIndex} className="flex items-center gap-2">
                                        <input
                                            type="radio"
                                            name={`correct-${qIndex}`}
                                            checked={q.correctOption === oIndex}
                                            onChange={() => handleQuestionChange(qIndex, 'correctOption', oIndex)}
                                            className="w-4 h-4 text-blue-600"
                                        />
                                        <input
                                            type="text"
                                            placeholder={`Option ${oIndex + 1}`}
                                            value={opt}
                                            onChange={(e) => handleOptionChange(qIndex, oIndex, e.target.value)}
                                            className={`w-full border rounded-lg px-3 py-2 outline-none text-sm ${q.correctOption === oIndex ? 'border-green-500 bg-green-50' : 'border-gray-300'}`}
                                            required
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}

                    <button
                        type="button"
                        onClick={addQuestion}
                        className="w-full py-2 border-2 border-dashed border-blue-300 rounded-xl text-blue-600 font-bold hover:bg-blue-50 transition-colors"
                    >
                        + Add Question
                    </button>

                    <div className="flex justify-end pt-4">
                        <button
                            type="submit"
                            disabled={loading}
                            className="bg-blue-600 text-white font-bold px-8 py-3 rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/30"
                        >
                            {loading ? 'Creating...' : 'Create Exam'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateExam;
