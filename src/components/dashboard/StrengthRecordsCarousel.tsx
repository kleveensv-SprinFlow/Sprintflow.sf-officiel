import React from 'react';
import { useRecords } from '../../hooks/useRecords';
import { useBodyComposition } from '../../hooks/useBodyComposition';
import { Loader2, Dumbbell, ArrowRight } from 'lucide-react';
import CardCarousel from '../common/CardCarousel';
import { Record } from '../../types';
import useAuth from '../../hooks/useAuth';

const StrengthRecordsCarousel: React.FC = () => {
  const { user } = useAuth();
  // ▼▼▼ CORRECTION ▼▼▼
  // On récupère 'strengthRecords' et on le renomme en 'records' pour le reste du composant
  const { strengthRecords: records, loading: recordsLoading } = useRecords(user?.id);
  const { bodyComps, loading: bodycompLoading } = useBodyComposition();

  // Le reste du code n'a pas besoin de changer car 'records' est maintenant défini.

  const getPowerToWeightRatio = (record: Record) => {
    const latestBodycomp = bodyComps[0];
    if (!latestBodycomp || !latestBodycomp.weight || record.value === 0) return null;
    const ratio = record.value / latestBodycomp.weight;
    return ratio.toFixed(2);
  };

  const loading = recordsLoading || bodycompLoading;

  if (loading) {
    return (
      <div className="bg-sprint-light-surface dark:bg-sprint-dark-surface shadow-card-default rounded-2xl p-4 h-48 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-sprint-light-text-primary dark:text-sprint-dark-text-primary">Records (Force)</h2>
        <button onClick={() => {}} className="flex items-center text-sm font-semibold text-primary hover:underline">
          Voir tout <ArrowRight className="w-4 h-4 ml-1" />
        </button>
      </div>
      {records.length === 0 ? (
        <div className="bg-sprint-light-surface dark:bg-sprint-dark-surface shadow-card-default rounded-2xl p-4 h-40 flex flex-col items-center justify-center text-center">
          <Dumbbell className="w-10 h-10 text-sprint-light-text-secondary dark:text-sprint-dark-text-secondary mb-2" />
          <h3 className="font-semibold text-sprint-light-text-primary dark:text-sprint-dark-text-primary">Aucun record de force</h3>
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
              <div className="flex items-baseline justify-between">
                <span className="text-3xl font-bold text-sprint-light-text-primary dark:text-sprint-dark-text-primary">{record.value} kg</span>
                {getPowerToWeightRatio(record) && <span className="text-sm font-semibold text-blue-500">{getPowerToWeightRatio(record)}x Poids</span>}
              </div>
            </div>
          ))}
        </CardCarousel>
      )}
    </div>
  );
};

export { StrengthRecordsCarousel };