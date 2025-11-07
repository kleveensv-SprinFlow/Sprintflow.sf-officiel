import React from 'react';
import { useRecords } from '../../hooks/useRecords';
import { Record } from '../../types';

interface AthleteRecordsCarouselProps {
  onNavigate: () => void;
}

export const AthleteRecordsCarousel: React.FC<AthleteRecordsCarouselProps> = ({ onNavigate }) => {
  const { records, loading } = useRecords();

  const latestRecords = records.slice(0, 5);

  return (
    <div className="bg-light-card dark:bg-dark-card shadow-card-light dark:shadow-card-dark rounded-lg p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-light-title dark:text-dark-title">Derniers Records</h2>
        <button onClick={onNavigate} className="text-sm text-sprintflow-blue font-semibold">Voir tout</button>
      </div>
      {loading && <p>Chargement...</p>}
      <div className="space-y-2">
        {latestRecords.map((record: Record) => (
          <div key={record.id} className="flex justify-between p-2 rounded-md bg-light-background dark:bg-dark-background">
            <span className="font-semibold">{record.exercice_name}</span>
            <span>{record.value} {record.unit}</span>
          </div>
        ))}
      </div>
    </div>
  );
};