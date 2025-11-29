import { WorkoutBlock, WorkoutBlockConfig, WorkoutRound } from '../types/workout';

export const createEmptyRound = (): WorkoutRound => ({
  id: crypto.randomUUID(),
  intensity_type: 'percent', // Default intensity type
});

export const getDefaultConfig = (type: WorkoutBlock['type']): WorkoutBlockConfig => {
  const baseConfig: WorkoutBlockConfig = {
    show_distance: false,
    show_duration: false,
    show_reps_count: false,
    show_intensity: false,
    show_weight: false,
    show_recovery: false,
    show_target_time: false,
    show_start_type: false,
    show_notes: false,
  };

  switch (type) {
    case 'course':
      return {
        ...baseConfig,
        show_distance: true,
        show_recovery: true,
        show_intensity: true,
      };
    case 'musculation':
      return {
        ...baseConfig,
        show_weight: true,
        show_reps_count: true,
        show_recovery: true,
      };
    case 'technique':
      return {
        ...baseConfig,
        show_duration: true,
        show_notes: true,
      };
    case 'universal':
      return {
        ...baseConfig,
        show_intensity: true,
        show_recovery: true,
      };
    case 'note':
      return baseConfig; // Note block doesn't use grid config
    default:
      return baseConfig;
  }
};

export const createEmptyBlock = (type: WorkoutBlock['type']): WorkoutBlock => {
  const common = {
    id: crypto.randomUUID(),
    rounds: [createEmptyRound()],
    config: getDefaultConfig(type),
  };

  switch (type) {
    case 'course':
      return {
        ...common,
        type: 'course',
        // Legacy defaults to satisfy types
        series: 1,
        reps: 1,
        distance: 0,
        restBetweenReps: '0',
        restBetweenSeries: '0',
      };
    case 'musculation':
      return {
        ...common,
        type: 'musculation',
        // Legacy defaults
        exerciceId: '',
        exerciceNom: 'Nouvel exercice',
        series: 1,
        reps: 1,
        poids: null,
        restTime: '0',
      };
    case 'technique':
      return {
        ...common,
        type: 'technique',
        // Legacy defaults
        title: 'Bloc Technique',
        duration_estimated_seconds: 0,
      };
    case 'repos':
      return {
        ...common,
        type: 'repos',
        rest_duration_seconds: 60,
        activity_type: 'passif',
      };
    case 'series':
      return {
        ...common,
        type: 'series',
        seriesCount: 2,
        restBetweenSeries: '0',
        blocks: [],
      };
    case 'note':
      return {
        ...common,
        type: 'note',
        content: '',
      };
    case 'universal':
      return {
        ...common,
        type: 'universal',
        metric_name: 'Performance',
      };
    default:
        // Fallback for unknown types if any, though TS ensures we cover cases or return compatible type
        // In practice this case might not be reachable if strictly typed
         return {
            ...common,
            type: 'course', // fallback
            series: 1,
            reps: 1,
            distance: 0,
            restBetweenReps: '0',
            restBetweenSeries: '0',
        } as WorkoutBlock;
  }
};
