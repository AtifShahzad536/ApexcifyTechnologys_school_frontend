import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaMoneyBillAlt, FaPlus, FaCheck, FaHistory } from 'react-icons/fa';
import toast from 'react-hot-toast';

const ManageFees = () => {
    const [fees, setFees] = useState([]);
    const [classes, setClasses] = useState([]);
    const [selectedClass, setSelectedClass] = useState('');
    const [amount, setAmount] = useState('');
    const [type, setType] = useState('Tuition');
    const [month, setMonth] = useState('');
    const [dueDate, setDueDate] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchClasses();
        fetchFees();
    }, []);

    const fetchClasses = async () => {
        try {
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/classes`, {
                headers: { Authorization: `Bearer ${userInfo.token}` }
            });
            setClasses(data);
        } catch (error) { console.error(error); }
    };

    const fetchFees = async () => {
        try {
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/fees`, {
                headers: { Authorization: `Bearer ${userInfo.token}` }
            });
            setFees(data);
        } catch (error) { console.error(error); }
    };

    const handleCreateInvoice = async (e) => {
        e.preventDefault();
        if (!selectedClass || !amount || !month || !dueDate) return toast.error('Please fill all fields');
        setLoading(true);
        try {
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            await axios.post(
                `${import.meta.env.VITE_API_URL}/fees`,
                { classId: selectedClass, amount, type, month, dueDate },
                { headers: { Authorization: `Bearer ${userInfo.token}` } }
            );
            toast.success('Invoices Generated Successfully');
            // Reset
            setAmount(''); setMonth(''); setDueDate('');
            fetchFees();
        } catch (error) {
            console.error(error);
            toast.error('Error creating invoices');
        } finally {
            setLoading(false);
        }
    };

    const handleMarkPaid = async (id) => {
        if (!window.confirm('Mark this invoice as PAID?')) return;
        try {
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            await axios.put(
                `${import.meta.env.VITE_API_URL}/fees/${id}/pay`,
                {},
                { headers: { Authorization: `Bearer ${userInfo.token}` } }
            );
            fetchFees();
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div className="bg-gray-50 min-h-screen">
            <div className="mb-6">
                <h1 className="text-3xl font-extrabold text-gray-800 tracking-tight">
                    Fee <span className="text-blue-600">Management</span>
                </h1>
                <p className="text-gray-500 mt-2">Generate invoices and track payments</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Generator Form */}
                <div className="lg:col-span-1">
                    <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6">
                        <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                            <FaPlus className="mr-2 text-blue-600" />
                            Generate Invoices
                        </h2>
                        <form onSubmit={handleCreateInvoice} className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-600 mb-1">Class</label>
                                <select
                                    value={selectedClass}
                                    onChange={(e) => setSelectedClass(e.target.value)}
                                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 outline-none"
                                    required
                                >
                                    <option value="">Select Class (Bulk)</option>
                                    {classes.map(c => <option key={c._id} value={c._id}>{c.name} - {c.section}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-600 mb-1">Fee Type</label>
                                <select
                                    value={type}
                                    onChange={(e) => setType(e.target.value)}
                                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 outline-none"
                                >
                                    <option value="Tuition">Tuition Fee</option>
                                    <option value="Exam">Exam Fee</option>
                                    <option value="Transport">Transport Fee</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-600 mb-1">Amount ($)</label>
                                <input
                                    type="number"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 outline-none"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-600 mb-1">For Month</label>
                                <input
                                    type="month"
                                    value={month}
                                    onChange={(e) => setMonth(e.target.value)}
                                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 outline-none"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-600 mb-1">Due Date</label>
                                <input
                                    type="date"
                                    value={dueDate}
                                    onChange={(e) => setDueDate(e.target.value)}
                                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 outline-none"
                                    required
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/30"
                            >
                                {loading ? 'Generating...' : 'Generate Invoices'}
                            </button>
                        </form>
                    </div>
                </div>

                {/* Invoice List */}
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
                        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
                            <h2 className="text-xl font-bold text-gray-800 flex items-center">
                                <FaMoneyBillAlt className="mr-3 text-blue-600" />
                                Recent Invoices
                            </h2>
                        </div>

                        {fees.length === 0 ? (
                            <div className="p-12 text-center text-gray-400">No invoices found</div>
                        ) : (
                            <>
                                {/* Mobile View - Cards */}
                                <div className="md:hidden space-y-4">
                                    {fees.map((fee) => (
                                        <div key={fee._id} className="p-4 bg-white border border-gray-100 rounded-lg shadow-sm">
                                            <div className="flex justify-between items-start mb-2">
                                                <div>
                                                    <div className="font-bold text-gray-800">{fee.student?.name}</div>
                                                    <div className="text-xs text-gray-500">{fee.student?.studentClass?.name || 'Unknown Class'}</div>
                                                </div>
                                                <span className={`px-2 py-1 rounded text-xs font-bold ${fee.status === 'Paid' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                                    {fee.status}
                                                </span>
                                            </div>
                                            <div className="flex justify-between items-center mb-3">
                                                <div className="text-sm text-gray-600">
                                                    <div>{fee.type}</div>
                                                    <div className="text-xs text-gray-400">{fee.month}</div>
                                                </div>
                                                <div className="font-bold text-gray-800">${fee.amount}</div>
                                            </div>
                                            {fee.status === 'Pending' && (
                                                <button
                                                    onClick={() => handleMarkPaid(fee._id)}
                                                    className="w-full text-center text-green-600 font-bold text-sm bg-green-50 py-2 rounded border border-green-200 hover:bg-green-100"
                                                >
                                                    Mark Paid
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>

                                {/* Desktop View - Table */}
                                <div className="overflow-x-auto hidden md:block max-h-[500px] overflow-y-auto">
                                    <table className="w-full relative">
                                        <thead className="bg-gray-50 text-gray-600 font-semibold text-xs uppercase tracking-wider sticky top-0 z-10">
                                            <tr>
                                                <th className="px-6 py-4 text-left">Student</th>
                                                <th className="px-6 py-4 text-left">Details</th>
                                                <th className="px-6 py-4 text-left">Amount</th>
                                                <th className="px-6 py-4 text-left">Status</th>
                                                <th className="px-6 py-4 text-right">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {fees.map((fee) => (
                                                <tr key={fee._id} className="hover:bg-blue-50/50 transition-colors">
                                                    <td className="px-6 py-4">
                                                        <div className="font-bold text-gray-800">{fee.student?.name}</div>
                                                        <div className="text-xs text-gray-500">{fee.student?.studentClass?.name || 'Unknown Class'}</div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="text-sm text-gray-800">{fee.type}</div>
                                                        <div className="text-xs text-gray-500">{fee.month}</div>
                                                    </td>
                                                    <td className="px-6 py-4 font-bold text-gray-800">
                                                        ${fee.amount}
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className={`inline-block px-2 py-1 rounded text-xs font-bold ${fee.status === 'Paid' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                                                            }`}>
                                                            {fee.status}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        {fee.status === 'Pending' && (
                                                            <button
                                                                onClick={() => handleMarkPaid(fee._id)}
                                                                className="text-green-600 hover:text-green-800 font-bold text-xs bg-green-50 px-3 py-1 rounded border border-green-200 hover:border-green-300"
                                                            >
                                                                Mark Paid
                                                            </button>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ManageFees;
