import React, { useState, useEffect } from 'react';
import { Heart, Reply, Trash2, Send, CornerDownRight } from 'lucide-react';
import { Comment } from '../../types';
import { formatRelativeTime } from '../../lib/utils';
import { AvatarBadge } from '../common/AvatarBadge';
import { useAuth } from '../../context/AuthContext';
import {
  toggleCommentLike,
  checkCommentLiked,
  deleteComment,
  createComment,
} from '../../services/firestore';

interface CommentItemProps {
  comment: Comment;
  confessionAuthorId: string;
  replies?: Comment[];
  onAuthRequired: () => void;
  onCommentDeleted: (commentId: string) => void;
  onReplyAdded: () => void;
}

export const CommentItem: React.FC<CommentItemProps> = ({
  comment,
  confessionAuthorId,
  replies = [],
  onAuthRequired,
  onCommentDeleted,
  onReplyAdded,
}) => {
  const { user, profile } = useAuth();
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(comment.likesCount);
  const [isReplying, setIsReplying] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [submittingReply, setSubmittingReply] = useState(false);

  const isAuthor = user?.uid === comment.authorId;
  const isOP = comment.authorId === confessionAuthorId;

  useEffect(() => {
    if (user) {
      checkCommentLiked(comment.id, user.uid).then(setLiked).catch(console.error);
    }
  }, [user, comment.id]);

  const handleLike = async () => {
    if (!user) {
      onAuthRequired();
      return;
    }
    const nextState = !liked;
    setLiked(nextState);
    setLikesCount((prev) => (nextState ? prev + 1 : Math.max(0, prev - 1)));
    try {
      await toggleCommentLike(comment.id, user.uid);
    } catch (err) {
      console.error(err);
      setLiked(!nextState);
      setLikesCount((prev) => (!nextState ? prev + 1 : Math.max(0, prev - 1)));
    }
  };

  const handleDelete = async () => {
    if (!confirm('Erase this anonymous response?')) return;
    try {
      await deleteComment(comment.id, comment.confessionId);
      onCommentDeleted(comment.id);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !profile) {
      onAuthRequired();
      return;
    }
    if (!replyText.trim()) return;

    setSubmittingReply(true);
    try {
      await createComment(
        {
          confessionId: comment.confessionId,
          authorId: user.uid,
          authorAlias: profile.alias,
          authorAvatar: profile.avatarColor,
          content: replyText.trim(),
          parentId: comment.id,
          parentAuthorAlias: comment.authorAlias,
        },
        confessionAuthorId
      );
      setReplyText('');
      setIsReplying(false);
      onReplyAdded();
    } catch (err) {
      console.error(err);
    } finally {
      setSubmittingReply(false);
    }
  };

  return (
    <div className="space-y-3">
      <div className="p-4 rounded-2xl liquid-glass-subtle border border-white/10">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2.5">
            <AvatarBadge avatarColor={comment.authorAvatar} size="xs" />
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-slate-900 dark:text-white">
                {comment.authorAlias}
              </span>
              {isOP && (
                <span className="text-[9px] px-1.5 py-0.2 rounded-md bg-violet-500/20 text-violet-400 font-bold border border-violet-500/30">
                  OP
                </span>
              )}
              {isAuthor && (
                <span className="text-[9px] px-1.5 py-0.2 rounded-md bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30">
                  You
                </span>
              )}
            </div>
            <span className="text-[10px] text-slate-400">
              {formatRelativeTime(comment.createdAt)}
            </span>
          </div>

          <div className="flex items-center gap-1">
            {isAuthor && (
              <button
                onClick={handleDelete}
                title="Delete comment"
                className="p-1 text-slate-400 hover:text-rose-400 transition-colors"
              >
                <Trash2 size={13} />
              </button>
            )}
          </div>
        </div>

        {comment.parentAuthorAlias && (
          <p className="text-[11px] text-violet-400 mb-1">
            Replying to <span className="font-semibold">@{comment.parentAuthorAlias}</span>
          </p>
        )}

        <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-200 leading-relaxed font-light">
          {comment.content}
        </p>

        <div className="mt-2.5 flex items-center gap-3 text-xs text-slate-400">
          <button
            onClick={handleLike}
            className={`flex items-center gap-1 transition-colors ${
              liked ? 'text-rose-500' : 'hover:text-rose-500'
            }`}
          >
            <Heart size={13} className={liked ? 'fill-rose-500' : ''} />
            <span>{likesCount}</span>
          </button>

          <button
            onClick={() => {
              if (!user) onAuthRequired();
              else setIsReplying(!isReplying);
            }}
            className="flex items-center gap-1 hover:text-violet-400 transition-colors"
          >
            <Reply size={13} />
            <span>Reply</span>
          </button>
        </div>

        {/* Reply Box */}
        {isReplying && (
          <form onSubmit={handleSendReply} className="mt-3 pt-3 border-t border-white/10 flex gap-2">
            <input
              type="text"
              autoFocus
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder={`Replying to @${comment.authorAlias}...`}
              className="flex-1 px-3 py-1.5 text-xs rounded-xl bg-slate-900/60 border border-white/10 focus:outline-none focus:ring-1 focus:ring-violet-500 text-white placeholder:text-slate-500"
            />
            <button
              type="submit"
              disabled={submittingReply || !replyText.trim()}
              className="px-3 py-1.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold shadow-sm transition-colors disabled:opacity-50 flex items-center gap-1"
            >
              <span>Send</span>
              <Send size={11} />
            </button>
          </form>
        )}
      </div>

      {/* Nested Replies */}
      {replies.length > 0 && (
        <div className="pl-6 sm:pl-8 space-y-2 border-l-2 border-violet-500/20 ml-3">
          {replies.map((reply) => (
            <div
              key={reply.id}
              className="p-3 rounded-2xl liquid-glass-subtle border border-white/5 relative"
            >
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <AvatarBadge avatarColor={reply.authorAvatar} size="xs" />
                  <span className="text-xs font-bold text-slate-900 dark:text-white">
                    {reply.authorAlias}
                  </span>
                  {reply.authorId === confessionAuthorId && (
                    <span className="text-[9px] px-1.5 py-0.2 rounded-md bg-violet-500/20 text-violet-400 font-bold border border-violet-500/30">
                      OP
                    </span>
                  )}
                  {reply.authorId === user?.uid && (
                    <span className="text-[9px] px-1.5 py-0.2 rounded-md bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30">
                      You
                    </span>
                  )}
                  <span className="text-[10px] text-slate-400">
                    {formatRelativeTime(reply.createdAt)}
                  </span>
                </div>

                {reply.authorId === user?.uid && (
                  <button
                    onClick={async () => {
                      if (confirm('Delete reply?')) {
                        await deleteComment(reply.id, reply.confessionId);
                        onCommentDeleted(reply.id);
                      }
                    }}
                    className="p-1 text-slate-400 hover:text-rose-400"
                  >
                    <Trash2 size={12} />
                  </button>
                )}
              </div>

              <p className="text-xs text-slate-700 dark:text-slate-200 font-light leading-relaxed">
                {reply.content}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
