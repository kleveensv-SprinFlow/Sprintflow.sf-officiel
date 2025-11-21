import React from 'react';
import { supabase } from '../../lib/supabase';
import { useNavigate } from 'react-router-dom';

export function SettingsPage() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Erreur lors de la déconnexion:', error);
    } else {
      navigate('/login'); // Rediriger vers la page de connexion
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Paramètres</h1>
      <p className="text-gray-500 mb-8">Gérez vos préférences et votre compte.</p>
      
      <div className="space-y-4">
        {/* Autres paramètres à venir */}
        
        <button 
          onClick={handleLogout}
          className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-4 rounded-lg transition-colors shadow-md"
        >
          Déconnexion
        </button>
      </div>
    </div>
  );
}

export default SettingsPage;
