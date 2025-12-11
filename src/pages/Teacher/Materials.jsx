import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { FaTrash, FaDownload, FaFileAlt } from 'react-icons/fa';
import toast from 'react-hot-toast';
import { useSelector } from 'react-redux';

const Materials = () => {
    const { userInfo } = useSelector((state) => state.auth);
    const [materials, setMaterials] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [selectedSubject, setSelectedSubject] = useState('');

    // Form State
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [type, setType] = useState('PDF');
    const [link, setLink] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        if (userInfo?._id) {
            fetchSubjects();
        }
    }, [userInfo]);

    useEffect(() => {
        if (selectedSubject) {
            fetchMaterials();
        }
    }, [selectedSubject]);

    const fetchSubjects = async () => {
        try {
            const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/subjects?teacherId=${userInfo._id}`);
            setSubjects(data);
        } catch (error) {
            console.error(error);
        }
    };

    const fetchMaterials = async () => {
        try {
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            const { data } = await axios.get(
                `${import.meta.env.VITE_API_URL}/materials?subjectId=${selectedSubject}`,
                {
                    headers: { Authorization: `Bearer ${userInfo.token}` }
                }
            );
            setMaterials(data);
        } catch (error) {
            console.error(error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));

            // Find class from subject
            const subjectObj = subjects.find(s => s._id === selectedSubject);

            await axios.post(
                `${import.meta.env.VITE_API_URL}/materials`,
                {
                    title,
                    description,
                    subject: selectedSubject,
                    class: subjectObj.class._id, // Assumes subject object has class populated
                    type,
                    link
                },
                {
                    headers: { Authorization: `Bearer ${userInfo.token}` }
                }
            );

            setSuccess(true);
            setTimeout(() => setSuccess(false), 3000);

            // Reset form
            setTitle('');
            setDescription('');
            setLink('');
            fetchMaterials();
        } catch (error) {
            console.error(error);
            toast.error('Error uploading material');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this material?')) return;

        try {
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            await axios.delete(`${import.meta.env.VITE_API_URL}/materials/${id}`, {
                headers: { Authorization: `Bearer ${userInfo.token}` }
            });
            fetchMaterials();
        } catch (error) {
            console.error(error);
        }
    };

    const getIcon = (type) => {
        switch (type) {
            case 'PDF': return <FaFilePdf className="text-red-500 text-xl" />;
            case 'Video': return <FaVideo className="text-blue-500 text-xl" />;
            case 'Link': return <FaLink className="text-green-500 text-xl" />;
            default: return <FaFileAlt className="text-gray-500 text-xl" />;
        }
    };

    return (
        <div className="bg-gray-50 min-h-screen">
            <div className="mb-6">
                <h1 className="text-3xl font-extrabold text-gray-800 tracking-tight">
                    Course <span className="text-blue-600">Materials</span>
                </h1>
                <p className="text-gray-500 mt-2">Upload and share study resources with your students</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Upload Form */}
                <div className="lg:col-span-1">
                    <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6 sticky top-6">
                        <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                            <FaPlus className="mr-2 text-blue-600" />
                            Add New Material
                        </h2>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-600 mb-1">Subject</label>
                                <select
                                    value={selectedSubject}
                                    onChange={(e) => setSelectedSubject(e.target.value)}
                                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 outline-none"
                                    required
                                >
                                    <option value="">Select Subject</option>
                                    {subjects.map(s => (
                                        <option key={s._id} value={s._id}>{s.name} ({s.class?.name})</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-600 mb-1">Title</label>
                                <input
                                    type="text"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 outline-none"
                                    placeholder="e.g., Chapter 1 Notes"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-600 mb-1">Description</label>
                                <textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 outline-none"
                                    rows="3"
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
                                    <option value="PDF">PDF Document</option>
                                    <option value="Video">Video URL</option>
                                    <option value="Link">External Link</option>
                                    <option value="Document">Word/Text Doc</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-600 mb-1">Resource Link / URL</label>
                                <input
                                    type="url"
                                    value={link}
                                    onChange={(e) => setLink(e.target.value)}
                                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 outline-none"
                                    placeholder="https://drive.google.com/..."
                                    required
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading || !selectedSubject}
                                className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/30 disabled:opacity-50"
                            >
                                {loading ? 'Uploading...' : 'Upload Material'}
                            </button>
                        </form>
                    </div>
                </div>

                {/* Materials List */}
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6">
                        <h2 className="text-xl font-bold text-gray-800 mb-6">Uploaded Materials</h2>

                        {!selectedSubject ? (
                            <div className="text-center py-12 text-gray-400">
                                Select a subject to view materials
                            </div>
                        ) : materials.length === 0 ? (
                            <div className="text-center py-12 text-gray-400">
                                No materials uploaded yet
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {materials.map((material) => (
                                    <motion.div
                                        key={material._id}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="border border-gray-100 rounded-xl p-4 hover:shadow-md transition-shadow bg-gray-50"
                                    >
                                        <div className="flex items-start justify-between">
                                            <div className="flex items-start space-x-4">
                                                <div className="p-3 bg-white rounded-lg border border-gray-200 shadow-sm">
                                                    {getIcon(material.type)}
                                                </div>
                                                <div>
                                                    <h3 className="font-bold text-gray-800 text-lg">{material.title}</h3>
                                                    <p className="text-sm text-gray-600 mt-1">{material.description}</p>
                                                    <div className="flex items-center gap-4 mt-3">
                                                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded font-medium">
                                                            {material.type}
                                                        </span>
                                                        <span className="text-xs text-gray-400">
                                                            {new Date(material.createdAt).toLocaleDateString()}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex space-x-2">
                                                <a
                                                    href={material.link}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                    title="Open Link"
                                                >
                                                    <FaExternalLinkAlt />
                                                </a>
                                                <button
                                                    onClick={() => handleDelete(material._id)}
                                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                    title="Delete"
                                                >
                                                    <FaTrash />
                                                </button>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Materials;
