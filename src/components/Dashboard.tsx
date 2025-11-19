import React from 'react';
import IndicesPanel from './IndicesPanel';
import AthleteDailyPlanCarousel from '../carousels/AthleteDailyPlanCarousel';
import StrengthRecordsCarousel from '../carousels/StrengthRecordsCarousel';
import TrackRecordsCarousel from '../carousels/TrackRecordsCarousel';
// ... autres imports nécessaires (modales, hooks, etc.)

/**
 * Tableau de bord Athlète.
 * On supprime le titre « Vos indices » pour laisser toute la place au nouvel IndicesPanel.
 */
const Dashboard: React.FC = () => {
  // Exemple de hook pour récupérer les indices (à adapter)
  // const { indices } = useIndices();
  const indices = { form: 75, weightPowerRatio: 82 }; // Valeurs de test

  return (
    <div className="min-h-screen bg-sprint-dark-blue px-4 py-6 space-y-8">
      {/* Panneau des indices côte à côte */}
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
