import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  increment,
  onSnapshot,
  Unsubscribe,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import {
  Confession,
  Comment,
  Bookmark,
  Notification,
  Report,
  Draft,
  UserProfile,
  CategoryId,
  FeedSort,
} from '../types';
import { INITIAL_SEED_CONFESSIONS } from './seedData';

// Collection references
const CONFESSIONS_COL = 'confessions';
const COMMENTS_COL = 'comments';
const POST_LIKES_COL = 'post_likes';
const COMMENT_LIKES_COL = 'comment_likes';
const BOOKMARKS_COL = 'bookmarks';
const NOTIFICATIONS_COL = 'notifications';
const REPORTS_COL = 'reports';
const DRAFTS_COL = 'drafts';
const USERS_COL = 'users';

// User Profile
export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  const path = `${USERS_COL}/${userId}`;
  try {
    const snap = await getDoc(doc(db, USERS_COL, userId));
    if (snap.exists()) {
      return snap.data() as UserProfile;
    }
    return null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
}

export async function upsertUserProfile(profile: UserProfile): Promise<void> {
  const path = `${USERS_COL}/${profile.userId}`;
  try {
    await setDoc(doc(db, USERS_COL, profile.userId), profile, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

// Confessions
export async function seedInitialDataIfEmpty(): Promise<void> {
  try {
    const snap = await getDocs(query(collection(db, CONFESSIONS_COL), limit(1)));
    if (snap.empty) {
      console.log('Database empty, populating initial community confessions...');
      for (const conf of INITIAL_SEED_CONFESSIONS) {
        const newDocRef = doc(collection(db, CONFESSIONS_COL));
        await setDoc(newDocRef, {
          ...conf,
          id: newDocRef.id,
        });
      }
    }
  } catch (error) {
    console.warn('Initial seeding check or write skipped:', error);
  }
}

export async function fetchConfessions(filters: {
  category?: CategoryId;
  sort?: FeedSort;
  authorId?: string;
  searchQuery?: string;
  limitCount?: number;
}): Promise<Confession[]> {
  const path = CONFESSIONS_COL;
  try {
    let q = query(collection(db, CONFESSIONS_COL), where('status', '==', 'published'));

    if (filters.category && filters.category !== 'all') {
      q = query(q, where('category', '==', filters.category));
    }

    if (filters.authorId) {
      q = query(q, where('authorId', '==', filters.authorId));
    }

    // Default order by createdAt desc
    q = query(q, orderBy('createdAt', 'desc'), limit(filters.limitCount || 50));

    const snapshot = await getDocs(q);
    let results: Confession[] = snapshot.docs.map((d) => ({
      id: d.id,
      ...(d.data() as Omit<Confession, 'id'>),
    }));

    // Client-side sorting & search filters
    if (filters.sort === 'trending') {
      results.sort((a, b) => {
        const scoreA = (a.likesCount * 3 + a.commentsCount * 2 + a.viewsCount * 0.1);
        const scoreB = (b.likesCount * 3 + b.commentsCount * 2 + b.viewsCount * 0.1);
        return scoreB - scoreA;
      });
    } else if (filters.sort === 'discussed') {
      results.sort((a, b) => b.commentsCount - a.commentsCount);
    } else if (filters.sort === 'secrets') {
      results = results.filter((c) => c.category === 'secret');
    }

    if (filters.searchQuery && filters.searchQuery.trim().length > 0) {
      const lower = filters.searchQuery.toLowerCase();
      results = results.filter(
        (c) =>
          c.content.toLowerCase().includes(lower) ||
          c.title?.toLowerCase().includes(lower) ||
          c.authorAlias.toLowerCase().includes(lower) ||
          c.tags?.some((t) => t.toLowerCase().includes(lower))
      );
    }

    return results;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
}

export async function fetchConfessionById(id: string): Promise<Confession | null> {
  const path = `${CONFESSIONS_COL}/${id}`;
  try {
    const snap = await getDoc(doc(db, CONFESSIONS_COL, id));
    if (snap.exists()) {
      return { id: snap.id, ...(snap.data() as Omit<Confession, 'id'>) };
    }
    return null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
}

export async function createConfession(
  data: Omit<Confession, 'id' | 'likesCount' | 'commentsCount' | 'bookmarksCount' | 'viewsCount' | 'createdAt' | 'updatedAt'>
): Promise<string> {
  const path = CONFESSIONS_COL;
  try {
    const docRef = doc(collection(db, CONFESSIONS_COL));
    const now = new Date().toISOString();
    const payload: Confession = {
      ...data,
      id: docRef.id,
      likesCount: 0,
      commentsCount: 0,
      bookmarksCount: 0,
      viewsCount: 1,
      createdAt: now,
      updatedAt: now,
    };
    await setDoc(docRef, payload);
    return docRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function updateConfession(
  id: string,
  data: Partial<Pick<Confession, 'title' | 'content' | 'category' | 'tags' | 'hasContentWarning' | 'warningReason' | 'status'>>
): Promise<void> {
  const path = `${CONFESSIONS_COL}/${id}`;
  try {
    await updateDoc(doc(db, CONFESSIONS_COL, id), {
      ...data,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function deleteConfession(id: string): Promise<void> {
  const path = `${CONFESSIONS_COL}/${id}`;
  try {
    await deleteDoc(doc(db, CONFESSIONS_COL, id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export async function incrementConfessionView(id: string): Promise<void> {
  const path = `${CONFESSIONS_COL}/${id}`;
  try {
    await updateDoc(doc(db, CONFESSIONS_COL, id), {
      viewsCount: increment(1),
    });
  } catch (error) {
    // Non-fatal view counter error
    console.warn('View count increment ignored:', error);
  }
}

// Post Likes
export async function toggleConfessionLike(
  confessionId: string,
  userId: string,
  authorId?: string,
  senderAlias?: string,
  snippet?: string
): Promise<boolean> {
  const likeId = `${confessionId}_${userId}`;
  const likePath = `${POST_LIKES_COL}/${likeId}`;
  try {
    const likeRef = doc(db, POST_LIKES_COL, likeId);
    const snap = await getDoc(likeRef);
    const confRef = doc(db, CONFESSIONS_COL, confessionId);

    if (snap.exists()) {
      // Unlike
      await deleteDoc(likeRef);
      await updateDoc(confRef, { likesCount: increment(-1) });
      return false;
    } else {
      // Like
      await setDoc(likeRef, {
        confessionId,
        userId,
        createdAt: new Date().toISOString(),
      });
      await updateDoc(confRef, { likesCount: increment(1) });

      // Notify author if not self
      if (authorId && authorId !== userId) {
        sendNotification({
          recipientId: authorId,
          senderAlias: senderAlias || 'Someone',
          senderAvatar: 'from-violet-600 to-indigo-700',
          type: 'like',
          confessionId,
          snippet: snippet?.slice(0, 80) || 'liked your confession',
          read: false,
          createdAt: new Date().toISOString(),
        }).catch(console.error);
      }
      return true;
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, likePath);
  }
}

export async function checkConfessionLiked(confessionId: string, userId: string): Promise<boolean> {
  const likeId = `${confessionId}_${userId}`;
  const path = `${POST_LIKES_COL}/${likeId}`;
  try {
    const snap = await getDoc(doc(db, POST_LIKES_COL, likeId));
    return snap.exists();
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
}

// Bookmarks
export async function toggleBookmark(confessionId: string, userId: string): Promise<boolean> {
  const bookmarkId = `${userId}_${confessionId}`;
  const path = `${BOOKMARKS_COL}/${bookmarkId}`;
  try {
    const bRef = doc(db, BOOKMARKS_COL, bookmarkId);
    const snap = await getDoc(bRef);
    const confRef = doc(db, CONFESSIONS_COL, confessionId);

    if (snap.exists()) {
      await deleteDoc(bRef);
      await updateDoc(confRef, { bookmarksCount: increment(-1) });
      return false;
    } else {
      await setDoc(bRef, {
        confessionId,
        userId,
        createdAt: new Date().toISOString(),
      });
      await updateDoc(confRef, { bookmarksCount: increment(1) });
      return true;
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function checkBookmarked(confessionId: string, userId: string): Promise<boolean> {
  const bookmarkId = `${userId}_${confessionId}`;
  const path = `${BOOKMARKS_COL}/${bookmarkId}`;
  try {
    const snap = await getDoc(doc(db, BOOKMARKS_COL, bookmarkId));
    return snap.exists();
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
}

export async function fetchUserBookmarks(userId: string): Promise<Confession[]> {
  const path = BOOKMARKS_COL;
  try {
    const q = query(collection(db, BOOKMARKS_COL), where('userId', '==', userId));
    const snap = await getDocs(q);
    const confessionIds = snap.docs.map((d) => (d.data() as Bookmark).confessionId);

    if (confessionIds.length === 0) return [];

    const confessions: Confession[] = [];
    for (const cid of confessionIds) {
      const conf = await fetchConfessionById(cid);
      if (conf) confessions.push(conf);
    }
    return confessions;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
}

// Comments
export async function fetchComments(confessionId: string): Promise<Comment[]> {
  const path = COMMENTS_COL;
  try {
    const q = query(
      collection(db, COMMENTS_COL),
      where('confessionId', '==', confessionId),
      orderBy('createdAt', 'asc')
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({
      id: d.id,
      ...(d.data() as Omit<Comment, 'id'>),
    }));
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
}

export async function createComment(
  data: Omit<Comment, 'id' | 'likesCount' | 'createdAt' | 'updatedAt'>,
  confessionAuthorId?: string
): Promise<string> {
  const path = COMMENTS_COL;
  try {
    const docRef = doc(collection(db, COMMENTS_COL));
    const now = new Date().toISOString();
    const payload: Comment = {
      ...data,
      id: docRef.id,
      likesCount: 0,
      createdAt: now,
      updatedAt: now,
    };
    await setDoc(docRef, payload);

    // Increment commentsCount on confession
    await updateDoc(doc(db, CONFESSIONS_COL, data.confessionId), {
      commentsCount: increment(1),
    });

    // Notify post author if not commenter
    if (confessionAuthorId && confessionAuthorId !== data.authorId) {
      sendNotification({
        recipientId: confessionAuthorId,
        senderAlias: data.authorAlias,
        senderAvatar: data.authorAvatar,
        type: 'comment',
        confessionId: data.confessionId,
        commentId: docRef.id,
        snippet: data.content.slice(0, 80),
        read: false,
        createdAt: now,
      }).catch(console.error);
    }

    return docRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function deleteComment(commentId: string, confessionId: string): Promise<void> {
  const path = `${COMMENTS_COL}/${commentId}`;
  try {
    await deleteDoc(doc(db, COMMENTS_COL, commentId));
    await updateDoc(doc(db, CONFESSIONS_COL, confessionId), {
      commentsCount: increment(-1),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export async function toggleCommentLike(commentId: string, userId: string): Promise<boolean> {
  const likeId = `${commentId}_${userId}`;
  const path = `${COMMENT_LIKES_COL}/${likeId}`;
  try {
    const likeRef = doc(db, COMMENT_LIKES_COL, likeId);
    const snap = await getDoc(likeRef);
    const commentRef = doc(db, COMMENTS_COL, commentId);

    if (snap.exists()) {
      await deleteDoc(likeRef);
      await updateDoc(commentRef, { likesCount: increment(-1) });
      return false;
    } else {
      await setDoc(likeRef, {
        commentId,
        userId,
        createdAt: new Date().toISOString(),
      });
      await updateDoc(commentRef, { likesCount: increment(1) });
      return true;
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function checkCommentLiked(commentId: string, userId: string): Promise<boolean> {
  const likeId = `${commentId}_${userId}`;
  const path = `${COMMENT_LIKES_COL}/${likeId}`;
  try {
    const snap = await getDoc(doc(db, COMMENT_LIKES_COL, likeId));
    return snap.exists();
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
}

// Notifications
export async function sendNotification(notif: Omit<Notification, 'id'>): Promise<void> {
  const path = NOTIFICATIONS_COL;
  try {
    const ref = doc(collection(db, NOTIFICATIONS_COL));
    await setDoc(ref, {
      ...notif,
      id: ref.id,
    });
  } catch (error) {
    console.warn('Failed to send notification:', error);
  }
}

export function subscribeToNotifications(
  userId: string,
  onUpdate: (notifications: Notification[]) => void
): Unsubscribe {
  const path = NOTIFICATIONS_COL;
  const q = query(
    collection(db, NOTIFICATIONS_COL),
    where('recipientId', '==', userId),
    orderBy('createdAt', 'desc'),
    limit(30)
  );

  return onSnapshot(
    q,
    (snap) => {
      const items: Notification[] = snap.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Omit<Notification, 'id'>),
      }));
      onUpdate(items);
    },
    (error) => {
      handleFirestoreError(error, OperationType.GET, path);
    }
  );
}

export async function markNotificationRead(id: string): Promise<void> {
  const path = `${NOTIFICATIONS_COL}/${id}`;
  try {
    await updateDoc(doc(db, NOTIFICATIONS_COL, id), { read: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

// Reports
export async function createReport(report: Omit<Report, 'id' | 'status' | 'createdAt'>): Promise<void> {
  const path = REPORTS_COL;
  try {
    const ref = doc(collection(db, REPORTS_COL));
    await setDoc(ref, {
      ...report,
      id: ref.id,
      status: 'pending',
      createdAt: new Date().toISOString(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

// Drafts
export async function fetchUserDrafts(userId: string): Promise<Draft[]> {
  const path = DRAFTS_COL;
  try {
    const q = query(collection(db, DRAFTS_COL), where('userId', '==', userId), orderBy('updatedAt', 'desc'));
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({
      id: d.id,
      ...(d.data() as Omit<Draft, 'id'>),
    }));
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
}

export async function saveDraft(draft: Omit<Draft, 'id' | 'updatedAt'> & { id?: string }): Promise<string> {
  const path = DRAFTS_COL;
  try {
    const ref = draft.id ? doc(db, DRAFTS_COL, draft.id) : doc(collection(db, DRAFTS_COL));
    const now = new Date().toISOString();
    await setDoc(ref, {
      ...draft,
      id: ref.id,
      updatedAt: now,
    });
    return ref.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deleteDraft(draftId: string): Promise<void> {
  const path = `${DRAFTS_COL}/${draftId}`;
  try {
    await deleteDoc(doc(db, DRAFTS_COL, draftId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}
