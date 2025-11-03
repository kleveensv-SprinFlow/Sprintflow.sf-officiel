import { useState, useEffect } from 'react';
import useAuth from './hooks/useAuth.tsx';
import Auth from './components/Auth';
import { LoadingScreen } from './components/LoadingScreen';
import Dashboard from './components/Dashboard';
import TabBar from './components/TabBar';
import { NewWorkoutForm } from './components/workouts/NewWorkoutForm';
import { RecordsForm } from './components/records/RecordsForm';
import { ProfilePage } from './components/profile/ProfilePage';
import { View } from './types';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { SleepForm } from './components/sleep/SleepForm';
import { GroupManagement } from './components/groups/GroupManagement';
import { AthleteGroupView } from './components/groups/AthleteGroupView';
import { SettingsPage } from './components/static/SettingsPage';
import { ContactPage } from './components/static/ContactPage';
import { PartnershipsList } from './components/PartnershipsList';
import Header from './components/navigation/Header';
import { DeveloperPanel } from './components/developer/DeveloperPanel';
import { ChatManager } from './components/chat/ChatManager';
import { AthletePlanning } from './components/planning/AthletePlanning';
import { NutritionModule } from './components/nutrition/NutritionModule';
import { FoodSearchModal } from './components/nutrition/FoodSearchModal';

function App() {
  const { session, loading, profile } = useAuth();
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [isFabOpen, setFabOpen] = useState(false);
  const [showForm, setShowForm] = useState<View | null>(null);

  useEffect(() => {
    const handleViewChange = (event: Event) => {
      const customEvent = event as CustomEvent<View>;
      setCurrentView(customEvent.detail);
    };
    window.addEventListener('change-view', handleViewChange);
    return () => window.removeEventListener('change-view', handleViewChange);
  }, []);

  const handleFabAction = (view: View) => {
    setShowForm(view);
    setFabOpen(false);
  };

  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard userRole={profile?.role as 'athlete' | 'coach'} onViewChange={setCurrentView} />;
      case 'workouts':
        return <AthletePlanning />;
      case 'nutrition':
        return <NutritionModule />;
      case 'ai':
        return <ChatManager />;
      case 'profile':
        return <ProfilePage />;
      case 'groups':
        return profile?.role === 'coach' ? <GroupManagement /> : <AthleteGroupView />;
      case 'settings':
        return <SettingsPage />;
      case 'contact':
        return <ContactPage />;
      case 'partnerships':
        return <PartnershipsList />;
       case 'developer-panel':
        return <DeveloperPanel />;
      case 'chat':
        return <ChatManager />;
      default:
        return <Dashboard userRole={profile?.role as 'athlete' | 'coach'} onViewChange={setCurrentView} />;
    }
  };

  const renderForm = () => {
    switch (showForm) {
      case 'add-workout':
        return <NewWorkoutForm onSave={() => setShowForm(null)} onCancel={() => setShowForm(null)} />;
      case 'add-record':
        return <RecordsForm onClose={() => setShowForm(null)} />;
      case 'add-food':
        return <FoodSearchModal onClose={() => setShowForm(null)} onFoodSelected={() => setShowForm(null)} />;
      case 'sleep':
        return <SleepForm onClose={() => setShowForm(null)} />;
      default:
        return null;
    }
  };

  if (loading) {
    return <LoadingScreen />;
  }

  if (!session) {
    return <Auth />;
  }

  return (
    <div className="bg-gray-100 dark:bg-gray-900 min-h-screen">
      <Header
        userRole={profile?.role as 'athlete' | 'coach'}
        isDashboard={currentView === 'dashboard'}
        title={currentView.charAt(0).toUpperCase() + currentView.slice(1)}
        canGoBack={currentView !== 'dashboard'}
        onBack={() => setCurrentView('dashboard')}
        onProfileClick={() => setCurrentView('profile')}
        onHomeClick={() => setCurrentView('dashboard')}
      />
      <main className="pb-20">
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