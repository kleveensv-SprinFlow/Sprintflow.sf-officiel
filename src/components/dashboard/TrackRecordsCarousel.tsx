import React from 'react';
import { useRecords } from '../../hooks/useRecords';
import { RecordsCarousel } from './RecordsCarousel';
import useAuth from '../../hooks/useAuth';

export const TrackRecordsCarousel: React.FC = () => {
  const { user } = useAuth();
  // ▼▼▼ CORRECTION ICI ▼▼▼
  // On récupère 'trackRecords' au lieu de 'records'
  const { trackRecords, loading } = useRecords(user?.id);

  return (
    <RecordsCarousel
      title="Records sur Piste"
      // On passe directement trackRecords
      records={trackRecords}
      loading={loading}
      category="track"
    />
  );
};