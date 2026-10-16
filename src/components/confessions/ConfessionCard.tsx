import React, { useState, useEffect } from 'react';
import {
  Heart,
  MessageSquare,
  Bookmark,
  Share2,
  MoreHorizontal,
  AlertTriangle,
  Eye,
  Trash2,
  Edit3,
  UserX,
  Flag,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Confession } from '../../types';
import { CATEGORIES } from '../../lib/constants';
import { formatRelativeTime } from '../../lib/utils';
import { AvatarBadge } from '../common/AvatarBadge';
import { useAuth } from '../../context/AuthContext';
import {
  toggleConfessionLike,
  checkConfessionLiked,
  toggleBookmark,
  checkBookmarked,
  deleteConfession,
} from '../../services/firestore';

interface ConfessionCardProps {
  confession: Confession;
  onSelect: (confessionId: string) => void;
  onOpenShare: (confession: Confession) => void;
  onOpenReport: (confessionId: string) => void;
  onAuthRequired: () => void;
  onDeleted?: (confessionId: string) => void;
  onEdit?: (confession: Confession) => void;
}

export const ConfessionCard: React.FC<ConfessionCardProps> = ({
  confession,
  onSelect,
  onOpenShare,
  onOpenReport,
  onAuthRequired,
  onDeleted,
  onEdit,
}) => {
  const { user, profile, toggleBlockUser } = useAuth();

  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(confession.likesCount);
  const [bookmarked, setBookmarked] = useState(false);
  const [revealed, setRevealed] = useState(!confession.hasContentWarning);
  const [menuOpen, setMenuOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const isAuthor = user?.uid === confession.authorId;
  const isBlocked = profile?.blockedUserIds?.includes(confession.authorId);

  const categoryMeta = CATEGORIES.find((c) => c.id === confession.category) || CATEGORIES[1];

  useEffect(() => {
    if (user) {
      checkConfessionLiked(confession.id, user.uid).then(setLiked).catch(console.error);
      checkBookmarked(confession.id, user.uid).then(setBookmarked).catch(console.error);
    }
  }, [user, confession.id]);

  if (isBlocked) {
    return (
      <div className="p-4 rounded-2xl liquid-glass-subtle border border-white/5 text-center text-xs text-slate-500">
        Confession from a blocked author is hidden.{' '}
        <button
          onClick={() => toggleBlockUser(confession.authorId)}
          className="text-violet-400 hover:underline font-medium"
        >
          Unblock
        </button>
      </div>
    );
  }

  const handleLike = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) {
      onAuthRequired();
      return;
    }

    const nextState = !liked;
    setLiked(nextState);
    setLikesCount((prev) => (nextState ? prev + 1 : Math.max(0, prev - 1)));

    if (nextState) {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = (rect.left + rect.width / 2) / window.innerWidth;
      const y = (rect.top + rect.height / 2) / window.innerHeight;
      confetti({
        particleCount: 22,
        spread: 45,
        origin: { x, y },
        colors: ['#a855f7', '#ec4899', '#3b82f6'],
        disableForReducedMotion: true,
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
      console.error(err);
      // Revert optimistic
      setLiked(!nextState);
      setLikesCount((prev) => (!nextState ? prev + 1 : Math.max(0, prev - 1)));
    }
  };

  const handleBookmark = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) {
      onAuthRequired();
      return;
    }
    const nextState = !bookmarked;
    setBookmarked(nextState);
    try {
      await toggleBookmark(confession.id, user.uid);
    } catch (err) {
      console.error(err);
      setBookmarked(!nextState);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you certain you want to permanently erase this confession?')) return;
    setIsDeleting(true);
    try {
      await deleteConfession(confession.id);
      onDeleted?.(confession.id);
    } catch (err) {
      console.error(err);
      alert('Failed to delete confession.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <article
      onClick={() => onSelect(confession.id)}
      className="group relative rounded-3xl liquid-glass-interactive p-5 sm:p-6 cursor-pointer border border-white/40 dark:border-white/10 overflow-hidden"
    >
      {/* Background radial highlight */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-violet-500/5 dark:bg-violet-500/10 rounded-full blur-2xl pointer-events-none group-hover:scale-150 transition-transform duration-500" />

      {/* Card Header: Author info, Category tag, Menu */}
      <div className="flex items-center justify-between gap-3 mb-3.5">
        <div className="flex items-center gap-3">
          <AvatarBadge avatarColor={confession.authorAvatar} size="md" />
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                {confession.authorAlias}
              </h3>
              {isAuthor && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-violet-500/20 text-violet-600 dark:text-violet-300 border border-violet-500/30 font-medium">
                  You
                </span>
              )}
            </div>
            <span className="text-[11px] text-slate-400 dark:text-slate-500">
              {formatRelativeTime(confession.createdAt)}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Category Badge */}
          <span
            className={`text-xs px-2.5 py-1 rounded-xl font-medium border ${categoryMeta.gradient} ${categoryMeta.color} flex items-center gap-1`}
          >
            <span>{categoryMeta.label}</span>
          </span>

          {/* More options menu */}
          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setMenuOpen(!menuOpen);
              }}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-white/10 transition-colors"
            >
              <MoreHorizontal size={17} />
            </button>

            {menuOpen && (
              <div
                onClick={(e) => e.stopPropagation()}
                className="absolute right-0 mt-2 w-48 rounded-2xl liquid-glass border border-white/20 shadow-xl z-30 p-1.5 text-xs divide-y divide-white/5 animate-in fade-in zoom-in-95"
              >
                {isAuthor ? (
                  <>
                    {onEdit && (
                      <button
                        onClick={() => {
                          setMenuOpen(false);
                          onEdit(confession);
                        }}
                        className="w-full text-left px-3 py-2 rounded-xl text-slate-200 hover:bg-white/10 flex items-center gap-2 transition-colors"
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
                      disabled={isDeleting}
                      className="w-full text-left px-3 py-2 rounded-xl text-rose-400 hover:bg-rose-500/10 flex items-center gap-2 transition-colors"
                    >
                      <Trash2 size={14} />
                      <span>{isDeleting ? 'Erasing...' : 'Delete Confession'}</span>
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => {
                        setMenuOpen(false);
                        onOpenReport(confession.id);
                      }}
                      className="w-full text-left px-3 py-2 rounded-xl text-slate-200 hover:bg-white/10 flex items-center gap-2 transition-colors"
                    >
                      <Flag size={14} className="text-amber-400" />
                      <span>Report Content</span>
                    </button>
                    <button
                      onClick={() => {
                        setMenuOpen(false);
                        toggleBlockUser(confession.authorId);
                      }}
                      className="w-full text-left px-3 py-2 rounded-xl text-rose-400 hover:bg-rose-500/10 flex items-center gap-2 transition-colors"
                    >
                      <UserX size={14} />
                      <span>Block Author</span>
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Title */}
      {confession.title && (
        <h4 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white mb-2 leading-snug">
          {confession.title}
        </h4>
      )}

      {/* Sensitive Content Blur Shield */}
      {confession.hasContentWarning && !revealed ? (
        <div className="my-3 p-4 rounded-2xl bg-amber-500/10 dark:bg-amber-950/20 border border-amber-500/25 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <div className="flex items-center gap-2.5">
            <AlertTriangle size={18} className="text-amber-500 shrink-0" />
            <div>
              <p className="text-xs font-semibold text-amber-700 dark:text-amber-300">
                Content Warning: {confession.warningReason || 'Sensitive topic'}
              </p>
              <p className="text-[11px] text-amber-600/80 dark:text-amber-400/70">
                This confession contains topics some readers may find sensitive.
              </p>
            </div>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setRevealed(true);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 text-xs font-semibold transition-colors"
          >
            <Eye size={13} />
            <span>Reveal</span>
          </button>
        </div>
      ) : (
        /* Content text */
        <p className="text-sm text-slate-700 dark:text-slate-200 leading-relaxed font-light whitespace-pre-line line-clamp-5">
          {confession.content}
        </p>
      )}

      {/* Tags */}
      {confession.tags && confession.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-3">
          {confession.tags.map((t) => (
            <span
              key={t}
              className="text-[11px] text-violet-600 dark:text-violet-400/80 hover:text-violet-500 dark:hover:text-violet-300"
            >
              #{t}
            </span>
          ))}
        </div>
      )}

      {/* Footer / Reactions Bar */}
      <div className="mt-4 pt-3.5 border-t border-slate-200/60 dark:border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-1 sm:gap-2">
          {/* Like Button */}
          <button
            onClick={handleLike}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-medium transition-all ${
              liked
                ? 'text-rose-500 bg-rose-500/10 border border-rose-500/20'
                : 'text-slate-500 dark:text-slate-400 hover:text-rose-500 hover:bg-rose-500/5'
            }`}
          >
            <Heart size={15} className={liked ? 'fill-rose-500 text-rose-500' : ''} />
            <span>{likesCount}</span>
          </button>

          {/* Comments Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onSelect(confession.id);
            }}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-medium text-slate-500 dark:text-slate-400 hover:text-violet-500 dark:hover:text-violet-400 hover:bg-violet-500/5 transition-all"
          >
            <MessageSquare size={15} />
            <span>{confession.commentsCount}</span>
          </button>

          {/* Bookmark Button */}
          <button
            onClick={handleBookmark}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-medium transition-all ${
              bookmarked
                ? 'text-amber-500 bg-amber-500/10 border border-amber-500/20'
                : 'text-slate-500 dark:text-slate-400 hover:text-amber-500 hover:bg-amber-500/5'
            }`}
          >
            <Bookmark size={15} className={bookmarked ? 'fill-amber-500 text-amber-500' : ''} />
          </button>
        </div>

        {/* Share Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onOpenShare(confession);
          }}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-medium text-slate-500 dark:text-slate-400 hover:text-cyan-500 hover:bg-cyan-500/5 transition-colors"
        >
          <Share2 size={15} />
          <span className="hidden sm:inline">Share</span>
        </button>
      </div>
    </article>
  );
};
