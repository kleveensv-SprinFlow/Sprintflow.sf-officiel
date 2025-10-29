import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, User, Mail, Lock, UserPlus, LogIn, ArrowLeft } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';

// Détection dynamique des vidéos dans le dossier public/videos
const videoModules = import.meta.glob('/public/videos/*');
const allVideos = Object.keys(videoModules).map(path => path.replace('/public', ''));

export default function Auth() {
  const { signIn, signUp } = useAuth();
  const [videos, setVideos] = useState<string[]>([]);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [isLogin, setIsLogin] = useState(true);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [showResendConfirmation, setShowResendConfirmation] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resendEmail, setResendEmail] = useState('');
  const [resetSent, setResetSent] = useState(false);
  const [resendSent, setResendSent] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    role: 'athlete' as 'athlete' | 'encadrant',
    role_specifique: '',
    discipline: '',
    sexe: ''
  });

  // Fonction pour mélanger un tableau (algorithme de Fisher-Yates)
  // Fonction pour mélanger un tableau (algorithme de Fisher-Yates)
  const shuffleArray = (array: string[], lastItem?: string): string[] => {
    let currentIndex = array.length, randomIndex;
    const newArray = [...array];

    while (currentIndex !== 0) {
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;
      [newArray[currentIndex], newArray[randomIndex]] = [
        newArray[randomIndex], newArray[currentIndex]];
    }

    // S'assure que le premier élément de la nouvelle liste n'est pas le même que le dernier de l'ancienne
    if (lastItem && newArray[0] === lastItem && newArray.length > 1) {
      const firstElement = newArray.shift();
      if (firstElement) {
        newArray.push(firstElement);
      }
    }
    
    return newArray;
  };

  useEffect(() => {
    setVideos(shuffleArray(allVideos));
  }, []);

  useEffect(() => {
    if (videos.length === 0) return;
    const videoElement = document.getElementById(`video-player-${currentVideoIndex}`) as HTMLVideoElement;
    if (videoElement) {
      videoElement.play().catch(error => console.error("Video play failed:", error));
    }
  }, [currentVideoIndex, videos]);

  const handleVideoEnded = () => {
    const nextIndex = currentVideoIndex + 1;
    if (nextIndex >= videos.length) {
      const lastVideo = videos[videos.length - 1];
      setVideos(shuffleArray(allVideos, lastVideo));
      setCurrentVideoIndex(0);
    } else {
      setCurrentVideoIndex(nextIndex);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setAuthError(null);

    try {
      if (isLogin) {
        await signIn(formData.email, formData.password);
      } else {
        const { data, error } = await signUp(
          formData.email,
          formData.password,
          {
            first_name: formData.firstName,
            last_name: formData.lastName,
            role: formData.role,
            role_specifique: formData.role_specifique,
          }
        );

        if (error) throw error;

        if (data.user) {
          alert('✅ Inscription réussie !\n\n📧 IMPORTANT : Un email de confirmation a été envoyé à ' + formData.email + '\n\nVous devez cliquer sur le lien dans cet email pour activer votre compte.\n\n⚠️ Vérifiez également vos spams si vous ne voyez pas l\'email dans les 5 minutes.\n\n💡 Si vous ne recevez pas l\'email, vous pourrez le renvoyer depuis l\'écran de connexion.');
        }
      }
    } catch (error: any) {
      console.error('Erreur auth:', error);
      setAuthError(error.message || 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail.trim()) return;

    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;

      setResetSent(true);
    } catch (error: any) {
      console.error('Erreur reset password:', error);
      alert(error.message || 'Erreur lors de l\'envoi du lien de réinitialisation');
    } finally {
      setLoading(false);
    }
  };

  const resetForgotPasswordState = () => {
    setShowForgotPassword(false);
    setResetSent(false);
    setResetEmail('');
  };

  const handleResendConfirmation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resendEmail.trim()) return;

    setLoading(true);
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: resendEmail,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/confirm`
        }
      });

      if (error) throw error;

      setResendSent(true);
    } catch (error: any) {
      console.error('Erreur renvoi confirmation:', error);
      alert(error.message || 'Erreur lors du renvoi de l\'email de confirmation');
    } finally {
      setLoading(false);
    }
  };

  const resetResendState = () => {
    setShowResendConfirmation(false);
    setResendSent(false);
    setResendEmail('');
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  // Interface de renvoi d'email de confirmation
  if (showResendConfirmation) {
    return (
      <div className="relative min-h-screen flex items-center justify-center p-4 overflow-hidden">
        {videos.map((video, index) => (
          <video
            key={video}
            id={`video-${index}`}
            className={`absolute top-0 left-0 w-full h-full object-cover transition-opacity duration-1000 ${index === currentVideoIndex ? 'opacity-100' : 'opacity-0'}`}
            src={video}
            autoPlay
            muted
            onEnded={handleVideoEnded}
            playsInline
          />
        ))}
        <div className="absolute top-0 left-0 w-full h-full bg-black bg-opacity-50 backdrop-blur-sm"></div>
        <div className="relative z-10 max-w-md w-full bg-white/10 backdrop-blur-lg rounded-2xl shadow-xl p-8 border border-white/20">
          <div className="flex items-center mb-6">
            <button
              onClick={resetResendState}
              className="absolute top-4 left-4 p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-white" />
            </button>
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-white">Renvoyer l'email de confirmation</h1>
            </div>
          </div>

          {!resendSent ? (
            <>
              <p className="text-white/80 text-center mb-6">
                Vous n'avez pas reçu l'email de confirmation ? Entrez votre adresse email pour le recevoir à nouveau.
              </p>

              <form onSubmit={handleResendConfirmation} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">
                    Adresse email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50 w-5 h-5" />
                    <input
                      type="email"
                      value={resendEmail}
                      onChange={(e) => setResendEmail(e.target.value)}
                      required
                      className="w-full pl-10 pr-4 py-3 bg-white/20 border border-white/30 rounded-lg text-white placeholder-white/50 focus:ring-2 focus:ring-orange-400 focus:border-transparent"
                      placeholder="votre@email.com"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading || !resendEmail.trim()}
                  className="w-full bg-gradient-to-r from-blue-500 to-orange-500 text-white py-3 px-4 rounded-lg font-semibold hover:from-blue-600 hover:to-orange-600 focus:ring-2 focus:ring-orange-400 focus:ring-offset-2 focus:ring-offset-black/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-all duration-300 transform hover:scale-105"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <Mail className="w-5 h-5 mr-2" />
                      Renvoyer l'email
                    </>
                  )}
                </button>
              </form>
            </>
          ) : (
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="text-xl font-bold text-white mb-4">Email envoyé !</h2>
              <p className="text-white/80 mb-6">
                Un nouvel email de confirmation a été envoyé à <strong>{resendEmail}</strong>.
                Vérifiez votre boîte mail et suivez les instructions.
              </p>
              <p className="text-sm text-white/60 mb-6">
                N'oubliez pas de vérifier vos spams !
              </p>
              <button
                onClick={resetResendState}
                className="w-full bg-gradient-to-r from-blue-500 to-orange-500 text-white py-3 px-4 rounded-lg font-semibold hover:from-blue-600 hover:to-orange-600 transition-colors"
              >
                Retour à la connexion
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Interface de récupération de mot de passe
  if (showForgotPassword) {
    return (
      <div className="relative min-h-screen flex items-center justify-center p-4 overflow-hidden">
        {videos.map((video, index) => (
          <video
            key={video}
            id={`video-${index}`}
            className={`absolute top-0 left-0 w-full h-full object-cover transition-opacity duration-1000 ${index === currentVideoIndex ? 'opacity-100' : 'opacity-0'}`}
            src={video}
            autoPlay
            muted
            onEnded={handleVideoEnded}
            playsInline
          />
        ))}
        <div className="absolute top-0 left-0 w-full h-full bg-black bg-opacity-50 backdrop-blur-sm"></div>
        <div className="relative z-10 max-w-md w-full bg-white/10 backdrop-blur-lg rounded-2xl shadow-xl p-8 border border-white/20">
          {/* Header avec retour */}
          <div className="flex items-center mb-6">
            <button
              onClick={resetForgotPasswordState}
              className="absolute top-4 left-4 p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-white" />
            </button>
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-white">Mot de passe oublié</h1>
            </div>
          </div>

          {!resetSent ? (
            <>
              <p className="text-white/80 text-center mb-6">
                Entrez votre adresse email pour recevoir un lien de réinitialisation de votre mot de passe.
              </p>

              <form onSubmit={handlePasswordReset} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">
                    Adresse email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50 w-5 h-5" />
                    <input
                      type="email"
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      required
                      className="w-full pl-10 pr-4 py-3 bg-white/20 border border-white/30 rounded-lg text-white placeholder-white/50 focus:ring-2 focus:ring-orange-400 focus:border-transparent"
                      placeholder="votre@email.com"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading || !resetEmail.trim()}
                  className="w-full bg-gradient-to-r from-blue-500 to-orange-500 text-white py-3 px-4 rounded-lg font-semibold hover:from-blue-600 hover:to-orange-600 focus:ring-2 focus:ring-orange-400 focus:ring-offset-2 focus:ring-offset-black/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-all duration-300 transform hover:scale-105"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <Mail className="w-5 h-5 mr-2" />
                      Envoyer le lien
                    </>
                  )}
                </button>
              </form>
            </>
          ) : (
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="text-xl font-bold text-white mb-4">Email envoyé !</h2>
              <p className="text-white/80 mb-6">
                Un lien de réinitialisation a été envoyé à <strong>{resetEmail}</strong>.
                Vérifiez votre boîte mail et suivez les instructions.
              </p>
              <button
                onClick={resetForgotPasswordState}
                className="w-full bg-gradient-to-r from-blue-500 to-orange-500 text-white py-3 px-4 rounded-lg font-semibold hover:from-blue-600 hover:to-orange-600 transition-colors"
              >
                Retour à la connexion
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center p-4 overflow-hidden">
      {videos.map((video, index) => (
        <video
          key={video}
          id={`video-${index}`}
          className={`absolute top-0 left-0 w-full h-full object-cover transition-opacity duration-1000 ${index === currentVideoIndex ? 'opacity-100' : 'opacity-0'}`}
          src={video}
          autoPlay
          muted
          onEnded={handleVideoEnded}
          playsInline
        />
      ))}
      <div className="absolute top-0 left-0 w-full h-full bg-black bg-opacity-50 backdrop-blur-sm"></div>
      <div className="relative z-10 max-w-md w-full bg-white/10 backdrop-blur-lg rounded-2xl shadow-xl p-8 border border-white/20">
        {/* Logo et titre */}
        <div className="text-center mb-8">
          <img src="/logo%20sans%20fond.png" alt="SprintFlow Logo" className="w-24 h-24 mx-auto mb-4" />
          <h1 className="text-4xl font-bold text-white tracking-wider">SprintFlow</h1>
          <p className="text-white/80 mt-2">
            {isLogin ? 'Connectez-vous à votre compte' : 'Créez votre compte'}
          </p>
        </div>

        {/* Formulaire */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Champs inscription uniquement */}
          {!isLogin && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="firstName-input" className="block text-sm font-medium text-white/80 mb-2">
                    Prénom
                  </label>
                  <input
                    id="firstName-input"
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-lg text-white placeholder-white/50 focus:ring-2 focus:ring-orange-400 focus:border-transparent"
                    placeholder="Votre prénom"
                  />
                </div>
                <div>
                  <label htmlFor="lastName-input" className="block text-sm font-medium text-white/80 mb-2">
                    Nom
                  </label>
                  <input
                    id="lastName-input"
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-lg text-white placeholder-white/50 focus:ring-2 focus:ring-orange-400 focus:border-transparent"
                    placeholder="Votre nom"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="role-select" className="block text-sm font-medium text-white/80 mb-2">
                  Je suis...
                </label>
                <select
                  id="role-select"
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-lg text-white focus:ring-2 focus:ring-orange-400 focus:border-transparent"
                >
                  <option value="athlete">Un(e) Athlète</option>
                  <option value="encadrant">Un(e) Encadrant(e)</option>
                </select>
              </div>

              {formData.role === 'encadrant' && (
                <div>
                  <label htmlFor="role-specifique-select" className="block text-sm font-medium text-white/80 mb-2">
                    Spécialité
                  </label>
                  <select
                    id="role-specifique-select"
                    name="role_specifique"
                    value={formData.role_specifique}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-lg text-white focus:ring-2 focus:ring-orange-400 focus:border-transparent"
                  >
                    <option value="">Sélectionnez votre spécialité...</option>
                    <option value="Coach">Coach</option>
                    <option value="Kinésithérapeute">Kinésithérapeute</option>
                    <option value="Nutritionniste">Nutritionniste</option>
                    <option value="Préparateur Physique">Préparateur Physique</option>
                  </select>
                </div>
              )}
              <div>
                <label htmlFor="discipline-select" className="block text-sm font-medium text-white/80 mb-2">
                  Discipline
                </label>
                <select
                  id="discipline-select"
                  name="discipline"
                  value={formData.discipline}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-lg text-white focus:ring-2 focus:ring-orange-400 focus:border-transparent"
                >
                  <option value="">Non spécifiée</option>
                  <option value="sprint">Sprint</option>
                  <option value="sauts">Sauts</option>
                  <option value="lancers">Lancers</option>
                  <option value="demi-fond">Demi-fond / Fond</option>
                </select>
              </div>
              <div>
                <label htmlFor="sexe-select" className="block text-sm font-medium text-white/80 mb-2">
                  Sexe
                </label>
                <select
                  id="sexe-select"
                  name="sexe"
                  value={formData.sexe}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-lg text-white focus:ring-2 focus:ring-orange-400 focus:border-transparent"
                >
                  <option value="">Non spécifié</option>
                  <option value="homme">Homme</option>
                  <option value="femme">Femme</option>
                </select>
              </div>
            </>
          )}

          {/* Email */}
          <div>
            <label htmlFor="email-input" className="block text-sm font-medium text-white/80 mb-2">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50 w-5 h-5" />
              <input
                id="email-input"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                className="w-full pl-10 pr-4 py-3 bg-white/20 border border-white/30 rounded-lg text-white placeholder-white/50 focus:ring-2 focus:ring-orange-400 focus:border-transparent"
                placeholder="votre@email.com"
              />
            </div>
          </div>

          {/* Mot de passe */}
          <div>
            <label htmlFor="password-input" className="block text-sm font-medium text-white/80 mb-2">
              Mot de passe
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50 w-5 h-5" />
              <input
                id="password-input"
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                required
                className="w-full pl-10 pr-12 py-3 bg-white/20 border border-white/30 rounded-lg text-white placeholder-white/50 focus:ring-2 focus:ring-orange-400 focus:border-transparent"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/50 hover:text-white"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Affichage de l'erreur */}
          {authError && (
            <div className="text-red-400 text-center text-sm font-medium p-2 mb-4 bg-red-900/50 rounded-lg">
              {authError}
            </div>
          )}

          {/* Bouton submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-500 to-orange-500 text-white py-3 px-4 rounded-lg font-semibold hover:from-blue-600 hover:to-orange-600 focus:ring-2 focus:ring-orange-400 focus:ring-offset-2 focus:ring-offset-black/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-all duration-300 transform hover:scale-105"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                {isLogin ? <LogIn className="w-5 h-5 mr-2" /> : <UserPlus className="w-5 h-5 mr-2" />}
                {isLogin ? 'Se connecter' : 'Créer un compte'}
              </>
            )}
          </button>
        </form>

        {/* Basculer entre connexion/inscription */}
        <div className="mt-6 text-center space-y-3">
          {isLogin && (
            <>
              <button
                onClick={() => setShowForgotPassword(true)}
                className="text-orange-400 hover:text-orange-300 font-medium block w-full transition-colors"
              >
                Mot de passe oublié ?
              </button>
              <button
                onClick={() => setShowResendConfirmation(true)}
                className="text-orange-400 hover:text-orange-300 font-medium block w-full transition-colors"
              >
                Renvoyer l'email de confirmation
              </button>
            </>
          )}
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-blue-400 hover:text-blue-300 font-medium block w-full transition-colors"
          >
            {isLogin
              ? "Pas encore de compte ? Créez-en un"
              : "Déjà un compte ? Connectez-vous"
            }
          </button>
        </div>
      </div>
    </div>
  );
}