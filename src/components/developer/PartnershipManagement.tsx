import React, { useState } from 'react'
import { Plus, CreditCard as Edit, Trash2, Camera, Save, X, Handshake } from 'lucide-react'
import { usePartnerships } from '../../hooks/usePartnerships'
import { Partnership } from '../../types'

export const PartnershipManagement: React.FC = () => {
  const { partnerships, loading, createPartnership, updatePartnership, deletePartnership, uploadPartnershipPhoto } = usePartnerships()
  const [showForm, setShowForm] = useState(false)
  const [editingPartnership, setEditingPartnership] = useState<Partnership | null>(null)
  const [uploading, setUploading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    photo_url: '',
    promo_code: ''
  })

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      photo_url: '',
      promo_code: ''
    })
    setEditingPartnership(null)
    setShowForm(false)
  }

  const handleEdit = (partnership: Partnership) => {
    setFormData({
      name: partnership.name,
      description: partnership.description || '',
      photo_url: partnership.photo_url || '',
      promo_code: partnership.promo_code || ''
    })
    setEditingPartnership(partnership)
    setShowForm(true)
  }

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    try {
      const photoUrl = await uploadPartnershipPhoto(file)
      setFormData(prev => ({ ...prev, photo_url: photoUrl }))
      
      const successDiv = document.createElement('div')
      successDiv.innerHTML = '✅ Photo uploadée avec succès!'
      successDiv.style.cssText = `
        position: fixed; top: 20px; right: 20px; background: #10B981; color: white;
        padding: 12px 20px; border-radius: 8px; font-weight: 500; z-index: 9999;
        box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
      `
      document.body.appendChild(successDiv)
      setTimeout(() => successDiv.remove(), 3000)
    } catch (error: any) {
      console.error('Erreur upload photo:', error)
      
      const errorDiv = document.createElement('div')
      errorDiv.innerHTML = `❌ Erreur upload: ${error.message}`
      errorDiv.style.cssText = `
        position: fixed; top: 20px; right: 20px; background: #EF4444; color: white;
        padding: 12px 20px; border-radius: 8px; font-weight: 500; z-index: 9999;
        box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
      `
      document.body.appendChild(errorDiv)
      setTimeout(() => errorDiv.remove(), 4000)
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name.trim()) return

    try {
      if (editingPartnership) {
        await updatePartnership(editingPartnership.id, formData)
        
        const successDiv = document.createElement('div')
        successDiv.innerHTML = '✅ Partenariat mis à jour!'
        successDiv.style.cssText = `
          position: fixed; top: 20px; right: 20px; background: #10B981; color: white;
          padding: 12px 20px; border-radius: 8px; font-weight: 500; z-index: 9999;
          box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
        `
        document.body.appendChild(successDiv)
        setTimeout(() => successDiv.remove(), 3000)
      } else {
        await createPartnership(formData)
        
        const successDiv = document.createElement('div')
        successDiv.innerHTML = '✅ Partenariat créé avec succès!'
        successDiv.style.cssText = `
          position: fixed; top: 20px; right: 20px; background: #10B981; color: white;
          padding: 12px 20px; border-radius: 8px; font-weight: 500; z-index: 9999;
          box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
        `
        document.body.appendChild(successDiv)
        setTimeout(() => successDiv.remove(), 3000)
      }
      
      resetForm()
    } catch (error: any) {
      console.error('Erreur sauvegarde partenariat:', error)
      
      const errorDiv = document.createElement('div')
      errorDiv.innerHTML = `❌ Erreur: ${error.message}`
      errorDiv.style.cssText = `
        position: fixed; top: 20px; right: 20px; background: #EF4444; color: white;
        padding: 12px 20px; border-radius: 8px; font-weight: 500; z-index: 9999;
        box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
      `
      document.body.appendChild(errorDiv)
      setTimeout(() => errorDiv.remove(), 4000)
    }
  }

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`Êtes-vous sûr de vouloir supprimer le partenariat "${name}" ?`)) {
      try {
        await deletePartnership(id)
        
        const successDiv = document.createElement('div')
        successDiv.innerHTML = '✅ Partenariat supprimé!'
        successDiv.style.cssText = `
          position: fixed; top: 20px; right: 20px; background: #10B981; color: white;
          padding: 12px 20px; border-radius: 8px; font-weight: 500; z-index: 9999;
          box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
        `
        document.body.appendChild(successDiv)
        setTimeout(() => successDiv.remove(), 3000)
      } catch (error: any) {
        console.error('Erreur suppression:', error)
        
        const errorDiv = document.createElement('div')
        errorDiv.innerHTML = `❌ Erreur: ${error.message}`
        errorDiv.style.cssText = `
          position: fixed; top: 20px; right: 20px; background: #EF4444; color: white;
          padding: 12px 20px; border-radius: 8px; font-weight: 500; z-index: 9999;
          box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
        `
        document.body.appendChild(errorDiv)
        setTimeout(() => errorDiv.remove(), 4000)
      }
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Gestion des Partenariats</h2>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-primary-500 hover:bg-primary-600 rounded-lg text-white transition-all duration-200 shadow-lg button-3d"
        >
          <Plus className="h-5 w-5" />
          <span>Nouveau partenariat</span>
        </button>
      </div>

      {/* Formulaire de création/édition */}
      {showForm && (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg border border-gray-200 dark:border-gray-700 card-3d-deep">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            {editingPartnership ? 'Modifier le partenariat' : 'Nouveau partenariat'}
          </h3>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Nom du partenaire *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Ex: Nike Running"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={4}
                className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                placeholder="Description détaillée du partenaire et de ses offres..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Code promo
              </label>
              <input
                type="text"
                value={formData.promo_code}
                onChange={(e) => setFormData(prev => ({ ...prev, promo_code: e.target.value.toUpperCase() }))}
                className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent font-mono"
                placeholder="Ex: SPRINT20"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Photo du partenaire
              </label>
              <div className="space-y-3">
                {formData.photo_url && (
                  <div className="relative">
                    <img 
                      src={formData.photo_url} 
                      alt="Aperçu"
                      className="w-full h-32 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, photo_url: '' }))}
                      className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white p-1 rounded-full shadow-lg"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                )}
                
                <label className="flex items-center justify-center space-x-2 px-4 py-3 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-primary-400 dark:hover:border-primary-500 transition-colors cursor-pointer">
                  <Camera className="h-5 w-5 text-gray-400" />
                  <span className="text-gray-600 dark:text-gray-400">
                    {uploading ? 'Upload en cours...' : 'Choisir une photo'}
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    disabled={uploading}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            <div className="flex space-x-3 pt-4">
              <button
                type="submit"
                disabled={!formData.name.trim() || uploading}
                className="flex-1 bg-primary-500 hover:bg-primary-600 disabled:opacity-50 px-4 py-3 rounded-lg text-white font-medium transition-all duration-200 shadow-lg button-3d"
              >
                <Save className="h-5 w-5 mr-2" />
                {editingPartnership ? 'Mettre à jour' : 'Créer le partenariat'}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="px-6 py-3 border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-gray-700 dark:text-gray-300 transition-colors button-3d"
              >
                Annuler
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Liste des partenariats */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg border border-gray-200 dark:border-gray-700 card-3d">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Partenariats existants ({partnerships.length})
        </h3>
        
        {partnerships.length === 0 ? (
          <div className="text-center py-8">
            <Handshake className="h-12 w-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">Aucun partenariat créé</p>
          </div>
        ) : (
          <div className="space-y-4">
            {partnerships.map((partnership) => (
              <div key={partnership.id} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600 card-3d">
                <div className="flex items-start space-x-4">
                  {/* Photo */}
                  <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-200 dark:bg-gray-600 flex-shrink-0">
                    {partnership.photo_url ? (
                      <img 
                        src={partnership.photo_url} 
                        alt={partnership.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Handshake className="h-8 w-8 text-gray-400" />
                      </div>
                    )}
                  </div>
                  
                  {/* Informations */}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-gray-900 dark:text-white truncate">
                      {partnership.name}
                    </h4>
                    {partnership.description && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                        {partnership.description}
                      </p>
                    )}
                    {partnership.promo_code && (
                      <div className="mt-2">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-200">
                          🎁 {partnership.promo_code}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  {/* Actions */}
                  <div className="flex items-center space-x-2 flex-shrink-0">
                    <button
                      onClick={() => handleEdit(partnership)}
                      className="p-2 text-blue-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors button-3d"
                      title="Modifier"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(partnership.id, partnership.name)}
                      className="p-2 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors button-3d"
                      title="Supprimer"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}