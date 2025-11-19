import React from 'react';
import IndicesPanel from './IndicesPanel';
import AthleteDailyPlanCarousel from '../carousels/AthleteDailyPlanCarousel';
import StrengthRecordsCarousel from '../carousels/StrengthRecordsCarousel';
import TrackRecordsCarousel from '../carousels/TrackRecordsCarousel';
// … autres imports nécessaires

const Dashboard: React.FC = () => {
  // Exemple de valeurs; remplace par tes données réelles via tes hooks
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
