// Fichier: src/hooks/useVideoAnalysisLogs.ts

import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './useAuth';
import { SquatAnalysisResult } from './useVideoAnalysis';

// Définir le type pour une entrée de log d'analyse
export interface VideoAnalysisLog {
  id: string;
  user_id: string;
  exercise_name: string;
  video_url: string;
  analysis_status: 'PENDING' | 'COMPLETED' | 'ERROR';
  result_json: SquatAnalysisResult | null;
  created_at: string;
  shared_with_coach: boolean;
}

export function useVideoAnalysisLogs() {
  const { user } = useAuth();
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Uploade une vidéo sur le bucket de stockage 'video_analysis'.
   * @param videoFile - Le fichier vidéo à uploader.
   * @param movementSpecId - L'ID du mouvement pour nommer le fichier.
   * @returns L'URL publique de la vidéo uploadée.
   */
  const uploadVideo = async (videoFile: File, movementSpecId: string): Promise<string> => {
    if (!user) throw new Error("Utilisateur non authentifié.");

    setLoading(true);
    setError(null);

    const filePath = `${user.id}/${movementSpecId}_${Date.now()}`;

    try {
      const { error: uploadError } = await supabase.storage
        .from('video_analysis')
        .upload(filePath, videoFile);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('video_analysis')
        .getPublicUrl(filePath);

      return data.publicUrl;
    } catch (e) {
      const error = e as Error;
      setError(`Erreur d'upload vidéo: ${error.message}`);
      throw e;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Crée une nouvelle entrée de log dans la base de données.
   * @param exerciseName - Le nom de l'exercice.
   * @param videoUrl - L'URL de la vidéo.
   * @returns L'enregistrement de log créé.
   */
  const createAnalysisLog = async (exerciseName: string, videoUrl: string): Promise<VideoAnalysisLog> => {
     if (!user) throw new Error("Utilisateur non authentifié.");

     const { data, error } = await supabase
        .from('video_analysis_logs')
        .insert({
            user_id: user.id,
            exercise_name: exerciseName,
            video_url: videoUrl,
            analysis_status: 'PENDING',
        })
        .select()
        .single();

     if (error) throw error;
     return data;
  };

  /**
   * Met à jour un log d'analyse existant avec le résultat.
   * @param logId - L'ID du log à mettre à jour.
   * @param status - Le nouveau statut.
   * @param result - Le JSON de résultat.
   */
  const updateAnalysisLog = async (logId: string, status: 'COMPLETED' | 'ERROR', result: SquatAnalysisResult | null) => {
    const { error } = await supabase
        .from('video_analysis_logs')
        .update({
            analysis_status: status,
            result_json: result,
        })
        .eq('id', logId);

    if (error) throw error;
  };

  /**
   * Marque une analyse comme partagée avec le coach.
   * @param logId - L'ID du log à partager.
   */
  const shareWithCoach = async (logId: string) => {
    const { error } = await supabase
      .from('video_analysis_logs')
      .update({ shared_with_coach: true })
      .eq('id', logId);

    if (error) throw error;
  };

  /**
   * Récupère les analyses d'un athlète spécifique.
   * @param athleteId - L'ID de l'athlète.
   * @returns Une liste d'analyses.
   */
  const getAthleteAnalysisLogs = async (athleteId: string): Promise<VideoAnalysisLog[]> => {
    const { data, error } = await supabase
        .from('video_analysis_logs')
        .select('*')
        .eq('user_id', athleteId)
        .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  };

  return {
    loading,
    error,
    uploadVideo,
    createAnalysisLog,
    updateAnalysisLog,
    shareWithCoach,
    getAthleteAnalysisLogs
  };
}
