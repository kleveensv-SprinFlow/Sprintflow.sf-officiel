import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useExercices } from '../../hooks/useExercices';
import TimePicker from '../common/TimePicker';
import PickerWheel from '../common/PickerWheel';
import { EXERCISE_CATEGORIES } from '../../data/categories';
import { MuscuBlock, WorkoutBlock } from '../../types/workout';

interface MuscuBlockFormProps {
  onSave: (newBlock: Omit<WorkoutBlock, 'id'> | WorkoutBlock) => void;
  onCancel: () => void;
  initialData?: MuscuBlock;
  isOpen: boolean;
  userRole: 'coach' | 'athlete';
}

const seriesValues = Array.from({ length: 20 }, (_, i) => i + 1);
const repsValues = Array.from({ length: 50 }, (_, i) => i + 1);
const poidsValues = [0, ...Array.from({ length: 400 }, (_, i) => (i + 1) * 0.5)];

const defaultState: Omit<MuscuBlock, 'id' | 'charges'> = {
  type: 'musculation',
  exerciceId: '',
  exerciceNom: '',
  series: 3,
  reps: 10,
  poids: 50,
  restTime: '02:00',
};

export const MuscuBlockForm: React.FC<MuscuBlockFormProps> = ({ onSave, onCancel, initialData, isOpen, userRole }) => {
  const { exercices } = useExercices();
  const [block, setBlock] = useState(initialData || { ...defaultState, charges: [] });
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [noWeight, setNoWeight] = useState(false);
  const isAthlete = userRole === 'athlete';

  useEffect(() => {
    const data = initialData || { ...defaultState, charges: [] };
    if (isAthlete && (!data.charges || data.charges.length !== data.series || data.charges[0]?.length !== data.reps)) {
      const newCharges = Array(data.series).fill(null).map(() => Array(data.reps).fill(null));
      setBlock({ ...data, charges: newCharges });
    } else {
      setBlock(data);
    }

    setNoWeight(data.poids === null);
    if (data.exerciceId) {
      const exo = exercices.find(e => e.id === data.exerciceId);
      if (exo) setSelectedCategory(exo.categorie);
    } else {
      setSelectedCategory('');
    }
  }, [initialData, isOpen, exercices, isAthlete]);

  const updateBlock = (updatedFields: Partial<Omit<MuscuBlock, 'id'>>) => {
    setBlock(prev => ({ ...prev, ...updatedFields }));
  };

  const handleChargeChange = (serieIndex: number, repIndex: number, value: number | null) => {
    const newCharges = [...(block.charges || [])];
    if (!newCharges[serieIndex]) newCharges[serieIndex] = [];
    newCharges[serieIndex][repIndex] = value;
    updateBlock({ charges: newCharges });
  };

  const handleValidate = () => {
    if (!block.exerciceId) {
      alert("Veuillez sélectionner un exercice.");
      return;
    }
    onSave(noWeight ? { ...block, poids: null } : block);
  };

  const handleNoWeightToggle = () => {
    setNoWeight(prev => {
      if (!prev) updateBlock({ poids: 0 });
      return !prev;
    });
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCategory(e.target.value);
    updateBlock({ exerciceId: '', exerciceNom: '' });
  };

  const filteredExercices = useMemo(() => {
    if (!selectedCategory) return [];
    return exercices.filter(ex => ex.categorie === selectedCategory);
  }, [selectedCategory, exercices]);

  const renderCoachForm = () => (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">Catégorie</label>
          <select value={selectedCategory} onChange={handleCategoryChange} className="w-full h-11 px-4 rounded-xl border">
            <option value="">Sélectionner...</option>
            {EXERCISE_CATEGORIES.map(cat => <option key={cat.key} value={cat.key}>{cat.label}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Exercice</label>
          <select value={block.exerciceId} onChange={(e) => updateBlock({ exerciceId: e.target.value, exerciceNom: e.target.selectedOptions[0].text })} className="w-full h-11 px-4 rounded-xl border" disabled={!selectedCategory}>
            <option value="">Sélectionner...</option>
            {filteredExercices.map(ex => <option key={ex.id} value={ex.id}>{ex.nom}</option>)}
          </select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <PickerWheel label="Séries" values={seriesValues} initialValue={block.series} onChange={(val) => updateBlock({ series: val })} />
        <PickerWheel label="Répétitions" values={repsValues} initialValue={block.reps} onChange={(val) => updateBlock({ reps: val })} />
        <div>
          <div className="flex items-center justify-center mb-2">
            <label className="text-sm font-medium">Poids</label>
            <input type="checkbox" checked={noWeight} onChange={handleNoWeightToggle} className="ml-2" />
            <span className="text-xs ml-1">Aucun</span>
          </div>
          <PickerWheel values={poidsValues} initialValue={block.poids || 0} onChange={(val) => updateBlock({ poids: val })} suffix="kg" disabled={noWeight} />
        </div>
        <div>
          <label className="block text-sm font-medium text-center mb-2">Repos</label>
          <TimePicker initialTime={block.restTime} onChange={(val) => updateBlock({ restTime: val })} />
        </div>
      </div>
    </>
  );

  const renderAthleteForm = () => (
     <div className="space-y-4">
      <div className="text-center font-semibold">{block.exerciceNom}: {block.series} x {block.reps}</div>
      <div className="max-h-60 overflow-y-auto space-y-3 p-1">
        {Array.from({ length: block.series }).map((_, serieIndex) => (
          <div key={serieIndex} className="p-2 border rounded-md dark:border-gray-600">
            <h4 className="font-medium text-sm mb-2">Série {serieIndex + 1}</h4>
            <div className="grid grid-cols-3 gap-2">
              {Array.from({ length: block.reps }).map((_, repIndex) => (
                <div key={repIndex}>
                  <label className="block text-xs text-center text-gray-500">Rep {repIndex + 1}</label>
                  <input
                    type="number"
                    step="0.5"
                    placeholder="kg"
                    value={block.charges?.[serieIndex]?.[repIndex] ?? ''}
                    onChange={(e) => handleChargeChange(serieIndex, repIndex, e.target.value === '' ? null : parseFloat(e.target.value))}
                    className="w-full mt-1 p-1.5 text-center bg-gray-100 dark:bg-gray-700 border rounded-md"
                  />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={onCancel}>
          <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
            <div className="space-y-6 p-6">
              <h3 className="text-xl font-bold">{isAthlete ? 'Saisir les charges' : (initialData ? 'Modifier le bloc Musculation' : 'Ajouter un bloc Musculation')}</h3>

              {isAthlete ? renderAthleteForm() : renderCoachForm()}

              <div className="flex gap-3 pt-4 border-t">
                <button type="button" onClick={handleValidate} className="flex-1 bg-blue-500 text-white px-6 py-3 rounded-xl">{isAthlete ? 'Valider les charges' : (initialData ? 'Modifier' : 'Ajouter')}</button>
                <button type="button" onClick={onCancel} className="px-6 py-3 border-2 rounded-xl">Annuler</button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
