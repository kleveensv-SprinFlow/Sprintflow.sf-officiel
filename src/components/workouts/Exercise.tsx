import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';

interface ExerciseSelectorProps {
  onExerciseChange: (exercise: string) => void;
  initialExerciseName?: string;
}

const ExerciseSelector: React.FC<ExerciseSelectorProps> = ({ onExerciseChange, initialExerciseName }) => {
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [exercises, setExercises] = useState<string[]>([]);
  const [selectedExercise, setSelectedExercise] = useState<string>(initialExerciseName || '');

  useEffect(() => {
    const initialize = async () => {
      const { data: allExercises, error: fetchError } = await supabase
        .from('exercices_reference')
        .select('nom, categorie');

      if (fetchError) {
        console.error('Error fetching exercises:', fetchError);
        return;
      }

      const uniqueCategories = [...new Set(allExercises.map((item) => item.categorie))];
      setCategories(uniqueCategories);

      if (initialExerciseName) {
        const initial = allExercises.find(e => e.nom === initialExerciseName);
        if (initial) {
          setSelectedCategory(initial.categorie);
        }
      }
    };

    initialize();
  }, [initialExerciseName]);

  useEffect(() => {
    if (selectedCategory) {
      const fetchExercises = async () => {
        const { data, error } = await supabase
          .from('exercices_reference')
          .select('nom')
          .eq('categorie', selectedCategory)
          .order('nom');

        if (error) {
          console.error('Error fetching exercises:', error);
        } else {
          setExercises(data.map((item) => item.nom));
        }
      };

      fetchExercises();
    } else {
        setExercises([]);
    }
  }, [selectedCategory]);

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newCategory = e.target.value;
    setSelectedCategory(newCategory);
    setSelectedExercise('');
    onExerciseChange('');
  };

  const handleExerciseChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const exercise = e.target.value;
    setSelectedExercise(exercise);
    onExerciseChange(exercise);
  };

  return (
    <div className="flex space-x-2">
      <div className="w-1/2">
        <label htmlFor="category-select" className="sr-only">
          Category
        </label>
        <select
          id="category-select"
          value={selectedCategory}
          onChange={handleCategoryChange}
          className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded"
        >
          <option value="">Sélectionner catégorie...</option>
          {categories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
      </div>
      <div className="w-1/2">
        <label htmlFor="exercise-select" className="sr-only">
          Exercise
        </label>
        <select
          id="exercise-select"
          value={selectedExercise}
          onChange={handleExerciseChange}
          disabled={!selectedCategory || exercises.length === 0}
          className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded disabled:opacity-50"
        >
          <option value="">Sélectionner exercice...</option>
          {exercises.map((exercise) => (
            <option key={exercise} value={exercise}>
              {exercise}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default ExerciseSelector;