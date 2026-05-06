import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { AlertCircle, CheckCircle, ArrowLeft } from 'lucide-react';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const inputCls = 'w-full px-4 py-3 bg-[#0d0d0d] border border-white/10 rounded-xl text-white placeholder-white/20 focus:outline-none focus:border-pink-500/50 focus:ring-1 focus:ring-pink-500/20 transition text-sm';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center px-4">
      <div className="w-full max-w-md relative z-10">
        <div className="bg-[#0a0a0a] border border-white/[0.08] rounded-2xl p-8 shadow-2xl">
          
          {!sent ? (
            <>
              <div className="flex flex-col items-center mb-8">
                <h1 className="text-2xl font-bold text-white tracking-tight">Forgot Password</h1>
                <p className="text-white/30 text-sm mt-1 text-center">Enter your email to receive a reset link</p>
              </div>

              {error && (
                <div className="mb-5 px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-xl flex gap-3 items-start">
                  <AlertCircle className="text-red-400 flex-shrink-0 mt-0.5" size={16} />
                  <p className="text-red-300/80 text-sm">{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-white/40 uppercase mb-2">Email Address</label>
                  <input 
                    type="email" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                    required 
                    className={inputCls} 
                    placeholder="you@example.com" 
                  />
                </div>

                <button 
                  type="submit" 
                  disabled={loading} 
                  className="w-full py-3 bg-gradient-to-r from-pink-500 to-rose-500 text-white font-semibold rounded-xl transition-all disabled:opacity-40 shadow-lg text-sm"
                >
                  {loading ? 'Sending link...' : 'Send Reset Link'}
                </button>
              </form>
            </>
          ) : (
            <div className="text-center py-4">
              <div className="flex justify-center mb-4">
                <CheckCircle className="text-green-400" size={48} />
              </div>
              <h2 className="text-xl font-bold text-white mb-2">Check your email!</h2>
              <p className="text-white/40 text-sm mb-8">We sent a reset link to your inbox.</p>
            </div>
          )}

          <div className="mt-6 pt-5 border-t border-white/[0.06] text-center">
            <Link to="/login" className="inline-flex items-center gap-2 text-white/30 hover:text-white transition-colors text-sm">
              <ArrowLeft size={14} /> Back to Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}