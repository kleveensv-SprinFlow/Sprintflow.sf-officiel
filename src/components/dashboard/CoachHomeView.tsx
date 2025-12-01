import React from 'react';
import { useCoachDashboard } from '../../hooks/useCoachDashboard';
import { TeamHealthWidget } from './coach/TeamHealthWidget';
import { ActionsListWidget } from './coach/ActionsListWidget';
import { CoachDailyPlanCarousel } from './CoachDailyPlanCarousel';
import { GroupRecordsCarousel } from './coach/GroupRecordsCarousel';

export const CoachHomeView: React.FC = () => {
  // Récupération des données pour le tableau de bord
  const { 
    teamStats, 
    alerts, 
    dailyPlans, 
    recentRecords, 
    loading 
  } = useCoachDashboard();

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-gray-400">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sprint-primary mb-2"></div>
        <p>Chargement du QG...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 pb-24 pt-4 bg-gray-50 dark:bg-gray-900 min-h-full overflow-y-auto">
      
      {/* HEADER INTERNE : Message de bienvenue ou Date */}
      <div className="px-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Bonjour Coach 👋
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Voici le point sur votre effectif aujourd'hui.
        </p>
      </div>

      {/* 1. SECTION CRITIQUE : ALERTES & SANTÉ */}
      <div className="px-4 space-y-4">
        {/* Qui est blessé ou a besoin d'attention ? */}
        <ActionsListWidget alerts={alerts} />
        
        {/* État général des troupes (Graphique Radar) */}
        <TeamHealthWidget stats={teamStats} />
      </div>

      {/* 2. SECTION OPÉRATIONNELLE : SÉANCE DU JOUR */}
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

      {/* 3. SECTION MOTIVATION : RECORDS */}
      {recentRecords.length > 0 && (
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