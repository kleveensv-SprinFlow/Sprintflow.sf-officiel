import React, { useState, useMemo, useEffect, useRef } from 'react';
import { X, Plus, Trash2, FileText, ListChecks } from 'lucide-react';
import { Workout } from '../../types';
import { CourseBlockForm, CourseBlockData } from './CourseBlockForm';
import { NumberSelector } from '../NumberSelector';
import ExerciseSelector from './Exercise';
import { useExercices } from '../../hooks/useExercices';
import { supabase } from '../../lib/supabase';
import { useWorkoutTemplates } from '../../hooks/useWorkoutTemplates';
import useAuth from '../../hooks/useAuth';

export type WorkoutBlock = {
  id: string;
  type: 'course' | 'muscu' | 'texte';
  data: any;
};

interface NewWorkoutFormProps {
  onSave: (payload: {
    title: string;
    blocs: Omit<WorkoutBlock, 'id'>[];
    type: 'guidé' | 'manuscrit';
    notes?: string;
  }) => Promise<void>;
  onCancel: () => void;
  initialData?: {
    title: string;
    blocs: Omit<WorkoutBlock, 'id'>[];
    type?: 'guidé' | 'manuscrit';
    notes?: string;
  };
}

export function NewWorkoutForm({ onSave, onCancel, initialData }: NewWorkoutFormProps) {
  const { profile } = useAuth();
  const { createTemplate } = useWorkoutTemplates();

  const [title, setTitle] = useState(initialData?.title || `Nouvelle séance du ${new Date().toLocaleDateString('fr-FR')}`);
  const [blocs, setBlocs] = useState<WorkoutBlock[]>(
    initialData?.blocs.map(b => ({ ...b, id: `bloc_${Math.random()}` })) || []
  );

  const [workoutType, setWorkoutType] = useState<'guidé' | 'manuscrit'>(initialData?.type || 'guidé');
  const [notes, setNotes] = useState(initialData?.notes || '');

  const [saveAsTemplate, setSaveAsTemplate] = useState(false);
  const [templateName, setTemplateName] = useState('');

  const [saving, setSaving] = useState(false);
  const lastBlockRef = useRef<HTMLDivElement>(null);

  const { exercices: refExercices, loading: refLoading } = useExercices();
  const [customExercices, setCustomExercices] = useState<{ id: string, name: string }[]>([]);
  const [customLoading, setCustomLoading] = useState(true);

  useEffect(() => {
    const fetchCustom = async () => {
      const { data } = await supabase.from('exercices_personnalises').select('id, nom');
      if (data) setCustomExercices(data.map(ex => ({ id: ex.id, name: ex.nom })));
      setCustomLoading(false);
    };
    fetchCustom();
  }, []);

  const allExercices = useMemo(() => [
    ...refExercices.map(ex => ({ id: ex.id, name: ex.nom, category: ex.categorie })),
    ...customExercices.map(ex => ({ id: ex.id, name: ex.name, category: 'custom' })),
  ], [refExercices, customExercices]);


  useEffect(() => {
    lastBlockRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [blocs.length]);

  const generateId = () => `bloc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  const addBlock = (type: 'course' | 'muscu') => {
    let newBlockData: any;
    if (type === 'course') {
      newBlockData = { series: 1, reps: 1, distance: 100, restBetweenReps: '60', restBetweenSeries: '180', chronos: [[]] };
    } else {
      newBlockData = { exercice_id: '', exercice_nom: '', series: 3, reps: 10, poids: 0 };
    }
    setBlocs(prev => [...prev, { id: generateId(), type, data: newBlockData }]);
  };

  const updateBlock = (id: string, newData: any) => {
    setBlocs(prev => prev.map(b => (b.id === id ? { ...b, data: newData } : b)));
  };

  const removeBlock = (id: string) => {
    setBlocs(prev => prev.filter(b => b.id !== id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      alert('Le titre de la séance est obligatoire.');
      return;
    }
    if (workoutType === 'manuscrit' && !notes.trim()) {
      alert('Les notes sont obligatoires pour une séance manuscrite.');
      return;
    }
    setSaving(true);

    const blocsToSave = workoutType === 'guidé' ? blocs.map(({ id, ...rest }) => rest) : [];
    const notesToSave = workoutType === 'manuscrit' ? notes : undefined;

    try {
      if (saveAsTemplate && profile?.role === 'coach' && workoutType === 'guidé') {
        if (!templateName.trim()) {
          alert('Veuillez donner un nom à votre modèle.');
          setSaving(false);
          return;
        }
        await createTemplate(templateName, { blocs: blocsToSave });
      }

      await onSave({
        title,
        blocs: blocsToSave,
        type: workoutType,
        notes: notesToSave,
      });

    } catch (error: any) {
      alert(`❌ Erreur lors de la sauvegarde: ${error?.message || 'Erreur inconnue'}`);
    } finally {
      setSaving(false);
    }
  };

  const renderBlock = (bloc: WorkoutBlock) => {
    if (bloc.type === 'course') {
      return (
        <CourseBlockForm
          key={bloc.id}
          block={bloc.data}
          onChange={(newData) => updateBlock(bloc.id, newData)}
          onRemove={() => removeBlock(bloc.id)}
        />
      );
    }
    if (bloc.type === 'muscu') {
      return (
        <motion.div 
          key={bloc.id} 
          className="bg-white/10 dark:bg-black/10 backdrop-blur-md dark:backdrop-blur-sm rounded-2xl border border-white/20 shadow-lg p-3 space-y-2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
            <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-800 dark:text-gray-200">Bloc Musculation</span>
                <button type="button" onClick={() => removeBlock(bloc.id)} className="p-1 text-red-500 hover:text-red-700 rounded hover:bg-red-500/10">
                    <Trash2 className="w-4 h-4" />
                </button>
            </div>
            <div>
                <label className="block text-xs mb-1 text-gray-600 dark:text-gray-400">Exercice *</label>
                <ExerciseSelector
                    allExercices={allExercices}
                    loading={refLoading || customLoading}
                    onExerciseChange={(id, name) => updateBlock(bloc.id, { ...bloc.data, exercice_id: id, exercice_nom: name })}
                    initialExerciseId={bloc.data.exercice_id}
                />
            </div>
            <div className="flex flex-wrap gap-2">
                <NumberSelector label="Séries *" value={bloc.data.series} onChange={(val) => updateBlock(bloc.id, { ...bloc.data, series: val })} min={1} max={20} />
                <NumberSelector label="Reps *" value={bloc.data.reps} onChange={(val) => updateBlock(bloc.id, { ...bloc.data, reps: val })} min={1} max={50} />
                <div>
                    <label className="block text-xs mb-1 text-gray-600 dark:text-gray-400">Poids (kg)</label>
                    <input type="number" step="0.5" value={bloc.data.poids} onChange={(e) => updateBlock(bloc.id, { ...bloc.data, poids: e.target.value === '' ? '' : parseFloat(e.target.value)})} className="w-full h-10 px-2 py-1 text-sm bg-white/20 dark:bg-black/20 border border-white/30 rounded" placeholder="--" />
                </div>
            </div>
        </motion.div>
      );
    }
    return null;
  };

  return (
    <div className="fixed inset-0 bg-transparent z-50 overflow-y-auto">
      <div className="sticky top-0 bg-white/10 dark:bg-black/10 backdrop-blur-md dark:backdrop-blur-sm border-b border-white/20 z-10">
        <div className="p-4 flex items-center justify-between max-w-3xl mx-auto">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white text-shadow-light dark:text-shadow-dark">Éditeur de séance</h2>
          <button onClick={onCancel} className="p-2 hover:bg-white/20 dark:hover:bg-black/20 rounded-full">
            <X className="w-6 h-6" />
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-4 space-y-4 max-w-3xl mx-auto pb-40">
        <div className="bg-white/10 dark:bg-black/10 backdrop-blur-md dark:backdrop-blur-sm rounded-2xl border border-white/20 shadow-lg p-4">
          <label htmlFor="workout-title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Titre de la séance *
          </label>
          <input
            id="workout-title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
            required
          />
        </div>

        <div className="bg-white/10 dark:bg-black/10 backdrop-blur-md dark:backdrop-blur-sm rounded-2xl border border-white/20 shadow-lg p-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Type de séance
          </label>
          <div className="flex rounded-lg">
            <button
              type="button"
              onClick={() => setWorkoutType('guidé')}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium rounded-l-lg transition-colors ${
                workoutType === 'guidé'
                  ? 'bg-primary-500/80 text-white'
                  : 'bg-white/20 dark:bg-black/20 text-gray-800 dark:text-gray-300 hover:bg-white/30 dark:hover:bg-black/30'
              }`}
            >
              <ListChecks className="w-5 h-5" />
              Guidée
            </button>
            <button
              type="button"
              onClick={() => setWorkoutType('manuscrit')}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium rounded-r-lg transition-colors ${
                workoutType === 'manuscrit'
                  ? 'bg-primary-500/80 text-white'
                  : 'bg-white/20 dark:bg-black/20 text-gray-800 dark:text-gray-300 hover:bg-white/30 dark:hover:bg-black/30'
              }`}
            >
              <FileText className="w-5 h-5" />
              Manuscrite
            </button>
          </div>
        </div>

        {workoutType === 'guidé' ? (
          <>
            {blocs.map(renderBlock)}
            <div ref={lastBlockRef}></div>

            <div className="bg-white/10 dark:bg-black/10 backdrop-blur-md dark:backdrop-blur-sm rounded-2xl border border-white/20 shadow-lg p-4 flex flex-wrap gap-4 justify-center">
                <button type="button" onClick={() => addBlock('course')} className="flex items-center gap-2 px-4 py-2 text-sm bg-blue-500/80 text-white rounded-lg hover:bg-blue-500/90">
                    <Plus className="w-4 h-4" /> Course
                </button>
                <button type="button" onClick={() => addBlock('muscu')} className="flex items-center gap-2 px-4 py-2 text-sm bg-green-500/80 text-white rounded-lg hover:bg-green-500/90">
                    <Plus className="w-4 h-4" /> Musculation
                </button>
            </div>
          </>
        ) : (
          <div className="bg-white/10 dark:bg-black/10 backdrop-blur-md dark:backdrop-blur-sm rounded-2xl border border-white/20 shadow-lg p-4">
            <label htmlFor="workout-notes" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Contenu de la séance
            </label>
            <textarea
              id="workout-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-4 py-2 bg-white/20 dark:bg-black/20 border border-white/30 rounded-lg text-gray-800 dark:text-white min-h-[200px]"
              placeholder="Décrivez ici la séance complète..."
              required={workoutType === 'manuscrit'}
            />
          </div>
        )}

        {profile?.role === 'coach' && workoutType === 'guidé' && (
          <div className="bg-white/10 dark:bg-black/10 backdrop-blur-md dark:backdrop-blur-sm rounded-2xl border border-white/20 shadow-lg p-4 space-y-3">
            <h3 className="font-semibold text-gray-800 dark:text-white">Options</h3>
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="saveAsTemplate"
                checked={saveAsTemplate}
                onChange={(e) => setSaveAsTemplate(e.target.checked)}
                className="h-5 w-5 rounded text-primary-600"
              />
              <label htmlFor="saveAsTemplate">Enregistrer comme modèle</label>
            </div>
            {saveAsTemplate && (
              <div>
                <label htmlFor="templateName" className="block text-sm font-medium mb-1">Nom du modèle *</label>
                <input
                  id="templateName"
                  type="text"
                  value={templateName}
                  onChange={(e) => setTemplateName(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700"
                  placeholder="Ex: Vitesse Max Lundi"
                  required={saveAsTemplate}
                />
              </div>
            )}
          </div>
        )}

        <div className="fixed bottom-0 left-0 right-0 bg-white/10 dark:bg-black/10 backdrop-blur-md dark:backdrop-blur-sm border-t border-white/20 p-4">
            <div className="max-w-3xl mx-auto flex gap-3">
                <button type="button" onClick={onCancel} className="flex-1 px-6 py-3 bg-white/20 dark:bg-black/20 text-gray-800 dark:text-white font-semibold rounded-lg shadow-lg hover:bg-white/30 dark:hover:bg-black/30 transition-all transform hover:scale-105 border border-white/30" disabled={saving}>
                    Annuler
                </button>
                <button type="submit" className="btn-primary flex-1 flex items-center justify-center" disabled={saving}>
                    {saving ? 'Enregistrement...' : 'Sauvegarder'}
                </button>
            </div>
        </div>
      </form>
    </div>
  );
}
