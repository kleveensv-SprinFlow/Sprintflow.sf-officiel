// src/components/dashboard/AthleteDashboard.tsx
import { useState } from 'react';
import { useIndices } from '../../hooks/useIndices';
import { useWellness } from '../../hooks/useWellness';
import useAuth from '../../hooks/useAuth';
import { useGroups } from '../../hooks/useGroups';
import { CheckinModal } from './CheckinModal';
import { JoinGroupModal } from '../groups/JoinGroupModal';
import { UserPlus, ChevronRight } from 'lucide-react';

// Import new components
import PerformanceRadarCard from './PerformanceRadarCard';
import DashboardCard from './DashboardCard';

// Import existing content components
import { AthleteDailyPlanCarousel } from './AthleteDailyPlanCarousel';
import { StrengthRecordsCarousel } from './StrengthRecordsCarousel';
import { TrackRecordsCarousel } from './TrackRecordsCarousel';

const AthleteDashboard: React.FC = () => {
  const { formIndex, performanceIndex, loading: indicesLoading, refresh } = useIndices();
  const { user } = useAuth();
  const { groups, fetchGroups } = useGroups();
  const { wellnessData, refresh: refreshWellness } = useWellness(user?.id);
  const [isCheckinModalOpen, setIsCheckinModalOpen] = useState(false);
  const [isJoinGroupModalOpen, setIsJoinGroupModalOpen] = useState(false);

  const today = new Date().toISOString().split('T')[0];
  const isCheckinDone = wellnessData?.some(log => log.date === today && log.ressenti_sommeil !== null);

  const handleCheckinSuccess = () => {
      refreshWellness();
      refresh(); // Refresh indices after check-in
      setIsCheckinModalOpen(false);
  };

  return (
    <div className="space-y-8 pt-8">

      <PerformanceRadarCard
        formIndex={formIndex}
        performanceIndex={performanceIndex}
        loading={indicesLoading}
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
              <h3 className="font-din-title text-lg leading-tight">Rejoindre un groupe</h3>
              <p className="font-manrope text-indigo-100 text-sm">Saisissez votre code d'invitation</p>
            </div>
          </div>
          <ChevronRight className="text-white/70 group-hover:text-white transition-colors" size={24} />
        </div>
      )}
      
      <DashboardCard title="PLAN DU JOUR" to="/planning">
        <AthleteDailyPlanCarousel />
      </DashboardCard>

      <DashboardCard title="RECORDS - FORCE" to="/data">
        <StrengthRecordsCarousel />
      </DashboardCard>

      <DashboardCard title="RECORDS - PISTE" to="/data">
        <TrackRecordsCarousel />
      </DashboardCard>

      {/* Modals remain the same */}
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
