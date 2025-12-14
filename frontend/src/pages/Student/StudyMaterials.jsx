import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { FaFilePdf, FaVideo, FaLink, FaFileAlt, FaSearch, FaExternalLinkAlt, FaDownload } from 'react-icons/fa';
import { useSelector } from 'react-redux';

const StudyMaterials = () => {
    const { userInfo } = useSelector((state) => state.auth);
    const [materials, setMaterials] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [selectedSubject, setSelectedSubject] = useState('All');
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (userInfo?._id) {
            fetchData();
        }
    }, [userInfo]);

    const fetchData = async () => {
        try {
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            // First fetch student profile to get classId
            const studentProfile = await axios.get(`${import.meta.env.VITE_API_URL}/students/${userInfo._id}`, {
                headers: { Authorization: `Bearer ${userInfo.token}` }
            });
            const classId = studentProfile.data.studentClass?._id;

            if (classId) {
                // Fetch materials for this class
                const materialsRes = await axios.get(`${import.meta.env.VITE_API_URL}/materials?classId=${classId}`, {
                    headers: { Authorization: `Bearer ${userInfo.token}` }
                });
                setMaterials(materialsRes.data);

                // Fetch subjects for this class to populate filters
                const enrolledSubjects = await axios.get(`${import.meta.env.VITE_API_URL}/subjects?classId=${classId}`, {
                    headers: { Authorization: `Bearer ${userInfo.token}` }
                });
                setSubjects(enrolledSubjects.data);
            }
            setLoading(false);
        } catch (error) {
            console.error(error);
            setLoading(false);
        }
    };

    const getIcon = (type) => {
        switch (type) {
            case 'PDF': return <FaFilePdf className="text-red-500 text-2xl" />;
            case 'Video': return <FaVideo className="text-blue-500 text-2xl" />;
            case 'Link': return <FaLink className="text-green-500 text-2xl" />;
            default: return <FaFileAlt className="text-gray-500 text-2xl" />;
        }
    };

    const filteredMaterials = materials.filter(material => {
        const matchesSubject = selectedSubject === 'All' || material.subject?._id === selectedSubject;
        const matchesSearch = material.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            material.description.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesSubject && matchesSearch;
    });

    return (
        <div className="bg-gray-50 min-h-screen">
            <div className="mb-8">
                <h1 className="text-3xl font-extrabold text-gray-800 tracking-tight">
                    Study <span className="text-blue-600">Materials</span>
                </h1>
                <p className="text-gray-500 mt-2">Access your course resources and learning materials</p>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6 flex flex-col md:flex-row gap-4 justify-between items-center">
                <div className="flex items-center gap-4 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
                    <button
                        onClick={() => setSelectedSubject('All')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${selectedSubject === 'All'
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                    >
                        All Subjects
                    </button>
                    {subjects.map(subject => (
                        <button
                            key={subject._id}
                            onClick={() => setSelectedSubject(subject._id)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${selectedSubject === subject._id
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                        >
                            {subject.name}
                        </button>
                    ))}
                </div>

                <div className="relative w-full md:w-64">
                    <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search materials..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                </div>
            </div>

            {/* Materials Grid */}
            {loading ? (
                <div className="text-center py-20 text-gray-500">Loading materials...</div>
            ) : filteredMaterials.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
                    <p className="text-gray-400 text-lg">No study materials found</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredMaterials.map((material, index) => (
                        <motion.div
                            key={material._id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-shadow group"
                        >
                            <div className="p-6">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="p-3 bg-gray-50 rounded-xl group-hover:scale-110 transition-transform duration-300">
                                        {getIcon(material.type)}
                                    </div>
                                    <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-2 py-1 rounded">
                                        {material.subject?.name}
                                    </span>
                                </div>

                                <h3 className="text-lg font-bold text-gray-800 mb-2 line-clamp-2 min-h-[3.5rem]">
                                    {material.title}
                                </h3>
                                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                                    {material.description}
                                </p>

                                <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-100">
                                    <p className="text-xs text-gray-400">
                                        By {material.uploadedBy?.name || 'Teacher'}
                                    </p>
                                    <a
                                        href={material.link}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium text-sm transition-colors"
                                    >
                                        Access Resource <FaExternalLinkAlt className="text-xs" />
                                    </a>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default StudyMaterials;
