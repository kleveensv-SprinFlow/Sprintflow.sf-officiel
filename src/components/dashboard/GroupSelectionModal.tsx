import React, { useEffect } from 'react';
import { useGroups } from '../../hooks/useGroups';
import { X } from 'lucide-react';

interface GroupSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (group: { id: string; name: string; color?: string }) => void;
}

export const GroupSelectionModal: React.FC<GroupSelectionModalProps> = ({ isOpen, onClose, onSelect }) => {
  const { groups, loading } = useGroups();

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-md dark:backdrop-blur-sm z-50 flex justify-center items-center"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md m-4 max-h-[80vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        <header className="p-4 border-b dark:border-gray-700 flex justify-between items-center shrink-0">
          <h2 className="text-xl font-bold">Sélectionner un Groupe</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">
            <X size={24} />
          </button>
        </header>

        <div className="overflow-y-auto px-4 py-4">
          {loading ? (
            <p className="text-center py-8">Chargement...</p>
          ) : groups && groups.length > 0 ? (
            <ul className="space-y-2">
              {groups.map(group => (
                <li key={group.id}>
                  <button
                    onClick={() => onSelect({ id: group.id, name: group.name, color: group.color })}
                    className="w-full text-left px-4 py-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center"
                  >
                    <span 
                      className="w-4 h-4 rounded-full mr-3 shrink-0" 
                      style={{ backgroundColor: group.color || '#9CA3AF' }} // Default gray if no color
                    />
                    <span className="font-medium">{group.name}</span>
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-center text-gray-500 py-8">Aucun groupe trouvé.</p>
          )}
        </div>
      </div>
    </div>
  );
};
