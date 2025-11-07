import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '../../lib/supabase';
import { EXERCISE_CATEGORIES } from '../../data/categories';
import { X } from 'lucide-react';
import useAuth from '../../hooks/useAuth';

interface CustomExerciceFormProps {
  onSave: () => void;
  onCancel: () => void;
}

export const CustomExerciceForm: React.FC<CustomExerciceFormProps> = ({ onSave, onCancel }) => {
  const { user } = useAuth();
  const [nom, setNom] = useState('');
  const [categorie, setCategorie] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nom || !categorie || !user) {
      setError('Veuillez remplir tous les champs.');
      return;
    }

    setIsSaving(true);
    setError(null);

    const { error: insertError } = await supabase
      .from('exercices_personnalises')
      .insert({ nom, categorie, creator_id: user.id });

    setIsSaving(false);

    if (insertError) {
      console.error("Erreur lors de la création de l'exercice:", insertError);
      setError(insertError.message);
    } else {
      onSave();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md"
      onClick={onCancel}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md m-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Créer un exercice</h3>
                <button onClick={onCancel} className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">
                    <X size={20} />
                </button>
            </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="nom" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Nom de l'exercice
              </label>
              <input
                id="nom"
                type="text"
                value={nom}
                onChange={(e) => setNom(e.target.value)}
                className="w-full h-11 px-4 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg"
                placeholder="Ex: Squat"
                required
              />
            </div>

            <div>
              <label htmlFor="categorie" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Catégorie
              </label>
              <select
                id="categorie"
                value={categorie}
                onChange={(e) => setCategorie(e.target.value)}
                className="w-full h-11 px-4 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg"
                required
              >
                <option value="" disabled>Sélectionner une catégorie</option>
                {EXERCISE_CATEGORIES.map(cat => (
                  <option key={cat.key} value={cat.key}>{cat.label}</option>
                ))}
              </select>
            </div>
            
            {error && <p className="text-sm text-red-500">{error}</p>}

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onCancel}
                className="w-full px-6 py-3 border-2 rounded-xl"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="w-full bg-blue-600 text-white px-6 py-3 rounded-xl disabled:opacity-50"
              >
                {isSaving ? 'Création...' : 'Créer'}
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </motion.div>
  );
};