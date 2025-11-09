import { useState, useEffect, Suspense, lazy } from 'react';
import useAuth from './hooks/useAuth.tsx';
import Auth from './components/Auth.tsx';
import { LoadingScreen } from './components/LoadingScreen.tsx';
import Dashboard from './components/Dashboard.tsx';
import TabBar from './components/TabBar.tsx';
import Header from './components/navigation/Header.tsx';
import SideMenu from './components/navigation/SideMenu.tsx';
import { WelcomeAnimation } from './components/navigation/WelcomeAnimation.tsx';
import { View } from './types';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useRecords } from './hooks/useRecords.ts';
import { supabase } from './lib/supabase.ts';
import UpdateNotification from './components/common/UpdateNotification.tsx';

// Lazy loading des composants lourds
const Styleguide = lazy(() => import('./pages/Styleguide.tsx'));
const AthletePlanning = lazy(() => import('./components/planning/AthletePlanning.tsx').then(m => ({ default: m.AthletePlanning || m.default })));
const CoachPlanning = lazy(() => import('./components/planning/CoachPlanning.tsx').then(m => ({ default: m.CoachPlanning || m.default })));
const NutritionModule = lazy(() => import('./components/nutrition/NutritionModule.tsx').then(m => ({ default: m.NutritionModule || m.default })));
const AdvicePage = lazy(() => import('./components/advice/AdvicePage.tsx').then(m => ({ default: m.AdvicePage || m.default })));
const ProfilePage = lazy(() => import('./components/profile/ProfilePage.tsx').then(m => ({ default: m.ProfilePage || m.default })));
const GroupManagement = lazy(() => import('./components/groups/GroupManagement.tsx').then(m => ({ default: m.GroupManagement || m.default })));
const AthleteGroupView = lazy(() => import('./components/groups/AthleteGroupView.tsx').then(m => ({ default: m.AthleteGroupView || m.default })));
const SettingsPage = lazy(() => import('./components/static/SettingsPage.tsx').then(m => ({ default: m.SettingsPage || m.default })));
const ContactPage = lazy(() => import('./components/static/ContactPage.tsx').then(m => ({ default: m.ContactPage || m.default })));
const PartnershipsList = lazy(() => import('./components/PartnershipsList.tsx').then(m => ({ default: m.PartnershipsList || m.default })));
const DeveloperPanel = lazy(() => import('./components/developer/DeveloperPanel.tsx').then(m => ({ default: m.DeveloperPanel || m.default })));
const ChatManager = lazy(() => import('./components/chat/ChatManager.tsx').then(m => ({ default: m.ChatManager || m.default })));

// Lazy loading des formulaires
const NewWorkoutForm = lazy(() => import('./components/workouts/NewWorkoutForm.tsx').then(m => ({ default: m.NewWorkoutForm })));
const RecordsForm = lazy(() => import('./components/records/RecordsForm.tsx').then(m => ({ default: m.RecordsForm || m.default })));
const RecordsList = lazy(() => import('./components/records/RecordsList.tsx').then(m => ({ default: m.RecordsList || m.default })));
const FoodSearchModal = lazy(() => import('./components/nutrition/FoodSearchModal.tsx').then(m => ({ default: m.FoodSearchModal || m.default })));
const SleepForm = lazy(() => import('./components/sleep/SleepForm.tsx').then(m => ({ default: m.SleepForm || m.default })));
const ShareView = lazy(() => import('./components/sharing/ShareView.tsx').then(m => ({ default: m.default })));

