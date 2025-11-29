import React, { useState, useEffect } from 'react';
import { WorkoutBlock, WorkoutRound, WorkoutBlockConfig } from '../../../types/workout';
import { Timer, Zap, RotateCcw, Play, StickyNote, Plus, Trash2, ArrowDown } from 'lucide-react';

interface SmartWorkoutBuilderProps {
  initialBlock: WorkoutBlock;
  onUpdate: (updatedBlock: WorkoutBlock) => void;
}

// Temporary extended interface if needed, but we'll try to stick to the types
// We assume the block passed has rounds and config or we initialize them.

export const SmartWorkoutBuilder: React.FC<SmartWorkoutBuilderProps> = ({ initialBlock, onUpdate }) => {
  // Ensure we have a valid config and rounds array even if the incoming block doesn't have them yet
  const [block, setBlock] = useState<WorkoutBlock>(() => ({
    ...initialBlock,
    rounds: initialBlock.rounds || [],
    config: initialBlock.config || {
      show_distance: true,
      show_duration: false,
      show_reps_count: false,
      show_intensity: true,
      show_weight: false,
      show_recovery: true,
      show_target_time: true,
      show_start_type: false,
      show_notes: false
    }
  }));

  // Synchroniser avec le parent si besoin
  useEffect(() => {
    onUpdate(block);
  }, [block, onUpdate]);

  // --- 1. LOGIQUE DE CONFIGURATION (TOGGLES) ---
  const toggleConfig = (key: keyof WorkoutBlockConfig) => {
    if (!block.config) return;

    setBlock(prev => ({
      ...prev,
      config: {
        ...prev.config!, // We know it exists because of initialization
        [key]: !prev.config![key]
      }
    }));
  };

  // --- 2. GESTION DES DONNÉES (CRUD LIGNES) ---
  const updateRound = (roundId: string, field: keyof WorkoutRound, value: string | number | undefined) => {
    if (!block.rounds) return;

    setBlock(prev => ({
      ...prev,
      rounds: prev.rounds!.map(r => r.id === roundId ? { ...r, [field]: value } : r)
    }));
  };

  const addRound = () => {
    const rounds = block.rounds || [];
    const lastRound = rounds.length > 0 ? rounds[rounds.length - 1] : null;

    const newRound: WorkoutRound = {
      id: crypto.randomUUID(),
      // Copier les valeurs de la dernière ligne pour gagner du temps (Smart Default)
      distance: lastRound?.distance || 0,
      intensity_value: lastRound?.intensity_value,
      intensity_type: 'percent',
      recovery_time: lastRound?.recovery_time,
      target_time: lastRound?.target_time,
      start_type: lastRound?.start_type || 'standing',
      notes: ''
    };
    
    setBlock(prev => ({ ...prev, rounds: [...(prev.rounds || []), newRound] }));
  };

  const removeRound = (roundId: string) => {
    if (!block.rounds) return;
    setBlock(prev => ({ ...prev, rounds: prev.rounds!.filter(r => r.id !== roundId) }));
  };

  // "Fonction Magique" : Appliquer la valeur de la ligne 1 à toutes les lignes
  const propagateFirstRow = (field: keyof WorkoutRound) => {
    if (!block.rounds || block.rounds.length === 0) return;
    const valueToCopy = block.rounds[0][field];
    
    setBlock(prev => ({
      ...prev,
      rounds: prev.rounds!.map(r => ({ ...r, [field]: valueToCopy }))
    }));
  };

  // --- 3. CALCUL DYNAMIQUE DE LA GRILLE (CSS GRID) ---
  const getGridTemplate = () => {
    const config = block.config!;
    // Colonne Index fixe + Actions fixe
    let columns = "40px"; // Index
    
    // Colonnes dynamiques selon la config
    if (config.show_distance) columns += " 1fr";
    if (config.show_intensity) columns += " 1fr";
    if (config.show_target_time) columns += " 1fr";
    if (config.show_recovery) columns += " 1fr";
    if (config.show_start_type) columns += " 120px"; // Plus large pour le select
    if (config.show_notes) columns += " 2fr"; // Large pour le texte

    columns += " 40px"; // Bouton supprimer
    return columns;
  };

  if (!block.config) return null; // Should not happen with initialization

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700">
      
      {/* --- TOOLBAR DE CONFIGURATION --- */}
      <div className="flex gap-2 mb-4 pb-4 border-b border-gray-200 dark:border-gray-700 overflow-x-auto scrollbar-hide">
        <ConfigToggle 
          active={block.config.show_target_time} 
          onClick={() => toggleConfig('show_target_time')} 
          label="Chrono Cible" icon={<Timer size={14} />} 
        />
        <ConfigToggle 
          active={block.config.show_intensity} 
          onClick={() => toggleConfig('show_intensity')} 
          label="Intensité" icon={<Zap size={14} />} 
        />
        <ConfigToggle 
          active={block.config.show_recovery} 
          onClick={() => toggleConfig('show_recovery')} 
          label="Récup" icon={<RotateCcw size={14} />} 
        />
        <ConfigToggle 
          active={block.config.show_start_type} 
          onClick={() => toggleConfig('show_start_type')} 
          label="Départ" icon={<Play size={14} />} 
        />
        <ConfigToggle 
          active={block.config.show_notes} 
          onClick={() => toggleConfig('show_notes')} 
          label="Notes" icon={<StickyNote size={14} />} 
        />
      </div>

      {/* --- EN-TÊTES DE LA GRILLE --- */}
      <div className="grid gap-2 mb-2 items-center text-xs font-semibold text-gray-500 uppercase select-none"
           style={{ gridTemplateColumns: getGridTemplate() }}>
        
        <div className="text-center">#</div>
        
        {block.config.show_distance && <div>Distance (m)</div>}
        
        {block.config.show_intensity && (
          <div className="flex items-center gap-1 group cursor-pointer hover:text-sprint-primary transition-colors" onClick={() => propagateFirstRow('intensity_value')}>
            Intensité <ArrowDown size={10} className="opacity-0 group-hover:opacity-100" />
          </div>
        )}
        
        {block.config.show_target_time && (
           <div className="flex items-center gap-1 group cursor-pointer hover:text-sprint-primary transition-colors" onClick={() => propagateFirstRow('target_time')}>
             Chrono <ArrowDown size={10} className="opacity-0 group-hover:opacity-100" />
           </div>
        )}
        
        {block.config.show_recovery && (
           <div className="flex items-center gap-1 group cursor-pointer hover:text-sprint-primary transition-colors" onClick={() => propagateFirstRow('recovery_time')}>
             Récup <ArrowDown size={10} className="opacity-0 group-hover:opacity-100" />
           </div>
        )}
        
        {block.config.show_start_type && <div>Départ</div>}
        {block.config.show_notes && <div>Notes</div>}
        
        <div>{/* Action vide */}</div>
      </div>

      {/* --- LIGNES DE DONNÉES --- */}
      <div className="space-y-2">
        {(block.rounds || []).map((round, index) => (
          <div key={round.id} className="grid gap-2 items-center" style={{ gridTemplateColumns: getGridTemplate() }}>
            
            {/* Index */}
            <div className="flex items-center justify-center w-6 h-6 bg-gray-100 dark:bg-gray-700 rounded-full text-xs text-gray-500 dark:text-gray-400">
              {index + 1}
            </div>

            {/* Distance */}
            {block.config!.show_distance && (
              <input 
                type="number" 
                className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded px-2 py-1 text-sm focus:ring-2 focus:ring-sprint-primary/20 focus:border-sprint-primary outline-none transition-all"
                value={round.distance || ''}
                onChange={(e) => updateRound(round.id, 'distance', parseFloat(e.target.value))}
                placeholder="m"
              />
            )}

            {/* Intensité */}
            {block.config!.show_intensity && (
              <div className="relative">
                <input 
                  type="number" 
                  className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded px-2 py-1 text-sm focus:ring-2 focus:ring-sprint-primary/20 focus:border-sprint-primary outline-none transition-all"
                  value={round.intensity_value || ''}
                  onChange={(e) => updateRound(round.id, 'intensity_value', parseFloat(e.target.value))}
                  placeholder="%"
                />
                <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-gray-400">%</span>
              </div>
            )}

            {/* Chrono Cible */}
            {block.config!.show_target_time && (
              <input 
                type="text" 
                className="w-full bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded px-2 py-1 text-sm font-mono text-blue-600 dark:text-blue-400 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                value={round.target_time || ''}
                onChange={(e) => updateRound(round.id, 'target_time', e.target.value)}
                placeholder="00.00"
              />
            )}

            {/* Récupération */}
            {block.config!.show_recovery && (
              <input 
                type="text" // ou number selon préférence
                className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded px-2 py-1 text-sm focus:ring-2 focus:ring-sprint-primary/20 focus:border-sprint-primary outline-none transition-all"
                value={round.recovery_time || ''}
                onChange={(e) => updateRound(round.id, 'recovery_time', e.target.value)}
                placeholder="R:"
              />
            )}

            {/* Start Type (Select) */}
            {block.config!.show_start_type && (
              <select 
                className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded px-2 py-1 text-xs focus:ring-2 focus:ring-sprint-primary/20 focus:border-sprint-primary outline-none transition-all"
                value={round.start_type || 'standing'}
                onChange={(e) => updateRound(round.id, 'start_type', e.target.value)}
              >
                <option value="standing">Debout</option>
                <option value="block">Block</option>
                <option value="flying">Lancé</option>
                <option value="crouch">Accroupi</option>
              </select>
            )}

            {/* Notes */}
            {block.config!.show_notes && (
              <input 
                type="text"
                className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded px-2 py-1 text-sm focus:ring-2 focus:ring-sprint-primary/20 focus:border-sprint-primary outline-none transition-all"
                value={round.notes || ''}
                onChange={(e) => updateRound(round.id, 'notes', e.target.value)}
                placeholder="..."
              />
            )}

            {/* Bouton Supprimer */}
            <button 
              onClick={() => removeRound(round.id)}
              className="flex items-center justify-center w-6 h-6 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
              title="Supprimer la ligne"
            >
              <Trash2 size={14} />
            </button>
          </div>
        ))}
      </div>

      {/* --- FOOTER : AJOUT RAPIDE --- */}
      <button 
        onClick={addRound}
        className="mt-4 w-full py-2 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-gray-500 hover:border-sprint-gold hover:text-sprint-gold transition-all text-sm font-medium flex items-center justify-center gap-2 group"
      >
        <Plus size={16} className="group-hover:scale-110 transition-transform" />
        Ajouter une répétition
      </button>
    </div>
  );
};

// Petit composant helper pour les boutons de config
const ConfigToggle = ({ active, onClick, label, icon }: { active: boolean, onClick: () => void, label: string, icon: React.ReactNode }) => (
  <button
    onClick={onClick}
    className={`
      flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap border
      ${active 
        ? 'bg-sprint-gold text-white border-sprint-gold shadow-sm' 
        : 'bg-gray-50 dark:bg-gray-800 text-gray-500 border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700'}
    `}
  >
    <span>{icon}</span>
    {label}
  </button>
);

export default SmartWorkoutBuilder;
