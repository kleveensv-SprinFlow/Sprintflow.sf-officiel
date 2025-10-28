import React, { useState, useEffect, useMemo } from 'react';
import { CATEGORIES } from '../../hooks/useExercices';

interface Exercice {
  id: string;
  name: string;
  category: string;
}

interface ExerciseSelectorProps {
  allExercices: Exercice[];
  loading: boolean;
  onExerciseChange: (id: string, name: string) => void;
  initialExerciseId?: string;
}

const ExerciseSelector: React.FC<ExerciseSelectorProps> = ({ allExercices, loading, onExerciseChange, initialExerciseId }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedExercise, setSelectedExercise] = useState<string>(initialExerciseId || '');

  const getExerciceName = (id: string) => {
    const exercice = allExercices.find(ex => ex.id === id);
    return exercice?.name || '';
  }

  useEffect(() => {
    if (initialExerciseId) {
      setSelectedExercise(initialExerciseId);
    }
  }, [initialExerciseId]);
  
  const handleExerciseChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value;
    setSelectedExercise(id);
    onExerciseChange(id, getExerciceName(id));
  };
  
  const filteredExercices = useMemo(() => {
    return allExercices
      .filter(ex => {
        if (selectedCategory && ex.category !== 'custom') {
          return ex.category === selectedCategory;
        }
        return true;
      })
      .filter(ex => {
        return ex.name.toLowerCase().includes(searchQuery.toLowerCase());
      });
  }, [allExercices, selectedCategory, searchQuery]);

  return (
    <div className="space-y-2">
      <select
        value={selectedCategory}
        onChange={(e) => setSelectedCategory(e.target.value)}
        className="w-full px-2 py-1 text-sm border rounded"
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
        className="w-full px-2 py-1 text-sm border rounded"
      />
      
      <select
        value={selectedExercise}
        onChange={handleExerciseChange}
        disabled={loading}
        className="w-full px-2 py-1 text-sm border rounded disabled:opacity-50"
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