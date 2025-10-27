import React, { useState, useEffect } from 'react';
// Assure-toi que le chemin est correct et que Workout inclut les nouveaux champs
// (tag_seance, courses_json, exercises_json, effort, notes, etc.)
import { Workout, WorkoutRun, WorkoutExercise } from '../../types';
// Importe les icônes si tu utilises lucide-react ou similaire
import { PlusCircle, Trash2 } from 'lucide-react';

// --- Interface pour les Props ---
interface WorkoutFormProps {
  onSave: (workout: Partial<Workout>) => Promise<void>;
  onCancel: () => void;
  initialWorkout?: Workout;
  // Ajout: Il faudra passer la liste des exercices disponibles
  availableExercises: { id: string; categorie: string; nom_exercice: string }[];
}

// --- Composant Principal ---
export function WorkoutForm({ onSave, onCancel, initialWorkout, availableExercises }: WorkoutFormProps) {
  // --- États pour les champs ---
  const [date, setDate] = useState(initialWorkout?.date || new Date().toISOString().split('T')[0]);
  // NOUVEAU: Tag de Séance
  const [tagSeance, setTagSeance] = useState<'vitesse' | 'lactique' | 'technique' | ''>(
    initialWorkout?.tag_seance || ''
  );
  // NOUVEAU: Liste dynamique des courses
  const [runs, setRuns] = useState<Partial<WorkoutRun>[]>(initialWorkout?.courses_json || []);
  // NOUVEAU: Liste dynamique des exercices de muscu
  const [exercises, setExercises] = useState<Partial<WorkoutExercise>[]>(initialWorkout?.exercises_json || []);
  // NOUVEAU: Ressenti
  const [effort, setEffort] = useState<number | ''>(initialWorkout?.effort || '');
  const [notes, setNotes] = useState<string>(initialWorkout?.notes || '');
  // NOUVEAU: Conditions (Optionnel)
  const [meteo, setMeteo] = useState<string>(initialWorkout?.meteo || '');
  // NOUVEAU: Type de Chrono (un seul pour toute la section course pour simplifier)
  const [typeChrono, setTypeChrono] = useState<'manuel' | 'electronique' | ''>(
      initialWorkout?.type_chrono || '' // Assure-toi que type_chrono existe sur Workout
  );

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({}); // Pour afficher les erreurs

  // --- Fonctions pour gérer les listes dynamiques ---

  // Courses
  const addRun = () => {
    setRuns([...runs, { distance: '', temps: '', repos: '', chaussures: 'baskets' }]);
  };
  const updateRun = (index: number, field: keyof WorkoutRun, value: string) => {
    const newRuns = [...runs];
    newRuns[index] = { ...newRuns[index], [field]: value };
    setRuns(newRuns);
  };
  const removeRun = (index: number) => {
    setRuns(runs.filter((_, i) => i !== index));
  };

  // Musculation
  const addExercise = () => {
    setExercises([...exercises, { exercice_id: '', series: '', repetitions: '', poids: '' }]);
  };
  const updateExercise = (index: number, field: keyof WorkoutExercise, value: string) => {
    const newExercises = [...exercises];
    newExercises[index] = { ...newExercises[index], [field]: value };
    setExercises(newExercises);
  };
  const removeExercise = (index: number) => {
    setExercises(exercises.filter((_, i) => i !== index));
  };

  // --- Validation avant sauvegarde ---
  const validateForm = (): boolean => {
      const newErrors: Record<string, string> = {};
      if (!tagSeance) {
          newErrors.tagSeance = 'Le type de séance est obligatoire.';
      }
      if (runs.length > 0 && !typeChrono) {
          newErrors.typeChrono = 'Le type de chrono est obligatoire si des courses sont ajoutées.';
      }
      runs.forEach((run, index) => {
          if (!run.distance) newErrors[`run_${index}_distance`] = 'Distance requise.';
          if (!run.temps) newErrors[`run_${index}_temps`] = 'Temps requis.';
          // Ajoute d'autres validations si nécessaire (ex: temps est un nombre)
      });
      exercises.forEach((ex, index) => {
          if (!ex.exercice_id) newErrors[`ex_${index}_exercice_id`] = 'Exercice requis.';
          // Ajoute d'autres validations (series/reps/poids sont des nombres?)
      });

      setErrors(newErrors);
      return Object.keys(newErrors).length === 0; // Retourne true si pas d'erreurs
  };


  // --- Sauvegarde ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
        console.error("Erreurs de validation:", errors);
        alert("Veuillez corriger les erreurs dans le formulaire.");
        return;
    }

    setIsSubmitting(true);
    try {
      // Prépare l'objet Workout à envoyer
      const workoutData: Partial<Workout> = {
        id: initialWorkout?.id,
        date: date,
        tag_seance: tagSeance || undefined, // Assure que c'est undefined si vide
        type_chrono: typeChrono || undefined,
        // Filtre les lignes vides avant de sauvegarder
        courses_json: runs.filter(r => r.distance && r.temps),
        exercises_json: exercises.filter(ex => ex.exercice_id),
        effort: effort === '' ? undefined : Number(effort),
        notes: notes || undefined,
        meteo: meteo || undefined,
        // Ajoute d'autres champs si nécessaire (ex: temperature)
      };

      console.log("💾 Données envoyées à onSave:", workoutData);
      await onSave(workoutData);
      // Si onSave réussit sans erreur, on peut fermer ou afficher succès
      // (onSave devrait gérer la fermeture ou la navigation si succès)

    } catch(error) {
        console.error("❌ Erreur lors de la sauvegarde:", error);
        alert(`Erreur lors de l'enregistrement: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    }
    finally {
      setIsSubmitting(false);
    }
  };

  // --- Rendu JSX ---
  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white dark:bg-gray-800 p-4 md:p-6 rounded-lg shadow-md max-w-2xl mx-auto">
      <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white mb-6">
        {initialWorkout ? 'Modifier' : 'Nouvel'} Entraînement
      </h2>

      {/* --- Date & Type de Séance --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="workout-date" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Date *</label>
          <input id="workout-date" type="date" value={date} onChange={(e) => setDate(e.target.value)} required className="input-field" />
        </div>
        <div>
          <label htmlFor="tag-seance" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Type de Séance *</label>
          <select id="tag-seance" value={tagSeance} onChange={(e) => setTagSeance(e.target.value as any)} required className="input-field">
            <option value="" disabled>Choisir...</option>
            <option value="vitesse">Vitesse Max / Explosivité</option>
            <option value="lactique">Endurance Lactique</option>
            <option value="technique">Technique / Récupération</option>
          </select>
           {errors.tagSeance && <p className="text-red-500 text-xs mt-1">{errors.tagSeance}</p>}
        </div>
      </div>

       {/* --- Section Courses / Piste --- */}
      <fieldset className="border border-gray-300 dark:border-gray-600 rounded-lg p-4">
          <legend className="text-lg font-medium text-gray-900 dark:text-white px-2">Courses / Piste</legend>

          {/* Type de Chrono (un seul pour toutes les courses) */}
           <div className="mb-4">
              <label htmlFor="type-chrono" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Type de Chrono (pour toutes les courses) *</label>
              <select id="type-chrono" value={typeChrono} onChange={(e) => setTypeChrono(e.target.value as any)} className="input-field">
                <option value="" disabled>Choisir...</option>
                <option value="manuel">Manuel</option>
                <option value="electronique">Électronique</option>
              </select>
               {errors.typeChrono && <p className="text-red-500 text-xs mt-1">{errors.typeChrono}</p>}
           </div>

          {runs.map((run, index) => (
            <div key={index} className="grid grid-cols-2 md:grid-cols-6 gap-2 mb-3 items-end border-b border-gray-200 dark:border-gray-700 pb-3">
              {/* Distance */}
              <div className="col-span-1 md:col-span-1">
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400">Dist.</label>
                <input type="text" placeholder="ex: 100m" value={run.distance || ''} onChange={(e) => updateRun(index, 'distance', e.target.value)} className="input-field-sm" />
                 {errors[`run_${index}_distance`] && <p className="text-red-500 text-xs">{errors[`run_${index}_distance`]}</p>}
              </div>
              {/* Temps */}
              <div className="col-span-1 md:col-span-1">
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400">Temps</label>
                <input type="text" placeholder="ex: 10.72" value={run.temps || ''} onChange={(e) => updateRun(index, 'temps', e.target.value)} className="input-field-sm" />
                 {errors[`run_${index}_temps`] && <p className="text-red-500 text-xs">{errors[`run_${index}_temps`]}</p>}
              </div>
              {/* Repos */}
              <div className="col-span-1 md:col-span-1">
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400">Repos</label>
                <input type="text" placeholder="ex: 8min" value={run.repos || ''} onChange={(e) => updateRun(index, 'repos', e.target.value)} className="input-field-sm" />
              </div>
              {/* Chaussures */}
               <div className="col-span-1 md:col-span-2">
                 <label className="block text-xs font-medium text-gray-500 dark:text-gray-400">Chaussures</label>
                 <select value={run.chaussures || 'baskets'} onChange={(e) => updateRun(index, 'chaussures', e.target.value)} className="input-field-sm">
                   <option value="baskets">Baskets</option>
                   <option value="pointes">Pointes</option>
                 </select>
               </div>
              {/* Bouton Supprimer */}
              <div className="col-span-2 md:col-span-1">
                <button type="button" onClick={() => removeRun(index)} className="text-red-500 hover:text-red-700 p-1" aria-label="Supprimer course">
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}
          <button type="button" onClick={addRun} className="mt-2 text-sm text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1">
            <PlusCircle size={16} /> Ajouter une course
          </button>
      </fieldset>

       {/* --- Section Musculation / Force --- */}
        <fieldset className="border border-gray-300 dark:border-gray-600 rounded-lg p-4">
            <legend className="text-lg font-medium text-gray-900 dark:text-white px-2">Musculation / Force</legend>

             {exercises.map((ex, index) => (
                <div key={index} className="grid grid-cols-2 md:grid-cols-6 gap-2 mb-3 items-end border-b border-gray-200 dark:border-gray-700 pb-3">
                    {/* Exercice (Sélecteur) */}
                    <div className="col-span-2 md:col-span-2">
                        <label className="block text-xs font-medium text-gray-500 dark:text-gray-400">Exercice</label>
                        <select
                            value={ex.exercice_id || ''}
                            onChange={(e) => updateExercise(index, 'exercice_id', e.target.value)}
                            className="input-field-sm"
                        >
                            <option value="" disabled>Choisir...</option>
                            {/* Group exercises by category */}
                            {availableExercises && [...new Set(availableExercises.map(e => e.categorie))].map(cat => (
                                <optgroup key={cat} label={cat}>
                                    {availableExercises.filter(e => e.categorie === cat).map(exercise => (
                                        <option key={exercise.id} value={exercise.id}>
                                            {exercise.nom_exercice}
                                        </option>
                                    ))}
                                </optgroup>
                            ))}
                        </select>
                         {errors[`ex_${index}_exercice_id`] && <p className="text-red-500 text-xs">{errors[`ex_${index}_exercice_id`]}</p>}
                    </div>
                    {/* Séries */}
                    <div className="col-span-1 md:col-span-1">
                        <label className="block text-xs font-medium text-gray-500 dark:text-gray-400">Séries</label>
                        <input type="number" placeholder="ex: 5" value={ex.series || ''} onChange={(e) => updateExercise(index, 'series', e.target.value)} className="input-field-sm" />
                    </div>
                    {/* Répétitions */}
                    <div className="col-span-1 md:col-span-1">
                        <label className="block text-xs font-medium text-gray-500 dark:text-gray-400">Reps</label>
                        <input type="number" placeholder="ex: 5" value={ex.repetitions || ''} onChange={(e) => updateExercise(index, 'repetitions', e.target.value)} className="input-field-sm" />
                    </div>
                    {/* Poids */}
                    <div className="col-span-1 md:col-span-1">
                        <label className="block text-xs font-medium text-gray-500 dark:text-gray-400">Poids (kg)</label>
                        <input type="number" step="0.5" placeholder="ex: 120" value={ex.poids || ''} onChange={(e) => updateExercise(index, 'poids', e.target.value)} className="input-field-sm" />
                    </div>
                    {/* Bouton Supprimer */}
                    <div className="col-span-1 md:col-span-1">
                        <button type="button" onClick={() => removeExercise(index)} className="text-red-500 hover:text-red-700 p-1" aria-label="Supprimer exercice">
                            <Trash2 size={18} />
                        </button>
                    </div>
                </div>
             ))}
             <button type="button" onClick={addExercise} className="mt-2 text-sm text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1">
               <PlusCircle size={16} /> Ajouter un exercice
             </button>
        </fieldset>

      {/* --- Section Ressenti / Feedback --- */}
       <fieldset className="border border-gray-300 dark:border-gray-600 rounded-lg p-4">
           <legend className="text-lg font-medium text-gray-900 dark:text-white px-2">Ressenti / Feedback</legend>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="effort" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Effort Perçu (1 à 10)</label>
                  <input id="effort" type="number" min="1" max="10" value={effort} onChange={(e) => setEffort(Number(e.target.value))} className="input-field" />
                </div>
                 <div>
                    <label htmlFor="meteo" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Météo (optionnel)</label>
                    <input id="meteo" type="text" placeholder="ex: Ensoleillé, Vent léger" value={meteo} onChange={(e) => setMeteo(e.target.value)} className="input-field" />
                 </div>
            </div>
             <div className="mt-4">
                  <label htmlFor="notes" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Notes sur la séance</label>
                  <textarea id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} placeholder="Sensations, points techniques, fatigue..." className="input-field"></textarea>
             </div>
       </fieldset>


      {/* --- Boutons d'action --- */}
      <div className="flex flex-col md:flex-row gap-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="w-full md:w-auto px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 font-medium"
        >
          Annuler
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full md:flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Enregistrement...
            </>
           ) : (
             initialWorkout ? 'Mettre à jour' : 'Enregistrer la Séance'
           )}
        </button>
      </div>

       {/* --- Styles CSS (à mettre dans un fichier .css séparé idéalement) --- */}
       <style jsx>{`
        .input-field {
          width: 100%;
          padding: 0.75rem 1rem; /* 12px 16px */
          border-radius: 0.5rem; /* 8px */
          border: 1px solid #D1D5DB; /* gray-300 */
          background-color: #FFFFFF; /* white */
          color: #111827; /* gray-900 */
          font-size: 1rem; /* 16px */
        }
        .dark .input-field {
          border-color: #4B5563; /* dark:gray-600 */
          background-color: #374151; /* dark:gray-700 */
          color: #F9FAFB; /* dark:gray-50 */
        }
        .input-field-sm { /* Version plus petite pour les lignes dynamiques */
          width: 100%;
          padding: 0.5rem 0.75rem; /* 8px 12px */
          border-radius: 0.375rem; /* 6px */
          border: 1px solid #D1D5DB;
          background-color: #FFFFFF;
          color: #111827;
          font-size: 0.875rem; /* 14px */
        }
        .dark .input-field-sm {
           border-color: #4B5563;
           background-color: #374151;
           color: #F9FAFB;
        }
        textarea.input-field {
           min-height: 80px;
        }
       `}</style>

    </form>
  );
}