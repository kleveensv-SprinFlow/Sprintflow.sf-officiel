import React, { useRef, useState, useEffect } from 'react';
import { format, addWeeks, subWeeks, startOfWeek, endOfWeek, isSameWeek, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Plus, Trash2 } from 'lucide-react';
import { PlanningPhase } from '../../types/planning';

interface RhythmBarProps {
  currentDate: Date;
  phases: PlanningPhase[];
  onAddPhase: (date: Date) => void;
  onDeletePhase: (phaseId: string) => void;
  contextType: 'athlete' | 'group';
}

export const RhythmBar: React.FC<RhythmBarProps> = ({ 
  currentDate, 
  phases, 
  onAddPhase, 
  onDeletePhase
}) => {
  // Show 12 weeks: 4 past, current, 7 future
  const [centerDate, setCenterDate] = useState(currentDate);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setCenterDate(currentDate);
  }, [currentDate]);

  // Generate weeks around center date
  const weeks = [];
  const startOfTimeline = startOfWeek(subWeeks(centerDate, 4), { weekStartsOn: 1 });
  
  for (let i = 0; i < 12; i++) {
    const weekStart = addWeeks(startOfTimeline, i);
    weeks.push(weekStart);
  }

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
        scrollContainerRef.current.scrollBy({ left: -200, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
        scrollContainerRef.current.scrollBy({ left: 200, behavior: 'smooth' });
    }
  };

  const getPhasesForWeek = (weekStart: Date) => {
      const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 });
      // Find phases that overlap with this week
      return phases.filter(p => {
          const pStart = parseISO(p.start_date);
          const pEnd = parseISO(p.end_date);
          return (pStart <= weekEnd && pEnd >= weekStart);
      }).sort((a, b) => {
           if (a.athlete_id && !b.athlete_id) return -1;
           if (!a.athlete_id && b.athlete_id) return 1;
           return 0;
      });
  };

  return (
    <div className="relative group/timeline mb-4">
        {/* Controls */}
        <button 
            onClick={scrollLeft}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/80 dark:bg-gray-800/80 p-1 rounded-full shadow-sm opacity-0 group-hover/timeline:opacity-100 transition-opacity"
        >
            <ChevronLeft size={16} />
        </button>
        <button 
            onClick={scrollRight}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/80 dark:bg-gray-800/80 p-1 rounded-full shadow-sm opacity-0 group-hover/timeline:opacity-100 transition-opacity"
        >
            <ChevronRight size={16} />
        </button>

        {/* Scrollable Container */}
        <div 
            ref={scrollContainerRef}
            className="flex gap-1 overflow-x-auto scrollbar-hide pb-2 pt-1 px-4 snap-x"
            style={{ scrollBehavior: 'smooth' }}
        >
            {weeks.map((weekStart) => {
                const isCurrentWeek = isSameWeek(weekStart, currentDate, { weekStartsOn: 1 });
                const weekPhases = getPhasesForWeek(weekStart);
                const dominantPhase = weekPhases[0]; // Simplified: take the first (sorted by priority)

                return (
                    <div 
                        key={weekStart.toISOString()}
                        className={`
                            snap-center shrink-0 w-24 flex flex-col items-center gap-1 cursor-pointer
                            relative rounded-xl p-2 transition-all
                            ${isCurrentWeek ? 'bg-white/50 dark:bg-gray-700/50 border border-sprint-primary/30' : 'hover:bg-white/30 dark:hover:bg-gray-800/30'}
                        `}
                        onClick={() => {
                            if (!dominantPhase) onAddPhase(weekStart);
                        }}
                    >
                        {/* Date Label */}
                        <span className={`text-[10px] font-bold uppercase ${isCurrentWeek ? 'text-sprint-primary' : 'text-gray-400'}`}>
                            {format(weekStart, 'd MMM', { locale: fr })}
                        </span>

                        {/* Phase Bar */}
                        <div className="h-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden relative">
                             {dominantPhase ? (
                                 <div 
                                    className="absolute inset-0 rounded-full"
                                    style={{ backgroundColor: dominantPhase.color_hex }}
                                    title={dominantPhase.name}
                                 />
                             ) : (
                                 <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100">
                                     <Plus size={10} className="text-gray-400" />
                                 </div>
                             )}
                        </div>

                        {/* Phase Name & Context Indicator */}
                        <div className="h-4 flex items-center justify-center w-full">
                            {dominantPhase ? (
                                <div className="flex items-center gap-1 max-w-full">
                                    {/* Dot indicating origin */}
                                    <div 
                                        className={`w-1.5 h-1.5 rounded-full shrink-0 ${dominantPhase.athlete_id ? 'border border-white shadow-sm' : ''}`}
                                        style={{ backgroundColor: dominantPhase.color_hex }}
                                    />
                                    <span className="text-[9px] font-medium text-gray-600 dark:text-gray-300 truncate">
                                        {dominantPhase.name}
                                    </span>
                                    {/* Delete option on hover (only if own context or coach) */}
                                    <button 
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            if (confirm('Supprimer cette phase ?')) {
                                                onDeletePhase(dominantPhase.id);
                                            }
                                        }}
                                        className="hidden group-hover/timeline:flex bg-white dark:bg-gray-900 rounded-full p-0.5 text-red-500 ml-1"
                                    >
                                        <Trash2 size={8} />
                                    </button>
                                </div>
                            ) : (
                                <span className="text-[9px] text-gray-300 dark:text-gray-600">-</span>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    </div>
  );
};
