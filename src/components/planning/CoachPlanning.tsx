import React, { useState, useEffect } from 'react'
import { Calendar, Users, Target, Plus, Clock, Dumbbell, Trash2, Copy, ArrowLeft, ArrowRight, CreditCard as Edit, X } from 'lucide-react'
import { format, startOfWeek, addDays, isSameDay, addWeeks, subWeeks } from 'date-fns'
import { fr } from 'date-fns/locale'
import { useGroups } from '../../hooks/useGroups'
import { usePlanning } from '../../hooks/usePlanning'
import { SessionTemplateForm } from './SessionTemplateForm'

export const CoachPlanning: React.FC = () => {
  const { groups } = useGroups()
  const { sessionTemplates, createSessionTemplate, updateSessionTemplate, deleteSession, setSelectedGroup, copyPreviousWeek } = usePlanning()
  const [localSelectedGroup, setLocalSelectedGroup] = useState<any>(null)
  const [currentWeek, setCurrentWeek] = useState<Date>(new Date())
  const [showSessionForm, setShowSessionForm] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [showSessionDetails, setShowSessionDetails] = useState(false)
  const [selectedSession, setSelectedSession] = useState<any>(null)
  const [editingSession, setEditingSession] = useState<any>(null)

  const daysOfWeek = [
    { number: 1, name: 'Lundi', short: 'Lun' },
    { number: 2, name: 'Mardi', short: 'Mar' },
    { number: 3, name: 'Mercredi', short: 'Mer' },
    { number: 4, name: 'Jeudi', short: 'Jeu' },
    { number: 5, name: 'Vendredi', short: 'Ven' },
    { number: 6, name: 'Samedi', short: 'Sam' },
    { number: 7, name: 'Dimanche', short: 'Dim' }
  ]

  useEffect(() => {
    if (groups.length > 0 && !localSelectedGroup) {
      const firstGroup = groups[0]
      setLocalSelectedGroup(firstGroup)
      setSelectedGroup(firstGroup.id)
    }
  }, [groups, localSelectedGroup, setSelectedGroup])

  const weekStart = startOfWeek(currentWeek, { weekStartsOn: 1 })
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))

  const getSessionForDate = (date: Date) => {
    const dateString = format(date, 'yyyy-MM-dd')
    return sessionTemplates.find(template => {
      const templateDate = new Date(template.created_at)
      return format(templateDate, 'yyyy-MM-dd') === dateString
    })
  }

  const handleDayClick = (date: Date) => {
    if (!localSelectedGroup) {
      alert('Veuillez d\'abord sélectionner un groupe')
      return
    }
    setSelectedDate(date)
    setEditingSession(null)
    setShowSessionForm(true)
  }

  const handleSaveSession = async (sessionData: any) => {
    if (!localSelectedGroup || !selectedDate) return
    
    try {
      console.log('💾 Sauvegarde séance pour groupe:', localSelectedGroup.id)
      console.log('📅 Date sélectionnée:', selectedDate)
      console.log('📋 Données séance:', sessionData)
      
      if (editingSession) {
        await updateSessionTemplate(editingSession.id, {
          ...sessionData,
          updated_at: new Date().toISOString()
        })
      } else {
        await createSessionTemplate({
          ...sessionData,
          created_at: selectedDate ? format(selectedDate, 'yyyy-MM-dd') : new Date().toISOString()
        })
      }
      
      setSelectedDate(null)
      setShowSessionForm(false)
      setEditingSession(null)
      
      const successDiv = document.createElement('div')
      successDiv.innerHTML = editingSession 
        ? '✅ Séance mise à jour avec succès!'
        : `✅ Séance assignée à ${localSelectedGroup.members?.length || 0} athlète(s)!`
      successDiv.style.cssText = `
        position: fixed; top: 20px; right: 20px; background: #10B981; color: white;
        padding: 12px 20px; border-radius: 8px; font-weight: 500; z-index: 9999;
        box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
      `
      document.body.appendChild(successDiv)
      setTimeout(() => successDiv.remove(), 3000)
    } catch (error: any) {
      console.error('Erreur création séance:', error)
      
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

  const handleSessionClick = (session: any, day: Date) => {
    setSelectedSession(session)
    setSelectedDate(day)
    setShowSessionDetails(true)
  }

  const handleEditSession = (session: any, day: Date) => {
    setEditingSession(session)
    setSelectedDate(day)
    setShowSessionForm(true)
  }

  const handleDeleteSession = async (sessionId: string, sessionName: string, day?: Date) => {
    if (window.confirm(`Êtes-vous sûr de vouloir supprimer la séance "${sessionName}" pour tous les athlètes ?`)) {
      try {
        await deleteSession(sessionId)
        
        const successDiv = document.createElement('div')
        successDiv.innerHTML = '✅ Séance supprimée pour tous les athlètes!'
        successDiv.style.cssText = `
          position: fixed; top: 20px; right: 20px; background: #10B981; color: white;
          padding: 12px 20px; border-radius: 8px; font-weight: 500; z-index: 9999;
          box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
        `
        document.body.appendChild(successDiv)
        setTimeout(() => successDiv.remove(), 3000)
      } catch (error: any) {
        console.error('Erreur suppression séance:', error)
        
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

  const getSessionTypeColor = (type: string) => {
    switch (type) {
      case 'training': return 'bg-green-100 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-800 dark:text-green-200'
      case 'recovery': return 'bg-blue-100 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-200'
      case 'rest': return 'bg-gray-100 dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-800 dark:text-gray-200'
      default: return 'bg-gray-100 dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-800 dark:text-gray-200'
    }
  }

  const getIntensityColor = (intensity?: string) => {
    switch (intensity) {
      case 'low': return 'text-green-600 dark:text-green-400'
      case 'medium': return 'text-yellow-600 dark:text-yellow-400'
      case 'high': return 'text-red-600 dark:text-red-400'
      default: return 'text-gray-600 dark:text-gray-400'
    }
  }

  const handleGroupChange = (groupId: string) => {
    const group = groups.find(g => g.id === groupId)
    console.log('🔄 Changement de groupe vers:', group?.name)
    setLocalSelectedGroup(group || null)
    setSelectedGroup(groupId)
  }

  const handleCopyPreviousWeek = async () => {
    if (!localSelectedGroup) {
      alert('Veuillez d\'abord sélectionner un groupe')
      return
    }

    try {
      const previousWeek = subWeeks(currentWeek, 1)
      const previousWeekStart = startOfWeek(previousWeek, { weekStartsOn: 1 })
      const previousWeekDays = Array.from({ length: 7 }, (_, i) => addDays(previousWeekStart, i))
      
      // Récupérer les sessions de la semaine précédente
      const previousWeekSessions = previousWeekDays.map(day => {
        const dateString = format(day, 'yyyy-MM-dd')
        return sessionTemplates.find(template => {
          const templateDate = new Date(template.created_at)
          return format(templateDate, 'yyyy-MM-dd') === dateString
        })
      }).filter(Boolean)

      if (previousWeekSessions.length === 0) {
        alert('Aucune séance trouvée dans la semaine précédente')
        return
      }

      // Copier chaque session vers la semaine courante
      const currentWeekStart = startOfWeek(currentWeek, { weekStartsOn: 1 })
      let copiedCount = 0

      for (const session of previousWeekSessions) {
        const sessionDate = new Date(session.created_at)
        const dayOfWeek = sessionDate.getDay()
        const adjustedDayOfWeek = dayOfWeek === 0 ? 6 : dayOfWeek - 1 // Convertir dimanche (0) en 6, et décaler les autres
        const newDate = addDays(currentWeekStart, adjustedDayOfWeek)
        
        // Vérifier si une session existe déjà ce jour-là
        const existingSession = getSessionForDate(newDate)
        if (!existingSession) {
          await createSessionTemplate({
            name: session.name,
            description: session.description,
            session_type: session.session_type,
            duration_minutes: session.duration_minutes,
            intensity: session.intensity,
            exercises: session.exercises,
            group_id: localSelectedGroup.id,
            created_at: format(newDate, 'yyyy-MM-dd')
          })
          copiedCount++
        }
      }

      if (copiedCount > 0) {
        const successDiv = document.createElement('div')
        successDiv.innerHTML = `✅ ${copiedCount} séance(s) copiée(s) depuis la semaine précédente!`
        successDiv.style.cssText = `
          position: fixed; top: 20px; right: 20px; background: #10B981; color: white;
          padding: 12px 20px; border-radius: 8px; font-weight: 500; z-index: 9999;
          box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
        `
        document.body.appendChild(successDiv)
        setTimeout(() => successDiv.remove(), 3000)
      } else {
        alert('Toutes les séances existent déjà pour cette semaine')
      }
    } catch (error: any) {
      console.error('Erreur copie semaine précédente:', error)
      
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

  // Si le formulaire de séance est ouvert
  if (showSessionForm) {
    return (
      <SessionTemplateForm
        onSave={handleSaveSession}
        onCancel={() => {
          setShowSessionForm(false)
          setSelectedDate(null)
          setEditingSession(null)
        }}
        existingTemplates={sessionTemplates}
        onUseTemplate={(template) => {
          handleSaveSession(template)
        }}
        selectedDate={selectedDate}
        selectedGroupId={localSelectedGroup?.id}
        selectedGroupName={localSelectedGroup?.name}
        editingSession={editingSession}
      />
    )
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Planning Coach</h1>
        <p className="text-gray-600 dark:text-gray-400">Créez et assignez des programmes d'entraînement</p>
      </div>

      {/* Sélection de groupe */}
      {groups.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-lg border border-gray-200 dark:border-gray-700">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Groupe sélectionné
          </label>
          <select
            value={localSelectedGroup?.id || ''}
            onChange={(e) => handleGroupChange(e.target.value)}
            className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            {groups.map((group) => (
              <option key={group.id} value={group.id}>
                {group.name} ({group.members?.length || 0} athlète{(group.members?.length || 0) > 1 ? 's' : ''})
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Navigation semaine */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-3 sm:p-4 shadow-lg border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setCurrentWeek(subWeeks(currentWeek, 1))}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors touch-manipulation"
          >
            <ArrowLeft className="h-5 w-5 text-gray-600 dark:text-gray-300" />
          </button>
          
          <div className="text-center">
            <h2 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">
              {format(weekStart, 'MMMM yyyy', { locale: fr })}
            </h2>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
              Semaine du {format(weekStart, 'd')} au {format(addDays(weekStart, 6), 'd MMMM', { locale: fr })}
            </p>
          </div>
          
          <button
            onClick={() => setCurrentWeek(addWeeks(currentWeek, 1))}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors touch-manipulation"
          >
            <ArrowRight className="h-5 w-5 text-gray-600 dark:text-gray-300" />
          </button>
        </div>
      </div>

      {/* Planning de la semaine */}
      {localSelectedGroup ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-3 sm:p-6 shadow-lg border border-gray-200 dark:border-gray-700">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 sm:mb-6 space-y-3 sm:space-y-0">
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
                Planning - {localSelectedGroup.name}
              </h2>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
                {localSelectedGroup.members?.length || 0} athlète{(localSelectedGroup.members?.length || 0) > 1 ? 's' : ''} dans ce groupe
              </p>
              <p className="text-sm text-primary-500 mt-1">
                💡 Cliquez sur un jour pour ajouter une séance
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-3 w-full sm:w-auto">
              <button
                onClick={handleCopyPreviousWeek}
                className="flex items-center justify-center space-x-2 px-3 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg text-white transition-all duration-200 shadow-lg text-xs sm:text-sm"
                title="Copier la semaine précédente"
              >
                <Copy className="h-4 w-4" />
                <span>Copier semaine précédente</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 sm:gap-4">
            {weekDays.map((day, index) => {
              const session = getSessionForDate(day)
              const isToday = isSameDay(day, new Date())
              
              return (
                <div
                  key={day.toISOString()}
                  className={`min-h-[100px] sm:min-h-[120px] border rounded-lg p-2 sm:p-3 transition-all duration-200 cursor-pointer hover:shadow-md ${
                    isToday
                      ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20' 
                      : 'border-gray-200 dark:border-gray-600 hover:border-primary-300 dark:hover:border-primary-600'
                  }`}
                  onClick={() => handleDayClick(day)}
                >
                  <div className="text-center mb-2 sm:mb-3">
                    <div className={`text-xs sm:text-sm font-medium ${isToday ? 'text-primary-600 dark:text-primary-400' : 'text-gray-900 dark:text-white'}`}>
                      {daysOfWeek[index].short}
                    </div>
                    <div className={`text-base sm:text-lg font-bold ${isToday ? 'text-primary-600 dark:text-primary-400' : 'text-gray-700 dark:text-gray-300'}`}>
                      {format(day, 'd')}
                    </div>
                  </div>

                  {session ? (
                    <div 
                      className={`p-2 sm:p-3 rounded-lg border cursor-pointer hover:shadow-md transition-all ${getSessionTypeColor(session.session_type || 'training')}`}
                      onClick={(e) => {
                        e.stopPropagation()
                        handleSessionClick(session, day)
                      }}
                    >
                      <div className="flex items-start justify-between mb-1 sm:mb-2">
                        <div className="text-xs font-medium truncate flex-1 leading-tight" title={session.name}>
                          {session.name}
                        </div>
                        <div className="flex items-center space-x-1 ml-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleEditSession(session, day)
                            }}
                            className="p-0.5 sm:p-1 text-blue-400 hover:text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/20 rounded transition-colors flex-shrink-0"
                            title="Modifier cette séance"
                          >
                            <Edit className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleDeleteSession(session.id, session.name)
                            }}
                            className="p-0.5 sm:p-1 text-red-400 hover:text-red-600 hover:bg-red-100 dark:hover:bg-red-900/20 rounded transition-colors flex-shrink-0"
                            title="Supprimer cette séance"
                          >
                            <Trash2 className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                          </button>
                        </div>
                      </div>
                      <div className="space-y-0.5 sm:space-y-1">
                        <div className="flex items-center space-x-1 text-xs">
                          <Clock className="h-2.5 w-2.5 sm:h-3 sm:w-3 flex-shrink-0" />
                          <span>{session.duration_minutes || 60}min</span>
                        </div>
                        <div className="flex items-center space-x-1 text-xs">
                          <Target className="h-2.5 w-2.5 sm:h-3 sm:w-3 flex-shrink-0" />
                          <span className={getIntensityColor(session.intensity)}>
                            {session.intensity === 'low' ? 'Faible' : session.intensity === 'medium' ? 'Moyenne' : 'Élevée'}
                          </span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="h-12 sm:h-16 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded text-center flex items-center justify-center">
                      <span className="text-gray-500 dark:text-gray-400 text-xs">Ajouter</span>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-8 text-center shadow-lg border border-gray-200 dark:border-gray-700">
          <Users className="h-16 w-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
          <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">Aucun groupe sélectionné</h3>
          <p className="text-gray-600 dark:text-gray-400">
            Créez un groupe dans la section "Mes Groupes" pour commencer à planifier.
          </p>
        </div>
      )}

      {/* Modal détails de séance */}
      {showSessionDetails && selectedSession && selectedDate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white dark:bg-gray-800 p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                Détails de la séance
              </h3>
              <button
                onClick={() => {
                  setShowSessionDetails(false)
                  setSelectedSession(null)
                  setSelectedDate(null)
                }}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6">
              <div className="space-y-4">
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                  <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">{selectedSession.name}</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-blue-600" />
                      <span className="text-blue-700 dark:text-blue-300">
                        {format(selectedDate, 'EEEE d MMMM yyyy', { locale: fr })}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4 text-blue-600" />
                      <span className="text-blue-700 dark:text-blue-300">
                        {selectedSession.duration_minutes || 60} minutes
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Target className="h-4 w-4 text-blue-600" />
                      <span className={`font-medium ${getIntensityColor(selectedSession.intensity)}`}>
                        Intensité {selectedSession.intensity === 'low' ? 'faible' : selectedSession.intensity === 'medium' ? 'moyenne' : 'élevée'}
                      </span>
                    </div>
                  </div>
                </div>
                
                {selectedSession.description && (
                  <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                    <h5 className="font-medium text-gray-900 dark:text-white mb-2">Programme :</h5>
                    <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap text-sm">
                      {selectedSession.description}
                    </p>
                  </div>
                )}
                
                <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Assigné à {localSelectedGroup?.members?.length || 0} athlète{(localSelectedGroup?.members?.length || 0) > 1 ? 's' : ''}
                  </div>
                  
                  <div className="flex space-x-3">
                    <button
                      onClick={() => {
                        setShowSessionDetails(false)
                        handleEditSession(selectedSession, selectedDate)
                      }}
                      className="flex items-center space-x-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg text-white transition-colors"
                    >
                      <Edit className="h-4 w-4" />
                      <span>Modifier</span>
                    </button>
                    
                    <button
                      onClick={() => {
                        setShowSessionDetails(false)
                        handleDeleteSession(selectedSession.id, selectedSession.name, selectedDate)
                      }}
                      className="flex items-center space-x-2 px-4 py-2 bg-red-500 hover:bg-red-600 rounded-lg text-white transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                      <span>Supprimer</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}