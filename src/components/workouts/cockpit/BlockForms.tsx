import React from 'react';
import { CourseBlock, MuscuBlock, RestBlock, TechniqueBlock, WorkoutBlock, SeriesBlock } from '../../../types/workout';
import RulerSlider from '../../common/RulerSlider';

// --- Specific Forms ---

const CourseCockpit = ({ block, update }: { block: CourseBlock, update: (b: CourseBlock) => void }) => {
  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-500 mb-2">Distance</label>
        <RulerSlider 
          value={block.distance} 
          onChange={(val) => update({ ...block, distance: val })} 
          min={0}
          max={5000}
          step={50}
        />
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
           <label className="block text-sm font-medium text-gray-500 mb-2">Répétitions</label>
           <div className="flex items-center gap-2">
               <button onClick={() => update({...block, reps: Math.max(1, block.reps - 1)})} className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">-</button>
               <span className="flex-1 text-center text-xl font-bold dark:text-white">{block.reps}</span>
               <button onClick={() => update({...block, reps: block.reps + 1})} className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">+</button>
           </div>
        </div>
        <div>
           <label className="block text-sm font-medium text-gray-500 mb-2">Récup (Reps)</label>
           <input 
              type="text" 
              value={block.restBetweenReps} 
              onChange={(e) => update({...block, restBetweenReps: e.target.value})}
              className="w-full p-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-center font-bold"
           />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-500 mb-2">Intensité (RPE {block.intensity_score || '-'})</label>
        <input 
          type="range" 
          min="1" 
          max="10" 
          value={block.intensity_score || 5} 
          onChange={(e) => update({...block, intensity_score: parseInt(e.target.value)})}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
        />
        <div className="flex justify-between text-xs text-gray-400 mt-1">
          <span>Facile</span>
          <span>Max</span>
        </div>
      </div>
    </div>
  );
};

