import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaFileInvoice, FaCheckCircle, FaCreditCard } from 'react-icons/fa';
import toast from 'react-hot-toast';

const FeePayment = () => {
    const [fees, setFees] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchFees();
    }, []);

    const fetchFees = async () => {
        try {
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/fees`, {
                headers: { Authorization: `Bearer ${userInfo.token}` }
            });
            setFees(data);
        } catch (error) { console.error(error); }
    };

    const handlePay = async (feeId) => {
        setLoading(true);
        try {
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            const { data } = await axios.post(
                `${import.meta.env.VITE_API_URL}/fees/create-checkout-session`,
                { feeId },
                {
                    headers: { Authorization: `Bearer ${userInfo.token}` }
                }
            );

            if (data.url) {
                window.location.href = data.url;
            } else {
                toast.error('Failed to create payment session');
            }
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || 'Failed to initiate payment');
            setLoading(false);
        }
    };

    return (
        <div className="bg-gray-50 min-h-screen">
            <div className="mb-6">
                <h1 className="text-3xl font-extrabold text-gray-800 tracking-tight">
                    My <span className="text-blue-600">Invoices</span>
                </h1>
                <p className="text-gray-500 mt-2">View pending fees and payment history</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {fees.length === 0 ? (
                    <div className="col-span-3 text-center py-12 text-gray-400">No invoices found</div>
                ) : fees.map(fee => (
                    <div key={fee._id} className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 relative overflow-hidden">
                        <div className={`absolute top-0 right-0 px-4 py-1 rounded-bl-xl text-xs font-bold uppercase tracking-wider ${fee.status === 'Paid' ? 'bg-green-500 text-white' : 'bg-yellow-500 text-white'
                            }`}>
                            {fee.status}
                        </div>

                        <div className="flex items-center mb-4">
                            <div className={`p-3 rounded-full mr-4 ${fee.status === 'Paid' ? 'bg-green-100 text-green-600' : 'bg-yellow-100 text-yellow-600'}`}>
                                <FaFileInvoice className="text-xl" />
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-800">{fee.type}</h3>
                                <p className="text-sm text-gray-500">{fee.month}</p>
                            </div>
                        </div>

                        <div className="mb-6">
                            <p className="text-3xl font-extrabold text-gray-800">${fee.amount}</p>
                            <p className="text-xs text-gray-500 mt-1">Due: {new Date(fee.dueDate).toLocaleDateString()}</p>
                        </div>

                        {fee.status === 'Pending' ? (
                            <button
                                onClick={() => handlePay(fee._id)}
                                disabled={loading}
                                className="w-full bg-blue-600 text-white font-bold py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                            >
                                {loading ? 'Processing...' : <><FaCreditCard /> Pay Now</>}
                            </button>
                        ) : (
                            <div className="w-full bg-green-50 text-green-700 font-bold py-2 rounded-lg text-center flex items-center justify-center">
                                <FaCheckCircle className="mr-2" /> Paid on {new Date(fee.paidAt).toLocaleDateString()}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default FeePayment;
