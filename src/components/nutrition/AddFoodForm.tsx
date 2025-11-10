// src/components/nutrition/AddFoodForm.tsx
import React from 'react';

interface AddFoodFormProps {
  onClose: () => void;
}

const AddFoodForm: React.FC<AddFoodFormProps> = ({ onClose }) => {
  return (
    <div className="p-4 fixed inset-0 bg-light-background dark:bg-dark-background z-50">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Ajouter un Repas</h1>
        <button onClick={onClose} className="p-2">✕</button>
      </div>
      <p>Le formulaire pour ajouter un repas sera implémenté ici.</p>
    </div>
  );
};

export default AddFoodForm;
