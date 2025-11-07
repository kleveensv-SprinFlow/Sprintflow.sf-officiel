// src/components/Auth.tsx

import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { X } from 'lucide-react';
import { CardCarousel } from './common/CardCarousel.tsx'; // MODIFICATION ICI
import Toast from './common/Toast';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


export default function Auth() {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    sexe: '',
    date_of_birth: '',
    discipline: 'sprint',
    role_specifique: 'Coach',
  });
  const [step, setStep] = useState(1);

  const handleLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setError(error.message);
    setLoading(false);
  };

  const handleSignUp = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (step === 1) {
      setStep(2);
      return;
    }
    setLoading(true);
    setError(null);

    // Vérification des champs requis pour le rôle 'athlete'
    if (isSignUp && formData.sexe === 'athlete' && !formData.discipline) {
      setError("Veuillez sélectionner une discipline.");
      setLoading(false);
      return;
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: formData.first_name,
          last_name: formData.last_name,
          role: formData.sexe === 'athlete' ? 'athlete' : 'coach',
          sexe: formData.sexe,
          date_of_birth: formData.date_of_birth || null, // Envoyer null si vide
          discipline: formData.sexe === 'athlete' ? formData.discipline : null,
          role_specifique: formData.sexe !== 'athlete' ? formData.role_specifique : null,
          full_name: `${formData.first_name} ${formData.last_name}`,
        },
      },
    });

    if (error) {
      setError(error.message);
    } else if (data.user) {
      toast.success("Compte créé avec succès ! Vous pouvez maintenant vous connecter.");
      setIsSignUp(false);
      setStep(1);
    }
    setLoading(false);
  };

  const commonFields = (
    <>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-400" htmlFor="first_name">
            Prénom
          </label>
          <input
            id="first_name"
            className="w-full mt-1 p-2 bg-gray-700 border border-gray-600 rounded-md text-white"
            type="text"
            placeholder="Jean"
            value={formData.first_name}
            onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-400" htmlFor="last_name">
            Nom
          </label>
          <input
            id="last_name"
            className="w-full mt-1 p-2 bg-gray-700 border border-gray-600 rounded-md text-white"
            type="text"
            placeholder="Dupont"
            value={formData.last_name}
            onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
            required
          />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-400" htmlFor="date_of_birth">
          Date de naissance
        </label>
        <input
          id="date_of_birth"
          className="w-full mt-1 p-2 bg-gray-700 border border-gray-600 rounded-md text-white"
          type="date"
          value={formData.date_of_birth}
          onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
        />
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col justify-center items-center p-4">
      <Toast />
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">SprintFlow</h1>
          <p className="text-gray-400">Votre partenaire de performance</p>
        </div>

        <div className="bg-gray-800 p-8 rounded-lg shadow-lg">
          {isSignUp ? (
            <form onSubmit={handleSignUp}>
              {step === 1 ? (
                <>
                  <h2 className="text-2xl font-bold mb-6 text-center">Créer un compte</h2>
                  <div>
                    <label className="block text-sm font-medium text-gray-400" htmlFor="email">
                      Email
                    </label>
                    <input
                      id="email"
                      className="w-full mt-1 p-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                      type="email"
                      placeholder="votre@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-400" htmlFor="password">
                      Mot de passe
                    </label>
                    <input
                      id="password"
                      className="w-full mt-1 p-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full mt-6 p-3 bg-blue-600 rounded-md font-semibold hover:bg-blue-700 transition"
                    disabled={loading}
                  >
                    {loading ? 'Chargement...' : 'Suivant'}
                  </button>
                </>
              ) : (
                <>
                  <button onClick={() => setStep(1)} className="absolute top-4 right-4 text-gray-400 hover:text-white">
                    <X size={20} />
                  </button>
                  <h2 className="text-2xl font-bold mb-1 text-center">Finalisation</h2>
                  <p className="text-center text-gray-400 mb-6 text-sm">Dites-nous en plus sur vous</p>

                  {commonFields}
                  
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-400 mb-2">Je suis un(e)...</label>
                    <div className="flex justify-around">
                      <button type="button" onClick={() => setFormData({ ...formData, sexe: 'athlete' })} className={`px-4 py-2 rounded-md transition ${formData.sexe === 'athlete' ? 'bg-blue-600' : 'bg-gray-700'}`}>Athlète</button>
                      <button type="button" onClick={() => setFormData({ ...formData, sexe: 'coach' })} className={`px-4 py-2 rounded-md transition ${formData.sexe === 'coach' ? 'bg-blue-600' : 'bg-gray-700'}`}>Coach</button>
                    </div>
                  </div>

                  {formData.sexe === 'coach' && (
                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-400 mb-2">Spécialité</label>
                      <CardCarousel options={[{ value: 'Coach', label: 'Coach' }, { value: 'Kinesitherapeute', label: 'Kinésithérapeute' }, { value: 'Nutritionniste', label: 'Nutritionniste' }, { value: 'Preparateur Physique', label: 'Prép. Physique' }, { value: 'Preparateur Mental', label: 'Prép. Mental' }]} selectedValue={formData.role_specifique} onSelect={value => setFormData(prev => ({ ...prev, role_specifique: value }))} />
                    </div>
                  )}
                  {formData.sexe === 'athlete' && (
                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-400 mb-2">Discipline</g-emoji></label>
                      <CardCarousel options={[{ value: 'sprint', label: 'Sprint' }, { value: 'haies', label: 'Haies' }, { value: 'sauts', label: 'Sauts' }, { value: 'lancers', label: 'Lancers' }, { value: 'demi-fond', label: 'Demi-fond / Fond' }, { value: 'marche', label: 'Marche' }, { value: 'combinees', label: 'Combinées' }]} selectedValue={formData.discipline} onSelect={value => setFormData(prev => ({ ...prev, discipline: value }))} />
                    </div>
                  )}

                  <button
                    type="submit"
                    className="w-full mt-6 p-3 bg-blue-600 rounded-md font-semibold hover:bg-blue-700 transition"
                    disabled={loading}
                  >
                    {loading ? 'Création...' : 'Terminer l\'inscription'}
                  </button>
                </>
              )}
            </form>
          ) : (
            <form onSubmit={handleLogin}>
              <h2 className="text-2xl font-bold mb-6 text-center">Connexion</h2>
              <div>
                <label className="block text-sm font-medium text-gray-400" htmlFor="email">
                  Email
                </label>
                <input
                  id="email"
                  className="w-full mt-1 p-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                  type="email"
                  placeholder="votre@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-400" htmlFor="password">
                  Mot de passe
                </label>
                <input
                  id="password"
                  className="w-full mt-1 p-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full mt-6 p-3 bg-blue-600 rounded-md font-semibold hover:bg-blue-700 transition"
                disabled={loading}
              >
                {loading ? 'Connexion...' : 'Se connecter'}
              </button>
            </form>
          )}

          {error && <p className="mt-4 text-red-400 text-center">{error}</p>}

          <p className="mt-6 text-center text-sm text-gray-400">
            {isSignUp ? 'Vous avez déjà un compte ?' : 'Pas encore de compte ?'}{' '}
            <button
              onClick={() => {
                setIsSignUp(!isSignUp);
                setStep(1);
                setError(null);
              }}
              className="font-semibold text-blue-400 hover:underline"
            >
              {isSignUp ? 'Se connecter' : 'S\'inscrire'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}