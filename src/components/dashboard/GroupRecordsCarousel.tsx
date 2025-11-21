import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, Calendar } from 'lucide-react';
import { GroupRecord } from '../../types';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface GroupRecordsCarouselProps {
  records: GroupRecord[];
  loading?: boolean;
}

const GlassCard = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <div className={`relative flex-shrink-0 w-64 h-40 overflow-hidden rounded-3xl bg-white/10 backdrop-blur-md border border-white/20 shadow-xl snap-start ${className}`}>
    <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
    {children}
  </div>
);

export const GroupRecordsCarousel: React.FC<GroupRecordsCarouselProps> = ({ records, loading }) => {
  if (loading) {
      return <div className="py-8 text-center text-gray-500">Chargement des records...</div>;
  }

  if (records.length === 0) {
      return (
          <div className="py-8 text-center bg-light-card dark:bg-dark-card/60 rounded-xl border border-dashed border-gray-300 dark:border-gray-700">
              <Trophy className="w-8 h-8 mx-auto text-gray-400 mb-2" />
              <p className="text-sm text-gray-500">Aucun record récent dans ce groupe.</p>
          </div>
      );
  }

  return (
    <div className="w-full space-y-4 mb-8">
      <div className="flex items-center justify-between px-1">
        <h3 className="text-xl font-bold text-light-title dark:text-dark-title flex items-center gap-2">
          <Trophy className="w-5 h-5 text-yellow-500" />
          Derniers Records
        </h3>
      </div>

      <div className="flex overflow-x-auto gap-4 pb-4 snap-x snap-mandatory scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0">
        {records.map((record) => (
          <GlassCard key={record.id} className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10">
            <div className="p-4 flex flex-col justify-between h-full relative z-10">
                
                {/* Header: User Info */}
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden border-2 border-white/30">
                        {record.athlete_photo_url ? (
                            <img src={record.athlete_photo_url} alt={record.athlete_first_name} className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center bg-indigo-500 text-white font-bold text-xs">
                                {record.athlete_first_name?.[0]}{record.athlete_last_name?.[0]}
                            </div>
                        )}
                    </div>
                    <div className="flex flex-col overflow-hidden">
                        <span className="text-sm font-bold text-light-title dark:text-white truncate">
                            {record.athlete_first_name} {record.athlete_last_name}
                        </span>
                        <span className="text-xs text-light-text dark:text-white/70 truncate flex items-center gap-1">
                            <Calendar size={10} /> {format(new Date(record.date), 'd MMM', { locale: fr })}
                        </span>
                    </div>
                </div>

                {/* Body: Record Value */}
                <div className="flex flex-col items-center justify-center my-1">
                    <span className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">
                        {record.value} <span className="text-lg text-white/60 font-medium">{record.unit}</span>
                    </span>
                </div>

                {/* Footer: Exercise Name */}
                <div className="text-center">
                    <span className="text-xs font-semibold px-2 py-1 rounded-full bg-white/10 text-white/90 border border-white/10 inline-block truncate max-w-full">
                        {record.exercise_name || "Exercice"}
                    </span>
                </div>

            </div>
          </GlassCard>
        ))}
      </div>
    </div>
  );
};
