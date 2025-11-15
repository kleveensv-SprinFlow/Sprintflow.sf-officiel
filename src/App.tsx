import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import useAuth from './hooks/useAuth.tsx';
import Auth from './components/Auth.tsx';
import LoadingScreen from './components/LoadingScreen.tsx';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import TabBar from './components/TabBar.tsx';
import Header from './components/navigation/Header.tsx';
import SideMenu from './components/navigation/SideMenu.tsx';
import { useDailyWelcome } from './hooks/useDailyWelcome.ts';

const viewTitles: Record<string, string> = {
  '/': 'Accueil',
  '/profile': 'Mon Profil',
  '/groups': 'Mon Groupe',
  '/workouts': 'Calendrier',
  '/planning': 'Planning',
  '/planning/new': 'Nouvelle Séance',
  '/nutrition': 'Nutrition',
  '/nutrition/add': 'Ajouter un Repas',
  '/records': 'Performances',
  '/records/new': 'Nouveau Record',
  '/settings': 'Réglages',
  '/contact': 'Contact',
  '/partnerships': 'Partenaires',
  '/developer-panel': 'Dev Panel',
  '/chat': 'Messagerie',
  '/advice': 'Conseils',
  '/sleep': 'Sommeil',
  '/sleep/add': 'Enregistrer le Sommeil',
  '/share-performance': 'Partager un Exploit',
};

function App() {
  const { user, loading, profile } = useAuth();
  const location = useLocation();
  const [isMenuOpen, setMenuOpen] = useState(false);
  const showWelcomeMessage = useDailyWelcome();

  useEffect(() => {
    if (localStorage.getItem('theme') === 'dark' ||
        (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  if (loading) return <LoadingScreen />;
  if (!user) return <Auth />;

  const currentPath = location.pathname;
  const title = viewTitles[currentPath] || 'Accueil';

  return (
    <div className="min-h-screen bg-light-background dark:bg-dark-background text-light-text dark:text-dark-text">
      <Header
        onProfileClick={() => setMenuOpen(true)}
        isDashboard={currentPath === '/'}
        userRole={profile?.role}
        title={title}
        showWelcomeMessage={showWelcomeMessage}
        onHomeClick={() => {}}
      />
      <main className="pb-24 pt-16 px-4">
        <Outlet />
      </main>
      <TabBar userRole={profile?.role} />
      <SideMenu
        isOpen={isMenuOpen}
        onClose={() => setMenuOpen(false)}
      />
      <ToastContainer position="bottom-center" theme="colored" />
    </div>
  );
}

export default App;
