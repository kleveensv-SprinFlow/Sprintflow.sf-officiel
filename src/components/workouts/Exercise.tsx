import React, { useState, useEffect, useMemo } from 'react';
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

  const allExercices = useMemo(() => {
    const formattedRefExercices = refExercices.map(ex => ({ id: ex.id, name: ex.nom_fr, category: ex.categorie }));
    const formattedCustomExercices = customExercices.map(ex => ({ id: ex.id, name: ex.nom, category: 'custom' }));
    return [...formattedRefExercices, ...formattedCustomExercices];
  }, [refExercices, customExercices]);

  const getExerciceName = (id: string) => {
    const exercice = allExercices.find(ex => ex.id === id);
    return exercice?.name || '';
  }

  useEffect(() => {
    if (initialExerciseId) {
        const initialName = getExerciceName(initialExerciseId);
        if(initialName) setSelectedExercise(initialExerciseId);
    }
  }, [initialExerciseId, allExercices]);
  

  const handleExerciseChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value;
    setSelectedExercise(id);
    onExerciseChange(id, getExerciceName(id));
  };
  
  const filteredExercices = useMemo(() => {
    return allExercices
      .filter(ex => {
        // Filter by category
        if (selectedCategory && ex.category !== 'custom') {
          return ex.category === selectedCategory;
        }
        return true;
      })
      .filter(ex => {
        // Filter by search query
        return ex.name.toLowerCase().includes(searchQuery.toLowerCase());
      });
  }, [allExercices, selectedCategory, searchQuery]);

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
        placeholder="Rechercher un exercice..."
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
        {filteredExercices.map((ex) => (
          <option key={ex.id} value={ex.id}>
            {ex.name}{ex.category === 'custom' ? ' (Perso.)' : ''}
          </option>
        ))}
      </select>
    </div>
  );
};

export default ExerciseSelector;