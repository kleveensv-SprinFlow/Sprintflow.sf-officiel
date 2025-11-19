import React from 'react';
import { IndicesPanel } from './IndicesPanel';
import AthleteDailyPlanCarousel from '../carousels/AthleteDailyPlanCarousel';
import StrengthRecordsCarousel from '../carousels/StrengthRecordsCarousel';
import TrackRecordsCarousel from '../carousels/TrackRecordsCarousel';
// … autres imports nécessaires (modales, hooks, etc.)

/**
 * Tableau de bord Athlète.
 * Intègre le panneau d’indices mis à jour et supprime le titre “Vos indices”.
 */
const Dashboard: React.FC = () => {
  // Exemple de récupération d’indices (à adapter selon ton hook)
  const indices = {
    form: 75, // remplace par indices.form depuis ta logique
    weightPowerRatio: 82, // remplace par indices.weightPowerRatio
  };

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
