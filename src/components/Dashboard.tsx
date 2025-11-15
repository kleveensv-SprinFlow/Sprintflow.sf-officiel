import React, { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
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
      
      // We load performance score regardless of check-in
      try {
        const { data: perfData, error: perfError } = await supabase.rpc('get_indice_poids_puissance');
        if (perfError) throw perfError;
        console.log('💪 [Dashboard] Indice performance:', perfData);
        setScorePerformance(perfData);
      } catch (error) {
        console.error('❌ [Dashboard] Erreur lors du chargement de l\'indice de performance:', error);
        setScorePerformance(null);
      }

      if (hasCheckedInToday) {
        console.log('✅ [Dashboard] Check-in effectué, chargement indice forme');
        try {
          const { data: formeData, error: formeError } = await supabase.rpc('get_current_indice_forme');
          if (formeError) throw formeError;
          console.log('📈 [Dashboard] Indice forme:', formeData);
          setScoreForme({ indice: formeData });
        } catch (error) {
          console.error('❌ [Dashboard] Erreur lors du chargement de l\'indice de forme:', error);
          setScoreForme({ indice: null });
        }
      } else {
        setScoreForme({ indice: null });
        console.log('ℹ️ [Dashboard] Pas de check-in aujourd\'hui, skip indice forme');
      }
      
      console.log('✅ [Dashboard] Scores chargés');
    } catch (error) {
      console.error('❌ [Dashboard] Erreur critique chargement scores:', error);
    } finally {
      setLoading(false);
      console.log('✅ [Dashboard] Chargement terminé');
    }
  };

  useEffect(() => {
    loadScores();
  }, [user?.id, hasCheckedInToday]);

  const handleCheckinSuccess = () => {
    setCheckinOpen(false);
    refreshWellnessData();
  };
  
  const handleOnboardingComplete = () => {
    setIsOnboardingModalOpen(false);
    loadScores();
  };

  if (userRole === 'coach') {
    return <CoachDashboard />;
  }

  return (
    <div className="space-y-6">
      <IndicesPanel
        loading={loading}
        scoreForme={scoreForme}
        scorePerformance={scorePerformance}
        hasCheckedInToday={hasCheckedInToday}
        onCheckinClick={() => setCheckinOpen(true)}
        onOnboardingComplete={loadScores}
        onUnlockPerformanceClick={() => setIsOnboardingModalOpen(true)}
        onNavigate={() => {}} // Placeholder for now
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

      <OnboardingPerformanceModal
        isOpen={isOnboardingModalOpen}
        onClose={() => setIsOnboardingModalOpen(false)}
        onComplete={handleOnboardingComplete}
      />

      <AthleteDailyPlanCarousel userId={user?.id} />
      <TrackRecordsCarousel userId={user?.id} />
      <StrengthRecordsCarousel userId={user?.id} />
    </div>
  );
};

export default Dashboard;
