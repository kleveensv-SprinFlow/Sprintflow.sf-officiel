import React, { useState, useEffect } from 'react';
import { Trash2 } from 'lucide-react';
import { produce } from 'immer';
import { NumberSelector } from '../NumberSelector';
import { DistanceInput } from './DistanceInput';
import { RestTimeSelector } from '../RestTimeSelector';
import { ChronoInput } from './ChronoInput';

export interface CourseBlockData {
  id: string;
  series: number | '';
  reps: number | '';
  distance: number | '';
  restBetweenReps: string;
  restBetweenSeries: string;
  chronos: (number | null)[][]; // Array of series, each containing an array of rep times
}

interface CourseBlockFormProps {
  block: CourseBlockData;
  onChange: (id: string, newBlockData: CourseBlockData) => void;
  onRemove: (id:string) => void;
}

export const CourseBlockForm: React.FC<CourseBlockFormProps> = ({ block, onChange, onRemove }) => {
  const [series, setSeries] = useState(block.series);
  const [reps, setReps] = useState(block.reps);
  const [distance, setDistance] = useState(block.distance);
  const [restBetweenSeries, setRestBetweenSeries] = useState(block.restBetweenSeries);
  const [chronos, setChronos] = useState<(number | null)[][]>(block.chronos);

  // Update parent component when local state changes
  useEffect(() => {
    onChange(block.id, { id: block.id, series, reps, distance, restBetweenReps: '0', restBetweenSeries, chronos });
  }, [series, reps, distance, restBetweenSeries, chronos, block.id, onChange]);

  // Adjust the chronos array size when series/reps change
  useEffect(() => {
    const numSeries = typeof series === 'number' ? series : 0;
    const numReps = typeof reps === 'number' ? reps : 0;

    setChronos(currentChronos => {
      const newChronos = produce(currentChronos, draft => {
        // Adjust number of series (rows)
        while (draft.length < numSeries) {
          draft.push(Array(numReps).fill(null));
        }
        while (draft.length > numSeries) {
          draft.pop();
        }

        // Adjust number of reps (columns) in each series
        draft.forEach((serie, index) => {
          while (draft[index].length < numReps) {
            draft[index].push(null);
          }
          while (draft[index].length > numReps) {
            draft[index].pop();
          }
        });
      });
      return newChronos;
    });
  }, [series, reps]);

  const handleChronoChange = (serieIndex: number, repIndex: number, value: number | null) => {
    const newChronos = produce(chronos, draft => {
      draft[serieIndex][repIndex] = value;
    });
    setChronos(newChronos);
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm relative">
      <div className="absolute top-2 right-2">
        <button type="button" onClick={() => onRemove(block.id)} className="p-1 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/20 rounded">
          <Trash2 className="w-5 h-5" />
        </button>
      </div>

      <div className="space-y-4">
        {/* Block Structure Inputs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 items-end">
          <NumberSelector
            label="Séries"
            value={series}
            onChange={setSeries}
            min={1}
            max={20}
          />
          <NumberSelector
            label="Répétitions"
            value={reps}
            onChange={setReps}
            min={1}
            max={50}
          />
          <DistanceInput
            label="Distance (m)"
            value={distance}
            onChange={setDistance}
            className="col-span-1"
          />
          <RestTimeSelector
            label="Repos / Série"
            value={parseInt(restBetweenSeries, 10) || undefined}
            onChange={(val) => setRestBetweenSeries(val ? val.toString() : '')}
          />
        </div>

        {/* Chrono Inputs */}
        <div className="space-y-3 pt-2">
          <h4 className="font-medium text-sm text-gray-800 dark:text-gray-200">Saisie des chronomètres</h4>
          {chronos.map((serie, serieIndex) => (
            <div key={serieIndex} className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <p className="mb-2 font-semibold text-xs text-gray-700 dark:text-gray-300">Série {serieIndex + 1}</p>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                {serie.map((chrono, repIndex) => (
                  <div key={repIndex}>
                    <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1 text-center">Rép {repIndex + 1}</label>
                    <ChronoInput
                      value={chrono}
                      onChange={(val) => handleChronoChange(serieIndex, repIndex, val)}
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};