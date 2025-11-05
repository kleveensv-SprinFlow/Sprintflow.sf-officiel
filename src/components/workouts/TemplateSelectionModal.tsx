import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, FileText } from 'lucide-react';
import { WorkoutTemplate } from '../../types/workout';

// Données factices pour la démonstration
const MOCK_TEMPLATES: WorkoutTemplate[] = [
  { id: '1', name: 'Séance VMA Courte', workout_data: {} },
  { id: '2', name: 'Force Max - Bas du corps', workout_data: {} },
  { id: '3', name: 'Endurance Fondamentale (Zone 2)', workout_data: {} },
];

interface TemplateSelectionModalProps {
  onSelect: (template: WorkoutTemplate) => void;
  onClose: () => void;
}

export const TemplateSelectionModal: React.FC<TemplateSelectionModalProps> = ({ onSelect, onClose }) => {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-lg p-6 max-h-[80vh] flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Choisir un modèle</h3>
            <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
              <X size={20} />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto pr-2 space-y-2">
            {MOCK_TEMPLATES.map((template) => (
              <button
                key={template.id}
                onClick={() => onSelect(template)}
                className="w-full flex items-center gap-4 p-4 rounded-xl text-left hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
              >
                <FileText className="w-6 h-6 text-blue-500" />
                <span className="font-medium text-gray-800 dark:text-gray-200">{template.name}</span>
              </button>
            ))}
            {MOCK_TEMPLATES.length === 0 && (
              <p className="text-center text-gray-500 py-8">Aucun modèle enregistré.</p>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};