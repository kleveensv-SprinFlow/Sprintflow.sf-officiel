import React from 'react';
import { Record } from '../../../../types';
import { Award } from 'lucide-react';

interface RecordCardProps {
  record: Record;
}

const RecordCard: React.FC<RecordCardProps> = ({ record }) => {
  const formattedDate = new Date(record.date).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-4 my-2 max-w-md">
      <div className="flex items-center mb-2">
        <Award className="w-6 h-6 text-yellow-500 mr-3" />
        <h3 className="font-bold text-lg text-gray-900 dark:text-white">Nouveau Record</h3>
      </div>
      <p className="text-gray-700 dark:text-gray-300 text-md">
        <strong>{record.name}</strong>
      </p>
      <div className="mt-3 bg-gray-50 dark:bg-gray-700 p-3 rounded-md">
        <p className="text-2xl font-semibold text-accent dark:text-dark-accent">
          {record.value} <span className="text-lg font-normal text-gray-500 dark:text-gray-400">{record.unit}</span>
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Le {formattedDate}
        </p>
      </div>
    </div>
  );
};

export default RecordCard;