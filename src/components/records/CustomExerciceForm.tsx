import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useExercices, ExerciceReference } from '../../hooks/useExercices';

interface CustomExerciceFormProps {
  onSave: () => void;
  onCancel: () => void;
}

export const CustomExerciceForm: React.FC<CustomExerciceFormProps> = ({ onSave, onCancel }) => {
  const [nom, setNom] = useState('');
  const [qualiteCible, setQualiteCible] = useState('Force Maximale');
  const [exerciceReferenceId, setExerciceReferenceId] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  
  const { exercices, loading: loadingExercices } = useExercices();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nom || !qualiteCible || !exerciceReferenceId) {
      setError('Veuillez remplir tous les champs.');
      return;
    }
    setLoadingSubmit(true);
    setError(null);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        setError('Vous devez être connecté pour créer un exercice.');
        setLoadingSubmit(false);
        return;
    }

    try {
      const { error: insertError } = await supabase.from('exercices_personnalises').insert({
        nom,
        qualite_cible: qualiteCible,
        exercice_reference_id: exerciceReferenceId,
        athlete_id: user.id,
      });

      if (insertError) throw insertError;
      
      onSave();

    } catch (err) {
      console.error("Error creating custom exercice:", err);
      setError((err as Error).message);
    } finally {
      setLoadingSubmit(false);
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg border border-gray-200 dark:border-gray-700">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          Créer un exercice personnalisé
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Nom de l'exercice
            </label>
            <input
              type="text"
              value={nom}
              onChange={(e) => setNom(e.target.value)}
              className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white"
              placeholder="Ex: Squat Zercher"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Qualité Cible
            </label>
            <select
              value={qualiteCible}
              onChange={(e) => setQualiteCible(e.target.value)}
              className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white"
            >
              <option>Force Maximale</option>
              <option>Explosivité</option>
              {/* Add other qualities if needed in the future */}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Exercice de Référence (pour le barème)
            </label>
            <select
              value={exerciceReferenceId}
              onChange={(e) => setExerciceReferenceId(e.target.value)}
              className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white"
              required
              disabled={loadingExercices}
            >
              <option value="">Sélectionner un exercice de référence</option>
              {exercices.map((ex) => (
                <option key={ex.id} value={ex.id}>{ex.nom_fr}</option>
              ))}
            </select>
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <div className="flex space-x-3 pt-6">
            <button
              type="submit"
              disabled={loadingSubmit}
              className="flex-1 bg-accent-500 hover:bg-accent-600 px-4 py-3 rounded-lg text-white font-medium transition-all duration-200"
            >
              {loadingSubmit ? 'Création...' : 'Créer l\'exercice'}
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-3 border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-gray-700 dark:text-gray-300"
            >
              Annuler
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};