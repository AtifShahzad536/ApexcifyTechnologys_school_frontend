import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaCheckCircle, FaExclamationCircle } from 'react-icons/fa';
import toast from 'react-hot-toast';

const PaymentSuccess = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [status, setStatus] = useState('loading'); // loading, success, error

    useEffect(() => {
        const verifyPayment = async () => {
            const sessionId = searchParams.get('session_id');
            const feeId = searchParams.get('fee_id');

            if (!sessionId || !feeId) {
                setStatus('error');
                return;
            }

            try {
                const userInfo = JSON.parse(localStorage.getItem('userInfo'));
                await axios.post(
                    `${import.meta.env.VITE_API_URL}/fees/payment-success`,
                    { session_id: sessionId, feeId },
                    {
                        headers: { Authorization: `Bearer ${userInfo.token}` }
                    }
                );
                setStatus('success');
                toast.success('Payment verified successfully!');
                setTimeout(() => navigate('/parent/fees'), 3000);
            } catch (error) {
                console.error(error);
                setStatus('error');
                toast.error('Payment verification failed');
            }
        };

        verifyPayment();
    }, [searchParams, navigate]);

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
                {status === 'loading' && (
                    <>
                        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
                        <h2 className="text-2xl font-bold text-gray-800">Verifying Payment...</h2>
                        <p className="text-gray-500 mt-2">Please wait while we confirm your transaction.</p>
                    </>
                )}

                {status === 'success' && (
                    <>
                        <FaCheckCircle className="text-6xl text-green-500 mx-auto mb-4 animate-bounce" />
                        <h2 className="text-2xl font-bold text-gray-800">Payment Successful!</h2>
                        <p className="text-gray-500 mt-2">Your fee has been marked as paid.</p>
                        <p className="text-sm text-gray-400 mt-6">Redirecting to invoices...</p>
                    </>
                )}

                {status === 'error' && (
                    <>
                        <FaExclamationCircle className="text-6xl text-red-500 mx-auto mb-4" />
                        <h2 className="text-2xl font-bold text-gray-800">Verification Failed</h2>
                        <p className="text-gray-500 mt-2">We couldn't verify the payment status.</p>
                        <button
                            onClick={() => navigate('/parent/fees')}
                            className="mt-6 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            Return to Invoices
                        </button>
                    </>
                )}
            </div>
        </div>
    );
};

export default PaymentSuccess;