function App() {
  const { session, loading, profile } = useAuth();
  const { records, saveRecord } = useRecords();
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [isFabOpen, setFabOpen] = useState(false);
  const [showForm, setShowForm] = useState<View | null>(null);
  const [isConfirmingEmail, setIsConfirmingEmail] = useState(false);
  const [isMenuOpen, setMenuOpen] = useState(false);
  const [isSideMenuOpen, setIsSideMenuOpen] = useState(false);
  const [showWelcome, setShowWelcome] = useState(true);
  const [hasShownWelcome, setHasShownWelcome] = useState(false);

  const handleMenuNavigate = (view: View) => {
    setCurrentView(view);
    setIsSideMenuOpen(false);
  };

  useEffect(() => {
    const handleEmailConfirmation = async () => {
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      const accessToken = hashParams.get('access_token');
      const type = hashParams.get('type');
      const refreshToken = hashParams.get('refresh_token');

      if (type === 'signup' && accessToken && refreshToken) {
        setIsConfirmingEmail(true);
        try {
          const { error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });
          if (error) {
            toast.error(`Erreur: ${error.message || 'Impossible de confirmer votre email'}`);
          } else {
            toast.success('Votre email a été confirmé avec succès!');
            window.history.replaceState({}, document.title, '/');
          }
        } catch (err: any) {
          toast.error(`Erreur inattendue: ${err.message || 'Veuillez réessayer'}`);
        } finally {
          setIsConfirmingEmail(false);
        }
      }
    };
    handleEmailConfirmation();
  }, []);

  useEffect(() => {
    const handleViewChange = (event: Event) => {
      setCurrentView((event as CustomEvent<View>).detail);
    };
    window.addEventListener('change-view', handleViewChange);
    return () => window.removeEventListener('change-view', handleViewChange);
  }, []);

  useEffect(() => {
    if (session && !loading && !hasShownWelcome && currentView === 'dashboard') {
      setShowWelcome(true);
      setHasShownWelcome(true);
    }
  }, [session, loading, hasShownWelcome, currentView]);

  const handleFabAction = (view: View) => {
    setShowForm(view);
    setFabOpen(false);
  };

  const closeForm = () => setShowForm(null);

  const mainViews: View[] = ['dashboard', 'workouts', 'nutrition', 'groups', 'planning', 'chat'];

  const viewTitles: Record<View, string> = {
      dashboard: 'Accueil',
      workouts: 'Calendrier',
      planning: 'Planning',
      nutrition: 'Nutrition',
      ai: 'Conseils',
      profile: 'Mon Profil',
      records: 'Mes Records',
      groups: 'Mon Groupe',
      settings: 'Réglages',
      contact: 'Contact',
      partnerships: 'Partenaires',
      'developer-panel': 'Développeur',
      chat: 'Messages',
  };

  const headerTitle = viewTitles[currentView] || currentView.charAt(0).toUpperCase() + currentView.slice(1);

  const renderView = () => {
    const commonProps = { userRole: profile?.role as 'athlete' | 'coach', onViewChange: setCurrentView };
    const viewMap: Record<View, React.ReactNode> = {
      dashboard: <Dashboard {...commonProps} />,
      workouts: <AthletePlanning />,
      planning: profile?.role === 'coach' ? <CoachPlanning /> : <AthletePlanning />,
      nutrition: <NutritionModule />,
      ai: <AdvicePage onNavigate={setCurrentView} />,
      profile: <ProfilePage />,
      records: <RecordsList onAddRecord={() => setShowForm('add-record')} />,
      groups: profile?.role === 'coach' ? <GroupManagement /> : <AthleteGroupView />,
      settings: <SettingsPage />,
      contact: <ContactPage />,
      partnerships: <PartnershipsList />,
      'developer-panel': <DeveloperPanel />,
      chat: <ChatManager />,
    };
    const viewComponent = viewMap[currentView] || <Dashboard {...commonProps} />;
    return <Suspense fallback={<LoadingScreen />}>{viewComponent}</Suspense>;
  };
  
  const handleSaveRecord = async (record: any) => {
    try {
      await saveRecord(record);
      toast.success('Record enregistré avec succès !');
      closeForm();
    } catch (error) {
      toast.error('Erreur lors de la sauvegarde du record');
    }
  };

  const renderForm = () => {
    if (!showForm) return null;
    const formMap: Record<string, React.ReactNode> = {
      'add-workout': <NewWorkoutForm userRole={profile?.role as any} onSave={closeForm} onCancel={closeForm} />,
      'add-record': <RecordsForm records={records} onSave={handleSaveRecord} onCancel={closeForm} />,
      'add-food': <FoodSearchModal onClose={closeForm} onFoodSelected={closeForm} />,
      'sleep': <SleepForm onClose={closeForm} />,
      'share-performance': <ShareView onClose={closeForm} />,
    };
    return <Suspense fallback={<LoadingScreen />}>{formMap[showForm]}</Suspense>;
  };

  if (loading || isConfirmingEmail) return <LoadingScreen />;
  if (!session) return <Auth />;

  return (
    <div className="bg-light-background dark:bg-dark-background text-light-text dark:text-dark-text min-h-screen">
      <Header
        userRole={profile?.role as any}
        isDashboard={currentView === 'dashboard'}
        title={headerTitle}
        canGoBack={!mainViews.includes(currentView)}
        onBack={() => setCurrentView('dashboard')}
        onProfileClick={() => setIsSideMenuOpen(true)}
        onHomeClick={() => setCurrentView('dashboard')}
        showWelcome={showWelcome && hasShownWelcome}
      />
      <SideMenu isOpen={isSideMenuOpen} onClose={() => setIsSideMenuOpen(false)} onNavigate={handleMenuNavigate} />
      <main className="pb-20 pt-16 px-4">{renderView()}</main>
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40">{renderForm()}</div>
      )}
      <TabBar
        onFabAction={handleFabAction}
        isFabOpen={isFabOpen}
        setFabOpen={setFabOpen}
        currentView={currentView}
        setCurrentView={setCurrentView}
        userRole={profile?.role as any}
      />
      <UpdateNotification />
      <ToastContainer position="bottom-center" theme="dark" />
    </div>
  );
}

export default App;