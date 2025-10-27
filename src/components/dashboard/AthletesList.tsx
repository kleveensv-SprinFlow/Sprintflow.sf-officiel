import React, { useState } from 'react'
import { ArrowLeft, User, Users, Trophy, Dumbbell, Calendar } from 'lucide-react'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { AthleteDetails } from '../groups/AthleteDetails'

interface AthletesListProps {
  groups: any[]
  onBack: () => void
  onAthleteClick: (athlete: any) => void
}

export const AthletesList: React.FC<AthletesListProps> = ({ groups, onBack, onAthleteClick }) => {

  // Collecter tous les athlètes de tous les groupes
  const allAthletes = React.useMemo(() => {
    console.log('🔍 Analyse des groupes pour extraire les athlètes:', groups.length, 'groupes')
    
    const athletesMap = new Map()
    
    groups.forEach(group => {
      console.log(`📊 Groupe "${group.name}":`, group.members?.length || 0, 'membres')
      
      if (group.members) {
        group.members.forEach((member: any) => {
          console.log('👤 Traitement membre:', {
            athlete_id: member.athlete_id,
            athlete_data: member.athlete,
            profiles_data: member.profiles,
            first_name: member.athlete?.first_name || member.profiles?.first_name,
            last_name: member.athlete?.last_name || member.profiles?.last_name
          })
          
          if (!athletesMap.has(member.athlete_id)) {
            athletesMap.set(member.athlete_id, {
              id: member.athlete_id,
              first_name: member.athlete?.first_name || member.profiles?.first_name || '',
              last_name: member.athlete?.last_name || member.profiles?.last_name || '',
              photo_url: member.athlete?.photo_url || member.profiles?.photo_url,
              joined_at: member.joined_at,
              groups: [group.name]
            })
          } else {
            // Ajouter le groupe à la liste si l'athlète est dans plusieurs groupes
            const existing = athletesMap.get(member.athlete_id)
            existing.groups.push(group.name)
          }
        })
      } else {
        console.log('⚠️ Aucun membre trouvé pour le groupe:', group.name)
      }
    })
    
    const result = Array.from(athletesMap.values())
    console.log('✅ Athlètes extraits au total:', result.length)
    result.forEach(athlete => {
      console.log('  -', athlete.first_name || 'Sans prénom', athlete.last_name || 'Sans nom', 'dans', athlete.groups.length, 'groupe(s)')
    })
    
    return result
  }, [groups])


  return (
    <div className="space-y-6">
      {/* Header avec retour */}
      <div className="flex items-center space-x-4">
        <button
          onClick={onBack}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          <ArrowLeft className="h-5 w-5 text-gray-600 dark:text-gray-300" />
        </button>
        
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Tous mes Athlètes
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {allAthletes.length} athlète{allAthletes.length > 1 ? 's' : ''} dans {groups.length} groupe{groups.length > 1 ? 's' : ''}
          </p>
        </div>
      </div>

      {/* Statistiques rapides */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <Users className="h-6 w-6 text-primary-500" />
            <div>
              <div className="text-xl font-bold text-gray-900 dark:text-white">{allAthletes.length}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Athlètes total</div>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <Users className="h-6 w-6 text-secondary-500" />
            <div>
              <div className="text-xl font-bold text-gray-900 dark:text-white">{groups.length}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Groupes actifs</div>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <Calendar className="h-6 w-6 text-accent-500" />
            <div>
              <div className="text-xl font-bold text-gray-900 dark:text-white">
                {allAthletes.filter(a => {
                  const joinDate = new Date(a.joined_at)
                  const weekAgo = new Date()
                  weekAgo.setDate(weekAgo.getDate() - 7)
                  return joinDate >= weekAgo
                }).length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Nouveaux cette semaine</div>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <Trophy className="h-6 w-6 text-green-500" />
            <div>
              <div className="text-xl font-bold text-gray-900 dark:text-white">
                {Math.round(allAthletes.length > 0 ? allAthletes.length * 0.8 : 0)}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Actifs cette semaine</div>
            </div>
          </div>
        </div>
      </div>

      {/* Liste des athlètes */}
      {allAthletes.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-8 text-center shadow-lg border border-gray-200 dark:border-gray-700">
          <Users className="h-16 w-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
          <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">Aucun athlète</h3>
          <p className="text-gray-600 dark:text-gray-400">
            Créez des groupes et invitez des athlètes pour commencer.
          </p>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg border border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
            Liste complète des athlètes
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {allAthletes.map((athlete) => (
              <button
                key={athlete.id}
                onClick={() => onAthleteClick(athlete)}
                className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600 hover:shadow-lg hover:border-primary-300 dark:hover:border-primary-600 transition-all duration-200 text-left"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center overflow-hidden flex-shrink-0">
                    {athlete.photo_url ? (
                      <img 
                        src={athlete.photo_url} 
                        alt={`${athlete.first_name} ${athlete.last_name}`}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-lg font-medium text-primary-600 dark:text-primary-400">
                        {athlete.first_name[0]}{athlete.last_name[0]}
                      </span>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-gray-900 dark:text-white truncate">
                      {athlete.first_name || 'Prénom'} {athlete.last_name || 'Nom'}
                    </h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Rejoint le {format(new Date(athlete.joined_at), 'd MMM yyyy', { locale: fr })}
                    </p>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {athlete.groups.map((groupName: string, index: number) => (
                        <span 
                          key={index}
                          className="text-xs bg-primary-100 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 px-2 py-1 rounded"
                        >
                          {groupName}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Groupes par groupe */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
          Athlètes par groupe
        </h2>
        
        {groups.map((group) => (
          <div key={group.id} className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {group.name}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {group.members?.length || 0} membre{(group.members?.length || 0) > 1 ? 's' : ''}
                </p>
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Code: <span className="font-mono font-bold text-primary-500">{group.invitation_code}</span>
              </div>
            </div>
            
            {group.members && group.members.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {group.members.map((member: any) => (
                  <button
                    key={member.id}
                    onClick={() => onAthleteClick({
                      id: member.athlete_id,
                      first_name: member.athlete?.first_name || member.profiles?.first_name || 'Prénom',
                      last_name: member.athlete?.last_name || member.profiles?.last_name || 'Nom',
                      photo_url: member.athlete?.photo_url || member.profiles?.photo_url,
                      joined_at: member.joined_at,
                      groups: [group.name]
                    })}
                    className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 border border-gray-200 dark:border-gray-600 hover:shadow-md hover:border-primary-300 dark:hover:border-primary-600 transition-all duration-200 text-left"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center overflow-hidden flex-shrink-0">
                        {member.athlete?.photo_url ? (
                          <img 
                            src={member.athlete.photo_url || member.profiles?.photo_url} 
                            alt={`${member.athlete?.first_name || member.profiles?.first_name} ${member.athlete?.last_name || member.profiles?.last_name}`}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-sm font-medium text-primary-600 dark:text-primary-400">
                            {(member.athlete?.first_name?.[0] || member.profiles?.first_name?.[0] || 'A')}{(member.athlete?.last_name?.[0] || member.profiles?.last_name?.[0] || 'T')}
                          </span>
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <h5 className="font-medium text-gray-900 dark:text-white text-sm truncate">
                          {member.athlete?.first_name || member.profiles?.first_name || 'Prénom'} {member.athlete?.last_name || member.profiles?.last_name || 'Nom'}
                        </h5>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {format(new Date(member.joined_at), 'd MMM', { locale: fr })}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="text-center py-6">
                <Users className="h-8 w-8 text-gray-400 dark:text-gray-500 mx-auto mb-2" />
                <p className="text-gray-500 dark:text-gray-400 text-sm">
                  Aucun athlète dans ce groupe
                </p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};