import React, { useState } from 'react';
import { Save, Copy, Calendar, Clock, Target } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { WorkoutBuilder, WorkoutBlock } from '../workouts/WorkoutBuilder';

interface SessionTemplate {
  id: string;
  name: string;
  description: string;
  session_type: 'training' | 'recovery' | 'rest';
  duration_minutes: number;
  intensity: 'low' | 'medium' | 'high';
  exercises: any[];
  created_at: string;
}

interface SessionTemplateFormProps {
  onSave: (template: any) => void;
  onCancel: () => void;
  existingTemplates: SessionTemplate[];
  onUseTemplate: (template: SessionTemplate) => void;
  selectedDate?: Date | null;
  selectedGroupId?: string;
  selectedGroupName?: string;
  editingSession?: any;
}

export const SessionTemplateForm: React.FC<SessionTemplateFormProps> = ({ 
  onSave, 
  onCancel, 
  existingTemplates,
  selectedDate,
  selectedGroupId,
  selectedGroupName,
  editingSession
}) => {
  const [selectedSessionDate, setSelectedSessionDate] = useState<string>(
    selectedDate ? format(selectedDate, 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd')
  );
  
  const [sessionForm, setSessionForm] = useState({
    name: editingSession?.name || '',
    session_type: (editingSession?.session_type || 'training') as 'training' | 'recovery' | 'rest',
    duration_minutes: editingSession?.duration_minutes || 60,
    intensity: (editingSession?.intensity || 'medium') as 'low' | 'medium' | 'high'
  });
  const [workoutBlocks, setWorkoutBlocks] = useState<WorkoutBlock[]>(editingSession?.exercises || []);

  const [showPreviousSessions, setShowPreviousSessions] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sessionForm.name.trim() || workoutBlocks.length === 0) {
        alert('Le nom de la séance et au moins un bloc d\'exercice sont requis.');
        return;
    }
    if (!selectedGroupId) {
      alert('Aucun groupe sélectionné');
      return;
    }
    
    const sessionWithDate = {
      ...sessionForm,
      group_id: selectedGroupId,
      exercises: workoutBlocks,
      description: `${workoutBlocks.length} bloc(s) d'entraînement.`, // Auto-generated description
      created_at: selectedSessionDate
    };
    
    onSave(sessionWithDate);
  };

  const handleCopySession = (template: SessionTemplate) => {
    setSessionForm({
      name: template.name,
      session_type: template.session_type,
      duration_minutes: template.duration_minutes,
      intensity: template.intensity
    });
    setWorkoutBlocks(template.exercises || []);
    setShowPreviousSessions(false);
  };

  // Grouper les séances par date pour un affichage plus clair
  const sessionsByDate = existingTemplates.reduce((acc, template) => {
    const date = format(new Date(template.created_at), 'yyyy-MM-dd');
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(template);
    return acc;
  }, {} as Record<string, SessionTemplate[]>);

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {editingSession ? 'Modifier la Séance' : 'Créer une Séance'}
            </h2>
            {selectedGroupName && (
              <p className="text-primary-600 dark:text-primary-400 mt-1 font-medium">
                📊 Groupe: {selectedGroupName}
              </p>
            )}
            <p className="text-gray-600 dark:text-gray-400 mt-1 text-sm">
              {editingSession ? 'Modifiez les détails de cette séance' : 'Planifiez une séance d\'entraînement pour ce groupe'}
            </p>
          </div>
          {existingTemplates.length > 0 && !editingSession && (
            <button
              onClick={() => setShowPreviousSessions(!showPreviousSessions)}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg text-white transition-all duration-200 shadow-lg"
            >
              <Copy className="h-5 w-5" />
              <span>Copier une séance</span>
            </button>
          )}
          {editingSession && selectedDate && (
            <p className="text-blue-600 dark:text-blue-400 mt-1 font-medium">
              📅 Date: {format(selectedDate, 'EEEE d MMMM yyyy', { locale: fr })}
            </p>
          )}
        </div>
        
        {/* Séances précédentes */}
        {showPreviousSessions && !editingSession && existingTemplates.length > 0 && (
          <div className="mb-6 bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Séances Précédentes</h3>
            <div className="space-y-4 max-h-64 overflow-y-auto">
              {Object.entries(sessionsByDate)
                .sort(([a], [b]) => new Date(b).getTime() - new Date(a).getTime())
                .map(([date, sessions]) => (
                  <div key={date} className="space-y-2">
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-600 pb-1">
                      {format(new Date(date), 'EEEE d MMMM yyyy', { locale: fr })}
                    </h4>
                    {sessions.map((template) => (
                      <div key={template.id} className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-600">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <h5 className="font-medium text-gray-900 dark:text-white">{template.name}</h5>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                              {template.description}
                            </p>
                            <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500 dark:text-gray-400">
                              <div className="flex items-center space-x-1">
                                <Clock className="h-3 w-3" />
                                <span>{template.duration_minutes}min</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Target className="h-3 w-3" />
                                <span className={
                                  template.intensity === 'low' ? 'text-green-600' :
                                  template.intensity === 'medium' ? 'text-yellow-600' : 'text-red-600'
                                }>
                                  {template.intensity === 'low' ? 'Faible' : 
                                   template.intensity === 'medium' ? 'Moyenne' : 'Élevée'}
                                </span>
                              </div>
                            </div>
                          </div>
                          <button
                            onClick={() => handleCopySession(template)}
                            className="ml-3 px-3 py-2 bg-primary-500 hover:bg-primary-600 rounded-lg text-white text-sm transition-colors"
                          >
                            Copier
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
            </div>
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Sélecteur de date */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <label className="block text-sm font-medium text-blue-800 dark:text-blue-200 mb-3">
              📅 Date de la séance
            </label>
            <div className="flex items-center space-x-4">
              <input
                type="date"
                value={selectedSessionDate}
                onChange={(e) => setSelectedSessionDate(e.target.value)}
                className="px-4 py-3 bg-white dark:bg-gray-700 border border-blue-300 dark:border-blue-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg font-medium"
                required
              />
              <div className="text-blue-700 dark:text-blue-300">
                <div className="font-medium">
                  {format(new Date(selectedSessionDate), 'EEEE', { locale: fr })}
                </div>
                <div className="text-sm">
                  {format(new Date(selectedSessionDate), 'd MMMM yyyy', { locale: fr })}
                </div>
              </div>
            </div>
          </div>

          {/* Informations de base */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Nom de la séance *
              </label>
              <input
                type="text"
                value={sessionForm.name}
                onChange={(e) => setSessionForm(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Ex: Sprint + Force, Récupération active"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Type de séance
              </label>
              <select
                value={sessionForm.session_type}
                onChange={(e) => setSessionForm(prev => ({ ...prev, session_type: e.target.value as any }))}
                className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="training">Entraînement</option>
                <option value="recovery">Récupération</option>
                <option value="rest">Repos</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Durée (minutes)
              </label>
              <input
                type="number"
                value={sessionForm.duration_minutes}
                onChange={(e) => setSessionForm(prev => ({ ...prev, duration_minutes: parseInt(e.target.value) }))}
                className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                min="1"
                placeholder="60"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Intensité générale
              </label>
              <select
                value={sessionForm.intensity}
                onChange={(e) => setSessionForm(prev => ({ ...prev, intensity: e.target.value as any }))}
                className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="low">Faible</option>
                <option value="medium">Moyenne</option>
                <option value="high">Élevée</option>
              </select>
            </div>
          </div>

          {/* Workout Builder */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Contenu de la séance *
            </label>
            <WorkoutBuilder blocks={workoutBlocks} onChange={setWorkoutBlocks} />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              💡 Construisez la séance en ajoutant des blocs de course ou de musculation.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3 pt-6">
            <button
              type="submit"
              disabled={!sessionForm.name.trim() || workoutBlocks.length === 0}
              className="w-full sm:flex-1 bg-primary-500 hover:bg-primary-600 disabled:opacity-50 px-4 py-3 rounded-lg text-white font-medium transition-all duration-200 flex items-center justify-center space-x-2 button-3d"
            >
              <Save className="h-5 w-5" />
              <span>{editingSession ? 'Mettre à jour la Séance' : 'Créer la Séance'}</span>
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="w-full sm:w-auto px-6 py-3 border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-gray-700 dark:text-gray-300 transition-colors button-3d"
            >
              Annuler
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};