import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Loader2, X } from 'lucide-react';
import useAuth from '../../hooks/useAuth'; // <-- IMPORT AJOUTÉ
import { toast } from 'react-toastify'; // Ajout pour notifications

interface EditProfileModalProps {
  currentProfileData: any;
  onClose: () => void;
  onSaved: () => void; // onSaved est toujours utile pour fermer la modale
}

export function EditProfileModal({ currentProfileData, onClose, onSaved }: EditProfileModalProps) {
  const { user, refreshProfile } = useAuth(); // <-- ON RÉCUPÈRE refreshProfile
  const [formData, setFormData] = useState({
    first_name: currentProfileData.first_name || '',
    last_name: currentProfileData.last_name || '',
    date_de_naissance: currentProfileData.date_de_naissance || '',
    sexe: currentProfileData.sexe || '',
    height: currentProfileData.height || '',
    discipline: currentProfileData.discipline || '',
    license_number: currentProfileData.license_number || '',
  });
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
        toast.error("Utilisateur non authentifié.");
        return;
    }
    setLoading(true);

    try {
      const updates = {
        ...formData,
        height: formData.height ? parseInt(String(formData.height), 10) : null,
      };

      console.log('📝 [EditProfileModal] Mise à jour du profil avec:', updates);

      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id)
        .select()
        .maybeSingle();

      if (error) {
        console.error('❌ [EditProfileModal] Erreur Supabase:', error);
        throw error;
      }

      if (!data) {
        throw new Error('Aucune donnée retournée après la mise à jour');
      }

      console.log('✅ [EditProfileModal] Profil mis à jour dans Supabase:', data);

      // Rafraîchir le contexte global pour synchroniser les données
      await refreshProfile();

      toast.success("Profil mis à jour avec succès !");

      // Fermer la modale et recharger
      onSaved();

    } catch (err: any) {
      console.error("❌ [EditProfileModal] Erreur complète:", err);
      toast.error(err.message || "Erreur lors de la mise à jour du profil.");
    } finally {
      setLoading(false);
    }
  };

  // Le JSX reste identique
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 dark:hover:text-gray-200">
          <X className="w-6 h-6" />
        </button>
        <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Modifier le profil</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Prénom</label>
              <input type="text" name="first_name" value={formData.first_name} onChange={handleInputChange} className="w-full mt-1 p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Nom</label>
              <input type="text" name="last_name" value={formData.last_name} onChange={handleInputChange} className="w-full mt-1 p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Date de naissance</label>
            <input type="date" name="date_de_naissance" value={formData.date_de_naissance} onChange={handleInputChange} className="w-full mt-1 p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Sexe</label>
            <select name="sexe" value={formData.sexe} onChange={handleInputChange} className="w-full mt-1 p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white">
              <option value="">Sélectionner</option>
              <option value="homme">Homme</option>
              <option value="femme">Femme</option>
              <option value="autre">Autre</option>
            </select>
          </div>
          {currentProfileData.role === 'athlete' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Taille (cm)</label>
                <input type="number" name="height" value={formData.height} onChange={handleInputChange} className="w-full mt-1 p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Discipline</label>
                <input type="text" name="discipline" value={formData.discipline} onChange={handleInputChange} className="w-full mt-1 p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
              </div>
            </>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">N° de License (optionnel)</label>
            <input type="text" name="license_number" value={formData.license_number} onChange={handleInputChange} className="w-full mt-1 p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
          </div>

          <div className="flex justify-end space-x-4 mt-6">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded bg-gray-200 dark:bg-gray-600 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-500">Annuler</button>
            <button type="submit" disabled={loading} className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2">
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              Sauvegarder
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}