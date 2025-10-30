import React, { useState } from 'react';

interface RPEModalProps {
  onSave: (rpe: number) => void;
}

export const RPEModal: React.FC<RPEModalProps> = ({ onSave }) => {
  const [rpe, setRpe] = useState(5);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-sm m-4">
        <h2 className="text-xl font-bold mb-4">Comment avez-vous ressenti cette séance ?</h2>
        <p className="text-center text-4xl font-bold my-4">{rpe}</p>
        <div className="space-y-3">
          <div>
            <div className="flex justify-between text-xs text-gray-500">
              <span>Très facile (1)</span>
              <span>Effort max (10)</span>
            </div>
            <input 
              type="range" 
              min="1" 
              max="10" 
              value={rpe} 
              onChange={e => setRpe(parseInt(e.target.value))} 
              className="w-full"
            />
          </div>
        </div>
        <button 
          onClick={() => onSave(rpe)}
          className="mt-6 w-full bg-blue-600 text-white py-2 rounded-lg"
        >
          Enregistrer le RPE
        </button>
      </div>
    </div>
  );
};
