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
}

const seriesValues = Array.from({ length: 20 }, (_, i) => i + 1);
const repsValues = Array.from({ length: 50 }, (_, i) => i + 1);
const poidsValues = [0, ...Array.from({ length: 400 }, (_, i) => (i + 1) * 0.5)];

const defaultState: Omit<MuscuBlock, 'id'> = {
  type: 'musculation',
  exerciceId: '',
  exerciceNom: '',
  series: 3,
  reps: 10,
  poids: 50,
  restTime: '02:00',
};

export const MuscuBlockForm: React.FC<MuscuBlockFormProps> = ({ onSave, onCancel, initialData, isOpen }) => {
  const { exercices } = useExercices();
  const [block, setBlock] = useState(initialData || defaultState);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [noWeight, setNoWeight] = useState(false);

  useEffect(() => {
    const data = initialData || defaultState;
    setBlock(data);
    setNoWeight(data.poids === null);
    if (data.exerciceId) {
      const exo = exercices.find(e => e.id === data.exerciceId);
      if (exo) setSelectedCategory(exo.categorie);
    } else {
      setSelectedCategory('');
    }
  }, [initialData, isOpen, exercices]);

  const updateBlock = (updatedFields: Partial<Omit<MuscuBlock, 'id'>>) => {
    setBlock(prev => ({ ...prev, ...updatedFields }));
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
      if (!prev) updateBlock({ poids: 0 }); // Si on coche, mettre le poids à 0
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

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={onCancel}>
          <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
            <div className="space-y-6 p-6">
              <h3 className="text-xl font-bold">{initialData ? 'Modifier le bloc Musculation' : 'Ajouter un bloc Musculation'}</h3>
              
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

              <div className="flex gap-3 pt-4 border-t">
                <button type="button" onClick={handleValidate} className="flex-1 bg-blue-500 text-white px-6 py-3 rounded-xl">{initialData ? 'Modifier' : 'Ajouter'}</button>
                <button type="button" onClick={onCancel} className="px-6 py-3 border-2 rounded-xl">Annuler</button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};