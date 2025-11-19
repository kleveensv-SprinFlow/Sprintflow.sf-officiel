import React from 'react';
import { useRecords } from '../../hooks/useRecords';
import { RecordsCarousel } from './RecordsCarousel';
import useAuth from '../../hooks/useAuth';

export const StrengthRecordsCarousel: React.FC = () => {
  const { user } = useAuth();
  // ▼▼▼ CORRECTION ICI ▼▼▼
  // On récupère 'strengthRecords' au lieu de 'records'
  const { strengthRecords, loading } = useRecords(user?.id);

  return (
    <RecordsCarousel
      title="Records de Force"
      // On passe directement strengthRecords
      records={strengthRecords}
      loading={loading}
      category="strength"
    />
  );
};