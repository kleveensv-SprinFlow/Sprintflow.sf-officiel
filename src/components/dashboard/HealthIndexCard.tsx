import React from 'react';
import { useGroupAnalytics } from '../../hooks/useGroupAnalytics';
import { useIndices } from '../../hooks/useIndices';
import { Loader2, HeartPulse } from 'lucide-react';

interface HealthIndexCardProps {
  selection: {
    type: 'athlete' | 'group';
    id: string;
  } | null;
}

const HealthIndexCard: React.FC<HealthIndexCardProps> = ({ selection }) => {
  const isGroup = selection?.type === 'group';
  const { groupWellnessScore, loading: groupLoading } = useGroupAnalytics(isGroup ? selection?.id : undefined);
  const { formIndex, loading: athleteLoading } = useIndices(isGroup ? undefined : selection?.id);

  const loading = groupLoading || athleteLoading;
  const score = isGroup ? groupWellnessScore : formIndex;

  const getScoreColor = (value: number) => {
    if (value < 40) return 'text-red-500';
    if (value < 70) return 'text-yellow-500';
    return 'text-green-500';
  };

  return (
    <div className="p-5 bg-white dark:bg-gray-800 rounded-2xl shadow-md">
      <div className="flex items-center gap-3">
        <HeartPulse className="text-gray-400" />
        <h3 className="font-bold text-lg text-gray-900 dark:text-white">Indice de Santé</h3>
      </div>
      <div className="text-center py-4">
        {loading ? (
          <Loader2 className="animate-spin text-gray-500 mx-auto" />
        ) : (
          <p className={`text-5xl font-extrabold ${getScoreColor(score || 0)}`}>
            {score !== null ? Math.round(score) : 'N/A'}
          </p>
        )}
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          {isGroup ? 'Moyenne du groupe' : 'Score de l\'athlète'}
        </p>
      </div>
    </div>
  );
};

export default HealthIndexCard;
