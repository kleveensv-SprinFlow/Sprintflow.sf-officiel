import React, { useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import useAuth from './hooks/useAuth.tsx';
import { useTheme } from './hooks/useTheme.ts';
import Auth from './components/Auth.tsx';
import LoadingScreen from './components/LoadingScreen.tsx';
import ProfileLoadError from './components/ProfileLoadError.tsx';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import TabBar from './components/TabBar.tsx';
import Header from './components/navigation/Header.tsx';
import SideMenu from './components/navigation/SideMenu.tsx';
import FabMenu from './components/navigation/FabMenu.tsx';
import WeightEntryModal from './components/dashboard/WeightEntryModal.tsx';
import { useDailyWelcome } from './hooks/useDailyWelcome.ts';
import { usePushNotifications } from './hooks/usePushNotifications.tsx';
import { SprintyProvider, useSprinty } from './context/SprintyContext.tsx';
import SprintyMenu from './components/chat/sprinty/SprintyMenu.tsx';

type Tab = 'accueil' | 'planning' | 'nutrition' | 'groupes' | 'sprinty';

const viewTitles: Record<string, string> = {
  '/': 'Accueil',
  '/profile': 'Mon Profil',
  '/groups': 'Mes Suivis',
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

// Fonction pour mapper le chemin actuel à un onglet actif
const pathToTab = (path: string): Tab => {
  if (path.startsWith('/planning')) return 'planning';
  if (path.startsWith('/nutrition')) return 'nutrition';
  if (path.startsWith('/groups')) return 'groupes';
  if (path.startsWith('/sprinty')) return 'sprinty';
  if (path === '/') return 'accueil';
  return 'accueil'; // Onglet par défaut
};

// Inner App component to consume SprintyContext
function InnerApp() {
  const { user, loading, profile } = useAuth();
  useTheme(); // Initialise et applique le thème
  usePushNotifications(); // Initialise la logique des notifications push
  const location = useLocation();
  const navigate = useNavigate();
  const [isMenuOpen, setMenuOpen] = useState(false);
  const [isFabMenuOpen, setFabMenuOpen] = useState(false);
  const [isWeightModalOpen, setWeightModalOpen] = useState(false);
  const showWelcomeMessage = useDailyWelcome();
  const { isMenuOpen: isSprintyMenuOpen, setMenuOpen: setSprintyMenuOpen } = useSprinty();

  if (loading) return <LoadingScreen />;
  if (!user) return <Auth />;
  if (user && !profile) return <ProfileLoadError userId={user.id} />;

  const currentPath = location.pathname;
  const isSprintyPage = currentPath.startsWith('/sprinty');
  const title = viewTitles[currentPath] || 'Accueil';

  const handleTabChange = (tab: Tab) => {
    switch (tab) {
      case 'accueil': navigate('/'); break;
      case 'planning': navigate('/planning'); break;
      case 'nutrition': navigate('/nutrition'); break;
      case 'groupes': navigate('/groups'); break;
      case 'sprinty': navigate('/sprinty'); break;
    }
  };

  const handleFabClick = () => {
    if (currentPath.startsWith('/sprinty')) {
      // Logic for Sprinty avatar click is handled in TabBar via SprintyContext
      // This handler is for the standard FAB
      return; 
    }
    setFabMenuOpen(!isFabMenuOpen);
  };

  const handleFabAction = (action: string) => {
    setFabMenuOpen(false);
    switch (action) {
      case 'record':
        navigate('/records/new');
        break;
      case 'workout':
        navigate('/planning/new');
        break;
      case 'weight':
        setWeightModalOpen(true);
        break;
      case 'sleep':
        navigate('/sleep/add');
        break;
    }
  };
  
  const showTabBar = ['/', '/planning', '/nutrition', '/groups', '/sprinty', '/records'].includes(currentPath);

  return (
    <div className={`min-h-screen bg-sprint-light-background dark:bg-sprint-dark-background text-sprint-light-text-primary dark:text-sprint-dark-text-primary ${isSprintyPage ? 'flex flex-col' : ''}`}>
      {!isSprintyPage && (
        <Header
          onProfileClick={() => setMenuOpen(true)}
          isDashboard={currentPath === '/'}
          userRole={profile?.role}
          title={title}
          showWelcomeMessage={showWelcomeMessage}
          onHomeClick={() => navigate('/')}
        />
      )}
      <main className={`${isSprintyPage ? 'flex-1 overflow-hidden' : 'pt-0 pb-[100px] min-h-screen'}`}>
        {!isSprintyPage && <div className="h-16" />} {/* Espace pour le header fixe */}
        <div className="px-4">
          <Outlet />
        </div>
      </main>
      
      <FabMenu 
        isOpen={isFabMenuOpen} 
        onClose={() => setFabMenuOpen(false)} 
        onAction={handleFabAction} 
      />
      
      <WeightEntryModal 
        isOpen={isWeightModalOpen} 
        onClose={() => setWeightModalOpen(false)} 
      />

      {showTabBar && (
        <TabBar
          activeTab={pathToTab(currentPath)}
          onTabChange={handleTabChange}
          onFabClick={handleFabClick}
          showPlanningNotification={false}
          showCoachNotification={true}
          userRole={profile?.role}
          isFabOpen={isFabMenuOpen}
        />
      )}
      
      <SprintyMenu isOpen={isSprintyMenuOpen} onClose={() => setSprintyMenuOpen(false)} />

      <SideMenu
        isOpen={isMenuOpen}
        onClose={() => setMenuOpen(false)}
        userRole={profile?.role}
      />
      <ToastContainer position="bottom-center" theme="colored" />
    </div>
  );
}

function App() {
  return (
    <SprintyProvider>
      <InnerApp />
    </SprintyProvider>
  );
}

export default App;
