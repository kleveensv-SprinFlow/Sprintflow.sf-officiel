import React, { useState, useEffect } from 'react';
import { WorkoutBlock, WorkoutRound, WorkoutBlockConfig } from '../../../types/workout';
import { Timer, Zap, RotateCcw, Play, StickyNote, Plus, Trash2, ArrowDown } from 'lucide-react';

interface SmartWorkoutBuilderProps {
  initialBlock: WorkoutBlock;
  onUpdate?: (updatedBlock: WorkoutBlock) => void;
  readOnly?: boolean;
}

// Temporary extended interface if needed, but we'll try to stick to the types
// We assume the block passed has rounds and config or we initialize them.

export const SmartWorkoutBuilder: React.FC<SmartWorkoutBuilderProps> = ({ initialBlock, onUpdate, readOnly = false }) => {
  // Ensure we have a valid config and rounds array even if the incoming block doesn't have them yet
  const [block, setBlock] = useState<WorkoutBlock>(() => {
    // Handling Note Block which doesn't use config/rounds the same way
    if (initialBlock.type === 'note') {
      return initialBlock;
    }

    return {
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
    };
  });

  // Synchroniser avec le parent si besoin
  useEffect(() => {
    if (onUpdate && !readOnly) {
      onUpdate(block);
    }
  }, [block, onUpdate, readOnly]);

  // --- 1. LOGIQUE DE CONFIGURATION (TOGGLES) ---
  const toggleConfig = (key: keyof WorkoutBlockConfig) => {
    if (!block.config || readOnly) return;

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
    if (!block.rounds || readOnly) return;

    setBlock(prev => ({
      ...prev,
      rounds: prev.rounds!.map(r => r.id === roundId ? { ...r, [field]: value } : r)
    }));
  };

  const addRound = () => {
    if (readOnly) return;
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
    if (!block.rounds || readOnly) return;
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
    if (block.type === 'universal') columns += " 1.5fr"; // Colonne métrique large (Phase 3)
    if (config.show_intensity) columns += " 1fr";
    if (config.show_target_time) columns += " 1fr";
    if (config.show_recovery) columns += " 1fr";
    if (config.show_start_type) columns += " 120px"; // Plus large pour le select
    if (config.show_notes) columns += " 2fr"; // Large pour le texte

    columns += " 40px"; // Bouton supprimer (ou vide en lecture seule)
    return columns;
  };

  if (!block.config && block.type !== 'note') return null; // Should not happen with initialization

  // --- RENDER : BLOC NOTE ---
  if (block.type === 'note') {
    // Cast sécurisé pour accéder à content
    const noteContent = (block as any).content;

    return (
      <div className="bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-900/30 rounded-lg p-3 relative group">
        <div className="flex items-start gap-3">
          <div className="mt-1 text-yellow-500 dark:text-yellow-600">
            <StickyNote size={20} />
          </div>
          {readOnly ? (
            <div className="flex-1 whitespace-pre-wrap text-gray-700 dark:text-gray-300 font-medium font-handwriting py-1">
              {noteContent || "Aucune note."}
            </div>
          ) : (
             <textarea
              className="flex-1 bg-transparent border-none outline-none resize-none text-gray-800 dark:text-gray-200 placeholder-gray-400 font-medium text-lg leading-relaxed"
              rows={3}
              placeholder="Écrire une consigne, un échauffement, ou une pause..."
              value={noteContent || ''}
              onChange={(e) => setBlock(prev => ({ ...prev, content: e.target.value }))}
            />
          )}
        </div>
      </div>
    );
  }

  // --- RENDER : BLOC STANDARD & UNIVERSEL ---
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700">
      
      {/* --- TOOLBAR DE CONFIGURATION --- */}
      {!readOnly && (
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
      )}

      {/* --- EN-TÊTES DE LA GRILLE --- */}
      <div className="overflow-x-auto scrollbar-hide">
        <div className="min-w-[320px]">
          <div className="grid gap-2 mb-2 items-center text-xs font-semibold text-gray-500 uppercase select-none"
               style={{ gridTemplateColumns: getGridTemplate() }}>
            
            <div className="text-center">#</div>
            
            {block.config!.show_distance && <div>Distance (m)</div>}

            {/* UNIVERSAL : Metric Name Header */}
            {block.type === 'universal' && (
              readOnly ? (
                <div>{(block as any).metric_name}</div>
              ) : (
                <div className="relative group">
                  <input
                    type="text"
                    className="w-full bg-transparent border-b border-dashed border-gray-300 dark:border-gray-600 focus:border-sprint-primary outline-none text-xs font-bold uppercase text-gray-600 dark:text-gray-300"
                    value={(block as any).metric_name}
                    onChange={(e) => setBlock(prev => ({ ...prev, metric_name: e.target.value }))}
                    placeholder="Métrique"
                  />
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 text-gray-400">
                    ✏️
                  </div>
                </div>
              )
            )}
            
            {block.config!.show_intensity && (
              <div className={`flex items-center gap-1 group ${!readOnly ? 'cursor-pointer hover:text-sprint-primary transition-colors' : ''}`} onClick={() => propagateFirstRow('intensity_value')}>
                Intensité {!readOnly && <ArrowDown size={10} className="opacity-0 group-hover:opacity-100" />}
              </div>
            )}
            
            {block.config.show_target_time && (
               <div className={`flex items-center gap-1 group ${!readOnly ? 'cursor-pointer hover:text-sprint-primary transition-colors' : ''}`} onClick={() => propagateFirstRow('target_time')}>
                 Chrono {!readOnly && <ArrowDown size={10} className="opacity-0 group-hover:opacity-100" />}
               </div>
            )}
            
            {block.config.show_recovery && (
               <div className={`flex items-center gap-1 group ${!readOnly ? 'cursor-pointer hover:text-sprint-primary transition-colors' : ''}`} onClick={() => propagateFirstRow('recovery_time')}>
                 Récup {!readOnly && <ArrowDown size={10} className="opacity-0 group-hover:opacity-100" />}
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
                  readOnly ? (
                    <div className="text-sm font-medium text-gray-900 dark:text-white px-2 py-1">{round.distance || '-'} m</div>
                  ) : (
                    <input 
                      type="number" 
                      className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded px-2 py-1 text-sm focus:ring-2 focus:ring-sprint-primary/20 focus:border-sprint-primary outline-none transition-all"
                      value={round.distance || ''}
                      onChange={(e) => updateRound(round.id, 'distance', parseFloat(e.target.value))}
                      placeholder="m"
                    />
                  )
                )}

                {/* UNIVERSAL : Performance Input */}
                {block.type === 'universal' && (
                  readOnly ? (
                    <div className="text-sm font-bold text-gray-900 dark:text-white px-2 py-1">{round.performance_value || '-'}</div>
                  ) : (
                    <input
                      type="text"
                      className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded px-2 py-1 text-sm font-bold text-gray-900 dark:text-white focus:ring-2 focus:ring-sprint-primary/20 focus:border-sprint-primary outline-none transition-all"
                      value={round.performance_value || ''}
                      onChange={(e) => updateRound(round.id, 'performance_value', e.target.value)}
                      placeholder="Perf"
                    />
                  )
                )}

                {/* Intensité */}
                {block.config!.show_intensity && (
                  readOnly ? (
                    <div className="text-sm font-medium text-gray-900 dark:text-white px-2 py-1">
                      {round.intensity_value ? `${round.intensity_value}%` : '-'}
                    </div>
                  ) : (
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
                  )
                )}

                {/* Chrono Cible */}
                {block.config!.show_target_time && (
                  readOnly ? (
                     <div className="text-sm font-mono font-medium text-blue-600 dark:text-blue-400 px-2 py-1">
                       {round.target_time || '-'}
                     </div>
                  ) : (
                    <input 
                      type="text" 
                      className="w-full bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded px-2 py-1 text-sm font-mono text-blue-600 dark:text-blue-400 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                      value={round.target_time || ''}
                      onChange={(e) => updateRound(round.id, 'target_time', e.target.value)}
                      placeholder="00.00"
                    />
                  )
                )}

                {/* Récupération */}
                {block.config!.show_recovery && (
                  readOnly ? (
                    <div className="text-sm font-medium text-gray-900 dark:text-white px-2 py-1">
                      {round.recovery_time || '-'}
                    </div>
                  ) : (
                    <input 
                      type="text" // ou number selon préférence
                      className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded px-2 py-1 text-sm focus:ring-2 focus:ring-sprint-primary/20 focus:border-sprint-primary outline-none transition-all"
                      value={round.recovery_time || ''}
                      onChange={(e) => updateRound(round.id, 'recovery_time', e.target.value)}
                      placeholder="R:"
                    />
                  )
                )}

                {/* Start Type (Select) */}
                {block.config!.show_start_type && (
                  readOnly ? (
                    <div className="text-sm font-medium text-gray-900 dark:text-white px-2 py-1">
                      {round.start_type === 'standing' && 'Debout'}
                      {round.start_type === 'block' && 'Block'}
                      {round.start_type === 'flying' && 'Lancé'}
                      {round.start_type === 'crouch' && 'Accroupi'}
                    </div>
                  ) : (
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
                  )
                )}

                {/* Notes */}
                {block.config!.show_notes && (
                  readOnly ? (
                    <div className="text-sm font-medium text-gray-900 dark:text-white px-2 py-1 truncate" title={round.notes}>
                      {round.notes || '-'}
                    </div>
                  ) : (
                    <input 
                      type="text"
                      className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded px-2 py-1 text-sm focus:ring-2 focus:ring-sprint-primary/20 focus:border-sprint-primary outline-none transition-all"
                      value={round.notes || ''}
                      onChange={(e) => updateRound(round.id, 'notes', e.target.value)}
                      placeholder="..."
                    />
                  )
                )}

                {/* Bouton Supprimer */}
                {!readOnly ? (
                  <button 
                    onClick={() => removeRound(round.id)}
                    className="flex items-center justify-center w-6 h-6 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                    title="Supprimer la ligne"
                  >
                    <Trash2 size={14} />
                  </button>
                ) : (
                  <div>{/* Espace vide */}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* --- FOOTER : AJOUT RAPIDE --- */}
      {!readOnly && (
        <button 
          onClick={addRound}
          className="mt-4 w-full py-2 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-gray-500 hover:border-sprint-gold hover:text-sprint-gold transition-all text-sm font-medium flex items-center justify-center gap-2 group"
        >
          <Plus size={16} className="group-hover:scale-110 transition-transform" />
          Ajouter une répétition
        </button>
      )}
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
