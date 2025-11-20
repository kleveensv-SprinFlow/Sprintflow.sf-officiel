import React, { useState } from 'react';
import IndicesPanel from './IndicesPanel';
import { AthleteDailyPlanCarousel } from './AthleteDailyPlanCarousel';
import { StrengthRecordsCarousel } from './StrengthRecordsCarousel';
import { TrackRecordsCarousel } from './TrackRecordsCarousel';
import { useIndices } from '../../hooks/useIndices';
import { CheckinModal } from './CheckinModal';
import { useWellness } from '../../hooks/useWellness';
import useAuth from '../../hooks/useAuth';

const AthleteDashboard: React.FC = () => {
  const { formIndex, performanceIndex, loading: indicesLoading, refresh } = useIndices();
  const { user } = useAuth();
  const { wellnessData, refresh: refreshWellness } = useWellness(user?.id);
  const [isCheckinModalOpen, setIsCheckinModalOpen] = useState(false);

  const today = new Date().toISOString().split('T')[0];
  const isCheckinDone = wellnessData?.some(log => log.date === today && log.ressenti_sommeil !== null);

  const handleCheckinClick = () => {
      if (!isCheckinDone) {
          setIsCheckinModalOpen(true);
      }
  };

  const handleCheckinSuccess = () => {
      refreshWellness();
      refresh(); // Refresh indices after check-in
      setIsCheckinModalOpen(false);
  };

  return (
    <div className="space-y-8 pb-24">
      {/* Pass handleCheckinClick specifically to the IndicesPanel for the Form card */}
      <IndicesPanel
        formIndex={formIndex}
        performanceIndex={performanceIndex}
        loading={indicesLoading}
        onFormCheckinClick={handleCheckinClick}
      />
      
      <AthleteDailyPlanCarousel />
      <StrengthRecordsCarousel />
      <TrackRecordsCarousel />

      <CheckinModal 
        isOpen={isCheckinModalOpen} 
        onClose={() => setIsCheckinModalOpen(false)}
        onSuccess={handleCheckinSuccess}
      />
    </div>
  );
};

export default AthleteDashboard;
