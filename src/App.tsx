import React, { useState, useEffect } from 'react';
import { View } from './types';
import useAuth from './hooks/useAuth';
import { useWorkouts } from './hooks/useWorkouts';
import { useRecords } from './hooks/useRecords';

import Auth from './components/Auth';
import { LoadingScreen } from './components/LoadingScreen';
import Header from './components/navigation/Header';
import TabBar from './components/TabBar';
import Dashboard from './components/Dashboard';
import { WorkoutsList } from './components/workouts/WorkoutsList';
import { RecordsList } from './components/records/RecordsList';
import { RecordsForm } from './components/records/RecordsForm';
import { AthleteGroupView } from './components/groups/AthleteGroupView';
import { GroupManagement } from './components/groups/GroupManagement';
import { CoachPlanning } from './components/planning/CoachPlanning';
import { AthletePlanning } from './components/planning/AthletePlanning';
import { PWAInstallPrompt } from './components/PWAInstallPrompt';
import { ProfilePage } from './components/profile/ProfilePage';
import { ChatManager } from './components/chat/ChatManager';
import { PartnershipsList } from './components/PartnershipsList';
import { DeveloperPanel } from './components/developer/DeveloperPanel';
import { NotificationDisplay } from './components/NotificationDisplay';
import { NutritionModule } from './components/nutrition/NutritionModule';
import { FoodSearchModal } from './components/nutrition/FoodSearchModal';
import { SleepTracker } from './components/sleep/SleepTracker';
import { getViewTitle } from './utils/navigation';
import { NewWorkoutForm } from './components/workouts/WorkoutForm'; // LIGNE MODIFIÉE/AJOUTÉE

function App() {
  const { user, profile, loading, error } = useAuth();
  const { workouts, saveWorkout, updateWorkout } = useWorkouts();
  const { records, saveRecord } = useRecords();
  const [navigationStack, setNavigationStack] = useState<View[]>(['dashboard']);
  const currentView = navigationStack[navigationStack.length - 1];
  const [editingWorkout, setEditingWorkout] = useState<any>(null);
  const [refreshScores, setRefreshScores] = useState<(() => Promise<void>) | null>(null);

  const navigateTo = (view: View) => {
    if (view === currentView) return;
    setNavigationStack(prevStack => [...prevStack, view]);
  };

  const navigateBack = () => {
    if (navigationStack.length > 1) {
      setNavigationStack(prevStack => prevStack.slice(0, -1));
    }
  };

  const navigateToRoot = (view: View) => {
    setNavigationStack([view]);
  };

  if (loading) {
    console.log('🕐 [App] Initialisation en cours...');
    return <LoadingScreen message="Vérification de la session..." />;
  }

  if (!user) {
    console.log('🔐 [App] Pas d\'utilisateur, affichage de l\'écran d\'authentification.');
    return <Auth initialError={error} />;
  }

  const userRole = profile?.role || 'athlete';

  const handleWorkoutSave = async (workoutData: any) => {
    try {
      if (editingWorkout) {
        await updateWorkout(editingWorkout.id, workoutData);
      } else {
        await saveWorkout(workoutData);
      }
      setEditingWorkout(null);
      navigateBack();
      refreshScores?.();
    } catch (e: any) {
      console.error('❌ Erreur dans handleWorkoutSave:', e);
      alert(`Erreur: ${e?.message || e}`);
    }
  };

  const handleRecordSave = async (recordData: any) => {
    try {
      await saveRecord(recordData);
      navigateBack();
      refreshScores?.();
    } catch (error) {
      console.error('Erreur sauvegarde record:', error);
    }
  };

  const refreshData = () => {
    if (user) {
      localStorage.removeItem(`bodycomps_${user.id}`);
      localStorage.removeItem(`records_${user.id}`);
      localStorage.removeItem(`workouts_${user.id}`);
      window.location.reload();
    }
  };

  // Note: La prop 'editingWorkout' passée à NewWorkoutForm a été mise à jour 
  // pour correspondre à ce que le composant attend ('initialData')
  const renderCurrentView = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard onViewChange={navigateTo} userRole={userRole} onScoresLoad={(fn) => setRefreshScores(() => fn)} />;
      case 'workouts':
        return <WorkoutsList onAddWorkout={() => navigateTo('add-workout')} onEditWorkout={(workout) => { setEditingWorkout(workout); navigateTo('add-workout'); }} />;
      case 'add-workout':
        return <NewWorkoutForm initialData={editingWorkout} onSave={handleWorkoutSave} onCancel={() => { setEditingWorkout(null); navigateBack(); }} />;
      case 'records':
        return <RecordsList onAddRecord={() => navigateTo('add-record')} />;
      case 'add-record':
        return <RecordsForm records={records || []} onSave={handleRecordSave} onCancel={navigateBack} />;
      case 'groups':
        return userRole === 'athlete' ? <AthleteGroupView /> : <GroupManagement />;
      case 'chat':
        return userRole === 'coach' ? <ChatManager /> : null;
      case 'planning':
        return userRole === 'athlete' ? <AthletePlanning /> : <CoachPlanning />;
      case 'profile':
        return <ProfilePage />;
      case 'partnerships':
        return <PartnershipsList />;
      case 'nutrition':
        return <NutritionModule />;
      case 'add-food':
        return <FoodSearchModal onClose={navigateBack} onFoodSelected={(food) => { console.log('Nourriture sélectionnée:', food); navigateBack(); }} />;
      case 'sleep':
        return <SleepTracker />;
      case 'developer':
        return profile?.role === 'developer' ? <DeveloperPanel /> : null;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-transparent">
      <Header
        userRole={userRole}
        onRefreshData={refreshData}
        onProfileClick={() => navigateTo('profile')}
        onHomeClick={() => navigateToRoot('dashboard')}
        onPartnershipsClick={() => navigateTo('partnerships')}
        isDashboard={currentView === 'dashboard'}
        canGoBack={navigationStack.length > 1}
        onBack={navigateBack}
        title={getViewTitle(currentView)}
      />

      <main className="p-4 md:p-6 pb-24">
        {renderCurrentView()}
      </main>

      <TabBar
        currentView={currentView}
        onViewChange={navigateToRoot}
        onFabAction={navigateTo}
        userRole={userRole}
      />

      <PWAInstallPrompt />
      <NotificationDisplay />
    </div>
  );
}

export default App;