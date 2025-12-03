
import React, { useState } from 'react';
import { verifyPassword } from '../services/securityService';

interface LockScreenProps {
  onUnlock: () => void;
  onResetApp: () => void;
}

const LockScreen: React.FC<LockScreenProps> = ({ onUnlock, onResetApp }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const storedHash = localStorage.getItem('nurse-resume-password-hash');
      if (!storedHash) {
        // Should not happen if LockScreen is shown, but just in case
        onUnlock();
        return;
      }

      const isValid = await verifyPassword(password, storedHash);
      if (isValid) {
        onUnlock();
      } else {
        setError('Incorrect password. Please try again.');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    if (showResetConfirm) {
      onResetApp();
    } else {
      setShowResetConfirm(true);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md text-center">
        <div className="mx-auto bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mb-6">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Welcome Back</h2>
        <p className="text-slate-500 mb-8">This resume is password protected. Please enter your password to continue.</p>

        <form onSubmit={handleUnlock} className="space-y-4">
          <div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter Password"
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              autoFocus
            />
          </div>
          
          {error && <p className="text-red-500 text-sm font-medium">{error}</p>}

          <button
            type="submit"
            disabled={isLoading || !password}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Verifying...' : 'Unlock Resume'}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-slate-100">
          {!showResetConfirm ? (
             <button 
                onClick={handleReset}
                className="text-sm text-slate-400 hover:text-red-500 transition-colors"
             >
               Forgot Password?
             </button>
          ) : (
            <div className="bg-red-50 p-4 rounded-lg animate-fade-in">
              <p className="text-sm text-red-700 font-medium mb-3">
                Warning: Resetting will delete your password AND all resume data. This cannot be undone.
              </p>
              <div className="flex gap-3 justify-center">
                 <button 
                    onClick={() => setShowResetConfirm(false)}
                    className="px-3 py-1.5 text-sm font-medium text-slate-600 bg-white border border-slate-300 rounded hover:bg-slate-50"
                 >
                   Cancel
                 </button>
                 <button 
                    onClick={handleReset}
                    className="px-3 py-1.5 text-sm font-medium text-white bg-red-600 rounded hover:bg-red-700"
                 >
                   Yes, Delete Everything
                 </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LockScreen;
