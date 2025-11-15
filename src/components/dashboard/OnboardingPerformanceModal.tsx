import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X, ArrowRight, ArrowLeft, Plus, Trash2, Check } from 'lucide-react';
import { useExercices } from '../../hooks/useExercices.ts';
import { useRecords } from '../../hooks/useRecords.ts';
import { useBodycomp } from '../../hooks/useBodycomp.ts';
import { EXERCISE_CATEGORIES } from '../../data/categories.ts';
import CustomNumpad from '../common/CustomNumpad.tsx'; // Ensure this path is correct

const InternalNumpad: React.FC<{ onInput: (v: string) => void; onDelete: () => void; onConfirm: () => void; currentValue: string; }> = 
({ onInput, onDelete, onConfirm, currentValue }) => {
  const buttons = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '0'];
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="w-full"
    >
      <div className="pt-4">
        <div className="text-center text-3xl font-bold p-2 mb-4 border-b-2 border-indigo-500 text-gray-900 dark:text-white">
          {currentValue || '0'}
        </div>
        <div className="grid grid-cols-3 gap-2">
          {buttons.map(btn => (
            <NumpadButton key={btn} onClick={() => onInput(btn)}>{btn}</NumpadButton>
          ))}
          <NumpadButton onClick={onDelete} className="bg-red-500/20 text-red-500 dark:bg-red-500/30 dark:text-red-400">
            <ArrowLeft size={24} />
          </NumpadButton>
        </div>
        <button
          type="button"
          onClick={onConfirm}
          className="w-full mt-4 h-14 flex items-center justify-center gap-2 bg-green-600 text-white rounded-lg text-lg font-bold hover:bg-green-700 transition-colors"
        >
          <Check size={24} /> Valider
        </button>
      </div>
    </motion.div>
  );
};

const NumpadButton: React.FC<{ onClick: () => void; children: React.ReactNode; className?: string }> = ({ onClick, children, className = '' }) => (
  <button
    type="button"
    onClick={onClick}
    className={`flex items-center justify-center h-12 rounded-lg bg-gray-200/50 dark:bg-gray-700/50 text-xl font-semibold text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors ${className}`}
  >
    {children}
  </button>
);


interface OnboardingPerformanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

const steps = [
  { id: 'welcome', title: 'Bienvenue !' },
  { id: 'weight', title: 'Votre Poids Actuel' },
  { id: 'records', title: 'Vos Records' },
  { id: 'summary', title: 'Récapitulatif' },
];

type RecordEntry = {
  id: number;
  category: string;
  exerciseId: string;
  value: string;
};

