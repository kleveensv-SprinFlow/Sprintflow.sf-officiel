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

          // Charger l'indice de forme avec timeout
          const formePromise = supabase.rpc('get_current_indice_forme', { user_id_param: user.id });
          const { data: formeData, error: formeError } = await Promise.race([
            formePromise,
            new Promise<any>((_, reject) =>
              setTimeout(() => reject(new Error('Timeout indice forme')), 8000)
            )
          ]).catch(err => {
            console.warn('⚠️ [Dashboard] Timeout ou erreur indice forme:', err);
            return { data: null, error: null };
          });

          if (formeError) {
            console.error('❌ [Dashboard] Erreur indice forme:', formeError);
          } else {
            console.log('📈 [Dashboard] Indice forme:', formeData);
          }

          // Charger l'indice poids/puissance avec timeout
          const perfPromise = supabase.rpc('get_indice_poids_puissance', { user_id_param: user.id });
          const { data: perfData, error: perfError } = await Promise.race([
            perfPromise,
            new Promise<any>((_, reject) =>
              setTimeout(() => reject(new Error('Timeout indice performance')), 8000)
            )
          ]).catch(err => {
            console.warn('⚠️ [Dashboard] Timeout ou erreur indice performance:', err);
            return { data: null, error: null };
          });

          if (perfError) {
            console.error('❌ [Dashboard] Erreur indice performance:', perfError);
          } else {
            console.log('💪 [Dashboard] Indice performance:', perfData);
          }

          setScoreForme(formeData !== null ? { indice: formeData } : null);
          setScorePerformance(perfData ? { indice: perfData } : null);
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
    return <CoachDashboard onViewChange={onViewChange} />;
  }

  // Pour tous les autres rôles (athlète, développeur, etc.) ou si le rôle est indéfini,
  // affiche le dashboard de l'athlète par défaut.

  return (
    <div className="space-y-6">
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
