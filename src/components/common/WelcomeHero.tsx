import React, { useState } from 'react';
import { Sparkles, Shield, Lock, EyeOff, X, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface WelcomeHeroProps {
  onOpenCreate: () => void;
  onOpenAuth: () => void;
}

export const WelcomeHero: React.FC<WelcomeHeroProps> = ({
  onOpenCreate,
  onOpenAuth,
}) => {
  const { user } = useAuth();
  const [dismissed, setDismissed] = useState(() => {
    return localStorage.getItem('welcome_hero_dismissed') === 'true';
  });

  if (dismissed || user) return null;

  const handleDismiss = () => {
    setDismissed(true);
    localStorage.setItem('welcome_hero_dismissed', 'true');
  };

  return (
    <div className="relative rounded-3xl liquid-glass border border-white/20 dark:border-white/10 p-6 sm:p-8 shadow-xl overflow-hidden mb-6">
      {/* Background ambient gradient glow */}
      <div className="absolute -top-20 -right-20 w-64 h-64 bg-violet-600/20 rounded-full blur-3xl pointer-events-none glow-ambient" />
      <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none glow-ambient" />

      {/* Dismiss button */}
      <button
        onClick={handleDismiss}
        className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-slate-100 hover:bg-white/10 transition-colors"
      >
        <X size={16} />
      </button>

      <div className="max-w-2xl">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-500/15 border border-violet-500/30 text-violet-600 dark:text-violet-300 text-xs font-semibold mb-3">
          <Sparkles size={13} />
          <span>The Anonymous Sanctuary</span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-snug">
          Unburden what you carry in silence.
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
          ANONYMOUSSITE is a safe haven where authentic confessions, unspoken regrets, and late-night thoughts are shared freely without exposing your real name, email, or identity.
        </p>

        {/* Feature badges */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-5">
          <div className="p-3 rounded-2xl bg-white/40 dark:bg-slate-900/40 border border-slate-200 dark:border-white/5 flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-violet-500/10 text-violet-500">
              <EyeOff size={16} />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900 dark:text-white">Auto Pseudonyms</h4>
              <p className="text-[10px] text-slate-500 dark:text-slate-400">Generated poetic aliases</p>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-white/40 dark:bg-slate-900/40 border border-slate-200 dark:border-white/5 flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-500">
              <Lock size={16} />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900 dark:text-white">Zero PII Leak</h4>
              <p className="text-[10px] text-slate-500 dark:text-slate-400">Never tied to your email</p>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-white/40 dark:bg-slate-900/40 border border-slate-200 dark:border-white/5 flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-rose-500/10 text-rose-500">
              <Shield size={16} />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900 dark:text-white">Safe & Filtered</h4>
              <p className="text-[10px] text-slate-500 dark:text-slate-400">Sensitive content warnings</p>
            </div>
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-wrap items-center gap-3 mt-6">
          <button
            onClick={onOpenCreate}
            className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-semibold text-xs shadow-lg shadow-violet-600/30 transition-all hover:scale-[1.02]"
          >
            <span>Whisper a Confession</span>
            <ArrowRight size={14} />
          </button>
          <button
            onClick={onOpenAuth}
            className="flex items-center gap-2 px-5 py-2.5 rounded-2xl liquid-glass-subtle hover:bg-white/10 text-slate-800 dark:text-slate-200 font-semibold text-xs border border-slate-200 dark:border-white/10 transition-colors"
          >
            <span>Claim Your Pseudonym</span>
          </button>
        </div>
      </div>
    </div>
  );
};
