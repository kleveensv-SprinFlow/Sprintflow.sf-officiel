import React, { useState, useEffect } from 'react';
import { ArrowLeft, Zap, Scale, TrendingUp, AlertCircle, CheckCircle, Target, Loader2, Activity } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface PoidsPuissanceAdviceProps {
  data: any;
  onBack: () => void;
  onRefresh: () => void;
}

export function PoidsPuissanceAdvice({ data, onBack, onRefresh }: PoidsPuissanceAdviceProps) {
  const [advice, setAdvice] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadAdvice();
  }, [data]);

  const loadAdvice = async () => {
    setIsLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const response = await fetch(`${supabaseUrl}/functions/v1/conseils_poids_puissance`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ scoreData: data }),
      });

      const result = await response.json();
      setAdvice(result);
    } catch (error) {
      console.error('Erreur chargement conseils poids/puissance:', error);
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

  const score = data?.indice;
  const scoreLevel = score >= 80 ? 'excellent' : score >= 60 ? 'bon' : score >= 40 ? 'moyen' : 'à améliorer';
  const scoreColor = score >= 80 ? 'green' : score >= 60 ? 'blue' : score >= 40 ? 'yellow' : 'red';

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 space-y-6">
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={onBack}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-6 h-6 text-gray-700 dark:text-gray-300" />
        </button>
        <div className="flex items-center gap-3">
          <Zap className="w-8 h-8 sm:w-10 sm:h-10 text-blue-600" />
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Rapport Poids/Puissance</h1>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
              Optimisation de ta composition corporelle
            </p>
          </div>
        </div>
      </div>

      <div className={`bg-gradient-to-br from-${scoreColor}-50 to-${scoreColor}-100 dark:from-${scoreColor}-900/20 dark:to-${scoreColor}-800/20 rounded-2xl p-6 border-2 border-${scoreColor}-200 dark:border-${scoreColor}-700`}>
        <div className="text-center">
          <div className="inline-block">
            <div className={`w-32 h-32 sm:w-40 sm:h-40 rounded-full border-8 border-${scoreColor}-400 bg-white dark:bg-gray-800 flex items-center justify-center mb-4`}>
              <span className="text-5xl sm:text-6xl font-bold text-gray-900 dark:text-white">{score || '-'}</span>
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Rapport : <span className="capitalize">{scoreLevel}</span>
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            {score >= 80 ? 'Excellent rapport poids/puissance !' :
             score >= 60 ? 'Bon rapport, quelques optimisations possibles' :
             score >= 40 ? 'Des ajustements te permettront de progresser' :
             'Focus sur l\'optimisation de ta composition corporelle'}
          </p>
        </div>
      </div>

      {advice && (
        <>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-lg">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Activity className="w-6 h-6 text-blue-600" />
              Analyse Détaillée
            </h3>
            <div className="space-y-4">
              {advice.poids && (
                <MetricCard
                  icon={<Scale className="w-5 h-5" />}
                  title="Poids Actuel"
                  value={advice.poids.valeur}
                  evolution={advice.poids.evolution}
                  status={advice.poids.status}
                  comment={advice.poids.comment}
                />
              )}
              {advice.masseMaigre && (
                <MetricCard
                  icon={<Activity className="w-5 h-5" />}
                  title="Masse Maigre"
                  value={advice.masseMaigre.valeur}
                  evolution={advice.masseMaigre.evolution}
                  status={advice.masseMaigre.status}
                  comment={advice.masseMaigre.comment}
                />
              )}
              {advice.performance && (
                <MetricCard
                  icon={<Zap className="w-5 h-5" />}
                  title="Performance Sprint"
                  value={advice.performance.valeur}
                  evolution={advice.performance.evolution}
                  status={advice.performance.status}
                  comment={advice.performance.comment}
                />
              )}
            </div>
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6 border-2 border-blue-200 dark:border-blue-800">
            <h3 className="text-xl font-bold text-blue-900 dark:text-blue-100 mb-4 flex items-center gap-2">
              <Target className="w-6 h-6" />
              Objectifs Recommandés
            </h3>
            <div className="space-y-3">
              {advice.objectifs?.map((objectif: string, index: number) => (
                <div key={index} className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <p className="text-gray-700 dark:text-gray-300">{objectif}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-xl p-6 border-2 border-yellow-200 dark:border-yellow-800">
            <h3 className="text-xl font-bold text-yellow-900 dark:text-yellow-100 mb-4 flex items-center gap-2">
              <AlertCircle className="w-6 h-6" />
              Conseils Personnalisés
            </h3>
            <div className="space-y-3">
              {advice.conseils?.map((conseil: string, index: number) => (
                <div key={index} className="flex items-start gap-3 bg-white dark:bg-gray-800 p-4 rounded-lg">
                  <span className="text-2xl">💡</span>
                  <p className="text-gray-700 dark:text-gray-300 flex-1">{conseil}</p>
                </div>
              ))}
            </div>
          </div>

          {advice.nutrition && (
            <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-6 border-2 border-green-200 dark:border-green-800">
              <h3 className="text-xl font-bold text-green-900 dark:text-green-100 mb-4 flex items-center gap-2">
                <Scale className="w-6 h-6" />
                Conseils Nutritionnels
              </h3>
              <div className="space-y-3">
                {advice.nutrition.map((conseil: string, index: number) => (
                  <div key={index} className="flex items-start gap-3 bg-white dark:bg-gray-800 p-4 rounded-lg">
                    <span className="text-2xl">🍽️</span>
                    <p className="text-gray-700 dark:text-gray-300 flex-1">{conseil}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {!advice && (
        <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-12 text-center border border-gray-200 dark:border-gray-700">
          <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">
            Enregistre tes données de composition corporelle et tes performances pour recevoir des conseils.
          </p>
        </div>
      )}
    </div>
  );
}

interface MetricCardProps {
  icon: React.ReactNode;
  title: string;
  value: string;
  evolution?: string;
  status: 'good' | 'warning' | 'alert';
  comment: string;
}

function MetricCard({ icon, title, value, evolution, status, comment }: MetricCardProps) {
  const statusColors = {
    good: 'text-green-600 bg-green-50 dark:bg-green-900/20 border-green-200',
    warning: 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200',
    alert: 'text-red-600 bg-red-50 dark:bg-red-900/20 border-red-200',
  };

  return (
    <div className={`${statusColors[status]} rounded-lg p-4 border`}>
      <div className="flex items-center gap-3 mb-2">
        <div className={statusColors[status].split(' ')[0]}>
          {icon}
        </div>
        <div className="flex-1">
          <h4 className="font-semibold text-gray-900 dark:text-white">{title}</h4>
          <div className="flex items-center gap-2">
            <p className="text-lg font-bold text-gray-900 dark:text-white">{value}</p>
            {evolution && (
              <span className={`text-sm flex items-center gap-1 ${evolution.startsWith('+') ? 'text-green-600' : evolution.startsWith('-') ? 'text-red-600' : 'text-gray-600'}`}>
                <TrendingUp className="w-3 h-3" />
                {evolution}
              </span>
            )}
          </div>
        </div>
      </div>
      <p className="text-sm text-gray-600 dark:text-gray-400 ml-8">{comment}</p>
    </div>
  );
}
