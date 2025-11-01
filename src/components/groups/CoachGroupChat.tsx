import React, { useState } from 'react'
import { MessageCircle, Send, User, Users, Crown } from 'lucide-react'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { useGroups } from '../../hooks/useGroups'
import { useGroupChat } from '../../hooks/useGroupChat'
import useAuth from '../../hooks/useAuth'

export const CoachGroupChat: React.FC = () => {
  const { groups, loading } = useGroups()
  const { user } = useAuth()
  const [selectedGroup, setSelectedGroup] = useState<any>(null)
  const { messages, typingUsers, sendMessage, sendTypingIndicator, stopTypingIndicator } = useGroupChat(selectedGroup?.id || null)
  const [messageInput, setMessageInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)

  const handleSendMessage = async () => {
    if (!messageInput.trim() || !selectedGroup) return

    setIsTyping(false)
    stopTypingIndicator()

    try {
      await sendMessage(messageInput)
      setMessageInput('')
    } catch (error) {
      console.error('Erreur envoi message:', error)
    }
  }

  const handleInputChange = (value: string) => {
    setMessageInput(value)
    
    if (value.trim() && !isTyping) {
      setIsTyping(true)
      sendTypingIndicator()
    } else if (!value.trim() && isTyping) {
      setIsTyping(false)
      stopTypingIndicator()
    }
  }

  const handleInputBlur = () => {
    if (isTyping) {
      setIsTyping(false)
      stopTypingIndicator()
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
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
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Chat des Groupes</h1>
        <p className="text-gray-600 dark:text-gray-400">Communiquez avec vos athlètes</p>
      </div>

      {/* Sélection de groupe */}
      {groups.length > 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-lg border border-gray-200 dark:border-gray-700 card-3d">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Sélectionner un groupe pour chatter
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {groups.map((group) => (
              <button
                key={group.id}
                onClick={() => setSelectedGroup(group)}
                className={`p-4 rounded-lg border-2 transition-all duration-200 text-left card-3d ${
                  selectedGroup?.id === group.id
                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                    : 'border-gray-200 dark:border-gray-600 hover:border-primary-300 dark:hover:border-primary-600'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700 flex items-center justify-center flex-shrink-0">
                    {group.group_photo_url ? (
                      <img 
                        src={group.group_photo_url} 
                        alt={`Photo ${group.name}`}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Users className="w-6 h-6 text-gray-400" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-gray-900 dark:text-white truncate">
                      {group.name}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {group.group_members?.length || 0} membre{(group.group_members?.length || 0) > 1 ? 's' : ''}
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-8 text-center shadow-lg border border-gray-200 dark:border-gray-700 card-3d">
          <Users className="h-16 w-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
          <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">Aucun groupe créé</h3>
          <p className="text-gray-600 dark:text-gray-400">
            Créez un groupe dans la section "Mes Groupes" pour commencer à chatter avec vos athlètes.
          </p>
        </div>
      )}

      {/* Interface de chat */}
      {selectedGroup && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 flex flex-col h-[600px] card-3d-deep">
          {/* Header du chat */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700 header-3d">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                {selectedGroup.group_photo_url ? (
                  <img 
                    src={selectedGroup.group_photo_url} 
                    alt={`Photo ${selectedGroup.name}`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Users className="w-5 h-5 text-gray-400" />
                )}
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  {selectedGroup.name}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {selectedGroup.members?.length || 0} membre{(selectedGroup.members?.length || 0) > 1 ? 's' : ''}
                </p>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 ? (
              <div className="text-center py-8">
                <MessageCircle className="h-12 w-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400">
                  Aucun message dans ce groupe. Commencez la conversation !
                </p>
              </div>
            ) : (
              messages.map((message) => (
                <div key={message.id} className={`flex ${message.user_id === user?.id ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-xs lg:max-w-md ${message.user_id === user?.id ? 'order-2' : 'order-1'}`}>
                    {/* Avatar et nom (seulement pour les autres utilisateurs) */}
                    {message.user_id !== user?.id && (
                      <div className="flex items-center space-x-2 mb-2">
                        <div className="w-6 h-6 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center overflow-hidden flex-shrink-0">
                          {message.user_photo ? (
                            <img 
                              src={message.user_photo} 
                              alt={message.user_name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <User className="h-3 w-3 text-primary-600 dark:text-primary-400" />
                          )}
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            {message.user_name}
                          </span>
                          {message.is_coach && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-orange-400 to-red-500 text-white shadow-lg">
                              <Crown className="h-3 w-3 mr-1" />
                              Coach
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                    
                    {/* Message bubble */}
                    <div className={`p-3 rounded-lg shadow-sm ${
                      message.user_id === user?.id
                        ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
                    }`}>
                      <p className="text-sm break-words">
                        {message.message}
                      </p>
                      <p className={`text-xs mt-1 ${
                        message.user_id === user?.id 
                          ? 'text-white/70' 
                          : 'text-gray-500 dark:text-gray-400'
                      }`}>
                        {new Date(message.created_at).toLocaleTimeString()}
                      </p>
                    </div>
                    
                    {/* Badge coach pour ses propres messages */}
                    {message.user_id === user?.id && message.is_coach && (
                      <div className="flex justify-end mt-1">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-orange-400 to-red-500 text-white shadow-lg">
                          <Crown className="h-3 w-3 mr-1" />
                          Coach
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
            
            {/* Indicateurs de frappe */}
            {typingUsers.length > 0 && (
              <div className="flex justify-start">
                <div className="bg-gray-100 dark:bg-gray-700 rounded-lg px-3 py-2 inline-block card-3d">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {typingUsers.map(u => u.user_name).join(', ')} {typingUsers.length === 1 ? 'écrit' : 'écrivent'}
                    </span>
                    <div className="flex space-x-1">
                      <div className="w-1 h-1 bg-gray-500 rounded-full animate-bounce"></div>
                      <div className="w-1 h-1 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-1 h-1 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Zone de saisie */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex space-x-3">
              <input
                type="text"
                value={messageInput}
                onChange={(e) => handleInputChange(e.target.value)}
                onBlur={handleInputBlur}
                onKeyPress={handleKeyPress}
                placeholder="Tapez votre message..."
                className="flex-1 px-4 py-3 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent card-3d"
              />
              <button
                onClick={handleSendMessage}
                disabled={!messageInput.trim()}
                className="bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 disabled:opacity-50 p-3 rounded-lg text-white transition-all duration-200 shadow-lg button-3d"
              >
                <Send className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}