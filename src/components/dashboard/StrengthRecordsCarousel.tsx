import React from 'react';
import { useRecords } from '../../hooks/useRecords';
// ▼▼▼ CORRECTION DU CHEMIN D'IMPORTATION ▼▼▼
import { RecordsCarousel } from '../common/RecordsCarousel';
import useAuth from '../../hooks/useAuth';

export const StrengthRecordsCarousel: React.FC = () => {
  const { user } = useAuth();
  const { strengthRecords, loading } = useRecords(user?.id);

  return (
    <RecordsCarousel
      title="Records de Force"
      records={strengthRecords}
      loading={loading}
      category="strength"
    />
  );
};