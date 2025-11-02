import React, { useState } from 'react';
import { PlusCircle, X } from 'lucide-react';
import { useWorkoutTypes, WorkoutType } from '../../hooks/useWorkoutTypes';
import { HexColorPicker } from 'react-colorful';

interface WorkoutTypeSelectorProps {
  selectedType: WorkoutType | null;
  onSelectType: (type: WorkoutType) => void;
}

export const WorkoutTypeSelector: React.FC<WorkoutTypeSelectorProps> = ({ selectedType, onSelectType }) => {
  const { allWorkoutTypes, createCustomWorkoutType, loading } = useWorkoutTypes();
  const [isCreating, setIsCreating] = useState(false);
  const [newTypeName, setNewTypeName] = useState('');
  const [newTypeColor, setNewTypeColor] = useState('#aabbcc');
  const [error, setError] = useState('');

  const handleCreate = async () => {
    if (!newTypeName.trim()) {
      setError('Le nom du type de séance est obligatoire.');
      return;
    }
    try {
      const newType = await createCustomWorkoutType(newTypeName, newTypeColor);
      if (newType) {
        onSelectType(newType);
        setIsCreating(false);
        setNewTypeName('');
        setError('');
      }
    } catch (e: any) {
      setError(`Erreur: ${e.message}`);
    }
  };

  if (loading) {
    return <div className="p-4 text-center">Chargement des types de séance...</div>;
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border p-4">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        Type de séance *
      </label>
      <div className="flex flex-wrap gap-2">
        {allWorkoutTypes.map(type => (
          <button
            key={type.id}
            type="button"
            onClick={() => onSelectType(type)}
            className={`px-3 py-2 text-sm font-semibold rounded-full border-2 transition-transform transform hover:scale-105 ${
              selectedType?.id === type.id
                ? 'ring-2 ring-offset-2 dark:ring-offset-gray-800'
                : 'opacity-80 hover:opacity-100'
            }`}
            style={{
              backgroundColor: type.color,
              color: '#ffffff',
              borderColor: selectedType?.id === type.id ? 'rgba(255,255,255,0.7)' : 'transparent',
              ringColor: type.color
            }}
          >
            {type.name}
          </button>
        ))}
        <button
          type="button"
          onClick={() => setIsCreating(true)}
          className="flex items-center gap-2 px-3 py-2 text-sm font-semibold rounded-full border-2 border-dashed text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        >
          <PlusCircle size={16} />
          Personnalisé
        </button>
      </div>

      {isCreating && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md relative">
            <button onClick={() => setIsCreating(false)} className="absolute top-3 right-3 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
                <X size={20} />
            </button>
            <h3 className="text-lg font-bold mb-4">Nouveau type de séance</h3>
            <div className="space-y-4">
              <div>
                <label htmlFor="new-type-name" className="block text-sm font-medium mb-1">Nom *</label>
                <input
                  id="new-type-name"
                  type="text"
                  value={newTypeName}
                  onChange={(e) => setNewTypeName(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700"
                  placeholder="Ex: Séance Technique"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Couleur</label>
                <div className="flex justify-center">
                    <HexColorPicker color={newTypeColor} onChange={setNewTypeColor} />
                </div>
              </div>
              {error && <p className="text-red-500 text-sm">{error}</p>}
              <button
                type="button"
                onClick={handleCreate}
                className="w-full px-4 py-2 bg-primary-500 text-white rounded-lg font-semibold hover:bg-primary-600"
              >
                Créer et sélectionner
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
