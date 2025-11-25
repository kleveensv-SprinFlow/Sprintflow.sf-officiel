// src/components/dashboard/PerformanceRadarCard.tsx
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer } from 'recharts';

interface PerformanceRadarCardProps {
  formIndex: number | null;
  performanceIndex: number | null;
  loading: boolean;
}

const PerformanceRadarCard: React.FC<PerformanceRadarCardProps> = ({ formIndex, performanceIndex, loading }) => {
  const data = [
    { subject: 'FORME', value: formIndex ?? 0, fullMark: 100 },
    { subject: 'PERF', value: performanceIndex ?? 0, fullMark: 100 },
    // You can add more data points here in the future
  ];

  return (
    <div className="bg-sprint-dark-surface border border-sprint-dark-border-subtle rounded-3xl p-6 shadow-premium-dark mx-4">
      <h2 className="font-din-title text-xl text-white mb-4">VOS INDICATEURS</h2>
      <div className="h-64">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-sprint-dark-text-secondary">Chargement des données...</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
              <defs>
                <radialGradient id="radarGradient">
                  <stop offset="0%" stopColor="rgba(79, 70, 229, 0.5)" />
                  <stop offset="100%" stopColor="rgba(79, 70, 229, 0.1)" />
                </radialGradient>
              </defs>
              <PolarGrid stroke="rgba(255, 255, 255, 0.1)" />
              <PolarAngleAxis
                dataKey="subject"
                tick={{ fill: '#E5E7EB', fontSize: 14, fontFamily: 'DIN 1451' }}
              />
              <Radar
                name="Indices"
                dataKey="value"
                stroke="#4F46E5"
                fill="url(#radarGradient)"
                fillOpacity={0.8}
              />
            </RadarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};

export default PerformanceRadarCard;
