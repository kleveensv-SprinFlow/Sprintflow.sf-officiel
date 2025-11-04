import { useState, useEffect, Suspense, lazy } from 'react';
import useAuth from './hooks/useAuth.tsx';
import Auth from './components/Auth';
import { LoadingScreen } from './components/LoadingScreen';
import Dashboard from './components/Dashboard';
import TabBar from './components/TabBar';
import Header from './components/navigation/Header';
import { View } from './types';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useRecords } from './hooks/useRecords';

// Lazy loading des composants lourds
const AthletePlanning = lazy(() => import('./components/planning/AthletePlanning').then(m => ({ default: m.AthletePlanning || m.default })));
const CoachPlanning = lazy(() => import('./components/planning/CoachPlanning').then(m => ({ default: m.CoachPlanning || m.default })));
const NutritionModule = lazy(() => import('./components/nutrition/NutritionModule').then(m => ({ default: m.NutritionModule || m.default })));
const AdvicePage = lazy(() => import('./components/advice/AdvicePage').then(m => ({ default: m.AdvicePage || m.default })));
const ProfilePage = lazy(() => import('./components/profile/ProfilePage').then(m => ({ default: m.ProfilePage || m.default })));
const GroupManagement = lazy(() => import('./components/groups/GroupManagement').then(m => ({ default: m.GroupManagement || m.default })));
const AthleteGroupView = lazy(() => import('./components/groups/AthleteGroupView').then(m => ({ default: m.AthleteGroupView || m.default })));
const SettingsPage = lazy(() => import('./components/static/SettingsPage').then(m => ({ default: m.SettingsPage || m.default })));
const ContactPage = lazy(() => import('./components/static/ContactPage').then(m => ({ default: m.ContactPage || m.default })));
const PartnershipsList = lazy(() => import('./components/PartnershipsList').then(m => ({ default: m.PartnershipsList || m.default })));
const DeveloperPanel = lazy(() => import('./components/developer/DeveloperPanel').then(m => ({ default: m.DeveloperPanel || m.default })));
const ChatManager = lazy(() => import('./components/chat/ChatManager').then(m => ({ default: m.ChatManager || m.default })));

// Lazy loading des formulaires
const NewWorkoutForm = lazy(() => import('./components/workouts/NewWorkoutForm').then(m => ({ default: m.NewWorkoutForm })));
const RecordsForm = lazy(() => import('./components/records/RecordsForm').then(m => ({ default: m.RecordsForm })));
const FoodSearchModal = lazy(() => import('./components/nutrition/FoodSearchModal').then(m => ({ default: m.FoodSearchModal })));
const SleepForm = lazy(() => import('./components/sleep/SleepForm').then(m => ({ default: m.SleepForm })));
const ShareView = lazy(() => import('./components/sharing/ShareView').then(m => ({ default: m.default })));

function App() {
  const { session, loading, profile } = useAuth();
  const { records, saveRecord } = useRecords();
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
    const viewComponent = (() => {
      switch (currentView) {
        case 'dashboard':
          return <Dashboard userRole={profile?.role as 'athlete' | 'coach'} onViewChange={setCurrentView} />;
        case 'workouts':
          return profile?.role === 'coach' ? <CoachPlanning /> : <AthletePlanning />;
        case 'nutrition':
          return <NutritionModule />;
        case 'ai':
          return <AdvicePage onNavigate={setCurrentView} />;
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
    })();

    return currentView === 'dashboard' ? viewComponent : (
      <Suspense fallback={<LoadingScreen />}>
        {viewComponent}
      </Suspense>
    );
  };

  const handleSaveRecord = async (record: any) => {
    try {
      await saveRecord(record);
      toast.success('Record enregistré avec succès !');
      setShowForm(null);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde du record:', error);
      toast.error('Erreur lors de la sauvegarde du record');
    }
  };

  const renderForm = () => {
    const formComponent = (() => {
      switch (showForm) {
        case 'add-workout':
          return <NewWorkoutForm onSave={() => setShowForm(null)} onCancel={() => setShowForm(null)} />;
        case 'add-record':
          return <RecordsForm records={records} onSave={handleSaveRecord} onCancel={() => setShowForm(null)} />;
        case 'add-food':
          return <FoodSearchModal onClose={() => setShowForm(null)} onFoodSelected={() => setShowForm(null)} />;
        case 'sleep':
          return <SleepForm onClose={() => setShowForm(null)} />;
        case 'share-performance':
          return <ShareView onClose={() => setShowForm(null)} />;
        default:
          return null;
      }
    })();

    return formComponent ? (
      <Suspense fallback={<LoadingScreen />}>
        {formComponent}
      </Suspense>
    ) : null;
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