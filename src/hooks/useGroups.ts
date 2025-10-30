import { useState, useEffect } from 'react'
import useAuth from './useAuth.ts'
import { supabase } from '../lib/supabase'

interface Group {
  id: string
  name: string
  description?: string
  group_photo_url?: string
  coach_id: string
  invitation_code: string
  max_members: number
  created_at: string
  updated_at: string
  members?: GroupMember[]
  coach?: {
    id: string
    first_name?: string
    last_name?: string
    avatar_url?: string
    role: string
  }
}

interface GroupMember {
  id: string
  group_id: string
  athlete_id: string
  joined_at: string
  athlete: {
    id: string
    first_name?: string
    last_name?: string
    avatar_url?: string
    role?: string
  }
}

export function useGroups() {
  const { user, profile } = useAuth()
  const [groups, setGroups] = useState<Group[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (user && profile) {
      if (profile.role === 'coach') {
        loadCoachGroups()
      } else {
        loadAthleteGroups()
      }
    } else {
      setGroups([])
      setLoading(false)
    }
  }, [user, profile])

  const loadCoachGroups = async () => {
    if (!user || !profile || profile.role !== 'coach') return
    
    setLoading(true)
    
    try {
      // Charger les groupes sans membres d'abord
      const { data: groupsData, error: groupsError } = await supabase
        .from('groups')
        .select('*')
        .eq('coach_id', user.id)
        .order('created_at', { ascending: false })
      
      if (groupsError) {
        console.error('❌ ERREUR CHARGEMENT GROUPES COACH:', {
          message: groupsError.message,
          code: groupsError.code,
          details: groupsError.details,
          hint: groupsError.hint
        })
        
        // Essayer le cache local
        const localGroups = localStorage.getItem(`coach_groups_${user.id}`)
        if (localGroups) {
          try {
            const parsedGroups = JSON.parse(localGroups)
            setGroups(parsedGroups)
            console.log('📦 Cache local coach utilisé:', parsedGroups.length, 'groupes')
          } catch (parseError) {
            setGroups([])
          }
        } else {
          setGroups([])
        }
      } else {
        // Initialiser les groupes sans membres d'abord
        const groupsWithoutMembers = (groupsData || []).map(group => ({
          ...group,
          members: []
        }))
        
        setGroups(groupsWithoutMembers)
        
        // Sauvegarder en cache
        localStorage.setItem(`coach_groups_${user.id}`, JSON.stringify(groupsWithoutMembers))
        
        // Charger les membres en arrière-plan
        if (groupsData && groupsData.length > 0) {
          loadMembersForGroups(groupsData)
        }
      }
    } catch (error) {
      console.warn('Erreur réseau groupes coach (ignorée):', error)
      setGroups([])
    } finally {
      setLoading(false)
    }
  }
  
  const loadMembersForGroups = async (groupsData: any[]) => {
    try {
      console.log('👥 Chargement des membres pour', groupsData.length, 'groupes');

      // Charger les membres pour chaque groupe via RPC
      const membersPromises = groupsData.map(async (group) => {
        const { data, error } = await supabase
          .rpc('get_group_members_with_profiles', { group_id_param: group.id });

        if (error) {
          console.error(`Erreur chargement membres groupe ${group.id}:`, error);
          return { groupId: group.id, members: [] };
        }

        const formattedMembers = (data || []).map((m: any) => ({
          id: m.id,
          group_id: m.group_id,
          athlete_id: m.athlete_id,
          joined_at: m.joined_at,
          athlete: {
            id: m.athlete_id,
            first_name: m.athlete_first_name,
            last_name: m.athlete_last_name,
            email: m.athlete_email,
            avatar_url: m.athlete_photo_url,
            role: m.athlete_role
          }
        }));

        return { groupId: group.id, members: formattedMembers };
      });

      const results = await Promise.all(membersPromises);

      const membersByGroup: Record<string, any[]> = {};
      results.forEach(result => {
        membersByGroup[result.groupId] = result.members;
      });

      setGroups(prev => prev.map(group => ({
        ...group,
        members: membersByGroup[group.id] || []
      })));
    } catch (error) {
      console.error('⚠️ Erreur chargement membres:', error);
    }
  }

  const loadAthleteGroups = async () => {
    if (!user || !profile || profile.role !== 'athlete') return

    setLoading(true)

    try {
      // Utiliser la fonction RPC pour charger les groupes avec les infos du coach
      const { data: groupsData, error: groupsError } = await supabase
        .rpc('get_athlete_groups_with_coach', { athlete_id_param: user.id });

      if (groupsError) {
        console.error('Erreur chargement groupes athlète:', groupsError.message);
        setGroups([]);
        return;
      }

      if (!groupsData || groupsData.length === 0) {
        setGroups([]);
        return;
      }

      // Transformer les données en format attendu
      const groupsWithDetails = groupsData.map((g: any) => ({
        id: g.id,
        name: g.name,
        description: g.description,
        group_photo_url: g.group_photo_url,
        coach_id: g.coach_id,
        invitation_code: g.invitation_code,
        max_members: g.max_members,
        created_at: g.created_at,
        updated_at: g.updated_at,
        coach: {
          id: g.coach_id,
          first_name: g.coach_first_name,
          last_name: g.coach_last_name,
          avatar_url: g.coach_photo_url,
          role: 'coach'
        },
        members: []
      }));

      setGroups(groupsWithDetails);
      localStorage.setItem(`athlete_groups_${user.id}`, JSON.stringify(groupsWithDetails));

      // Charger les membres de chaque groupe en arrière-plan
      if (groupsWithDetails.length > 0) {
        loadMembersForGroups(groupsWithDetails);
      }

    } catch (error) {
      console.error('Erreur réseau groupes athlète:', error)

      // Essayer le cache local
      const localGroups = localStorage.getItem(`athlete_groups_${user.id}`)
      if (localGroups) {
        try {
          const parsedGroups = JSON.parse(localGroups)
          setGroups(parsedGroups)
        } catch (parseError) {
          setGroups([])
        }
      } else {
        setGroups([])
      }
    } finally {
      setLoading(false)
    }
  }

  const createGroup = async (groupData: { name: string; description?: string }) => {
    if (!user || !profile) throw new Error('Utilisateur non connecté')
    
    if (!groupData.name || groupData.name.trim().length === 0) {
      throw new Error('Le nom du groupe est obligatoire')
    }

    try {
      // Générer un code d'invitation unique
      const invitationCode = Math.random().toString(36).substring(2, 8).toUpperCase()
      
      const { data, error } = await supabase
        .from('groups')
        .insert({
          name: groupData.name.trim(),
          description: groupData.description?.trim() || null,
          coach_id: user.id,
          invitation_code: invitationCode,
          max_members: 50
        })
        .select()
        .single()
      
      if (error) {
        throw new Error(`Erreur création: ${error.message}`)
      }
      
      console.log('✅ Groupe créé:', data)
      setGroups(prev => [data, ...prev])
      return data
    } catch (error: any) {
      console.error('❌ Erreur createGroup:', error.message)
      throw error
    }
  }

  const joinGroup = async (invitationCode: string) => {
    if (!user || !profile) throw new Error('Utilisateur non connecté')
    if (profile.role !== 'athlete') throw new Error('Seuls les athlètes peuvent rejoindre des groupes')
    
    try {
      const cleanCode = invitationCode.trim().toUpperCase()
      
      // Rechercher le groupe par code d'invitation
      const { data: group, error } = await supabase
        .from('groups')
        .select('*')
        .eq('invitation_code', cleanCode)
        .single()
      
      if (error || !group) {
        throw new Error(`Code d'invitation "${cleanCode}" invalide. Vérifiez avec votre coach.`)
      }
      
      // Vérifier si déjà membre
      const { data: existingMembership } = await supabase
        .from('group_members')
        .select('*')
        .eq('group_id', group.id)
        .eq('athlete_id', user.id)
        .maybeSingle()

      if (existingMembership) {
        // Recharger les groupes pour afficher celui-ci
        await loadAthleteGroups()
        return group
      }
      
      // Rejoindre le groupe
      const { data: memberData, error: joinError } = await supabase
        .from('group_members')
        .insert({
          group_id: group.id,
          athlete_id: user.id
        })
        .select()
        .single()
      
      if (joinError) {
        throw new Error(`Erreur lors de l'ajout au groupe: ${joinError.message}`)
      }
      
      // Recharger les groupes pour avoir les données complètes
      await loadAthleteGroups()
      
      return group
      
    } catch (error: any) {
      console.error('Erreur joinGroup:', error.message)
      throw error
    }
  }

  const leaveGroup = async (groupId: string) => {
    if (!user || !profile) throw new Error('Utilisateur non connecté')
    if (profile.role !== 'athlete') throw new Error('Seuls les athlètes peuvent quitter des groupes')
    
    try {
      const { error } = await supabase
        .from('group_members')
        .delete()
        .eq('group_id', groupId)
        .eq('athlete_id', user.id)
      
      if (error) {
        throw new Error(`Erreur quitter: ${error.message}`)
      }
      
      setGroups(prev => prev.filter(g => g.id !== groupId))
      
      // Nettoyer le cache local
      localStorage.removeItem(`athlete_groups_${user.id}`)
      
    } catch (error: any) {
      console.error('Erreur quitter groupe:', error)
      throw error
    }
  }

  const deleteGroup = async (groupId: string) => {
    if (!user || !profile) throw new Error('Utilisateur non connecté')
    if (profile.role !== 'coach') throw new Error('Seuls les coachs peuvent supprimer des groupes')
    
    try {
      const { error } = await supabase
        .from('groups')
        .delete()
        .eq('id', groupId)
        .eq('coach_id', user.id)
      
      if (error) {
        throw new Error(`Erreur suppression: ${error.message}`)
      }
      
      setGroups(prev => prev.filter(g => g.id !== groupId))
    } catch (error: any) {
      console.error('Erreur suppression groupe:', error)
      throw error
    }
  }

  const updateGroupPhoto = async (groupId: string, photoFile: File) => {
    if (!user || !profile) throw new Error('Utilisateur non connecté')
    if (profile.role !== 'coach' && profile.role !== 'developer') throw new Error('Seuls les coachs peuvent modifier la photo')
    
    try {
      // Vérifier que le fichier est valide
      if (!photoFile.type.startsWith('image/')) {
        throw new Error('Le fichier doit être une image')
      }
      
      if (photoFile.size > 5 * 1024 * 1024) { // 5MB
        throw new Error('L\'image doit faire moins de 5MB')
      }
      
      // Générer un nom de fichier unique
      const fileExt = photoFile.name.split('.').pop()
      const fileName = `${groupId}/group-photo-${Date.now()}.${fileExt}`
      
      // Upload vers Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('group-photos')
        .upload(fileName, photoFile, { 
          upsert: true,
          contentType: photoFile.type
        })
      
      if (uploadError) {
        console.error('Erreur upload Storage:', uploadError)
        throw new Error(`Erreur upload: ${uploadError.message}`)
      }
      
      // Obtenir l'URL publique
      const { data: { publicUrl } } = supabase.storage
        .from('group-photos')
        .getPublicUrl(fileName)
      
      // Mettre à jour la base de données
      const { data: updateData, error: updateError } = await supabase
        .from('groups')
        .update({ group_photo_url: publicUrl })
        .eq('id', groupId)
        .eq('coach_id', user.id)
        .select()
        .single()
      
      if (updateError) {
        console.error('Erreur mise à jour DB:', updateError)
        throw new Error(`Erreur sauvegarde: ${updateError.message}`)
      }
      
      // Mettre à jour l'état local avec les données de Supabase
      setGroups(prev => prev.map(g => 
        g.id === groupId ? { ...g, group_photo_url: updateData.group_photo_url } : g
      ))
      
      return publicUrl
    } catch (error) {
      console.error('Erreur updateGroupPhoto:', error)
      throw error
    }
  }

  return {
    groups,
    loading,
    createGroup,
    joinGroup,
    leaveGroup,
    deleteGroup,
    updateGroupPhoto,
    loadCoachGroups,
    loadAthleteGroups
  }
}