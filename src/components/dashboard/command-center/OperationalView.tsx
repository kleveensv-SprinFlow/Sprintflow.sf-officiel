// src/components/dashboard/command-center/OperationalView.tsx
import React from 'react';
import { Clock, PlayCircle } from 'lucide-react';
import { NextUpItem } from './types';

interface OperationalViewProps {
  nextUp: NextUpItem[];
}

export const OperationalView: React.FC<OperationalViewProps> = ({ nextUp }) => {

  if (!nextUp || nextUp.length === 0) {
    return (
       <div className="mb-6 p-4 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm flex items-center justify-between">
          <div className="flex flex-col">
             <span className="text-sm font-semibold text-gray-900 dark:text-white">Aucune séance prévue</span>
             <span className="text-xs text-gray-500">Aujourd'hui est un jour de repos pour l'équipe.</span>
          </div>
          <div className="p-2 bg-gray-50 dark:bg-gray-700 rounded-full text-gray-400">
             <Clock size={20} />
          </div>
       </div>
    );
  }

  // If we have items, we show the first one as "Next Up" and list others
  const primaryItem = nextUp[0];
  const otherItems = nextUp.slice(1);

  return (
    <div className="mb-6 space-y-3">
      <h2 className="text-lg font-bold text-gray-900 dark:text-white px-1 flex items-center gap-2">
        <PlayCircle size={20} className="text-sprint-primary" />
        En direct / Next Up
      </h2>

      {/* Primary Card */}
      <div className="p-5 bg-gradient-to-br from-gray-900 to-gray-800 dark:from-black dark:to-gray-900 rounded-2xl shadow-lg border-l-4 border-sprint-gold text-white relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-sprint-gold/10 rounded-full blur-2xl -mr-10 -mt-10" />
        
        <div className="relative z-10 flex justify-between items-center">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-sprint-gold text-black uppercase tracking-wide">
                Maintenant
              </span>
              {primaryItem.time && (
                <span className="text-sm font-medium text-gray-300 flex items-center gap-1">
                  <Clock size={12} /> {primaryItem.time}
                </span>
              )}
            </div>
            <h3 className="text-xl font-bold leading-tight mb-1">
              {primaryItem.title || "Séance du jour"}
            </h3>
            <p className="text-sm text-gray-400">
              {primaryItem.athlete_count} athlète{primaryItem.athlete_count > 1 ? 's' : ''} concerné{primaryItem.athlete_count > 1 ? 's' : ''}
            </p>
          </div>
          
          <div className="h-10 w-10 flex items-center justify-center rounded-full bg-white/10 backdrop-blur-sm border border-white/10">
            <Clock size={20} className="text-white" />
          </div>
        </div>
      </div>

      {/* Secondary Items (Simple List) */}
      {otherItems.length > 0 && (
        <div className="space-y-2 pl-1">
           {otherItems.map((item, idx) => (
             <div key={idx} className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700">
                <div className="flex flex-col">
                   <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                     {item.title || "Autre séance"}
                   </span>
                   <span className="text-xs text-gray-500">
                     {item.athlete_count} athlètes
                   </span>
                </div>
                {item.time && (
                   <span className="text-xs font-mono bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-gray-600 dark:text-gray-300">
                     {item.time}
                   </span>
                )}
             </div>
           ))}
        </div>
      )}
    </div>
  );
};
