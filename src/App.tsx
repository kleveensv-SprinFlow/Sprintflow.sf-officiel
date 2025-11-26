import React, { useState, useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import TabBar from './components/TabBar';
import Auth from './components/Auth';
import LoadingScreen from './components/LoadingScreen';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { SprintyProvider } from './context/SprintyContext';
import FabMenu from './components/navigation/FabMenu';
import WeightEntryModal from './components/dashboard/WeightEntryModal';
import Header from './components/navigation/Header';
import ProfilePage from './components/profile/ProfilePage';
import SettingsPage from './components/profile/SettingsPage';
import { AnimatePresence, motion } from 'framer-motion';

type Tab = 'accueil' | 'planning' | 'nutrition' | 'groupes' | 'sprinty';
type MainView = 'dashboard' | 'profile' | 'settings';

function App() {
  const { user, loading, profile } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  
  // Nouvel état pour gérer la navigation plein écran
  const [mainView, setMainView] = useState<MainView>('dashboard');

  // Logique existante pour la TabBar
  const [activeTab, setActiveTab] = useState<Tab>('accueil');
  const [isFabOpen, setIsFabOpen] = useState(false);
  const [isWeightModalOpen, setIsWeightModalOpen] = useState(false);

  useEffect(() => {
    const path = location.pathname;
    if (path === '/' || path.startsWith('/dashboard')) setActiveTab('accueil');
    // ... autre logique de TabBar
  }, [location.pathname]);

  const handleFabAction = (actionId: string) => {
    // ... logique du FAB
  };

  // --- NOUVELLE LOGIQUE DE NAVIGATION ---
  const handleNavigation = (target: 'profile' | 'settings' | 'back') => {
    if (target === 'back') {
      if (mainView === 'settings') setMainView('profile');
      else if (mainView === 'profile') setMainView('dashboard');
    } else {
      setMainView(target);
    }
  };

  const pageVariants = {
    initial: { opacity: 0, x: '100%' },
    in: { opacity: 1, x: 0 },
    out: { opacity: 0, x: '-50%' },
  };

  const pageTransition = {
    type: 'tween',
    ease: 'anticipate',
    duration: 0.4,
  };

  // Le LoadingScreen et l'Auth restent inchangés
  if (loading) return <LoadingScreen />;
  if (!user) return <><Auth /><ToastContainer /></>;

  return (
    <SprintyProvider>
      <div className="min-h-screen bg-sprint-light-background dark:bg-sprint-dark-background text-sprint-light-text-primary dark:text-sprint-dark-text-primary flex flex-col overflow-hidden">
        
        <Header currentView={mainView} onNavigate={handleNavigation} />

        <main className="flex-1 pt-[60px] overflow-y-auto">
          <AnimatePresence mode="wait">
            {mainView === 'dashboard' && (
              <motion.div key="dashboard" initial="initial" animate="in" exit="out" variants={pageVariants} transition={pageTransition}>
                <Outlet />
              </motion.div>
            )}
            {mainView === 'profile' && (
              <motion.div key="profile" initial="initial" animate="in" exit="out" variants={pageVariants} transition={pageTransition}>
                <ProfilePage />
              </motion.div>
            )}
            {mainView === 'settings' && (
              <motion.div key="settings" initial="initial" animate="in" exit="out" variants={pageVariants} transition={pageTransition}>
                <SettingsPage />
              </motion.div>
            )}
          </AnimatePresence>
        </main>
        
        {/* Les modales et la TabBar ne s'affichent que sur le dashboard */}
        <AnimatePresence>
          {mainView === 'dashboard' && (
            <motion.div initial={{ opacity: 0}} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <FabMenu isOpen={isFabOpen} onClose={() => setIsFabOpen(false)} onAction={handleFabAction} />
              <WeightEntryModal isOpen={isWeightModalOpen} onClose={() => setIsWeightModalOpen(false)} />
              <TabBar
                activeTab={activeTab}
                onTabChange={(tab) => navigate(tab === 'accueil' ? '/' : `/${tab}`)}
                onFabClick={() => setIsFabOpen(!isFabOpen)}
                userRole={profile?.role as 'athlete' | 'coach'}
                isFabOpen={isFabOpen}
              />
            </motion.div>
          )}
        </AnimatePresence>
        
        <ToastContainer position="bottom-center" autoClose={3000} theme="dark" />
      </div>
    </SprintyProvider>
  );
}

export default App;
