import React, { useState, useEffect } from 'react';
import { Loader2, HeartPulse, Zap, TrendingUp, ChevronRight } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import AdviceModal from '../dashboard/AdviceModal';

interface AdvicePageProps {
  onNavigate?: (view: string) => void;
}

export function AdvicePage({ onNavigate }: AdvicePageProps) {
  const [scores, setScores] = useState({
    forme: null,
    performance: null,
    evolution: null,
  });
  const [loading, setLoading] = useState(true);
  const [selectedAdvice, setSelectedAdvice] = useState<{
    type: 'forme' | 'poidsPuissance' | 'evolution';
    data: any;
  } | null>(null);

  useEffect(() => {
    loadScores();
  }, []);

  const loadScores = async () => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setLoading(false);
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
    } finally {
      setLoading(false);
    }
  };

  const handleAdviceClick = (type: 'forme' | 'poidsPuissance' | 'evolution', data: any) => {
    if (data) {
      setSelectedAdvice({ type, data });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-500 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Chargement de vos conseils...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Mes Conseils Personnalisés
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Analyses détaillées et recommandations basées sur vos performances
        </p>
      </div>

      <div className="space-y-4">
        <button
          onClick={() => handleAdviceClick('forme', scores.forme)}
          disabled={!scores.forme}
          className={`w-full bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border-2 transition-all hover:shadow-xl ${
            scores.forme
              ? 'border-green-200 dark:border-green-800 hover:border-green-300 dark:hover:border-green-700'
              : 'border-gray-200 dark:border-gray-700 opacity-50 cursor-not-allowed'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-full">
                <HeartPulse className="w-8 h-8 text-green-500" />
              </div>
              <div className="text-left">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                  Analyse de Forme
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Récupération, sommeil et charge d'entraînement
                </p>
                {scores.forme && (
                  <p className="text-2xl font-bold text-green-500 mt-2">
                    {scores.forme.indice}/10
                  </p>
                )}
              </div>
            </div>
            {scores.forme && <ChevronRight className="w-6 h-6 text-gray-400" />}
          </div>
        </button>

        <button
          onClick={() => handleAdviceClick('poidsPuissance', scores.performance)}
          disabled={!scores.performance}
          className={`w-full bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border-2 transition-all hover:shadow-xl ${
            scores.performance
              ? 'border-blue-200 dark:border-blue-800 hover:border-blue-300 dark:hover:border-blue-700'
              : 'border-gray-200 dark:border-gray-700 opacity-50 cursor-not-allowed'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                <Zap className="w-8 h-8 text-blue-500" />
              </div>
              <div className="text-left">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                  Analyse Poids/Puissance
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Composition corporelle et force relative
                </p>
                {scores.performance && (
                  <p className="text-2xl font-bold text-blue-500 mt-2">
                    {scores.performance.indice}%
                  </p>
                )}
              </div>
            </div>
            {scores.performance && <ChevronRight className="w-6 h-6 text-gray-400" />}
          </div>
        </button>

        <button
          onClick={() => handleAdviceClick('evolution', scores.evolution)}
          disabled={!scores.evolution}
          className={`w-full bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border-2 transition-all hover:shadow-xl ${
            scores.evolution
              ? 'border-purple-200 dark:border-purple-800 hover:border-purple-300 dark:hover:border-purple-700'
              : 'border-gray-200 dark:border-gray-700 opacity-50 cursor-not-allowed'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-full">
                <TrendingUp className="w-8 h-8 text-purple-500" />
              </div>
              <div className="text-left">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                  Analyse d'Évolution
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Progression et régularité de vos entraînements
                </p>
                {scores.evolution && (
                  <p className="text-2xl font-bold text-purple-500 mt-2">
                    {scores.evolution.indice}/10
                  </p>
                )}
              </div>
            </div>
            {scores.evolution && <ChevronRight className="w-6 h-6 text-gray-400" />}
          </div>
        </button>
      </div>

      {!scores.forme && !scores.performance && !scores.evolution && (
        <div className="text-center py-12 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Aucune donnée disponible pour générer des conseils personnalisés.
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-500">
            Commencez par enregistrer vos entraînements, votre sommeil et vos records pour obtenir des analyses.
          </p>
        </div>
      )}

      {selectedAdvice && (
        <AdviceModal
          content={selectedAdvice}
          onClose={() => setSelectedAdvice(null)}
        />
      )}
    </div>
  );
}

export default AdvicePage;
