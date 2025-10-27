import React, { useState } from 'react';
import { X, AlertTriangle, Trash2, Loader2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface DeleteAccountModalProps {
  onClose: () => void;
}

export function DeleteAccountModal({ onClose }: DeleteAccountModalProps) {
  const [step, setStep] = useState(1);
  const [confirmText, setConfirmText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFirstConfirm = () => {
    setStep(2);
  };

  const handleFinalDelete = async () => {
    if (confirmText !== 'SUPPRIMER') {
      setError('Vous devez taper exactement "SUPPRIMER" pour confirmer');
      return;
    }

    setIsDeleting(true);
    setError(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Non authentifié');

      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const response = await fetch(`${supabaseUrl}/functions/v1/delete-user-account`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur lors de la suppression');
      }

      await supabase.auth.signOut();
      window.location.href = '/';
    } catch (err: any) {
      console.error('Erreur suppression compte:', err);
      setError(err.message || 'Erreur lors de la suppression du compte');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6">
        {step === 1 ? (
          <>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-6 h-6 text-red-600" />
                <h3 className="text-xl font-bold text-red-600 dark:text-red-500">Supprimer mon compte</h3>
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 rounded-lg p-4">
                <p className="text-red-800 dark:text-red-300 font-medium mb-3">
                  ⚠️ Êtes-vous absolument sûr ?
                </p>
                <p className="text-sm text-red-700 dark:text-red-400 mb-2">
                  Cette action est <strong>définitive</strong> et <strong>irréversible</strong>.
                </p>
                <p className="text-sm text-red-700 dark:text-red-400">
                  Toutes vos données seront <strong>supprimées définitivement</strong> :
                </p>
                <ul className="text-sm text-red-700 dark:text-red-400 mt-2 ml-4 list-disc space-y-1">
                  <li>Votre profil et informations personnelles</li>
                  <li>Tous vos entraînements et records</li>
                  <li>Vos données de composition corporelle</li>
                  <li>Votre historique de sommeil et nutrition</li>
                  <li>Vos messages et conversations</li>
                  <li>Tous vos objectifs et analyses</li>
                </ul>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleFirstConfirm}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white py-3 px-4 rounded-lg font-medium transition-colors"
                >
                  Oui, je veux supprimer mon compte
                </button>
                <button
                  onClick={onClose}
                  className="flex-1 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white py-3 px-4 rounded-lg font-medium transition-colors"
                >
                  Non, annuler
                </button>
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Trash2 className="w-6 h-6 text-red-600" />
                <h3 className="text-xl font-bold text-red-600 dark:text-red-500">Confirmation finale</h3>
              </div>
              <button
                onClick={onClose}
                disabled={isDeleting}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 disabled:opacity-50"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 rounded-lg p-4">
                <p className="text-red-800 dark:text-red-300 font-medium mb-2">
                  🔒 Pour confirmer définitivement, tapez le mot :
                </p>
                <p className="text-2xl font-bold text-red-600 dark:text-red-500 text-center my-4">
                  SUPPRIMER
                </p>
              </div>

              <div>
                <input
                  type="text"
                  value={confirmText}
                  onChange={(e) => {
                    setConfirmText(e.target.value);
                    setError(null);
                  }}
                  placeholder="Tapez SUPPRIMER ici"
                  className="w-full px-4 py-3 text-center text-lg font-medium rounded-lg border-2 border-red-300 dark:border-red-700 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500"
                  disabled={isDeleting}
                />
              </div>

              {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
                  <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleFinalDelete}
                  disabled={confirmText !== 'SUPPRIMER' || isDeleting}
                  className="flex-1 flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white py-3 px-4 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isDeleting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Suppression en cours...
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-5 h-5" />
                      Valider la suppression
                    </>
                  )}
                </button>
                <button
                  onClick={onClose}
                  disabled={isDeleting}
                  className="flex-1 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white py-3 px-4 rounded-lg font-medium disabled:opacity-50 transition-colors"
                >
                  Annuler
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
