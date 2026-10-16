import React, { useState, useEffect } from 'react';
import { Send, MessageSquare } from 'lucide-react';
import { Comment } from '../../types';
import { fetchComments, createComment } from '../../services/firestore';
import { useAuth } from '../../context/AuthContext';
import { AvatarBadge } from '../common/AvatarBadge';
import { CommentItem } from './CommentItem';

interface CommentListProps {
  confessionId: string;
  confessionAuthorId: string;
  onAuthRequired: () => void;
  onCommentsUpdated?: () => void;
}

export const CommentList: React.FC<CommentListProps> = ({
  confessionId,
  confessionAuthorId,
  onAuthRequired,
  onCommentsUpdated,
}) => {
  const { user, profile } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const loadComments = async () => {
    try {
      const items = await fetchComments(confessionId);
      setComments(items);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadComments();
  }, [confessionId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !profile) {
      onAuthRequired();
      return;
    }
    if (!newComment.trim()) return;

    setSubmitting(true);
    try {
      await createComment(
        {
          confessionId,
          authorId: user.uid,
          authorAlias: profile.alias,
          authorAvatar: profile.avatarColor,
          content: newComment.trim(),
        },
        confessionAuthorId
      );
      setNewComment('');
      await loadComments();
      onCommentsUpdated?.();
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  // Group root comments and child replies
  const rootComments = comments.filter((c) => !c.parentId);
  const getReplies = (parentId: string) => comments.filter((c) => c.parentId === parentId);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <MessageSquare size={17} className="text-violet-500" />
          <span>Responses ({comments.length})</span>
        </h3>
      </div>

      {/* New Comment Input Box */}
      <form
        onSubmit={handleSubmit}
        className="p-3.5 sm:p-4 rounded-3xl liquid-glass border border-white/20 dark:border-white/10 shadow-lg space-y-3"
      >
        <div className="flex items-center gap-2.5">
          <AvatarBadge
            avatarColor={profile?.avatarColor}
            avatarIcon={profile?.avatarIcon}
            size="sm"
          />
          <div className="flex-1">
            <span className="text-xs font-semibold text-slate-900 dark:text-white">
              {profile?.alias || 'Anonymous Responder'}
            </span>
            <span className="text-[10px] text-slate-400 block">
              Share compassionate advice or your perspective
            </span>
          </div>
        </div>

        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          maxLength={1200}
          rows={3}
          placeholder="Whisper your thoughts anonymously..."
          className="w-full p-3 text-xs sm:text-sm rounded-2xl bg-white/70 dark:bg-slate-900/60 border border-slate-200 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-violet-500 text-slate-900 dark:text-white placeholder:text-slate-400 resize-none leading-relaxed"
        />

        <div className="flex items-center justify-between pt-1">
          <span className="text-[10px] text-slate-400 font-mono">
            {1200 - newComment.length} chars left
          </span>
          <button
            type="submit"
            disabled={submitting || !newComment.trim()}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-semibold text-xs shadow-md shadow-violet-600/20 transition-all disabled:opacity-50"
          >
            <span>{submitting ? 'Sending...' : 'Respond Anonymously'}</span>
            <Send size={13} />
          </button>
        </div>
      </form>

      {/* Comments List */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-20 rounded-2xl liquid-glass-subtle animate-pulse border border-white/5"
            />
          ))}
        </div>
      ) : rootComments.length === 0 ? (
        <div className="text-center py-10 rounded-2xl liquid-glass-subtle border border-white/5">
          <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
            No whispers yet
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Be the first to offer guidance, comfort, or your perspective.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {rootComments.map((c) => (
            <CommentItem
              key={c.id}
              comment={c}
              confessionAuthorId={confessionAuthorId}
              replies={getReplies(c.id)}
              onAuthRequired={onAuthRequired}
              onCommentDeleted={loadComments}
              onReplyAdded={loadComments}
            />
          ))}
        </div>
      )}
    </div>
  );
};
