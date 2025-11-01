import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { CoachDashboardData } from '../../../hooks/useCoachDashboard';
import { TrendingUp, TrendingDown, CheckCircle, Activity } from 'lucide-react';

interface TeamHealthWidgetProps {
  data: CoachDashboardData['teamHealth'];
  loading: boolean;
}

const TeamHealthWidget: React.FC<TeamHealthWidgetProps> = ({ data, loading }) => {
  if (loading) {
    return (
      <div className="bg-white p-4 rounded-lg shadow-md animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
        <div className="h-40 bg-gray-200 rounded"></div>
      </div>
    );
  }

  const { wellnessTrend, adherence } = data;
  const adherenceRate = Math.round(adherence.rate * 100);

  const getWellnessTrend = () => {
    if (wellnessTrend.length < 2) return { text: 'Données insuffisantes', Icon: Activity, color: 'text-gray-500' };
    const first = wellnessTrend[0].avg_wellness;
    const last = wellnessTrend[wellnessTrend.length - 1].avg_wellness;
    if (last > first) return { text: 'Tendance à la hausse', Icon: TrendingUp, color: 'text-green-500' };
    if (last < first) return { text: 'Tendance à la baisse', Icon: TrendingDown, color: 'text-red-500' };
    return { text: 'Tendance stable', Icon: Activity, color: 'text-gray-500' };
  };

  const Trend = getWellnessTrend();

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4 text-gray-800">Santé de l'équipe</h2>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="flex flex-col items-center justify-center">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Adhésion au plan</h3>
          <div className="relative w-32 h-32">
            <svg className="w-full h-full" viewBox="0 0 36 36">
              <path
                d="M18 2.0845
                  a 15.9155 15.9155 0 0 1 0 31.831
                  a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="#e6e6e6"
                strokeWidth="3"
              />
              <path
                d="M18 2.0845
                  a 15.9155 15.9155 0 0 1 0 31.831
                  a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke={adherenceRate > 75 ? '#4ade80' : adherenceRate > 40 ? '#facc15' : '#f87171'}
                strokeWidth="3"
                strokeDasharray={`${adherenceRate}, 100`}
              />
            </svg>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-2xl font-bold text-gray-800">
              {adherenceRate}%
            </div>
          </div>
          <p className="text-sm text-gray-500 mt-2">
            {adherence.completed} / {adherence.planned} séances complétées
          </p>
        </div>

        <div className="flex flex-col">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Tendance Bien-être (7j)</h3>
           <div className="w-full h-40">
            <ResponsiveContainer>
              <AreaChart data={wellnessTrend} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" tickFormatter={(str) => new Date(str).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit'})} />
                <YAxis domain={[1, 5]} />
                <Tooltip />
                <Legend />
                <Area type="monotone" dataKey="avg_wellness" name="Bien-être moyen" stroke="#8884d8" fill="#8884d8" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className={`flex items-center justify-center mt-2 ${Trend.color}`}>
            <Trend.Icon className="w-5 h-5 mr-1" />
            <span className="font-semibold">{Trend.text}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeamHealthWidget;
