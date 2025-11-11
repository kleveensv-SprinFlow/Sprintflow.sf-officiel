// src/components/dashboard/StrengthRecordsCarousel.tsx
import React from 'react';
import { useRecords } from '../../hooks/useRecords';
import { useBodyComposition } from '../../hooks/useBodyComposition';
import { Loader2, Dumbbell, Barbell, ArrowRight } from 'lucide-react';
import CardCarousel from '../common/CardCarousel';
import { Record } from '../../types';

interface StrengthRecordsCarouselProps {
  athleteId: string;
  onNavigateToRecords: () => void;
}

const StrengthRecordsCarousel: React.FC<StrengthRecordsCarouselProps> = ({ athleteId, onNavigateToRecords }) => {
  const { records, loading: recordsLoading } = useRecords(athleteId);
  const { bodyComps, loading: bodycompLoading } = useBodyComposition();

  const strengthRecords = records.filter(r => ['force', 'muscu'].includes(r.category));

  const getPowerToWeightRatio = (record: Record) => {
    const latestBodycomp = bodyComps[0];
    if (!latestBodycomp || !latestBodycomp.weight || record.value === 0) return null;
    const ratio = record.value / latestBodycomp.weight;
    return ratio.toFixed(2);
  };

  const loading = recordsLoading || bodycompLoading;

  if (loading) {
    return (
      <div className="bg-light-card dark:bg-dark-card shadow-card-default rounded-2xl p-4 h-48 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-light-title dark:text-dark-title">Records (Force)</h2>
        <button onClick={onNavigateToRecords} className="flex items-center text-sm font-semibold text-primary hover:underline">
          Voir tout <ArrowRight className="w-4 h-4 ml-1" />
        </button>
      </div>
      {strengthRecords.length === 0 ? (
        <div className="bg-light-card dark:bg-dark-card shadow-card-default rounded-2xl p-4 h-40 flex flex-col items-center justify-center text-center">
          <Dumbbell className="w-10 h-10 text-light-text dark:text-dark-text mb-2" />
          <h3 className="font-semibold text-light-title dark:text-dark-title">Aucun record de force</h3>
          <p className="text-sm text-light-text dark:text-dark-text">Ajoutez votre premier record !</p>
        </div>
      ) : (
        <CardCarousel>
          {strengthRecords.map(record => (
            <div key={record.id} className="w-64 h-40 flex-shrink-0 bg-light-card dark:bg-dark-card shadow-card-default rounded-2xl p-4 flex flex-col justify-between">
              <div>
                <h3 className="font-bold text-lg text-light-title dark:text-dark-title truncate">{record.exercice_name}</h3>
                <p className="text-sm text-light-text dark:text-dark-text">{new Date(record.date).toLocaleDateString('fr-FR')}</p>
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-3xl font-bold text-light-title dark:text-dark-title">{record.value}<span className="text-lg ml-1">kg</span></span>
                <div className="text-right">
                  <span className="text-sm font-semibold text-accent dark:text-dark-accent">Rapport Poids/Puissance</span>
                  <p className="font-bold text-light-title dark:text-dark-title">{getPowerToWeightRatio(record) || 'N/A'}</p>
                </div>
              </div>
            </div>
          ))}
        </CardCarousel>
      )}
    </div>
  );
};

export { StrengthRecordsCarousel };
export default StrengthRecordsCarousel;