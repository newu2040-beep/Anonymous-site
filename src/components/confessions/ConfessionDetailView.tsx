import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Heart,
  Bookmark,
  Share2,
  MoreHorizontal,
  Eye,
  AlertTriangle,
  Clock,
  Sparkles,
  Flag,
  Trash2,
  Edit3,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Confession } from '../../types';
import { CATEGORIES } from '../../lib/constants';
import { formatRelativeTime } from '../../lib/utils';
import { AvatarBadge } from '../common/AvatarBadge';
import { useAuth } from '../../context/AuthContext';
import {
  fetchConfessionById,
  incrementConfessionView,
  toggleConfessionLike,
  checkConfessionLiked,
  toggleBookmark,
  checkBookmarked,
  deleteConfession,
} from '../../services/firestore';
import { CommentList } from '../comments/CommentList';

interface ConfessionDetailViewProps {
  confessionId: string;
  onBack: () => void;
  onOpenShare: (confession: Confession) => void;
  onOpenReport: (confessionId: string) => void;
  onAuthRequired: () => void;
  onDeleted?: (confessionId: string) => void;
  onEdit?: (confession: Confession) => void;
}

export const ConfessionDetailView: React.FC<ConfessionDetailViewProps> = ({
  confessionId,
  onBack,
  onOpenShare,
  onOpenReport,
  onAuthRequired,
  onDeleted,
  onEdit,
}) => {
  const { user, profile } = useAuth();
  const [confession, setConfession] = useState<Confession | null>(null);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [bookmarked, setBookmarked] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [revealed, setRevealed] = useState(true);

  const loadConfession = async () => {
    try {
      const item = await fetchConfessionById(confessionId);
      if (item) {
        setConfession(item);
        setLikesCount(item.likesCount);
        setRevealed(!item.hasContentWarning);
        incrementConfessionView(confessionId).catch(console.warn);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadConfession();
  }, [confessionId]);

  useEffect(() => {
    if (user && confession) {
      checkConfessionLiked(confession.id, user.uid).then(setLiked).catch(console.error);
      checkBookmarked(confession.id, user.uid).then(setBookmarked).catch(console.error);
    }
  }, [user, confession]);

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto p-4 sm:p-6 space-y-6">
        <div className="h-8 w-24 rounded-xl liquid-glass-subtle animate-pulse" />
        <div className="h-64 rounded-3xl liquid-glass-subtle animate-pulse" />
        <div className="h-40 rounded-3xl liquid-glass-subtle animate-pulse" />
      </div>
    );
  }

  if (!confession) {
    return (
      <div className="max-w-2xl mx-auto p-8 text-center">
        <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
          This secret or story has vanished or was deleted by its author.
        </p>
        <button
          onClick={onBack}
          className="mt-4 px-4 py-2 rounded-xl bg-violet-600 text-white text-xs font-semibold"
        >
          Return to Feed
        </button>
      </div>
    );
  }

  const categoryMeta =
    CATEGORIES.find((c) => c.id === confession.category) || CATEGORIES[1];
  const isAuthor = user?.uid === confession.authorId;

  const handleLike = async (e: React.MouseEvent) => {
    if (!user) {
      onAuthRequired();
      return;
    }
    const nextState = !liked;
    setLiked(nextState);
    setLikesCount((prev) => (nextState ? prev + 1 : Math.max(0, prev - 1)));

    if (nextState) {
      const rect = e.currentTarget.getBoundingClientRect();
      confetti({
        particleCount: 30,
        spread: 60,
        origin: {
          x: (rect.left + rect.width / 2) / window.innerWidth,
          y: (rect.top + rect.height / 2) / window.innerHeight,
        },
        colors: ['#a855f7', '#ec4899', '#3b82f6'],
      });
    }

    try {
      await toggleConfessionLike(
        confession.id,
        user.uid,
        confession.authorId,
        profile?.alias,
        confession.content
      );
    } catch (err) {
      setLiked(!nextState);
      setLikesCount((prev) => (!nextState ? prev + 1 : Math.max(0, prev - 1)));
    }
  };

  const handleBookmark = async () => {
    if (!user) {
      onAuthRequired();
      return;
    }
    const nextState = !bookmarked;
    setBookmarked(nextState);
    try {
      await toggleBookmark(confession.id, user.uid);
    } catch (err) {
      setBookmarked(!nextState);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Permanently delete this confession?')) return;
    try {
      await deleteConfession(confession.id);
      onDeleted?.(confession.id);
      onBack();
    } catch (err) {
      console.error(err);
      alert('Failed to delete confession.');
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-4 sm:p-6 space-y-6">
      {/* Top back button */}
      <button
        onClick={onBack}
        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white liquid-glass-subtle hover:bg-white/10 border border-slate-200 dark:border-white/10 transition-colors"
      >
        <ArrowLeft size={15} />
        <span>Back to Feed</span>
      </button>

      {/* Main Confession Card */}
      <article className="rounded-3xl liquid-glass p-6 sm:p-8 border border-white/30 dark:border-white/10 shadow-2xl relative overflow-hidden">
        {/* Glow corner */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-violet-600/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between gap-3 mb-5">
          <div className="flex items-center gap-3">
            <AvatarBadge
              avatarColor={confession.authorAvatar}
              size="lg"
              showGlow
            />
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  {confession.authorAlias}
                </h2>
                {isAuthor && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-violet-500/20 text-violet-400 font-bold border border-violet-500/30">
                    You
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <span className="flex items-center gap-1">
                  <Clock size={12} />
                  {formatRelativeTime(confession.createdAt)}
                </span>
                <span>•</span>
                <span>{confession.viewsCount} views</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`text-xs px-3 py-1.5 rounded-xl font-medium border ${categoryMeta.gradient} ${categoryMeta.color}`}
            >
              {categoryMeta.label}
            </span>

            {/* Menu */}
            <div className="relative">
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10"
              >
                <MoreHorizontal size={18} />
              </button>

              {menuOpen && (
                <div className="absolute right-0 mt-2 w-48 rounded-2xl liquid-glass border border-white/20 shadow-xl z-20 p-1.5 text-xs">
                  {isAuthor ? (
                    <>
                      {onEdit && (
                        <button
                          onClick={() => {
                            setMenuOpen(false);
                            onEdit(confession);
                          }}
                          className="w-full text-left px-3 py-2 rounded-xl text-slate-200 hover:bg-white/10 flex items-center gap-2"
                        >
                          <Edit3 size={14} className="text-violet-400" />
                          <span>Edit Confession</span>
                        </button>
                      )}
                      <button
                        onClick={() => {
                          setMenuOpen(false);
                          handleDelete();
                        }}
                        className="w-full text-left px-3 py-2 rounded-xl text-rose-400 hover:bg-rose-500/10 flex items-center gap-2"
                      >
                        <Trash2 size={14} />
                        <span>Delete Confession</span>
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => {
                        setMenuOpen(false);
                        onOpenReport(confession.id);
                      }}
                      className="w-full text-left px-3 py-2 rounded-xl text-slate-200 hover:bg-white/10 flex items-center gap-2"
                    >
                      <Flag size={14} className="text-amber-400" />
                      <span>Report Confession</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Title */}
        {confession.title && (
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white mb-4 leading-tight">
            {confession.title}
          </h1>
        )}

        {/* Content Warning Blur */}
        {confession.hasContentWarning && !revealed ? (
          <div className="my-5 p-5 rounded-2xl bg-amber-500/10 dark:bg-amber-950/30 border border-amber-500/30 text-center space-y-3">
            <AlertTriangle size={24} className="text-amber-500 mx-auto" />
            <h4 className="text-sm font-semibold text-amber-200">
              Content Warning: {confession.warningReason || 'Sensitive topic'}
            </h4>
            <p className="text-xs text-amber-400/80 max-w-sm mx-auto">
              This confession touches on sensitive matters. Click below when you are ready to view.
            </p>
            <button
              onClick={() => setRevealed(true)}
              className="px-4 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 text-xs font-semibold"
            >
              Reveal Confession
            </button>
          </div>
        ) : (
          <div className="text-base sm:text-lg text-slate-800 dark:text-slate-100 leading-relaxed font-light whitespace-pre-line space-y-4">
            {confession.content}
          </div>
        )}

        {/* Tags */}
        {confession.tags && confession.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-6">
            {confession.tags.map((t) => (
              <span
                key={t}
                className="text-xs px-2.5 py-1 rounded-lg bg-violet-500/10 text-violet-400 border border-violet-500/20 font-medium"
              >
                #{t}
              </span>
            ))}
          </div>
        )}

        {/* Reaction Bar */}
        <div className="mt-8 pt-5 border-t border-slate-200 dark:border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={handleLike}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                liked
                  ? 'text-rose-500 bg-rose-500/10 border border-rose-500/30 shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:text-rose-500 hover:bg-rose-500/5'
              }`}
            >
              <Heart size={16} className={liked ? 'fill-rose-500 text-rose-500' : ''} />
              <span>{likesCount} {likesCount === 1 ? 'Like' : 'Likes'}</span>
            </button>

            <button
              onClick={handleBookmark}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                bookmarked
                  ? 'text-amber-500 bg-amber-500/10 border border-amber-500/30 shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:text-amber-500 hover:bg-amber-500/5'
              }`}
            >
              <Bookmark size={16} className={bookmarked ? 'fill-amber-500 text-amber-500' : ''} />
              <span>{bookmarked ? 'Saved' : 'Save'}</span>
            </button>
          </div>

          <button
            onClick={() => onOpenShare(confession)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-500 dark:text-slate-300 hover:text-cyan-400 hover:bg-cyan-500/10 transition-colors"
          >
            <Share2 size={16} />
            <span>Share</span>
          </button>
        </div>
      </article>

      {/* Threaded Comments Section */}
      <CommentList
        confessionId={confession.id}
        confessionAuthorId={confession.authorId}
        onAuthRequired={onAuthRequired}
        onCommentsUpdated={loadConfession}
      />
    </div>
  );
};
