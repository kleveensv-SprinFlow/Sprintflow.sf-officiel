import React from 'react';
import { LineChart, Line, ResponsiveContainer, YAxis } from 'recharts';
import { motion } from 'framer-motion';

interface MicroChartProps {
  data: number[];
  isForme?: boolean;
}

const ACCENT_COLOR_HEX = '#8b5cf6'; // Violet-500

export const MicroChart: React.FC<MicroChartProps> = ({ data, isForme = false }) => {
  const chartData = data.map((value, index) => ({ name: index, value }));
  const lastValue = data[data.length - 1] || 0;

  let strokeColor = ACCENT_COLOR_HEX;
  if (isForme) {
    strokeColor = lastValue >= 80 ? '#10b981' : lastValue >= 50 ? '#f59e0b' : '#ef4444';
  }

  // Déterminer le domaine Y pour s'assurer que le graphique ne soit pas plat si les valeurs sont très proches
  const minValue = Math.min(...data);
  const maxValue = Math.max(...data);
  const domainPadding = (maxValue - minValue) < 5 ? 5 : 2;
  const yDomain = [minValue - domainPadding, maxValue + domainPadding];


  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 1 }}
      className="w-full h-full"
    >
      <ResponsiveContainer>
        <LineChart data={chartData} margin={{ top: 2, right: 2, bottom: 2, left: 2 }}>
          {/* YAxis est nécessaire pour définir le domaine, mais nous ne l'affichons pas */}
          <YAxis domain={yDomain} hide />
          <Line
            type="monotone"
            dataKey="value"
            stroke={strokeColor}
            strokeWidth={2}
            dot={false}
            isAnimationActive={false} // L'animation est gérée par le conteneur motion.div
          />
        </LineChart>
      </ResponsiveContainer>
    </motion.div>
  );
};
