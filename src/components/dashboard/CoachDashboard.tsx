// Fichier : src/components/dashboard/CoachDashboard.tsx

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, 
  Calendar, 
  Settings, 
  LayoutGrid, // Pour l'icône du Hub
  Home
} from 'lucide-react';

// --- IMPORTS DES COMPOSANTS ---
import CoachHeader from '../navigation/CoachHeader';
import CoachHubView from '../hub/CoachHubView'; // La vue en liste (Option 2)
import { CoachCommandCenter } from './command-center/CoachCommandCenter';
import { CoachPlanning } from '../planning/CoachPlanning';
import MyFollowUpsPage from '../coach/MyFollowUpsPage';
import CoachProfilePageView from '../profile/CoachProfilePageView';
import RecordsPage from '../records/RecordsPage';
import { VideoAnalysisFlow } from '../video_analysis/VideoAnalysisFlow';

// --- TYPES ---
import { ActionType } from '../../data/actions';

// Ajout de 'home' aux types de vue
type ViewType = 'home' | 'hub' | 'planning' | 'athletes' | 'records' | 'analysis' | 'profile' | 'settings' | 'periodization';

export const CoachDashboard: React.FC = () => {
  // On démarre sur 'home' pour voir les alertes/widgets tout de suite
  const [currentView, setCurrentView] = useState<ViewType>('home');

  // --- FONCTION DE NAVIGATION CENTRALE ---
  const handleNavigation = (view: ViewType) => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(10);
    }
    setCurrentView(view);
  };

  // --- GESTION DES CLICS SUR LA LISTE DU HUB ---
  const handleHubAction = (action: ActionType) => {
    // console.log("Action reçue du Hub:", action);

    switch (action) {
      case 'weekly-planning':
        setCurrentView('planning');
        break;

      case 'my-athletes':
      case 'my-follow-ups': 
        setCurrentView('athletes');
        break;

      case 'periodization':
        // Redirige vers le planning pour l'instant (ou un composant dédié plus tard)
        setCurrentView('planning'); 
        break;

      case 'video-analysis':
        setCurrentView('analysis');
        break;

      default:
        console.warn(`Action non gérée: ${action}`);
        break;
    }
  };

  // --- RENDU DU CONTENU PRINCIPAL ---
  const renderContent = () => {
    switch (currentView) {
      case 'home':
        // Affiche le tableau de bord "Command Center"
        return <CoachCommandCenter onNavigate={(view) => handleNavigation(view as ViewType)} />;

      case 'hub':
        // Affiche la liste des outils
        return <CoachHubView onAction={handleHubAction} />;
      
      case 'planning':
      case 'periodization': 
        return (
          <CoachPlanning 
            initialSelectionType='group' 
            onBackToSelection={() => setCurrentView('home')} // Retour à l'accueil
          />
        );

      case 'athletes':
        return <MyFollowUpsPage />;

      case 'records':
        // Accessible via le Hub ou un raccourci, mais on garde la vue pour le rendu
        return <RecordsPage />;

      case 'analysis':
        return <VideoAnalysisFlow onBack={() => setCurrentView('hub')} />;

      case 'profile':
      case 'settings':
        return <CoachProfilePageView />;

      default:
        return <CoachCommandCenter onNavigate={(view) => handleNavigation(view as ViewType)} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      
      {/* HEADER */}
      <CoachHeader 
        currentView={currentView}
        onNavigate={handleNavigation}
      />

      {/* CONTENU ANIMÉ */}
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

      {/* BARRE DE NAVIGATION INFÉRIEURE (5 Boutons) */}
      <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 pb-safe px-4 py-2 z-50">
        <div className="flex justify-between items-center max-w-lg mx-auto">
          
          {/* 1. ACCUEIL (Widgets & Alertes) */}
          <NavButton 
            icon={Home} 
            label="Accueil" 
            isActive={currentView === 'home'} 
            onClick={() => handleNavigation('home')} 
          />
          
          {/* 2. HUB (Menu Outils) */}
          <NavButton 
            icon={LayoutGrid} 
            label="Hub" 
            isActive={currentView === 'hub'} 
            onClick={() => handleNavigation('hub')} 
          />
          
          {/* 3. PLANNING (Action quotidienne) */}
          <NavButton 
            icon={Calendar} 
            label="Planning" 
            isActive={currentView === 'planning'} 
            onClick={() => handleNavigation('planning')} 
          />
          
          {/* 4. ATHLÈTES (Gestion Humaine) */}
          <NavButton 
            icon={Users} 
            label="Athlètes" 
            isActive={currentView === 'athletes'} 
            onClick={() => handleNavigation('athletes')} 
          />

          {/* 5. PROFIL (Réglages) */}
          <NavButton 
            icon={Settings} 
            label="Profil" 
            isActive={currentView === 'profile'} 
            onClick={() => handleNavigation('profile')} 
          />
          
        </div>
      </div>
    </div>
  );
};

// Composant Bouton Navigation Optimisé
const NavButton: React.FC<{ icon: React.ElementType, label: string, isActive: boolean, onClick: () => void }> = ({ icon: Icon, label, isActive, onClick }) => (
  <button 
    onClick={onClick}
    className={`flex-1 flex flex-col items-center justify-center py-1 gap-1 transition-all duration-200 ${
      isActive 
        ? 'text-sprint-primary scale-105' 
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