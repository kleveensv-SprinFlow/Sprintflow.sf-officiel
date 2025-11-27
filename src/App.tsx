import React, { useState } from 'react';
import { useAuth } from './hooks/useAuth';
import TabBar, { Tab } from './components/TabBar';
import Auth from './components/Auth';
import LoadingScreen from './components/LoadingScreen';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { SprintyProvider } from './context/SprintyContext';
import Header from './components/navigation/Header';
import ProfilePage from './components/profile/ProfilePage';
import SettingsPage from './components/profile/SettingsPage';
import { AnimatePresence, motion } from 'framer-motion';
import Dashboard from './components/Dashboard';
import NewWorkoutForm from './components/workouts/NewWorkoutForm';
import MyFollowUpsPage from './components/coach/MyFollowUpsPage';
import MyAthletes360Page from './components/coach/MyAthletes360Page';
import ManagePlanningPage from './components/coach/ManagePlanningPage';
import { ActionType } from './data/actions';
import HubView from './components/hub/HubView';

const SprintyView = () => <div className="p-4 text-white">Sprinty Chat View</div>;

type MainView = 'dashboard' | 'profile' | 'settings';
type ActionView = null | 'new-workout' | 'new-record' | 'my-follow-ups' | 'my-athletes-360' | 'manage-planning';

function App() {
  const { user, loading, profile, profileLoading } = useAuth();
  
  const [mainView, setMainView] = useState<MainView>('dashboard');
  const [activeTab, setActiveTab] = useState<Tab>('accueil');
  const [activeAction, setActiveAction] = useState<ActionView>(null);

  const handleTabChange = (tab: Tab) => {
    setActiveTab(tab);
  };

  const handleAction = (action: ActionView) => {
    setActiveAction(action);
  };

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
  
  const viewVariants = {
    initial: { opacity: 0 },
    in: { opacity: 1 },
    out: { opacity: 0 },
  };

  const pageTransition = {
    type: 'tween',
    ease: 'anticipate',
    duration: 0.4,
  };
  
  const viewTransition = {
    type: 'fade',
    duration: 0.2,
  };

  if (loading) return <LoadingScreen />;
  if (! user) return <><Auth /><ToastContainer /></>;

  const renderDashboardView = () => {
    const userRole = profile?.role as 'athlete' | 'coach';
    switch (activeTab) {
      case 'accueil':
        return <Dashboard userRole={userRole} onViewChange={() => {}} isLoading={profileLoading} />;
      case 'hub':
        return (
          <HubView 
            onAction={(actionId: ActionType) => {
              handleAction(actionId as ActionView);
            }}
          />
        );
      case 'sprinty':
        return <SprintyView />;
      default:
        return <Dashboard userRole={userRole} onViewChange={() => {}} isLoading={profileLoading} />;
    }
  }

  return (
    <SprintyProvider>
      <div className="min-h-screen bg-sprint-light-background dark:bg-sprint-dark-background text-sprint-light-text-primary dark:text-sprint-dark-text-primary flex flex-col overflow-hidden">
        
        <Header currentView={mainView} onNavigate={handleNavigation} isLoading={profileLoading} />

        <main className="flex-1 pt-[60px] pb-[64px] overflow-y-auto">
          <AnimatePresence mode="wait">
            {mainView === 'dashboard' && ! activeAction && (
              <motion.div key={activeTab} initial="initial" animate="in" exit="out" variants={viewVariants} transition={viewTransition}>
                {renderDashboardView()}
              </motion.div>
            )}
            {mainView === 'profile' && (
              <motion. div key="profile" initial="initial" animate="in" exit="out" variants={pageVariants} transition={pageTransition}>
                <ProfilePage />
              </motion. div>
            )}
            {mainView === 'settings' && (
              <motion.div key="settings" initial="initial" animate="in" exit="out" variants={pageVariants} transition={pageTransition}>
                <SettingsPage />
              </motion.div>
            )}
             {mainView === 'dashboard' && activeAction === 'new-workout' && (
              <motion. div key="new-workout" initial="initial" animate="in" exit="out" variants={pageVariants} transition={pageTransition}>
                <NewWorkoutForm onClose={() => handleAction(null)} />
              </motion.div>
            )}
            {mainView === 'dashboard' && activeAction === 'my-follow-ups' && (
              <motion.div key="my-follow-ups" initial="initial" animate="in" exit="out" variants={pageVariants} transition={pageTransition}>
                <MyFollowUpsPage onBack={() => handleAction(null)} />
              </motion.div>
            )}
            {mainView === 'dashboard' && activeAction === 'my-athletes-360' && (
              <motion.div key="my-athletes-360" initial="initial" animate="in" exit="out" variants={pageVariants} transition={pageTransition}>
                <MyAthletes360Page onBack={() => handleAction(null)} />
              </motion. div>
            )}
            {mainView === 'dashboard' && activeAction === 'manage-planning' && (
              <motion.div key="manage-planning" initial="initial" animate="in" exit="out" variants={pageVariants} transition={pageTransition}>
                <ManagePlanningPage onBack={() => handleAction(null)} />
              </motion.div>
            )}
          </AnimatePresence>
        </main>
        
        <AnimatePresence>
          {mainView === 'dashboard' && (
            <motion.div initial={{ opacity: 0}} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <TabBar
                activeTab={activeTab}
                onTabChange={handleTabChange}
                userRole={profile?.role as 'athlete' | 'coach'}
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