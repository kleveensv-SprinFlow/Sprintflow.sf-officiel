import React from 'react';
import { TeamHealthWidget } from './coach/TeamHealthWidget'; //
import { ActionsListWidget } from './coach/ActionsListWidget'; //
import { CoachDailyPlanCarousel } from './CoachDailyPlanCarousel'; //
import { GroupRecordsCarousel } from './coach/GroupRecordsCarousel'; //
import { useCoachDashboard } from '../../hooks/useCoachDashboard'; //

export const CoachHomeView: React.FC = () => {
  // Récupération des données réelles via le hook existant
  const { 
    teamStats, 
    alerts, 
    dailyPlans, 
    recentRecords, 
    loading 
  } = useCoachDashboard();

  if (loading) {
    return <div className="p-4 text-center text-gray-400">Chargement du tableau de bord...</div>;
  }

  return (
    <div className="flex flex-col gap-6 pb-24 pt-2">
      
      {/* 1. SECTION CRITIQUE : ALERTES & SANTÉ */}
      {/* On met ça en premier car c'est ce qui demande une décision immédiate */}
      <div className="px-4 space-y-4">
        <h2 className="text-lg font-bold text-white mb-2">Aperçu Rapide</h2>
        
        {/* Qui est blessé ou a besoin d'attention ? */}
        <ActionsListWidget alerts={alerts} />
        
        {/* État général des troupes */}
        <TeamHealthWidget stats={teamStats} />
      </div>

      {/* 2. SECTION OPÉRATIONNELLE : SÉANCE DU JOUR */}
      {/* "Qu'est-ce qu'on fait sur la piste ?" */}
      <div className="space-y-2">
        <div className="px-4 flex justify-between items-end">
          <h2 className="text-lg font-bold text-white">Séances du Jour</h2>
          <span className="text-xs text-sprint-primary font-medium">
            {dailyPlans.length} groupes
          </span>
        </div>
        <CoachDailyPlanCarousel plans={dailyPlans} />
      </div>

      {/* 3. SECTION MOTIVATION : RECORDS */}
      {/* Le carburant mental */}
      {recentRecords.length > 0 && (
        <div className="px-4 space-y-2">
          <h2 className="text-lg font-bold text-white">Derniers Records 🔥</h2>
          <GroupRecordsCarousel records={recentRecords} />
        </div>
      )}

    </div>
  );
};