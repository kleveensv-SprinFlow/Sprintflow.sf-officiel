import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Profile, Workout, WellnessLog } from '../../types';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Avatar } from '../common/Avatar';

interface AthleteCardProps {
  athlete: Profile;
  onSelect: (athlete: Profile) => void;
}

export const AthleteCard: React.FC<AthleteCardProps> = ({ athlete, onSelect }) => {
  const [lastWorkout, setLastWorkout] = useState<Workout | null>(null);
  const [todayWellness, setTodayWellness] = useState<WellnessLog | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const today = new Date().toISOString().split('T')[0];

      // Fetch last workout
      const { data: workoutData, error: workoutError } = await supabase
        .from('workouts')
        .select('*')
        .eq('user_id', athlete.id)
        .order('date', { ascending: false })
        .limit(1)
        .single();
      if (!workoutError) setLastWorkout(workoutData);

      // Fetch today's wellness log
      const { data: wellnessData, error: wellnessError } = await supabase
        .from('wellness_log')
        .select('*')
        .eq('user_id', athlete.id)
        .eq('date', today)
        .single();
      if (!wellnessError) setTodayWellness(wellnessData);

      setLoading(false);
    };

    fetchData();
  }, [athlete.id]);

  const getWellnessEmoji = () => {
    if (!todayWellness) return '⚪️';
    const { sleep_quality, stress_level, muscle_fatigue } = todayWellness;
    const average = (sleep_quality + (6 - stress_level) + (6 - muscle_fatigue)) / 3;
    if (average >= 4) return '🟢'; // Bon
    if (average >= 2.5) return '🟠'; // Moyen
    return '🔴'; // Mauvais
  };

  return (
    <div
      onClick={() => onSelect(athlete)}
      className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow border border-gray-200 dark:border-gray-700 cursor-pointer hover:shadow-lg transition-shadow"
    >
      <div className="flex items-start gap-3">
        <Avatar
          src={athlete.photo_url}
          alt={`${athlete.first_name} ${athlete.last_name}`}
          size="lg"
        />
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                {athlete.first_name} {athlete.last_name}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{athlete.email}</p>
            </div>
            <span className="text-2xl ml-2">{getWellnessEmoji()}</span>
          </div>
        </div>
      </div>
      <div className="mt-4 text-xs text-gray-600 dark:text-gray-400">
        {loading ? <p>Chargement...</p> : (
          lastWorkout ? (
            <p>Dernière séance: {lastWorkout.title} ({format(new Date(lastWorkout.date), 'd MMM', { locale: fr })})</p>
          ) : (
            <p>Aucune séance enregistrée.</p>
          )
        )}
      </div>
    </div>
  );
};