import React from 'react';
import { X, ShieldCheck, HeartHandshake, EyeOff, Ban, LifeBuoy, AlertCircle } from 'lucide-react';

interface GuidelinesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GuidelinesModal: React.FC<GuidelinesModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-3xl liquid-glass border border-white/20 dark:border-white/10 shadow-2xl p-6 sm:p-8 max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-100 hover:bg-white/10 transition-colors"
        >
          <X size={18} />
        </button>

        <div className="flex items-center gap-2.5 mb-2">
          <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-violet-600 to-indigo-600 text-white shadow-md shadow-violet-500/20">
            <ShieldCheck size={22} />
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">
              Community Charter & Safety
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Safe, authentic sharing with zero tolerance for harm.
            </p>
          </div>
        </div>

        <div className="mt-6 space-y-4 text-xs text-slate-600 dark:text-slate-300">
          <div className="p-3.5 rounded-2xl bg-white/50 dark:bg-slate-900/40 border border-slate-200 dark:border-white/5 flex gap-3">
            <div className="p-2 rounded-xl bg-rose-500/10 text-rose-500 shrink-0 self-start">
              <Ban size={16} />
            </div>
            <div>
              <h4 className="font-semibold text-slate-900 dark:text-white text-sm mb-0.5">
                1. Absolute Zero-Doxxing Policy
              </h4>
              <p className="leading-relaxed">
                Never post full legal names, phone numbers, home addresses, social handles, or specific identifiable details of yourself or third parties. Anonymity protects you only if you maintain discretion.
              </p>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-white/50 dark:bg-slate-900/40 border border-slate-200 dark:border-white/5 flex gap-3">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500 shrink-0 self-start">
              <EyeOff size={16} />
            </div>
            <div>
              <h4 className="font-semibold text-slate-900 dark:text-white text-sm mb-0.5">
                2. Content Warnings for Sensitive Topics
              </h4>
              <p className="leading-relaxed">
                If your confession touches on trauma, grief, substance struggles, or adult themes, enable the "Content Warning" toggle so other community members can browse with consent.
              </p>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-white/50 dark:bg-slate-900/40 border border-slate-200 dark:border-white/5 flex gap-3">
            <div className="p-2 rounded-xl bg-teal-500/10 text-teal-500 shrink-0 self-start">
              <HeartHandshake size={16} />
            </div>
            <div>
              <h4 className="font-semibold text-slate-900 dark:text-white text-sm mb-0.5">
                3. Empathy in the Shadows
              </h4>
              <p className="leading-relaxed">
                People come here to unburden hearts, admit guilt, and speak unspoken truths. Respond with constructive honesty or compassionate silence—never harassment or malice.
              </p>
            </div>
          </div>

          {/* Crisis Helplines */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-950/40 to-violet-950/40 border border-indigo-500/30">
            <div className="flex items-center gap-2 text-indigo-300 font-semibold mb-2">
              <LifeBuoy size={16} />
              <span>In Emotional Pain or Need Help?</span>
            </div>
            <p className="text-[11px] text-slate-300 mb-3 leading-relaxed">
              If you or someone you know is going through a difficult crisis or having thoughts of self-harm, please reach out to free, confidential help available 24/7:
            </p>
            <ul className="space-y-1.5 text-[11px] font-medium text-indigo-200">
              <li className="flex items-center justify-between p-2 rounded-lg bg-white/5 border border-white/5">
                <span>US & Canada Suicide & Crisis Lifeline</span>
                <span className="font-bold text-white px-2 py-0.5 rounded bg-indigo-600/60">Call or Text 988</span>
              </li>
              <li className="flex items-center justify-between p-2 rounded-lg bg-white/5 border border-white/5">
                <span>Crisis Text Line</span>
                <span className="font-bold text-white px-2 py-0.5 rounded bg-indigo-600/60">Text HOME to 741741</span>
              </li>
              <li className="flex items-center justify-between p-2 rounded-lg bg-white/5 border border-white/5">
                <span>International Crisis Support</span>
                <a
                  href="https://findahelpline.com"
                  target="_blank"
                  rel="noreferrer"
                  className="font-bold text-cyan-300 underline"
                >
                  findahelpline.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold shadow-md transition-colors"
          >
            I Understand & Agree
          </button>
        </div>
      </div>
    </div>
  );
};
