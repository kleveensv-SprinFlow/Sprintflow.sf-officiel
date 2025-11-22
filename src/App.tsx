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

type Tab = 'accueil' | 'planning' | 'nutrition' | 'groupes' | 'sprinty';

function App() {
  const { user, loading, profile } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState<Tab>('accueil');
  const [isFabOpen, setIsFabOpen] = useState(false);
  const [isWeightModalOpen, setIsWeightModalOpen] = useState(false);

  useEffect(() => {
    const path = location.pathname;
    if (path === '/' || path === '/dashboard') setActiveTab('accueil');
    else if (path.startsWith('/planning')) setActiveTab('planning');
    else if (path.startsWith('/nutrition')) setActiveTab('nutrition');
    else if (path.startsWith('/groups')) setActiveTab('groupes');
    else if (path.startsWith('/sprinty')) setActiveTab('sprinty');
    else setActiveTab('accueil'); // Default
  }, [location.pathname]);

  const handleTabChange = (tab: Tab) => {
    setActiveTab(tab);
    if (tab === 'accueil') navigate('/');
    else if (tab === 'planning') navigate('/planning');
    else if (tab === 'nutrition') navigate('/nutrition');
    else if (tab === 'groupes') navigate('/groups');
    else if (tab === 'sprinty') navigate('/sprinty');
  };

  const handleFabAction = (actionId: string) => {
    setIsFabOpen(false);
    switch (actionId) {
      case 'record':
        navigate('/records/new');
        break;
      case 'workout':
        navigate('/planning/new');
        break;
      case 'sleep':
        navigate('/sleep/add');
        break;
      case 'weight':
        setIsWeightModalOpen(true);
        break;
      default:
        break;
    }
  };

  if (loading) return <LoadingScreen />;

  if (!user) {
    return (
      <>
        <Auth />
        <ToastContainer position="top-right" autoClose={3000} theme="dark" />
      </>
    );
  }

  return (
    <SprintyProvider>
      <div className="min-h-screen bg-sprint-light-background dark:bg-sprint-dark-background text-sprint-light-text-primary dark:text-sprint-dark-text-primary flex flex-col">
        {/* Main Content Area */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto pb-[80px]">
          <Outlet />
        </main>

        {/* Modals */}
        <FabMenu 
          isOpen={isFabOpen} 
          onClose={() => setIsFabOpen(false)} 
          onAction={handleFabAction} 
        />
        
        <WeightEntryModal 
          isOpen={isWeightModalOpen} 
          onClose={() => setIsWeightModalOpen(false)} 
        />

        {/* TabBar */}
        <TabBar
          activeTab={activeTab}
          onTabChange={handleTabChange}
          onFabClick={() => setIsFabOpen(!isFabOpen)}
          userRole={profile?.role as 'athlete' | 'coach'}
          isFabOpen={isFabOpen}
        />
        
        <ToastContainer position="bottom-center" autoClose={3000} theme="dark" />
      </div>
    </SprintyProvider>
  );
}

export default App;
