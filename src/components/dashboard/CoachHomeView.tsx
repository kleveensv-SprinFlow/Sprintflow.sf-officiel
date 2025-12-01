import React from 'react';
import { useCoachDashboard } from '../../hooks/useCoachDashboard';
import TeamHealthWidget from './coach/TeamHealthWidget';
import ActionsListWidget from './coach/ActionsListWidget';
import { CoachDailyPlanCarousel } from './CoachDailyPlanCarousel';
import { GroupRecordsCarousel } from './coach/GroupRecordsCarousel';

export const CoachHomeView: React.FC = () => {
  const { data, loading, error, refreshData } = useCoachDashboard();

  // Valeurs par défaut si data est null/undefined
  const teamHealth = data?.teamHealth ??  { 
    wellnessTrend: [], 
    adherence: { completed: 0, planned: 0, rate: 0 } 
  };
  
  const priorityActions = data?.priorityActions ?? { 
    pendingWellness: [], 
    pendingValidation: [] 
  };

  // TODO: Ces données ne viennent pas encore de l'API
  const dailyPlans: any[] = [];
  const recentRecords: any[] = [];

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-red-400">
        <p>Erreur lors du chargement</p>
        <p className="text-sm text-gray-500 mt-2">{error}</p>
        <button 
          onClick={refreshData}
          className="mt-4 px-4 py-2 bg-sprint-primary text-white rounded-lg"
        >
          Réessayer
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 pb-24 pt-4 bg-gray-50 dark:bg-gray-900 min-h-full overflow-y-auto">
      
      {/* HEADER INTERNE */}
      <div className="px-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Bonjour Coach 👋
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Voici le point sur votre effectif aujourd'hui. 
        </p>
      </div>

      {/* 1.  SECTION CRITIQUE : ALERTES & SANTÉ */}
      <div className="px-4 space-y-4">
        <ActionsListWidget 
          data={priorityActions} 
          loading={loading} 
          onActionComplete={refreshData} 
        />
        
        <TeamHealthWidget 
          data={teamHealth} 
          loading={loading} 
        />
      </div>

      {/* 2. SECTION OPÉRATIONNELLE : SÉANCE DU JOUR */}
      {dailyPlans.length > 0 && (
        <div className="space-y-2">
          <div className="px-4 flex justify-between items-end">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">
              Séances du Jour
            </h2>
            <span className="text-xs text-sprint-primary font-medium bg-sprint-primary/10 px-2 py-1 rounded-full">
              {dailyPlans.length} groupes actifs
            </span>
          </div>
          <CoachDailyPlanCarousel plans={dailyPlans} />
        </div>
      )}

      {/* 3. SECTION MOTIVATION : RECORDS */}
      {recentRecords. length > 0 && (
        <div className="px-4 space-y-2 mb-4">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">
            Derniers Records 🔥
          </h2>
          <GroupRecordsCarousel records={recentRecords} />
        </div>
      )}
    </div>
  );
};