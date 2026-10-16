import React, { useState } from 'react';
import {
  X,
  RefreshCw,
  Eye,
  EyeOff,
  UserX,
  Shield,
  LogOut,
  Check,
  Edit2,
  Lock,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { AvatarBadge } from '../common/AvatarBadge';
import { ThemeToggle } from '../common/ThemeToggle';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenGuidelines: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  onOpenGuidelines,
}) => {
  const {
    user,
    profile,
    regenerateAlias,
    updateCustomAlias,
    toggleSensitiveFilter,
    toggleBlockUser,
    logout,
  } = useAuth();

  const [isEditingAlias, setIsEditingAlias] = useState(false);
  const [aliasInput, setAliasInput] = useState('');
  const [isRegenerating, setIsRegenerating] = useState(false);

  if (!isOpen) return null;

  const handleStartEdit = () => {
    setAliasInput(profile?.alias || '');
    setIsEditingAlias(true);
  };

  const handleSaveAlias = async () => {
    if (aliasInput.trim()) {
      await updateCustomAlias(aliasInput);
      setIsEditingAlias(false);
    }
  };

  const handleRegenerate = async () => {
    setIsRegenerating(true);
    await regenerateAlias();
    setIsRegenerating(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-3xl liquid-glass border border-white/20 dark:border-white/10 shadow-2xl p-6 sm:p-8 max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-100 hover:bg-white/10 transition-colors"
        >
          <X size={18} />
        </button>

        {/* Title */}
        <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Shield size={20} className="text-violet-500" />
          <span>Identity & Privacy Controls</span>
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Customize your anonymous persona, manage content filters, and inspect privacy safeguards.
        </p>

        {/* Persona Card */}
        <div className="mt-6 p-4 rounded-2xl liquid-glass-subtle border border-white/10 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <AvatarBadge
              avatarColor={profile?.avatarColor}
              avatarIcon={profile?.avatarIcon}
              size="lg"
              showGlow
            />
            <div>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-violet-400">
                Your Public Persona
              </span>
              {isEditingAlias ? (
                <div className="flex items-center gap-2 mt-1">
                  <input
                    type="text"
                    value={aliasInput}
                    onChange={(e) => setAliasInput(e.target.value)}
                    maxLength={50}
                    className="px-2 py-1 text-sm rounded-lg bg-slate-800 text-white border border-violet-500/50 focus:outline-none"
                  />
                  <button
                    onClick={handleSaveAlias}
                    className="p-1 rounded-lg bg-violet-600 text-white hover:bg-violet-500"
                  >
                    <Check size={14} />
                  </button>
                  <button
                    onClick={() => setIsEditingAlias(false)}
                    className="p-1 rounded-lg text-slate-400 hover:text-white"
                  >
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    {profile?.alias || 'Mystic Traveler #101'}
                  </h3>
                  <button
                    onClick={handleStartEdit}
                    title="Edit custom alias"
                    className="text-slate-400 hover:text-violet-400 transition-colors p-1"
                  >
                    <Edit2 size={13} />
                  </button>
                </div>
              )}
              <p className="text-[11px] text-slate-400">
                {user?.isAnonymous
                  ? 'Active in Guest Mode'
                  : `Secured via ${user?.email || 'Account'}`}
              </p>
            </div>
          </div>

          <button
            onClick={handleRegenerate}
            disabled={isRegenerating}
            title="Roll new random alias and badge"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-violet-600/20 hover:bg-violet-600/30 text-violet-300 border border-violet-500/30 text-xs font-medium transition-all"
          >
            <RefreshCw size={13} className={isRegenerating ? 'animate-spin' : ''} />
            <span className="hidden sm:inline">Reroll</span>
          </button>
        </div>

        {/* Options list */}
        <div className="mt-6 space-y-4">
          {/* Sensitive Content Blur */}
          <div className="p-3.5 rounded-2xl bg-white/50 dark:bg-slate-900/40 border border-slate-200 dark:border-white/5 flex items-center justify-between">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500 mt-0.5">
                {profile?.sensitiveFilter ? <EyeOff size={16} /> : <Eye size={16} />}
              </div>
              <div>
                <h4 className="text-sm font-semibold text-slate-900 dark:text-white">
                  Sensitive Content Shield
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Automatically blur confessions marked with content warnings until clicked.
                </p>
              </div>
            </div>
            <button
              onClick={toggleSensitiveFilter}
              className={`w-11 h-6 rounded-full transition-colors relative p-0.5 ${
                profile?.sensitiveFilter ? 'bg-violet-600' : 'bg-slate-600'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-200 ${
                  profile?.sensitiveFilter ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Theme Preference */}
          <div className="p-3.5 rounded-2xl bg-white/50 dark:bg-slate-900/40 border border-slate-200 dark:border-white/5 flex items-center justify-between">
            <div>
              <h4 className="text-sm font-semibold text-slate-900 dark:text-white">
                Appearance & Theme
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Liquid glass adjusts to your favorite ambience.
              </p>
            </div>
            <ThemeToggle />
          </div>

          {/* Blocked Users Count & Management */}
          <div className="p-3.5 rounded-2xl bg-white/50 dark:bg-slate-900/40 border border-slate-200 dark:border-white/5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-rose-500/10 text-rose-500">
                  <UserX size={16} />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-slate-900 dark:text-white">
                    Blocked Confessors
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {profile?.blockedUserIds?.length || 0} authors currently hidden from your feed.
                  </p>
                </div>
              </div>
              {profile?.blockedUserIds && profile.blockedUserIds.length > 0 && (
                <button
                  onClick={async () => {
                    for (const blockedId of profile.blockedUserIds) {
                      await toggleBlockUser(blockedId);
                    }
                  }}
                  className="text-xs font-semibold text-rose-500 hover:text-rose-400 px-2.5 py-1 rounded-lg hover:bg-rose-500/10 transition-colors"
                >
                  Unblock all
                </button>
              )}
            </div>
          </div>

          {/* Guidelines & Safety Charter Link */}
          <button
            onClick={() => {
              onClose();
              onOpenGuidelines();
            }}
            className="w-full text-left p-3.5 rounded-2xl bg-white/50 dark:bg-slate-900/40 border border-slate-200 dark:border-white/5 hover:border-violet-500/40 transition-colors flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-500">
                <Lock size={16} />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-slate-900 dark:text-white">
                  Community Rules & Crisis Resources
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Read our anti-harassment pledge and crisis helpline links.
                </p>
              </div>
            </div>
            <span className="text-xs text-violet-400 font-medium">Read</span>
          </button>
        </div>

        {/* Footer Actions */}
        <div className="mt-8 pt-4 border-t border-slate-200 dark:border-white/10 flex items-center justify-between">
          <p className="text-[11px] text-slate-400">
            ANONYMOUSSITE v1.0 • End-to-end pseudonymous
          </p>
          {user && (
            <button
              onClick={async () => {
                await logout();
                onClose();
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-rose-500 hover:text-rose-400 hover:bg-rose-500/10 text-xs font-semibold transition-colors"
            >
              <LogOut size={14} />
              <span>Sign Out</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
