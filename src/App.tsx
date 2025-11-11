import React, { useState, useEffect } from 'react';
import useAuth from './hooks/useAuth.tsx';
import { useWorkouts } from './hooks/useWorkouts.ts';
import Auth from './components/Auth.tsx';
import Dashboard from './components/Dashboard.tsx';
import LoadingScreen from './components/LoadingScreen.tsx';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { View } from './types/index.ts';
import ProfilePage from './components/profile/ProfilePage.tsx';
import NewWorkoutForm from './components/workouts/NewWorkoutForm.tsx';
import TabBar from './components/TabBar.tsx';
import Header from './components/navigation/Header.tsx';
import GroupManagement from './components/groups/GroupManagement.tsx';
import SideMenu from './components/navigation/SideMenu.tsx';
import RecordsPage from './components/records/RecordsPage.tsx';
import { AthletePlanning } from './components/planning/AthletePlanning.tsx';
import { RecordsForm } from './components/records/RecordsForm.tsx';
import AddFoodForm from './components/nutrition/AddFoodForm.tsx';
import { SleepForm } from './components/sleep/SleepForm.tsx';
import SharePerformancePage from './components/sharing/SharePerformancePage.tsx';
import { useDailyWelcome } from './hooks/useDailyWelcome.ts';

const viewTitles: Record<View, string> = {
  dashboard: 'Accueil',
  profile: 'Mon Profil',
  groups: 'Mon Groupe',
  workouts: 'Calendrier',
  planning: 'Planning',
  nutrition: 'Nutrition',
  records: 'Performances',
  settings: 'Réglages',
  'add-workout': 'Nouvelle Séance',
  'add-record': 'Nouveau Record',
  'add-food': 'Ajouter un Repas',
  'add-sleep': 'Enregistrer le Sommeil',
  'share-performance': 'Partager un Exploit',
  ai: 'AI Coach',
  contact: 'Contact',
  partnerships: 'Partenaires',
  'developer-panel': 'Dev Panel',
  chat: 'Messagerie',
  advice: 'Conseils',
  partners: 'Partenaires',
  sleep: 'Sommeil',
};

function App() {
  const { user, loading, profile } = useAuth();
  const { createCompletedWorkout } = useWorkouts();
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [isFabOpen, setFabOpen] = useState(false);
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

  const handleFabAction = (view: View) => {
    setCurrentView(view);
    setFabOpen(false); 
  };
  
  const handleSetCurrentView = (view: View) => {
    if (view !== currentView) {
      setCurrentView(view);
    }
  };

  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard userRole={profile?.role} onViewChange={handleSetCurrentView} />;
      case 'profile':
        return <ProfilePage />;
      // ... (autres cas)
      default:
        return <Dashboard />;
    }
  };

  if (loading) return <LoadingScreen />;
  if (!user) return <Auth />;

  return (
    <div className="min-h-screen bg-light-background dark:bg-dark-background text-light-text dark:text-dark-text">
      <Header 
        onProfileClick={() => setMenuOpen(true)}
        isDashboard={currentView === 'dashboard'}
        userRole={profile?.role}
        title={viewTitles[currentView] || ''}
        showWelcomeMessage={showWelcomeMessage}
        onHomeClick={() => handleSetCurrentView('dashboard')}
      />
      <main className="pb-24 pt-16 px-4">
        {renderView()}
      </main>
      <TabBar 
        currentView={currentView}
        setCurrentView={handleSetCurrentView}
        onFabAction={handleFabAction} 
        isFabOpen={isFabOpen} 
        setFabOpen={setFabOpen} 
        userRole={profile?.role}
      />
      <SideMenu 
        isOpen={isMenuOpen}
        onClose={() => setMenuOpen(false)}
        setCurrentView={handleSetCurrentView}
      />
      <ToastContainer position="bottom-center" theme="colored" />
    </div>
  );
}

export default App;