import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import { Workout, WorkoutMuscu } from '../../types';
import useAuth from '../../hooks/useAuth';
import { useExercices } from '../../hooks/useExercices';
import { CourseBlockForm, CourseBlockData } from './CourseBlockForm';
import { NumberSelector } from '../NumberSelector';

interface NewWorkoutFormProps {
  editingWorkout?: Workout | null;
  onSave: (workout: Omit<Workout, 'id'>) => Promise<void>;
  onCancel: () => void;
}

export function NewWorkoutForm({ editingWorkout, onSave, onCancel }: NewWorkoutFormProps) {
  const { user } = useAuth();
  const { exercices } = useExercices();

  const [date, setDate] = useState(editingWorkout?.date || new Date().toISOString().split('T')[0]);
  const [tagSeance, setTagSeance] = useState<'vitesse_max' | 'lactique_piste' | 'lactique_cote' | 'aerobie' | 'musculation' | ''>(
    editingWorkout?.tag_seance || ''
  );

  const [courseBlocks, setCourseBlocks] = useState<CourseBlockData[]>(editingWorkout?.courses_json || []);
  const [muscu, setMuscu] = useState<WorkoutMuscu[]>(editingWorkout?.muscu_json || []);
  const [autresActivites, setAutresActivites] = useState(editingWorkout?.autres_activites || '');
  const [echelleEffort, setEchelleEffort] = useState<number | ''>(editingWorkout?.echelle_effort || '');
  const [notes, setNotes] = useState(editingWorkout?.notes || '');
  const [meteo, setMeteo] = useState(editingWorkout?.meteo || '');
  const [temperature, setTemperature] = useState<number | ''>(editingWorkout?.temperature || '');
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const generateId = () => `block_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  const addCourseBlock = () => {
    setCourseBlocks(prev => [
      {
        id: generateId(),
        series: 1,
        reps: 4,
        distance: 200, // Default distance
        restBetweenReps: '120', // in seconds
        restBetweenSeries: '300', // in seconds
        chronos: [Array(4).fill(null)]
      },
      ...prev,
    ]);
  };

  const updateCourseBlock = (id: string, newBlockData: CourseBlockData) => {
    setCourseBlocks(prev => prev.map(block => block.id === id ? newBlockData : block));
  };

  const removeCourseBlock = (id: string) => {
    setCourseBlocks(prev => prev.filter(block => block.id !== id));
  };

  const addMuscu = () => {
    setMuscu([
      { exercice_id: '', exercice_nom: '', series: '', reps: '', poids: '' },
      ...muscu
    ]);
  };

  const removeMuscu = (index: number) => {
    setMuscu(muscu.filter((_, i) => i !== index));
  };

  const updateMuscu = (index: number, field: keyof WorkoutMuscu, value: any) => {
    const newMuscu = [...muscu];
    newMuscu[index] = { ...newMuscu[index], [field]: value };
    setMuscu(newMuscu);
  };

  const selectExercice = (index: number, exerciceId: string) => {
    const exercice = exercices.find(e => e.id === exerciceId);
    if (exercice) {
      const newMuscu = [...muscu];
      newMuscu[index] = {
        ...newMuscu[index],
        exercice_id: exerciceId,
        exercice_nom: exercice.nom
      };
      setMuscu(newMuscu);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!tagSeance) {
      alert('Le type de séance est obligatoire');
      return;
    }

    setSaving(true);

    try {
      const workout: Omit<Workout, 'id'> = {
        user_id: user?.id,
        date,
        title: `Séance ${tagSeance} - ${date}`,
        tag_seance: tagSeance,
        courses_json: courseBlocks,
        muscu_json: muscu,
        sauts_json: [],
        lancers_json: [],
        autres_activites: autresActivites || undefined,
        echelle_effort: echelleEffort === '' ? undefined : echelleEffort,
        notes: notes || undefined,
        meteo: meteo || undefined,
        temperature: temperature === '' ? undefined : temperature,
        duration_minutes: 60, // Placeholder
        runs: [], // Deprecated
        jumps: [], // Deprecated
        throws: [], // Deprecated
        stairs: [], // Deprecated
        exercises: [] // Deprecated
      };

      await onSave(workout);
    } catch (error: any) {
      alert(`❌ Erreur lors de la sauvegarde: ${error?.message || error}`);
    } finally {
      setSaving(false);
    }
  };

  const filteredExercices = searchTerm
    ? exercices.filter(e =>
        e.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.categorie.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : exercices;

  return (
    <div className="fixed inset-0 bg-white dark:bg-gray-900 z-50 overflow-y-auto">
      <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 z-10">
        <div className="p-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            {editingWorkout ? 'Modifier la séance' : 'Nouvelle séance'}
          </h2>
          <button onClick={onCancel} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
            <X className="w-6 h-6" />
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-4 space-y-6 pb-40">
        {/* General Info Section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 space-y-4">
          <h3 className="font-semibold text-gray-900 dark:text-white">Informations générales</h3>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Date de la séance *
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg focus:outline-none focus:border-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Type de séance (Tag/Intention) *
            </label>
            <select
              value={tagSeance}
              onChange={(e) => setTagSeance(e.target.value as any)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              required
            >
              <option value="">Sélectionner un type</option>
              <option value="vitesse_max">Vitesse Max / Explosivité</option>
              <option value="lactique_piste">Lactique Piste</option>
              <option value="lactique_cote">Lactique Côte</option>
              <option value="aerobie">Aérobie</option>
              <option value="musculation">Musculation / Haltérophilie</option>
            </select>
          </div>
        </div>

        {/* Running Section */}
        {tagSeance && tagSeance !== 'musculation' && (
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-900 dark:text-white">Courses / Piste</h3>
              <button
                type="button"
                onClick={addCourseBlock}
                className="flex items-center gap-2 px-3 py-1 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Plus className="w-4 h-4" />
                Ajouter un bloc
              </button>
            </div>

            {courseBlocks.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-4">Aucun bloc de course ajouté</p>
            ) : (
              <div className="space-y-4">
                {courseBlocks.map((block) => (
                  <CourseBlockForm
                    key={block.id}
                    block={block}
                    onChange={updateCourseBlock}
                    onRemove={removeCourseBlock}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Strength Section */}
        {tagSeance && (tagSeance === 'musculation' || tagSeance === 'vitesse_max') && (
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 space-y-4">
                <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-gray-900 dark:text-white">Musculation / Force</h3>
                    <button
                    type="button"
                    onClick={addMuscu}
                    className="flex items-center gap-2 px-3 py-1 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700"
                    >
                    <Plus className="w-4 h-4" />
                    Ajouter un exercice
                    </button>
                </div>

                {muscu.length === 0 ? (
                    <p className="text-sm text-gray-500 text-center py-4">Aucun exercice ajouté</p>
                ) : (
                    <div className="space-y-3">
                    {muscu.map((ex, index) => (
                        <div key={index} className="border border-gray-200 dark:border-gray-600 rounded-lg p-3 space-y-2">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Exercice {index + 1}</span>
                            <button
                            type="button"
                            onClick={() => removeMuscu(index)}
                            className="p-1 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                            >
                            <Trash2 className="w-4 h-4" />
                            </button>
                        </div>

                        <div>
                            <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Exercice *</label>
                            <select
                            value={ex.exercice_id}
                            onChange={(e) => selectExercice(index, e.target.value)}
                            className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded"
                            required
                            >
                            <option value="">Sélectionner...</option>
                            {filteredExercices.map(exercice => (
                                <option key={exercice.id} value={exercice.id}>
                                {exercice.nom} ({exercice.categorie})
                                </option>
                            ))}
                            </select>
                        </div>

                        <div className="grid grid-cols-3 gap-2">
                            <NumberSelector
                                label="Séries *"
                                value={ex.series}
                                onChange={(val) => updateMuscu(index, 'series', val)}
                                min={1}
                                max={20}
                            />
                            <NumberSelector
                                label="Reps *"
                                value={ex.reps}
                                onChange={(val) => updateMuscu(index, 'reps', val)}
                                min={1}
                                max={50}
                            />
                            <div>
                                <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Poids (kg)</label>
                                <input
                                    type="number"
                                    step="0.5"
                                    value={ex.poids}
                                    onChange={(e) => updateMuscu(index, 'poids', e.target.value === '' ? '' : parseFloat(e.target.value))}
                                    className="w-full h-10 px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded"
                                    placeholder="--"
                                />
                            </div>
                        </div>
                        </div>
                    ))}
                    </div>
                )}
            </div>
        )}

        {/* ... (Keep Feedback and Conditions sections as they are) ... */}

        <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4 flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 px-6 py-3 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 font-medium"
            disabled={saving}
          >
            Annuler
          </button>
          <button
            type="submit"
            className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium shadow-lg disabled:opacity-50"
            disabled={saving}
          >
            {saving ? 'Enregistrement...' : 'Sauvegarder la séance'}
          </button>
        </div>
      </form>
    </div>
  );
}