import { useState, useEffect, Suspense, lazy } from 'react';
import useAuth from './hooks/useAuth.tsx';
import Auth from './components/Auth';
import { LoadingScreen } from './components/LoadingScreen';
import Dashboard from './components/Dashboard';
import TabBar from './components/TabBar';
import Header from './components/navigation/Header';
import SideMenu from './components/navigation/SideMenu';
import { View } from './types';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useRecords } from './hooks/useRecords';
import { supabase } from './lib/supabase';

// ... (toutes les importations lazy restent les mêmes)

function App() {
  const { session, loading, profile } = useAuth();
  // ... (tous les hooks et états restent les mêmes)

  // ... (toute la logique du composant reste la même)

  return (
    <div className="bg-light-background dark:bg-dark-background text-light-text dark:text-dark-text min-h-screen">
      <Header
        userRole={profile?.role as 'athlete' | 'coach'}
        isDashboard={currentView === 'dashboard'}
        title={currentView.charAt(0).toUpperCase() + currentView.slice(1)}
        canGoBack={currentView !== 'dashboard'}
        onBack={() => setCurrentView('dashboard')}
        onProfileClick={() => setCurrentView('profile')}
        onHomeClick={() => setCurrentView('dashboard')}
        onMenuClick={() => setMenuOpen(true)}
      />
      <SideMenu
        isOpen={isMenuOpen}
        onClose={() => setMenuOpen(false)}
        onNavigate={handleMenuNavigate}
      />
      <main className="pb-20 pt-16 px-4">
        {renderView()}
      </main>
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40">
          {renderForm()}
        </div>
      )}
      <TabBar
        onFabAction={handleFabAction}
        isFabOpen={isFabOpen}
        setFabOpen={setFabOpen}
        currentView={currentView}
        setCurrentView={setCurrentView}
        userRole={profile?.role as 'athlete' | 'coach'}
      />
      <ToastContainer position="bottom-center" theme="dark" />
    </div>
  );
}

export default App;