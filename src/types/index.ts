export type CategoryId =
  | 'all'
  | 'secret'
  | 'love'
  | 'thoughts'
  | 'regret'
  | 'work'
  | 'wild'
  | 'advice'
  | 'guilt'
  | 'wholesome';

export interface CategoryInfo {
  id: CategoryId;
  label: string;
  icon: string;
  description: string;
  color: string;
  gradient: string;
}

export interface UserProfile {
  userId: string;
  email?: string;
  alias: string;
  avatarColor: string;
  avatarIcon: string;
  bio?: string;
  blockedUserIds: string[];
  sensitiveFilter: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Confession {
  id: string;
  authorId: string;
  authorAlias: string;
  authorAvatar: string;
  title?: string;
  content: string;
  category: CategoryId;
  tags?: string[];
  hasContentWarning: boolean;
  warningReason?: string;
  likesCount: number;
  commentsCount: number;
  bookmarksCount: number;
  viewsCount: number;
  status: 'published' | 'archived';
  createdAt: string;
  updatedAt: string;
}

export interface Comment {
  id: string;
  confessionId: string;
  authorId: string;
  authorAlias: string;
  authorAvatar: string;
  content: string;
  parentId?: string; // empty or missing for root comment
  parentAuthorAlias?: string;
  likesCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface PostLike {
  confessionId: string;
  userId: string;
  createdAt: string;
}

export interface CommentLike {
  commentId: string;
  userId: string;
  createdAt: string;
}

export interface Bookmark {
  confessionId: string;
  userId: string;
  createdAt: string;
}

export interface Notification {
  id: string;
  recipientId: string;
  senderAlias: string;
  senderAvatar: string;
  type: 'like' | 'comment' | 'reply' | 'system';
  confessionId: string;
  commentId?: string;
  snippet: string;
  read: boolean;
  createdAt: string;
}

export interface Report {
  id: string;
  reporterId: string;
  targetType: 'confession' | 'comment';
  targetId: string;
  reason: string;
  details?: string;
  status: 'pending' | 'reviewed' | 'dismissed';
  createdAt: string;
}

export interface Draft {
  id: string;
  userId: string;
  title?: string;
  content: string;
  category: CategoryId;
  hasContentWarning: boolean;
  warningReason?: string;
  updatedAt: string;
}

export type FeedSort = 'trending' | 'latest' | 'discussed' | 'secrets';

export type AppView =
  | 'feed'
  | 'detail'
  | 'bookmarks'
  | 'my-confessions'
  | 'explore'
  | 'guidelines';
