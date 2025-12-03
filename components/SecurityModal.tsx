
import React, { useState } from 'react';
import { hashPassword, verifyPassword } from '../services/securityService';

interface SecurityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPasswordSet: (hash: string) => void;
  onPasswordRemoved: () => void;
  hasPassword: boolean;
}

const SecurityModal: React.FC<SecurityModalProps> = ({ isOpen, onClose, onPasswordSet, onPasswordRemoved, hasPassword }) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  if (!isOpen) return null;

  const handleSetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (newPassword.length < 4) {
        setError('Password must be at least 4 characters.');
        return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    // If changing password, verify old one first
    if (hasPassword) {
       const storedHash = localStorage.getItem('nurse-resume-password-hash');
       if (storedHash) {
           const isCorrect = await verifyPassword(currentPassword, storedHash);
           if (!isCorrect) {
               setError('Current password is incorrect.');
               return;
           }
       }
    }

    const hash = await hashPassword(newPassword);
    onPasswordSet(hash);
    setSuccess('Password saved successfully!');
    setTimeout(() => {
        onClose();
        resetForm();
    }, 1500);
  };

  const handleRemovePassword = async () => {
    setError('');
    const storedHash = localStorage.getItem('nurse-resume-password-hash');
    if (storedHash) {
        const isCorrect = await verifyPassword(currentPassword, storedHash);
        if (!isCorrect) {
            setError('Current password is required to remove protection.');
            return;
        }
    }
    
    onPasswordRemoved();
    setSuccess('Password protection removed.');
    setTimeout(() => {
        onClose();
        resetForm();
    }, 1500);
  };
  
  const resetForm = () => {
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setError('');
      setSuccess('');
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-fade-in-down">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <ShieldIcon />
            Security Settings
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6">
          {success ? (
            <div className="bg-green-50 text-green-700 p-4 rounded-lg text-center font-medium">
                {success}
            </div>
          ) : (
            <form onSubmit={handleSetPassword} className="space-y-4">
                {hasPassword && (
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Current Password</label>
                        <input
                            type="password"
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                )}
                
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                        {hasPassword ? 'New Password' : 'Set Password'}
                    </label>
                    <input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Confirm Password</label>
                    <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                {error && <p className="text-red-500 text-sm">{error}</p>}

                <div className="pt-4 flex flex-col gap-3">
                    <button
                        type="submit"
                        className="w-full bg-blue-600 text-white font-semibold py-2.5 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        {hasPassword ? 'Update Password' : 'Protect Resume'}
                    </button>
                    
                    {hasPassword && (
                        <button
                            type="button"
                            onClick={handleRemovePassword}
                            className="w-full bg-white text-red-600 font-semibold py-2.5 rounded-lg border border-red-200 hover:bg-red-50 transition-colors"
                        >
                            Remove Password Protection
                        </button>
                    )}
                </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

const ShieldIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
    </svg>
);

export default SecurityModal;
