import React from 'react';
import { CheckCircle, XCircle, Share2, PlusCircle, RotateCw } from 'lucide-react';
import { SquatAnalysisResult } from '../../hooks/useVideoAnalysis';
import { VideoAnalysisLog } from '../../hooks/useVideoAnalysisLogs';

interface AnalysisReportScreenProps {
  result: SquatAnalysisResult;
  log: VideoAnalysisLog;
  onShare: () => void;
  onComplete: () => void;
}

export function AnalysisReportScreen({ result, log, onShare, onComplete }: AnalysisReportScreenProps) {
  const criteria = [
    {
      key: 'profondeur_atteinte',
      label: 'Profondeur Atteinte',
      success: result.profondeur_atteinte,
    },
    {
      key: 'dos_neutre',
      label: 'Dos Neutre (Pas de "Butt Wink")',
      success: result.dos_neutre,
    },
    {
      key: 'avancee_genoux_controlee',
      label: 'Avancée des Genoux Contrôlée',
      success: result.avancee_genoux_controlee,
    },
  ];

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold">Rapport d'Analyse</h1>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          Voici les résultats de votre {log.exercise_name}.
        </p>
      </div>

      <div className="w-full aspect-video bg-gray-900 rounded-lg flex items-center justify-center">
        <video src={log.video_url} controls className="w-full h-full rounded-lg" />
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-3">Checklist des résultats</h2>
        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg space-y-3">
          {criteria.map((criterion) => (
            <div key={criterion.key} className="flex items-center">
              {criterion.success ? (
                <CheckCircle className="w-6 h-6 text-green-500 mr-3 flex-shrink-0" />
              ) : (
                <XCircle className="w-6 h-6 text-red-500 mr-3 flex-shrink-0" />
              )}
              <span className="font-medium flex-grow">{criterion.label}</span>
              <span className={`ml-4 font-bold ${criterion.success ? 'text-green-600' : 'text-red-600'}`}>
                {criterion.success ? 'Oui' : 'Non'}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
        <button
          onClick={onShare}
          className="flex items-center justify-center gap-3 p-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold"
        >
          <Share2 className="w-6 h-6" /> Partager avec mon coach
        </button>
        <button className="flex items-center justify-center gap-3 p-4 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-semibold cursor-not-allowed">
          <PlusCircle className="w-6 h-6" /> Ajouter au journal (Bientôt)
        </button>
      </div>

      <div className="pt-4">
         <button
          onClick={onComplete}
          className="w-full flex items-center justify-center gap-3 p-3 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-lg"
        >
          <RotateCw className="w-5 h-5" />
          Analyser une autre vidéo
        </button>
      </div>
    </div>
  );
}
