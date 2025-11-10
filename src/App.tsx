// src/App.tsx
import React, { useState, useEffect } from 'react';
import { useAuth } from './hooks/useAuth.tsx';
import { useWorkouts } from './hooks/useWorkouts.ts'; // Importer le hook
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

function App() {
  const { user, loading, profile } = useAuth();
  const { createCompletedWorkout } = useWorkouts(); // Utiliser le hook
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [isFabOpen, setFabOpen] = useState(false);
  const [isMenuOpen, setMenuOpen] = useState(false);

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

  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard />;
      case 'profile':
        return <ProfilePage />;
      case 'records':
        return <RecordsPage />;
      case 'workouts':
        return <AthletePlanning />;
      case 'groups':
        return <GroupManagement />;
      // Vues des formulaires du FAB
      case 'add-workout':
        return (
          <NewWorkoutForm 
            userRole="athlete"
            onSave={async (payload) => {
              // On s'assure que le payload est compatible
              const { tag_seance, type, notes, blocs } = payload;
              if (type !== 'modèle') {
                  await createCompletedWorkout({ tag_seance, type, notes, blocs });
              }
            }}
            onCancel={() => setCurrentView('dashboard')}
          />
        );
      case 'add-record':
        return <RecordsForm onClose={() => setCurrentView('records')} />;
      case 'add-food':
        return <AddFoodForm onClose={() => setCurrentView('dashboard')} />;
      case 'sleep':
        return <SleepForm onClose={() => setCurrentView('dashboard')} />;
      case 'share-performance':
        return <SharePerformancePage onClose={() => setCurrentView('dashboard')} />;
      default:
        return <Dashboard />;
    }
  };

  if (loading) {
    return <LoadingScreen />;
  }

  if (!user) {
    return <Auth />;
  }

  return (
    <div className="min-h-screen bg-light-background dark:bg-dark-background text-light-text dark:text-dark-text transition-colors duration-300">
      <Header 
        onProfileClick={() => setMenuOpen(true)}
        isDashboard={currentView === 'dashboard'}
        userRole={profile?.role}
      />
      <main className="pb-24 pt-16 px-4">
        {renderView()}
      </main>
      <TabBar 
        currentView={currentView}
        setCurrentView={setCurrentView}
        onFabAction={handleFabAction} 
        isFabOpen={isFabOpen} 
        setFabOpen={setFabOpen} 
        userRole={profile?.role}
      />
      <SideMenu 
        isOpen={isMenuOpen}
        onClose={() => setMenuOpen(false)}
        setCurrentView={setCurrentView}
      />
      <ToastContainer 
        position="bottom-center"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />
    </div>
  );
}

export default App;
