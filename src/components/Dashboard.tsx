import React from 'react';
import IndicesPanel from './dashboard/IndicesPanel';
import AthleteDailyPlanCarousel from '../carousels/AthleteDailyPlanCarousel';
import StrengthRecordsCarousel from '../carousels/StrengthRecordsCarousel';
import TrackRecordsCarousel from '../carousels/TrackRecordsCarousel';
// … autres imports nécessaires (modales, hooks, etc.)

/**
 * Tableau de bord Athlète.
 * Intègre le panneau d’indices (forme & poids/puissance).
 */
const Dashboard: React.FC = () => {
  // Remplace ces valeurs par celles de ton hook ou de ton contexte
  const indices = {
    form: 75,
    weightPowerRatio: 82,
  };

  return (
    <div className="min-h-screen bg-sprint-dark-blue px-4 py-6 space-y-8">
      {/* Affichage des indices côte à côte */}
      <IndicesPanel
        formIndex={indices.form}
        weightPowerRatio={indices.weightPowerRatio}
      />

      {/* Autres sections du tableau de bord */}
      <AthleteDailyPlanCarousel />
      <StrengthRecordsCarousel />
      <TrackRecordsCarousel />

      {/* Modales et contenu additionnel ici */}
    </div>
  );
};

export default Dashboard;
