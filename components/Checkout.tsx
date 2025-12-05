
import React, { useState, useEffect } from 'react';
import { PackageTier } from '../types';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';

// Retrieve Stripe key from Vite environment variables
const getStripeKey = () => {
    if (typeof window !== 'undefined' && window.env?.VITE_STRIPE_PUBLISHABLE_KEY) {
        return window.env.VITE_STRIPE_PUBLISHABLE_KEY;
    }
    return import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '';
};

// Initialize Stripe
const stripePromise = loadStripe(getStripeKey());

interface CheckoutProps {
  plan: PackageTier;
  onPurchase: (tier: PackageTier, token?: string, email?: string) => void;
  onBack: () => void;
}

const packageDetails: Record<PackageTier, { name: string; price: number; features: string[] }> = {
    'none': { name: 'None', price: 0, features: [] },
    'fast-ai': { name: 'New Grad', price: 149, features: ["Guaranteed ATS Compliance", "AI Architecture Engine", "Unlimited Revisions", "PDF & Word Output"] },
    'ai-target': { name: 'Bedside/Clinical', price: 299, features: ["Everything in New Grad", "Clinical Match Probability Score", "Job Description Mapping", "Gap Analysis Engine"] },
    'expert-clinical': { name: 'Expert/Clinical', price: 499, features: ["Everything in Bedside/Clinical", "Clinical Outcome Extraction", "3 Specialty Variants", "Interview Prep Sheet", "Cover Letter Included"] },
    'leadership-np': { name: 'Leadership/NP', price: 649, features: ["Everything in Expert/Clinical", "Leadership ROI Protocol", "Budget & Staffing Metrics", "Executive Summary Development", "Priority Support"] },
};

// --- Internal Payment Form Component ---
const PaymentForm: React.FC<{ 
    amount: number, 
    isLoading: boolean, 
    setIsLoading: (val: boolean) => void,
    onSuccess: (authToken?: string) => void,
    onError: (msg: string) => void,
    email: string
}> = ({ amount, isLoading, setIsLoading, onSuccess, onError, email }) => {
    const stripe = useStripe();
    const elements = useElements();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!stripe || !elements) {
            return;
        }

        setIsLoading(true);

        const { error } = await stripe.confirmPayment({
            elements,
            confirmParams: {
                // Return URL with success parameters for thank you page
                return_url: `${window.location.origin}?payment_success=true`,
            },
            redirect: "if_required", // Prevent redirect if possible to keep them in the SPA
        });

        if (error) {
            onError(error.message || "Payment failed");
            setIsLoading(false);
        } else {
            // Payment succeeded - retrieve auth token
            try {
                const res = await fetch('/api/get-auth-token', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email: email.trim() }),
                });
                
                if (!res.ok) {
                    const errorData = await res.json();
                    throw new Error(errorData.message || 'Failed to retrieve authentication token.');
                }
                
                const data = await res.json();
                onSuccess(data.authToken);
            } catch (err) {
                onError(err instanceof Error ? err.message : 'Payment succeeded but failed to retrieve authentication token.');
                setIsLoading(false);
            }
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
             <PaymentElement />
             <button 
                type="submit" 
                disabled={isLoading || !stripe || !elements}
                className="w-full bg-teal-600 text-white font-bold py-4 px-4 rounded-xl hover:bg-teal-500 transition-all focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 text-lg shadow-lg shadow-teal-500/20 mt-6 disabled:bg-slate-300 disabled:cursor-not-allowed flex justify-center items-center gap-2"
            >
                {isLoading && <Spinner />}
                {isLoading ? 'Processing Secure Payment...' : `Pay $${amount}`}
            </button>
            <div className="flex items-center justify-center gap-4 pt-2 opacity-50 grayscale">
                <img src="https://upload.wikimedia.org/wikipedia/commons/a/a4/Visa_Inc._logo.svg" alt="Visa" className="h-4"/>
                <img src="https://upload.wikimedia.org/wikipedia/commons/b/b7/MasterCard_Logo.svg" alt="Mastercard" className="h-6"/>
                <img src="https://upload.wikimedia.org/wikipedia/commons/f/fa/American_Express_logo_%282018%29.svg" alt="Amex" className="h-6"/>
            </div>
        </form>
    );
};

