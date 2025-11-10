// src/components/wellness/SleepForm.tsx
import React from 'react';

interface SleepFormProps {
  onClose: () => void;
}

const SleepForm: React.FC<SleepFormProps> = ({ onClose }) => {
  return (
    <div className="p-4 fixed inset-0 bg-light-background dark:bg-dark-background z-50">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Saisir le Sommeil</h1>
        <button onClick={onClose} className="p-2">✕</button>
      </div>
      <p>Le formulaire pour saisir les données de sommeil sera implémenté ici.</p>
    </div>
  );
};

export default SleepForm;
