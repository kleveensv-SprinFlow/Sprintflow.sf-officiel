import React, { useState, useEffect } from 'react';
import { Lightbulb, Loader2, RefreshCw, AlertCircle, Activity, Zap } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { MESSAGES, getCombinedMessage } from '../../lib/messages';

interface ScoreData {
  score: number;
  calibration?: boolean;
  message_id?: string;
  mini_scores?: any;
  details?: any;
  cause?: string;
}

export function DetailedAnalysis() {
  const [scoreForme, setScoreForme] = useState<ScoreData | null>(null);
  const [indicePerf, setIndicePerf] = useState<ScoreData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeMessages, setActiveMessages] = useState<string[]>([]);

  useEffect(() => {
    loadAnalysis();
  }, []);

  const loadAnalysis = async () => {
    setIsLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;

      const [formeRes, indiceRes] = await Promise.all([
        fetch(`${supabaseUrl}/functions/v1/get_score_forme`, {
          headers: { 'Authorization': `Bearer ${session.access_token}` },
        }),
        fetch(`${supabaseUrl}/functions/v1/get_indice_performance`, {
          headers: { 'Authorization': `Bearer ${session.access_token}` },
        }),
      ]);

      const formeData = await formeRes.json();
      const indiceData = await indiceRes.json();

      setScoreForme(formeData);
      setIndicePerf(indiceData);

      const messages: string[] = [];

      if (!formeData.calibration && formeData.score !== null && indiceData.score !== null) {
        const combinedKey = getCombinedMessage(formeData.score, indiceData.score);
        if (MESSAGES[combinedKey]) {
          messages.push(combinedKey);
        }

        if (formeData.message_id && MESSAGES[formeData.message_id]) {
          if (!messages.includes(formeData.message_id)) {
            messages.push(formeData.message_id);
          }
        }

        if (indiceData.message_id && MESSAGES[indiceData.message_id]) {
          if (!messages.includes(indiceData.message_id)) {
            messages.push(indiceData.message_id);
          }
        }
      }

      setActiveMessages(messages);
    } catch (error) {
      console.error('Erreur chargement analyse:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getCardClass = (color: string) => {
    const colors = {
      red: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800',
      orange: 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800',
      blue: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800',
      green: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800',
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  const getTextClass = (color: string) => {
    const colors = {
      red: 'text-red-800 dark:text-red-300',
      orange: 'text-orange-800 dark:text-orange-300',
      blue: 'text-blue-800 dark:text-blue-300',
      green: 'text-green-800 dark:text-green-300',
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <Lightbulb className="w-10 h-10 text-yellow-500" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Analyse Détaillée</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Comprendre tes scores et optimiser ta performance
            </p>
          </div>
        </div>
        <button
          onClick={loadAnalysis}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Actualiser
        </button>
      </div>

      {scoreForme?.calibration ? (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-8 text-center">
          <AlertCircle className="w-16 h-16 text-blue-600 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-blue-900 dark:text-blue-200 mb-2">
            Mode Calibration Actif
          </h3>
          <p className="text-blue-700 dark:text-blue-300 mb-4">
            {scoreForme.message}
          </p>
          <p className="text-sm text-blue-600 dark:text-blue-400">
            Continue de remplir tes données quotidiennes pour débloquer l'analyse complète.
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center mb-4">
                <Activity className="w-6 h-6 text-blue-600 mr-2" />
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Score de Forme</h3>
              </div>
              <div className="flex items-center justify-center mb-4">
                <div className="text-5xl font-bold text-blue-600">{scoreForme?.score || 0}</div>
                <span className="text-gray-500 dark:text-gray-400 ml-2">/100</span>
              </div>
              {scoreForme?.mini_scores && (
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Récupération (50%)</span>
                    <span className="font-medium">{scoreForme.mini_scores.recuperation}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Charge (50%)</span>
                    <span className="font-medium">{scoreForme.mini_scores.charge}</span>
                  </div>
                </div>
              )}
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center mb-4">
                <Zap className="w-6 h-6 text-yellow-600 mr-2" />
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Indice de Performance</h3>
              </div>
              <div className="flex items-center justify-center mb-4">
                <div className="text-5xl font-bold text-yellow-600">{indicePerf?.score || 0}</div>
                <span className="text-gray-500 dark:text-gray-400 ml-2">/100</span>
              </div>
              {indicePerf?.mini_scores && (
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Composition (30%)</span>
                    <span className="font-medium">{indicePerf.mini_scores.composition}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Force (30%)</span>
                    <span className="font-medium">{indicePerf.mini_scores.force}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Vélocité (40%)</span>
                    <span className="font-medium">{indicePerf.mini_scores.velocite}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {activeMessages.length > 0 ? (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Analyses Contextuelles</h2>
              {activeMessages.map((messageKey, index) => {
                const message = MESSAGES[messageKey];
                if (!message) return null;

                return (
                  <div
                    key={index}
                    className={`${getCardClass(message.color)} border-2 rounded-lg p-6 shadow-lg`}
                  >
                    <div className="flex items-start gap-4">
                      <Lightbulb className={`w-8 h-8 ${getTextClass(message.color)} flex-shrink-0 mt-1`} />
                      <div className="flex-1">
                        <h3 className={`text-xl font-bold mb-3 ${getTextClass(message.color)}`}>
                          {message.short}
                        </h3>
                        <div className={`text-sm leading-relaxed ${getTextClass(message.color)}`}>
                          {message.long}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-12 text-center">
              <Lightbulb className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                Aucune analyse spécifique pour le moment
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Continue de remplir tes données pour recevoir des analyses personnalisées.
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
