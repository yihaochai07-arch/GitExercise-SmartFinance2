import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { AlertCircle, CheckCircle, Eye, EyeOff } from 'lucide-react';

export default function ResetPassword() {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const navigate = useNavigate();
  const inputCls = 'w-full px-4 py-3 bg-[#0d0d0d] border border-white/10 rounded-xl text-white placeholder-white/20 focus:outline-none focus:border-pink-500/50 transition text-sm pr-10';

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validations before submitting
    if (!newPassword || !confirmPassword) return setError('Please fill in all fields');
    if (newPassword.length < 6) return setError('Password must be at least 6 characters');
    if (newPassword !== confirmPassword) return setError('Passwords do not match');

    setLoading(true);
    try {
      // Call supabase.auth.updateUser() to update the password
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Update failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center px-4">
      <div className="w-full max-w-md relative">
        <div className="bg-[#0a0a0a] border border-white/[0.08] rounded-2xl p-8 shadow-2xl">
          
          {!success ? (
            <>
              <div className="flex flex-col items-center mb-8">
                <h1 className="text-2xl font-bold text-white tracking-tight">Set New Password</h1>
                <p className="text-white/30 text-sm mt-1">Enter your new password below</p>
              </div>

              {error && (
                <div className="mb-5 px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-xl flex gap-3">
                  <AlertCircle className="text-red-400 flex-shrink-0 mt-0.5" size={16} />
                  <p className="text-red-300/80 text-sm">{error}</p>
                </div>
              )}

              <form onSubmit={handleReset} className="space-y-4">
                <div className="relative">
                  <label className="block text-xs font-medium text-white/40 uppercase mb-2">New Password</label>
                  <input 
                    type={showNew ? "text" : "password"} 
                    value={newPassword} 
                    onChange={(e) => setNewPassword(e.target.value)} 
                    className={inputCls} 
                    placeholder="••••••••" 
                  />
                  <button type="button" onClick={() => setShowNew(!showNew)} className="absolute right-3 top-9 text-white/20">
                    {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>

                <div className="relative">
                  <label className="block text-xs font-medium text-white/40 uppercase mb-2">Confirm Password</label>
                  <input 
                    type={showConfirm ? "text" : "password"} 
                    value={confirmPassword} 
                    onChange={(e) => setConfirmPassword(e.target.value)} 
                    className={inputCls} 
                    placeholder="••••••••" 
                  />
                  <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 top-9 text-white/20">
                    {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>

                <button type="submit" disabled={loading} className="w-full py-3 bg-gradient-to-r from-pink-500 to-rose-500 text-white font-semibold rounded-xl disabled:opacity-40 shadow-lg text-sm">
                  {loading ? 'Updating...' : 'Update Password'}
                </button>
              </form>
            </>
          ) : (
            <div className="text-center py-4">
              <div className="flex justify-center mb-4">
                <CheckCircle className="text-green-400" size={48} />
              </div>
              <h2 className="text-xl font-bold text-white mb-2">Password Updated!</h2>
              <p className="text-white/40 text-sm mb-8">Your password has been changed successfully.</p>
              <button 
                onClick={() => navigate('/login')} 
                className="w-full py-3 bg-white/10 hover:bg-white/20 text-white font-medium rounded-xl transition-all text-sm"
              >
                Go to Login
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}