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
  onViewChange?: (view: any) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ userRole }) => {
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
      if (!user?.id) {
        console.log('📊 [Dashboard] Pas d\'utilisateur, skip chargement scores');
        setLoading(false);
        return;
      }

      try {
        console.log('📊 [Dashboard] Début chargement scores pour:', user.id);
        setLoading(true);

        if (hasCheckedInToday) {
          console.log('✅ [Dashboard] Check-in effectué, chargement des indices');

          try {
            const { data: formeData, error: formeError } = await supabase.rpc('get_current_indice_forme', { user_id_param: user.id });
            if (formeError) throw formeError;
            console.log('📈 [Dashboard] Indice forme:', formeData);
            setScoreForme({ indice: formeData });
          } catch (error) {
            console.error('❌ [Dashboard] Erreur lors du chargement de l\'indice de forme:', error);
            setScoreForme({ indice: null });
          }

          try {
            const { data: perfData, error: perfError } = await supabase.rpc('get_indice_poids_puissance', { user_id_param: user.id });
            if (perfError) throw perfError;
            console.log('💪 [Dashboard] Indice performance:', perfData);
            setScorePerformance({ indice: perfData });
          } catch (error) {
            console.error('❌ [Dashboard] Erreur lors du chargement de l\'indice de performance:', error);
            setScorePerformance({ indice: null });
          }
          console.log('✅ [Dashboard] Scores chargés avec succès');
        } else {
          console.log('ℹ️ [Dashboard] Pas de check-in aujourd\'hui, skip indices');
        }
      } catch (error) {
        console.error('❌ [Dashboard] Erreur critique chargement scores:', error);
      } finally {
        setLoading(false);
        console.log('✅ [Dashboard] Chargement terminé');
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
    return <CoachDashboard />;
  }

  // Pour tous les autres rôles (athlète, développeur, etc.) ou si le rôle est indéfini,
  // affiche le dashboard de l'athlète par défaut.

  return (
    <div className="space-y-6">
      <IndicesPanel
        loading={loading}
        scoreForme={scoreForme}
        scorePerformance={scorePerformance}
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

      <AthleteDailyPlanCarousel userId={user?.id} />

      <TrackRecordsCarousel userId={user?.id} />

      <StrengthRecordsCarousel userId={user?.id} />
    </div>
  );
};

export default Dashboard;
