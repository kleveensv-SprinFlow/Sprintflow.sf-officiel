import React, { useState, useEffect } from 'react';
import { Users } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useGroups } from '../../hooks/useGroups';
import { AthletesList } from './AthletesList';
import { AthleteDetails } from '../groups/AthleteDetails';

export const CoachDashboard: React.FC = () => {
  const { groups } = useGroups();
  const [showAthletesList, setShowAthletesList] = useState(false);
  const [selectedAthlete, setSelectedAthlete] = useState<any>(null);


  const totalAthletes = groups.reduce((sum, group) => sum + (group.members?.length || 0), 0);
  const activeGroups = groups.length;

  // Si un athlète est sélectionné, afficher ses détails
  if (selectedAthlete) {
    return (
      <AthleteDetails
        athlete={selectedAthlete}
        onBack={() => setSelectedAthlete(null)}
      />
    );
  }

  // Si la vue des athlètes est ouverte, l'afficher
  if (showAthletesList) {
    return (
      <AthletesList
        groups={groups}
        onBack={() => setShowAthletesList(false)}
        onAthleteClick={setSelectedAthlete}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="text-center py-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Tableau de bord <span className="gradient-text">Coach</span>
        </h1>
        <p className="text-gray-600 dark:text-gray-400">Gérez vos groupes et planifiez les entraînements</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        <button
          onClick={() => setShowAthletesList(true)}
          className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-lg border border-gray-200 dark:border-gray-700 transition-all duration-200 text-left card-3d-deep"
        >
          <div className="flex items-center space-x-2 sm:space-x-3">
            <Users className="h-6 w-6 sm:h-8 sm:w-8 text-primary-500 flex-shrink-0" />
            <div>
              <div className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{totalAthletes}</div>
              <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Athlètes total</div>
            </div>
          </div>
        </button>
        
        <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-lg border border-gray-200 dark:border-gray-700 card-3d">
          <div className="flex items-center space-x-2 sm:space-x-3">
            <Users className="h-6 w-6 sm:h-8 sm:w-8 text-secondary-500 flex-shrink-0" />
            <div>
              <div className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{activeGroups}</div>
              <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Groupes actifs</div>
            </div>
          </div>
        </div>

      </div>

      {/* Actions rapides */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <button
          onClick={() => {
            window.dispatchEvent(new CustomEvent('change-view', { detail: 'groups' }));
          }}
          className="bg-primary-500 hover:bg-primary-600 p-6 rounded-lg transition-all duration-200 text-white card-3d-deep"
        >
          <Users className="h-8 w-8 mb-2 text-white" />
          <h3 className="text-lg font-semibold text-white mb-1">Gérer mes groupes</h3>
          <p className="text-white/80 text-sm">Créer et organiser vos groupes d'athlètes</p>
        </button>
        
        <button
          onClick={() => {
            window.dispatchEvent(new CustomEvent('change-view', { detail: 'planning' }));
          }}
          className="bg-secondary-500 hover:bg-secondary-600 p-6 rounded-lg transition-all duration-200 card-3d-deep"
        >
          <div className="text-2xl mb-2">📅</div>
          <h3 className="text-lg font-semibold text-white mb-1">Créer un planning</h3>
          <p className="text-white/80 text-sm">Planifier les entraînements de vos athlètes</p>
        </button>
      </div>
    </div>
  );
};