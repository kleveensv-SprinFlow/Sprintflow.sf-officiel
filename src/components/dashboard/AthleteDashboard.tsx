import React, { useState } from 'react';
import IndicesPanel from './IndicesPanel';
import { AthleteDailyPlanCarousel } from './AthleteDailyPlanCarousel';
import { StrengthRecordsCarousel } from './StrengthRecordsCarousel';
import { TrackRecordsCarousel } from './TrackRecordsCarousel';
import { useIndices } from '../../hooks/useIndices';
import { CheckinModal } from './CheckinModal';
import { useWellness } from '../../hooks/useWellness';
import useAuth from '../../hooks/useAuth';
import { useGroups } from '../../hooks/useGroups';
import { JoinGroupModal } from '../groups/JoinGroupModal';
import { UserPlus, ChevronRight } from 'lucide-react';

const AthleteDashboard: React.FC = () => {
  const { formIndex, performanceIndex, loading: indicesLoading, refresh } = useIndices();
  const { user } = useAuth();
  const { groups, fetchGroups } = useGroups();
  const { wellnessData, refresh: refreshWellness } = useWellness(user?.id);
  const [isCheckinModalOpen, setIsCheckinModalOpen] = useState(false);
  const [isJoinGroupModalOpen, setIsJoinGroupModalOpen] = useState(false);

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

      {/* Carte pour rejoindre un groupe si l'athlète n'en a pas */}
      {groups.length === 0 && (
        <div 
          onClick={() => setIsJoinGroupModalOpen(true)}
          className="mx-4 p-5 bg-gradient-to-br from-indigo-600 to-indigo-700 rounded-2xl shadow-lg shadow-indigo-500/20 flex items-center justify-between cursor-pointer active:scale-95 transition-all group"
        >
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center text-white">
              <UserPlus size={24} />
            </div>
            <div className="text-white">
              <h3 className="font-bold text-lg leading-tight">Rejoindre un groupe</h3>
              <p className="text-indigo-100 text-sm font-medium">Saisissez votre code d'invitation</p>
            </div>
          </div>
          <ChevronRight className="text-white/70 group-hover:text-white transition-colors" size={24} />
        </div>
      )}
      
      <AthleteDailyPlanCarousel />
      <StrengthRecordsCarousel />
      <TrackRecordsCarousel />

      <CheckinModal 
        isOpen={isCheckinModalOpen} 
        onClose={() => setIsCheckinModalOpen(false)}
        onSuccess={handleCheckinSuccess}
      />

      {isJoinGroupModalOpen && (
        <JoinGroupModal 
          onClose={() => setIsJoinGroupModalOpen(false)}
          onSuccess={() => {
            fetchGroups();
            setIsJoinGroupModalOpen(false);
          }}
        />
      )}
    </div>
  );
};

export default AthleteDashboard;
