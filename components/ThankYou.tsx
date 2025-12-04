import React, { useEffect, useState } from 'react';
import { CheckCircle } from 'lucide-react';

interface ThankYouProps {
  onContinue: () => void;
  packageName: string;
}

const ThankYou: React.FC<ThankYouProps> = ({ onContinue, packageName }) => {
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    // Countdown timer
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          onContinue();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [onContinue]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-blue-50 flex items-center justify-center p-4 font-sans">
      <div className="max-w-2xl w-full">
        <div className="bg-white rounded-2xl shadow-2xl shadow-teal-500/20 border border-teal-100 p-8 md:p-12 text-center">
          {/* Success Icon */}
          <div className="flex justify-center mb-6">
            <div className="bg-teal-100 rounded-full p-4">
              <CheckCircle className="h-16 w-16 text-teal-600" strokeWidth={2} />
            </div>
          </div>

          {/* Thank You Message */}
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
            Thank You for Your Purchase!
          </h1>
          
          <p className="text-lg text-slate-600 mb-6">
            Your payment has been successfully processed.
          </p>

          {/* Package Info */}
          <div className="bg-teal-50 border border-teal-200 rounded-xl p-6 mb-8">
            <p className="text-sm text-teal-700 font-semibold mb-2">
              PACKAGE UNLOCKED
            </p>
            <p className="text-2xl font-bold text-teal-900">
              {packageName}
            </p>
          </div>

          {/* What's Next */}
          <div className="mb-8">
            <h2 className="text-xl font-bold text-slate-900 mb-4">
              What's Next?
            </h2>
            <p className="text-slate-600 mb-4">
              You now have full access to all premium features. Continue building your professional resume with our advanced AI tools.
            </p>
          </div>

          {/* Auto-redirect notice */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 mb-6">
            <p className="text-sm text-slate-600">
              Redirecting you back to the resume editor in{' '}
              <span className="font-bold text-teal-600 text-lg">{countdown}</span>{' '}
              seconds...
            </p>
          </div>

          {/* Manual Continue Button */}
          <button
            onClick={onContinue}
            className="w-full bg-teal-600 text-white font-bold py-4 px-6 rounded-xl hover:bg-teal-500 transition-all focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 text-lg shadow-lg shadow-teal-500/20"
          >
            Continue to Resume Editor
          </button>

          {/* Support Info */}
          <p className="text-sm text-slate-500 mt-8">
            Need help? Contact us at{' '}
            <a href="mailto:support@shiftchange.com" className="text-teal-600 hover:underline">
              support@shiftchange.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ThankYou;
