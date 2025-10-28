import React, { useState, useEffect } from 'react';
import { useExercices, CATEGORIES, ExerciceReference } from '../../hooks/useExercices';
import { supabase } from '../../lib/supabase';

interface CustomExercice {
  id: string;
  nom: string;
}

interface ExerciseSelectorProps {
  onExerciseChange: (id: string, name: string) => void;
  initialExerciseId?: string;
}

const ExerciseSelector: React.FC<ExerciseSelectorProps> = ({ onExerciseChange, initialExerciseId }) => {
  const { exercices: refExercices, loading } = useExercices();
  const [customExercices, setCustomExercices] = useState<CustomExercice[]>([]);
  
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedExercise, setSelectedExercise] = useState<string>(initialExerciseId || '');

  useEffect(() => {
    const fetchCustomExercices = async () => {
      const { data, error } = await supabase.from('exercices_personnalises').select('id, nom');
      if (!error) {
        setCustomExercices(data);
      }
    };
    fetchCustomExercices();
  }, []);

  const getExerciceName = (id: string) => {
    const allExercices = [...refExercices, ...customExercices];
    const exercice = allExercices.find(ex => ex.id === id);
    return exercice?.nom || (exercice as ExerciceReference)?.nom_fr || '';
  }

  useEffect(() => {
    if (initialExerciseId) {
        const initialName = getExerciceName(initialExerciseId);
        if(initialName) setSelectedExercise(initialExerciseId);
    }
  }, [initialExerciseId, refExercices, customExercices]);
  

  const handleExerciseChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value;
    setSelectedExercise(id);
    onExerciseChange(id, getExerciceName(id));
  };
  
  const filteredExercices = refExercices
    .filter(ex => selectedCategory === '' || ex.categorie === selectedCategory)
    .filter(ex => ex.nom_fr.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="space-y-2">
      <select
        value={selectedCategory}
        onChange={(e) => setSelectedCategory(e.target.value)}
        className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 rounded"
      >
        <option value="">Toutes les catégories</option>
        {Object.entries(CATEGORIES).map(([key, label]) => (
          <option key={key} value={key}>{label}</option>
        ))}
      </select>

      <input
        type="text"
        placeholder="Rechercher..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 rounded"
      />
      
      <select
        value={selectedExercise}
        onChange={handleExerciseChange}
        disabled={loading}
        className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 rounded disabled:opacity-50"
      >
        <option value="">Sélectionner un exercice...</option>
        <optgroup label="Exercices de référence">
          {filteredExercices.map((ex) => (
            <option key={ex.id} value={ex.id}>{ex.nom_fr}</option>
          ))}
        </optgroup>
        <optgroup label="Exercices personnalisés">
          {customExercices.map((ex) => (
            <option key={ex.id} value={ex.id}>{ex.nom}</option>
          ))}
        </optgroup>
      </select>
    </div>
  );
};

export default ExerciseSelector;