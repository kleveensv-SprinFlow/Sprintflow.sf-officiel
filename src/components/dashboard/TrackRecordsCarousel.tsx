import React from 'react';
import { useRecords } from '../../hooks/useRecords';
// ▼▼▼ CORRECTION DU CHEMIN D'IMPORTATION ▼▼▼
import { RecordsCarousel } from '../common/RecordsCarousel';
import useAuth from '../../hooks/useAuth';

export const TrackRecordsCarousel: React.FC = () => {
  const { user } = useAuth();
  const { trackRecords, loading } = useRecords(user?.id);

  return (
    <RecordsCarousel
      title="Records sur Piste"
      records={trackRecords}
      loading={loading}
      category="track"
    />
  );
};