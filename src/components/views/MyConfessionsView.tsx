import React, { useState, useEffect } from 'react';
import {
  FileText,
  Heart,
  MessageSquare,
  Sparkles,
  ArrowLeft,
  FolderOpen,
  Trash2,
} from 'lucide-react';
import { Confession, Draft } from '../../types';
import {
  fetchConfessions,
  fetchUserDrafts,
  deleteDraft,
} from '../../services/firestore';
import { useAuth } from '../../context/AuthContext';
import { ConfessionCard } from '../confessions/ConfessionCard';
import { AvatarBadge } from '../common/AvatarBadge';

interface MyConfessionsViewProps {
  onSelectConfession: (confessionId: string) => void;
  onOpenShare: (confession: Confession) => void;
  onOpenReport: (confessionId: string) => void;
  onAuthRequired: () => void;
  onBack: () => void;
  onOpenCreateWithDraft?: (draft: Draft) => void;
}

export const MyConfessionsView: React.FC<MyConfessionsViewProps> = ({
  onSelectConfession,
  onOpenShare,
  onOpenReport,
  onAuthRequired,
  onBack,
  onOpenCreateWithDraft,
}) => {
  const { user, profile } = useAuth();
  const [activeTab, setActiveTab] = useState<'published' | 'drafts'>('published');
  const [confessions, setConfessions] = useState<Confession[]>([]);
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    try {
      const [myConfs, myDrafts] = await Promise.all([
        fetchConfessions({ authorId: user.uid }),
        fetchUserDrafts(user.uid),
      ]);
      setConfessions(myConfs);
      setDrafts(myDrafts);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  // Aggregate stats
  const totalLikes = confessions.reduce((acc, c) => acc + c.likesCount, 0);
  const totalComments = confessions.reduce((acc, c) => acc + c.commentsCount, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10"
        >
          <ArrowLeft size={18} />
        </button>
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            My Activity & Vault
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Manage your whispered confessions, drafts, and impact.
          </p>
        </div>
      </div>

      {!user ? (
        <div className="p-10 rounded-3xl liquid-glass text-center">
          <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
            Sign in to inspect your personal confessions history
          </p>
          <button
            onClick={onAuthRequired}
            className="mt-4 px-4 py-2 rounded-xl bg-violet-600 text-white text-xs font-semibold"
          >
            Sign In
          </button>
        </div>
      ) : (
        <>
          {/* Identity & Stats Card */}
          <div className="p-5 sm:p-6 rounded-3xl liquid-glass border border-white/20 dark:border-white/10 shadow-lg">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <AvatarBadge
                  avatarColor={profile?.avatarColor}
                  avatarIcon={profile?.avatarIcon}
                  size="lg"
                  showGlow
                />
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                      {profile?.alias}
                    </h3>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-violet-500/20 text-violet-300 border border-violet-500/30">
                      Identity Owner
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Total anonymity preserved across all interactions
                  </p>
                </div>
              </div>

              {/* Stats badges */}
              <div className="flex items-center gap-3">
                <div className="px-3.5 py-2 rounded-2xl bg-white/40 dark:bg-slate-900/40 border border-slate-200 dark:border-white/5 text-center min-w-[70px]">
                  <span className="text-xs text-slate-400 block">Whispers</span>
                  <span className="text-base font-bold text-slate-900 dark:text-white">
                    {confessions.length}
                  </span>
                </div>
                <div className="px-3.5 py-2 rounded-2xl bg-white/40 dark:bg-slate-900/40 border border-slate-200 dark:border-white/5 text-center min-w-[70px]">
                  <span className="text-xs text-rose-400 block">Likes</span>
                  <span className="text-base font-bold text-slate-900 dark:text-white">
                    {totalLikes}
                  </span>
                </div>
                <div className="px-3.5 py-2 rounded-2xl bg-white/40 dark:bg-slate-900/40 border border-slate-200 dark:border-white/5 text-center min-w-[70px]">
                  <span className="text-xs text-violet-400 block">Replies</span>
                  <span className="text-base font-bold text-slate-900 dark:text-white">
                    {totalComments}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex items-center gap-2 p-1.5 rounded-2xl liquid-glass-subtle border border-white/10 w-fit">
            <button
              onClick={() => setActiveTab('published')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'published'
                  ? 'bg-violet-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Published Whispers ({confessions.length})
            </button>
            <button
              onClick={() => setActiveTab('drafts')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'drafts'
                  ? 'bg-violet-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Saved Drafts ({drafts.length})
            </button>
          </div>

          {/* Tab content */}
          {loading ? (
            <div className="space-y-4">
              {[1, 2].map((i) => (
                <div
                  key={i}
                  className="h-40 rounded-3xl liquid-glass-subtle animate-pulse border border-white/5"
                />
              ))}
            </div>
          ) : activeTab === 'published' ? (
            confessions.length === 0 ? (
              <div className="text-center py-16 px-4 rounded-3xl liquid-glass border border-white/10">
                <p className="text-sm font-semibold text-slate-300">
                  You haven't whispered any confessions yet.
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  Share your first secret anonymously with the community.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {confessions.map((c) => (
                  <ConfessionCard
                    key={c.id}
                    confession={c}
                    onSelect={onSelectConfession}
                    onOpenShare={onOpenShare}
                    onOpenReport={onOpenReport}
                    onAuthRequired={onAuthRequired}
                    onDeleted={(id) => {
                      setConfessions(confessions.filter((x) => x.id !== id));
                    }}
                  />
                ))}
              </div>
            )
          ) : drafts.length === 0 ? (
            <div className="text-center py-16 px-4 rounded-3xl liquid-glass border border-white/10">
              <FolderOpen size={28} className="text-slate-500 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-300">No drafts in your vault</p>
              <p className="text-xs text-slate-500 mt-1">
                Save unpublished thoughts when composing confessions.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {drafts.map((d) => (
                <div
                  key={d.id}
                  className="p-4 rounded-2xl liquid-glass border border-white/10 flex items-center justify-between gap-4"
                >
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                      {d.title || 'Untitled Draft'}
                    </h4>
                    <p className="text-xs text-slate-400 line-clamp-2 mt-0.5">
                      {d.content}
                    </p>
                    <span className="text-[10px] text-slate-500 mt-1 inline-block uppercase tracking-wider">
                      Category: {d.category}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {onOpenCreateWithDraft && (
                      <button
                        onClick={() => onOpenCreateWithDraft(d)}
                        className="px-3 py-1.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold"
                      >
                        Resume
                      </button>
                    )}
                    <button
                      onClick={async () => {
                        await deleteDraft(d.id);
                        setDrafts(drafts.filter((x) => x.id !== d.id));
                      }}
                      className="p-2 text-slate-400 hover:text-rose-400 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};
