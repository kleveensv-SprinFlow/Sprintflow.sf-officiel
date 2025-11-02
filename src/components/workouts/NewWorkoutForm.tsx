import React, { useState, useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Trash2, FileText, ListChecks, ChevronUp, ChevronDown, Dumbbell, Zap, Activity } from 'lucide-react';
import { Workout } from '../../types';
import { CourseBlockForm, CourseBlockData } from './CourseBlockForm';
import { NumberSelector } from '../NumberSelector';
import ExerciseSelector from './Exercise';
import { useExercices } from '../../hooks/useExercices';
import { supabase } from '../../lib/supabase';
import { useWorkoutTemplates } from '../../hooks/useWorkoutTemplates';
import useAuth from '../../hooks/useAuth';
import { WorkoutTypeSelector } from './WorkoutTypeSelector';
import { WorkoutType } from '../../hooks/useWorkoutTypes';

export type WorkoutBlock = {
  id: string;
  type: 'course' | 'muscu' | 'escalier' | 'texte';
  data: any;
  isEditing: boolean;
};

interface NewWorkoutFormProps {
  onSave: (payload: {
    title: string;
    blocs: Omit<WorkoutBlock, 'id' | 'isEditing'>[];
    type: 'guidé' | 'manuscrit';
    tag_seance: string;
    notes?: string;
  }) => Promise<void>;
  onCancel: () => void;
  initialData?: {
    title: string;
    blocs: Omit<WorkoutBlock, 'id' | 'isEditing'>[];
    type?: 'guidé' | 'manuscrit';
    notes?: string;
  };
}

