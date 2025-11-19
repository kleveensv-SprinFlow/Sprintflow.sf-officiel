import React from 'react';
import { useRecords } from '../../hooks/useRecords';
import { Loader2, Zap, ArrowRight } from 'lucide-react';
import CardCarousel from '../common/CardCarousel';
import { formatTime } from '../../utils/formatters';
import useAuth from '../../hooks/useAuth';

const TrackRecordsCarousel: React.FC = () => {
  const { user } = useAuth();
  // ▼▼▼ CORRECTION ▼▼▼
  // On récupère 'trackRecords' et on le renomme en 'records' pour le reste du composant
  const { trackRecords: records, loading } = useRecords(user?.id);

  // Le reste du code n'a pas besoin de changer car 'records' est maintenant défini.

  if (loading) {
    return (
      <div className="bg-sprint-light-surface dark:bg-sprint-dark-surface shadow-card-default rounded-2xl p-4 h-48 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4 mt-8">
        <h2 className="text-xl font-bold text-sprint-light-text-primary dark:text-sprint-dark-text-primary">Records (Course)</h2>
        <button onClick={() => {}} className="flex items-center text-sm font-semibold text-primary hover:underline">
          Voir tout <ArrowRight className="w-4 h-4 ml-1" />
        </button>
      </div>
      {records.length === 0 ? (
        <div className="bg-sprint-light-surface dark:bg-sprint-dark-surface shadow-card-default rounded-2xl p-4 h-40 flex flex-col items-center justify-center text-center">
          <Zap className="w-10 h-10 text-sprint-light-text-secondary dark:text-sprint-dark-text-secondary mb-2" />
          <h3 className="font-semibold text-sprint-light-text-primary dark:text-sprint-dark-text-primary">Aucun record de course</h3>
          <p className="text-sm text-sprint-light-text-secondary dark:text-sprint-dark-text-secondary">Ajoutez votre premier record !</p>
        </div>
      ) : (
        <CardCarousel>
          {records.map(record => (
            <div key={record.id} className="w-64 h-40 flex-shrink-0 bg-sprint-light-surface dark:bg-sprint-dark-surface shadow-card-default rounded-2xl p-4 flex flex-col justify-between">
              <div>
                <h3 className="font-bold text-lg text-sprint-light-text-primary dark:text-sprint-dark-text-primary truncate">{record.exercice_name}</h3>
                <p className="text-sm text-sprint-light-text-secondary dark:text-sprint-dark-text-secondary">{new Date(record.date).toLocaleDateString('fr-FR')}</p>
              </div>
              <div className="text-left">
                <span className="text-3xl font-bold text-sprint-light-text-primary dark:text-sprint-dark-text-primary">{formatTime(record.value)}</span>
              </div>
            </div>
          ))}
        </CardCarousel>
      )}
    </div>
  );
};

export { TrackRecordsCarousel };