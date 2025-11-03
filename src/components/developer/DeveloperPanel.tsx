import React, { useState } from 'react'
import { Settings, Handshake, Bell, Users } from 'lucide-react'
import { PartnershipManagement } from './PartnershipManagement'
import { NotificationSender } from './NotificationSender'
import useAuth from '../../hooks/useAuth'

export const DeveloperPanel: React.FC = () => {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState<'partnerships' | 'notifications'>('partnerships')

  console.log('🔍 DEBUG DEVELOPER PANEL - User ID:', user?.id)
  console.log('🔍 DEBUG DEVELOPER PANEL - Expected ID:', '75a17559-b45b-4dd1-883b-ce8ccfe03f0f')
  console.log('🔍 DEBUG DEVELOPER PANEL - Match?', user?.id === '75a17559-b45b-4dd1-883b-ce8ccfe03f0f')

  // Vérifier l'accès développeur
  if (user?.id !== '75a17559-b45b-4dd1-883b-ce8ccfe03f0f') {
    console.log('❌ DEBUG DEVELOPER PANEL - Accès refusé pour:', user?.id)
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg p-8 text-center shadow-lg border border-gray-200 dark:border-gray-700">
        <Settings className="h-16 w-16 text-red-400 mx-auto mb-4" />
        <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">Accès refusé</h3>
        <p className="text-gray-600 dark:text-gray-400">
          Cette section est réservée aux développeurs autorisés.<br/>
          Votre ID: {user?.id}<br/>
          ID requis: 75a17559-b45b-4dd1-883b-ce8ccfe03f0f
        </p>
      </div>
    )
  }

  console.log('✅ DEBUG DEVELOPER PANEL - Accès autorisé!')

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Panel Développeur</h1>
        <p className="text-gray-600 dark:text-gray-400">Gestion des partenariats et notifications globales</p>
      </div>

      {/* Onglets */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab('partnerships')}
            className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'partnerships'
                ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            <div className="flex items-center space-x-2">
              <Handshake className="h-5 w-5" />
              <span>Gestion Partenariats</span>
            </div>
          </button>
          
          <button
            onClick={() => setActiveTab('notifications')}
            className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'notifications'
                ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            <div className="flex items-center space-x-2">
              <Bell className="h-5 w-5" />
              <span>Notifications Globales</span>
            </div>
          </button>
        </nav>
      </div>

      {/* Contenu des onglets */}
      {activeTab === 'partnerships' && <PartnershipManagement />}
      {activeTab === 'notifications' && <NotificationSender />}
    </div>
  );
}

export default DeveloperPanel;
