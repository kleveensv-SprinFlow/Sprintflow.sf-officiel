import React, { useEffect, useState } from 'react';
import { WorkoutBlock, CourseBlock, MuscuBlock, SeriesBlock } from '../../../types/workout';
import { Clock, Dumbbell, Activity, AlertCircle } from 'lucide-react';

interface AthleteBlockInputsProps {
  block: WorkoutBlock;
  plannedBlock: WorkoutBlock; // Reference for comparison
  onChange: (updatedBlock: WorkoutBlock) => void;
}

// Helper to detect changes
const isChanged = (current: any, planned: any) => current !== planned;

const LabelDiff = ({ label, isModified }: { label: string, isModified: boolean }) => (
  <label className={`block text-xs font-semibold uppercase tracking-wider mb-1 ${isModified ? 'text-amber-600 dark:text-amber-500' : 'text-gray-500'}`}>
    {label} {isModified && '*'}
  </label>
);

const ComparisonValue = ({ label, value }: { label: string, value: any }) => (
  <div className="flex flex-col mb-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700">
     <span className="text-xs text-gray-400 uppercase">{label} (Prévu)</span>
     <span className="font-bold text-gray-700 dark:text-gray-300">{value}</span>
  </div>
);

// --- Course Input ---
const AthleteCourseInput: React.FC<AthleteBlockInputsProps> = ({ block, plannedBlock, onChange }) => {
  const b = block as CourseBlock;
  const p = plannedBlock as CourseBlock;

  const handleChange = (field: keyof CourseBlock, value: any) => {
    onChange({ ...b, [field]: value });
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
         <ComparisonValue label="Distance" value={`${p.distance}m`} />
         <ComparisonValue label="Temps Cible" value={`${p.duration}s`} />
      </div>

      {/* Actual Performance Inputs */}
      <div className="space-y-4">
        <div>
          <LabelDiff label="Chrono Réalisé (sec)" isModified={isChanged(b.duration, p.duration)} />
          <div className="relative">
             <input
                type="number"
                value={b.duration}
                onChange={(e) => handleChange('duration', parseFloat(e.target.value))}
                className={`w-full p-4 text-2xl font-bold rounded-xl border-2 outline-none transition-colors ${
                    isChanged(b.duration, p.duration) 
                    ? 'border-amber-400 bg-amber-50 dark:bg-amber-900/20 dark:border-amber-500 text-amber-900 dark:text-amber-100' 
                    : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'
                }`}
             />
             <Clock className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" size={24} />
          </div>
        </div>

        <div>
            <LabelDiff label="RPE (Effort Ressenti)" isModified={isChanged(b.intensity_score, p.intensity_score)} />
            <input
                type="range"
                min="1"
                max="10"
                value={b.intensity_score || 5}
                onChange={(e) => handleChange('intensity_score', parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 accent-sprint-primary"
            />
            <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>Facile (1)</span>
                <span className="font-bold text-sprint-primary">{b.intensity_score || 5}</span>
                <span>Max (10)</span>
            </div>
        </div>
      </div>
    </div>
  );
};

// --- Muscu Input ---
const AthleteMuscuInput: React.FC<AthleteBlockInputsProps> = ({ block, plannedBlock, onChange }) => {
  const b = block as MuscuBlock;
  const p = plannedBlock as MuscuBlock;

  const handleChange = (field: keyof MuscuBlock, value: any) => {
    onChange({ ...b, [field]: value });
  };

  return (
    <div className="space-y-6">
       <div className="mb-4">
           <h3 className="font-bold text-lg">{b.exerciceNom}</h3>
           <p className="text-gray-500 text-sm">{p.series} séries x {p.reps} réps @ {p.poids}kg</p>
       </div>

       <div className="grid grid-cols-2 gap-4">
          {/* Weight Input */}
          <div>
            <LabelDiff label="Charge (kg)" isModified={isChanged(b.poids, p.poids)} />
            <div className="relative">
                <input
                    type="number"
                    value={b.poids || 0}
                    onChange={(e) => handleChange('poids', parseFloat(e.target.value))}
                    className={`w-full p-3 text-xl font-bold rounded-xl border-2 outline-none text-center ${
                        isChanged(b.poids, p.poids)
                        ? 'border-amber-400 bg-amber-50 dark:bg-amber-900/20'
                        : 'border-gray-200 dark:border-gray-700'
                    }`}
                />
            </div>
          </div>

          {/* Reps Input */}
          <div>
            <LabelDiff label="Répétitions" isModified={isChanged(b.reps, p.reps)} />
            <div className="relative">
                <input
                    type="number"
                    value={b.reps}
                    onChange={(e) => handleChange('reps', parseFloat(e.target.value))}
                    className={`w-full p-3 text-xl font-bold rounded-xl border-2 outline-none text-center ${
                        isChanged(b.reps, p.reps)
                        ? 'border-amber-400 bg-amber-50 dark:bg-amber-900/20'
                        : 'border-gray-200 dark:border-gray-700'
                    }`}
                />
            </div>
          </div>
       </div>
       
       {/* RPE */}
        <div>
            <LabelDiff label="RPE" isModified={isChanged(b.intensity_score, p.intensity_score)} />
            <div className="flex items-center gap-4">
                 <input
                    type="range"
                    min="1"
                    max="10"
                    value={b.intensity_score || 5}
                    onChange={(e) => handleChange('intensity_score', parseInt(e.target.value))}
                    className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 accent-sprint-primary"
                />
                <span className="text-xl font-bold text-sprint-primary w-8 text-center">{b.intensity_score || 5}</span>
            </div>
        </div>
    </div>
  );
};

// --- Series Input (Recursive) ---
const AthleteSeriesInput: React.FC<AthleteBlockInputsProps> = ({ block, plannedBlock, onChange }) => {
    const b = block as SeriesBlock;
    const p = plannedBlock as SeriesBlock;

    const handleSubBlockChange = (index: number, updatedSubBlock: WorkoutBlock) => {
        const newBlocks = [...b.blocks];
        newBlocks[index] = updatedSubBlock;
        onChange({ ...b, blocks: newBlocks });
    };

    return (
        <div className="space-y-6">
            <div className="p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl mb-4">
                <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-indigo-700 dark:text-indigo-300 uppercase text-xs">Circuit</span>
                    <span className="text-indigo-600 dark:text-indigo-400 font-bold">{b.seriesCount} tours</span>
                </div>
                <p className="text-xs text-indigo-600/80 dark:text-indigo-400/80">
                    Validez les performances pour chaque exercice du circuit ci-dessous.
                </p>
            </div>

            <div className="space-y-8 divide-y divide-gray-100 dark:divide-gray-800">
                {b.blocks.map((subBlock, index) => {
                    const plannedSubBlock = p.blocks[index];
                    return (
                        <div key={subBlock.id} className="pt-6 first:pt-0">
                            <AthleteBlockInputs 
                                block={subBlock} 
                                plannedBlock={plannedSubBlock} 
                                onChange={(updated) => handleSubBlockChange(index, updated)} 
                            />
                        </div>
                    );
                })}
            </div>
        </div>
    );
};


// --- Main Dispatcher ---
export const AthleteBlockInputs: React.FC<AthleteBlockInputsProps> = (props) => {
  const { block } = props;

  switch (block.type) {
    case 'course':
      return <AthleteCourseInput {...props} />;
    case 'musculation':
      return <AthleteMuscuInput {...props} />;
    case 'series':
      return <AthleteSeriesInput {...props} />;
    case 'repos':
        // Rest blocks usually don't have user input, maybe just a check?
        return (
            <div className="p-4 text-center text-gray-500">
                <Clock className="mx-auto mb-2 opacity-50" />
                <p>Repos {block.rest_duration_seconds}s</p>
                <p className="text-xs">Rien à saisir pour ce bloc.</p>
            </div>
        );
    default:
      return <div>Type de bloc non supporté pour l'édition rapide.</div>;
  }
};
