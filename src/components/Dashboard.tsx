import React from 'react';
import { CoachDashboard } from './dashboard/CoachDashboard';
import { AthleteDailyPlanCarousel } from './dashboard/AthleteDailyPlanCarousel';
import { StrengthRecordsCarousel } from './dashboard/StrengthRecordsCarousel';
import { TrackRecordsCarousel } from './dashboard/TrackRecordsCarousel';
import { IndicesPanel } from './dashboard/IndicesPanel';

interface DashboardProps {
  userRole: 'athlete' | 'coach';
  onViewChange: (view: any) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ userRole, onViewChange }) => {
  if (userRole === 'coach') {
    return <CoachDashboard onViewChange={onViewChange} />;
  }

  // Athlete Dashboard
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
        Bonjour !
      </h1>
      
      {/* Panneau des indices de performance */}
      <IndicesPanel />

      {/* Planning du jour */}
      <div>
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-3">
          Votre planning du jour
        </h2>
        <AthleteDailyPlanCarousel />
      </div>

      {/* Records de force */}
      <div>
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
            Records - Force
          </h2>
          <button 
            onClick={() => onViewChange('records')} 
            className="text-sm font-medium text-primary-500 hover:underline"
          >
            Voir tout
          </button>
        </div>
        <StrengthRecordsCarousel />
      </div>

      {/* Records de course */}
      <div>
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
            Records - Course
          </h2>
          <button 
            onClick={() => onViewChange('records')} 
            className="text-sm font-medium text-primary-500 hover:underline"
          >
            Voir tout
          </button>
        </div>
        <TrackRecordsCarousel />
      </div>
    </div>
  );
};

export default Dashboard;