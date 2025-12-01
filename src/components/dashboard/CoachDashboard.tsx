// Fichier : src/components/dashboard/CoachDashboard.tsx

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, 
  Calendar, 
  Settings, 
  LogOut, 
  BarChart2, 
  Trophy,
  Video,
  Home
} from 'lucide-react';

// --- IMPORTS DES COMPOSANTS ---
import CoachHeader from '../navigation/CoachHeader';
import CoachHubView from '../hub/CoachHubView'; // Utilise la nouvelle vue LISTE
import { CoachPlanning } from '../planning/CoachPlanning';
import MyFollowUpsPage from '../coach/MyFollowUpsPage'; // (Peut être renommée MyAthletesPage plus tard)
import { CoachProfilePageView } from '../profile/CoachProfilePageView';
import RecordsPage from '../records/RecordsPage';
import VideoAnalysisFlow from '../video_analysis/VideoAnalysisFlow';

// --- TYPES ---
import { ActionType } from '../../data/actions';

type ViewType = 'hub' | 'planning' | 'athletes' | 'records' | 'analysis' | 'profile' | 'settings' | 'periodization';

export const CoachDashboard: React.FC = () => {
  // État pour savoir quelle vue afficher (par défaut: le Hub)
  const [currentView, setCurrentView] = useState<ViewType>('hub');

  // --- FONCTION DE NAVIGATION CENTRALE ---
  const handleNavigation = (view: ViewType) => {
    if (navigator.vibrate) navigator.vibrate(10);
    setCurrentView(view);
  };

  // --- GESTION DES CLICS SUR LA NOUVELLE LISTE (OPTION 2) ---
  const handleHubAction = (action: ActionType) => {
    console.log("Action reçue du Hub:", action); // Pour le débogage

    switch (action) {
      // 1. Planning Hebdomadaire (Redirection DIRECTE)
      case 'weekly-planning':
        setCurrentView('planning');
        break;

      // 2. Mes Athlètes (Suivi 360)
      case 'my-athletes':
      case 'my-follow-ups': // Gardé pour compatibilité au cas où
        setCurrentView('athletes');
        break;

      // 3. Périodisation (Nouveau)
      // Pour l'instant, on redirige vers le planning, mais on pourrait créer une vue dédiée 'periodization'
      case 'periodization':
        setCurrentView('planning'); 
        // TODO: Plus tard, faire: setCurrentView('periodization'); quand le composant sera prêt
        break;

      // 4. Autres actions existantes (si besoin)
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
      case 'hub':
        return <CoachHubView onAction={handleHubAction} />;
      
      case 'planning':
      case 'periodization': // On utilise le même composant pour l'instant
        return (
          <CoachPlanning 
            // On peut passer une prop ici pour dire à CoachPlanning quel onglet ouvrir par défaut si on veut
            initialSelectionType='group' 
            onBackToSelection={() => setCurrentView('hub')}
          />
        );

      case 'athletes':
        return <MyFollowUpsPage />;

      case 'records':
        return <RecordsPage />;

      case 'analysis':
        return <VideoAnalysisFlow />;

      case 'profile':
      case 'settings':
        return <CoachProfilePageView />;

      default:
        return <CoachHubView onAction={handleHubAction} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      
      {/* HEADER (Barre du haut) */}
      <CoachHeader 
        currentView={currentView}
        onNavigate={handleNavigation}
      />

      {/* CONTENU ANIMÉ */}
      <main className="flex-1 relative overflow-hidden pb-20"> {/* pb-20 pour la barre du bas */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentView}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="h-full"
          >
            {renderContent()}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* BARRE DE NAVIGATION INFÉRIEURE (Tab Bar) */}
      <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 pb-safe px-6 py-3 z-50">
        <div className="flex justify-between items-center max-w-lg mx-auto">
          
          <NavButton 
            icon={Home} 
            label="Hub" 
            isActive={currentView === 'hub'} 
            onClick={() => handleNavigation('hub')} 
          />
          
          <NavButton 
            icon={Calendar} 
            label="Planning" 
            isActive={currentView === 'planning'} 
            onClick={() => handleNavigation('planning')} 
          />
          
          <NavButton 
            icon={Users} 
            label="Athlètes" 
            isActive={currentView === 'athletes'} 
            onClick={() => handleNavigation('athletes')} 
          />
          
          <NavButton 
            icon={Trophy} 
            label="Records" 
            isActive={currentView === 'records'} 
            onClick={() => handleNavigation('records')} 
          />

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

// Petit composant pour les boutons du bas (plus propre)
const NavButton: React.FC<{ icon: any, label: string, isActive: boolean, onClick: () => void }> = ({ icon: Icon, label, isActive, onClick }) => (
  <button 
    onClick={onClick}
    className={`flex flex-col items-center gap-1 transition-colors ${
      isActive 
        ? 'text-sprint-primary' 
        : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
    }`}
  >
    <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
    <span className="text-[10px] font-medium">{label}</span>
  </button>
);

export default CoachDashboard; // Important pour l'import dans View