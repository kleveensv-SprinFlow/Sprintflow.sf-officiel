import React from 'react';
import { CourseBlock, MuscuBlock, WorkoutBlock, SeriesBlock } from '../../../types/workout';
import { Clock, Dumbbell, AlertCircle } from 'lucide-react';

// --- Validation Components ---

interface ValidationProps<T extends WorkoutBlock> {
    plannedBlock: T; // The original plan (Reference)
    actualBlock: T;  // The block being edited (Actual)
    update: (b: T) => void;
}

const CourseValidationCockpit = ({ plannedBlock, actualBlock, update }: ValidationProps<CourseBlock>) => {
    // Helper to update a specific chrono for a specific set/rep
    // CourseBlock usually has [series][reps] structure.
    // If chronos is undefined, we init it.

    // Flattened view for simplicity?
    // If the plan is 2x 300m, we expect 2 chronos.
    // Let's iterate over series and reps to generate input fields.

    const handleChronoChange = (seriesIndex: number, repIndex: number, value: string) => {
        // value is text (e.g. "45.5"), parse to number
        const numVal = parseFloat(value.replace(',', '.')) || null;

        const newChronos = actualBlock.chronos ? JSON.parse(JSON.stringify(actualBlock.chronos)) : [];

        // Ensure structure exists
        while(newChronos.length <= seriesIndex) newChronos.push([]);
        while(newChronos[seriesIndex].length <= repIndex) newChronos[seriesIndex].push(null);

        newChronos[seriesIndex][repIndex] = numVal;
        update({ ...actualBlock, chronos: newChronos });
    };

    const getChronoValue = (sIdx: number, rIdx: number) => {
        if (!actualBlock.chronos || !actualBlock.chronos[sIdx]) return '';
        const val = actualBlock.chronos[sIdx][rIdx];
        return val !== null && val !== undefined ? val : '';
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                <div>
                    <p className="text-xs text-gray-500 uppercase font-bold">Objectif</p>
                    <div className="flex items-baseline gap-2">
                         <span className="text-2xl font-bold text-gray-900 dark:text-white">{plannedBlock.distance}m</span>
                         <span className="text-sm text-gray-500">x {plannedBlock.reps} reps</span>
                    </div>
                </div>
                <Clock className="text-blue-500" size={24} />
            </div>

            <div className="space-y-4">
                <label className="block text-sm font-medium text-gray-500">Chronos réalisés (sec)</label>
                {Array.from({ length: plannedBlock.series }).map((_, sIdx) => (
                    <div key={sIdx} className="space-y-2">
                        {plannedBlock.series > 1 && <p className="text-xs font-bold text-gray-400">Série {sIdx + 1}</p>}
                        <div className="grid grid-cols-3 gap-3">
                            {Array.from({ length: plannedBlock.reps }).map((_, rIdx) => (
                                <div key={rIdx} className="relative">
                                    <input
                                        type="number"
                                        placeholder="-"
                                        value={getChronoValue(sIdx, rIdx)}
                                        onChange={(e) => handleChronoChange(sIdx, rIdx, e.target.value)}
                                        className="w-full p-3 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-xl text-center font-bold text-lg focus:border-blue-500 outline-none focus:ring-2 focus:ring-blue-200"
                                    />
                                    {/* Visual indicator if value differs significantly? (Hard to know target time) */}
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

             {/* RPE override */}
            <div>
                <label className="block text-sm font-medium text-gray-500 mb-2">Ressenti (RPE)</label>
                <div className="flex items-center gap-4">
                    <input
                        type="range"
                        min="1"
                        max="10"
                        value={actualBlock.intensity_score || 5}
                        onChange={(e) => update({...actualBlock, intensity_score: parseInt(e.target.value)})}
                        className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                    />
                    <span className="text-xl font-bold w-8 text-center">{actualBlock.intensity_score || 5}</span>
                </div>
            </div>
        </div>
    );
};

const MuscuValidationCockpit = ({ plannedBlock, actualBlock, update }: ValidationProps<MuscuBlock>) => {

    // Compare actual weight vs planned weight to show "diff" style
    const isModified = actualBlock.poids !== plannedBlock.poids;

    return (
        <div className="space-y-6">
             <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl flex items-center gap-4">
                 <div className="p-3 bg-white dark:bg-gray-700 rounded-full shadow-sm">
                     <Dumbbell size={24} className="text-purple-500" />
                 </div>
                 <div>
                     <p className="text-sm text-gray-500">{plannedBlock.exerciceNom}</p>
                     <p className="text-lg font-bold text-gray-900 dark:text-white">
                         {plannedBlock.series} x {plannedBlock.reps}
                     </p>
                 </div>
             </div>

             <div>
                 <label className="block text-sm font-medium text-gray-500 mb-2">Charge utilisée (kg)</label>
                 <div className="flex items-center justify-between gap-4">
                     <div className="text-center opacity-60">
                         <span className="block text-xs uppercase font-bold text-gray-400">Prévu</span>
                         <span className="text-xl font-bold text-gray-600 dark:text-gray-400">{plannedBlock.poids || '-'}</span>
                     </div>

                     <div className="flex-1">
                         <input
                            type="number"
                            value={actualBlock.poids || ''}
                            onChange={(e) => update({...actualBlock, poids: parseFloat(e.target.value)})}
                            className={`w-full p-4 text-center text-3xl font-bold rounded-2xl border-2 outline-none transition-colors
                                ${isModified
                                    ? 'border-yellow-400 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400'
                                    : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white'
                                }
                            `}
                            placeholder="0"
                         />
                     </div>
                 </div>
                 {isModified && (
                     <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-2 text-center flex items-center justify-center gap-1">
                         <AlertCircle size={12} />
                         Modification enregistrée
                     </p>
                 )}
             </div>

             {/* Detailed sets/reps logging could go here if needed later */}
        </div>
    );
};

// Generic fallback for other types (Rest, Technique, etc.) where we might just validate RPE or Notes
const GenericValidationCockpit = ({ plannedBlock, actualBlock, update }: ValidationProps<WorkoutBlock>) => {
    return (
        <div className="space-y-4">
            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                 <p className="text-sm text-gray-500">Type: {plannedBlock.type}</p>
                 <p className="text-xs text-gray-400 mt-1">Validez ce bloc si réalisé.</p>
            </div>

            {(plannedBlock.type === 'technique' || plannedBlock.type === 'series') && (
                 <div>
                    <label className="block text-sm font-medium text-gray-500 mb-2">Note / RPE</label>
                    <input
                        type="range"
                        min="1"
                        max="10"
                        value={actualBlock.intensity_score || 5}
                        onChange={(e) => update({...actualBlock, intensity_score: parseInt(e.target.value)})}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                    />
                 </div>
            )}
        </div>
    );
}

export function BlockValidationSwitch({ plannedBlock, actualBlock, onUpdate }: { plannedBlock: WorkoutBlock, actualBlock: WorkoutBlock, onUpdate: (b: WorkoutBlock) => void }) {
    switch (actualBlock.type) {
        case 'course':
            return <CourseValidationCockpit plannedBlock={plannedBlock as CourseBlock} actualBlock={actualBlock as CourseBlock} update={onUpdate as any} />;
        case 'musculation':
            return <MuscuValidationCockpit plannedBlock={plannedBlock as MuscuBlock} actualBlock={actualBlock as MuscuBlock} update={onUpdate as any} />;
        case 'series':
             // For series, we might need to drill down?
             // Or usually series is just a container.
             // If we validated children separately, this container just exists.
             // But if the "One-Tap" list shows flattened blocks, we might not see "SeriesBlock" as an editable item, but rather its children.
             // However, WorkoutBuilderCanvas renders SeriesBlock.
             // If the user clicks the Series container, what happens?
             // Usually we assume they click the children.
             return <GenericValidationCockpit plannedBlock={plannedBlock} actualBlock={actualBlock} update={onUpdate} />;
        default:
            return <GenericValidationCockpit plannedBlock={plannedBlock} actualBlock={actualBlock} update={onUpdate} />;
    }
}
