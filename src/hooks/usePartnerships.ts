import { useState, useEffect } from 'react'
import useAuth from './useAuth.ts'
import { supabase } from '../lib/supabase'
import { Partnership } from '../types'

export function usePartnerships() {
  const { user } = useAuth()
  const [partnerships, setPartnerships] = useState<Partnership[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadPartnerships()
  }, [])

  const loadPartnerships = async () => {
    try {
      console.log('🤝 Chargement partenariats depuis Supabase')
      
      const { data, error } = await supabase
        .from('partnerships')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (error) {
        console.error('❌ Erreur chargement partenariats:', error.message)
        setPartnerships([])
      } else {
        console.log('✅ Partenariats chargés:', data?.length || 0)
        setPartnerships(data || [])
      }
    } catch (error) {
      console.error('💥 Erreur réseau partenariats:', error)
      setPartnerships([])
    } finally {
      setLoading(false)
    }
  }

  const createPartnership = async (partnershipData: Omit<Partnership, 'id' | 'created_at' | 'updated_at'>) => {
    if (!user) throw new Error('Utilisateur non connecté')
    if (user.email !== 'kleveennsv@gmail.com') throw new Error('Accès non autorisé')
    
    try {
      console.log('🤝 Création partenariat:', partnershipData)
      
      const { data, error } = await supabase
        .from('partnerships')
        .insert(partnershipData)
        .select()
        .single()
      
      if (error) {
        console.error('❌ Erreur création partenariat:', error.message)
        throw error
      }
      
      console.log('✅ Partenariat créé:', data)
      setPartnerships(prev => [data, ...prev])
      return data
    } catch (error) {
      console.error('💥 Erreur createPartnership:', error)
      throw error
    }
  }

  const updatePartnership = async (id: string, updates: Partial<Partnership>) => {
    if (!user) throw new Error('Utilisateur non connecté')
    if (user.email !== 'kleveennsv@gmail.com') throw new Error('Accès non autorisé')
    
    try {
      console.log('🔄 Mise à jour partenariat:', id, updates)
      
      const { data, error } = await supabase
        .from('partnerships')
        .update(updates)
        .eq('id', id)
        .select()
        .single()
      
      if (error) {
        console.error('❌ Erreur mise à jour partenariat:', error.message)
        throw error
      }
      
      console.log('✅ Partenariat mis à jour:', data)
      setPartnerships(prev => prev.map(p => p.id === id ? data : p))
      return data
    } catch (error) {
      console.error('💥 Erreur updatePartnership:', error)
      throw error
    }
  }

  const deletePartnership = async (id: string) => {
    if (!user) throw new Error('Utilisateur non connecté')
    if (user.id !== '75a17559-b45b-4dd1-883b-ce8ccfe03f0f') throw new Error('Accès non autorisé')
    
    try {
      console.log('🗑️ Suppression partenariat:', id)
      
      const { error } = await supabase
        .from('partnerships')
        .delete()
        .eq('id', id)
      
      if (error) {
        console.error('❌ Erreur suppression partenariat:', error.message)
        throw error
      }
      
      console.log('✅ Partenariat supprimé')
      setPartnerships(prev => prev.filter(p => p.id !== id))
    } catch (error) {
      console.error('💥 Erreur deletePartnership:', error)
      throw error
    }
  }

  const uploadPartnershipPhoto = async (file: File) => {
    if (!user) throw new Error('Utilisateur non connecté')
    if (user.id !== '75a17559-b45b-4dd1-883b-ce8ccfe03f0f') throw new Error('Accès non autorisé')
    
    try {
      console.log('📸 Upload photo partenariat:', file.name)
      
      // Vérifier le fichier
      if (!file.type.startsWith('image/')) {
        throw new Error('Le fichier doit être une image')
      }
      
      if (file.size > 5 * 1024 * 1024) { // 5MB
        throw new Error('L\'image doit faire moins de 5MB')
      }
      
      // Générer un nom de fichier unique
      const fileExt = file.name.split('.').pop()
      const fileName = `partner-${Date.now()}.${fileExt}`
      
      console.log('📤 Upload vers Supabase Storage:', fileName)
      
      // Upload vers Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('partner-photos')
        .upload(fileName, file, { 
          upsert: true,
          contentType: file.type
        })
      
      if (uploadError) {
        console.error('❌ Erreur upload Storage:', uploadError)
        throw new Error(`Erreur upload: ${uploadError.message}`)
      }
      
      console.log('✅ Fichier uploadé:', uploadData.path)
      
      // Obtenir l'URL publique
      const { data: { publicUrl } } = supabase.storage
        .from('partner-photos')
        .getPublicUrl(fileName)
      
      console.log('🔗 URL publique générée:', publicUrl)
      return publicUrl
    } catch (error) {
      console.error('💥 Erreur uploadPartnershipPhoto:', error)
      throw error
    }
  }

  const isDeveloper = () => {
    return user?.id === '75a17559-b45b-4dd1-883b-ce8ccfe03f0f'
  }

  return {
    partnerships,
    loading,
    createPartnership,
    updatePartnership,
    deletePartnership,
    uploadPartnershipPhoto,
    loadPartnerships,
    isDeveloper
  }
}