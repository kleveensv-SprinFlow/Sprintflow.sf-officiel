import React from 'react';
import { Plus } from 'lucide-react';
import { format, parseISO, isWithinInterval, startOfWeek, endOfWeek, differenceInDays, addDays } from 'date-fns';
import { fr } from 'date-fns/locale';
import { TrainingPhase } from '../../hooks/useTrainingPhases';

interface RhythmBarProps {
  currentDate: Date;
  phases: TrainingPhase[];
  onAddPhase: () => void;
}

export const RhythmBar: React.FC<RhythmBarProps> = ({ currentDate, phases, onAddPhase }) => {
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 });

  // Calculate active phases for this week
  // We want to show a segment if it overlaps with the current week
  // BUT visually, we are just showing a bar for the current week.
  // If a phase spans the whole week, the bar is full color.
  // If it starts/ends mid-week, it's partial.

  // For simplicity and "mobile first" readability:
  // We will stack phases if they overlap (though logically they shouldn't for the same athlete/group mostly).
  // We assume one main phase per time.

  // Filter phases that overlap with current week
  const visiblePhases = phases.filter(p => {
    const start = parseISO(p.start_date);
    const end = parseISO(p.end_date);
    return (start <= weekEnd && end >= weekStart);
  });

  return (
    <div className="mb-4">
      <div className="flex items-center justify-between mb-2 px-1">
        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Périodisation</h3>
        <button
            onClick={onAddPhase}
            className="text-xs font-bold text-sprint-primary hover:text-sprint-primary/80 flex items-center gap-1"
        >
            <Plus size={12} />
            Définir une phase
        </button>
      </div>

      {/* The Bar Track */}
      <div className="relative h-6 bg-gray-100 dark:bg-gray-800 rounded-full w-full overflow-hidden flex">
        {/* If no phases, show empty state or placeholder */}
        {visiblePhases.length === 0 && (
            <div className="w-full h-full flex items-center justify-center text-[10px] text-gray-400 italic">
                Aucune phase active
            </div>
        )}

        {/* Render Phases */}
        {visiblePhases.map(phase => {
            const pStart = parseISO(phase.start_date);
            const pEnd = parseISO(phase.end_date);

            // Calculate width and position relative to the week
            // 1. Determine start index (0-6)
            let startIndex = 0;
            if (pStart > weekStart) {
                startIndex = differenceInDays(pStart, weekStart);
            }

            // 2. Determine duration in days within this week
            // Max days is 7
            // End index is min(6, difference(pEnd, weekStart))
            let endDistance = differenceInDays(pEnd, weekStart);
            if (endDistance > 6) endDistance = 6;
            if (endDistance < 0) endDistance = 0; // Should not happen due to filter

            // Width in percentage = (duration / 7) * 100
            // Duration = (endIndex - startIndex) + 1
            // Careful with logic: if pStart > weekEnd, filtered out.
            // if pEnd < weekStart, filtered out.

            // Re-calc explicit clamp
            const effectiveStart = pStart < weekStart ? weekStart : pStart;
            const effectiveEnd = pEnd > weekEnd ? weekEnd : pEnd;

            const durationDays = differenceInDays(effectiveEnd, effectiveStart) + 1;
            const startOffsetDays = differenceInDays(effectiveStart, weekStart);

            const widthPercent = (durationDays / 7) * 100;
            const leftPercent = (startOffsetDays / 7) * 100;

            return (
                <div
                    key={phase.id}
                    className="absolute top-0 bottom-0 flex items-center justify-center text-[10px] font-bold text-white truncate px-1 border-r border-white/20 last:border-0"
                    style={{
                        left: `${leftPercent}%`,
                        width: `${widthPercent}%`,
                        backgroundColor: phase.color || '#3B82F6',
                        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.3)'
                    }}
                    title={`${phase.name} (${format(pStart, 'd MMM')} - ${format(pEnd, 'd MMM')})`}
                >
                    {phase.name}
                </div>
            );
        })}

        {/* Day Markers (Overlay) */}
        <div className="absolute inset-0 flex pointer-events-none">
            {Array.from({ length: 7 }).map((_, i) => (
                <div key={i} className="flex-1 border-r border-white/10 dark:border-black/10 last:border-0"></div>
            ))}
        </div>
      </div>
    </div>
  );
};
