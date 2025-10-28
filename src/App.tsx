import React, { useState, useEffect } from 'react';
import { View } from './types';
import useAuth from './hooks/useAuth';
import { useWorkouts } from './hooks/useWorkouts';
import { useRecords } from './hooks/useRecords';
import { useBodyComposition } from './hooks/useBodyComposition';

// Components
import Auth from './components/Auth';
import { LoadingScreen } from './components/LoadingScreen';
import Header from './components/navigation/Header';
import TabBar from './components/TabBar';
import Dashboard from './components/Dashboard';
import { WorkoutsList } from './components/workouts/WorkoutsList';
import { NewWorkoutForm } from './components/workouts/NewWorkoutForm';
import { RecordsList } from './components/records/RecordsList';
import { RecordsForm } from './components/records/RecordsForm';
import { BodyCompCharts } from './components/bodycomp/BodyCompCharts';
import { BodyCompForm } from './components/bodycomp/BodyCompForm';
import { DetailedAnalysis } from './components/advice/DetailedAnalysis';
import { AthleteGroupView } from './components/groups/AthleteGroupView';
import { GroupManagement } from './components/groups/GroupManagement';
import { CoachPlanning } from './components/planning/CoachPlanning';
import { AthletePlanning } from './components/planning/AthletePlanning';
import { PWAInstallPrompt } from './components/PWAInstallPrompt';
import { ProfilePage } from './components/profile/ProfilePage';
import { CoachGroupChat } from './components/groups/CoachGroupChat';
import { PartnershipsList } from './components/PartnershipsList';
import { DeveloperPanel } from './components/developer/DeveloperPanel';
import { NotificationDisplay } from './components/NotificationDisplay';
import { NutritionModule } from './components/nutrition/NutritionModule';
import { SleepForm } from './components/sleep/SleepForm';
import { getViewTitle } from './utils/navigation';

