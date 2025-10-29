import React, { useState, useEffect } from 'react';
import { X, Save, Loader2, AlertCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface EditAthleticDataModalProps {
  currentProfileData: {
    date_de_naissance: string | null;
    taille_cm: number | null;
    taille_derniere_modif: string | null;
    sexe: 'homme' | 'femme' | null;
    discipline: string | null;
  };
  onClose: () => void;
  onSaved: () => void;
}

export function EditAthleticDataModal({ currentProfileData, onClose, onSaved }: EditAthleticDataModalProps) {
  const [formData, setFormData] = useState({
    dateNaissance: currentProfileData.date_de_naissance || '',
    taille: currentProfileData.taille_cm?.toString() || '',
    sexe: currentProfileData.sexe || '',
    discipline: currentProfileData.discipline || '',
  });
  
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isTailleBlocked, setIsTailleBlocked] = useState(false);
  const [nextModifDate, setNextModifDate] = useState<string | null>(null);

  useEffect(() => {
    checkTailleModification();
  }, [currentProfileData.taille_derniere_modif]);

  const checkTailleModification = () => {
    if (!currentProfileData.taille_derniere_modif) return;
    const lastModif = new Date(currentProfileData.taille_derniere_modif);
    const daysSinceLastModif = (new Date().getTime() - lastModif.getTime()) / (1000 * 3600 * 24);
    if (daysSinceLastModif < 30) {
      setIsTailleBlocked(true);
      const nextDate = new Date(lastModif);
      nextDate.setDate(nextDate.getDate() + 30);
      setNextModifDate(nextDate.toLocaleDateString('fr-FR'));
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    setError(null);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Non authentifié');

      const updates: any = {
        sexe: formData.sexe || null,
        discipline: formData.discipline || null,
      };

      if (formData.taille && !isTailleBlocked) {
        const tailleNum = parseInt(formData.taille);
        if (isNaN(tailleNum) || tailleNum < 100 || tailleNum > 250) throw new Error('La taille doit être entre 100 et 250 cm');
        updates.taille_cm = tailleNum;
        updates.taille_derniere_modif = new Date().toISOString();
      }

      const { error: updateError } = await supabase.from('profiles').update(updates).eq('id', user.id);
      if (updateError) throw updateError;
      onSaved();
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la sauvegarde');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full">
        <div className="p-6 border-b dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Données Athlétiques</h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"><X className="w-6 h-6" /></button>
          </div>
        </div>
        
        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Discipline Principale</label>
            <select name="discipline" value={formData.discipline} onChange={handleInputChange} className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500">
              <option value="">Non spécifiée</option>
              <option value="sprint">Sprint</option>
              <option value="sauts">Sauts</option>
              <option value="lancers">Lancers</option>
              <option value="demi-fond">Demi-fond / Fond</option>
            </select>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Sexe</label>
              <select name="sexe" value={formData.sexe} onChange={handleInputChange} className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500">
                <option value="">Non spécifié</option>
                <option value="homme">Homme</option>
                <option value="femme">Femme</option>
              </select>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Taille (cm)</label>
            <input type="number" name="taille" value={formData.taille} onChange={handleInputChange} disabled={isTailleBlocked} className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 disabled:opacity-50" placeholder="175" />
            {isTailleBlocked && (
              <div className="mt-2 flex items-start gap-2 p-3 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg">
                <AlertCircle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-orange-700 dark:text-orange-300">Modification possible tous les 30 jours. Prochaine le : {nextModifDate}</p>
              </div>
            )}
          </div>

          {error && <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3"><p className="text-sm text-red-600 dark:text-red-400">{error}</p></div>}
        </div>

        <div className="p-6 bg-gray-50 dark:bg-gray-800/50 border-t dark:border-gray-700 flex gap-3">
          <button onClick={onClose} disabled={isSaving} className="flex-1 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white py-2 px-4 rounded-lg disabled:opacity-50 transition-colors">Annuler</button>
          <button onClick={handleSave} disabled={isSaving} className="flex-1 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg disabled:opacity-50 transition-colors">
            {isSaving ? <><Loader2 className="w-4 h-4 animate-spin" /> Enregistrement...</> : <><Save className="w-4 h-4" /> Enregistrer</>}
          </button>
        </div>
      </div>
    </div>
  );
}