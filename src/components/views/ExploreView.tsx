import React, { useState } from 'react';
import {
  Search,
  Compass,
  Sparkles,
  TrendingUp,
  Hash,
  ArrowRight,
} from 'lucide-react';
import { CategoryId } from '../../types';
import { CATEGORIES } from '../../lib/constants';

interface ExploreViewProps {
  onSelectCategory: (cat: CategoryId) => void;
  onSearch: (query: string) => void;
}

export const ExploreView: React.FC<ExploreViewProps> = ({
  onSelectCategory,
  onSearch,
}) => {
  const [searchInput, setSearchInput] = useState('');

  const trendingTags = [
    'secret',
    'latenight',
    'regret',
    'career',
    'love',
    'friendship',
    'confession',
    'wholesome',
    'guilt',
  ];

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      onSearch(searchInput.trim());
    }
  };

  return (
    <div className="space-y-8">
      {/* Search Hero */}
      <div className="relative p-6 sm:p-10 rounded-3xl liquid-glass border border-white/20 dark:border-white/10 shadow-xl overflow-hidden text-center">
        <div className="absolute top-0 right-1/4 w-72 h-72 bg-violet-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-gradient-to-tr from-violet-600 to-indigo-600 text-white shadow-lg shadow-violet-500/30 mb-4">
          <Compass size={24} />
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
          Explore the Whispers
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1.5 max-w-md mx-auto">
          Discover stories by category, search intimate thoughts, or follow trending anonymous tags.
        </p>

        {/* Large Search Bar */}
        <form onSubmit={handleSearchSubmit} className="mt-6 max-w-lg mx-auto flex gap-2">
          <div className="relative flex-1">
            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search secrets, regrets, topics..."
              className="w-full pl-11 pr-4 py-3 text-sm rounded-2xl bg-white/70 dark:bg-slate-900/70 border border-slate-200 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-violet-500 text-slate-900 dark:text-white placeholder:text-slate-400 shadow-sm"
            />
          </div>
          <button
            type="submit"
            className="px-6 py-3 rounded-2xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold shadow-md shadow-violet-600/20 transition-all flex items-center gap-1.5 shrink-0"
          >
            <span>Search</span>
            <ArrowRight size={14} />
          </button>
        </form>

        {/* Trending Tags */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
          <span className="text-xs text-slate-400 font-medium flex items-center gap-1 mr-1">
            <TrendingUp size={13} className="text-violet-400" />
            Trending:
          </span>
          {trendingTags.map((tag) => (
            <button
              key={tag}
              onClick={() => onSearch(tag)}
              className="text-xs px-2.5 py-1 rounded-xl bg-white/50 dark:bg-slate-800/50 hover:bg-violet-500/10 text-slate-600 dark:text-slate-300 hover:text-violet-300 border border-slate-200 dark:border-white/5 transition-colors flex items-center gap-0.5"
            >
              <Hash size={12} className="text-violet-400" />
              <span>{tag}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Categories Grid */}
      <div>
        <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4">
          Browse by Atmosphere & Theme
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {CATEGORIES.filter((c) => c.id !== 'all').map((cat) => (
            <div
              key={cat.id}
              onClick={() => onSelectCategory(cat.id)}
              className="group p-5 rounded-3xl liquid-glass-interactive border border-white/20 dark:border-white/10 cursor-pointer text-left relative overflow-hidden"
            >
              <div className="flex items-center justify-between mb-3">
                <span className={`text-sm font-bold ${cat.color} flex items-center gap-1.5`}>
                  <span>●</span>
                  <span>{cat.label}</span>
                </span>
                <span className="text-slate-400 group-hover:text-violet-400 group-hover:translate-x-1 transition-all">
                  <ArrowRight size={15} />
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-light">
                {cat.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
