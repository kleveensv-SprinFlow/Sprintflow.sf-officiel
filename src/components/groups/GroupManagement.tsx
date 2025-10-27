import React, { useState } from 'react'
import { Plus, Users, Copy, Trash2, Camera } from 'lucide-react'
import { useGroups } from '../../hooks/useGroups'
import useAuth from '../../hooks/useAuth'

export const GroupManagement: React.FC = () => {
  const { user, profile } = useAuth()
  const { groups, loading, createGroup, deleteGroup, updateGroupPhoto } = useGroups()
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [newGroupData, setNewGroupData] = useState({
    name: '',
    description: ''
  })
  const [creating, setCreating] = useState(false)


  const handleGroupPhotoUpload = async (groupId: string, file: File) => {
    try {
      console.log('📸 Début upload photo pour groupe:', groupId)
      await updateGroupPhoto(groupId, file)
      
      const successDiv = document.createElement('div')
      successDiv.innerHTML = '✅ Photo du groupe sauvegardée sur Supabase!'
      successDiv.style.cssText = `
        position: fixed; top: 20px; right: 20px; background: #10B981; color: white;
        padding: 12px 20px; border-radius: 8px; font-weight: 500; z-index: 9999;
        box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
      `
      document.body.appendChild(successDiv)
      setTimeout(() => successDiv.remove(), 3000)
      
      console.log('✅ Photo groupe uploadée avec succès')
    } catch (error: any) {
      console.error('Erreur upload photo groupe:', error)
      
      const errorDiv = document.createElement('div')
      errorDiv.innerHTML = `❌ Erreur upload photo: ${error.message}`
      errorDiv.style.cssText = `
        position: fixed; top: 20px; right: 20px; background: #EF4444; color: white;
        padding: 12px 20px; border-radius: 8px; font-weight: 500; z-index: 9999;
        box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
      `
      document.body.appendChild(errorDiv)
      setTimeout(() => errorDiv.remove(), 4000)
    }
  }

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newGroupData.name.trim() || creating) {
      return
    }
    
    setCreating(true)
    try {
      await createGroup(newGroupData)
      
      // Reset form
      setNewGroupData({ name: '', description: '' })
      setShowCreateForm(false)
      
      // Notification de succès
      showSuccessNotification('✅ Groupe créé avec succès!')
      
    } catch (error: any) {
      console.error('Erreur création groupe:', error.message)
      showErrorNotification(`❌ Erreur: ${error.message}`)
    } finally {
      setCreating(false)
    }
  }
  
  const showSuccessNotification = (message: string) => {
    const successDiv = document.createElement('div')
    successDiv.innerHTML = message
    successDiv.style.cssText = `
      position: fixed; top: 20px; right: 20px; background: #10B981; color: white;
      padding: 12px 20px; border-radius: 8px; font-weight: 500; z-index: 9999;
      box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
    `
    document.body.appendChild(successDiv)
    setTimeout(() => successDiv.remove(), 3000)
  }
  
  const showErrorNotification = (message: string) => {
    const errorDiv = document.createElement('div')
    errorDiv.innerHTML = message
    errorDiv.style.cssText = `
      position: fixed; top: 20px; right: 20px; background: #EF4444; color: white;
      padding: 12px 20px; border-radius: 8px; font-weight: 500; z-index: 9999;
      box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
    `
    document.body.appendChild(errorDiv)
    setTimeout(() => errorDiv.remove(), 4000)
  }

  const handleDeleteGroup = async (groupId: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce groupe ?')) {
      try {
        await deleteGroup(groupId)
        
        const successDiv = document.createElement('div')
        successDiv.innerHTML = '✅ Groupe supprimé avec succès!'
        successDiv.style.cssText = `
          position: fixed; top: 20px; right: 20px; background: #10B981; color: white;
          padding: 12px 20px; border-radius: 8px; font-weight: 500; z-index: 9999;
          box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
        `
        document.body.appendChild(successDiv)
        setTimeout(() => successDiv.remove(), 3000)
        
      } catch (error: any) {
        console.error('Erreur suppression groupe:', error)
        
        const errorDiv = document.createElement('div')
        errorDiv.innerHTML = `❌ ${error.message}`
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

  const copyInvitationCode = (code: string) => {
    navigator.clipboard.writeText(code)
    
    const successDiv = document.createElement('div')
    successDiv.innerHTML = '📋 Code copié dans le presse-papiers!'
    successDiv.style.cssText = `
      position: fixed; top: 20px; right: 20px; background: #3B82F6; color: white;
      padding: 12px 20px; border-radius: 8px; font-weight: 500; z-index: 9999;
      box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
    `
    document.body.appendChild(successDiv)
    setTimeout(() => successDiv.remove(), 2000)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Mes Groupes</h1>
        <button
          onClick={() => setShowCreateForm(true)}
          disabled={creating}
          className="flex items-center space-x-2 px-4 py-2 bg-primary-500 hover:bg-primary-600 disabled:opacity-50 rounded-lg text-white transition-all duration-200 shadow-lg"
        >
          <Plus className="h-5 w-5" />
          <span>Créer un groupe</span>
        </button>
      </div>

      {/* Formulaire de création */}
      {showCreateForm && (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg border border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Créer un nouveau groupe</h2>
          <form onSubmit={handleCreateGroup} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Nom du groupe *
              </label>
              <input
                type="text"
                value={newGroupData.name}
                onChange={(e) => setNewGroupData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Ex: Équipe Sprint Elite"
                required
                disabled={creating}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Description (optionnel)
              </label>
              <textarea
                value={newGroupData.description}
                onChange={(e) => setNewGroupData(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
                className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                placeholder="Description du groupe..."
                disabled={creating}
              />
            </div>
            <div className="flex space-x-3">
              <button
                type="submit"
                disabled={creating || !newGroupData.name.trim()}
                className="flex-1 bg-primary-500 hover:bg-primary-600 disabled:opacity-50 px-4 py-2 rounded-lg text-white font-medium transition-colors"
              >
                {creating ? 'Création...' : 'Créer le groupe'}
              </button>
              <button
                type="button"
                onClick={() => setShowCreateForm(false)}
                disabled={creating}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-gray-700 dark:text-gray-300 transition-colors"
              >
                Annuler
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Liste des groupes */}
      {loading ? (
        <div className="flex items-center justify-center py-6 sm:py-8">
          <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : groups.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 sm:p-8 text-center shadow-lg border border-gray-200 dark:border-gray-700">
          <Users className="h-12 w-12 sm:h-16 sm:w-16 text-gray-400 dark:text-gray-500 mx-auto mb-3 sm:mb-4" />
          <h3 className="text-lg sm:text-xl font-medium text-gray-900 dark:text-white mb-2">Aucun groupe créé</h3>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-4 sm:mb-6">
            Créez votre premier groupe pour commencer à organiser vos athlètes.
          </p>
          <button
            onClick={() => setShowCreateForm(true)}
            className="px-4 sm:px-6 py-2 sm:py-3 bg-primary-500 hover:bg-primary-600 rounded-lg text-white font-medium transition-colors text-sm sm:text-base"
          >
            Créer mon premier groupe
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {groups.map((group) => (
            <div key={group.id} className="bg-white dark:bg-gray-800 rounded-lg p-4 sm:p-6 shadow-lg border border-gray-200 dark:border-gray-700">
              <div className="flex items-start justify-between mb-3 sm:mb-4">
                <div className="flex items-start space-x-2 sm:space-x-3 flex-1 min-w-0">
                  {/* Photo de groupe */}
                  <div className="relative">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700 flex items-center justify-center flex-shrink-0">
                      {group.group_photo_url ? (
                        <img 
                          src={group.group_photo_url} 
                          alt={`Photo ${group.name}`}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Users className="w-4 h-4 sm:w-6 sm:h-6 text-gray-400" />
                      )}
                      {/* Debug info pour voir les données des membres */}
                      {group.members && group.members.length > 0 && (
                        <div className="text-xs text-gray-400 mb-2">
                          🔍 Membres: {group.members.map((m: any) => 
                            `${m.athlete?.first_name || m.profiles?.first_name || 'Sans prénom'} ${m.athlete?.last_name || m.profiles?.last_name || 'Sans nom'}`
                          ).join(', ')}
                        </div>
                      )}
                    </div>
                    
                    <label className="absolute bottom-0 right-0 bg-primary-500 hover:bg-primary-600 text-white p-0.5 sm:p-1 rounded-full cursor-pointer shadow-lg transition-colors">
                      <Camera className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0]
                          if (file) {
                            handleGroupPhotoUpload(group.id, file)
                          }
                        }}
                        className="hidden"
                      />
                    </label>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-1 sm:mb-2 truncate">
                    {group.name}
                  </h3>
                  {group.description && (
                    <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm mb-2 sm:mb-3 line-clamp-2">
                      {group.description}
                    </p>
                  )}
                  </div>
                </div>
                <button
                  onClick={() => handleDeleteGroup(group.id)}
                  className="p-1.5 sm:p-2 text-red-400 hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors flex-shrink-0"
                  title="Supprimer le groupe"
                >
                  <Trash2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                </button>
              </div>

              <div className="space-y-2 sm:space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Membres</span>
                  <span className="font-medium text-gray-900 dark:text-white text-sm sm:text-base">
                    {group.members?.length || 0}
                  </span>
                </div>

                <div className="bg-gray-50 dark:bg-gray-700 p-2 sm:p-3 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs text-gray-600 dark:text-gray-400">Code</span>
                      <div className="font-mono text-sm sm:text-lg font-bold text-primary-500">
                        {group.invitation_code}
                      </div>
                    </div>
                    <button
                      onClick={() => copyInvitationCode(group.invitation_code)}
                      className="p-1.5 sm:p-2 bg-primary-500 hover:bg-primary-600 rounded-lg text-white transition-colors"
                      title="Copier le code"
                    >
                      <Copy className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    </button>
                  </div>
                </div>

                <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg text-center">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    💬 Chat disponible dans l'onglet "Chat Groupes"
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  )
}