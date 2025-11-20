import React from 'react';
import IndicesPanel from './IndicesPanel';
import { AthleteDailyPlanCarousel } from './AthleteDailyPlanCarousel';
import { StrengthRecordsCarousel } from './StrengthRecordsCarousel';
import { TrackRecordsCarousel } from './TrackRecordsCarousel';
import { SkeletonDashboard } from '../common/Skeleton';
import useAuth from '../../hooks/useAuth';

const AthleteDashboard: React.FC = () => {
  const { loading } = useAuth();
  
  if (loading) {
    // Si le profil charge encore (cas rare avec Cache-First mais possible)
    return <SkeletonDashboard />;
  }
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
