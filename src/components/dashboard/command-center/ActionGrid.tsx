// src/components/dashboard/command-center/ActionGrid.tsx
import React from 'react';
import { CheckSquare, HeartPulse, ArrowRight } from 'lucide-react';
import { ActionKPI } from './types';

interface ActionGridProps {
  actions: ActionKPI;
  onActionClick: (type: 'wellness' | 'validation') => void;
}

export const ActionGrid: React.FC<ActionGridProps> = ({ actions, onActionClick }) => {
  return (
    <div className="grid grid-cols-2 gap-3 mb-6">
      
      {/* 1. Wellness Pending */}
      <button 
        onClick={() => onActionClick('wellness')}
        className="group relative flex flex-col items-start p-4 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-all active:scale-[0.98] duration-200 cursor-pointer"
      >
        <div className="flex justify-between w-full items-start mb-2">
           <div className={`p-2 rounded-xl ${actions.pending_wellness > 0 ? 'bg-orange-50 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400' : 'bg-gray-50 text-gray-400 dark:bg-gray-700'}`}>
              <HeartPulse size={20} />
           </div>
           {actions.pending_wellness > 0 && (
             <span className="flex items-center justify-center w-6 h-6 rounded-full bg-orange-500 text-white text-xs font-bold shadow-sm ring-2 ring-white dark:ring-gray-800">
               {actions.pending_wellness}
             </span>
           )}
        </div>
        
        <div className="text-left">
           <span className="text-2xl font-bold text-gray-900 dark:text-white block">
             {actions.pending_wellness}
           </span>
           <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
             Check-ins manquants
           </span>
        </div>
        
        <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity transform translate-x-2 group-hover:translate-x-0">
           <ArrowRight size={16} className="text-gray-400" />
        </div>
      </button>

      {/* 2. Validation Pending */}
      <button 
        onClick={() => onActionClick('validation')}
        className="group relative flex flex-col items-start p-4 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-all active:scale-[0.98] duration-200 cursor-pointer"
      >
        <div className="flex justify-between w-full items-start mb-2">
           <div className={`p-2 rounded-xl ${actions.pending_review > 0 ? 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400' : 'bg-gray-50 text-gray-400 dark:bg-gray-700'}`}>
              <CheckSquare size={20} />
           </div>
           {actions.pending_review > 0 && (
             <span className="flex items-center justify-center w-6 h-6 rounded-full bg-red-500 text-white text-xs font-bold shadow-sm ring-2 ring-white dark:ring-gray-800">
               {actions.pending_review}
             </span>
           )}
        </div>
        
        <div className="text-left">
           <span className="text-2xl font-bold text-gray-900 dark:text-white block">
             {actions.pending_review}
           </span>
           <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
             Séances à valider
           </span>
        </div>

        <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity transform translate-x-2 group-hover:translate-x-0">
           <ArrowRight size={16} className="text-gray-400" />
        </div>
      </button>

    </div>
  );
};
