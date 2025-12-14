import React, { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import axios from 'axios';
import toast from 'react-hot-toast';
import { FaLock } from 'react-icons/fa';

// Initialize Stripe outside of component to avoid recreating it on render
console.log("DEBUG: VITE_STRIPE_KEY", import.meta.env.VITE_STRIPE_KEY);
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_KEY);

const CheckoutForm = ({ fee, onSuccess, onClose }) => {
    const stripe = useStripe();
    const elements = useElements();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleSubmit = async (event) => {
        event.preventDefault();
        setLoading(true);
        setError(null);

        if (!stripe || !elements) {
            setLoading(false);
            return;
        }

        try {
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));

            // 1. Create Payment Intent
            const { data } = await axios.post(
                `${import.meta.env.VITE_API_URL}/fees/create-payment-intent`,
                { feeId: fee._id },
                {
                    headers: { Authorization: `Bearer ${userInfo.token}` }
                }
            );

            // 2. Confirm Card Payment
            const result = await stripe.confirmCardPayment(data.clientSecret, {
                payment_method: {
                    card: elements.getElement(CardElement),
                    billing_details: {
                        name: userInfo.name,
                        email: userInfo.email
                    },
                },
            });

            if (result.error) {
                setError(result.error.message);
                setLoading(false);
            } else {
                if (result.paymentIntent.status === 'succeeded') {
                    // 3. Mark as Paid in Backend
                    await axios.put(
                        `${import.meta.env.VITE_API_URL}/fees/${fee._id}/pay`,
                        {},
                        {
                            headers: { Authorization: `Bearer ${userInfo.token}` }
                        }
                    );

                    toast.success('Payment Successful!');
                    onSuccess();
                    onClose();
                }
            }
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || err.message || 'Payment failed');
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="p-2">
            <div className="mb-6 bg-gray-50 p-4 rounded-lg border border-gray-200">
                <p className="text-gray-600 mb-1">Total Amount</p>
                <p className="text-3xl font-bold text-gray-800">${fee.amount}</p>
                <p className="text-sm text-gray-500 mt-1">{fee.type} - {fee.month}</p>
            </div>

            <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Card Details</label>
                <div className="p-3 border border-gray-300 rounded-lg bg-white">
                    <CardElement options={{
                        style: {
                            base: {
                                fontSize: '16px',
                                color: '#424770',
                                '::placeholder': {
                                    color: '#aab7c4',
                                },
                            },
                        },
                    }} />
                </div>
            </div>

            {error && (
                <div className="mb-4 text-red-600 text-sm bg-red-50 p-3 rounded-lg border border-red-100">
                    {error}
                </div>
            )}

            <button
                type="submit"
                disabled={!stripe || loading}
                className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-blue-500/30 disabled:opacity-50"
            >
                {loading ? 'Processing...' : (
                    <>
                        <FaLock className="text-sm" /> Pay ${fee.amount} Now
                    </>
                )}
            </button>
        </form>
    );
};

const PaymentModal = ({ fee, isOpen, onClose, onSuccess }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-md w-full relative animate-fadeIn">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-xl font-bold"
                >
                    &times;
                </button>

                <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                    Secure Payment
                </h2>

                <Elements stripe={stripePromise}>
                    <CheckoutForm fee={fee} onSuccess={onSuccess} onClose={onClose} />
                </Elements>

                <div className="mt-4 text-center">
                    <p className="text-xs text-gray-400 flex items-center justify-center gap-1">
                        <FaLock size={10} /> Payments are secured by Stripe
                    </p>
                </div>
            </div>
        </div>
    );
};

export default PaymentModal;
