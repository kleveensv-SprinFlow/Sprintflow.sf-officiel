// src/components/common/RecordCard.tsx
import React from 'react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Record } from '../../types';

interface RecordCardProps {
  record: Record;
  onClick: (recordId: string) => void;
}

export const RecordCard: React.FC<RecordCardProps> = ({ record, onClick }) => {
  const { name, value, date, unit } = record;

  const displayPerformance = () => {
    if (unit === 'kg') return `${value} kg`;
    if (unit === 's') return `${value} s`;
    return value;
  };

  const cardContent = (
    <>
      <header>
        <h3 className="font-bold text-xl text-light-title dark:text-dark-title truncate">
          {name}
        </h3>
      </header>

      <div className="flex-grow flex items-center justify-center">
        <p className="text-4xl font-extrabold text-light-title dark:text-dark-title">
          {displayPerformance()}
        </p>
      </div>

      <footer className="text-right">
        <p className="text-sm text-light-label dark:text-dark-label">
          {format(new Date(date), 'd MMMM yyyy', { locale: fr })}
        </p>
      </footer>
    </>
  );

  const baseClasses = "w-full min-h-[180px] rounded-2xl p-4 flex flex-col justify-between bg-light-glass dark:bg-dark-glass shadow-glass backdrop-blur-lg border border-white/10 transition-all duration-300 group text-left";

  return (
    <button onClick={() => onClick(record.id)} className={baseClasses}>
      {cardContent}
    </button>
  );
};