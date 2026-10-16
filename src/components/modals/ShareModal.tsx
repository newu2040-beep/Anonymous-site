import React, { useState } from 'react';
import { X, Copy, Check, Share2, Sparkles, MessageCircle } from 'lucide-react';
import { Confession } from '../../types';
import { copyToClipboard, truncateText } from '../../lib/utils';
import { AvatarBadge } from '../common/AvatarBadge';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  confession: Confession;
}

export const ShareModal: React.FC<ShareModalProps> = ({
  isOpen,
  onClose,
  confession,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const shareUrl = `${window.location.origin}/#confession-${confession.id}`;

  const handleCopy = async () => {
    const success = await copyToClipboard(shareUrl);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: confession.title || `Secret by ${confession.authorAlias}`,
          text: truncateText(confession.content, 120),
          url: shareUrl,
        });
      } catch (err) {
        console.log('Share dismissed');
      }
    } else {
      handleCopy();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md rounded-3xl liquid-glass border border-white/20 dark:border-white/10 shadow-2xl p-6 sm:p-7">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-100 hover:bg-white/10 transition-colors"
        >
          <X size={18} />
        </button>

        <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-1">
          <Share2 size={18} className="text-violet-500" />
          <span>Share Anonymous Confession</span>
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-5">
          Share this story while strictly preserving the author's anonymous pseudonym.
        </p>

        {/* Visual Share Card Preview */}
        <div className="relative p-5 rounded-2xl bg-gradient-to-br from-slate-900/90 via-slate-950/90 to-purple-950/80 border border-white/15 shadow-xl text-left overflow-hidden mb-5">
          <div className="absolute top-0 right-0 p-3 opacity-20">
            <Sparkles size={48} className="text-violet-400" />
          </div>

          <div className="flex items-center gap-2.5 mb-3">
            <AvatarBadge
              avatarColor={confession.authorAvatar}
              size="sm"
            />
            <div>
              <p className="text-xs font-bold text-white">{confession.authorAlias}</p>
              <span className="text-[10px] text-violet-300 font-medium uppercase tracking-wider">
                {confession.category}
              </span>
            </div>
          </div>

          {confession.title && (
            <h4 className="text-sm font-semibold text-white mb-1.5">
              {confession.title}
            </h4>
          )}

          <p className="text-xs text-slate-300 line-clamp-4 leading-relaxed font-light">
            "{confession.content}"
          </p>

          <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-[11px] text-slate-400">
            <span className="font-semibold text-violet-400">ANONYMOUSSITE</span>
            <span>Anonymous Haven</span>
          </div>
        </div>

        {/* Copy Link Input */}
        <div className="flex items-center gap-2 p-1.5 rounded-xl bg-white/60 dark:bg-slate-900/60 border border-slate-200 dark:border-white/10 mb-4">
          <input
            type="text"
            readOnly
            value={shareUrl}
            className="flex-1 bg-transparent px-2.5 py-1 text-xs text-slate-600 dark:text-slate-300 focus:outline-none truncate"
          />
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold shadow-sm transition-colors"
          >
            {copied ? <Check size={14} /> : <Copy size={14} />}
            <span>{copied ? 'Copied!' : 'Copy'}</span>
          </button>
        </div>

        {/* Native Web Share Button */}
        {typeof navigator !== 'undefined' && 'share' in navigator && (
          <button
            onClick={handleNativeShare}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-semibold border border-slate-200/60 dark:border-white/5 transition-colors"
          >
            <Share2 size={15} />
            <span>Open System Share Sheet</span>
          </button>
        )}
      </div>
    </div>
  );
};
