// src/components/Dashboard.tsx
import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { CoachDashboard } from './dashboard/CoachDashboard';
import { IndicesPanel } from './dashboard/IndicesPanel';
import { RecentWorkouts } from './dashboard/RecentWorkouts';
import { TrackRecordsCarousel } from './dashboard/TrackRecordsCarousel';
import { StrengthRecordsCarousel } from './dashboard/StrengthRecordsCarousel';
import { GroupOverview } from './dashboard/GroupOverview';
import { WellnessCheckinCard } from './dashboard/WellnessCheckinCard';

interface DashboardProps {
  userRole?: 'athlete' | 'coach' | 'developer';
  onViewChange: (view: any) => void;
  onScoresLoad?: (refreshScores: () => Promise<void>) => void;
}

export default function Dashboard({ userRole, onViewChange, onScoresLoad }: DashboardProps) {
  const [scores, setScores] = useState({
    forme: null,
    performance: null,
    evolution: null,
  });
  const [loadingScores, setLoadingScores] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadScores();
    if (onScoresLoad) {
      onScoresLoad(loadScores);
    }
  }, []);

  const loadScores = async () => {
    setLoadingScores(true);
    setError(null);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setLoadingScores(false);
        return;
      }

      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const headers = { 'Authorization': `Bearer ${session.access_token}` };

      const [formeRes, performanceRes, evolutionRes] = await Promise.all([
        fetch(`${supabaseUrl}/functions/v1/get_score_forme`, { headers }).catch(() => null),
        fetch(`${supabaseUrl}/functions/v1/get_indice_poids_puissance`, { method: 'POST', headers }).catch(() => null),
        fetch(`${supabaseUrl}/functions/v1/get_indice_evolution`, { method: 'POST', headers }).catch(() => null),
      ]);

      const formeData = formeRes ? await formeRes.json().catch(() => ({ error: true })) : { error: true };
      const performanceData = performanceRes ? await performanceRes.json().catch(() => ({ error: true })) : { error: true };
      const evolutionData = evolutionRes ? await evolutionRes.json().catch(() => ({ error: true })) : { error: true };

      setScores({
        forme: formeData.error ? null : { indice: formeData.score, ...formeData },
        performance: performanceData.error ? null : performanceData,
        evolution: evolutionData.error ? null : evolutionData,
      });

    } catch (error) {
      console.error('Erreur chargement scores:', error);
      setError('Erreur lors du chargement des données');
    } finally {
      setLoadingScores(false);
    }
  };

  if (userRole === 'coach' || userRole === 'developer') {
    return <CoachDashboard onNavigate={onViewChange} />;
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-red-800 dark:text-red-200">{error}</p>
          <button
            onClick={loadScores}
            className="mt-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <WellnessCheckinCard />

      <div className="text-center py-4">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
          Bienvenue sur <span className="text-blue-600 dark:text-blue-400">Sprintflow</span>
        </h1>
      </div>

      <IndicesPanel
        loading={loadingScores}
        scoreForme={scores.forme}
        scorePerformance={scores.performance}
        scoreEvolution={scores.evolution}
        onNavigate={() => onViewChange('ai')}
      />

      <TrackRecordsCarousel onNavigate={() => onViewChange('records')} />
      <StrengthRecordsCarousel onNavigate={() => onViewChange('records')} />
      <GroupOverview onNavigate={() => onViewChange('groups')} />

      <RecentWorkouts onNavigate={() => onViewChange('workouts')} />
    </div>
  );
}