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

// Lazy loading des composants lourds
const Styleguide = lazy(() => import('./pages/Styleguide'));
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
const RecordsList = lazy(() => import('./components/records/RecordsList').then(m => ({ default: m.RecordsList })));
const FoodSearchModal = lazy(() => import('./components/nutrition/FoodSearchModal').then(m => ({ default: m.FoodSearchModal })));
const SleepForm = lazy(() => import('./components/sleep/SleepForm').then(m => ({ default: m.SleepForm })));
const ShareView = lazy(() => import('./components/sharing/ShareView').then(m => ({ default: m.default })));

function App() {
  const { session, loading, profile } = useAuth();
  const { records, saveRecord } = useRecords();
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [isFabOpen, setFabOpen] = useState(false);
  const [showForm, setShowForm] = useState<View | null>(null);
  const [isConfirmingEmail, setIsConfirmingEmail] = useState(false);
  const [isMenuOpen, setMenuOpen] = useState(false);

  const handleMenuNavigate = (view: View) => {
    setCurrentView(view);
    setMenuOpen(false);
  };

  useEffect(() => {
    const handleEmailConfirmation = async () => {
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      const accessToken = hashParams.get('access_token');
      const type = hashParams.get('type');
      const refreshToken = hashParams.get('refresh_token');

      console.log('🔍 [App] Vérification des paramètres URL:', {
        hasHash: !!window.location.hash,
        type,
        hasAccessToken: !!accessToken,
        hasRefreshToken: !!refreshToken,
      });

      if (type === 'signup' && accessToken && refreshToken) {
        console.log('📧 [App] Détection d\'une confirmation d\'email valide...');
        setIsConfirmingEmail(true);

        try {
          console.log('⏳ [App] Création de la session Supabase...');
          const { data, error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });

          if (error) {
            console.error('❌ [App] Erreur lors de la confirmation:', error);
            toast.error(`Erreur: ${error.message || 'Impossible de confirmer votre email'}`, {
              autoClose: 5000,
            });
          } else {
            console.log('✅ [App] Email confirmé avec succès! User ID:', data?.session?.user?.id);
            toast.success('Votre email a été confirmé avec succès! Bienvenue sur SprintFlow.', {
              autoClose: 3000,
            });
            window.history.replaceState({}, document.title, '/');
          }
        } catch (err: any) {
          console.error('❌ [App] Exception lors de la confirmation:', err);
          toast.error(`Erreur inattendue: ${err.message || 'Veuillez réessayer'}`, {
            autoClose: 5000,
          });
        } finally {
          setIsConfirmingEmail(false);
        }
      }
    };

    handleEmailConfirmation();
  }, []);

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
          return <AthletePlanning />;
        case 'planning':
          return profile?.role === 'coach' ? <CoachPlanning /> : <AthletePlanning />;
        case 'nutrition':
          return <NutritionModule />;
        case 'ai':
          return <AdvicePage onNavigate={setCurrentView} />;
        case 'profile':
          return <ProfilePage />;
        case 'records':
          return <RecordsList onAddRecord={() => setShowForm('add-record')} />;
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
      closeForm();
    } catch (error) {
      console.error('Erreur lors de la sauvegarde du record:', error);
      toast.error('Erreur lors de la sauvegarde du record');
    }
  };

  const handleSaveWorkout = async (workoutData: any) => {
    try {
      if (workoutData.workoutId) {
        await completeWorkout(workoutData.workoutId, {
          workout_data: { blocs: workoutData.blocs },
          notes: workoutData.notes,
          rpe: 5,
        });
        toast.success('Performances enregistrées !');
      } else {
        await createCompletedWorkout({
          tag_seance: workoutData.tag_seance,
          type: workoutData.type,
          notes: workoutData.notes,
          blocs: workoutData.blocs,
        });
        toast.success('Nouvelle séance enregistrée !');
      }
      closeForm();
    } catch (error: any) {
      console.error("Erreur lors de la sauvegarde de la séance:", error);
      toast.error(`Erreur: ${error.message}`);
    }
  };

  const renderForm = () => {
    const formComponent = (() => {
      switch (showForm) {
        case 'add-workout':
          const initialData = workoutToComplete ? {
            id: workoutToComplete.id,
            tag_seance: workoutToComplete.tag_seance,
            blocs: workoutToComplete.planned_data.blocs,
            type: workoutToComplete.type,
            notes: workoutToComplete.notes
          } : undefined;

          return (
            <NewWorkoutForm
              userRole={profile?.role as 'athlete' | 'coach'}
              onSave={handleSaveWorkout}
              onCancel={closeForm}
              initialData={initialData}
            />
          );
        case 'add-record':
          return <RecordsForm records={records} onSave={handleSaveRecord} onCancel={closeForm} />;
        case 'add-food':
          return <FoodSearchModal onClose={closeForm} onFoodSelected={closeForm} />;
        case 'sleep':
          return <SleepForm onClose={closeForm} />;
        case 'share-performance':
          return <ShareView onClose={closeForm} />;
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

  if (window.location.pathname === '/styleguide') {
    return <Suspense fallback={<LoadingScreen />}><Styleguide /></Suspense>;
  }

  if (loading || isConfirmingEmail) {
    return <LoadingScreen />;
  }

  if (!session) {
    return <Auth />;
  }

  return (
    <div className="bg-transparent min-h-screen">
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