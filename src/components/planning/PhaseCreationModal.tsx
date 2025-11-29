import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check } from 'lucide-react';
import { format, addDays } from 'date-fns';
import { PhaseCreationPayload, PhaseType, PlanningPhase } from '../../types/planning';

interface PhaseCreationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (payload: PhaseCreationPayload) => Promise<void>;
  onUpdate?: (id: string, payload: Partial<PhaseCreationPayload>) => Promise<void>;
  defaultStartDate: Date;
  context: { type: 'athlete' | 'group', id: string };
  userRole: string; // 'coach' | 'athlete'
  userId: string;
  editingPhase?: PlanningPhase | null;
}

const PHASE_TYPES: { type: PhaseType; label: string; color: string; desc: string }[] = [
  { type: 'volume', label: 'Volume', color: '#22c55e', desc: 'Construction, fondation' },
  { type: 'intensite', label: 'Intensité', color: '#ef4444', desc: 'Alerte, travail maximal' },
  { type: 'recuperation', label: 'Récupération', color: '#3b82f6', desc: 'Repos, régénération' },
  { type: 'competition', label: 'Compétition', color: '#eab308', desc: 'Préparation du pic' },
];

export const PhaseCreationModal: React.FC<PhaseCreationModalProps> = ({
  isOpen,
  onClose,
  onSave,
  onUpdate,
  defaultStartDate,
  context,
  userId,
  editingPhase
}) => {
  const [name, setName] = useState('');
  const [selectedType, setSelectedType] = useState<PhaseType>('volume');
  const [startDate, setStartDate] = useState(format(defaultStartDate, 'yyyy-MM-dd'));
  const [endDate, setEndDate] = useState(format(addDays(defaultStartDate, 6), 'yyyy-MM-dd'));
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (editingPhase) {
        setName(editingPhase.name);
        setSelectedType(editingPhase.type);
        setStartDate(editingPhase.start_date);
        setEndDate(editingPhase.end_date);
      } else {
        // Reset for new creation
        setName('');
        setSelectedType('volume');
        setStartDate(format(defaultStartDate, 'yyyy-MM-dd'));
        setEndDate(format(addDays(defaultStartDate, 6), 'yyyy-MM-dd'));
      }
    }
  }, [isOpen, editingPhase, defaultStartDate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;

    setIsSubmitting(true);
    const typeConfig = PHASE_TYPES.find(t => t.type === selectedType)!;
    
    const payload: PhaseCreationPayload = {
      name,
      type: selectedType,
      start_date: startDate,
      end_date: endDate,
      color_hex: typeConfig.color,
      coach_id: userId,
      group_id: context.type === 'group' ? context.id : undefined,
      athlete_id: context.type === 'athlete' ? context.id : undefined,
    };

    try {
      if (editingPhase && onUpdate) {
        await onUpdate(editingPhase.id, payload);
      } else {
        await onSave(payload);
      }
      onClose();
      // Optional: clear state here, though useEffect handles it on re-open
      if (!editingPhase) {
        setName('');
        setSelectedType('volume');
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white dark:bg-gray-800 w-full max-w-md rounded-2xl shadow-xl overflow-hidden"
        >
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              {editingPhase ? 'Modifier la Phase' : 'Nouvelle Phase'}
            </h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            
            {/* Name Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Nom de la phase
              </label>
              <input 
                type="text" 
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Ex: Cycle Force Max"
                className="w-full px-4 py-2 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-sprint-primary/50 outline-none transition-all"
                required
              />
            </div>

            {/* Type Selection */}
            <div className="grid grid-cols-2 gap-3">
              {PHASE_TYPES.map((t) => (
                <button
                  key={t.type}
                  type="button"
                  onClick={() => setSelectedType(t.type)}
                  className={`
                    relative flex flex-col items-start p-3 rounded-xl border transition-all
                    ${selectedType === t.type 
                      ? 'bg-white dark:bg-gray-700 shadow-md ring-2 ring-inset' 
                      : 'bg-gray-50 dark:bg-gray-900 border-transparent hover:bg-gray-100'
                    }
                  `}
                  style={{ 
                    borderColor: selectedType === t.type ? t.color : 'transparent',
                    ['--tw-ring-color' as any]: t.color 
                  }}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: t.color }} />
                    <span className="font-bold text-sm text-gray-900 dark:text-white capitalize">{t.label}</span>
                  </div>
                  <span className="text-xs text-gray-500 text-left leading-tight">
                    {t.desc}
                  </span>
                  
                  {selectedType === t.type && (
                    <div className="absolute top-2 right-2 text-sprint-primary">
                        <Check size={14} style={{ color: t.color }} />
                    </div>
                  )}
                </button>
              ))}
            </div>

            {/* Dates */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Début
                </label>
                <input 
                  type="date" 
                  value={startDate}
                  onChange={e => setStartDate(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-sprint-primary/50 outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Fin
                </label>
                <input 
                  type="date" 
                  value={endDate}
                  onChange={e => setEndDate(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-sprint-primary/50 outline-none"
                  required
                />
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 rounded-xl bg-sprint-primary text-white font-bold shadow-lg shadow-sprint-primary/30 hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:scale-100"
            >
              {isSubmitting ? 'Enregistrement...' : (editingPhase ? 'Mettre à jour' : 'Créer la phase')}
            </button>

          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
