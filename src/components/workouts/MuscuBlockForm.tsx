import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useExercices, ExerciceReference } from '../../hooks/useExercices';
import { TiroirDeSelection } from '../common/TiroirDeSelection';
import { MuscuBlock, WorkoutBlock } from '../../types/workout';
import { ChevronDown } from 'lucide-react';
import PickerWheel from '../common/PickerWheel';
import WeightStepper from '../common/WeightStepper';
import RestTimeSelector from '../common/RestTimeSelector';
import { ChoiceModal } from '../common/ChoiceModal';
import { CustomExerciceForm } from '../records/CustomExerciceForm';

interface MuscuBlockFormProps {
  onSave: (newBlock: Omit<WorkoutBlock, 'id'> | WorkoutBlock) => void;
  onCancel: () => void;
  initialData?: MuscuBlock;
  isOpen: boolean;
  userRole: 'coach' | 'athlete';
}

const seriesValues = Array.from({ length: 20 }, (_, i) => i + 1);
const repsValues = Array.from({ length: 50 }, (_, i) => i + 1);

const defaultState: Omit<MuscuBlock, 'id' | 'charges'> = {
  type: 'musculation',
  exerciceId: '',
  exerciceNom: '',
  series: 3,
  reps: 10,
  poids: 50,
  restTime: '01:30',
};

export const MuscuBlockForm: React.FC<MuscuBlockFormProps> = ({ onSave, onCancel, initialData, isOpen }) => {
  const { exercices, loadExercices } = useExercices();
  const [block, setBlock] = useState(initialData || defaultState);
  const [noWeight, setNoWeight] = useState(false);
  
  const [isChoiceModalOpen, setIsChoiceModalOpen] = useState(false);
  const [isTiroirOpen, setIsTiroirOpen] = useState(false);
  const [isCustomFormOpen, setIsCustomFormOpen] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const data = initialData || defaultState;
      setBlock(data);
      setNoWeight(data.poids === null);
    }
  }, [initialData, isOpen]);

  const updateBlock = (updatedFields: Partial<Omit<MuscuBlock, 'id'>>) => {
    setBlock(prev => ({ ...prev, ...updatedFields }));
  };

  const handleSelectExercice = (exercice: ExerciceReference) => {
    updateBlock({ exerciceId: exercice.id, exerciceNom: exercice.nom });
    setIsTiroirOpen(false);
  };

  const handleSaveCustomExercice = (newExercice: ExerciceReference) => {
    loadExercices();
    handleSelectExercice(newExercice);
    setIsCustomFormOpen(false);
  }
  
  const handleValidate = () => {
    if (!block.exerciceId) {
      alert("Veuillez sélectionner un exercice.");
      return;
    }
    onSave(block);
  };

  const handleNoWeightToggle = () => {
    const isTogglingToNoWeight = !noWeight;
    setNoWeight(isTogglingToNoWeight);
    if (isTogglingToNoWeight) {
      updateBlock({ poids: null });
    } else {
      updateBlock({ poids: initialData?.poids || defaultState.poids || 0 });
    }
  };
  
  const exerciceChoices = [
    { label: 'Choisir un exercice existant', action: () => setIsTiroirOpen(true), style: 'primary' as const },
    { label: 'Créer un nouvel exercice', action: () => setIsCustomFormOpen(true), style: 'default' as const },
  ];

  const title = initialData ? 'Modifier le bloc Musculation' : 'Ajouter un bloc Musculation';

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} 
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" 
            onClick={onCancel}
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} 
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-lg mx-4" 
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">{title}</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Exercice</label>
                    <button
                      type="button"
                      onClick={() => setIsChoiceModalOpen(true)}
                      className="w-full flex justify-between items-center px-3 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white"
                    >
                      <span className={block.exerciceNom ? '' : 'text-gray-400'}>
                        {block.exerciceNom || 'Sélectionner / Créer'}
                      </span>
                      <ChevronDown className="w-5 h-5 text-gray-400" />
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <PickerWheel 
                      label="Séries" 
                      values={seriesValues} 
                      initialValue={block.series} 
                      onChange={(val) => updateBlock({ series: val as number })} 
                    />
                    <PickerWheel 
                      label="Répétitions" 
                      values={repsValues} 
                      initialValue={block.reps} 
                      onChange={(val) => updateBlock({ reps: val as number })} 
                    />
                  </div>
                  
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Poids</label>
                      <div className="flex items-center">
                        <input 
                          type="checkbox" id="noWeight" checked={noWeight} onChange={handleNoWeightToggle} 
                          className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                        />
                        <label htmlFor="noWeight" className="ml-2 text-xs text-gray-500 dark:text-gray-400">Poids du corps</label>
                      </div>
                    </div>
                    <WeightStepper 
                      initialValue={block.poids}
                      onChange={(val) => updateBlock({ poids: val })}
                      disabled={noWeight}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Repos</label>
                    <RestTimeSelector
                       initialTime={block.restTime}
                       onChange={(val) => updateBlock({ restTime: val })}
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-6 mt-4 border-t border-gray-200 dark:border-gray-700">
                  <button type="button" onClick={onCancel} className="w-full px-6 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                    Annuler
                  </button>
                  <button type="button" onClick={handleValidate} className="w-full bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition-colors">
                    {initialData ? 'Modifier' : 'Ajouter'}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <ChoiceModal 
        isOpen={isChoiceModalOpen}
        onClose={() => setIsChoiceModalOpen(false)}
        choices={exerciceChoices}
        title="Exercice"
      />

      <TiroirDeSelection
        isOpen={isTiroirOpen}
        onClose={() => setIsTiroirOpen(false)}
        onSelectExercice={handleSelectExercice}
        exercices={exercices}
        title="Sélectionner un exercice"
        showCreateButton={false}
      />

      <AnimatePresence>
          {isCustomFormOpen && (
              <CustomExerciceForm 
                  onSave={handleSaveCustomExercice}
                  onCancel={() => setIsCustomFormOpen(false)}
              />
          )}
      </AnimatePresence>
    </>
  );
};