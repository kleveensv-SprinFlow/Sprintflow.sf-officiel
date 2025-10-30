import React, { useState } from 'react';
import { X } from 'lucide-react';
import useAuth from '../../hooks/useAuth';
import { useCoachLinks } from '../../hooks/useCoachLinks';
import { Profile } from '../../types';

interface AssignWorkoutModalProps {
  onClose: () => void;
  onAssign: (athleteIds: string[], date: string, notes: string) => void;
}

export const AssignWorkoutModal: React.FC<AssignWorkoutModalProps> = ({ onClose, onAssign }) => {
  const { user } = useAuth();
  const { linkedAthletes, loading } = useCoachLinks(user?.id);
  const [selectedAthletes, setSelectedAthletes] = useState<string[]>([]);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');

  const handleToggleAthlete = (athleteId: string) => {
    setSelectedAthletes(prev => 
      prev.includes(athleteId) 
        ? prev.filter(id => id !== athleteId) 
        : [...prev, athleteId]
    );
  };

  const handleAssign = () => {
    if (selectedAthletes.length === 0) {
      alert("Veuillez sélectionner au moins un athlète.");
      return;
    }
    onAssign(selectedAthletes, date, notes);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md m-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Assigner la Séance</h2>
          <button onClick={onClose}><X className="w-6 h-6" /></button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Athlètes</label>
            {loading ? <p>Chargement...</p> : (
              <div className="max-h-40 overflow-y-auto border rounded-lg p-2">
                {linkedAthletes.map(athlete => (
                  <div key={athlete.id} className="flex items-center gap-2">
                    <input 
                      type="checkbox" 
                      id={`athlete-${athlete.id}`}
                      checked={selectedAthletes.includes(athlete.id)}
                      onChange={() => handleToggleAthlete(athlete.id)}
                    />
                    <label htmlFor={`athlete-${athlete.id}`}>{athlete.first_name} {athlete.last_name}</label>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div>
            <label htmlFor="assign-date" className="block text-sm font-medium mb-1">Date</label>
            <input 
              type="date" 
              id="assign-date"
              value={date}
              onChange={e => setDate(e.target.value)}
              className="w-full p-2 border rounded-lg"
            />
          </div>
          <div>
            <label htmlFor="assign-notes" className="block text-sm font-medium mb-1">Notes / Instructions</label>
            <textarea
              id="assign-notes"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              rows={3}
              className="w-full p-2 border rounded-lg"
            />
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 rounded-lg border">Annuler</button>
          <button onClick={handleAssign} className="px-4 py-2 rounded-lg bg-blue-600 text-white">Assigner</button>
        </div>
      </div>
    </div>
  );
};
