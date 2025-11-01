import React from 'react';
import { Calendar, Users, BarChart3, Settings } from 'lucide-react';

const ShortcutsWidget: React.FC = () => {
  const shortcuts = [
    {
      icon: Calendar,
      label: 'Planning',
      description: 'Gérer le calendrier',
      action: () => window.dispatchEvent(new CustomEvent('change-view', { detail: 'planning' })),
      color: 'bg-blue-500',
    },
    {
      icon: Users,
      label: 'Groupes',
      description: 'Gérer les groupes',
      action: () => window.dispatchEvent(new CustomEvent('change-view', { detail: 'groups' })),
      color: 'bg-green-500',
    },
    {
      icon: BarChart3,
      label: 'Statistiques',
      description: 'Voir les stats',
      action: () => alert('Statistiques à venir'),
      color: 'bg-purple-500',
    },
    {
      icon: Settings,
      label: 'Paramètres',
      description: 'Configuration',
      action: () => window.dispatchEvent(new CustomEvent('change-view', { detail: 'profile' })),
      color: 'bg-gray-500',
    },
  ];

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4 text-gray-800">Raccourcis</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {shortcuts.map((shortcut, index) => (
          <button
            key={index}
            onClick={shortcut.action}
            className="flex flex-col items-center p-4 rounded-lg border border-gray-200 hover:border-gray-300 hover:shadow-md transition-all"
          >
            <div className={`${shortcut.color} p-3 rounded-full mb-2`}>
              <shortcut.icon className="w-6 h-6 text-white" />
            </div>
            <span className="font-semibold text-sm text-gray-900">{shortcut.label}</span>
            <span className="text-xs text-gray-500 mt-1">{shortcut.description}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default ShortcutsWidget;
