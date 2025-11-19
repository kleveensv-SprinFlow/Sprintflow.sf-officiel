import React from 'react';
import IndicesPanel from './IndicesPanel';
import { AthleteDailyPlanCarousel } from './AthleteDailyPlanCarousel';
import { StrengthRecordsCarousel } from './StrengthRecordsCarousel';
import { TrackRecordsCarousel } from './TrackRecordsCarousel';

const AthleteDashboard: React.FC = () => {
  // Mock data for demonstration purposes
  const indices = {
    form: 75,
    weightPowerRatio: 82,
  };

  return (
    <div className="space-y-8">
      <IndicesPanel
        formIndex={indices.form}
        weightPowerRatio={indices.weightPowerRatio}
      />
      <AthleteDailyPlanCarousel />
      <StrengthRecordsCarousel />
      <TrackRecordsCarousel />
    </div>
  );
};

export default AthleteDashboard;
