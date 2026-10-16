import React from 'react';
import {
  Sparkles,
  Plus,
  Search,
  User as UserIcon,
  Shield,
  LogIn,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { AvatarBadge } from './AvatarBadge';
import { ThemeToggle } from './ThemeToggle';
import { NotificationPopover } from '../notifications/NotificationPopover';

interface HeaderProps {
  onOpenCreate: () => void;
  onOpenAuth: () => void;
  onOpenSettings: () => void;
  onSelectConfession: (confessionId: string) => void;
  onNavigateHome: () => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenCreate,
  onOpenAuth,
  onOpenSettings,
  onSelectConfession,
  onNavigateHome,
  searchQuery,
  setSearchQuery,
}) => {
  const { user, profile } = useAuth();

  return (
    <header className="sticky top-0 z-40 w-full liquid-glass border-b border-white/20 dark:border-white/10 px-4 sm:px-6 py-3 transition-colors">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Brand / Logo */}
        <div
          onClick={onNavigateHome}
          className="flex items-center gap-2.5 cursor-pointer group select-none"
        >
          <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-violet-600 via-purple-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-violet-500/25 group-hover:scale-105 transition-transform duration-200 border border-white/20">
            <Sparkles size={18} />
          </div>
          <div>
            <span className="text-base sm:text-lg font-black tracking-tight bg-gradient-to-r from-slate-900 via-violet-900 to-indigo-900 dark:from-white dark:via-violet-200 dark:to-cyan-200 bg-clip-text text-transparent">
              ANONYMOUSSITE
            </span>
            <span className="hidden sm:block text-[9px] font-semibold uppercase tracking-widest text-violet-500/80 -mt-0.5">
              Liquid Anonymous Social
            </span>
          </div>
        </div>

        {/* Global Search Bar (Tablet/Desktop) */}
        <div className="hidden md:flex flex-1 max-w-md mx-4">
          <div className="relative w-full">
            <Search
              size={15}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search secrets, tags, regrets..."
              className="w-full pl-9 pr-4 py-2 text-xs rounded-2xl bg-white/50 dark:bg-slate-900/40 border border-slate-200 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-violet-500 text-slate-900 dark:text-white placeholder:text-slate-400 shadow-inner"
            />
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* New Confession Button */}
          <button
            onClick={onOpenCreate}
            className="hidden sm:flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-xs font-semibold shadow-md shadow-violet-600/25 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
          >
            <Plus size={15} />
            <span>Whisper</span>
          </button>

          {/* Theme Toggle */}
          <ThemeToggle />

          {/* Notifications Popover */}
          <NotificationPopover onSelectConfession={onSelectConfession} />

          {/* User Persona / Sign In Button */}
          {user ? (
            <button
              onClick={onOpenSettings}
              className="flex items-center gap-2 p-1 sm:px-2.5 sm:py-1 rounded-2xl liquid-glass-subtle hover:bg-white/10 border border-slate-200 dark:border-white/10 transition-colors"
            >
              <AvatarBadge
                avatarColor={profile?.avatarColor}
                avatarIcon={profile?.avatarIcon}
                size="sm"
              />
              <span className="hidden lg:inline text-xs font-semibold text-slate-800 dark:text-slate-200 max-w-[110px] truncate">
                {profile?.alias || 'Anonymous'}
              </span>
            </button>
          ) : (
            <button
              onClick={onOpenAuth}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-semibold hover:opacity-90 transition-opacity shadow-sm"
            >
              <LogIn size={14} />
              <span>Sign In</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
