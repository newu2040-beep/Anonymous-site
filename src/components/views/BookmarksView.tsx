import React, { useState, useEffect } from 'react';
import { Bookmark, Sparkles, ArrowLeft } from 'lucide-react';
import { Confession } from '../../types';
import { fetchUserBookmarks } from '../../services/firestore';
import { useAuth } from '../../context/AuthContext';
import { ConfessionCard } from '../confessions/ConfessionCard';

interface BookmarksViewProps {
  onSelectConfession: (confessionId: string) => void;
  onOpenShare: (confession: Confession) => void;
  onOpenReport: (confessionId: string) => void;
  onAuthRequired: () => void;
  onBack: () => void;
}

export const BookmarksView: React.FC<BookmarksViewProps> = ({
  onSelectConfession,
  onOpenShare,
  onOpenReport,
  onAuthRequired,
  onBack,
}) => {
  const { user } = useAuth();
  const [bookmarks, setBookmarks] = useState<Confession[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    fetchUserBookmarks(user.uid)
      .then((items) => setBookmarks(items))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Bookmark size={20} className="text-amber-500 fill-amber-500/20" />
              <span>Saved Whispers</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Your private collection of meaningful confessions and stories.
            </p>
          </div>
        </div>
      </div>

      {!user ? (
        <div className="p-10 rounded-3xl liquid-glass text-center">
          <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
            Sign in to access your saved confessions vault
          </p>
          <button
            onClick={onAuthRequired}
            className="mt-4 px-4 py-2 rounded-xl bg-violet-600 text-white text-xs font-semibold"
          >
            Sign In
          </button>
        </div>
      ) : loading ? (
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div
              key={i}
              className="h-44 rounded-3xl liquid-glass-subtle animate-pulse border border-white/5"
            />
          ))}
        </div>
      ) : bookmarks.length === 0 ? (
        <div className="text-center py-16 px-4 rounded-3xl liquid-glass border border-white/10">
          <div className="w-12 h-12 rounded-2xl mx-auto mb-3 flex items-center justify-center bg-amber-500/10 text-amber-500 border border-amber-500/20">
            <Bookmark size={22} />
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            No saved confessions yet
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xs mx-auto">
            Click the bookmark icon on any confession in the feed to save it here for later.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {bookmarks.map((confession) => (
            <ConfessionCard
              key={confession.id}
              confession={confession}
              onSelect={onSelectConfession}
              onOpenShare={onOpenShare}
              onOpenReport={onOpenReport}
              onAuthRequired={onAuthRequired}
            />
          ))}
        </div>
      )}
    </div>
  );
};
