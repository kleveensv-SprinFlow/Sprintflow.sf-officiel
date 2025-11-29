import { WorkoutBlock, WorkoutRound } from '../types/workout';

// --- 1. Générateur d'ID (Remplace uuid) ---
const generateId = () => {
  // Utilise l'API crypto du navigateur si disponible, sinon un fallback aléatoire
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

// --- 2. Création d'une répétition vide (Round) ---
export const createEmptyRound = (): WorkoutRound => ({
  id: generateId(),
  distance: 0,
  intensity_value: undefined,
  intensity_type: 'percent',
  recovery_time: undefined,
  target_time: '',
  start_type: 'standing',
  notes: ''
});

// --- 3. Création d'un bloc vide avec configuration par défaut (Smart Defaults) ---
export const createEmptyBlock = (type: 'course' | 'musculation' | 'technique'): WorkoutBlock => {
  const blockId = generateId();
  
  // Configuration de base commune
  const baseConfig = {
    show_target_time: false,
    show_intensity: true,
    show_recovery: true,
    show_start_type: false,
    show_weight: false,
    show_distance: false,
    show_duration: false,
    show_reps_count: false,
    show_notes: false
  };

  switch (type) {
    case 'course':
      return {
        id: blockId,
        type: 'course',
        title: 'Bloc Course',
        rounds: [createEmptyRound(), createEmptyRound()], // 2 lignes par défaut pour commencer
        config: {
          ...baseConfig,
          show_distance: true,
          show_recovery: true,
          show_intensity: true
        }
      } as any; // Cast as any temporaire si les types stricts de Phase 1 ne sont pas parfaitement alignés

    case 'musculation':
      return {
        id: blockId,
        type: 'musculation',
        title: 'Bloc Musculation',
        rounds: [createEmptyRound()],
        config: {
          ...baseConfig,
          show_weight: true,
          show_reps_count: true,
          show_intensity: false, // En muscu on utilise souvent la charge plutôt que %Vmax
          show_recovery: true
        }
      } as any;

    case 'technique':
      return {
        id: blockId,
        type: 'technique',
        title: 'Technique / Drills',
        rounds: [createEmptyRound()],
        config: {
          ...baseConfig,
          show_duration: true,
          show_notes: true,
          show_intensity: false
        }
      } as any;

    default:
      // Fallback pour éviter les crashs
      return {
        id: blockId,
        type: 'course',
        title: 'Bloc Générique',
        rounds: [],
        config: baseConfig
      } as any;
  }
};