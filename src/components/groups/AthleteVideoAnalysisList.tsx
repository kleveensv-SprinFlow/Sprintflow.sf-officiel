import React, { useState, useEffect } from 'react';
import { useVideoAnalysisLogs, VideoAnalysisLog } from '../../hooks/useVideoAnalysisLogs';
import { Loader2, Video, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface AthleteVideoAnalysisListProps {
  athleteId: string;
}

export function AthleteVideoAnalysisList({ athleteId }: AthleteVideoAnalysisListProps) {
  const [logs, setLogs] = useState<VideoAnalysisLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { getAthleteAnalysisLogs } = useVideoAnalysisLogs();

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        setLoading(true);
        setError(null);
        const fetchedLogs = await getAthleteAnalysisLogs(athleteId);
        setLogs(fetchedLogs.filter(log => log.shared_with_coach));
      } catch (e: any) {
        setError("Erreur lors de la récupération des analyses vidéo.");
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    if (athleteId) {
      fetchLogs();
    }
  }, [athleteId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <AlertTriangle className="w-12 h-12 text-red-500 mb-4" />
        <h3 className="text-lg font-semibold text-red-600">Une erreur est survenue</h3>
        <p className="text-gray-600 dark:text-gray-400">{error}</p>
      </div>
    );
  }

  if (logs.length === 0) {
    return (
      <div className="text-center p-8 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <Video className="w-12 h-12 mx-auto text-gray-400 mb-4" />
        <h3 className="text-xl font-semibold">Aucune analyse partagée</h3>
        <p className="text-gray-500 mt-2">
          Cet athlète n'a pas encore partagé d'analyse vidéo avec vous.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {logs.map((log) => {
        const criteria = [
          { key: 'profondeur_atteinte', label: 'Profondeur', success: log.result_json?.profondeur_atteinte },
          { key: 'dos_neutre', label: 'Dos Neutre', success: log.result_json?.dos_neutre },
          { key: 'avancee_genoux', label: 'Genoux Contrôlés', success: log.result_json?.avancee_genoux_controlee },
        ];

        return (
          <div key={log.id} className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md border dark:border-gray-700">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="aspect-video bg-gray-900 rounded-md overflow-hidden">
                  <video src={log.video_url} controls className="w-full h-full"/>
              </div>
              <div>
                <h4 className="font-bold text-lg">{log.exercise_name}</h4>
                <p className="text-sm text-gray-500 mb-3">
                  {format(new Date(log.created_at), 'd MMMM yyyy à HH:mm', { locale: fr })}
                </p>

                {log.analysis_status === 'COMPLETED' && log.result_json ? (
                   <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-md space-y-2">
                      {criteria.map(c => (
                        <div key={c.key} className="flex items-center text-sm">
                           {c.success ? <CheckCircle className="w-5 h-5 text-green-500 mr-2" /> : <XCircle className="w-5 h-5 text-red-500 mr-2" />}
                           <span>{c.label}: <span className={c.success ? 'font-semibold text-green-600' : 'font-semibold text-red-600'}>{c.success ? 'Oui' : 'Non'}</span></span>
                        </div>
                      ))}
                   </div>
                ) : log.analysis_status === 'ERROR' ? (
                   <p className="text-red-500">L'analyse a échoué pour cette vidéo.</p>
                ) : (
                    <p className="text-yellow-500">Analyse en cours...</p>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
