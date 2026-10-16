import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User,
  signInWithPopup,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signInAnonymously,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth';
import { auth } from '../lib/firebase';
import { UserProfile } from '../types';
import { getUserProfile, upsertUserProfile } from '../services/firestore';
import { generateAnonymousAlias } from '../lib/aliasGenerator';

export type ThemeMode = 'dark' | 'light' | 'system';

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  theme: ThemeMode;
  setTheme: (mode: ThemeMode) => void;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, pass: string) => Promise<void>;
  signUpWithEmail: (email: string, pass: string) => Promise<void>;
  sendPasswordReset: (email: string) => Promise<void>;
  signInAsGuest: () => Promise<void>;
  logout: () => Promise<void>;
  regenerateAlias: () => Promise<void>;
  updateCustomAlias: (newAlias: string) => Promise<void>;
  toggleBlockUser: (targetUserId: string) => Promise<void>;
  toggleSensitiveFilter: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [theme, setThemeState] = useState<ThemeMode>(() => {
    return (localStorage.getItem('theme_mode') as ThemeMode) || 'dark';
  });

  // Apply theme class to documentElement
  useEffect(() => {
    const root = document.documentElement;
    const applyTheme = (mode: ThemeMode) => {
      if (mode === 'system') {
        const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        root.classList.toggle('dark', systemDark);
      } else {
        root.classList.toggle('dark', mode === 'dark');
      }
    };

    applyTheme(theme);
    localStorage.setItem('theme_mode', theme);

    if (theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const listener = () => applyTheme('system');
      mediaQuery.addEventListener('change', listener);
      return () => mediaQuery.removeEventListener('change', listener);
    }
  }, [theme]);

  const setTheme = (mode: ThemeMode) => {
    setThemeState(mode);
  };

  // Sync auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        try {
          let userProfile = await getUserProfile(currentUser.uid);
          if (!userProfile) {
            // Generate deterministic anonymous persona
            const { alias, avatarColor, avatarIcon } = generateAnonymousAlias(currentUser.uid);
            const now = new Date().toISOString();
            userProfile = {
              userId: currentUser.uid,
              email: currentUser.email || undefined,
              alias,
              avatarColor,
              avatarIcon,
              blockedUserIds: [],
              sensitiveFilter: true,
              createdAt: now,
              updatedAt: now,
            };
            await upsertUserProfile(userProfile);
          }
          setProfile(userProfile);
        } catch (err) {
          console.error('Error fetching/creating user profile:', err);
        }
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    await signInWithPopup(auth, provider);
  };

  const signInWithEmail = async (email: string, pass: string) => {
    await signInWithEmailAndPassword(auth, email, pass);
  };

  const signUpWithEmail = async (email: string, pass: string) => {
    await createUserWithEmailAndPassword(auth, email, pass);
  };

  const sendPasswordReset = async (email: string) => {
    await sendPasswordResetEmail(auth, email);
  };

  const signInAsGuest = async () => {
    await signInAnonymously(auth);
  };

  const logout = async () => {
    await signOut(auth);
  };

  const regenerateAlias = async () => {
    if (!user || !profile) return;
    const { alias, avatarColor, avatarIcon } = generateAnonymousAlias();
    const updated: UserProfile = {
      ...profile,
      alias,
      avatarColor,
      avatarIcon,
      updatedAt: new Date().toISOString(),
    };
    await upsertUserProfile(updated);
    setProfile(updated);
  };

  const updateCustomAlias = async (newAlias: string) => {
    if (!user || !profile || !newAlias.trim()) return;
    const clean = newAlias.trim().slice(0, 50);
    const updated: UserProfile = {
      ...profile,
      alias: clean,
      updatedAt: new Date().toISOString(),
    };
    await upsertUserProfile(updated);
    setProfile(updated);
  };

  const toggleBlockUser = async (targetUserId: string) => {
    if (!user || !profile || targetUserId === user.uid) return;
    const alreadyBlocked = profile.blockedUserIds.includes(targetUserId);
    const newBlocked = alreadyBlocked
      ? profile.blockedUserIds.filter((id) => id !== targetUserId)
      : [...profile.blockedUserIds, targetUserId];

    const updated: UserProfile = {
      ...profile,
      blockedUserIds: newBlocked,
      updatedAt: new Date().toISOString(),
    };
    await upsertUserProfile(updated);
    setProfile(updated);
  };

  const toggleSensitiveFilter = async () => {
    if (!user || !profile) return;
    const updated: UserProfile = {
      ...profile,
      sensitiveFilter: !profile.sensitiveFilter,
      updatedAt: new Date().toISOString(),
    };
    await upsertUserProfile(updated);
    setProfile(updated);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        theme,
        setTheme,
        signInWithGoogle,
        signInWithEmail,
        signUpWithEmail,
        sendPasswordReset,
        signInAsGuest,
        logout,
        regenerateAlias,
        updateCustomAlias,
        toggleBlockUser,
        toggleSensitiveFilter,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
