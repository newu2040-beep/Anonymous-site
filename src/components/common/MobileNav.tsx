import React from 'react';
import { Flame, Compass, Plus, Bookmark, User, Shield } from 'lucide-react';
import { AppView } from '../../types';
import { useAuth } from '../../context/AuthContext';

interface MobileNavProps {
  currentView: AppView;
  onSelectView: (view: AppView) => void;
  onOpenCreate: () => void;
  onOpenSettings: () => void;
  onOpenAuth: () => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({
  currentView,
  onSelectView,
  onOpenCreate,
  onOpenSettings,
  onOpenAuth,
}) => {
  const { user } = useAuth();

  return (
    <div className="lg:hidden fixed bottom-3 left-4 right-4 z-40 max-w-md mx-auto">
      <div className="liquid-glass rounded-3xl border border-white/25 dark:border-white/10 shadow-2xl p-2 flex items-center justify-around backdrop-blur-xl">
        {/* Feed */}
        <button
          onClick={() => onSelectView('feed')}
          className={`flex flex-col items-center gap-1 p-2 rounded-2xl transition-colors ${
            currentView === 'feed'
              ? 'text-violet-500 dark:text-violet-400 font-bold'
              : 'text-slate-500 dark:text-slate-400'
          }`}
        >
          <Flame size={19} />
          <span className="text-[10px]">Feed</span>
        </button>

        {/* Explore */}
        <button
          onClick={() => onSelectView('explore')}
          className={`flex flex-col items-center gap-1 p-2 rounded-2xl transition-colors ${
            currentView === 'explore'
              ? 'text-violet-500 dark:text-violet-400 font-bold'
              : 'text-slate-500 dark:text-slate-400'
          }`}
        >
          <Compass size={19} />
          <span className="text-[10px]">Explore</span>
        </button>

        {/* Center Floating Create Action */}
        <button
          onClick={onOpenCreate}
          className="flex items-center justify-center w-12 h-12 -mt-5 rounded-2xl bg-gradient-to-tr from-violet-600 to-indigo-600 text-white shadow-lg shadow-violet-600/30 border-2 border-white dark:border-slate-900 active:scale-95 transition-transform"
        >
          <Plus size={24} />
        </button>

        {/* Bookmarks */}
        <button
          onClick={() => onSelectView('bookmarks')}
          className={`flex flex-col items-center gap-1 p-2 rounded-2xl transition-colors ${
            currentView === 'bookmarks'
              ? 'text-violet-500 dark:text-violet-400 font-bold'
              : 'text-slate-500 dark:text-slate-400'
          }`}
        >
          <Bookmark size={19} />
          <span className="text-[10px]">Saved</span>
        </button>

        {/* Profile / Settings */}
        <button
          onClick={user ? onOpenSettings : onOpenAuth}
          className={`flex flex-col items-center gap-1 p-2 rounded-2xl transition-colors ${
            currentView === 'my-confessions'
              ? 'text-violet-500 dark:text-violet-400 font-bold'
              : 'text-slate-500 dark:text-slate-400'
          }`}
        >
          <User size={19} />
          <span className="text-[10px]">{user ? 'Identity' : 'Login'}</span>
        </button>
      </div>
    </div>
  );
};
