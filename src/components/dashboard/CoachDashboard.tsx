// Fichier : src/components/dashboard/CoachDashboard.tsx

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, 
  Calendar, 
  Settings, 
  LayoutGrid,
  Home,
  CheckCircle2
} from 'lucide-react';

// --- IMPORTS DES COMPOSANTS ---
import CoachHeader from '../navigation/CoachHeader';
import CoachHubView from '../hub/CoachHubView';
import { CoachCommandCenter } from './command-center/CoachCommandCenter';
import { CoachPlanning } from '../planning/CoachPlanning';
import MyFollowUpsPage from '../coach/MyFollowUpsPage';
import CoachProfilePageView from '../profile/CoachProfilePageView';
import RecordsPage from '../records/RecordsPage';
import { VideoAnalysisFlow } from '../video_analysis/VideoAnalysisFlow';
import { ValidationQueue } from './validation/ValidationQueue';

// --- TYPES ---
import { ActionType } from '../../data/actions';

type ViewType = 'home' | 'hub' | 'planning' | 'athletes' | 'records' | 'analysis' | 'profile' | 'settings' | 'periodization' | 'validation';

interface NavigationState {
  view: ViewType;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  params?: any;
}

export const CoachDashboard: React.FC = () => {
  const [navigationState, setNavigationState] = useState<NavigationState>({ view: 'home' });

  const currentView = navigationState. view;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleNavigation = (view: ViewType, params?: any) => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(10);
    }
    setNavigationState({ view, params });
  };

  const handleHubAction = (action: ActionType) => {
    switch (action) {
      case 'weekly-planning':
        handleNavigation('planning', { date: 'today' });
        break;

      case 'my-athletes':
      case 'my-follow-ups': 
        handleNavigation('athletes');
        break;

      case 'periodization':
        handleNavigation('planning'); 
        break;

      case 'video-analysis':
        handleNavigation('analysis');
        break;

      default:
        console.warn(`Action non gérée: ${action}`);
        break;
    }
  };

  const renderContent = () => {
    const { view, params } = navigationState;

    switch (view) {
      case 'home':
        return (
          <CoachCommandCenter 
            onNavigate={(view, params) => handleNavigation(view as ViewType, params)} 
          />
        );

      case 'hub':
        return <CoachHubView onAction={handleHubAction} />;
      
      case 'planning':
      case 'periodization': 
        return (
          <CoachPlanning 
            initialSelectionType='group' 
            initialDate={params?.date === 'today' ?  new Date() : (params?.date ? new Date(params.date) : undefined)}
            focusSessionId={params?.focus}
          />
        );

      case 'athletes':
        return (
          <MyFollowUpsPage 
            onBack={() => handleNavigation('home')}
            initialFilter={params?.filter} 
          />
        );

      case 'validation':
        return <ValidationQueue onBack={() => handleNavigation('home')} />;

      case 'records':
        return <RecordsPage />;

      case 'analysis':
        return <VideoAnalysisFlow onBack={() => handleNavigation('hub')} />;

      case 'profile':
      case 'settings':
        return <CoachProfilePageView />;

      default:
        return (
          <CoachCommandCenter 
            onNavigate={(view, params) => handleNavigation(view as ViewType, params)} 
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      
      <CoachHeader 
        currentView={currentView}
        onNavigate={(view) => handleNavigation(view as ViewType)}
      />

      <main className="flex-1 relative overflow-hidden pb-20">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentView}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="h-full"
          >
            {renderContent()}
          </motion.div>
        </AnimatePresence>
      </main>

      <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 pb-safe px-4 py-2 z-50">
        <div className="flex justify-between items-center max-w-lg mx-auto">
          
          <NavButton 
            icon={Home} 
            label="Accueil" 
            isActive={currentView === 'home'} 
            onClick={() => handleNavigation('home')} 
          />
          
          <NavButton 
            icon={LayoutGrid} 
            label="Hub" 
            isActive={currentView === 'hub'} 
            onClick={() => handleNavigation('hub')} 
          />
          
          <NavButton 
            icon={Calendar} 
            label="Planning" 
            isActive={currentView === 'planning'} 
            onClick={() => handleNavigation('planning', { date: 'today' })} 
          />
          
          <NavButton 
            icon={Users} 
            label="Athlètes" 
            isActive={currentView === 'athletes'} 
            onClick={() => handleNavigation('athletes')} 
          />

          <NavButton 
            icon={Settings} 
            label="Profil" 
            isActive={currentView === 'profile'} 
            onClick={() => handleNavigation('profile')} 
          />
          
        </div>
      </div>
      
      <div className="hidden"><CheckCircle2 /></div>
    </div>
  );
};

// Composant Bouton Navigation Optimisé
const NavButton: React.FC<{ icon: React.ElementType, label: string, isActive: boolean, onClick: () => void }> = ({ icon: Icon, label, isActive, onClick }) => (
  <button 
    onClick={onClick}
    className={`flex-1 flex flex-col items-center justify-center py-1 gap-1 transition-all duration-200 ${
      isActive 
        ?  'text-sprint-primary scale-105' 
        : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
    }`}
  >
    <div className={`p-1 rounded-xl transition-colors ${isActive ? 'bg-sprint-primary/10' : 'bg-transparent'}`}>
      <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
    </div>
    <span className={`text-[10px] font-medium ${isActive ? 'font-bold' : ''}`}>
      {label}
    </span>
  </button>
);

export default CoachDashboard;