function App() {
  const { user, profile, loading, error } = useAuth();
  const { workouts, saveWorkout, updateWorkout } = useWorkouts();
  const { records, saveRecord } = useRecords();
  const { bodyComps, saveBodyComposition } = useBodyComposition();
  const [navigationStack, setNavigationStack] = useState<View[]>(['dashboard']);
  const currentView = navigationStack[navigationStack.length - 1];
  const [editingWorkout, setEditingWorkout] = useState<any>(null);
  const [appError, setAppError] = useState<string | null>(null);
  const [refreshScores, setRefreshScores] = useState<(() => Promise<void>) | null>(null);
  const [forceShowAuth, setForceShowAuth] = useState(false);

  // Timeout de sécurité : forcer l'affichage après 5 secondes
  useEffect(() => {
    console.log('🕐 [App] État loading:', loading);
    if (loading) {
      const timeout = setTimeout(() => {
        console.warn('⚠️ [App] Timeout atteint (5s), forçage affichage auth');
        setForceShowAuth(true);
      }, 5000);
      return () => clearTimeout(timeout);
    }
  }, [loading]);

  const navigateTo = (view: View) => {
    setNavigationStack([...navigationStack, view]);
  };

  const navigateBack = () => {
    if (navigationStack.length > 1) {
      setNavigationStack(navigationStack.slice(0, -1));
    }
  };

  // Gestionnaire d'erreur global
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      console.error('Erreur globale capturée:', event.error);
      
      // Ignorer certaines erreurs non critiques
      if (event.error?.message?.includes('infinite recursion') || 
          event.error?.message?.includes('Auth session missing')) {
        return;
      }
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      console.error('Promise rejetée:', event.reason);
      
      // Ignorer certaines erreurs non critiques
      if (event.reason?.message?.includes('infinite recursion') || 
          event.reason?.message?.includes('Auth session missing')) {
        event.preventDefault();
        return;
      }
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);

  // Écouter les événements de changement de vue
  useEffect(() => {
    const handleViewChange = (event: any) => {
      if (event.detail) {
        navigateTo(event.detail);
      }
    };
    
    window.addEventListener('change-view', handleViewChange);
    
    return () => {
      window.removeEventListener('change-view', handleViewChange);
    };
  }, [navigationStack]);

  // Afficher l'écran de chargement pendant l'initialisation
  if (loading && !forceShowAuth) {
    return <LoadingScreen message="Initialisation de l'application..." />;
  }

  // Afficher l'écran d'authentification si pas d'utilisateur
  if (!user || forceShowAuth) {
    console.log('🔐 Pas d\'utilisateur - Affichage Auth');
    return <Auth />;
  }

  // Déterminer le rôle avec fallback sécurisé
  const userRole = profile?.role || 'athlete';
  const isDeveloper = user?.id === '75a17559-b45b-4dd1-883b-ce8ccfe03f0f';
  const effectiveRole = isDeveloper ? 'coach' : userRole;

  const handleWorkoutSave = async (workoutData: any) => {
    console.log('🟢 handleWorkoutSave appelé dans App.tsx', workoutData);
    try {
      if (editingWorkout) {
        console.log('📝 Mode édition, ID:', editingWorkout.id);
        await updateWorkout(editingWorkout.id, workoutData);
      } else {
        console.log('➕ Mode création nouvelle séance');
        await saveWorkout(workoutData);
      }
      console.log('✅ Sauvegarde terminée, retour en arrière...');
      setEditingWorkout(null);
      navigateBack();
      if (refreshScores) {
        await refreshScores();
      }
    } catch (error: any) {
      console.error('❌ Erreur dans handleWorkoutSave:', error);
      alert(`Erreur: ${error?.message || error}`);
    }
  };

  const handleRecordSave = async (recordData: any) => {
    try {
      await saveRecord(recordData);
      navigateBack();
      if (refreshScores) {
        await refreshScores();
      }
    } catch (error) {
      console.error('Erreur sauvegarde record:', error);
    }
  };

  const handleBodyCompSave = async (bodyCompData: any) => {
    try {
      await saveBodyComposition(bodyCompData);
      navigateBack();
      if (refreshScores) {
        await refreshScores();
      }
    } catch (error) {
      console.error('Erreur sauvegarde body comp:', error);
    }
  };

  const handleSleepSave = async () => {
    try {
      navigateBack();
      // Optionally refresh data if sleep affects scores
      if (refreshScores) {
        await refreshScores();
      }
    } catch (error) {
      console.error('Error saving sleep:', error);
    }
  };

  // Fonction pour forcer le rechargement des données depuis Supabase
  const refreshData = () => {
    if (user) {
      // Vider les caches localStorage pour forcer le rechargement depuis Supabase
      localStorage.removeItem(`bodycomps_${user.id}`);
      localStorage.removeItem(`records_${user.id}`);
      localStorage.removeItem(`workouts_${user.id}`);
      
      // Recharger la page pour récupérer les données fraîches
      window.location.reload();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header
        userRole={effectiveRole}
        onRefreshData={refreshData}
        onProfileClick={() => navigateTo('profile')}
        onHomeClick={() => setNavigationStack(['dashboard'])}
        onPartnershipsClick={() => navigateTo('partnerships')}
        isDashboard={currentView === 'dashboard'}
        canGoBack={navigationStack.length > 1}
        onBack={navigateBack}
        title={getViewTitle(currentView)}
      />
      
      <main className="p-6 pb-20">
        {/* Dashboard */}
        {currentView === 'dashboard' && (
          <Dashboard
            workouts={workouts || []}
            onViewChange={navigateTo}
            userRole={effectiveRole}
            onScoresLoad={(fn) => setRefreshScores(() => fn)}
          />
        )}
        
        {/* Workouts */}
        {currentView === 'workouts' && (
          <WorkoutsList 
            onAddWorkout={() => navigateTo('add-workout')}
            onEditWorkout={(workout) => {
              setEditingWorkout(workout);
              navigateTo('add-workout');
            }}
          />
        )}
        {currentView === 'add-workout' && (
          <NewWorkoutForm
            editingWorkout={editingWorkout}
            onSave={handleWorkoutSave}
            onCancel={() => {
              setEditingWorkout(null);
              navigateBack();
            }}
          />
        )}
        
        {/* Records */}
        {currentView === 'records' && (
          <RecordsList onAddRecord={() => navigateTo('add-record')} />
        )}
        {currentView === 'add-record' && (
          <RecordsForm 
            records={records || []}
            onSave={handleRecordSave}
            onCancel={navigateBack}
          />
        )}
        
        {/* Body Composition */}
        {currentView === 'bodycomp' && (
          <BodyCompCharts onAddEntry={() => navigateTo('add-bodycomp')} />
        )}
        {currentView === 'add-bodycomp' && (
          <BodyCompForm 
            onSave={handleBodyCompSave}
            onCancel={navigateBack}
          />
        )}
        
        {/* Detailed Analysis */}
        {currentView === 'ai' && (
          <DetailedAnalysis />
        )}
        
        {/* Groups */}
        {currentView === 'groups' && effectiveRole === 'athlete' && (
          <AthleteGroupView />
        )}
        {currentView === 'groups' && effectiveRole === 'coach' && (
          <GroupManagement />
        )}
        
        {/* Chat */}
        {currentView === 'chat' && effectiveRole === 'coach' && (
          <CoachGroupChat />
        )}
        
        {/* Planning */}
        {currentView === 'planning' && effectiveRole === 'athlete' && (
          <AthletePlanning />
        )}
        {currentView === 'planning' && effectiveRole === 'coach' && (
          <CoachPlanning />
        )}
        
        {/* Profile */}
        {currentView === 'profile' && (
          <ProfilePage />
        )}
        
        {/* Partnerships */}
        {currentView === 'partnerships' && (
          <PartnershipsList />
        )}

        {/* Nutrition */}
        {currentView === 'nutrition' && (
          <NutritionModule />
        )}

        {/* Sleep */}
        {currentView === 'add-sleep' && (
          <SleepForm 
            onSave={handleSleepSave}
            onCancel={navigateBack}
          />
        )}

        {/* Developer Panel */}
        {currentView === 'developer' && user && user.id === '75a17559-b45b-4dd1-883b-ce8ccfe03f0f' && (
          <DeveloperPanel />
        )}
      </main>
      
      {/* Navigation Components */}
      <TabBar
        currentView={currentView}
        onViewChange={(view) => setNavigationStack([view])}
        userRole={effectiveRole}
      />
      
      {/* PWA Install Prompt */}
      <PWAInstallPrompt />
      
      {/* Global Notifications */}
      <NotificationDisplay />
    </div>
  );
}

export default App;