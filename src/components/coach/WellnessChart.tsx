import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useWellness } from '../../hooks/useWellness';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface WellnessChartProps {
  userId: string;
}

export const WellnessChart: React.FC<WellnessChartProps> = ({ userId }) => {
  const { wellnessData, loading } = useWellness(userId);

  const formattedData = wellnessData
    .map(log => ({
      date: format(new Date(log.date), 'd MMM', { locale: fr }),
      Sommeil: log.sleep_quality,
      Stress: log.stress_level,
      Fatigue: log.muscle_fatigue,
    }))
    .reverse(); // Reverse to show oldest to newest

  if (loading) return <p>Chargement du graphique...</p>;

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
      <h3 className="font-semibold mb-4">Bien-être (7 derniers jours)</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={formattedData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis domain={[1, 5]} />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="Sommeil" stroke="#8884d8" />
          <Line type="monotone" dataKey="Stress" stroke="#82ca9d" />
          <Line type="monotone" dataKey="Fatigue" stroke="#ffc658" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