const OnboardingPerformanceModal: React.FC<OnboardingPerformanceModalProps> = ({ isOpen, onClose, onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  const [isNumpadOpen, setIsNumpadOpen] = useState(false);
  const [activeRecordId, setActiveRecordId] = useState<number | null>(null);

  const [weight, setWeight] = useState<string>('');
  const [records, setRecords] = useState<RecordEntry[]>([]);

  const { exercices } = useExercices();
  const { createRecord } = useRecords();
  const { addBodyCompData } = useBodycomp();
  
  const getExerciseNameById = (id: string) => exercices.find(e => e.id === id)?.nom || 'Inconnu';

  const nextStep = () => {
    setDirection(1);
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    setDirection(-1);
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };
  
  const handleComplete = async () => {
    setIsLoading(true);
    try {
      if (weight) {
        await addBodyCompData({ poids_kg: parseFloat(weight) });
      }
      
      const validRecords = records.filter(r => r.exerciseId && r.value);
      for (const record of validRecords) {
        await createRecord({ 
          exercice_id: record.exerciseId, 
          value: parseFloat(record.value), 
          date: new Date().toISOString().split('T')[0]
        });
      }
      
      onComplete();
    } catch(error) {
      console.error("Failed to save onboarding data", error);
    } finally {
      setIsLoading(false);
    }
  };

  const addRecordRow = () => {
    setRecords([...records, { id: Date.now(), category: '', exerciseId: '', value: '' }]);
  };

  const removeRecordRow = (id: number) => {
    setRecords(records.filter(r => r.id !== id));
  };
  
  const updateRecord = (id: number, field: keyof Omit<RecordEntry, 'id'>, value: string) => {
    setRecords(records.map(r => r.id === id ? { ...r, [field]: value, ...(field === 'category' && { exerciseId: '' }) } : r));
  };
  
  const openNumpad = (recordId: number) => {
    setActiveRecordId(recordId);
    setIsNumpadOpen(true);
  };
  
  const handleNumpadInput = (input: string) => {
    if (activeRecordId === null) return;
    const record = records.find(r => r.id === activeRecordId);
    if (!record) return;

    let currentValue = record.value;
    if (input === '.' && currentValue.includes('.')) return;
    
    updateRecord(activeRecordId, 'value', currentValue + input);
  };

  const handleNumpadDelete = () => {
     if (activeRecordId === null) return;
     const record = records.find(r => r.id === activeRecordId);
     if (!record) return;
     updateRecord(activeRecordId, 'value', record.value.slice(0, -1));
  };
  
  const handleNumpadConfirm = () => {
    setIsNumpadOpen(false);
    setActiveRecordId(null);
  };

  const renderStepContent = () => {
    switch (steps[currentStep].id) {
      case 'welcome':
        return (
          <div className="text-center">
            <h3 className="text-xl font-bold mb-2">Débloquez votre Indice de Performance</h3>
            <p className="text-gray-600 dark:text-gray-300">
              En quelques étapes, renseignez vos données clés pour calculer votre score Poids/Puissance.
            </p>
          </div>
        );
      case 'weight':
        return (
          <div>
            <label className="block text-sm font-medium mb-2 text-center">Votre poids (kg)</label>
            <input
              type="number"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              placeholder="Ex: 75.5"
              className="w-full bg-gray-100 dark:bg-gray-700 rounded-lg p-3 text-center text-2xl"
            />
          </div>
        );
      case 'records':
        if (isNumpadOpen) {
          const activeRecord = records.find(r => r.id === activeRecordId);
          return <InternalNumpad 
                    currentValue={activeRecord?.value || ''}
                    onInput={handleNumpadInput}
                    onDelete={handleNumpadDelete}
                    onConfirm={handleNumpadConfirm}
                  />
        }
        return (
          <div className="w-full max-h-64 overflow-y-auto pr-2">
            <div className="space-y-4">
              {records.map((record) => {
                const filteredExercises = exercices.filter(ex => ex.categorie === record.category);

                return (
                  <div key={record.id} className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg space-y-2 relative">
                     <button onClick={() => removeRecordRow(record.id)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"><Trash2 size={12} /></button>
                    <select 
                      value={record.category}
                      onChange={e => updateRecord(record.id, 'category', e.target.value)}
                      className="w-full bg-white dark:bg-gray-800 rounded-lg p-2 text-sm"
                    >
                      <option value="">Sélectionnez une catégorie...</option>
                      {EXERCISE_CATEGORIES.map(cat => (
                        <option key={cat.key} value={cat.key}>{cat.label}</option>
                      ))}
                    </select>
                    {record.category && (
                       <select 
                        value={record.exerciseId}
                        onChange={e => updateRecord(record.id, 'exerciseId', e.target.value)}
                        className="w-full bg-white dark:bg-gray-800 rounded-lg p-2 text-sm"
                      >
                        <option value="">Sélectionnez un exercice...</option>
                        {filteredExercises.map(ex => <option key={ex.id} value={ex.id}>{ex.nom}</option>)}
                      </select>
                    )}
                     <button
                      onClick={() => openNumpad(record.id)}
                      className="w-full bg-white dark:bg-gray-800 rounded-lg p-2 text-sm text-left"
                    >
                      {record.value || <span className="text-gray-400">Record (ex: 120)</span>}
                    </button>
                  </div>
                );
              })}
            </div>
            <button onClick={addRecordRow} className="mt-4 w-full flex items-center justify-center gap-2 p-2 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700">
              <Plus size={16} /> Ajouter un record
            </button>
          </div>
        );
      case 'summary':
        return (
          <div className="text-left max-h-64 overflow-y-auto">
            <h3 className="text-xl font-bold mb-4 text-center">Prêt à calculer ?</h3>
            <ul className="space-y-3">
              <li className="flex justify-between p-2 rounded-lg bg-gray-50 dark:bg-gray-700/50"><span>Poids:</span> <strong>{weight || 'N/A'} kg</strong></li>
              {records.filter(r => r.exerciseId && r.value).map(r => (
                <li key={r.id} className="flex justify-between p-2 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                  <span>{getExerciseNameById(r.exerciseId)}:</span> <strong>{r.value} kg/cm</strong>
                </li>
              ))}
            </ul>
             {records.filter(r => r.exerciseId && r.value).length === 0 && <p className="text-center text-gray-500 text-sm mt-4">Aucun record renseigné.</p>}
            <p className="text-xs text-gray-500 mt-4 text-center">Vous pourrez toujours modifier ces informations plus tard.</p>
          </div>
        );
      default:
        return null;
    }
  };

  const variants = {
    enter: (direction: number) => ({ x: direction > 0 ? 300 : -300, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (direction: number) => ({ x: direction < 0 ? 300 : -300, opacity: 0 })
  };

  return (
    <AnimatePresence>
      {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={onClose}
          >
            <motion.div
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg w-full max-w-md p-6 relative text-gray-900 dark:text-white pb-20"
              onClick={(e) => e.stopPropagation()}
              initial={{ scale: 0.9 }} 
              animate={{ scale: 1 }} 
              exit={{ scale: 0.9 }}
            >
              <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 z-10">
                <X size={24} />
              </button>
              <div className="flex justify-between items-center mb-4">
                 <h2 className="text-lg font-bold">
                    {isNumpadOpen ? `Saisir: ${getExerciseNameById(records.find(r => r.id === activeRecordId)?.exerciseId || '')}` : steps[currentStep].title}
                 </h2>
                 <div className="flex items-center space-x-2">
                   {steps.map((step, index) => (
                     <div key={step.id} className={`w-2 h-2 rounded-full ${currentStep >= index ? 'bg-indigo-600' : 'bg-gray-300 dark:bg-gray-600'}`}></div>
                   ))}
                 </div>
              </div>

              <div className="min-h-[24rem] flex items-center justify-center">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentStep + (isNumpadOpen ? 10 : 0)}
                    custom={direction}
                    variants={variants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    className="w-full"
                  >
                    {renderStepContent()}
                  </motion.div>
                </AnimatePresence>
              </div>

              <div className={`flex justify-between mt-6 ${isNumpadOpen ? 'hidden' : ''}`}>
                <button onClick={prevStep} disabled={currentStep === 0} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50">
                  <ArrowLeft size={20}/>
                </button>
                {currentStep < steps.length - 1 ? (
                  <button onClick={nextStep} className="bg-indigo-600 text-white font-semibold py-2 px-4 rounded-lg flex items-center">
                    Suivant <ArrowRight size={20} className="ml-2"/>
                  </button>
                ) : (
                  <button onClick={handleComplete} disabled={isLoading} className="bg-green-600 text-white font-semibold py-2 px-4 rounded-lg">
                    {isLoading ? 'Calcul en cours...' : 'Terminer'}
                  </button>
                )}
              </div>
            </motion.div>
          </motion.div>
      )}
    </AnimatePresence>
  );
};

export default OnboardingPerformanceModal;