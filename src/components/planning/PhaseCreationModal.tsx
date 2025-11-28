import React, { useState } from 'react';
import { X, Check } from 'lucide-react';
import { TrainingPhasePayload } from '../../hooks/useTrainingPhases';

interface PhaseCreationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (phase: TrainingPhasePayload) => void;
  startDate: string;
  endDate: string;
}

const PHASE_TYPES = [
  { id: 'volume', label: 'Volume / Base', color: '#10B981', bg: 'bg-emerald-500' }, // Green
  { id: 'intensite', label: 'Intensité / Choc', color: '#EF4444', bg: 'bg-red-500' }, // Red
  { id: 'recuperation', label: 'Récupération / Deload', color: '#3B82F6', bg: 'bg-blue-500' }, // Blue
  { id: 'competition', label: 'Compétition / Affûtage', color: '#EAB308', bg: 'bg-yellow-500' }, // Gold
];

export const PhaseCreationModal: React.FC<PhaseCreationModalProps> = ({
  isOpen,
  onClose,
  onSave,
  startDate,
  endDate,
}) => {
  const [name, setName] = useState('');
  const [type, setType] = useState(PHASE_TYPES[0].id);
  const [start, setStart] = useState(startDate);
  const [end, setEnd] = useState(endDate);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const selectedType = PHASE_TYPES.find(t => t.id === type);
    onSave({
      name,
      type: type as any,
      start_date: start,
      end_date: end,
      color: selectedType?.color,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-md p-6 shadow-xl animate-in fade-in zoom-in duration-200">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">Définir une Phase</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nom de la phase</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="ex: Préparation Générale"
              className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-sprint-primary outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Type de cycle</label>
            <div className="grid grid-cols-2 gap-2">
              {PHASE_TYPES.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setType(t.id)}
                  className={`
                    p-3 rounded-xl border text-left text-sm font-medium transition-all
                    ${type === t.id
                      ? `border-${t.color} ring-1 ring-${t.color} bg-gray-50 dark:bg-gray-800`
                      : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50'
                    }
                  `}
                  style={{ borderColor: type === t.id ? t.color : undefined }}
                >
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${t.bg}`} style={{ backgroundColor: t.color }}></div>
                    <span className="text-gray-900 dark:text-white">{t.label}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Début</label>
                <input
                type="date"
                required
                value={start}
                onChange={(e) => setStart(e.target.value)}
                className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-sprint-primary outline-none"
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Fin</label>
                <input
                type="date"
                required
                value={end}
                onChange={(e) => setEnd(e.target.value)}
                className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-sprint-primary outline-none"
                />
            </div>
          </div>

          <button
            type="submit"
            className="w-full mt-6 bg-sprint-primary hover:bg-sprint-primary/90 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-colors"
          >
            <Check size={20} />
            Valider la phase
          </button>
        </form>
      </div>
    </div>
  );
};
