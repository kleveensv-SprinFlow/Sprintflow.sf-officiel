import { View } from '../types';

export const getViewTitle = (view: View): string => {
  switch (view) {
    case 'dashboard':
      return 'Dashboard';
    case 'workouts':
      return 'Mes Séances';
    case 'add-workout':
      return 'Nouvelle Séance';
    case 'records':
      return 'Mes Records';
    case 'add-record':
      return 'Nouveau Record';
    case 'bodycomp':
      return 'Composition Corporelle';
    case 'add-bodycomp':
      return 'Nouvelle Entrée';
    case 'planning':
      return 'Mon Planning';
    case 'profile':
      return 'Mon Profil';
    case 'groups':
      return 'Mes Groupes';
    case 'chat':
      return 'Conversations';
    case 'nutrition':
      return 'Nutrition';
    default:
      return 'Sprintflow';
  }
};
