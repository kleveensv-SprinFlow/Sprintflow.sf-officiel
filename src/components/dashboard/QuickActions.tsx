import React from 'react';
import { Bed, Scale, Users } from 'lucide-react';
import { View } from '../../types';

interface QuickActionsProps {
  onViewChange: (view: View) => void;
}

export function QuickActions({ onViewChange }: QuickActionsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <button
        onClick={() => onViewChange('add-bodycomp')}
        className="bg-primary-600 hover:bg-primary-700 p-6 rounded-lg transition-all duration-200 text-white text-left flex flex-col justify-between"
      >
        <div>
          <Scale className="h-8 w-8 mb-2" />
          <h3 className="text-lg font-semibold">Ma pesée du jour</h3>
        </div>
        <p className="text-white/80 text-sm mt-2">Enregistrer votre poids</p>
      </button>
      
      <button
        onClick={() => onViewChange('add-sleep')}
        className="bg-secondary-600 hover:bg-secondary-700 p-6 rounded-lg transition-all duration-200 text-white text-left flex flex-col justify-between"
      >
        <div>
          <Bed className="h-8 w-8 mb-2" />
          <h3 className="text-lg font-semibold">Saisie du sommeil</h3>
        </div>
        <p className="text-white/80 text-sm mt-2">Qualifier votre nuit</p>
      </button>
      
      <button
        onClick={() => onViewChange('groups')}
        className="bg-green-600 hover:bg-green-700 p-6 rounded-lg transition-all duration-200 text-white text-left flex flex-col justify-between"
      >
        <div>
          <Users className="h-8 w-8 mb-2" />
          <h3 className="text-lg font-semibold">Groupe</h3>
        </div>
        <p className="text-white/80 text-sm mt-2">Voir le chat et les membres</p>
      </button>
    </div>
  );
}