const RestCockpit = ({ block, update }: { block: RestBlock, update: (b: RestBlock) => void }) => {
    return (
        <div className="space-y-6">
            <div>
                <label className="block text-sm font-medium text-gray-500 mb-4">Durée de repos</label>
                <div className="flex justify-center gap-2">
                     {[30, 60, 90, 120, 180, 300].map(sec => (
                         <button
                           key={sec}
                           onClick={() => update({...block, rest_duration_seconds: sec})}
                           className={`px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${block.rest_duration_seconds === sec ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'}`}
                         >
                             {sec >= 60 ? `${sec/60}'` : `${sec}"`}
                         </button>
                     ))}
                </div>
                <div className="mt-4 flex justify-center">
                    <input
                       type="number"
                       value={block.rest_duration_seconds}
                       onChange={(e) => update({...block, rest_duration_seconds: parseInt(e.target.value) || 0})}
                       className="w-24 text-center text-2xl font-bold bg-transparent border-b-2 border-gray-200 focus:border-blue-500 outline-none"
                    />
                    <span className="self-end ml-2 text-gray-500 pb-1">sec</span>
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-500 mb-2">Type d'activité</label>
                <div className="grid grid-cols-3 gap-3">
                    {(['passif', 'marche', 'trot'] as const).map(type => (
                        <button
                          key={type}
                          onClick={() => update({...block, activity_type: type})}
                          className={`py-3 rounded-xl border-2 capitalize font-medium transition-all ${
                              block.activity_type === type 
                              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300' 
                              : 'border-transparent bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                          }`}
                        >
                            {type}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

const MuscuCockpit = ({ block, update }: { block: MuscuBlock, update: (b: MuscuBlock) => void }) => {
    return (
        <div className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Exercice</label>
                <input 
                  type="text" 
                  value={block.exerciceNom} 
                  onChange={(e) => update({...block, exerciceNom: e.target.value})}
                  className="w-full p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl"
                  placeholder="Nom de l'exercice"
                />
            </div>
            <div className="grid grid-cols-3 gap-3">
                <div>
                   <label className="block text-xs font-medium text-gray-500 mb-1">Séries</label>
                   <input type="number" value={block.series} onChange={(e) => update({...block, series: parseInt(e.target.value)})} className="w-full p-2 bg-gray-50 dark:bg-gray-800 rounded-lg text-center" />
                </div>
                <div>
                   <label className="block text-xs font-medium text-gray-500 mb-1">Reps</label>
                   <input type="number" value={block.reps} onChange={(e) => update({...block, reps: parseInt(e.target.value)})} className="w-full p-2 bg-gray-50 dark:bg-gray-800 rounded-lg text-center" />
                </div>
                <div>
                   <label className="block text-xs font-medium text-gray-500 mb-1">Charge (kg)</label>
                   <input type="number" value={block.poids || ''} onChange={(e) => update({...block, poids: parseFloat(e.target.value)})} className="w-full p-2 bg-gray-50 dark:bg-gray-800 rounded-lg text-center" placeholder="-" />
                </div>
            </div>
        </div>
    );
};

const TechniqueCockpit = ({ block, update }: { block: TechniqueBlock, update: (b: TechniqueBlock) => void }) => {
    return (
        <div className="space-y-4">
             <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Titre / Drill</label>
                <input 
                  type="text" 
                  value={block.title} 
                  onChange={(e) => update({...block, title: e.target.value})}
                  className="w-full p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl"
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Durée estimée (sec)</label>
                 <input 
                  type="number" 
                  value={block.duration_estimated_seconds} 
                  onChange={(e) => update({...block, duration_estimated_seconds: parseInt(e.target.value)})}
                  className="w-full p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl"
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Lien Vidéo</label>
                 <input 
                  type="text" 
                  value={block.video_link || ''} 
                  onChange={(e) => update({...block, video_link: e.target.value})}
                  className="w-full p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl"
                  placeholder="https://..."
                />
            </div>
        </div>
    );
};

const SeriesCockpit = ({ block, update }: { block: SeriesBlock, update: (b: SeriesBlock) => void }) => {
    return (
        <div className="space-y-4">
            <div className="p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl text-center">
                <span className="text-sm text-indigo-600 dark:text-indigo-400">Cette série contient {block.blocks.length} blocs</span>
            </div>
             <div>
                <label className="block text-sm font-medium text-gray-500 mb-2">Nombre de séries</label>
                 <div className="flex items-center gap-4 justify-center">
                   <button onClick={() => update({...block, seriesCount: Math.max(1, block.seriesCount - 1)})} className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-800 text-xl">-</button>
                   <span className="text-3xl font-bold">{block.seriesCount}</span>
                   <button onClick={() => update({...block, seriesCount: block.seriesCount + 1})} className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-800 text-xl">+</button>
                 </div>
            </div>
             <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Repos entre les séries</label>
                <input 
                  type="text" 
                  value={block.restBetweenSeries} 
                  onChange={(e) => update({...block, restBetweenSeries: e.target.value})}
                  className="w-full p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-center"
                  placeholder="ex: 3'"
                />
            </div>
        </div>
    );
};

// --- Main Switcher ---

interface BlockContentProps {
    block: WorkoutBlock;
    onUpdate: (b: WorkoutBlock) => void;
}

export function BlockContentSwitch({ block, onUpdate }: BlockContentProps) {
    switch (block.type) {
        case 'course':
            return <CourseCockpit block={block} update={onUpdate} />;
        case 'repos':
            return <RestCockpit block={block} update={onUpdate} />;
        case 'musculation':
            return <MuscuCockpit block={block} update={onUpdate} />;
        case 'technique':
            return <TechniqueCockpit block={block} update={onUpdate} />;
        case 'series':
            return <SeriesCockpit block={block} update={onUpdate} />;
        default:
            return <div>Type non supporté</div>;
    }
}
