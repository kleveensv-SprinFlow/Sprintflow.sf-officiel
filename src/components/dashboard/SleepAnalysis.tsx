// src/components/dashboard/SleepAnalysis.tsx
import React, { useMemo } from 'react';
import { useSleep } from '../../hooks/useSleep';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Loader } from 'lucide-react';

export const SleepAnalysis: React.FC = () => {
  const { sleepData, loading } = useSleep();

  const last7DaysData = useMemo(() => {
    if (!sleepData) return [];
    const today = new Date();
    const last7Days: { date: string; duration: number; quality: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      const formattedDate = format(date, 'yyyy-MM-dd');
      const dayData = sleepData.find(d => d.date === formattedDate);
      last7Days.push({
        date: format(date, 'eee', { locale: fr }),
        duration: dayData?.duration_hours || 0,
        quality: dayData?.quality_rating || 0,
      });
    }
    return last7Days;
  }, [sleepData]);

  const getColor = (quality: number) => {
    switch (quality) {
      case 5: return '#22c55e'; // green-500
      case 4: return '#84cc16'; // lime-500
      case 3: return '#facc15'; // yellow-500
      case 2: return '#f97316'; // orange-500
      case 1: return '#ef4444'; // red-500
      default: return '#9ca3af'; // gray-400
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48">
        <Loader className="animate-spin text-blue-500" size={32} />
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 text-center">
        Analyse de Sommeil (7 derniers jours)
      </h2>
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={last7DaysData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip
              formatter={(value: number, name: string) => {
                if (name === 'duration') return [`${value}h`, 'Durée'];
                if (name === 'quality') return [`${value}/5`, 'Qualité'];
                return [value, name];
              }}
            />
            <Bar dataKey="duration" name="duration">
              {last7DaysData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={getColor(entry.quality)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};