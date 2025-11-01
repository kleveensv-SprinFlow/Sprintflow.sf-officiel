import React, { useState, useEffect } from 'react'
import { Users, MessageCircle, Send, User, LogOut, Eye, UserCheck, Crown } from 'lucide-react'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import useAuth from '../../hooks/useAuth'
import { useGroups } from '../../hooks/useGroups'
import { useGroupChat } from '../../hooks/useGroupChat'
import { LoadingScreen } from '../LoadingScreen'

export const AthleteGroupView: React.FC = () => {
  const { user } = useAuth()
  const { groups, loading, joinGroup, leaveGroup } = useGroups()
  
  const [showJoinForm, setShowJoinForm] = useState(groups.length === 0)
  const [invitationCode, setInvitationCode] = useState('')
  const [selectedGroup, setSelectedGroup] = useState<any>(null)
  const [showChat, setShowChat] = useState(false)
  const [joining, setJoining] = useState(false)
  const [showMembers, setShowMembers] = useState(false)
  const [selectedGroupForMembers, setSelectedGroupForMembers] = useState<any>(null)

  const { messages, typingUsers, sendMessage, sendTypingIndicator, stopTypingIndicator } = useGroupChat(selectedGroup?.id || null)
  const [messageInput, setMessageInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)

  // Mettre à jour showJoinForm quand groups change
  useEffect(() => {
    if (!loading) {
      setShowJoinForm(groups.length === 0)
    }
  }, [groups.length, loading])

  const handleJoinGroup = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!invitationCode.trim() || joining) return

    console.log('🎯 AthleteGroupView: Tentative de rejoindre avec code:', invitationCode.trim().toUpperCase())
    setJoining(true)

    try {
      const result = await joinGroup(invitationCode.trim().toUpperCase())
      console.log('✅ AthleteGroupView: Groupe rejoint avec succès:', result?.name)
      
      setInvitationCode('')
      setShowJoinForm(false)
      
      // Notification de succès
      alert(`✅ Groupe "${result?.name || 'Groupe'}" rejoint avec succès!`)
    } catch (error: any) {
      console.error('❌ AthleteGroupView: Erreur rejoindre groupe:', error.message)
      alert(`❌ ${error.message}`)
    } finally {
      setJoining(false)
    }
  }

  const handleLeaveGroup = async (groupId: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir quitter ce groupe ?')) {
      try {
        await leaveGroup(groupId)
        if (selectedGroup?.id === groupId) {
          setSelectedGroup(null)
          setShowChat(false)
        }
        
        // Afficher le formulaire de rejointe après avoir quitté
        setShowJoinForm(true)
        
        alert('✅ Groupe quitté avec succès!')
      } catch (error: any) {
        alert(`❌ ${error.message}`)
      }
    }
  }

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
      <LoadingScreen message="Chargement de votre groupe..." />
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Mon Groupe</h1>
        {groups.length === 0 && !showJoinForm && (
          <button
            onClick={() => setShowJoinForm(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-primary-500 hover:bg-primary-600 rounded-lg text-white transition-all duration-200 shadow-lg"
          >
            <Users className="h-5 w-5" />
            <span>Rejoindre un groupe</span>
          </button>
        )}
      </div>

      {/* Formulaire pour rejoindre */}
      {showJoinForm && groups.length === 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 sm:p-6 shadow-lg border border-gray-200 dark:border-gray-700">
          <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4">Rejoindre un groupe</h2>
          <form onSubmit={handleJoinGroup} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Code d'invitation
              </label>
              <input
                type="text"
                value={invitationCode}
                onChange={(e) => setInvitationCode(e.target.value.toUpperCase())}
                className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent font-mono text-center text-base sm:text-lg"
                placeholder="Ex: ABC12345"
                maxLength={8}
                required
                disabled={joining}
              />
            </div>
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
              <button
                type="submit"
                disabled={joining || !invitationCode.trim()}
                className="flex-1 bg-primary-500 hover:bg-primary-600 disabled:opacity-50 px-4 py-2 rounded-lg text-white font-medium transition-colors text-sm sm:text-base"
              >
                {joining ? 'Connexion...' : 'Rejoindre'}
              </button>
              <button
                type="button"
                onClick={() => setShowJoinForm(false)}
                disabled={joining}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-gray-700 dark:text-gray-300 transition-colors text-sm sm:text-base"
              >
                Annuler
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Mes groupes */}
      {groups.length === 0 && !showJoinForm ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 sm:p-8 text-center shadow-lg border border-gray-200 dark:border-gray-700">
          <Users className="h-12 w-12 sm:h-16 sm:w-16 text-gray-400 dark:text-gray-500 mx-auto mb-3 sm:mb-4" />
          <h3 className="text-lg sm:text-xl font-medium text-gray-900 dark:text-white mb-2">Aucun groupe rejoint</h3>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-4 sm:mb-6">
            Demandez un code d'invitation à votre coach pour rejoindre un groupe.
          </p>
          <button
            onClick={() => setShowJoinForm(true)}
            className="px-4 sm:px-6 py-2 sm:py-3 bg-primary-500 hover:bg-primary-600 rounded-lg text-white font-medium transition-colors text-sm sm:text-base"
          >
            Rejoindre un groupe
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {groups.map((group) => (
            <div key={group.id} className="bg-white dark:bg-gray-800 rounded-lg p-4 sm:p-6 shadow-lg border border-gray-200 dark:border-gray-700">
              <div className="flex items-start justify-between mb-3 sm:mb-4">
                <div className="flex items-start space-x-2 sm:space-x-3 flex-1 min-w-0">
                  {/* Photo de groupe */}
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700 flex items-center justify-center flex-shrink-0">
                    {group.group_photo_url ? (
                      <img 
                        src={group.group_photo_url} 
                        alt={`Photo ${group.name}`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          console.error('❌ Erreur chargement photo groupe:', group.group_photo_url)
                          e.currentTarget.style.display = 'none'
                        }}
                      />
                    ) : (
                      <Users className="w-4 h-4 sm:w-6 sm:h-6 text-gray-400" />
                    )}
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
                  {group.coach && (
                    <div className="flex items-center space-x-1 sm:space-x-2 mb-2 sm:mb-3">
                      <Crown className="h-3 w-3 sm:h-4 sm:w-4 text-secondary-500 flex-shrink-0" />
                      <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 truncate">
                        Coach: {group.coach.first_name} {group.coach.last_name}
                      </span>
                    </div>
                  )}
                  </div>
                </div>
                <button
                  onClick={() => handleLeaveGroup(group.id)}
                  className="p-1.5 sm:p-2 text-red-400 hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors flex-shrink-0"
                  title="Quitter le groupe"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>

              <div className="space-y-2 sm:space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Membres total</span>
                  <span className="font-medium text-gray-900 dark:text-white text-sm sm:text-base">
                    {(group.group_members?.length || 0) + (group.coach ? 1 : 0)}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                  <button
                    onClick={() => {
                      setSelectedGroupForMembers(group)
                      setShowMembers(true)
                    }}
                    className="flex items-center justify-center space-x-1 sm:space-x-2 px-3 sm:px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg text-white transition-colors text-xs sm:text-sm"
                  >
                    <Eye className="h-4 w-4" />
                    <span>Membres ({(group.group_members?.length || 0) + (group.coach ? 1 : 0)})</span>
                  </button>

                  <button
                    onClick={() => {
                      setSelectedGroup(group)
                      setShowChat(true)
                    }}
                    className="flex items-center justify-center space-x-1 sm:space-x-2 px-3 sm:px-4 py-2 bg-secondary-500 hover:bg-secondary-600 rounded-lg text-white transition-colors text-xs sm:text-sm"
                  >
                    <MessageCircle className="h-4 w-4" />
                    <span>Chat du groupe</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal des membres */}
      {showMembers && selectedGroupForMembers && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-md">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Membres - {selectedGroupForMembers.name}
              </h3>
              <button
                onClick={() => {
                  setShowMembers(false)
                  setSelectedGroupForMembers(null)
                }}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                ✕
              </button>
            </div>

            <div className="p-4 max-h-96 overflow-y-auto">
              <div className="space-y-3">
                {/* Coach du groupe */}
                {selectedGroupForMembers.coach ? (
                  <div className="bg-secondary-50 dark:bg-secondary-900/20 rounded-lg p-3 border border-secondary-200 dark:border-secondary-800">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-secondary-100 dark:bg-secondary-900 rounded-full flex items-center justify-center overflow-hidden">
                        {selectedGroupForMembers.coach.avatar_url ? (
                          <img 
                            src={selectedGroupForMembers.coach.avatar_url} 
                            alt={`${selectedGroupForMembers.coach.first_name} ${selectedGroupForMembers.coach.last_name}`}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Crown className="h-5 w-5 text-secondary-600 dark:text-secondary-400" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <span className="font-medium text-gray-900 dark:text-white">
                            {selectedGroupForMembers.coach.first_name} {selectedGroupForMembers.coach.last_name}
                          </span>
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-orange-400 to-red-500 text-white shadow-lg">
                            <Crown className="h-3 w-3 mr-1" />
                            Coach
                          </span>
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Créateur du groupe
                        </p>
                      </div>
                    </div>
                  </div>
                ) : null}

                {/* Membres athlètes */}
                <div className="space-y-2">
                  <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-600 pb-1">
                    Athlètes ({selectedGroupForMembers.members?.length || 0})
                  </h5>
                  
                  {selectedGroupForMembers.members && selectedGroupForMembers.members.length > 0 ? (
                    selectedGroupForMembers.members.map((member: any) => (
                    <div key={member.id} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 border border-gray-200 dark:border-gray-600">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center overflow-hidden">
                          {member.athlete?.avatar_url ? (
                            <img 
                              src={member.athlete?.avatar_url} 
                              alt={`${member.athlete?.first_name} ${member.athlete?.last_name}`}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="text-sm font-medium text-primary-600 dark:text-primary-400">
                              {(member.athlete?.first_name?.[0] || 'A')}{(member.athlete?.last_name?.[0] || 'T')}
                            </span>
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <span className="font-medium text-gray-900 dark:text-white">
                              {member.athlete?.first_name || 'Prénom'} {member.athlete?.last_name || 'Nom'}
                            </span>
                            <UserCheck className="h-4 w-4 text-green-500" />
                          </div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Rejoint le {format(new Date(member.joined_at), 'd MMMM yyyy', { locale: fr })}
                          </p>
                        </div>
                      </div>
                    </div>
                    ))
                  ) : (
                    <div className="text-center py-4">
                      <Users className="h-8 w-8 text-gray-400 dark:text-gray-500 mx-auto mb-2" />
                      <p className="text-gray-500 dark:text-gray-400 text-sm">
                        Aucun autre athlète visible dans ce groupe
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Chat Modal */}
      {showChat && selectedGroup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-2xl h-96 flex flex-col">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Chat - {selectedGroup.name}
              </h3>
              <button
                onClick={() => setShowChat(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map((message) => (
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
              ))}
              
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

            <div className="p-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={messageInput}
                  onChange={(e) => handleInputChange(e.target.value)}
                  onBlur={handleInputBlur}
                  onKeyPress={handleKeyPress}
                  placeholder="Tapez votre message..."
                  className="flex-1 px-3 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!messageInput.trim()}
                  className="bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 disabled:opacity-50 p-2 rounded-lg text-white transition-colors"
                >
                  <Send className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}