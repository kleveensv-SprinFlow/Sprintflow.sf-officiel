import React, { useState, useMemo, useEffect } from 'react';
import { useGroups } from '../../hooks/useGroups';
import { X, Search } from 'lucide-react';

interface AthleteSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (athlete: { id: string; name: string }) => void;
}

export const AthleteSelectionModal: React.FC<AthleteSelectionModalProps> = ({ isOpen, onClose, onSelect }) => {
  const { coachAthletes, loading } = useGroups();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredAthletes = useMemo(() => {
    if (!coachAthletes) return [];
    return coachAthletes.filter(athlete => {
      const fullName = `${athlete.first_name || ''} ${athlete.last_name || ''}`.trim();
      return fullName.toLowerCase().includes(searchTerm.toLowerCase());
    }).sort((a, b) => {
      const nameA = `${a.first_name || ''} ${a.last_name || ''}`.trim();
      const nameB = `${b.first_name || ''} ${b.last_name || ''}`.trim();
      return nameA.localeCompare(nameB);
    });
  }, [coachAthletes, searchTerm]);

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
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex justify-center items-center"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md m-4 max-h-[80vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        <header className="p-4 border-b dark:border-gray-700 flex justify-between items-center shrink-0">
          <h2 className="text-xl font-bold">Sélectionner un Athlète</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">
            <X size={24} />
          </button>
        </header>

        <div className="p-4 shrink-0">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Rechercher un athlète..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
            />
          </div>
        </div>

        <div className="overflow-y-auto px-4 pb-4">
          {loading ? (
            <p className="text-center py-8">Chargement...</p>
          ) : filteredAthletes.length > 0 ? (
            <ul className="space-y-2">
              {filteredAthletes.map(athlete => {
                const fullName = `${athlete.first_name || ''} ${athlete.last_name || ''}`.trim();
                return (
                  <li key={athlete.id}>
                    <button
                      onClick={() => onSelect({ id: athlete.id, name: fullName })}
                      className="w-full text-left px-4 py-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                      {fullName}
                    </button>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="text-center text-gray-500 py-8">Aucun athlète trouvé.</p>
          )}
        </div>
      </div>
    </div>
  );
};
