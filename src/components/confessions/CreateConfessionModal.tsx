import React, { useState, useEffect } from 'react';
import {
  X,
  Send,
  Sparkles,
  AlertTriangle,
  BookmarkCheck,
  Tag,
  HelpCircle,
  FolderSync,
  Trash2,
} from 'lucide-react';
import { CATEGORIES } from '../../lib/constants';
import { CategoryId, Draft } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { AvatarBadge } from '../common/AvatarBadge';
import {
  createConfession,
  saveDraft,
  fetchUserDrafts,
  deleteDraft,
} from '../../services/firestore';

interface CreateConfessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: (newConfessionId: string) => void;
  onAuthRequired: () => void;
}

export const CreateConfessionModal: React.FC<CreateConfessionModalProps> = ({
  isOpen,
  onClose,
  onCreated,
  onAuthRequired,
}) => {
  const { user, profile } = useAuth();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState<CategoryId>('secret');
  const [hasContentWarning, setHasContentWarning] = useState(false);
  const [warningReason, setWarningReason] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [currentDraftId, setCurrentDraftId] = useState<string | null>(null);
  const [showDraftsList, setShowDraftsList] = useState(false);

  // Load existing drafts if user is authenticated
  useEffect(() => {
    if (user && isOpen) {
      fetchUserDrafts(user.uid)
        .then((items) => setDrafts(items))
        .catch(console.error);
    }
  }, [user, isOpen]);

  if (!isOpen) return null;

  const handleAddTag = (e: React.KeyboardEvent) => {
    if ((e.key === 'Enter' || e.key === ',') && tagInput.trim()) {
      e.preventDefault();
      const clean = tagInput.trim().replace(/^#/, '').toLowerCase().slice(0, 20);
      if (clean && !tags.includes(clean) && tags.length < 5) {
        setTags([...tags, clean]);
        setTagInput('');
      }
    }
  };

  const handleRemoveTag = (t: string) => {
    setTags(tags.filter((x) => x !== t));
  };

  const handleSaveDraft = async () => {
    if (!user) {
      onAuthRequired();
      return;
    }
    if (!content.trim()) return;

    try {
      const draftId = await saveDraft({
        id: currentDraftId || undefined,
        userId: user.uid,
        title: title.trim() || undefined,
        content: content.trim(),
        category,
        hasContentWarning,
        warningReason: warningReason.trim() || undefined,
      });
      setCurrentDraftId(draftId);
      // Refresh drafts
      const items = await fetchUserDrafts(user.uid);
      setDrafts(items);
      alert('Draft saved securely to your private vault.');
    } catch (err: any) {
      console.error(err);
      setError('Could not save draft.');
    }
  };

  const handleLoadDraft = (d: Draft) => {
    setTitle(d.title || '');
    setContent(d.content);
    setCategory(d.category);
    setHasContentWarning(d.hasContentWarning);
    setWarningReason(d.warningReason || '');
    setCurrentDraftId(d.id);
    setShowDraftsList(false);
  };

  const handleDeleteDraft = async (dId: string) => {
    try {
      await deleteDraft(dId);
      setDrafts(drafts.filter((d) => d.id !== dId));
      if (currentDraftId === dId) {
        setCurrentDraftId(null);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !profile) {
      onAuthRequired();
      return;
    }

    if (content.trim().length < 5) {
      setError('Confession must be at least 5 characters long.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const newId = await createConfession({
        authorId: user.uid,
        authorAlias: profile.alias,
        authorAvatar: profile.avatarColor,
        title: title.trim() || undefined,
        content: content.trim(),
        category,
        tags: tags.length > 0 ? tags : undefined,
        hasContentWarning,
        warningReason: hasContentWarning ? (warningReason.trim() || 'Sensitive topic') : undefined,
        status: 'published',
      });

      // If this was loaded from draft, delete the draft
      if (currentDraftId) {
        await deleteDraft(currentDraftId).catch(console.warn);
      }

      onClose();
      onCreated(newId);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to publish confession.');
    } finally {
      setLoading(false);
    }
  };

  const remainingChars = 3000 - content.length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl rounded-3xl liquid-glass border border-white/20 dark:border-white/10 shadow-2xl p-5 sm:p-7 max-h-[92vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-100 hover:bg-white/10 transition-colors"
        >
          <X size={18} />
        </button>

        {/* Header with author identity preview */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200 dark:border-white/10 pr-8">
          <div className="flex items-center gap-3">
            <AvatarBadge
              avatarColor={profile?.avatarColor}
              avatarIcon={profile?.avatarIcon}
              size="md"
              showGlow
            />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-slate-900 dark:text-white">
                  {profile?.alias || 'Anonymous Spirit'}
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-violet-500/20 text-violet-300 border border-violet-500/30 font-medium">
                  Author
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Your real name, email, and IP are never disclosed.
              </p>
            </div>
          </div>

          {/* Draft actions */}
          {user && drafts.length > 0 && (
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowDraftsList(!showDraftsList)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-slate-300 text-xs font-medium border border-white/10 transition-colors"
              >
                <FolderSync size={13} className="text-violet-400" />
                <span>Drafts ({drafts.length})</span>
              </button>

              {showDraftsList && (
                <div className="absolute right-0 mt-2 w-64 rounded-2xl liquid-glass border border-white/20 shadow-xl z-20 p-2 text-xs divide-y divide-white/5">
                  {drafts.map((d) => (
                    <div
                      key={d.id}
                      className="p-2 flex items-center justify-between hover:bg-white/5 rounded-lg group"
                    >
                      <button
                        onClick={() => handleLoadDraft(d)}
                        className="text-left flex-1 truncate pr-2 text-slate-200 font-medium hover:text-violet-300"
                      >
                        {d.title || d.content.slice(0, 30) || 'Untitled Draft'}
                      </button>
                      <button
                        onClick={() => handleDeleteDraft(d.id)}
                        className="p-1 text-slate-400 hover:text-rose-400 transition-colors"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {error && (
          <div className="mt-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-400">
            {error}
          </div>
        )}

        {/* Confession Form */}
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {/* Category Selector */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
              Select Category
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {CATEGORIES.filter((c) => c.id !== 'all').map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setCategory(cat.id)}
                  className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs font-medium text-left transition-all ${
                    category === cat.id
                      ? 'border-violet-500 bg-violet-500/15 text-white shadow-sm ring-1 ring-violet-500/40'
                      : 'border-slate-200 dark:border-white/5 hover:border-slate-300 dark:hover:border-white/10 bg-white/40 dark:bg-slate-900/30 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <span className={cat.color}>•</span>
                  <span className="truncate">{cat.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Optional Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Title <span className="text-slate-400 font-normal">(optional)</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={120}
              placeholder="A brief headline for your secret or thought..."
              className="w-full px-3.5 py-2.5 text-sm rounded-xl bg-white/60 dark:bg-slate-900/50 border border-slate-200 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-violet-500 text-slate-900 dark:text-white placeholder:text-slate-400"
            />
          </div>

          {/* Confession Content Body */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Your Secret / Story / Unburdening
              </label>
              <span
                className={`text-[11px] font-mono ${
                  remainingChars < 200 ? 'text-amber-400' : 'text-slate-400'
                }`}
              >
                {remainingChars} chars remaining
              </span>
            </div>
            <textarea
              required
              value={content}
              onChange={(e) => setContent(e.target.value)}
              maxLength={3000}
              rows={6}
              placeholder="Speak openly. Unload the weight you have been carrying in silence. No judgment here..."
              className="w-full p-3.5 text-sm rounded-2xl bg-white/60 dark:bg-slate-900/50 border border-slate-200 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-violet-500 text-slate-900 dark:text-white placeholder:text-slate-400 leading-relaxed resize-none"
            />
          </div>

          {/* Tags */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Hashtags <span className="text-slate-400 font-normal">(up to 5 tags, press Enter)</span>
            </label>
            <div className="flex flex-wrap items-center gap-1.5 p-2 rounded-xl bg-white/60 dark:bg-slate-900/50 border border-slate-200 dark:border-white/10 min-h-[42px]">
              {tags.map((t) => (
                <span
                  key={t}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-violet-500/15 text-violet-300 text-xs font-medium border border-violet-500/25"
                >
                  #{t}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(t)}
                    className="hover:text-white"
                  >
                    ×
                  </button>
                </span>
              ))}
              {tags.length < 5 && (
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleAddTag}
                  placeholder={tags.length === 0 ? 'Type tag and hit Enter (e.g. regret)...' : ''}
                  className="flex-1 bg-transparent px-1 text-xs text-slate-900 dark:text-white focus:outline-none min-w-[120px]"
                />
              )}
            </div>
          </div>

          {/* Sensitive Content Warning Toggle */}
          <div className="p-3.5 rounded-2xl bg-white/40 dark:bg-slate-900/30 border border-slate-200 dark:border-white/5 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle
                  size={16}
                  className={hasContentWarning ? 'text-amber-500' : 'text-slate-400'}
                />
                <div>
                  <h4 className="text-xs font-semibold text-slate-900 dark:text-white">
                    Apply Content Warning
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Will blur post preview for users until they opt to view.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setHasContentWarning(!hasContentWarning)}
                className={`w-10 h-5.5 rounded-full transition-colors relative p-0.5 ${
                  hasContentWarning ? 'bg-amber-500' : 'bg-slate-600'
                }`}
              >
                <div
                  className={`w-4.5 h-4.5 rounded-full bg-white shadow-sm transition-transform duration-200 ${
                    hasContentWarning ? 'translate-x-4.5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {hasContentWarning && (
              <input
                type="text"
                value={warningReason}
                onChange={(e) => setWarningReason(e.target.value)}
                maxLength={80}
                placeholder="Brief reason (e.g., adult theme, grief, trauma trigger)..."
                className="w-full px-3 py-1.5 text-xs rounded-xl bg-slate-950/40 border border-amber-500/30 text-white placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
            )}
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex flex-col-reverse sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleSaveDraft}
                disabled={loading || !content.trim()}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-white/10 border border-slate-200 dark:border-white/10 transition-colors disabled:opacity-40"
              >
                <BookmarkCheck size={14} />
                <span>Save Draft</span>
              </button>
            </div>

            <div className="flex items-center gap-2 self-end">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || content.trim().length < 5}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-semibold text-xs shadow-lg shadow-violet-600/30 transition-all disabled:opacity-50"
              >
                <span>{loading ? 'Publishing...' : 'Whisper Anonymously'}</span>
                <Send size={14} />
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