export function NewWorkoutForm({ onSave, onCancel, initialData }: NewWorkoutFormProps) {
  const { profile } = useAuth();
  const { createTemplate } = useWorkoutTemplates();

  const [selectedWorkoutType, setSelectedWorkoutType] = useState<WorkoutType | null>(null);
  const [title, setTitle] = useState(initialData?.title || '');
  const [blocs, setBlocs] = useState<WorkoutBlock[]>(
    initialData?.blocs.map(b => {
      const blockId = `bloc_${Math.random()}`;
      return {
        ...b,
        id: blockId,
        isEditing: false, // Start collapsed
        data: b.type === 'course' ? { ...b.data, id: blockId } : b.data
      };
    }) || []
  );

  const [workoutType, setWorkoutType] = useState<'guidé' | 'manuscrit'>(initialData?.type || 'guidé');
  const [notes, setNotes] = useState(initialData?.notes || '');

  useEffect(() => {
    console.log('[NewWorkoutForm] workoutType:', workoutType);
    console.log('[NewWorkoutForm] initialData?.type:', initialData?.type);
  }, [workoutType, initialData]);

  const [saveAsTemplate, setSaveAsTemplate] = useState(false);
  const [templateName, setTemplateName] = useState('');
  const [isFabOpen, setIsFabOpen] = useState(false);

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

  const addBlock = (type: 'course' | 'muscu' | 'escalier') => {
    const newId = generateId();
    let newBlockData: any;

    const collapseAllBlocks = (b: WorkoutBlock) => ({ ...b, isEditing: false });

    if (type === 'course') {
      newBlockData = { id: newId, series: 1, reps: 1, distance: 200, restBetweenReps: '60', restBetweenSeries: '180', chronos: [[null]] };
    } else if (type === 'muscu') {
      newBlockData = { exercice_id: '', exercice_nom: '', series: 3, reps: 10, poids: 0 };
    } else if (type === 'escalier') {
      newBlockData = { exercice_id: '', exercice_nom: '', series: 1, marches: 100, poids: 0 };
    }
    setBlocs(prev => [...prev.map(collapseAllBlocks), { id: newId, type, data: newBlockData, isEditing: true }]);
  };

  const updateBlock = (id: string, newData: any) => {
    setBlocs(prev => prev.map(b => (b.id === id ? { ...b, data: newData } : b)));
  };

  const toggleBlockEditing = (id: string) => {
    setBlocs(prev => prev.map(b => (b.id === id ? { ...b, isEditing: !b.isEditing } : b)));
  };

  const removeBlock = (id: string) => {
    setBlocs(prev => prev.filter(b => b.id !== id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedWorkoutType) {
      alert('Veuillez sélectionner un type de séance.');
      return;
    }
    if (workoutType === 'manuscrit' && !notes.trim()) {
      alert('Les notes sont obligatoires pour une séance manuscrite.');
      return;
    }
    setSaving(true);

    const blocsToSave = workoutType === 'guidé' ? blocs.map(({ id, isEditing, ...rest }) => rest) : [];

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
        title: selectedWorkoutType!.name,
        blocs: blocsToSave,
        type: workoutType,
        tag_seance: selectedWorkoutType!.id,
        notes: notes,
      });

    } catch (error: any) {
      alert(`❌ Erreur lors de la sauvegarde: ${error?.message || 'Erreur inconnue'}`);
    } finally {
      setSaving(false);
    }
  };

  const renderBlockSummary = (bloc: WorkoutBlock) => {
    const Icon = bloc.type === 'course' ? Activity : bloc.type === 'muscu' ? Dumbbell : Zap;
    let summary = '';
    switch(bloc.type) {
      case 'course':
        summary = `${bloc.data.series}x${bloc.data.reps} ${bloc.data.distance}m`;
        break;
      case 'muscu':
        summary = `${bloc.data.series}x${bloc.data.reps} ${bloc.data.exercice_nom || 'N/A'}`;
        break;
      case 'escalier':
        summary = `${bloc.data.series}x ${bloc.data.marches} marches`;
        break;
    }
    return (
        <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-3">
                <Icon className="w-5 h-5 text-gray-500" />
                <span className="font-semibold">{summary}</span>
            </div>
            <div className="flex items-center gap-2">
                 <button type="button" onClick={(e) => {e.stopPropagation(); removeBlock(bloc.id);}} className="p-2 text-red-500 hover:bg-red-100 rounded-full">
                    <Trash2 className="w-4 h-4" />
                </button>
                {bloc.isEditing ? <ChevronUp /> : <ChevronDown />}
            </div>
        </div>
    );
  }

  const renderBlock = (bloc: WorkoutBlock) => {
    const FormComponent = () => {
        if (bloc.type === 'course') {
            return (
                <CourseBlockForm
                block={bloc.data}
                onChange={(newData) => updateBlock(bloc.id, newData)}
                onRemove={() => removeBlock(bloc.id)}
                />
            );
        }
        if (bloc.type === 'muscu') {
          return (
            <div className="border-t pt-4 mt-4 space-y-2">
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
                        <input type="number" step="0.5" value={bloc.data.poids} onChange={(e) => updateBlock(bloc.id, { ...bloc.data, poids: e.target.value === '' ? '' : parseFloat(e.target.value)})} className="w-full h-10 px-2 py-1 text-sm border rounded" placeholder="--" />
                    </div>
                </div>
                 <button type="button" onClick={() => toggleBlockEditing(bloc.id)} className="w-full mt-2 py-2 text-sm bg-primary-500 text-white rounded-lg">
                    OK
                </button>
            </div>
          );
        }
        if (bloc.type === 'escalier') {
          return (
             <div className="border-t pt-4 mt-4 space-y-2">
              <div>
                <label className="block text-xs mb-1 text-gray-600 dark:text-gray-400">Exercice *</label>
                <ExerciseSelector
                  allExercices={allExercices.filter(ex => ex.category === 'custom' || ex.category === undefined)}
                  loading={refLoading || customLoading}
                  onExerciseChange={(id, name) => updateBlock(bloc.id, { ...bloc.data, exercice_id: id, exercice_nom: name })}
                  initialExerciseId={bloc.data.exercice_id}
                />
              </div>
              <div className="flex flex-wrap gap-2">
                <NumberSelector label="Séries *" value={bloc.data.series} onChange={(val) => updateBlock(bloc.id, { ...bloc.data, series: val })} min={1} max={20} />
                <div>
                  <label className="block text-xs mb-1 text-gray-600 dark:text-gray-400">Marches</label>
                  <input type="number" step="1" value={bloc.data.marches} onChange={(e) => updateBlock(bloc.id, { ...bloc.data, marches: e.target.value === '' ? '' : parseInt(e.target.value)})} className="w-full h-10 px-2 py-1 text-sm border rounded" placeholder="--" />
                </div>
                <div>
                  <label className="block text-xs mb-1 text-gray-600 dark:text-gray-400">Poids (kg)</label>
                  <input type="number" step="0.5" value={bloc.data.poids} onChange={(e) => updateBlock(bloc.id, { ...bloc.data, poids: e.target.value === '' ? '' : parseFloat(e.target.value)})} className="w-full h-10 px-2 py-1 text-sm border rounded" placeholder="--" />
                </div>
              </div>
               <button type="button" onClick={() => toggleBlockEditing(bloc.id)} className="w-full mt-2 py-2 text-sm bg-primary-500 text-white rounded-lg">
                    OK
                </button>
            </div>
          );
        }
        return null;
    }

    return (
        <motion.div
            key={bloc.id}
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-white/20 rounded-xl shadow-lg p-4 cursor-pointer"
            onClick={() => !bloc.isEditing && toggleBlockEditing(bloc.id)}
        >
            {renderBlockSummary(bloc)}
            <AnimatePresence>
                {bloc.isEditing && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                    >
                        <FormComponent />
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
  };

  return (
    <div className="fixed inset-0 bg-gray-100 dark:bg-gray-900 z-50 overflow-y-auto">
      {isFabOpen && <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-[60]" onClick={() => setIsFabOpen(false)}></div>}

      {workoutType === 'guidé' && (
      <div className="fixed bottom-24 right-4 z-[70]">
        <AnimatePresence>
          {isFabOpen && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="flex flex-col items-center gap-3 mb-3"
            >
              <button onClick={() => { addBlock('course'); setIsFabOpen(false); }} className="w-14 h-14 rounded-full bg-blue-500 text-white flex items-center justify-center shadow-lg hover:scale-110 transition-transform"><Activity /></button>
              <button onClick={() => { addBlock('muscu'); setIsFabOpen(false); }} className="w-14 h-14 rounded-full bg-green-500 text-white flex items-center justify-center shadow-lg hover:scale-110 transition-transform"><Dumbbell /></button>
              <button onClick={() => { addBlock('escalier'); setIsFabOpen(false); }} className="w-14 h-14 rounded-full bg-yellow-500 text-white flex items-center justify-center shadow-lg hover:scale-110 transition-transform"><Zap /></button>
            </motion.div>
          )}
        </AnimatePresence>
        <motion.button
          onClick={() => setIsFabOpen(!isFabOpen)}
          className="w-16 h-16 rounded-full bg-primary-500 text-white flex items-center justify-center shadow-xl"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          animate={{ rotate: isFabOpen ? 45 : 0 }}
        >
          <Plus size={28} />
        </motion.button>
      </div>
      )}


      <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 z-10">
        <div className="p-4 flex items-center justify-between max-w-3xl mx-auto">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Éditeur de séance</h2>
          <button onClick={onCancel} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full">
            <X className="w-6 h-6" />
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-4 space-y-4 max-w-3xl mx-auto pb-40">
        <WorkoutTypeSelector
          selectedType={selectedWorkoutType}
          onSelectType={(type) => {
            setSelectedWorkoutType(type);
            setTitle(type.name);
          }}
        />

        <div className="bg-white dark:bg-gray-800 rounded-lg border p-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Type de séance
          </label>
          <div className="flex rounded-lg shadow-sm">
            <button
              type="button"
              onClick={() => setWorkoutType('guidé')}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium rounded-l-lg transition-colors ${
                workoutType === 'guidé'
                  ? 'bg-primary-500 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
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
                  ? 'bg-primary-500 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              <FileText className="w-5 h-5" />
              Manuscrite
            </button>
          </div>
        </div>

        {workoutType === 'guidé' && (
          <div className="space-y-4">
            <AnimatePresence>
              {blocs.map(renderBlock)}
            </AnimatePresence>
            <div ref={lastBlockRef}></div>
          </div>
        )}

        <div className="bg-white dark:bg-gray-800 rounded-lg border p-4">
            <label htmlFor="workout-notes" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {workoutType === 'manuscrit' ? 'Contenu de la séance' : 'Notes (optionnel)'}
            </label>
            <textarea
                id="workout-notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                style={{ minHeight: workoutType === 'manuscrit' ? '200px' : '100px' }}
                placeholder={workoutType === 'manuscrit' ? "Décrivez ici la séance complète..." : "Ajoutez des notes sur l'échauffement, la récupération, etc."}
                required={workoutType === 'manuscrit'}
            />
        </div>

        {profile?.role === 'coach' && workoutType === 'guidé' && (
          <div className="bg-white dark:bg-gray-800 rounded-lg border p-4 space-y-3">
            <h3 className="font-semibold">Options</h3>
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

        <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t p-4">
            <div className="max-w-3xl mx-auto flex gap-3">
                <button type="button" onClick={onCancel} className="flex-1 px-6 py-3 border-2 rounded-lg" disabled={saving}>
                    Annuler
                </button>
                <button type="submit" className="flex-1 px-6 py-3 bg-primary-500 text-white rounded-lg" disabled={saving}>
                    {saving ? 'Enregistrement...' : 'Sauvegarder'}
                </button>
            </div>
        </div>
      </form>
    </div>
  );
}
