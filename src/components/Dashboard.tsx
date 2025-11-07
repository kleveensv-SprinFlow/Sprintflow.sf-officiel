import React, { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { CoachDashboard } from './dashboard/CoachDashboard';
import { AthleteDailyPlanCarousel } from './dashboard/AthleteDailyPlanCarousel';
import { StrengthRecordsCarousel } from './dashboard/StrengthRecordsCarousel';
import { TrackRecordsCarousel } from './dashboard/TrackRecordsCarousel';
import { IndicesPanel } from './dashboard/IndicesPanel';
import { CheckinModal } from './dashboard/CheckinModal';
import useAuth from '../hooks/useAuth';
import { useWellness } from '../hooks/useWellness';
import { supabase } from '../lib/supabase';

interface DashboardProps {
  userRole: 'athlete' | 'coach';
  onViewChange: (view: any) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ userRole, onViewChange }) => {
  const { user } = useAuth();
  const { wellnessData } = useWellness(user?.id);
  const [isCheckinOpen, setCheckinOpen] = useState(false);
  const [scoreForme, setScoreForme] = useState<{ indice: number | null } | null>(null);
  const [scorePerformance, setScorePerformance] = useState<{ indice: number | null } | null>(null);
  const [loading, setLoading] = useState(true);

  const today = new Date().toISOString().split('T')[0];
  const hasCheckedInToday = wellnessData?.some(log => log.date === today && log.sleep_quality) || false;

  useEffect(() => {
    const loadScores = async () => {
      if (!user?.id) return;

      try {
        setLoading(true);

        const { data: formeData } = await supabase.rpc('get_score_forme', { user_id_param: user.id });
        const { data: perfData } = await supabase.rpc('get_indice_poids_puissance', { user_id_param: user.id });

        setScoreForme(formeData ? { indice: formeData } : null);
        setScorePerformance(perfData ? { indice: perfData } : null);
      } catch (error) {
        console.error('Erreur chargement scores:', error);
      } finally {
        setLoading(false);
      }
    };

    loadScores();
  }, [user?.id, hasCheckedInToday]);

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
      <IndicesPanel
        loading={loading}
        scoreForme={scoreForme}
        scorePerformance={scorePerformance}
        onNavigate={() => onViewChange('performance')}
        hasCheckedInToday={hasCheckedInToday}
        onCheckinClick={() => setCheckinOpen(true)}
      />

      <AnimatePresence>
        {isCheckinOpen && (
          <CheckinModal
            isOpen={isCheckinOpen}
            onClose={() => setCheckinOpen(false)}
          />
        )}
      </AnimatePresence>

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