// src/components/dashboard/command-center/KPIGrid.tsx
import React from 'react';
import { Users, Activity, TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react';
import { PresenceKPI, HealthKPI, LoadKPI } from './types';

interface KPIGridProps {
  presence: PresenceKPI;
  health: HealthKPI;
  load: LoadKPI;
  // Signature mise à jour pour accepter les paramètres de navigation
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onNavigate: (view: string, params?: any) => void;
}

export const KPIGrid: React.FC<KPIGridProps> = ({ presence, health, load, onNavigate }) => {
  
  // Logic for Health Color
  const isCriticalHealth = (health?.injured ??  0) > 0;
  const isWarningHealth = ! isCriticalHealth && (health?.fatigued ?? 0) > 0;
  
  const healthColor = isCriticalHealth ? 'bg-red-500' : isWarningHealth ? 'bg-orange-500' : 'bg-emerald-500';

  // Load Progress Calculation
  const plannedLoad = load?. planned ?? 0;
  const realizedLoad = load?.realized ?? 0;
  const loadProgress = plannedLoad > 0 ? (realizedLoad / plannedLoad) * 100 : 0;
  
  const cardBaseClass = "w-full text-left bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col justify-between h-32 relative overflow-hidden transition-all hover:shadow-md hover:scale-[1.02] active:scale-[0.98] cursor-pointer focus:outline-none focus:ring-2 focus:ring-sprint-primary focus:ring-offset-2";

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
      
      {/* 1.  PRESENCE -> Athletes View avec filtre 'attendance' */}
      <button 
        onClick={() => onNavigate('athletes', { filter: 'attendance' })}
        className={cardBaseClass}
        aria-label="Voir les athlètes filtrés par présence"
      >
        <div className="flex justify-between items-start z-10 w-full">
          <div className="flex flex-col">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">Présence</span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-3xl font-bold text-gray-900 dark:text-white">{presence?. planned ??  0}</span>
              <span className="text-sm font-medium text-gray-500">athlètes</span>
            </div>
            <span className="text-xs text-gray-400 mt-1">Attendus aujourd'hui</span>
          </div>
          <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-blue-600 dark:text-blue-400">
            <Users size={20} />
          </div>
        </div>
        
        {(presence?.checked_in ?? 0) > 0 && (
           <div className="mt-auto flex items-center gap-1. 5 text-xs font-medium text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 py-1 px-2 rounded-md w-fit z-10">
             <div className="w-1. 5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
             {presence.checked_in} déjà connectés
           </div>
        )}
      </button>

      {/* 2. SANTÉ (Check Engine) -> Athletes View avec filtre 'health' (sera normalisé en 'wellness') */}
      <button 
        onClick={() => onNavigate('athletes', { filter: 'health' })}
        className={cardBaseClass}
        aria-label="Voir les athlètes filtrés par état de santé"
      >
        <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-gray-50 to-transparent dark:from-gray-700 rounded-bl-3xl -mr-2 -mt-2 z-0 opacity-50" />
        
        <div className="flex justify-between items-start z-10 w-full">
           <div className="flex flex-col">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">Santé Équipe</span>
            <div className="mt-2 flex items-center gap-2 flex-wrap">
               {(health?.injured ?? 0) > 0 && (
                 <div className="flex items-center gap-2 px-2 py-1 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-100 dark:border-red-900/50">
                    <AlertTriangle size={14} className="text-red-500" />
                    <span className="text-sm font-bold text-red-600 dark:text-red-400">{health.injured} Blessé{health.injured > 1 ? 's' : ''}</span>
                 </div>
               )}
               {(health?.fatigued ??  0) > 0 && (
                 <div className="flex items-center gap-2 px-2 py-1 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-100 dark:border-orange-900/50">
                    <Activity size={14} className="text-orange-500" />
                    <span className="text-sm font-bold text-orange-600 dark:text-orange-400">{health.fatigued} Fatigué{health. fatigued > 1 ? 's' : ''}</span>
                 </div>
               )}
               
               {(health?. injured ?? 0) === 0 && (health?.fatigued ??  0) === 0 && (
                  <div className="flex items-center gap-2 px-2 py-1 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg border border-emerald-100 dark:border-emerald-900/50">
                     <CheckCircle size={14} className="text-emerald-500" />
                     <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">Tout va bien</span>
                  </div>
               )}
            </div>
          </div>
        </div>
        
        {/* Status Line */}
        <div className={`mt-auto h-1 w-full rounded-full bg-gray-100 dark:bg-gray-700 overflow-hidden`}>
           <div className={`h-full ${healthColor}`} style={{ width: '100%' }} />
        </div>
      </button>

      {/* 3. CHARGE (Pilotage) -> Planning View avec date du jour */}
      <button 
        onClick={() => onNavigate('planning', { date: 'today' })}
        className={cardBaseClass}
        aria-label="Voir le planning de charge hebdomadaire"
      >
         <div className="flex justify-between items-start mb-2 w-full">
          <div className="flex flex-col">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">Charge Hebdo</span>
             <div className="flex items-baseline gap-1 mt-1">
              <span className="text-3xl font-bold text-gray-900 dark:text-white">{Math.round(loadProgress)}%</span>
              <span className="text-sm text-gray-400">réalisée</span>
            </div>
          </div>
          <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg text-purple-600 dark:text-purple-400">
            <TrendingUp size={20} />
          </div>
        </div>

        <div className="w-full mt-auto">
          <div className="flex justify-between text-xs text-gray-400 mb-1">
            <span>{realizedLoad} UA</span>
            <span>Obj.  {plannedLoad} UA</span>
          </div>
          <div className="h-2 w-full bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${Math.min(loadProgress, 100)}%` }}
            />
          </div>
        </div>
      </button>

    </div>
  );
};