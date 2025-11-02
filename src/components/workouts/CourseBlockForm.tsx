import React, { useState } from 'react';
import { Trash2, MoreVertical, Timer } from 'lucide-react';
import { produce } from 'immer';
import { NumberSelector } from '../NumberSelector'; // C'est notre nouveau "Picker Wheel"
import { RestTimeSelector } from '../RestTimeSelector';
import { ChronoInput } from './ChronoInput';
import useAuth from '../../hooks/useAuth';
import { useBlockTemplates } from '../../hooks/useBlockTemplates';

export interface CourseBlockData {
  id: string;
  series: number | '';
  reps: number | '';
  distance: number | '';
  restBetweenReps: string;
  restBetweenSeries: string;
  chronos: (number | null)[][];
}

interface CourseBlockFormProps {
  block: CourseBlockData;
  onChange: (newBlockData: CourseBlockData) => void;
  onRemove: () => void;
  onDone: () => void;
}

export const CourseBlockForm: React.FC<CourseBlockFormProps> = ({ block, onChange, onRemove, onDone }) => {
  const { user } = useAuth();
  const { createTemplate: createBlockTemplate } = useBlockTemplates(user?.id);
  const [showChronos, setShowChronos] = useState(false);

  // --- Fonctions de mise à jour ---
  // Ces fonctions modifient une copie du bloc et appellent `onChange` pour notifier le parent.
  // C'est le principe d'un composant "contrôlé".

  const handleFieldChange = (field: keyof Omit<CourseBlockData, 'id' | 'chronos'>, value: any) => {
    onChange({ ...block, [field]: value });
  };

  const handleChronoChange = (serieIndex: number, repIndex: number, value: number | null) => {
    const newChronos = produce(block.chronos, draft => {
      // Assure que la structure du tableau existe avant d'assigner
      if (draft && draft[serieIndex]) {
        draft[serieIndex][repIndex] = value;
      }
    });
    onChange({ ...block, chronos: newChronos });
  };
  
  const handleSaveCourseBlock = async () => {
    const templateName = prompt("Quel nom voulez-vous donner à ce bloc de course ?");
    if (templateName) {
      await createBlockTemplate(templateName, 'course', block);
    }
  };

  // --- Rendu du composant ---
  
  const numSeries = typeof block.series === 'number' ? block.series : 0;
  const numReps = typeof block.reps === 'number' ? block.reps : 0;

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm relative" onClick={(e) => e.stopPropagation()}>
      <div className="absolute top-2 right-2 flex items-center gap-1">
        <button type="button" onClick={handleSaveCourseBlock} className="p-1 text-gray-500 rounded hover:bg-gray-100">
            <MoreVertical className="w-5 h-5" />
        </button>
        <button type="button" onClick={onRemove} className="p-1 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/20 rounded">
          <Trash2 className="w-5 h-5" />
        </button>
      </div>

      {/* Sélecteurs principaux (Séries, Reps, Distance, Repos) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 items-center">
        <NumberSelector
          label="Séries"
          value={block.series}
          onChange={(val) => handleFieldChange('series', val)}
          min={1} max={20}
        />
        <NumberSelector
          label="Répétitions"
          value={block.reps}
          onChange={(val) => handleFieldChange('reps', val)}
          min={1} max={50}
        />
        <NumberSelector
          label="Distance"
          value={block.distance}
          onChange={(val) => handleFieldChange('distance', val)}
          min={10} max={5000} step={10} unit="m"
        />
        <RestTimeSelector
          label="Repos / Série"
          value={parseInt(block.restBetweenSeries, 10) || 0}
          onChange={(val) => handleFieldChange('restBetweenSeries', val ? val.toString() : '0')}
        />
      </div>

      {/* Bouton pour afficher/masquer les chronos */}
      <div className="mt-4 border-t pt-4">
        <button
          type="button"
          onClick={() => setShowChronos(!showChronos)}
          className={`w-full flex items-center justify-center gap-2 py-2 text-sm rounded-lg transition-colors ${
            showChronos ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-200' : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200'
          }`}
        >
          <Timer size={16} />
          {showChronos ? 'Masquer les chronos' : 'Ajouter des chronos (optionnel)'}
        </button>
      </div>
      
      {/* Grille de saisie des chronos */}
      {showChronos && (
        <div className="mt-4 space-y-2">
          <p className="text-sm font-medium text-center text-gray-600 dark:text-gray-400">Temps par répétition</p>
          <div className="overflow-x-auto">
            <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${numReps + 1}, minmax(80px, 1fr))` }}>
              {/* En-têtes (Reps) */}
              <div className="font-bold text-xs text-center">Série</div>
              {Array.from({ length: numReps }).map((_, repIndex) => (
                <div key={repIndex} className="font-bold text-xs text-center">
                  Rep {repIndex + 1}
                </div>
              ))}

              {/* Lignes (Séries) avec champs de saisie */}
              {Array.from({ length: numSeries }).map((_, serieIndex) => (
                <React.Fragment key={serieIndex}>
                  <div className="font-bold text-xs flex items-center justify-center">
                    {serieIndex + 1}
                  </div>
                  {Array.from({ length: numReps }).map((_, repIndex) => (
                    <ChronoInput
                      key={repIndex}
                      value={block.chronos?.[serieIndex]?.[repIndex] ?? null}
                      onChange={(val) => handleChronoChange(serieIndex, repIndex, val)}
                      placeholder="mm:ss.ms"
                    />
                  ))}
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Bouton de validation du bloc */}
      <button type="button" onClick={onDone} className="w-full mt-6 py-2 text-sm bg-primary-500 text-white rounded-lg hover:bg-primary-600">
          OK
      </button>
    </div>
  );
};