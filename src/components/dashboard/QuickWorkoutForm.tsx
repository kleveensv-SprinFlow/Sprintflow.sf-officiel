import React, { useState } from 'react';
import { X, Save } from 'lucide-react';
import { WorkoutBuilder, WorkoutBlock } from '../workouts/WorkoutBuilder';

interface QuickWorkoutFormProps {
  onSave: (payload: {
    title: string;
    type: 'guidé' | 'manuscrit';
    notes?: string;
    blocs: WorkoutBlock[];
  }) => Promise<void>;
  onCancel: () => void;
  initialData?: {
    id?: string;
    title: string;
    blocs: WorkoutBlock[];
    type?: 'guidé' | 'manuscrit';
    notes?: string;
  };
}

export const QuickWorkoutForm: React.FC<QuickWorkoutFormProps> = ({ onSave, onCancel, initialData }) => {
  const [title, setTitle] = useState(initialData?.title || `Nouvelle séance du ${new Date().toLocaleDateString('fr-FR')}`);
  const [blocks, setBlocks] = useState<WorkoutBlock[]>(initialData?.blocs || []);
  const [workoutType, setWorkoutType] = useState<'guidé' | 'manuscrit'>(initialData?.type || 'guidé');
  const [notes, setNotes] = useState(initialData?.notes || '');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      alert('Le titre est requis');
      return;
    }

    if (workoutType === 'guidé' && blocks.length === 0) {
      alert('Veuillez ajouter au moins un bloc pour une séance guidée');
      return;
    }

    if (workoutType === 'manuscrit' && !notes.trim()) {
      alert('Veuillez ajouter des notes pour une séance manuscrite');
      return;
    }

    setSaving(true);
    try {
      await onSave({
        title,
        type: workoutType,
        notes,
        blocs: blocks,
      });
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      alert('Erreur lors de la sauvegarde de la séance');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {initialData?.id ? 'Modifier la séance' : 'Nouvelle séance'}
          </h2>
          <button
            onClick={onCancel}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Titre de la séance *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Ex: Sprint + Force, Récupération active"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Type de séance
            </label>
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => setWorkoutType('guidé')}
                className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all ${
                  workoutType === 'guidé'
                    ? 'bg-primary-500 text-white shadow-lg'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                Guidée (blocs)
              </button>
              <button
                type="button"
                onClick={() => setWorkoutType('manuscrit')}
                className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all ${
                  workoutType === 'manuscrit'
                    ? 'bg-primary-500 text-white shadow-lg'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                Manuscrite (texte libre)
              </button>
            </div>
          </div>

          {workoutType === 'guidé' ? (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Contenu de la séance *
              </label>
              <WorkoutBuilder blocks={blocks} onChange={setBlocks} />
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Notes / Description *
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={10}
                className="w-full px-4 py-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                placeholder="Décrivez la séance en texte libre..."
                required
              />
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 bg-primary-500 hover:bg-primary-600 disabled:opacity-50 px-6 py-3 rounded-xl text-white font-medium transition-all duration-200 flex items-center justify-center space-x-2 shadow-lg"
            >
              <Save className="h-5 w-5" />
              <span>{saving ? 'Enregistrement...' : initialData?.id ? 'Mettre à jour' : 'Enregistrer'}</span>
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-3 border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl text-gray-700 dark:text-gray-300 transition-colors"
            >
              Annuler
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
