import React from 'react';
import IndicesPanel from './dashboard/IndicesPanel';
import { AthleteDailyPlanCarousel } from './dashboard/AthleteDailyPlanCarousel';
import { StrengthRecordsCarousel } from './dashboard/StrengthRecordsCarousel';
import { TrackRecordsCarousel } from './dashboard/TrackRecordsCarousel';
// … autres imports nécessaires (modales, hooks, etc.)

/**
 * Tableau de bord Athlète.
 * Affiche le panneau d’indices et les carrousels de planification et de records.
 * Ce composant est différent de CoachDashboard.tsx, réservé aux coachs.
 */
const Dashboard: React.FC = () => {
  // Valeurs d’exemple ; remplace-les par celles de tes hooks (useIndices, useAuth, etc.)
  const indices = {
    form: 75,
    weightPowerRatio: 82,
  };

  return (
    <div className="min-h-screen bg-sprint-dark-blue px-4 py-6 space-y-8">
      {/* Indice de forme & rapport poids/puissance */}
      <IndicesPanel
        formIndex={indices.form}
        weightPowerRatio={indices.weightPowerRatio}
      />
      {/* Planning quotidien de l’athlète */}
      <AthleteDailyPlanCarousel />
      {/* Records de force et de sprint */}
      <StrengthRecordsCarousel />
      <TrackRecordsCarousel />
      {/* Autres sections ou modales spécifiques à l’athlète */}
    </div>
  );
};

export default Dashboard;
