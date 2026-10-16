import React, { useEffect, useState, useRef } from 'react';
import { Bell, CheckCheck, Heart, MessageSquare, Reply, Info, X } from 'lucide-react';
import { Notification } from '../../types';
import { useAuth } from '../../context/AuthContext';
import {
  subscribeToNotifications,
  markNotificationRead,
} from '../../services/firestore';
import { formatRelativeTime } from '../../lib/utils';
import { AvatarBadge } from '../common/AvatarBadge';

interface NotificationPopoverProps {
  onSelectConfession: (confessionId: string) => void;
}

export const NotificationPopover: React.FC<NotificationPopoverProps> = ({
  onSelectConfession,
}) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) {
      setNotifications([]);
      return;
    }
    const unsub = subscribeToNotifications(user.uid, (items) => {
      setNotifications(items);
    });
    return () => unsub();
  }, [user]);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleMarkAllRead = async () => {
    const unread = notifications.filter((n) => !n.read);
    for (const item of unread) {
      await markNotificationRead(item.id);
    }
  };

  const handleItemClick = async (notif: Notification) => {
    if (!notif.read) {
      await markNotificationRead(notif.id);
    }
    setIsOpen(false);
    onSelectConfession(notif.confessionId);
  };

  const renderIcon = (type: Notification['type']) => {
    switch (type) {
      case 'like':
        return <Heart size={14} className="text-rose-500 fill-rose-500/20" />;
      case 'comment':
        return <MessageSquare size={14} className="text-violet-500" />;
      case 'reply':
        return <Reply size={14} className="text-cyan-500" />;
      case 'system':
      default:
        return <Info size={14} className="text-amber-500" />;
    }
  };

  if (!user) return null;

  return (
    <div className="relative" ref={containerRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Notifications"
        className="relative p-2.5 rounded-full text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-slate-100/80 dark:bg-slate-800/60 hover:bg-slate-200/80 dark:hover:bg-slate-700/60 border border-slate-300/40 dark:border-white/10 transition-all duration-200"
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 px-1 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white shadow-sm animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl liquid-glass border border-white/20 dark:border-white/10 shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
          <div className="p-3.5 border-b border-slate-200/60 dark:border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-slate-900 dark:text-white">
                Notifications
              </span>
              {unreadCount > 0 && (
                <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-violet-500/20 text-violet-400 border border-violet-500/30">
                  {unreadCount} new
                </span>
              )}
            </div>
            <div className="flex items-center gap-1">
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  title="Mark all as read"
                  className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400 hover:text-violet-500 dark:hover:text-violet-400 px-2 py-1 rounded-lg hover:bg-white/10 transition-colors"
                >
                  <CheckCheck size={14} />
                  <span>Mark read</span>
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-white/10 transition-colors"
              >
                <X size={15} />
              </button>
            </div>
          </div>

          <div className="max-h-[380px] overflow-y-auto divide-y divide-slate-100 dark:divide-white/5">
            {notifications.length === 0 ? (
              <div className="py-12 px-4 text-center">
                <div className="w-10 h-10 rounded-2xl mx-auto mb-3 flex items-center justify-center bg-violet-500/10 text-violet-400 border border-violet-500/20">
                  <Bell size={18} />
                </div>
                <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
                  No notifications yet
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-[220px] mx-auto">
                  When someone likes or replies to your anonymous confessions, you'll see it here.
                </p>
              </div>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif.id}
                  onClick={() => handleItemClick(notif)}
                  className={`p-3.5 flex items-start gap-3 cursor-pointer transition-colors duration-150 ${
                    !notif.read
                      ? 'bg-violet-500/5 hover:bg-violet-500/10 dark:bg-violet-500/10 dark:hover:bg-violet-500/15'
                      : 'hover:bg-slate-100/50 dark:hover:bg-white/5'
                  }`}
                >
                  <div className="relative shrink-0">
                    <AvatarBadge
                      avatarColor={notif.senderAvatar}
                      size="sm"
                    />
                    <span className="absolute -bottom-1 -right-1 p-0.5 rounded-full bg-slate-900 border border-white/20">
                      {renderIcon(notif.type)}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-slate-700 dark:text-slate-300">
                      <strong className="font-semibold text-slate-900 dark:text-white">
                        {notif.senderAlias}
                      </strong>{' '}
                      {notif.type === 'like' && 'liked your confession'}
                      {notif.type === 'comment' && 'commented on your confession'}
                      {notif.type === 'reply' && 'replied to your comment'}
                      {notif.type === 'system' && 'sent a notice'}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1 italic">
                      "{notif.snippet}"
                    </p>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 inline-block">
                      {formatRelativeTime(notif.createdAt)}
                    </span>
                  </div>
                  {!notif.read && (
                    <span className="w-2 h-2 rounded-full bg-violet-500 shrink-0 mt-1.5" />
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
