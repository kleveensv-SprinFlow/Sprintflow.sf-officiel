import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CoachDashboard } from './dashboard/CoachDashboard';
import { AthleteDailyPlanCarousel } from './dashboard/AthleteDailyPlanCarousel';
import { StrengthRecordsCarousel } from './dashboard/StrengthRecordsCarousel';
import { TrackRecordsCarousel } from './dashboard/TrackRecordsCarousel';
import { IndicesPanel } from './dashboard/IndicesPanel';
import { CheckinModal } from './dashboard/CheckinModal';
import OnboardingPerformanceModal from './dashboard/OnboardingPerformanceModal';
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
  const [isOnboardingModalOpen, setIsOnboardingModalOpen] = useState(false);
  const [scoreForme, setScoreForme] = useState<{ indice: number | null } | null>(null);
  const [scorePerformance, setScorePerformance] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  const today = new Date().toISOString().split('T')[0];
  const hasCheckedInToday = wellnessData?.some(log => log.date === today && log.ressenti_sommeil !== null) || false;

  const loadScores = async () => {
    if (!user?.id) {
      console.log('📊 [Dashboard] Pas d\'utilisateur, skip chargement scores');
      setLoading(false);
      return;
    }

    try {
      console.log('📊 [Dashboard] Début chargement scores pour:', user.id);
      setLoading(true);
      
      // ▼▼▼ CORRECTION ICI ▼▼▼
      // Appel de la fonction RPC 'get_latest_indices' qui retourne tous les indices.
      try {
        const { data, error } = await supabase.rpc('get_latest_indices');
        if (error) throw error;
        console.log('💪 [Dashboard] Indices reçus:', data);
        
        // On met à jour les deux scores depuis la même source de données
        setScorePerformance(data?.poids_puissance_data || null);
        setScoreForme({ indice: data?.forme_data?.indice_de_forme || null });

      } catch (error) {
        console.error('❌ [Dashboard] Erreur lors du chargement des indices:', error);
        setScorePerformance(null);
        setScoreForme({ indice: null });
      }
      // ▲▲▲ FIN DE LA CORRECTION ▲▲▲

    } catch (e: any) {
      console.error('❌ [Dashboard] Erreur générale chargement scores:', e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log('📊 [Dashboard] Monté ou user/role a changé. Role:', userRole);
    if (userRole === 'athlete') {
      loadScores();
    } else if (!userRole) {
      setLoading(false);
    }
  }, [userRole, user?.id]);

  useEffect(() => {
    const checkOnboarding = async () => {
      if (user) {
        const { data } = await supabase.from('profiles').select('onboarding_completed').eq('id', user.id).single();
        if (data && !data.onboarding_completed) {
          setIsOnboardingModalOpen(true);
        }
      }
    };
    checkOnboarding();
  }, [user]);

  if (userRole === 'coach') {
    return <CoachDashboard />;
  }

  return (
    <div className="flex flex-col min-h-screen bg-sprint-dark-blue p-4 pt-20 md:pt-4 space-y-8">
      <AnimatePresence>
        {!hasCheckedInToday && !isCheckinOpen && (
           <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-sprint-primary-dark rounded-xl p-4 text-center cursor-pointer"
            onClick={() => setCheckinOpen(true)}
          >
            <p>Comment te sens-tu aujourd'hui ? Fais ton check-in.</p>
          </motion.div>
        )}
      </AnimatePresence>
      <IndicesPanel 
        scoreForme={scoreForme?.indice} 
        scorePerformance={scorePerformance} 
        onCheckinClick={() => setCheckinOpen(true)}
        hasCheckedIn={hasCheckedInToday}
      />
      <AthleteDailyPlanCarousel />
      <StrengthRecordsCarousel />
      <TrackRecordsCarousel />

      <AnimatePresence>
        {isCheckinOpen && (
          <CheckinModal
            onClose={() => setCheckinOpen(false)}
            onSuccess={() => {
              refreshWellnessData();
              loadScores();
            }}
          />
        )}
      </AnimatePresence>
       <AnimatePresence>
        {isOnboardingModalOpen && <OnboardingPerformanceModal onClose={() => setIsOnboardingModalOpen(false)} />}
      </AnimatePresence>
    </div>
  );
};

export default Dashboard;