import React, { useState, useEffect } from 'react';
import {
  Flame,
  Clock,
  MessageSquare,
  Lock,
  Search,
  SlidersHorizontal,
  Sparkles,
  Filter,
} from 'lucide-react';
import { Confession, CategoryId, FeedSort } from '../../types';
import { CATEGORIES } from '../../lib/constants';
import { fetchConfessions, seedInitialDataIfEmpty } from '../../services/firestore';
import { ConfessionCard } from './ConfessionCard';

interface ConfessionFeedProps {
  onSelectConfession: (confessionId: string) => void;
  onOpenCreate: () => void;
  onOpenShare: (confession: Confession) => void;
  onOpenReport: (confessionId: string) => void;
  onAuthRequired: () => void;
  initialCategory?: CategoryId;
  searchQuery?: string;
  setSearchQuery?: (q: string) => void;
}

export const ConfessionFeed: React.FC<ConfessionFeedProps> = ({
  onSelectConfession,
  onOpenCreate,
  onOpenShare,
  onOpenReport,
  onAuthRequired,
  initialCategory = 'all',
  searchQuery = '',
  setSearchQuery,
}) => {
  const [confessions, setConfessions] = useState<Confession[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState<CategoryId>(initialCategory);
  const [sort, setSort] = useState<FeedSort>('trending');

  const loadFeed = async () => {
    setLoading(true);
    try {
      await seedInitialDataIfEmpty();
      const items = await fetchConfessions({
        category,
        sort,
        searchQuery,
      });
      setConfessions(items);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFeed();
  }, [category, sort, searchQuery]);

  const sortTabs: { id: FeedSort; label: string; icon: React.ReactNode }[] = [
    { id: 'trending', label: 'Trending', icon: <Flame size={14} className="text-amber-500" /> },
    { id: 'latest', label: 'Latest Whispers', icon: <Clock size={14} className="text-cyan-500" /> },
    { id: 'discussed', label: 'Most Discussed', icon: <MessageSquare size={14} className="text-violet-500" /> },
    { id: 'secrets', label: 'Deep Secrets', icon: <Lock size={14} className="text-rose-500" /> },
  ];

  return (
    <div className="space-y-6">
      {/* Search & Sort Controls Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-2 rounded-2xl liquid-glass border border-white/20 dark:border-white/10 shadow-sm">
        {/* Sort Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {sortTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSort(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-200 ${
                sort === tab.id
                  ? 'bg-violet-600 text-white shadow-md shadow-violet-600/20'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-white/10'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Search input if provided */}
        {setSearchQuery && (
          <div className="relative min-w-[200px]">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter by keyword or #tag..."
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl bg-white/50 dark:bg-slate-900/40 border border-slate-200 dark:border-white/10 focus:outline-none focus:ring-1 focus:ring-violet-500 text-slate-900 dark:text-white placeholder:text-slate-400"
            />
          </div>
        )}
      </div>

      {/* Category Pills Slider */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setCategory(cat.id)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-200 border ${
              category === cat.id
                ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-transparent shadow-md'
                : 'bg-white/40 dark:bg-slate-900/40 text-slate-600 dark:text-slate-300 border-slate-200/60 dark:border-white/5 hover:border-slate-300 dark:hover:border-white/15'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Feed List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-48 rounded-3xl liquid-glass-subtle animate-pulse border border-white/5"
            />
          ))}
        </div>
      ) : confessions.length === 0 ? (
        <div className="text-center py-16 px-4 rounded-3xl liquid-glass border border-white/10 shadow-lg">
          <div className="w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center bg-gradient-to-tr from-violet-600 to-indigo-600 text-white shadow-lg shadow-violet-500/25">
            <Sparkles size={24} />
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            No confessions found
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
            {searchQuery
              ? `No secrets matching "${searchQuery}". Try a different keyword.`
              : 'Be the courageous soul to whisper the first confession in this category.'}
          </p>
          <button
            onClick={onOpenCreate}
            className="mt-5 px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-semibold text-xs shadow-lg shadow-violet-600/30 transition-all"
          >
            Whisper a Secret
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {confessions.map((confession) => (
            <ConfessionCard
              key={confession.id}
              confession={confession}
              onSelect={onSelectConfession}
              onOpenShare={onOpenShare}
              onOpenReport={onOpenReport}
              onAuthRequired={onAuthRequired}
              onDeleted={(id) => {
                setConfessions(confessions.filter((c) => c.id !== id));
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
};
