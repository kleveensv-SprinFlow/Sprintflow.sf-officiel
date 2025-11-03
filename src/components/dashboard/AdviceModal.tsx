import React, { useState, useEffect } from 'react';
import { X, HeartPulse, Zap, TrendingUp, CheckCircle, Loader2, Target, TrendingUp as TrendIcon } from 'lucide-react';
import { supabase } from '../../lib/supabase';

const getThemeConfig = (color: string) => {
  switch (color) {
    case 'text-green-500':
      return { bg: 'bg-green-100 dark:bg-green-900/30', icon: HeartPulse, title: "Analyse de votre Forme" };
    case 'text-blue-500':
      return { bg: 'bg-blue-100 dark:bg-blue-900/30', icon: Zap, title: "Analyse de votre Poids/Puissance" };
    case 'text-purple-500':
      return { bg: 'bg-purple-100 dark:bg-purple-900/30', icon: TrendingUp, title: "Analyse de votre Évolution" };
    default:
      return { bg: 'bg-gray-100 dark:bg-gray-900/30', icon: CheckCircle, title: "Analyse" };
  }
};

const COLOR_MAP = {
    forme: 'text-green-500',
    poidsPuissance: 'text-blue-500',
    evolution: 'text-purple-500'
}

const FUNCTION_MAP = {
  forme: 'conseils_forme',
  poidsPuissance: 'conseils_poids_puissance',
  evolution: 'conseils_evolution'
}

interface AdviceModalProps {
  content: {
    type: 'forme' | 'poidsPuissance' | 'evolution';
    data: any;
  };
  onClose: () => void;
}

const AdviceModal: React.FC<AdviceModalProps> = ({ content, onClose }) => {
  const color = COLOR_MAP[content.type];
  const { bg, icon: Icon, title } = getThemeConfig(color);
  const [adviceData, setAdviceData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAdvice();
  }, []);

  const loadAdvice = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const functionName = FUNCTION_MAP[content.type];

      const response = await fetch(`${supabaseUrl}/functions/v1/${functionName}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ scoreData: content.data })
      });

      if (response.ok) {
        const data = await response.json();
        setAdviceData(data);
      }
    } catch (error) {
      console.error('Erreur chargement conseils:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md dark:backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border dark:border-gray-700" onClick={e => e.stopPropagation()}>
        <div className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-full ${bg}`}>
                <Icon className={`w-6 h-6 ${color}`} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">{title}</h3>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
              <X className="w-6 h-6" />
            </button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            </div>
          ) : adviceData ? (
            <div className="space-y-6">
              {/* Objectifs */}
              {adviceData.objectifs && adviceData.objectifs.length > 0 && (
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                    <Target className="w-5 h-5 text-blue-500" />
                    Objectifs
                  </h4>
                  <div className="space-y-2">
                    {adviceData.objectifs.map((obj: string, index: number) => (
                      <div key={index} className="flex items-start gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <CheckCircle className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
                        <p className="text-gray-700 dark:text-gray-300">{obj}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Conseils */}
              {adviceData.conseils && adviceData.conseils.length > 0 && (
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                    <TrendIcon className="w-5 h-5 text-green-500" />
                    Conseils Personnalisés
                  </h4>
                  <div className="space-y-2">
                    {adviceData.conseils.map((conseil: string, index: number) => (
                      <div key={index} className="flex items-start gap-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                        <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <p className="text-gray-700 dark:text-gray-300">{conseil}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Nutrition (pour poids/puissance) */}
              {adviceData.nutrition && adviceData.nutrition.length > 0 && (
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                    Nutrition
                  </h4>
                  <div className="space-y-2">
                    {adviceData.nutrition.map((nutrition: string, index: number) => (
                      <div key={index} className="flex items-start gap-3 p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                        <CheckCircle className="w-5 h-5 text-orange-500 mt-0.5 flex-shrink-0" />
                        <p className="text-gray-700 dark:text-gray-300">{nutrition}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tendances (pour évolution) */}
              {adviceData.tendances && adviceData.tendances.length > 0 && (
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                    Tendances
                  </h4>
                  <div className="space-y-2">
                    {adviceData.tendances.map((tendance: any, index: number) => (
                      <div key={index} className="flex items-start gap-3 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                        <span className="text-2xl">{tendance.emoji}</span>
                        <div>
                          <p className="font-semibold text-gray-900 dark:text-white">{tendance.titre}</p>
                          <p className="text-gray-700 dark:text-gray-300 text-sm">{tendance.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              Impossible de charger les conseils
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdviceModal;