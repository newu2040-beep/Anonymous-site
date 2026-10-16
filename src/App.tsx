/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AppView, CategoryId, Confession, Draft } from './types';
import { Header } from './components/common/Header';
import { Sidebar } from './components/common/Sidebar';
import { MobileNav } from './components/common/MobileNav';
import { WelcomeHero } from './components/common/WelcomeHero';
import { ConfessionFeed } from './components/confessions/ConfessionFeed';
import { ConfessionDetailView } from './components/confessions/ConfessionDetailView';
import { BookmarksView } from './components/views/BookmarksView';
import { MyConfessionsView } from './components/views/MyConfessionsView';
import { ExploreView } from './components/views/ExploreView';
import { CreateConfessionModal } from './components/confessions/CreateConfessionModal';
import { AuthModal } from './components/auth/AuthModal';
import { SettingsModal } from './components/settings/SettingsModal';
import { GuidelinesModal } from './components/modals/GuidelinesModal';
import { ShareModal } from './components/modals/ShareModal';
import { ReportModal } from './components/modals/ReportModal';

function MainLayout() {
  const { user } = useAuth();

  const [currentView, setCurrentView] = useState<AppView>('feed');
  const [selectedConfessionId, setSelectedConfessionId] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<CategoryId>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals state
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [settingsModalOpen, setSettingsModalOpen] = useState(false);
  const [guidelinesModalOpen, setGuidelinesModalOpen] = useState(false);
  const [shareConfession, setShareConfession] = useState<Confession | null>(null);
  const [reportTarget, setReportTarget] = useState<{
    type: 'confession' | 'comment';
    id: string;
  } | null>(null);

  // Check URL hash for direct links (e.g., #confession-xyz)
  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash;
      if (hash && hash.startsWith('#confession-')) {
        const id = hash.replace('#confession-', '');
        if (id) {
          setSelectedConfessionId(id);
          setCurrentView('detail');
        }
      }
    };

    handleHash();
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  const handleSelectConfession = (id: string) => {
    setSelectedConfessionId(id);
    setCurrentView('detail');
    window.location.hash = `confession-${id}`;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToFeed = () => {
    setSelectedConfessionId(null);
    setCurrentView('feed');
    window.location.hash = '';
  };

  const handleSelectCategory = (cat: CategoryId) => {
    setSelectedCategory(cat);
    setCurrentView('feed');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSearchFromExplore = (query: string) => {
    setSearchQuery(query);
    setCurrentView('feed');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col relative selection:bg-violet-500/30">
      {/* Background radial ambient lights */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-b from-violet-600/10 via-purple-600/5 to-transparent blur-3xl pointer-events-none -z-10" />

      {/* Global Header */}
      <Header
        onOpenCreate={() => setCreateModalOpen(true)}
        onOpenAuth={() => setAuthModalOpen(true)}
        onOpenSettings={() => setSettingsModalOpen(true)}
        onSelectConfession={handleSelectConfession}
        onNavigateHome={handleBackToFeed}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />

      {/* Main Body */}
      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 flex gap-8">
        {/* Left Sidebar (Desktop) */}
        <Sidebar
          currentView={currentView}
          onSelectView={(v) => {
            setCurrentView(v);
            if (v !== 'detail') setSelectedConfessionId(null);
          }}
          selectedCategory={selectedCategory}
          onSelectCategory={handleSelectCategory}
          onOpenCreate={() => setCreateModalOpen(true)}
          onOpenSettings={() => setSettingsModalOpen(true)}
          onOpenGuidelines={() => setGuidelinesModalOpen(true)}
        />

        {/* Center / Main Content View */}
        <main className="flex-1 min-w-0 pb-20 lg:pb-8">
          {currentView === 'feed' && (
            <>
              <WelcomeHero
                onOpenCreate={() => setCreateModalOpen(true)}
                onOpenAuth={() => setAuthModalOpen(true)}
              />
              <ConfessionFeed
                onSelectConfession={handleSelectConfession}
                onOpenCreate={() => setCreateModalOpen(true)}
                onOpenShare={setShareConfession}
                onOpenReport={(id) => setReportTarget({ type: 'confession', id })}
                onAuthRequired={() => setAuthModalOpen(true)}
                initialCategory={selectedCategory}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
              />
            </>
          )}

          {currentView === 'detail' && selectedConfessionId && (
            <ConfessionDetailView
              confessionId={selectedConfessionId}
              onBack={handleBackToFeed}
              onOpenShare={setShareConfession}
              onOpenReport={(id) => setReportTarget({ type: 'confession', id })}
              onAuthRequired={() => setAuthModalOpen(true)}
              onDeleted={() => handleBackToFeed()}
            />
          )}

          {currentView === 'bookmarks' && (
            <BookmarksView
              onSelectConfession={handleSelectConfession}
              onOpenShare={setShareConfession}
              onOpenReport={(id) => setReportTarget({ type: 'confession', id })}
              onAuthRequired={() => setAuthModalOpen(true)}
              onBack={handleBackToFeed}
            />
          )}

          {currentView === 'my-confessions' && (
            <MyConfessionsView
              onSelectConfession={handleSelectConfession}
              onOpenShare={setShareConfession}
              onOpenReport={(id) => setReportTarget({ type: 'confession', id })}
              onAuthRequired={() => setAuthModalOpen(true)}
              onBack={handleBackToFeed}
              onOpenCreateWithDraft={() => {
                setCreateModalOpen(true);
              }}
            />
          )}

          {currentView === 'explore' && (
            <ExploreView
              onSelectCategory={handleSelectCategory}
              onSearch={handleSearchFromExplore}
            />
          )}
        </main>
      </div>

      {/* Floating Bottom Navigation (Mobile & Tablet) */}
      <MobileNav
        currentView={currentView}
        onSelectView={(v) => {
          setCurrentView(v);
          if (v !== 'detail') setSelectedConfessionId(null);
        }}
        onOpenCreate={() => setCreateModalOpen(true)}
        onOpenSettings={() => setSettingsModalOpen(true)}
        onOpenAuth={() => setAuthModalOpen(true)}
      />

      {/* Modals */}
      <CreateConfessionModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onCreated={(id) => handleSelectConfession(id)}
        onAuthRequired={() => {
          setCreateModalOpen(false);
          setAuthModalOpen(true);
        }}
      />

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
      />

      <SettingsModal
        isOpen={settingsModalOpen}
        onClose={() => setSettingsModalOpen(false)}
        onOpenGuidelines={() => setGuidelinesModalOpen(true)}
      />

      <GuidelinesModal
        isOpen={guidelinesModalOpen}
        onClose={() => setGuidelinesModalOpen(false)}
      />

      {shareConfession && (
        <ShareModal
          isOpen={!!shareConfession}
          onClose={() => setShareConfession(null)}
          confession={shareConfession}
        />
      )}

      {reportTarget && (
        <ReportModal
          isOpen={!!reportTarget}
          onClose={() => setReportTarget(null)}
          targetType={reportTarget.type}
          targetId={reportTarget.id}
        />
      )}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainLayout />
    </AuthProvider>
  );
}
