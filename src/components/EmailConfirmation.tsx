import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';

export default function EmailConfirmation() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const handleEmailConfirmation = async () => {
      console.log('📧 [EmailConfirmation] Début de la confirmation...');

      try {
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = hashParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token');
        const type = hashParams.get('type');

        console.log('🔍 [EmailConfirmation] Paramètres détectés:', {
          hasAccessToken: !!accessToken,
          hasRefreshToken: !!refreshToken,
          type,
        });

        if (type === 'signup' && accessToken && refreshToken) {
          console.log('✅ [EmailConfirmation] Paramètres valides, création de session...');

          const { data, error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });

          if (error) {
            console.error('❌ [EmailConfirmation] Erreur setSession:', error);
            throw error;
          }

          console.log('✅ [EmailConfirmation] Session créée:', data?.session?.user?.id);

          setStatus('success');
          setMessage('Votre email a été confirmé avec succès !');

          setTimeout(() => {
            console.log('🔄 [EmailConfirmation] Redirection vers dashboard...');
            window.location.href = '/';
          }, 3000);
        } else {
          console.error('❌ [EmailConfirmation] Paramètres manquants ou invalides');
          throw new Error('Lien de confirmation invalide ou expiré. Veuillez demander un nouvel email de confirmation.');
        }
      } catch (error: any) {
        console.error('❌ [EmailConfirmation] Erreur confirmation email:', error);
        setStatus('error');
        setMessage(error.message || 'Une erreur est survenue lors de la confirmation de votre email.');
      }
    };

    handleEmailConfirmation();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center">
          {status === 'loading' && (
            <>
              <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Loader2 className="w-16 h-16 text-indigo-600 animate-spin" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Confirmation en cours...
              </h1>
              <p className="text-gray-600">
                Veuillez patienter pendant que nous confirmons votre email.
              </p>
            </>
          )}

          {status === 'success' && (
            <>
              <div className="w-16 h-16 mx-auto mb-4">
                <CheckCircle className="w-16 h-16 text-green-500" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Confirmation réussie !
              </h1>
              <p className="text-gray-600 mb-6">
                {message}
              </p>
              <p className="text-sm text-gray-500">
                Vous allez être redirigé automatiquement...
              </p>
            </>
          )}

          {status === 'error' && (
            <>
              <div className="w-16 h-16 mx-auto mb-4">
                <XCircle className="w-16 h-16 text-red-500" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Erreur de confirmation
              </h1>
              <p className="text-gray-600 mb-6">
                {message}
              </p>
              <button
                onClick={() => window.location.href = '/'}
                className="w-full bg-indigo-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-indigo-700 transition-colors"
              >
                Retour à l'accueil
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
