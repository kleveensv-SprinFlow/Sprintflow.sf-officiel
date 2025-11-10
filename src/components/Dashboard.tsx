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
  userRole?: 'athlete' | 'coach' | 'developer' | 'encadrant' | null;
  onViewChange: (view: any) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ userRole, onViewChange }) => {
  const { user } = useAuth();
  const { wellnessData, refresh: refreshWellnessData } = useWellness(user?.id);
  const [isCheckinOpen, setCheckinOpen] = useState(false);
  const [scoreForme, setScoreForme] = useState<{ indice: number | null } | null>(null);
  const [scorePerformance, setScorePerformance] = useState<{ indice: number | null } | null>(null);
  const [loading, setLoading] = useState(true);

  const today = new Date().toISOString().split('T')[0];
  const hasCheckedInToday = wellnessData?.some(log => log.date === today && log.ressenti_sommeil !== null) || false;

  useEffect(() => {
    const loadScores = async () => {
      if (!user?.id) return;

      try {
        setLoading(true);
        if (hasCheckedInToday) {
          const { data: formeData, error: formeError } = await supabase.rpc('get_current_indice_forme', { user_id_param: user.id });
          if (formeError) throw formeError;

          const { data: perfData, error: perfError } = await supabase.rpc('get_indice_poids_puissance', { user_id_param: user.id });
          if (perfError) throw perfError;

          setScoreForme(formeData !== null ? { indice: formeData } : null);
          setScorePerformance(perfData ? { indice: perfData } : null);
        }
      } catch (error) {
        console.error('Erreur chargement scores:', error);
      } finally {
        setLoading(false);
      }
    };

    loadScores();
  }, [user?.id, hasCheckedInToday]);

  const handleCheckinSuccess = () => {
    setCheckinOpen(false);
    refreshWellnessData();
  };

  // Affiche le dashboard du coach uniquement si le rôle est 'coach'
  if (userRole === 'coach') {
    return <CoachDashboard onViewChange={onViewChange} />;
  }

  // Pour tous les autres rôles (athlète, développeur, etc.) ou si le rôle est indéfini,
  // affiche le dashboard de l'athlète par défaut.

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
        Bonjour !
      </h1>

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
            onSuccess={handleCheckinSuccess}
          />
        )}
      </AnimatePresence>

      <AthleteDailyPlanCarousel userId={user?.id} onNavigate={onViewChange} />

      <TrackRecordsCarousel userId={user?.id} onNavigate={onViewChange} />

      <StrengthRecordsCarousel userId={user?.id} onNavigate={onViewChange} />
    </div>
  );
};

export default Dashboard;
