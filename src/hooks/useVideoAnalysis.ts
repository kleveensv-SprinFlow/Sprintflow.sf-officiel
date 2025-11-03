// Fichier: src/hooks/useVideoAnalysis.ts

import { useState, useEffect, useRef } from 'react';

// Types importés dynamiquement
type PoseLandmarker = any;
type PoseLandmarkerResult = any;
type NormalizedLandmark = any;

// --- Types et Constantes ---

// Enum pour les indices des articulations
enum PoseLandmarks {
  LEFT_SHOULDER = 11,
  RIGHT_SHOULDER = 12,
  LEFT_HIP = 23,
  RIGHT_HIP = 24,
  LEFT_KNEE = 25,
  RIGHT_KNEE = 26,
  LEFT_ANKLE = 27,
  RIGHT_ANKLE = 28,
}

// Interface pour les résultats de l'analyse
export interface SquatAnalysisResult {
  profondeur_atteinte: boolean;
  dos_neutre: boolean;
  avancee_genoux_controlee: boolean;
  framesAnalyzed: number;
}

export interface UseVideoAnalysis {
  isLoadingModel: boolean;
  isProcessing: boolean;
  error: string | null;
  progress: number;
  analyzeSquat: (videoFile: File, startTime: number, endTime: number) => Promise<SquatAnalysisResult | null>;
}

// Construire l'URL du modèle dynamiquement
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const POSE_LANDMARKER_MODEL_PATH = `${supabaseUrl}/storage/v1/object/public/ia-models/pose_landmarker_lite.task`;

// --- Fonctions Utilitaires ---

/**
 * Calcule l'angle entre trois points (en degrés).
 * L'angle est calculé au niveau du point B (vertex).
 */
function calculateAngle(a: NormalizedLandmark, b: NormalizedLandmark, c: NormalizedLandmark): number {
  const radians = Math.atan2(c.y - b.y, c.x - b.x) - Math.atan2(a.y - b.y, a.x - b.x);
  let angle = Math.abs(radians * 180.0 / Math.PI);

  if (angle > 180.0) {
    angle = 360.0 - angle;
  }
  return angle;
}

// --- Hook Principal ---

export function useVideoAnalysis(): UseVideoAnalysis {
  const [poseLandmarker, setPoseLandmarker] = useState<PoseLandmarker | null>(null);
  const [isLoadingModel, setIsLoadingModel] = useState<boolean>(true);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(document.createElement('video'));

  useEffect(() => {
    const createPoseLandmarker = async () => {
      try {
        // Chargement dynamique de MediaPipe uniquement quand nécessaire
        const { PoseLandmarker: PoseLandmarkerClass, FilesetResolver } = await import('@mediapipe/tasks-vision');

        const vision = await FilesetResolver.forVisionTasks('https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm');
        const newPoseLandmarker = await PoseLandmarkerClass.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: POSE_LANDMARKER_MODEL_PATH,
            delegate: 'GPU',
          },
          runningMode: 'VIDEO',
          numPoses: 1,
        });
        setPoseLandmarker(newPoseLandmarker);
      } catch (e) {
        const err = e as Error;
        setError(`Erreur chargement du modèle IA: ${err.message}. Assurez-vous que le fichier .task est bien dans le bucket 'ia-models'.`);
      } finally {
        setIsLoadingModel(false);
      }
    };
    createPoseLandmarker();
  }, []);

  const analyzeSquat = async (videoFile: File, startTime: number, endTime: number): Promise<SquatAnalysisResult | null> => {
    if (!poseLandmarker) {
      setError("Le modèle d'analyse de pose n'est pas initialisé.");
      return null;
    }

    setIsProcessing(true);
    setProgress(0);
    setError(null);

    const video = videoRef.current;
    video.src = URL.createObjectURL(videoFile);
    video.muted = true;

    return new Promise((resolve) => {
      video.onloadeddata = async () => {
        const frameData: any[] = [];
        let framesAnalyzed = 0;

        const frameInterval = 1 / 10; // Analyse à ~10 FPS
        const analysisDuration = endTime - startTime;

        if (analysisDuration <= 0) {
          setError("La durée de la vidéo sélectionnée est invalide.");
          setIsProcessing(false);
          resolve(null);
          return;
        }

        for (let timeOffset = 0; timeOffset < analysisDuration; timeOffset += frameInterval) {
          const currentTime = startTime + timeOffset;
          video.currentTime = currentTime;
          await new Promise(r => { video.onseeked = r; });

          const result: PoseLandmarkerResult = poseLandmarker.detectForVideo(video, performance.now());
          framesAnalyzed++;

          if (result.landmarks && result.landmarks.length > 0) {
            const landmarks = result.landmarks[0];
            const shoulder = landmarks[PoseLandmarks.LEFT_SHOULDER] || landmarks[PoseLandmarks.RIGHT_SHOULDER];
            const hip = landmarks[PoseLandmarks.LEFT_HIP] || landmarks[PoseLandmarks.RIGHT_HIP];
            const knee = landmarks[PoseLandmarks.LEFT_KNEE] || landmarks[PoseLandmarks.RIGHT_KNEE];
            const ankle = landmarks[PoseLandmarks.LEFT_ANKLE] || landmarks[PoseLandmarks.RIGHT_ANKLE];

            if (shoulder?.visibility > 0.5 && hip?.visibility > 0.5 && knee?.visibility > 0.5 && ankle?.visibility > 0.5) {
              frameData.push({
                time: currentTime,
                hip,
                knee,
                shoulder,
                ankle,
                backAngle: calculateAngle(shoulder, hip, knee),
              });
            }
          }
          setProgress(Math.round((timeOffset / analysisDuration) * 100));
        }

        URL.revokeObjectURL(video.src);
        setIsProcessing(false);

        if (frameData.length < 5) {
          setError("Analyse échouée : Cadrage incorrect ou mouvement trop court. Nous n'avons pas pu détecter votre corps.");
          resolve(null);
          return;
        }

        // --- Logique d'analyse des résultats ---

        // 1. Profondeur Atteinte
        const lowestPoint = frameData.reduce((prev, curr) => (prev.hip.y > curr.hip.y ? prev : curr));
        const profondeur_atteinte = lowestPoint.hip.y > lowestPoint.knee.y;

        // 2. Dos Neutre (Butt Wink)
        const initialAngle = frameData[0].backAngle;
        const lowestPointAngle = lowestPoint.backAngle;
        const angleVariation = initialAngle - lowestPointAngle;
        const dos_neutre = angleVariation < 20;

        // 3. Avancée des Genoux Contrôlée
        const kneeForwardDisplacement = lowestPoint.knee.x - lowestPoint.ankle.x;
        const avancee_genoux_controlee = kneeForwardDisplacement < 0.08;

        resolve({
          profondeur_atteinte,
          dos_neutre,
          avancee_genoux_controlee,
          framesAnalyzed,
        });
      };

      video.onerror = () => {
        setError("Erreur lors du chargement de la vidéo.");
        setIsProcessing(false);
        resolve(null);
      };
    });
  };

  return { isLoadingModel, isProcessing, error, progress, analyzeSquat };
}
