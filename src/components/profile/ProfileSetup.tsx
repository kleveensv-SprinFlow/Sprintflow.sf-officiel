import React, { useState, useEffect } from 'react'
import { useProfile } from '../../hooks/useProfile'
import { User, Camera, Save, Loader2, Target, Calendar, Weight } from 'lucide-react'
import { supabase } from '../../lib/supabase'

export function ProfileSetup() {
  const { profile, loading, updateProfile, uploadProfilePhoto } = useProfile()
  const [formData, setFormData] = useState({
    first_name: profile?.first_name || '',
    last_name: profile?.last_name || ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [photoFile, setPhotoFile] = useState<File | null>(null)

  const [seasonGoal, setSeasonGoal] = useState({
    objectif_saison: profile?.objectif_saison || 'maintien',
    poids_cible_kg: profile?.poids_cible_kg || '',
    date_cible: profile?.date_cible || ''
  })
  const [isSubmittingGoal, setIsSubmittingGoal] = useState(false)
  const [goalMessage, setGoalMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  useEffect(() => {
    if (profile) {
      setSeasonGoal({
        objectif_saison: profile.objectif_saison || 'maintien',
        poids_cible_kg: profile.poids_cible_kg || '',
        date_cible: profile.date_cible || ''
      })
    }
  }, [profile])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setPhotoFile(e.target.files[0])
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      if (photoFile) {
        await uploadProfilePhoto(photoFile)
      }

      await updateProfile(formData)

      alert('Profil mis à jour avec succès!')
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error)
      alert('Erreur lors de la mise à jour du profil')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSeasonGoalSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmittingGoal(true)
    setGoalMessage(null)

    try {
      if (!seasonGoal.poids_cible_kg || !seasonGoal.date_cible) {
        setGoalMessage({ type: 'error', text: 'Veuillez remplir tous les champs' })
        return
      }

      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        setGoalMessage({ type: 'error', text: 'Vous devez être connecté' })
        return
      }

      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
      const functionUrl = `${supabaseUrl}/functions/v1/calculer_objectifs`

      const response = await fetch(functionUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          objectif_saison: seasonGoal.objectif_saison,
          poids_cible_kg: parseFloat(seasonGoal.poids_cible_kg as string),
          date_cible: seasonGoal.date_cible,
          sexe: profile?.sexe,
          taille_cm: profile?.taille_cm,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Erreur lors du calcul des objectifs')
      }

      await updateProfile({
        objectif_saison: seasonGoal.objectif_saison,
        poids_cible_kg: parseFloat(seasonGoal.poids_cible_kg as string),
        date_cible: seasonGoal.date_cible,
      })

      setGoalMessage({
        type: 'success',
        text: `Objectif de saison enregistré ! Vos objectifs nutritionnels ont été calculés automatiquement (${result.objectifs?.length || 3} presets créés).`
      })
    } catch (error: any) {
      console.error('Erreur lors de la sauvegarde:', error)
      setGoalMessage({ type: 'error', text: error.message || 'Erreur lors de la sauvegarde' })
    } finally {
      setIsSubmittingGoal(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    )
  }

  return (
    <div className="max-w-md mx-auto p-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center mb-6">
          <User className="w-8 h-8 text-primary-600 mr-3" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Mon Profil</h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Photo de profil */}
          <div className="flex flex-col items-center mb-6">
            <div className="relative">
              <div className="w-24 h-24 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center overflow-hidden">
                {profile?.photo_url ? (
                  <img 
                    src={profile.photo_url} 
                    alt="Photo de profil" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="w-12 h-12 text-gray-400" />
                )}
              </div>
              <label className="absolute bottom-0 right-0 bg-primary-600 text-white p-2 rounded-full cursor-pointer hover:bg-primary-700 transition-colors shadow-lg">
                <Camera className="w-4 h-4" />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  className="hidden"
                />
              </label>
            </div>
            {photoFile && (
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                Nouvelle photo sélectionnée: {photoFile.name}
              </p>
            )}
          </div>

          {/* Informations personnelles */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Prénom *
              </label>
              <input
                type="text"
                name="first_name"
                value={formData.first_name}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Votre prénom"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Nom *
              </label>
              <input
                type="text"
                name="last_name"
                value={formData.last_name}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Votre nom"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-primary-600 text-white py-3 px-4 rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-colors shadow-lg"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin mr-2" />
                Mise à jour...
              </>
            ) : (
              <>
                <Save className="w-5 h-5 mr-2" />
                Sauvegarder le profil
              </>
            )}
          </button>
        </form>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-6 mt-6">
        <div className="flex items-center mb-6">
          <Target className="w-8 h-8 text-blue-600 mr-3" />
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Objectif de Saison</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Définissez votre objectif pour calculer automatiquement vos besoins nutritionnels
            </p>
          </div>
        </div>

        <form onSubmit={handleSeasonGoalSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Type d'Objectif *
            </label>
            <select
              value={seasonGoal.objectif_saison}
              onChange={(e) => setSeasonGoal(prev => ({ ...prev, objectif_saison: e.target.value }))}
              className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="preparation">Préparation (Force/Perf)</option>
              <option value="maintien">Maintien</option>
              <option value="affutage">Affûtage (Perte de gras)</option>
            </select>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {seasonGoal.objectif_saison === 'preparation' && '💪 Surplus calorique pour prendre de la masse'}
              {seasonGoal.objectif_saison === 'maintien' && '⚖️ Maintien du poids actuel'}
              {seasonGoal.objectif_saison === 'affutage' && '🔥 Déficit calorique pour perdre du gras'}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
              <Weight className="w-4 h-4" />
              Poids Cible (kg) *
            </label>
            <input
              type="number"
              step="0.1"
              value={seasonGoal.poids_cible_kg}
              onChange={(e) => setSeasonGoal(prev => ({ ...prev, poids_cible_kg: e.target.value }))}
              required
              className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="75.0"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Date Cible *
            </label>
            <input
              type="date"
              value={seasonGoal.date_cible}
              onChange={(e) => setSeasonGoal(prev => ({ ...prev, date_cible: e.target.value }))}
              required
              min={new Date().toISOString().split('T')[0]}
              className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {goalMessage && (
            <div className={`p-4 rounded-lg ${
              goalMessage.type === 'success'
                ? 'bg-green-50 border border-green-200 text-green-800 dark:bg-green-900/20 dark:border-green-800 dark:text-green-200'
                : 'bg-red-50 border border-red-200 text-red-800 dark:bg-red-900/20 dark:border-red-800 dark:text-red-200'
            }`}>
              <p className="text-sm font-medium">{goalMessage.text}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmittingGoal}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-colors shadow-lg"
          >
            {isSubmittingGoal ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin mr-2" />
                Calcul en cours...
              </>
            ) : (
              <>
                <Target className="w-5 h-5 mr-2" />
                Sauvegarder l'Objectif
              </>
            )}
          </button>

          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 dark:text-blue-200 mb-2 flex items-center gap-2">
              <span>ℹ️</span> Comment ça marche ?
            </h4>
            <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
              <li>• L'algorithme calcule vos besoins caloriques quotidiens</li>
              <li>• 3 presets sont créés automatiquement : Jour Haut, Jour Bas, Jour Repos</li>
              <li>• Vos macros (protéines, glucides, lipides) sont optimisées selon votre objectif</li>
              <li>• Consultez vos objectifs dans l'onglet "Nutrition"</li>
            </ul>
          </div>
        </form>
      </div>
    </div>
  )
}