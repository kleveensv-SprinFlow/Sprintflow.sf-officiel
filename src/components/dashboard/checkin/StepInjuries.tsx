import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BodyMap } from '../../common/BodyMap/BodyMap.tsx';
import { InjuryGauge } from './InjuryGauge.tsx';
import { RotateCcw } from 'lucide-react';
import useAuth from '../../../hooks/useAuth.tsx';

export interface InjuryRecord {
  id: string; // zoneId
  name: string;
  painLevel: number;
  view: 'front' | 'back';
}

interface StepInjuriesProps {
  injuries: InjuryRecord[];
  setInjuries: React.Dispatch<React.SetStateAction<InjuryRecord[]>>;
}

export const StepInjuries: React.FC<StepInjuriesProps> = ({ injuries, setInjuries }) => {
  const { profile } = useAuth();
  const [view, setView] = useState<'front' | 'back'>('front');

  const toggleZone = (zoneId: string, zoneName: string) => {
    setInjuries(prev => {
      const exists = prev.find(i => i.id === zoneId);
      if (exists) {
        // Remove if exists (toggle off behavior? Or maybe just focus it?)
        // User asked: "si sélectionne une deuxième zone alors il y a simplement une deuxième barre"
        // Implicitly, clicking again might remove or just focus. Let's make it toggle for now.
        return prev.filter(i => i.id !== zoneId);
      } else {
        // Add new
        return [...prev, { id: zoneId, name: zoneName, painLevel: 3, view }];
      }
    });
  };

  const updatePainLevel = (id: string, level: number) => {
    setInjuries(prev => prev.map(i => i.id === id ? { ...i, painLevel: level } : i));
  };

  const removeInjury = (id: string) => {
    setInjuries(prev => prev.filter(i => i.id !== id));
  };

  return (
    <div className="flex flex-col h-full">
      <div className="text-center mb-4 px-4">
        <h3 className="font-bold text-xl text-light-title dark:text-dark-title">
          Blessures & Douleurs
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Touchez les zones douloureuses sur le corps.
        </p>
      </div>

      <div className="flex flex-1 overflow-hidden relative">
        {/* Left Side: Body Map */}
        <div className="w-1/2 h-full flex flex-col items-center justify-center relative">
           <div className="absolute top-0 right-4 z-10">
              <button 
                onClick={() => setView(v => v === 'front' ? 'back' : 'front')}
                className="bg-white dark:bg-gray-700 shadow-md p-2 rounded-full text-gray-600 dark:text-gray-300 hover:text-primary transition-colors border border-gray-100 dark:border-white/10"
              >
                <RotateCcw size={20} />
              </button>
           </div>
           
           <div className="h-[50vh] w-full flex items-center justify-center">
             <AnimatePresence mode='wait'>
                <motion.div
                    key={view}
                    initial={{ opacity: 0, rotateY: view === 'front' ? -90 : 90 }}
                    animate={{ opacity: 1, rotateY: 0 }}
                    exit={{ opacity: 0, rotateY: view === 'front' ? 90 : -90 }}
                    transition={{ duration: 0.3 }}
                    className="h-full w-full flex items-center justify-center"
                >
                    <BodyMap 
                        gender={profile?.sexe || 'homme'} 
                        view={view}
                        selectedZones={injuries.map(i => i.id)}
                        onZoneToggle={toggleZone}
                        className="h-full max-h-[400px]"
                    />
                </motion.div>
             </AnimatePresence>
           </div>
        </div>

        {/* Right Side / Bottom: Gauges List */}
        {/* On mobile, this layout might need column structure. Let's make it responsive. */}
        <div className="absolute bottom-0 left-0 right-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-t border-gray-100 dark:border-white/10 max-h-[35vh] overflow-y-auto rounded-t-2xl p-4 shadow-neumorphic-up">
            <h4 className="text-xs font-bold uppercase text-gray-400 mb-2 sticky top-0 bg-transparent">Zones signalées ({injuries.length})</h4>
            
            {injuries.length === 0 ? (
                <div className="text-center py-8 text-gray-400 text-sm">
                    Aucune douleur signalée.<br/>Tout va bien ?
                </div>
            ) : (
                <div className="space-y-2 pb-4">
                    <AnimatePresence>
                        {injuries.map(injury => (
                            <InjuryGauge 
                                key={injury.id}
                                zoneName={injury.name}
                                painLevel={injury.painLevel}
                                onChange={(val) => updatePainLevel(injury.id, val)}
                                onRemove={() => removeInjury(injury.id)}
                            />
                        ))}
                    </AnimatePresence>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};
