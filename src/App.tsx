// src/App.tsx
import React, { useState, useEffect } from 'react';
import { useAuth } from './hooks/useAuth.tsx';
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

function App() {
  const { user, loading, profile } = useAuth();
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [isFabOpen, setFabOpen] = useState(false);

  useEffect(() => {
    // Gère le thème au chargement
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
      case 'new-workout':
        return <NewWorkoutForm onClose={() => setCurrentView('dashboard')} />;
      case 'groups':
        return <GroupManagement />;
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
    // --- MODIFICATION PRINCIPALE ICI ---
    <div className="min-h-screen bg-light-background dark:bg-dark-background text-light-text dark:text-dark-text transition-colors duration-300">
      <Header onProfileClick={() => setCurrentView('profile')} />
      <main className="pb-24 pt-16 px-4">
        {renderView()}
      </main>
      <TabBar 
        onFabAction={handleFabAction} 
        isFabOpen={isFabOpen} 
        setFabOpen={setFabOpen} 
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