const Checkout: React.FC<CheckoutProps> = ({ plan, onPurchase, onBack }) => {
    const [clientSecret, setClientSecret] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [couponCode, setCouponCode] = useState('');
    const [appliedCoupon, setAppliedCoupon] = useState<{code: string, percentOff: number} | null>(null);
    const [isVerifyingCoupon, setIsVerifyingCoupon] = useState(false);
    const [email, setEmail] = useState('');
    const [showCoverLetterOffer, setShowCoverLetterOffer] = useState(false);
    const [addCoverLetter, setAddCoverLetter] = useState(false);
    
    // Check if we actually have Stripe Configured
    const stripeKey = getStripeKey();
    const hasStripeKey = !!stripeKey;
    
    const details = packageDetails[plan];
    
    // UI Calculation Only (Real calculation happens on server)
    const coverLetterPrice = 79;
    const discountAmount = appliedCoupon ? (details.price * (appliedCoupon.percentOff / 100)) : 0;
    const basePrice = Math.max(0, details.price - discountAmount);
    const finalPrice = basePrice + (addCoverLetter ? coverLetterPrice : 0);
    const isFree = finalPrice === 0;
    
    // Show cover letter offer after 5 seconds
    useEffect(() => {
        const timer = setTimeout(() => setShowCoverLetterOffer(true), 5000);
        return () => clearTimeout(timer);
    }, []);
    
    // No longer need separate useEffect to reset - will be handled by main useEffect

    useEffect(() => {
        // If it's free, we don't need a PaymentIntent
        if (isFree || !hasStripeKey) return;

        // Fetch PaymentIntent as soon as the checkout loads
        // Debounce slightly to wait for email entry in a real flow, but here we init early
        const initPayment = async () => {
             try {
                const res = await fetch('/api/create-payment-intent', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ 
                        plan, 
                        email: email || 'guest@example.com', // Placeholder until they enter it
                        couponCode: appliedCoupon?.code,
                        addCoverLetter: addCoverLetter
                    }),
                });
                
                if (!res.ok) throw new Error('Failed to initialize payment');
                
                const data = await res.json();
                setClientSecret(data.clientSecret);
            } catch (err) {
                console.error("Payment Init Error:", err);
                // Don't show error to user yet, just fallback or retry
            }
        };
        
        // Only fetch if we aren't already fetching
        if(!clientSecret) {
            initPayment();
        }
    }, [plan, appliedCoupon, addCoverLetter, hasStripeKey, isFree, clientSecret]);

    const handleApplyCoupon = async () => {
        if (!couponCode.trim()) return;
        setIsVerifyingCoupon(true);
        setError(null);
        
        // Simulate check
        setTimeout(() => {
            const code = couponCode.trim().toUpperCase();
            if (code === 'BETA_TESTER_100' || code === 'DEMO_MODE') {
                setAppliedCoupon({ code, percentOff: 100 });
                setCouponCode('');
                setClientSecret(null); // Reset secret as price is now 0
            } 
            else if (code === 'NURSE_HERO') {
                setAppliedCoupon({ code, percentOff: 10 });
                setCouponCode('');
                setClientSecret(null); // Reset secret to re-calc price on server
            } 
            else {
                setError("Invalid coupon code.");
            }
            setIsVerifyingCoupon(false);
        }, 800);
    };

    const handlePurchase = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        // Validate email is provided
        if (!email || !email.trim()) {
            setError('Please enter your email address.');
            setIsLoading(false);
            return;
        }

        // FREE or SIMULATION MODE
        if (isFree || !hasStripeKey) {
            // Retrieve auth token using email
            try {
                const res = await fetch('/api/get-auth-token', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email: email.trim() }),
                });
                
                if (!res.ok) {
                    const errorData = await res.json();
                    throw new Error(errorData.message || 'Failed to retrieve authentication token.');
                }
                
                const data = await res.json();
                
                setTimeout(() => {
                    onPurchase(plan, data.authToken, email);
                }, 1500);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to complete activation.');
                setIsLoading(false);
            }
            return;
        }
        
        // REAL MODE handled by PaymentForm component
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8 font-sans">
            <div className="w-full max-w-4xl mx-auto">
                <button onClick={onBack} className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-teal-600 transition-colors mb-6">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Return to Hub
                </button>

                <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-200 overflow-hidden">
                    <div className="grid grid-cols-1 lg:grid-cols-2">
                        {/* Order Summary */}
                        <div className="p-8 md:p-12 bg-slate-900 text-white border-b lg:border-r lg:border-b-0">
                            <h2 className="text-2xl font-bold font-brand mb-8">Investment Summary</h2>
                            <div className="flow-root">
                                <div className="-my-4 divide-y divide-slate-700">
                                    <div className="flex items-center justify-between py-4">
                                        <div>
                                            <p className="text-xl font-bold text-white">{details.name}</p>
                                            <p className="text-sm text-slate-400">ShiftChange Professional Access</p>
                                        </div>
                                        <p className="text-2xl font-bold text-teal-400">${details.price}</p>
                                    </div>
                                    
                                    {/* Discount Row */}
                                    {appliedCoupon && (
                                        <div className="flex items-center justify-between py-4 bg-teal-900/30 px-2 -mx-2 rounded">
                                            <div>
                                                <p className="text-sm font-bold text-teal-300 flex items-center gap-2">
                                                    <TagIcon /> Code: {appliedCoupon.code}
                                                </p>
                                            </div>
                                            <p className="text-lg font-bold text-teal-300">-${discountAmount.toFixed(0)}</p>
                                        </div>
                                    )}
                                    
                    {/* Cover Letter Add-On */}
                    {showCoverLetterOffer && plan !== 'expert-clinical' && plan !== 'leadership-np' && (
                                        <div className="flex items-center justify-between py-4">
                                            <label className="flex items-start gap-3 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={addCoverLetter}
                                                    onChange={(e) => setAddCoverLetter(e.target.checked)}
                                                    className="mt-1 h-4 w-4 text-teal-600 rounded focus:ring-teal-500"
                                                />
                                                <div>
                                                    <p className="text-sm font-bold text-white">Add Cover Letter</p>
                                                    <p className="text-xs text-slate-400">Professional cover letter tailored to your target role</p>
                                                </div>
                                            </label>
                                            <p className="text-lg font-bold text-teal-400">+${coverLetterPrice}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                            
                            {/* Coupon Input */}
                            <div className="mt-8 pt-6 border-t border-slate-700">
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Gift Code / Coupon</label>
                                <div className="flex gap-2">
                                    <input 
                                        type="text" 
                                        value={couponCode}
                                        onChange={(e) => setCouponCode(e.target.value)}
                                        placeholder="Enter code"
                                        disabled={!!appliedCoupon}
                                        className="bg-slate-800 border border-slate-600 text-white text-sm rounded-lg px-3 py-2 w-full focus:outline-none focus:border-teal-500 uppercase"
                                    />
                                    {!appliedCoupon ? (
                                        <button 
                                            onClick={handleApplyCoupon}
                                            disabled={isVerifyingCoupon || !couponCode}
                                            className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg text-sm font-bold transition-colors disabled:opacity-50"
                                        >
                                            {isVerifyingCoupon ? '...' : 'Apply'}
                                        </button>
                                    ) : (
                                        <button 
                                            onClick={() => { setAppliedCoupon(null); setClientSecret(null); }}
                                            className="bg-red-900/50 hover:bg-red-900 text-red-200 px-4 py-2 rounded-lg text-sm font-bold transition-colors"
                                        >
                                            Remove
                                        </button>
                                    )}
                                </div>
                            </div>

                            <div className="mt-8 pt-6 border-t border-slate-700 flex items-center justify-between">
                                <p className="text-sm font-bold text-slate-400">Total Due</p>
                                <p className="text-3xl font-bold text-white">${finalPrice}</p>
                            </div>
                        </div>

                        {/* Payment Form */}
                        <div className="p-8 md:p-12 relative">
                            <h2 className="text-2xl font-bold font-brand text-slate-900 mb-6">
                                {isFree ? "Complete Activation" : "Secure Transaction"}
                            </h2>
                            
                            {/* 
                                LOGIC: 
                                1. If Free (Coupon) -> Show simple button.
                                2. If Real Key + ClientSecret -> Show Stripe Elements.
                                3. If Real Key + Loading -> Show Spinner.
                                4. If No Key -> Show Simulation Mode (Fallback).
                            */}

                            {isFree ? (
                                <form onSubmit={handlePurchase} className="space-y-6">
                                    <div className="bg-teal-50 border border-teal-200 rounded-lg p-6 text-center">
                                        <div className="w-16 h-16 bg-teal-100 text-teal-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <CheckIcon className="w-8 h-8"/>
                                        </div>
                                        <h3 className="text-lg font-bold text-teal-900">100% Discount Applied</h3>
                                        <p className="text-teal-700 mt-2">No payment information is required.</p>
                                    </div>
                                    <button 
                                        type="submit" 
                                        disabled={isLoading}
                                        className="w-full bg-teal-600 text-white font-bold py-4 px-4 rounded-xl hover:bg-teal-500 transition-all text-lg shadow-lg"
                                    >
                                        {isLoading ? 'Activating...' : 'Activate Account Now'}
                                    </button>
                                </form>
                            ) : hasStripeKey && clientSecret ? (
                                <Elements stripe={stripePromise} options={{ clientSecret }}>
                                    <PaymentForm 
                                        amount={finalPrice} 
                                        isLoading={isLoading} 
                                        setIsLoading={setIsLoading}
                                        onSuccess={(authToken) => onPurchase(plan, authToken, email)}
                                        onError={(msg) => setError(msg)}
                                        email={email}
                                    />
                                </Elements>
                            ) : hasStripeKey ? (
                                <div className="flex flex-col items-center justify-center py-12">
                                    <Spinner />
                                    <p className="mt-4 text-slate-500">Connecting to secure payment gateway...</p>
                                </div>
                            ) : (
                                // FALLBACK SIMULATION MODE (No Keys Set)
                                <form onSubmit={handlePurchase} className="space-y-5">
                                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
                                        <p className="text-xs font-bold text-amber-600 uppercase tracking-wider mb-2">Test Mode Active</p>
                                        <p className="text-sm text-amber-800">Stripe keys are not configured in this environment. Proceeding with simulation.</p>
                                    </div>

                                    <Input label="Email Address" id="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} required />
                                    <Input label="Cardholder Name" id="name" placeholder="Name as it appears on card" />
                                    
                                    <div className="p-4 border border-slate-300 rounded-lg bg-slate-50 text-slate-400 text-sm flex items-center justify-between">
                                        <span>•••• •••• •••• 4242</span>
                                        <div className="flex gap-2">
                                            <div className="w-8 h-5 bg-slate-200 rounded"></div>
                                        </div>
                                    </div>
                                    
                                    {error && <div className="text-red-500 text-sm font-bold bg-red-50 p-3 rounded">{error}</div>}

                                    <button 
                                        type="submit" 
                                        disabled={isLoading}
                                        className="w-full bg-slate-800 text-white font-bold py-4 px-4 rounded-xl hover:bg-slate-700 transition-all text-lg shadow-lg mt-4 disabled:opacity-50"
                                    >
                                        {isLoading ? 'Processing Simulation...' : `Simulate Pay $${finalPrice}`}
                                    </button>
                                </form>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const Input: React.FC<{label: string, id: string, placeholder: string, value?: string, onChange?: (e:any)=>void, required?: boolean}> = ({label, id, placeholder, value, onChange, required}) => (
    <div>
        <label htmlFor={id} className="block text-sm font-bold text-slate-700 mb-1.5">{label}</label>
        <input 
            type="text" 
            id={id} 
            name={id}
            required={required} 
            placeholder={placeholder} 
            value={value}
            onChange={onChange}
            className="w-full text-base px-4 py-3 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition bg-slate-50 focus:bg-white" 
        />
    </div>
);

const CheckIcon = ({className = "h-5 w-5"}: {className?: string}) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={`${className} flex-shrink-0`} viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
    </svg>
);

const TagIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
    </svg>
);

const Spinner = () => (
    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
);

export default Checkout;
