import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Lock, TrendingUp, Activity, Zap } from 'lucide-react';
import { useWellness } from '../../hooks/useWellness';
import useAuth from '../../hooks/useAuth';
import PowerWeightModal from './PowerWeightModal';

interface IndicesPanelProps {
  formIndex: number;
  performanceIndex: number;
  loading?: boolean;
}

const AnimatedNumber = ({ value }: { value: number }) => {
  return (
    <motion.span
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="text-4xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-br from-white to-white/70 dark:from-white dark:to-white/70"
    >
      {value}
    </motion.span>
  );
};

const GlassCard = ({ children, className = '', onClick }: { children: React.ReactNode; className?: string; onClick?: () => void }) => (
  <div 
    onClick={onClick}
    className={`relative overflow-hidden rounded-3xl bg-white/10 backdrop-blur-md border border-white/20 shadow-xl ${className} ${onClick ? 'cursor-pointer active:scale-95 transition-transform duration-200' : ''}`}
  >
    <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
    {children}
  </div>
);

const IndicesPanel: React.FC<IndicesPanelProps> = ({
  formIndex,
  performanceIndex,
  loading = false,
}) => {
  const { user } = useAuth();
  const { wellnessData } = useWellness(user?.id);
  const [isPowerModalOpen, setIsPowerModalOpen] = useState(false);
  
  const today = useMemo(() => new Date().toISOString().split('T')[0], []);
  
  // Check if today's check-in is done
  const isCheckinDone = useMemo(() => 
    wellnessData?.some(log => log.date === today && log.ressenti_sommeil !== null) || false,
    [wellnessData, today]
  );

  return (
    <>
      <div className="grid grid-cols-2 gap-4 w-full">
        {/* Left Card: Form Index */}
        <GlassCard className={`h-40 flex flex-col justify-between p-5 transition-all duration-300 ${!isCheckinDone ? 'brightness-75' : ''}`}>
          {!isCheckinDone ? (
             <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/20 backdrop-blur-sm z-10 text-center p-2">
               <Lock className="w-8 h-8 text-white/80 mb-2" />
               <span className="text-xs font-medium text-white/90">Check-in requis</span>
             </div>
          ) : null}

          <div className="flex justify-between items-start z-0">
              <div className="p-2 rounded-full bg-green-500/20 backdrop-blur-sm">
                  <Activity className="w-5 h-5 text-green-400" />
              </div>
              {isCheckinDone && <TrendingUp className="w-4 h-4 text-green-400/70" />}
          </div>

          <div className="mt-2 z-0">
              <div className="text-sm font-medium text-white/60 mb-1">État de Forme</div>
              <div className="flex items-end gap-2">
                   {isCheckinDone ? (
                      <AnimatedNumber value={formIndex} />
                   ) : (
                      <span className="text-4xl font-bold text-white/20">--</span>
                   )}
                   <span className="text-xs text-white/40 mb-2">/100</span>
              </div>
          </div>
        </GlassCard>

        {/* Right Card: Performance Index */}
        <GlassCard 
          className="h-40 flex flex-col justify-between p-5 bg-gradient-to-br from-orange-500/10 to-red-500/5 hover:from-orange-500/20 hover:to-red-500/10 transition-colors"
          onClick={() => setIsPowerModalOpen(true)}
        >
          <div className="flex justify-between items-start">
               <div className="p-2 rounded-full bg-orange-500/20 backdrop-blur-sm">
                  <Zap className="w-5 h-5 text-orange-400" />
              </div>
          </div>

          <div className="mt-2">
               <div className="text-sm font-medium text-white/60 mb-1">Poids / Puissance</div>
               <div className="flex items-end gap-2">
                  <AnimatedNumber value={performanceIndex} />
                  <span className="text-xs text-white/40 mb-2">/100</span>
               </div>
          </div>
        </GlassCard>
      </div>

      <PowerWeightModal 
        isOpen={isPowerModalOpen} 
        onClose={() => setIsPowerModalOpen(false)} 
        score={performanceIndex}
      />
    </>
  );
};

export default IndicesPanel;
