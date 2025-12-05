import React, { useState } from 'react';
import { X, Mail, LogIn } from 'lucide-react';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (authToken: string, planTier: string, email: string) => void;
}

const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose, onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleEmailLogin = async () => {
    if (!email.trim()) {
      setError('Please enter your email address');
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), action: 'send_email' }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Login failed');
      }

      setSuccessMessage('Login token sent! Check your email.');
      setEmail('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send login email');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setEmail('');
    setError(null);
    setSuccessMessage(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 relative">
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors"
        >
          <X className="h-6 w-6" />
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <div className="bg-teal-100 rounded-full p-3 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <LogIn className="h-8 w-8 text-teal-600" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Welcome Back!</h2>
          <p className="text-slate-600">Log in to access your resume</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        {/* Success Message */}
        {successMessage && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-4">
            {successMessage}
          </div>
        )}

        {/* Email Input */}
        <div className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-semibold text-slate-700 mb-2">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleEmailLogin()}
              placeholder="your.email@example.com"
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              disabled={isLoading}
            />
          </div>

          {/* Send Email Button */}
          <button
            onClick={handleEmailLogin}
            disabled={isLoading}
            className="w-full bg-teal-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-teal-500 transition-all focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 disabled:bg-slate-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
                Sending...
              </>
            ) : (
              <>
                <Mail className="h-5 w-5" />
                Send Login Link
              </>
            )}
          </button>
        </div>

        {/* Info */}
        <div className="mt-6 pt-6 border-t border-slate-200">
          <p className="text-sm text-slate-600 text-center">
            We'll send a secure login token to your email address. Use it to access your account.
          </p>
        </div>

        {/* New Customer Link */}
        <div className="mt-4 text-center">
          <p className="text-sm text-slate-600">
            New customer?{' '}
            <button
              onClick={handleClose}
              className="text-teal-600 font-semibold hover:underline"
            >
              Create your resume
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginModal;
