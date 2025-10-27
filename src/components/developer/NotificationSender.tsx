import React, { useState } from 'react'
import { Send, Bell, Users, AlertCircle, CheckCircle, Info, AlertTriangle } from 'lucide-react'
import { useNotifications } from '../../hooks/useNotifications'

export const NotificationSender: React.FC = () => {
  const { sendGlobalNotification } = useNotifications()
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    type: 'info' as 'info' | 'success' | 'warning' | 'error' | 'reminder',
    action_url: '',
    action_label: ''
  })
  const [sending, setSending] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.title.trim() || !formData.message.trim() || sending) return

    setSending(true)
    
    try {
      console.log('📢 Envoi notification globale:', formData)
      
      const notificationData = {
        title: formData.title.trim(),
        message: formData.message.trim(),
        type: formData.type,
        ...(formData.action_url && { action_url: formData.action_url }),
        ...(formData.action_label && { action_label: formData.action_label })
      }
      
      const result = await sendGlobalNotification(notificationData)
      
      const successDiv = document.createElement('div')
      successDiv.innerHTML = `✅ Notification envoyée à ${result?.length || 0} athlète(s)!`
      successDiv.style.cssText = `
        position: fixed; top: 20px; right: 20px; background: #10B981; color: white;
        padding: 12px 20px; border-radius: 8px; font-weight: 500; z-index: 9999;
        box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
      `
      document.body.appendChild(successDiv)
      setTimeout(() => successDiv.remove(), 3000)
      
      // Reset form
      setFormData({
        title: '',
        message: '',
        type: 'info',
        action_url: '',
        action_label: ''
      })
    } catch (error: any) {
      console.error('Erreur envoi notification:', error)
      
      const errorDiv = document.createElement('div')
      errorDiv.innerHTML = `❌ Erreur: ${error.message}`
      errorDiv.style.cssText = `
        position: fixed; top: 20px; right: 20px; background: #EF4444; color: white;
        padding: 12px 20px; border-radius: 8px; font-weight: 500; z-index: 9999;
        box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
      `
      document.body.appendChild(errorDiv)
      setTimeout(() => errorDiv.remove(), 4000)
    } finally {
      setSending(false)
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'warning': return <AlertTriangle className="h-5 w-5 text-yellow-500" />
      case 'error': return <AlertCircle className="h-5 w-5 text-red-500" />
      case 'reminder': return <Bell className="h-5 w-5 text-blue-500" />
      default: return <Info className="h-5 w-5 text-blue-500" />
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'success': return 'border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20'
      case 'warning': return 'border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-900/20'
      case 'error': return 'border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20'
      case 'reminder': return 'border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20'
      default: return 'border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20'
    }
  }

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg border border-gray-200 dark:border-gray-700 card-3d-deep">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
          <Bell className="h-6 w-6 mr-2 text-primary-500" />
          Envoyer une notification globale
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Titre de la notification *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Ex: Nouvelle fonctionnalité disponible"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Message *
            </label>
            <textarea
              value={formData.message}
              onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
              rows={4}
              className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
              placeholder="Contenu détaillé de la notification..."
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Type de notification
            </label>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {[
                { value: 'info', label: 'Information', icon: Info },
                { value: 'success', label: 'Succès', icon: CheckCircle },
                { value: 'warning', label: 'Attention', icon: AlertTriangle },
                { value: 'error', label: 'Erreur', icon: AlertCircle },
                { value: 'reminder', label: 'Rappel', icon: Bell }
              ].map(({ value, label, icon: Icon }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, type: value as any }))}
                  className={`p-3 rounded-lg border-2 transition-all duration-200 ${
                    formData.type === value 
                      ? getTypeColor(value) + ' border-opacity-100' 
                      : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                  }`}
                >
                  <div className="flex flex-col items-center space-y-1">
                    <Icon className={`h-5 w-5 ${
                      formData.type === value 
                        ? value === 'success' ? 'text-green-600' :
                          value === 'warning' ? 'text-yellow-600' :
                          value === 'error' ? 'text-red-600' :
                          value === 'reminder' ? 'text-blue-600' : 'text-blue-600'
                        : 'text-gray-400'
                    }`} />
                    <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                      {label}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Action optionnelle */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                URL d'action (optionnel)
              </label>
              <input
                type="url"
                value={formData.action_url}
                onChange={(e) => setFormData(prev => ({ ...prev, action_url: e.target.value }))}
                className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="https://example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Texte du bouton (optionnel)
              </label>
              <input
                type="text"
                value={formData.action_label}
                onChange={(e) => setFormData(prev => ({ ...prev, action_label: e.target.value }))}
                className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Ex: En savoir plus"
              />
            </div>
          </div>

          {/* Aperçu */}
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 card-3d">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Aperçu de la notification :</h4>
            <div className={`border rounded-lg p-4 ${getTypeColor(formData.type)}`}>
              <div className="flex items-start space-x-3">
                {getTypeIcon(formData.type)}
                <div className="flex-1">
                  <h5 className="font-medium text-gray-900 dark:text-white">
                    {formData.title || 'Titre de la notification'}
                  </h5>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {formData.message || 'Message de la notification'}
                  </p>
                  {formData.action_label && (
                    <button className="mt-2 text-sm text-blue-600 dark:text-blue-400 font-medium">
                      {formData.action_label}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={!formData.title.trim() || !formData.message.trim() || sending}
            className="w-full bg-gradient-to-r from-primary-500 to-secondary-500 hover:from-primary-600 hover:to-secondary-600 disabled:opacity-50 px-4 py-3 rounded-lg text-white font-medium transition-all duration-200 shadow-lg flex items-center justify-center space-x-2 button-3d"
          >
            {sending ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Envoi en cours...</span>
              </>
            ) : (
              <>
                <Send className="h-5 w-5" />
                <span>Envoyer à tous les athlètes</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  )
}