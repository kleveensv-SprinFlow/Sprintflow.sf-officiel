import React, { useState, useMemo, useEffect } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import { Workout, WorkoutMuscu } from '../../types';
import useAuth from '../../hooks/useAuth';
import { CourseBlockForm, CourseBlockData } from './CourseBlockForm';
import { NumberSelector } from '../NumberSelector';
import ExerciseSelector from './Exercise';
import { useExercices } from '../../hooks/useExercices';
import { supabase } from '../../lib/supabase';

interface NewWorkoutFormProps {
  editingWorkout?: Workout | null;
  onSave: (workout: Omit<Workout, 'id'>) => Promise<void>;
  onCancel: () => void;
}

export function NewWorkoutForm({ editingWorkout, onSave, onCancel }: NewWorkoutFormProps) {
  const { user } = useAuth();
  
  // Data loading is now centralized here
  const { exercices: refExercices, loading: refLoading } = useExercices();
  const [customExercices, setCustomExercices] = useState<{ id: string, name: string }[]>([]);
  const [customLoading, setCustomLoading] = useState(true);

  useEffect(() => {
    const fetchCustom = async () => {
      const { data, error } = await supabase.from('exercices_personnalises').select('id, nom');
      if (!error) setCustomExercices(data.map(ex => ({ id: ex.id, name: ex.nom })));
      setCustomLoading(false);
    };
    fetchCustom();
  }, []);
  
  const allExercices = useMemo(() => {
    const formattedRef = refExercices.map(ex => ({ id: ex.id, name: ex.nom, category: ex.categorie }));
    const formattedCustom = customExercices.map(ex => ({ id: ex.id, name: ex.name, category: 'custom' }));
    return [...formattedRef, ...formattedCustom];
  }, [refExercices, customExercices]);


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

  const generateId = () => `block_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  const addCourseBlock = () => {
    setCourseBlocks(prev => [
      {
        id: generateId(),
        series: 1,
        reps: 4,
        distance: 200,
        restBetweenReps: '120',
        restBetweenSeries: '300',
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
      { exercice_id: '', exercice_nom: '', series: 1, reps: 1, poids: 0 },
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

  const handleExerciseChange = (muscuIndex: number, exerciseId: string, exerciseName: string) => {
    const newMuscu = [...muscu];
    newMuscu[muscuIndex] = { 
      ...newMuscu[muscuIndex], 
      exercice_id: exerciseId, 
      exercice_nom: exerciseName 
    };
    setMuscu(newMuscu);
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
        duration_minutes: 60,
        runs: [],
        jumps: [],
        throws: [],
        stairs: [],
        exercises: []
      };
      await onSave(workout);
    } catch (error: any) {
      alert(`❌ Erreur lors de la sauvegarde: ${error?.message || error}`);
    } finally {
      setSaving(false);
    }
  };

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
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 space-y-4">
          <h3 className="font-semibold text-gray-900 dark:text-white">Informations générales</h3>
          <div>
            <label htmlFor="date-seance" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Date de la séance *
            </label>
            <input
              id="date-seance"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg"
              required
            />
          </div>
          <div>
            <label htmlFor="tag-seance" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Type de séance (Tag/Intention) *
            </label>
            <select
              id="tag-seance"
              value={tagSeance}
              onChange={(e) => setTagSeance(e.target.value as any)}
              className="w-full px-4 py-2 border rounded-lg"
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

        {tagSeance && tagSeance !== 'musculation' && (
          <div className="bg-white dark:bg-gray-800 rounded-lg border p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Courses / Piste</h3>
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
              <p className="text-sm text-gray-500 text-center py-4">Aucun bloc de course</p>
            ) : (
              <div className="space-y-4">
                {courseBlocks.map((block) => (
                  <CourseBlockForm key={block.id} block={block} onChange={updateCourseBlock} onRemove={removeCourseBlock} />
                ))}
              </div>
            )}
          </div>
        )}

        {tagSeance && (tagSeance === 'musculation' || tagSeance === 'vitesse_max') && (
            <div className="bg-white dark:bg-gray-800 rounded-lg border p-4 space-y-4">
                <div className="flex items-center justify-between">
                    <h3 className="font-semibold">Musculation / Force</h3>
                    <button type="button" onClick={addMuscu} className="flex items-center gap-2 px-3 py-1 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700">
                        <Plus className="w-4 h-4" />
                        Ajouter un exercice
                    </button>
                </div>
                {muscu.length === 0 ? (
                    <p className="text-sm text-gray-500 text-center py-4">Aucun exercice</p>
                ) : (
                    <div className="space-y-3">
                    {muscu.map((ex, index) => (
                        <div key={index} className="border rounded-lg p-3 space-y-2">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium">Exercice {index + 1}</span>
                                <button type="button" onClick={() => removeMuscu(index)} className="p-1 text-red-600 rounded">
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                            <div>
                                <label className="block text-xs mb-1">Exercice *</label>
                                <ExerciseSelector 
                                    allExercices={allExercices}
                                    loading={refLoading || customLoading}
                                    onExerciseChange={(id, name) => handleExerciseChange(index, id, name)}
                                    initialExerciseId={ex.exercice_id}
                                />
                            </div>
                            <div className="flex flex-wrap gap-2">
                                <NumberSelector label="Séries *" value={ex.series} onChange={(val) => updateMuscu(index, 'series', val)} min={1} max={20} />
                                <NumberSelector label="Reps *" value={ex.reps} onChange={(val) => updateMuscu(index, 'reps', val)} min={1} max={50} />
                                <div>
                                    <label className="block text-xs mb-1">Poids (kg)</label>
                                    <input type="number" step="0.5" value={ex.poids} onChange={(e) => updateMuscu(index, 'poids', e.target.value === '' ? '' : parseFloat(e.target.value))} className="w-full h-10 px-2 py-1 text-sm border rounded" placeholder="--" />
                                </div>
                            </div>
                        </div>
                    ))}
                    </div>
                )}
            </div>
        )}

        <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t p-4 flex gap-3">
          <button type="button" onClick={onCancel} className="flex-1 px-6 py-3 border-2 rounded-lg" disabled={saving}>
            Annuler
          </button>
          <button type="submit" className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg" disabled={saving}>
            {saving ? 'Enregistrement...' : 'Sauvegarder la séance'}
          </button>
        </div>
      </form>
    </div>
  );
}