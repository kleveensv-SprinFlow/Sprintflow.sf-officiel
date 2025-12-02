// src/components/dashboard/command-center/CoachCommandCenter.tsx
import React, { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import { KPIGrid } from './KPIGrid';
import { ActionGrid } from './ActionGrid';
import { OperationalView } from './OperationalView';
import { CommandCenterData } from './types';
import { Loader2 } from 'lucide-react';

interface CoachCommandCenterProps {
  onNavigate: (view: string) => void;
}

export const CoachCommandCenter: React.FC<CoachCommandCenterProps> = ({ onNavigate }) => {
  const [data, setData] = useState<CommandCenterData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: rpcData, error: rpcError } = await supabase.rpc('get_coach_command_center_data');
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
    // For now, we route to 'athletes' for wellness and 'planning' for validation
    // or we could have specific dedicated views.
    if (type === 'wellness') {
      onNavigate('athletes'); // Or specific wellness monitoring view
    } else {
      onNavigate('planning'); // Or specific validation queue
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

  return (
    <div className="p-4 max-w-lg mx-auto pb-24">
      
      {/* 1. Header is minimal now (handled by parent or just title) */}
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
          Cockpit
        </h1>
        <p className="text-xs text-gray-500 uppercase tracking-wider font-medium">
          {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
        </p>
      </div>

      {/* 2. Top KPIs */}
      <KPIGrid 
        presence={data.presence}
        health={data.health}
        load={data.load}
      />

      {/* 3. Operational Context (Center) */}
      <OperationalView nextUp={data.next_up} />

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
