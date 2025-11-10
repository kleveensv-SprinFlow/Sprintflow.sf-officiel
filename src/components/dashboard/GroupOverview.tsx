import React from 'react';
import { useGroups } from '../../hooks/useGroups';

interface GroupOverviewProps {
  onNavigate: () => void;
}

export const GroupOverview: React.FC<GroupOverviewProps> = ({ onNavigate }) => {
  const { groups } = useGroups();

  return (
    <div className="bg-light-card dark:bg-dark-card shadow-card-light dark:shadow-card-dark rounded-lg p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-light-title dark:text-dark-title">Mon Groupe</h2>
        <button onClick={onNavigate} className="text-sm text-accent font-semibold">Voir</button>
      </div>
      {groups.length > 0 ? (
        <p>{groups[0].name}</p>
      ) : (
        <p className="text-light-label dark:text-dark-label">Vous n'êtes dans aucun groupe.</p>
      )}
    </div>
  );
};