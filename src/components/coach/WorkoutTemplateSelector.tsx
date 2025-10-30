import React from 'react';
import { PlusCircle, ArrowRight } from 'lucide-react';
import useAuth from '../../hooks/useAuth';
import { useWorkoutTemplates } from '../../hooks/useWorkoutTemplates';
import { View } from '../../types';

interface WorkoutTemplateSelectorProps {
  onNavigate: (view: View, params?: any) => void;
}

export const WorkoutTemplateSelector: React.FC<WorkoutTemplateSelectorProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const { templates, loading, error } = useWorkoutTemplates(user?.id);

  const handleSelectTemplate = (template: any) => {
    // Navigate to NewWorkoutForm with the template's structure
    onNavigate('add-workout', { editingWorkout: template.structure_json });
  };

  const handleCreateFromScratch = () => {
    // Navigate to NewWorkoutForm with no pre-filled data
    onNavigate('add-workout');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Planifier une Séance</h2>
      </div>

      <div 
        onClick={handleCreateFromScratch}
        className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow border border-gray-200 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-4"
      >
        <PlusCircle className="w-8 h-8 text-blue-600" />
        <div>
          <h3 className="font-semibold text-blue-600">Créer une séance à partir de zéro</h3>
          <p className="text-sm text-gray-500">Commencez avec un formulaire vierge.</p>
        </div>
      </div>

      <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 pt-4">Ou utiliser un modèle</h3>
      
      {loading && <p>Chargement des modèles...</p>}
      {error && <p className="text-red-500">Erreur: {error.message}</p>}

      {!loading && templates.length === 0 && (
        <div className="text-center py-10 bg-gray-100 dark:bg-gray-800 rounded-lg">
          <p className="text-gray-600 dark:text-gray-400">Vous n'avez aucun modèle de séance.</p>
          <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">Créez une séance et cochez "Enregistrer comme modèle" pour en ajouter un.</p>
        </div>
      )}

      <div className="space-y-3">
        {templates.map(template => (
          <div 
            key={template.id} 
            onClick={() => handleSelectTemplate(template)}
            className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow border border-gray-200 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 flex justify-between items-center"
          >
            <span className="font-medium">{template.name}</span>
            <ArrowRight className="w-5 h-5 text-gray-400" />
          </div>
        ))}
      </div>
    </div>
  );
};
