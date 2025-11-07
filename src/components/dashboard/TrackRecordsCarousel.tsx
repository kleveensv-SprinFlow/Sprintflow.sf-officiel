// src/components/dashboard/TrackRecordsCarousel.tsx
import React from 'react';
import { useRecords } from '../../hooks/useRecords';
import { Record } from '../../types';
import { GenericCardCarousel } from '../common/GenericCardCarousel';
import { RecordCard } from '../common/RecordCard';
import useAuth from '../../hooks/useAuth';

interface TrackRecordsCarouselProps {
  onNavigate: (view: string) => void;
}

export const TrackRecordsCarousel: React.FC<TrackRecordsCarouselProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const { records, loading } = useRecords(user?.id);

  const trackRecords = records.filter(r => r.type === 'run' || r.unit === 's');

  const getLatestUniqueRecords = (allRecords: Record[]): Record[] => {
    if (!allRecords || allRecords.length === 0) {
      return [];
    }

    const latestRecordsMap = new Map<string, Record>();
    const sortedRecords = [...allRecords].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    sortedRecords.forEach(record => {
      if (!latestRecordsMap.has(record.exercise_name)) {
        latestRecordsMap.set(record.exercise_name, record);
      }
    });

    return Array.from(latestRecordsMap.values());
  };

  const latestUniqueTrackRecords = getLatestUniqueRecords(trackRecords);

  const handleCardClick = () => {
    onNavigate('records');
  };

  if (loading) {
    return (
      <div className="py-4">
        <h2 className="text-xl font-bold text-light-title dark:text-dark-title px-4 mb-4">Mes Records de Course</h2>
        <div className="px-4">
          <div className="h-[180px] w-full bg-light-card dark:bg-dark-card/50 rounded-2xl animate-pulse" />
        </div>
      </div>
    );
  }
  
  return (
    <div className="py-4">
      <div className="flex justify-between items-center px-4 mb-4">
        <h2 className="text-xl font-bold text-light-title dark:text-dark-title">Records de Course</h2>
      </div>

      {latestUniqueTrackRecords.length === 0 ? (
        <div className="px-4">
            <div className="text-center p-8 bg-light-glass dark:bg-dark-glass rounded-2xl">
                <p className="text-light-label dark:text-dark-label">Aucun record de course n'a encore été enregistré.</p>
            </div>
        </div>
      ) : (
        <GenericCardCarousel>
          {latestUniqueTrackRecords.map((record) => (
            <RecordCard 
              key={record.id} 
              record={record} 
              onClick={handleCardClick}
            />
          ))}
        </GenericCardCarousel>
      )}
    </div>
  );
};
