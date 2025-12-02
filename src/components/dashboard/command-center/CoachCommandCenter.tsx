// src/components/dashboard/command-center/CoachCommandCenter.tsx
import React, { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import { KPIGrid } from './KPIGrid';
import { ActionGrid } from './ActionGrid';
import { OperationalView } from './OperationalView';
import { CommandCenterData } from './types';
import { Loader2, PlusCircle } from 'lucide-react';

interface CoachCommandCenterProps {
  // Signature mise à jour pour accepter les paramètres de navigation
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onNavigate: (view: string, params?: any) => void;
}

export const CoachCommandCenter: React.FC<CoachCommandCenterProps> = ({ onNavigate }) => {
  const [data, setData] = useState<CommandCenterData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: rpcData, error: rpcError } = await supabase. rpc('get_coach_command_center_data');
        if (rpcError) throw rpcError;
        setData(rpcData as CommandCenterData);
      } catch (err) {
        console.error('Error fetching command center data:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleActionClick = (type: 'wellness' | 'validation') => {
    // Navigate to the appropriate view to handle these actions
    if (type === 'wellness') {
      // Navigation vers athlètes avec filtre santé
      onNavigate('athletes', { filter: 'wellness' });
    } else {
      // Navigation vers validation queue
      onNavigate('validation');
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-gray-400">
        <Loader2 className="animate-spin mb-2" size={32} />
        <span className="text-sm">Chargement du Cockpit...</span>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-4 text-center">
        <div className="bg-red-50 text-red-600 p-4 rounded-xl">
          <p className="font-bold">Erreur de chargement</p>
          <p className="text-sm mt-1">{error || "Données indisponibles"}</p>
        </div>
      </div>
    );
  }

  // Determine if it's a "Zero Data" state (Onboarding case)
  // Logic: No next up items AND 0 planned athletes
  const isZeroData = (! data.next_up || data.next_up.length === 0) && (data.presence?. planned === 0);

  return (
    <div className="p-4 max-w-lg mx-auto pb-24">
      
      {/* 1. Header is minimal now (handled by parent or just title) */}
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
          Cockpit
        </h1>
        <p className="text-xs text-gray-500 uppercase tracking-wider font-medium">
          {new Date(). toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
        </p>
      </div>

      {/* 2. Top KPIs - On transmet onNavigate pour le "Smart Links" */}
      <KPIGrid 
        presence={data.presence}
        health={data.health}
        load={data.load}
        onNavigate={onNavigate}
      />

      {/* 3.  Operational Context (Center) */}
      {isZeroData ?  (
        <div className="mb-6">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white px-1 mb-2">
            À vous de jouer
          </h2>
          <button 
            onClick={() => onNavigate('planning')}
            className="w-full p-8 bg-gradient-to-br from-gray-900 to-gray-800 dark:from-black dark:to-gray-900 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-800 text-center relative overflow-hidden group hover:shadow-xl transition-shadow"
          >
            {/* Background decoration */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-sprint-primary/10 rounded-full blur-2xl -mr-10 -mt-10" />
            
            <div className="relative z-10 flex flex-col items-center gap-3">
              <div className="p-3 bg-white/10 rounded-full text-white mb-1 group-hover:scale-110 transition-transform duration-200">
                <PlusCircle size={32} />
              </div>
              <h3 className="text-xl font-bold text-white leading-tight">
                Votre tableau de bord est vide. 
              </h3>
              <p className="text-sm text-gray-400 max-w-[200px] mx-auto">
                Lancez la machine en créant votre première séance. 
              </p>
              <div className="mt-2 px-4 py-2 bg-white text-black text-sm font-bold rounded-full shadow-lg">
                Créer ma première séance
              </div>
            </div>
          </button>
        </div>
      ) : (
        <OperationalView nextUp={data.next_up} onNavigate={onNavigate} />
      )}

      {/* 4. Action Buttons (Bottom) */}
      <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-3">
        Actions Requises
      </h2>
      <ActionGrid 
        actions={data.actions} 
        onActionClick={handleActionClick} 
      />

    </div>
  );
};