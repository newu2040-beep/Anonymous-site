import React, { useState } from 'react';
import { X, Lock, Mail, ShieldCheck, Sparkles, AlertCircle, ArrowRight, UserCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultMode?: 'login' | 'signup';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  defaultMode = 'login',
}) => {
  const { signInWithGoogle, signInWithEmail, signUpWithEmail, sendPasswordReset, signInAsGuest } =
    useAuth();

  const [mode, setMode] = useState<'login' | 'signup' | 'reset'>(defaultMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resetSent, setResetSent] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (mode === 'login') {
        await signInWithEmail(email, password);
        onClose();
      } else if (mode === 'signup') {
        if (password.length < 6) {
          throw new Error('Password must be at least 6 characters');
        }
        await signUpWithEmail(email, password);
        onClose();
      } else if (mode === 'reset') {
        await sendPasswordReset(email);
        setResetSent(true);
      }
    } catch (err: any) {
      console.error(err);
      let msg = err.message || 'Authentication failed';
      if (msg.includes('auth/invalid-credential') || msg.includes('auth/wrong-password')) {
        msg = 'Invalid email or password.';
      } else if (msg.includes('auth/email-already-in-use')) {
        msg = 'An account with this email already exists. Try logging in.';
      } else if (msg.includes('auth/user-not-found')) {
        msg = 'No account found with this email.';
      }
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setError(null);
    setLoading(true);
    try {
      await signInWithGoogle();
      onClose();
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Google sign in failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGuest = async () => {
    setError(null);
    setLoading(true);
    try {
      await signInAsGuest();
      onClose();
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Guest sign in failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md rounded-3xl liquid-glass border border-white/20 dark:border-white/10 shadow-2xl p-6 sm:p-8 overflow-hidden">
        {/* Glow accent */}
        <div className="absolute -top-24 -left-24 w-48 h-48 rounded-full bg-violet-600/30 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-48 h-48 rounded-full bg-cyan-500/20 blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-100 hover:bg-white/10 transition-colors"
        >
          <X size={18} />
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-tr from-violet-600 to-indigo-600 shadow-lg shadow-violet-500/25 mb-3 border border-white/20 text-white">
            <Lock size={22} />
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            {mode === 'login' && 'Welcome to ANONYMOUSSITE'}
            {mode === 'signup' && 'Claim Your Anonymous Identity'}
            {mode === 'reset' && 'Reset Secret Access'}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xs mx-auto">
            {mode === 'login' && 'Sign in to publish, react, and converse safely.'}
            {mode === 'signup' && 'Your real identity stays 100% private. An alias is generated for you.'}
            {mode === 'reset' && 'Enter your registered email to receive a secure reset link.'}
          </p>
        </div>

        {/* Privacy Promise Banner */}
        <div className="flex items-start gap-2.5 p-3 rounded-2xl bg-violet-500/10 dark:bg-violet-950/30 border border-violet-500/20 text-xs text-violet-700 dark:text-violet-300 mb-5">
          <ShieldCheck size={16} className="shrink-0 mt-0.5 text-violet-500" />
          <span>
            <strong>Zero-Leak Privacy:</strong> Your email and real name are never displayed to anyone. All activity appears under your generated alias.
          </span>
        </div>

        {error && (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-600 dark:text-rose-400 mb-4">
            <AlertCircle size={15} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {resetSent ? (
          <div className="text-center py-6">
            <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto mb-3">
              <UserCheck size={24} />
            </div>
            <h3 className="text-base font-semibold text-slate-900 dark:text-white">Reset Link Sent</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Check your inbox for password recovery instructions.
            </p>
            <button
              onClick={() => {
                setResetSent(false);
                setMode('login');
              }}
              className="mt-4 px-4 py-2 rounded-xl bg-violet-600 text-white text-xs font-semibold hover:bg-violet-500 transition-colors"
            >
              Back to Login
            </button>
          </div>
        ) : (
          <>
            {/* Google One-Click Button */}
            <button
              type="button"
              disabled={loading}
              onClick={handleGoogle}
              className="w-full flex items-center justify-center gap-3 py-2.5 px-4 rounded-2xl bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-100 border border-slate-200 dark:border-white/10 hover:border-violet-400 dark:hover:border-violet-500 shadow-sm hover:shadow transition-all font-medium text-sm disabled:opacity-60"
            >
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.66v3.05h3.87c2.26-2.09 3.67-5.17 3.67-9.15z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.87-3.05c-1.08.72-2.45 1.16-4.06 1.16-3.13 0-5.78-2.11-6.73-4.96H1.28v3.15C3.26 21.36 7.35 24 12 24z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.27 14.24c-.25-.72-.38-1.49-.38-2.24s.13-1.52.38-2.24V6.61H1.28C.46 8.23 0 10.06 0 12s.46 3.77 1.28 5.39l3.99-3.15z"
                />
                <path
                  fill="#EA4335"
                  d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.35 0 3.26 2.64 1.28 6.61l3.99 3.15c.95-2.85 3.6-4.96 6.73-4.96z"
                />
              </svg>
              <span>Continue with Google</span>
            </button>

            {/* Quick Guest Access */}
            <button
              type="button"
              disabled={loading}
              onClick={handleGuest}
              className="mt-2.5 w-full flex items-center justify-center gap-2 py-2 px-4 rounded-2xl bg-slate-100/70 dark:bg-slate-800/40 text-slate-600 dark:text-slate-300 border border-slate-200/60 dark:border-white/5 hover:border-slate-300 dark:hover:border-white/10 text-xs font-medium transition-colors"
            >
              <Sparkles size={14} className="text-violet-400" />
              <span>Instant Guest Mode (No signup required)</span>
            </button>

            {/* Divider */}
            <div className="relative flex py-4 items-center">
              <div className="flex-grow border-t border-slate-200 dark:border-white/10" />
              <span className="flex-shrink mx-3 text-[11px] uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Or with email
              </span>
              <div className="flex-grow border-t border-slate-200 dark:border-white/10" />
            </div>

            {/* Email / Password Form */}
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@domain.com"
                    className="w-full pl-9 pr-3 py-2 text-sm rounded-xl bg-white/70 dark:bg-slate-900/60 border border-slate-200 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-violet-500 text-slate-900 dark:text-white placeholder:text-slate-400"
                  />
                </div>
              </div>

              {mode !== 'reset' && (
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                      Password
                    </label>
                    {mode === 'login' && (
                      <button
                        type="button"
                        onClick={() => setMode('reset')}
                        className="text-[11px] text-violet-500 hover:text-violet-400 hover:underline"
                      >
                        Forgot password?
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <Lock
                      size={16}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                    />
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-9 pr-3 py-2 text-sm rounded-xl bg-white/70 dark:bg-slate-900/60 border border-slate-200 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-violet-500 text-slate-900 dark:text-white placeholder:text-slate-400"
                    />
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-semibold text-sm shadow-lg shadow-violet-600/25 transition-all disabled:opacity-50"
              >
                <span>
                  {mode === 'login' && 'Sign In'}
                  {mode === 'signup' && 'Create Secret Identity'}
                  {mode === 'reset' && 'Send Reset Email'}
                </span>
                <ArrowRight size={15} />
              </button>
            </form>

            {/* Footer switcher */}
            <div className="mt-5 text-center text-xs text-slate-500 dark:text-slate-400">
              {mode === 'login' && (
                <p>
                  Don't have an identity yet?{' '}
                  <button
                    onClick={() => setMode('signup')}
                    className="font-semibold text-violet-500 hover:text-violet-400 hover:underline"
                  >
                    Register free
                  </button>
                </p>
              )}
              {mode === 'signup' && (
                <p>
                  Already have an account?{' '}
                  <button
                    onClick={() => setMode('login')}
                    className="font-semibold text-violet-500 hover:text-violet-400 hover:underline"
                  >
                    Sign in
                  </button>
                </p>
              )}
              {mode === 'reset' && (
                <p>
                  Remembered your password?{' '}
                  <button
                    onClick={() => setMode('login')}
                    className="font-semibold text-violet-500 hover:text-violet-400 hover:underline"
                  >
                    Back to sign in
                  </button>
                </p>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};
