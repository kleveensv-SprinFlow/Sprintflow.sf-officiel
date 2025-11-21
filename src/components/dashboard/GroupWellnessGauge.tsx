import React from 'react';
import { motion } from 'framer-motion';
import { Activity, HeartPulse } from 'lucide-react';

interface GroupWellnessGaugeProps {
  score: number; // 0 to 100
  loading?: boolean;
}

export const GroupWellnessGauge: React.FC<GroupWellnessGaugeProps> = ({ score, loading }) => {
  // Determine color based on score
  const getColor = (value: number) => {
    if (value >= 70) return '#4ade80'; // Green
    if (value >= 40) return '#fbbf24'; // Yellow/Orange
    return '#f87171'; // Red
  };

  const color = getColor(score);
  
  // Calculate stroke dasharray for semi-circle (circumference / 2)
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * (circumference / 2); // Only fill half

  return (
    <div className="w-full bg-light-card dark:bg-dark-card/60 backdrop-blur-md border border-white/20 rounded-2xl p-6 shadow-lg mb-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 pointer-events-none" />
        
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 relative z-10">
            <div className="flex flex-col">
                <h3 className="text-lg font-bold text-light-title dark:text-dark-title flex items-center gap-2">
                    <HeartPulse className="text-accent w-5 h-5" />
                    Santé du Groupe
                </h3>
                <p className="text-sm text-light-text dark:text-dark-text opacity-70 mt-1">
                    Moyenne de forme du jour basée sur les check-ins.
                </p>
            </div>

            <div className="relative w-48 h-24 flex items-end justify-center overflow-hidden">
                 {/* Gauge Background */}
                 <div className="absolute top-0 w-40 h-40 rounded-full border-[12px] border-gray-200 dark:border-gray-700" style={{ clipPath: 'polygon(0 0, 100% 0, 100% 50%, 0 50%)', transform: 'rotate(180deg)' }}></div>

                 {/* Gauge Value */}
                 <motion.div 
                    initial={{ rotate: 0 }}
                    animate={{ rotate: (score / 100) * 180 }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    className="absolute top-0 w-40 h-40 rounded-full border-[12px] border-transparent"
                    style={{ 
                        borderTopColor: color, 
                        borderRightColor: color, // Need to simulate the arc fill, CSS border rotation is tricky for gradients. 
                        // Simpler approach: SVG
                    }}
                 />
                 
                 {/* SVG Approach for smoother gauge */}
                 <svg width="180" height="90" viewBox="0 0 180 90" className="absolute top-0 left-1/2 -translate-x-1/2">
                    {/* Background Arc */}
                    <path d="M 10 90 A 80 80 0 0 1 170 90" fill="none" stroke="currentColor" strokeWidth="12" className="text-gray-200 dark:text-gray-700" strokeLinecap="round" />
                    
                    {/* Value Arc */}
                    <motion.path 
                        d="M 10 90 A 80 80 0 0 1 170 90" 
                        fill="none" 
                        stroke={color} 
                        strokeWidth="12" 
                        strokeLinecap="round"
                        strokeDasharray={Math.PI * 80} // Half circumference
                        strokeDashoffset={Math.PI * 80 * (1 - score / 100)}
                        initial={{ strokeDashoffset: Math.PI * 80 }}
                        animate={{ strokeDashoffset: Math.PI * 80 * (1 - score / 100) }}
                        transition={{ duration: 1.5, ease: "easeOut" }}
                    />
                 </svg>

                 <div className="absolute bottom-0 flex flex-col items-center">
                    <span className="text-3xl font-bold text-light-title dark:text-dark-title">{loading ? '--' : Math.round(score)}</span>
                    <span className="text-xs font-medium text-gray-500">/ 100</span>
                 </div>
            </div>
        </div>
    </div>
  );
};
