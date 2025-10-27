import React, { useState, useEffect } from 'react';
import { Lightbulb, HeartPulse, Zap, TrendingUp, Loader2, RefreshCw, ChevronRight } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { FormeAdvice } from './FormeAdvice';
import { PoidsPuissanceAdvice } from './PoidsPuissanceAdvice';
import { EvolutionAdvice } from './EvolutionAdvice';

type AdviceView = 'menu' | 'forme' | 'poids-puissance' | 'evolution';

interface ScoresData {
  forme: any;
  performance: any;
  evolution: any;
}

export function AdvicePanel() {
  const [currentView, setCurrentView] = useState<AdviceView>('menu');
  const [scores, setScores] = useState<ScoresData>({
    forme: null,
    performance: null,
    evolution: null,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadScores();
  }, []);

  const loadScores = async () => {
    setIsLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const headers = { 'Authorization': `Bearer ${session.access_token}` };

      const [formeRes, performanceRes, evolutionRes] = await Promise.all([
        fetch(`${supabaseUrl}/functions/v1/get_score_forme`, { headers }),
        fetch(`${supabaseUrl}/functions/v1/get_indice_poids_puissance`, { method: 'POST', headers }),
        fetch(`${supabaseUrl}/functions/v1/get_indice_evolution`, { method: 'POST', headers }),
      ]);

      const formeData = await formeRes.json();
      const performanceData = await performanceRes.json();
      const evolutionData = await evolutionRes.json();

      setScores({
        forme: formeData.error ? null : { indice: formeData.score, ...formeData },
        performance: performanceData.error ? null : performanceData,
        evolution: evolutionData.error ? null : evolutionData,
      });
    } catch (error) {
      console.error('Erreur chargement scores:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
      </div>
    );
  }

  if (currentView === 'forme') {
    return <FormeAdvice data={scores.forme} onBack={() => setCurrentView('menu')} onRefresh={loadScores} />;
  }

  if (currentView === 'poids-puissance') {
    return <PoidsPuissanceAdvice data={scores.performance} onBack={() => setCurrentView('menu')} onRefresh={loadScores} />;
  }

  if (currentView === 'evolution') {
    return <EvolutionAdvice data={scores.evolution} onBack={() => setCurrentView('menu')} onRefresh={loadScores} />;
  }

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 space-y-6">
      <div className="flex items-center justify-between mb-6 sm:mb-8">
        <div className="flex items-center gap-3">
          <Lightbulb className="w-8 h-8 sm:w-10 sm:h-10 text-yellow-500" />
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Conseils Personnalisés</h1>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
              Basés sur tes performances et tes données
            </p>
          </div>
        </div>
        <button
          onClick={loadScores}
          className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm"
        >
          <RefreshCw className="w-4 h-4" />
          <span className="hidden sm:inline">Actualiser</span>
        </button>
      </div>

      <div className="space-y-4">
        <MenuCard
          icon={<HeartPulse className="w-8 h-8" />}
          title="Indice de Forme"
          description="Analyse de ton état de forme et conseils de récupération"
          score={scores.forme?.indice}
          color="green"
          onClick={() => setCurrentView('forme')}
        />

        <MenuCard
          icon={<Zap className="w-8 h-8" />}
          title="Rapport Poids/Puissance"
          description="Optimisation de ta composition corporelle et puissance"
          score={scores.performance?.indice}
          color="blue"
          onClick={() => setCurrentView('poids-puissance')}
        />

        <MenuCard
          icon={<TrendingUp className="w-8 h-8" />}
          title="Indice d'Évolution"
          description="Suivi de tes progrès et objectifs à atteindre"
          score={scores.evolution?.indice}
          color="purple"
          onClick={() => setCurrentView('evolution')}
        />
      </div>
    </div>
  );
}

interface MenuCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  score: number | null | undefined;
  color: 'green' | 'blue' | 'purple';
  onClick: () => void;
}

function MenuCard({ icon, title, description, score, color, onClick }: MenuCardProps) {
  const colorClasses = {
    green: 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800',
    blue: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800',
    purple: 'text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800',
  };

  return (
    <button
      onClick={onClick}
      className={`w-full ${colorClasses[color]} border-2 rounded-xl p-4 sm:p-6 hover:shadow-lg transition-all duration-200 hover:scale-[1.02]`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-start gap-4">
          <div className={colorClasses[color].split(' ')[0]}>
            {icon}
          </div>
          <div className="text-left flex-1">
            <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-1">
              {title}
            </h3>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
              {description}
            </p>
            {score !== null && score !== undefined && (
              <div className="mt-2">
                <span className="text-2xl font-bold text-gray-900 dark:text-white">
                  {score}
                </span>
                <span className="text-sm text-gray-500 dark:text-gray-400 ml-1">/100</span>
              </div>
            )}
          </div>
        </div>
        <ChevronRight className="w-6 h-6 text-gray-400" />
      </div>
    </button>
  );
}
