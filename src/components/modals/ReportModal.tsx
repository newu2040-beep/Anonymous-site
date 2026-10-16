import React, { useState } from 'react';
import { X, ShieldAlert, CheckCircle2, AlertTriangle } from 'lucide-react';
import { REPORT_REASONS } from '../../lib/constants';
import { createReport } from '../../services/firestore';
import { useAuth } from '../../context/AuthContext';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetType: 'confession' | 'comment';
  targetId: string;
}

export const ReportModal: React.FC<ReportModalProps> = ({
  isOpen,
  onClose,
  targetType,
  targetId,
}) => {
  const { user } = useAuth();
  const [selectedReason, setSelectedReason] = useState(REPORT_REASONS[0]);
  const [details, setDetails] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);
    try {
      await createReport({
        reporterId: user.uid,
        targetType,
        targetId,
        reason: selectedReason,
        details: details.trim() || undefined,
      });
      setSubmitted(true);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md rounded-3xl liquid-glass border border-white/20 dark:border-white/10 shadow-2xl p-6 sm:p-8">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-100 hover:bg-white/10 transition-colors"
        >
          <X size={18} />
        </button>

        {submitted ? (
          <div className="text-center py-6">
            <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto mb-3">
              <CheckCircle2 size={26} />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Report Submitted
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
              Thank you for keeping our community safe. Our automated filters and moderation log
              have recorded this incident.
            </p>
            <button
              onClick={onClose}
              className="mt-6 px-5 py-2 rounded-xl bg-violet-600 text-white text-xs font-semibold hover:bg-violet-500 transition-colors"
            >
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="flex items-center gap-2.5 mb-2">
              <div className="p-2 rounded-xl bg-rose-500/10 text-rose-500">
                <ShieldAlert size={20} />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Report {targetType === 'confession' ? 'Confession' : 'Comment'}
              </h3>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-5">
              Select the guideline violation that applies. Reports are handled anonymously.
            </p>

            <div className="space-y-2 mb-4">
              {REPORT_REASONS.map((reason) => (
                <label
                  key={reason}
                  className={`flex items-start gap-2.5 p-3 rounded-xl border text-xs cursor-pointer transition-colors ${
                    selectedReason === reason
                      ? 'border-violet-500 bg-violet-500/10 text-violet-200'
                      : 'border-slate-200 dark:border-white/5 hover:border-white/10 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="reason"
                    checked={selectedReason === reason}
                    onChange={() => setSelectedReason(reason)}
                    className="mt-0.5 accent-violet-600"
                  />
                  <span>{reason}</span>
                </label>
              ))}
            </div>

            <div className="mb-5">
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Additional context (optional)
              </label>
              <textarea
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                maxLength={400}
                rows={3}
                placeholder="Provide any details that will help clarify this issue..."
                className="w-full p-2.5 text-xs rounded-xl bg-white/70 dark:bg-slate-900/60 border border-slate-200 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-violet-500 text-slate-900 dark:text-white placeholder:text-slate-400 resize-none"
              />
            </div>

            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold shadow-lg shadow-rose-600/20 transition-all disabled:opacity-50"
              >
                {loading ? 'Submitting...' : 'Submit Report'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
