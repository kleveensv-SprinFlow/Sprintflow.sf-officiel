import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Activity, TrendingUp, Target, Info, Zap } from 'lucide-react';
import { usePowerWeightAdvice } from '../../hooks/usePowerWeightAdvice';
import { useRecords } from '../../hooks/useRecords';
import { useBodycomp } from '../../hooks/useBodycomp';
import SprintyIcon from '../ui/SprintyIcon';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine
} from 'recharts';

interface PowerWeightModalProps {
  isOpen: boolean;
  onClose: () => void;
  score: number;
}

const PowerWeightModal: React.FC<PowerWeightModalProps> = ({ isOpen, onClose, score }) => {
  const { advice, loading: adviceLoading } = usePowerWeightAdvice(score);
  const { strengthRecords, loading: recordsLoading } = useRecords();
  const { history: bodyCompHistory, loading: bodyCompLoading } = useBodycomp();

  // Calculate Best Ratio (PDC)
  const bestRatio = useMemo(() => {
    if (!strengthRecords.length || !bodyCompHistory.length) return null;

    let maxRatio = 0;
    let bestExercise = '';

    // Use the most recent weight for current calculation
    const currentWeight = bodyCompHistory[0]?.poids_kg || 75;

    // Focus on key compound movements
    const keyExercises = ['squat', 'deadlift', 'soulevé de terre', 'bench press', 'développé couché'];
    
    strengthRecords.forEach(record => {
      const name = record.exercise_name.toLowerCase();
      if (keyExercises.some(k => name.includes(k))) {
        const ratio = record.value / currentWeight;
        if (ratio > maxRatio) {
          maxRatio = ratio;
          bestExercise = record.exercise_name;
        }
      }
    });

    return maxRatio > 0 ? { ratio: maxRatio.toFixed(2), exercise: bestExercise } : null;
  }, [strengthRecords, bodyCompHistory]);

  // Calculate Evolution Graph Data
  const graphData = useMemo(() => {
    if (!strengthRecords.length || !bodyCompHistory.length) return [];

    // Filter for Squat or Deadlift for the graph (most representative of total power)
    const targetExercise = bestRatio?.exercise || 'Squat';
    const relevantRecords = strengthRecords
      .filter(r => r.exercise_name === targetExercise)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    return relevantRecords.map(record => {
      // Find bodyweight closest to record date
      const recordDate = new Date(record.date).getTime();
      const closestWeight = bodyCompHistory.reduce((prev, curr) => {
        const prevDiff = Math.abs(new Date(prev.date).getTime() - recordDate);
        const currDiff = Math.abs(new Date(curr.date).getTime() - recordDate);
        return currDiff < prevDiff ? curr : prev;
      });

      return {
        date: new Date(record.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }),
        ratio: Number((record.value / (closestWeight.poids_kg || 75)).toFixed(2)),
        weight: record.value
      };
    });
  }, [strengthRecords, bodyCompHistory, bestRatio]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
            {/* Backdrop */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />

            {/* Modal Content */}
            <motion.div
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                className="relative w-full max-w-md bg-gray-900/90 border border-white/10 rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto scrollbar-hide"
            >
                {/* Glass Effect Background */}
                <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />

                {/* Header */}
                <div className="sticky top-0 z-20 flex items-center justify-between p-4 bg-gray-900/80 backdrop-blur-md border-b border-white/5">
                    <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                        <Zap className="w-5 h-5 text-orange-400" />
                        Rapport Poids/Puissance
                    </h2>
                    <button 
                        onClick={onClose}
                        className="p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors"
                    >
                        <X className="w-5 h-5 text-white/70" />
                    </button>
                </div>

                <div className="p-6 space-y-8">
                    
                    {/* 1. Score & Hero Metric */}
                    <div className="grid grid-cols-2 gap-4">
                        {/* Score Gauge */}
                        <div className="col-span-1 bg-white/5 rounded-2xl p-4 border border-white/5 flex flex-col items-center justify-center relative overflow-hidden">
                             <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-transparent" />
                             <span className="text-sm text-white/60 mb-1 relative z-10">Ton Score</span>
                             <div className="relative z-10 flex items-end gap-1">
                                <span className="text-4xl font-bold text-white">{score}</span>
                                <span className="text-sm text-white/40 mb-1">/100</span>
                             </div>
                             {/* Simple Progress Bar at bottom */}
                             <div className="w-full h-1.5 bg-white/10 rounded-full mt-3 relative z-10 overflow-hidden">
                                <motion.div 
                                    initial={{ width: 0 }}
                                    animate={{ width: `${score}%` }}
                                    transition={{ duration: 1, delay: 0.2 }}
                                    className="h-full bg-gradient-to-r from-orange-500 to-red-500"
                                />
                             </div>
                        </div>

                        {/* Best Ratio */}
                        <div className="col-span-1 bg-white/5 rounded-2xl p-4 border border-white/5 flex flex-col items-center justify-center relative overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent" />
                            <span className="text-sm text-white/60 mb-1 relative z-10">Meilleur Ratio</span>
                             <div className="relative z-10 flex items-end gap-1">
                                <span className="text-3xl font-bold text-white">{bestRatio?.ratio || '--'}</span>
                                <span className="text-sm text-white/40 mb-1">x PDC</span>
                             </div>
                             <span className="text-[10px] text-white/40 mt-1 text-center truncate w-full px-1 relative z-10">
                                {bestRatio?.exercise || 'Aucune donnée'}
                             </span>
                        </div>
                    </div>

                    {/* 2. Sprinty Section */}
                    <div className="relative">
                        <div className="flex gap-4">
                            {/* Sprinty Avatar */}
                            <div className="flex-shrink-0 flex flex-col items-center justify-end">
                                <motion.div 
                                    animate={{ 
                                        y: [0, -5, 0],
                                        scale: [1, 1.05, 1]
                                    }}
                                    transition={{ 
                                        repeat: Infinity, 
                                        duration: 3,
                                        ease: "easeInOut" 
                                    }}
                                    className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-400 to-red-500 p-0.5 shadow-lg shadow-orange-500/20"
                                >
                                    <div className="w-full h-full rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center">
                                        <SprintyIcon className="w-7 h-7 text-white" />
                                    </div>
                                </motion.div>
                            </div>

                            {/* Speech Bubble */}
                            <motion.div 
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.3 }}
                                className="flex-1 bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl rounded-tl-none p-4 relative"
                            >
                                <div className="absolute top-0 left-0 -translate-x-2 translate-y-4 w-4 h-4 bg-white/10 transform rotate-45 border-l border-b border-white/10" /> {/* Tail */}
                                <h4 className="text-orange-400 text-xs font-bold uppercase tracking-wider mb-1">Conseil de Sprinty</h4>
                                {adviceLoading ? (
                                    <div className="space-y-2 animate-pulse">
                                        <div className="h-2 bg-white/10 rounded w-3/4"></div>
                                        <div className="h-2 bg-white/10 rounded w-1/2"></div>
                                    </div>
                                ) : (
                                    <p className="text-sm text-white/90 leading-relaxed">
                                        {advice?.conseils?.[0] || "Continue de t'entraîner régulièrement pour voir ton ratio s'améliorer !"}
                                    </p>
                                )}
                            </motion.div>
                        </div>
                    </div>

                    {/* 3. Evolution Graph */}
                    <div className="bg-white/5 rounded-3xl p-5 border border-white/5">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-sm font-medium text-white/80 flex items-center gap-2">
                                <TrendingUp className="w-4 h-4 text-blue-400" />
                                Évolution Ratio ({bestRatio?.exercise || 'Global'})
                            </h3>
                        </div>
                        
                        <div className="h-48 w-full">
                            {graphData.length > 1 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={graphData}>
                                        <defs>
                                            <linearGradient id="colorRatio" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
                                        <XAxis 
                                            dataKey="date" 
                                            stroke="rgba(255,255,255,0.3)" 
                                            tick={{fontSize: 10}} 
                                            tickLine={false}
                                            axisLine={false}
                                        />
                                        <YAxis 
                                            stroke="rgba(255,255,255,0.3)" 
                                            tick={{fontSize: 10}} 
                                            tickLine={false}
                                            axisLine={false}
                                            domain={['dataMin - 0.2', 'dataMax + 0.2']}
                                        />
                                        <Tooltip 
                                            contentStyle={{ backgroundColor: '#1f2937', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px', fontSize: '12px' }}
                                            itemStyle={{ color: '#fff' }}
                                        />
                                        <Area 
                                            type="monotone" 
                                            dataKey="ratio" 
                                            stroke="#3b82f6" 
                                            strokeWidth={2}
                                            fillOpacity={1} 
                                            fill="url(#colorRatio)" 
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center text-white/30">
                                    <Activity className="w-8 h-8 mb-2 opacity-50" />
                                    <span className="text-xs">Pas assez de données pour le graphique</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* 4. Detailed Stats / Objectives */}
                    {advice?.objectifs && advice.objectifs.length > 0 && (
                        <div className="bg-white/5 rounded-3xl p-5 border border-white/5">
                             <div className="flex items-center justify-between mb-4">
                                <h3 className="text-sm font-medium text-white/80 flex items-center gap-2">
                                    <Target className="w-4 h-4 text-green-400" />
                                    Objectifs Recommandés
                                </h3>
                            </div>
                            <ul className="space-y-3">
                                {advice.objectifs.map((obj, idx) => (
                                    <li key={idx} className="flex items-start gap-3 text-sm text-white/70">
                                        <div className="w-1.5 h-1.5 rounded-full bg-green-500 mt-1.5 flex-shrink-0" />
                                        <span>{obj}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                </div>
            </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default PowerWeightModal;
