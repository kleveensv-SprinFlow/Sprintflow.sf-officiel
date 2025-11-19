import React from 'react';
import IndicesPanel from './dashboard/IndicesPanel';
import { AthleteDailyPlanCarousel } from './dashboard/AthleteDailyPlanCarousel';
import { StrengthRecordsCarousel } from './dashboard/StrengthRecordsCarousel';
import { TrackRecordsCarousel } from './dashboard/TrackRecordsCarousel';
// … autres imports nécessaires (modales, hooks, etc.)

/**
 * Tableau de bord Athlète.
 * Affiche le panneau d’indices et les carrousels de planification et de records.
 */
const Dashboard: React.FC = () => {
  // Remplace ces valeurs par les données réelles de tes hooks
  const indices = {
    form: 75,
    weightPowerRatio: 82,
  };

  return (
    <div className="min-h-screen bg-sprint-dark-blue px-4 py-6 space-y-8">
      {/* Panneau des indices (forme et rapport poids/puissance) */}
      <IndicesPanel
        formIndex={indices.form}
        weightPowerRatio={indices.weightPowerRatio}
      />

      {/* Carrousel du planning quotidien */}
      <AthleteDailyPlanCarousel />

      {/* Carrousels des records (force et course) */}
      <StrengthRecordsCarousel />
      <TrackRecordsCarousel />

      {/* Modales et autres composants à ajouter ici */}
    </div>
  );
};

export default Dashboard;
