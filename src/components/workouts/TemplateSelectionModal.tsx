import React from 'react';
import { X, CheckSquare, Square } from 'lucide-react';
import { WorkoutTemplate, useWorkoutTemplates } from '../../hooks/useWorkoutTemplates';

interface TemplateSelectionModalProps {
  onSelect: (template: WorkoutTemplate) => void;
  onClose: () => void;
  onCreateNew: () => void;
}

export const TemplateSelectionModal: React.FC<TemplateSelectionModalProps> = ({ onSelect, onClose, onCreateNew }) => {
  const { templates, loading, error } = useWorkoutTemplates();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-lg">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Planifier une séance</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full">
            <X size={24} />
          </button>
        </div>

        <div className="space-y-4">
            <button
                onClick={onCreateNew}
                className="w-full text-left p-4 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-all duration-200"
            >
                <h3 className="font-bold text-lg">Créer une séance de zéro</h3>
                <p className="text-sm opacity-90">Partir d'une feuille blanche pour construire une nouvelle séance.</p>
            </button>

            <div>
                <h3 className="font-semibold mb-2 text-gray-800 dark:text-gray-200">Ou utiliser un modèle</h3>
                {loading && <p>Chargement des modèles...</p>}
                {error && <p className="text-red-500">{error}</p>}

                {!loading && templates.length === 0 && (
                    <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                        Vous n'avez aucun modèle de séance. Créez-en un pour le réutiliser ici.
                    </p>
                )}

                <div className="space-y-2 max-h-64 overflow-y-auto">
                    {templates.map(template => (
                        <div
                            key={template.id}
                            onClick={() => onSelect(template)}
                            className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 flex items-center justify-between"
                        >
                            <span className="font-medium">{template.template_name}</span>
                            <Square className="text-gray-400"/>
                        </div>
                    ))}
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};
