import React, { useState, useEffect } from 'react';
import { ArrowLeft, HeartPulse, Moon, Activity, TrendingUp, AlertCircle, CheckCircle, Target, Loader2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface FormeAdviceProps {
  data: any;
  onBack: () => void;
  onRefresh: () => void;
}

export function FormeAdvice({ data, onBack, onRefresh }: FormeAdviceProps) {
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
      const response = await fetch(`${supabaseUrl}/functions/v1/conseils_forme`, {
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
      console.error('Erreur chargement conseils forme:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-12 h-12 animate-spin text-green-600" />
      </div>
    );
  }

  const score = data?.indice;
  const scoreLevel = score >= 80 ? 'excellent' : score >= 60 ? 'bon' : score >= 40 ? 'moyen' : 'faible';
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
          <HeartPulse className="w-8 h-8 sm:w-10 sm:h-10 text-green-600" />
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Indice de Forme</h1>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
              Analyse et conseils personnalisés
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
            État de forme : <span className="capitalize">{scoreLevel}</span>
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            {score >= 80 ? 'Tu es en excellente forme !' :
             score >= 60 ? 'Ta forme est correcte mais peut être améliorée' :
             score >= 40 ? 'Attention, ta forme nécessite des ajustements' :
             'Ta forme nécessite une attention immédiate'}
          </p>
        </div>
      </div>

      {advice && (
        <>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-lg">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Activity className="w-6 h-6 text-green-600" />
              Analyse Détaillée
            </h3>
            <div className="space-y-4">
              {advice.sommeil && (
                <DetailItem
                  icon={<Moon className="w-5 h-5" />}
                  title="Qualité du Sommeil"
                  value={`${advice.sommeil.moyenne}h (qualité: ${advice.sommeil.qualite}/5)`}
                  status={advice.sommeil.status}
                  comment={advice.sommeil.comment}
                />
              )}
              {advice.recuperation && (
                <DetailItem
                  icon={<Activity className="w-5 h-5" />}
                  title="Récupération"
                  value={advice.recuperation.value}
                  status={advice.recuperation.status}
                  comment={advice.recuperation.comment}
                />
              )}
              {advice.charge && (
                <DetailItem
                  icon={<TrendingUp className="w-5 h-5" />}
                  title="Charge d'Entraînement"
                  value={advice.charge.value}
                  status={advice.charge.status}
                  comment={advice.charge.comment}
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
        </>
      )}

      {!advice && (
        <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-12 text-center border border-gray-200 dark:border-gray-700">
          <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">
            Continue à enregistrer tes données pour recevoir des conseils personnalisés.
          </p>
        </div>
      )}
    </div>
  );
}

interface DetailItemProps {
  icon: React.ReactNode;
  title: string;
  value: string;
  status: 'good' | 'warning' | 'alert';
  comment: string;
}

function DetailItem({ icon, title, value, status, comment }: DetailItemProps) {
  const statusColors = {
    good: 'text-green-600 bg-green-50 dark:bg-green-900/20',
    warning: 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20',
    alert: 'text-red-600 bg-red-50 dark:bg-red-900/20',
  };

  return (
    <div className={`${statusColors[status]} rounded-lg p-4`}>
      <div className="flex items-center gap-3 mb-2">
        <div className={statusColors[status].split(' ')[0]}>
          {icon}
        </div>
        <div className="flex-1">
          <h4 className="font-semibold text-gray-900 dark:text-white">{title}</h4>
          <p className="text-sm text-gray-700 dark:text-gray-300">{value}</p>
        </div>
      </div>
      <p className="text-sm text-gray-600 dark:text-gray-400 ml-8">{comment}</p>
    </div>
  );
}
