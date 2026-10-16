import React from 'react';
import {
  Flame,
  Compass,
  Bookmark,
  User,
  ShieldCheck,
  Plus,
  Lock,
  Heart,
  Moon,
  Clock,
  Briefcase,
  Zap,
  Smile,
  ShieldAlert,
} from 'lucide-react';
import { AppView, CategoryId } from '../../types';
import { CATEGORIES } from '../../lib/constants';
import { useAuth } from '../../context/AuthContext';
import { AvatarBadge } from './AvatarBadge';

interface SidebarProps {
  currentView: AppView;
  onSelectView: (view: AppView) => void;
  selectedCategory: CategoryId;
  onSelectCategory: (category: CategoryId) => void;
  onOpenCreate: () => void;
  onOpenSettings: () => void;
  onOpenGuidelines: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onSelectView,
  selectedCategory,
  onSelectCategory,
  onOpenCreate,
  onOpenSettings,
  onOpenGuidelines,
}) => {
  const { user, profile } = useAuth();

  const navLinks = [
    { view: 'feed' as AppView, label: 'Community Feed', icon: <Flame size={17} /> },
    { view: 'explore' as AppView, label: 'Explore & Search', icon: <Compass size={17} /> },
    { view: 'bookmarks' as AppView, label: 'Saved Whispers', icon: <Bookmark size={17} /> },
    { view: 'my-confessions' as AppView, label: 'My Whispers & Vault', icon: <User size={17} /> },
  ];

  return (
    <aside className="hidden lg:flex flex-col w-64 xl:w-72 sticky top-20 h-[calc(100vh-5.5rem)] pb-4 space-y-6 overflow-y-auto scrollbar-none">
      {/* Primary New Confession CTA */}
      <button
        onClick={onOpenCreate}
        className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-semibold text-sm shadow-xl shadow-violet-600/25 transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] border border-white/20"
      >
        <Plus size={18} />
        <span>Whisper a Confession</span>
      </button>

      {/* Main Navigation Links */}
      <nav className="p-2 rounded-3xl liquid-glass border border-white/20 dark:border-white/10 shadow-sm space-y-1">
        {navLinks.map((link) => (
          <button
            key={link.view}
            onClick={() => onSelectView(link.view)}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-semibold transition-all ${
              currentView === link.view
                ? 'bg-violet-600 text-white shadow-md shadow-violet-600/20'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-white/10'
            }`}
          >
            <span
              className={
                currentView === link.view
                  ? 'text-white'
                  : 'text-violet-500 dark:text-violet-400'
              }
            >
              {link.icon}
            </span>
            <span>{link.label}</span>
          </button>
        ))}
      </nav>

      {/* Atmosphere Categories Shortcut */}
      <div className="p-3.5 rounded-3xl liquid-glass border border-white/20 dark:border-white/10 shadow-sm space-y-2">
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 px-2 block">
          Atmospheres
        </span>
        <div className="space-y-1">
          {CATEGORIES.slice(0, 8).map((cat) => (
            <button
              key={cat.id}
              onClick={() => {
                onSelectView('feed');
                onSelectCategory(cat.id);
              }}
              className={`w-full flex items-center justify-between px-3 py-1.5 rounded-xl text-xs font-medium transition-colors ${
                currentView === 'feed' && selectedCategory === cat.id
                  ? 'bg-violet-500/15 text-violet-300 font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/5'
              }`}
            >
              <div className="flex items-center gap-2 truncate">
                <span className={cat.color}>•</span>
                <span className="truncate">{cat.label}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Guidelines link */}
      <button
        onClick={onOpenGuidelines}
        className="w-full flex items-center gap-2.5 px-4 py-2.5 rounded-2xl liquid-glass-subtle border border-white/10 hover:border-violet-500/40 text-xs font-medium text-slate-400 hover:text-white transition-colors"
      >
        <ShieldCheck size={16} className="text-teal-400" />
        <span>Community Charter & Crisis Help</span>
      </button>

      {/* Identity Card at bottom */}
      <div className="mt-auto p-3.5 rounded-3xl liquid-glass border border-white/20 dark:border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-2.5 min-w-0">
          <AvatarBadge
            avatarColor={profile?.avatarColor}
            avatarIcon={profile?.avatarIcon}
            size="sm"
          />
          <div className="min-w-0">
            <span className="text-xs font-bold text-slate-900 dark:text-white block truncate">
              {profile?.alias || 'Anonymous Spirit'}
            </span>
            <span className="text-[10px] text-slate-400 block truncate">
              {user ? (user.isAnonymous ? 'Guest Identity' : 'Protected Account') : 'Guest Browsing'}
            </span>
          </div>
        </div>
        <button
          onClick={onOpenSettings}
          className="text-xs text-violet-500 dark:text-violet-400 hover:underline font-semibold shrink-0"
        >
          Privacy
        </button>
      </div>
    </aside>
  );
};
