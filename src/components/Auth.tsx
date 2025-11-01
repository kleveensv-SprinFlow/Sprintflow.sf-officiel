import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, Mail, Lock, UserPlus, LogIn, ArrowLeft, User, Briefcase } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import { SelectionCard } from './common/SelectionCard';
import { CardCarousel } from './common/CardCarousel';

// Détection dynamique des vidéos dans le dossier public/videos
const videoModules = import.meta.glob('/public/videos/*');
const allVideos = Object.keys(videoModules).map(path => path.replace('/public', ''));

interface AuthProps {
  initialError?: string | null;
}

export default function Auth({ initialError }: AuthProps = {}) {
  const { signIn, signUp, resendConfirmationEmail } = useAuth();
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
  const [authError, setAuthError] = useState<string | null>(initialError || null);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    role: 'athlete' as 'athlete' | 'encadrant',
    role_specifique: '',
    discipline: '',
    sexe: '',
    date_de_naissance: '',
    height: '',
  });

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

    if (lastItem && newArray[0] === lastItem && newArray.length > 1) {
      const firstElement = newArray.shift();
      if (firstElement) newArray.push(firstElement);
    }
    
    return newArray;
  };

  useEffect(() => {
    setVideos(shuffleArray(allVideos));
  }, []);

  useEffect(() => {
    if (videos.length === 0) return;
    const videoElement = document.getElementById(`video-${currentVideoIndex}`) as HTMLVideoElement;
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
        // La redirection est gérée par le App.tsx via le hook useAuth
      } else {
        if (formData.password !== formData.confirmPassword) {
          throw new Error("Les mots de passe ne correspondent pas.");
        }
        if (formData.password.length < 6) {
          throw new Error("Le mot de passe doit contenir au moins 6 caractères.");
        }

        // L'appel à signUp gère maintenant la création de l'utilisateur ET du profil.
        // Si cette fonction réussit, le onAuthStateChange du hook useAuth
        // détectera la nouvelle session et l'application redirigera automatiquement.
        await signUp(
          formData.email,
          formData.password,
          {
            first_name: formData.firstName,
            last_name: formData.lastName,
            role: formData.role,
            role_specifique: formData.role_specifique,
            date_de_naissance: formData.date_de_naissance || null,
            discipline: formData.discipline,
            sexe: formData.sexe,
            height: formData.height ? parseInt(formData.height, 10) : null,
          }
        );
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
      await resendConfirmationEmail(resendEmail);
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
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Interface de renvoi d'email de confirmation (conservée si l'option est réactivée)
  if (showResendConfirmation) {
    // ... (code inchangé pour cette partie)
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
            <div className="w-full text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail className="w-8 h-8 text-white" />
                </div>
                <h1 className="text-2xl font-bold text-white">Renvoyer l'email de confirmation</h1>
            </div>
            </div>

            {!resendSent ? (
            <>
                <p className="text-white/80 text-center mb-6">
                Entrez votre adresse email pour recevoir à nouveau l'email de confirmation.
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
                    className="w-full bg-gradient-to-r from-blue-500 to-orange-500 text-white py-3 px-4 rounded-lg font-semibold hover:from-blue-600 hover:to-orange-600 disabled:opacity-50"
                >
                    {loading ? "Envoi..." : "Renvoyer l'email"}
                </button>
                </form>
            </>
            ) : (
            <div className="text-center">
                <h2 className="text-xl font-bold text-white mb-4">Email envoyé !</h2>
                <p className="text-white/80 mb-6">
                Un nouvel email de confirmation a été envoyé à <strong>{resendEmail}</strong>.
                </p>
                <button
                onClick={resetResendState}
                className="w-full bg-gradient-to-r from-blue-500 to-orange-500 text-white py-3 px-4 rounded-lg"
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
    // ... (code inchangé pour cette partie)
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
                onClick={resetForgotPasswordState}
                className="absolute top-4 left-4 p-2 rounded-lg bg-white/10 hover:bg-white/20"
            >
                <ArrowLeft className="w-5 h-5 text-white" />
            </button>
            <div className="w-full text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail className="w-8 h-8 text-white" />
                </div>
                <h1 className="text-2xl font-bold text-white">Mot de passe oublié</h1>
            </div>
            </div>

            {!resetSent ? (
            <>
                <p className="text-white/80 text-center mb-6">
                Entrez votre email pour recevoir un lien de réinitialisation.
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
                        className="w-full pl-10 pr-4 py-3 bg-white/20 border border-white/30 rounded-lg text-white"
                        placeholder="votre@email.com"
                    />
                    </div>
                </div>
                <button
                    type="submit"
                    disabled={loading || !resetEmail.trim()}
                    className="w-full bg-gradient-to-r from-blue-500 to-orange-500 text-white py-3 px-4 rounded-lg"
                >
                    {loading ? "Envoi..." : "Envoyer le lien"}
                </button>
                </form>
            </>
            ) : (
            <div className="text-center">
                <h2 className="text-xl font-bold text-white mb-4">Email envoyé !</h2>
                <p className="text-white/80 mb-6">
                Un lien a été envoyé à <strong>{resetEmail}</strong>.
                </p>
                <button
                onClick={resetForgotPasswordState}
                className="w-full bg-gradient-to-r from-blue-500 to-orange-500 text-white py-3 px-4 rounded-lg"
                >
                Retour
                </button>
            </div>
            )}
        </div>
        </div>
    );
  }

  // L'écran de succès à l'inscription est supprimé car la redirection est maintenant automatique.

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
        <div className="text-center mb-8">
          <img src="/logo%20sans%20fond.png" alt="SprintFlow Logo" className="w-24 h-24 mx-auto mb-4" />
          <h1 className="text-4xl font-bold text-white tracking-wider [text-shadow:0_2px_4px_rgba(0,0,0,0.6)]">SprintFlow</h1>
          <p className="text-white/80 mt-2 [text-shadow:0_1px_3px_rgba(0,0,0,0.5)]">
            {isLogin ? 'Connectez-vous à votre compte' : 'Créez votre compte'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {!isLogin && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <input type="text" name="firstName" value={formData.firstName} onChange={handleInputChange} required className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-lg text-white" placeholder="Prénom" />
                <input type="text" name="lastName" value={formData.lastName} onChange={handleInputChange} required className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-lg text-white" placeholder="Nom" />
              </div>
              <input type="date" name="date_de_naissance" value={formData.date_de_naissance} onChange={handleInputChange} required className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-lg text-white" />
              <div className="grid grid-cols-2 gap-4">
                <SelectionCard label="Athlète" isSelected={formData.role === 'athlete'} onClick={() => setFormData(prev => ({ ...prev, role: 'athlete' }))} icon={<User />} />
                <SelectionCard label="Encadrant" isSelected={formData.role === 'encadrant'} onClick={() => setFormData(prev => ({ ...prev, role: 'encadrant' }))} icon={<Briefcase />} />
              </div>
              {formData.role === 'encadrant' && (
                  <CardCarousel options={[{ value: 'Coach', label: 'Coach' }, { value: 'Kinesitherapeute', label: 'Kinésithérapeute' }, { value: 'Nutritionniste', label: 'Nutritionniste' }, { value: 'Preparateur Physique', label: 'Prép. Physique' }, { value: 'Preparateur Mental', label: 'Prép. Mental' }]} selectedValue={formData.role_specifique} onSelect={value => setFormData(prev => ({ ...prev, role_specifique: value }))} />
              )}
              {formData.role === 'athlete' && (
                <>
                  <input type="number" name="height" value={formData.height} onChange={handleInputChange} className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-lg text-white" placeholder="Taille (cm)" />
                  <CardCarousel options={[{ value: 'sprint', label: 'Sprint' }, { value: 'haies', label: 'Haies' }, { value: 'sauts', label: 'Sauts' }, { value: 'lancers', label: 'Lancers' }, { value: 'demi-fond', label: 'Demi-fond / Fond' }, { value: 'marche', label: 'Marche' }, { value: 'combinees', label: 'Combinées' }]} selectedValue={formData.discipline} onSelect={value => setFormData(prev => ({ ...prev, discipline: value }))} />
                </>
              )}
              <div className="grid grid-cols-3 gap-4">
                <SelectionCard label="Homme" isSelected={formData.sexe === 'homme'} onClick={() => setFormData(prev => ({ ...prev, sexe: 'homme' }))} />
                <SelectionCard label="Femme" isSelected={formData.sexe === 'femme'} onClick={() => setFormData(prev => ({ ...prev, sexe: 'femme' }))} />
                <SelectionCard label="Autre" isSelected={formData.sexe === 'autre'} onClick={() => setFormData(prev => ({ ...prev, sexe: 'autre' }))} />
              </div>
            </>
          )}

          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50 w-5 h-5" />
            <input type="email" name="email" value={formData.email} onChange={handleInputChange} required className="w-full pl-10 pr-4 py-3 bg-white/20 border border-white/30 rounded-lg text-white" placeholder="Email" />
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50 w-5 h-5" />
            <input type={showPassword ? 'text' : 'password'} name="password" value={formData.password} onChange={handleInputChange} required className="w-full pl-10 pr-12 py-3 bg-white/20 border border-white/30 rounded-lg text-white" placeholder="Mot de passe" />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/50"><EyeOff className="w-5 h-5" /></button>
          </div>
          {!isLogin && (
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50 w-5 h-5" />
              <input type={showPassword ? 'text' : 'password'} name="confirmPassword" value={formData.confirmPassword} onChange={handleInputChange} required className="w-full pl-10 pr-12 py-3 bg-white/20 border border-white/30 rounded-lg text-white" placeholder="Confirmer le mot de passe" />
            </div>
          )}

          {authError && (
            <div className="text-center text-sm font-medium p-3 mb-4 bg-red-900/50 rounded-lg">
              <p className="text-red-400">{authError}</p>
              {authError.includes('confirmer votre email') && (
                <button type="button" onClick={() => setShowResendConfirmation(true)} className="mt-2 text-orange-400 hover:text-orange-300 font-semibold underline">
                  Renvoyer l'email de confirmation
                </button>
              )}
            </div>
          )}

          <button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-blue-500 to-orange-500 text-white py-3 px-4 rounded-lg font-semibold disabled:opacity-50">
            {loading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto" /> : (isLogin ? 'Se connecter' : 'Créer un compte')}
          </button>
        </form>

        <div className="mt-6 text-center space-y-3">
          {isLogin && (
            <>
              <button onClick={() => setShowForgotPassword(true)} className="text-orange-400 hover:text-orange-300 font-medium block w-full">Mot de passe oublié ?</button>
              <button onClick={() => setShowResendConfirmation(true)} className="text-orange-400 hover:text-orange-300 font-medium block w-full">Renvoyer l'email de confirmation</button>
            </>
          )}
          <button onClick={() => setIsLogin(!isLogin)} className="text-blue-400 hover:text-blue-300 font-medium block w-full">
            {isLogin ? "Pas encore de compte ? Créez-en un" : "Déjà un compte ? Connectez-vous"}
          </button>
        </div>
      </div>
    </div>
  );
}