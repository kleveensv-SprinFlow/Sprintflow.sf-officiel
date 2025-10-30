import React, { useState, useRef } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';
import { ArrowLeft, Film, Upload, Info, Loader2, Dumbbell, Wind, Disc, ChevronsUp, Barbell } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import FilmingGuideModal from './FilmingGuideModal';
import AnalysisReport from './AnalysisReport';
import { videoAnalysisMovements, MovementCategory, Movement } from '../../data/videoAnalysisMovements';
import { analyzeSquatPose } from '../../services/poseAnalysis';

const iconMap: { [key: string]: React.ElementType } = {
  Dumbbell, Wind, Disc, ChevronsUp, Barbell
};

interface VideoAnalysisProps {
  onBack: () => void;
}

export function VideoAnalysis({ onBack }: VideoAnalysisProps) {
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState<'category' | 'movement' | 'upload' | 'analyzing' | 'report'>('category');
  const [selectedCategory, setSelectedCategory] = useState<MovementCategory | null>(null);
  const [selectedMovement, setSelectedMovement] = useState<Movement | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [isGuideModalOpen, setIsGuideModalOpen] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleCategorySelect = (category: MovementCategory) => {
    setSelectedCategory(category);
    setCurrentStep('movement');
  };

  const handleMovementSelect = (movement: Movement) => {
    setSelectedMovement(movement);
    setIsGuideModalOpen(true);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setVideoFile(file);
      handleAnalysis(file);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };
  
  const handleGuideModalClose = () => {
    setIsGuideModalOpen(false);
    setCurrentStep('upload');
  }

  const handleAnalysis = async (file: File) => {
    if (!user || !selectedMovement) {
      setError("Utilisateur non authentifié ou mouvement non sélectionné.");
      return;
    }

    setCurrentStep('analyzing');
    setError(null);

    try {
      // 1. Upload to Supabase Storage
      const filePath = `${user.id}/${selectedMovement.specId}_${Date.now()}`;
      const { error: uploadError } = await supabase.storage
        .from('video_analysis')
        .upload(filePath, file);

      if (uploadError) throw new Error(`Erreur d'upload: ${uploadError.message}`);
      
      const { data: { publicUrl } } = supabase.storage.from('video_analysis').getPublicUrl(filePath);

      // 2. Perform Pose Analysis
      let analysisData;
      if (selectedMovement.specId === 'squat_mvp') {
        analysisData = await analyzeSquatPose(publicUrl);
      } else {
        throw new Error("Type d'analyse non supporté pour ce mouvement.");
      }

      // 3. Save results to Database
      const { error: dbError } = await supabase.from('video_analyses').insert({
        user_id: user.id,
        movement_spec_id: selectedMovement.specId,
        video_url: publicUrl,
        analysis_results: analysisData,
      });

      if (dbError) throw new Error(`Erreur de sauvegarde: ${dbError.message}`);

      setAnalysisResult(analysisData);
      setCurrentStep('report');

    } catch (err: any) {
      setError(err.message || "Une erreur est survenue lors de l'analyse.");
      setCurrentStep('upload'); // Go back to upload step on error
    }
  };
  
  const handleBackNavigation = () => {
    setError(null);
    if (currentStep === 'report' || currentStep === 'analyzing') {
        setCurrentStep('upload');
    } else if (currentStep === 'upload') {
        setCurrentStep('movement');
    } else if (currentStep === 'movement') {
      setCurrentStep('category');
      setSelectedCategory(null);
    } else {
      onBack();
    }
  }

  const renderContent = () => {
    switch (currentStep) {
      case 'category':
        return (
          <motion.div key="category" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
            <h2 className="text-lg font-semibold">1. Choisissez une catégorie</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-4">
              {videoAnalysisMovements.map((cat) => {
                const Icon = iconMap[cat.icon];
                return (
                  <button
                    key={cat.category}
                    onClick={() => handleCategorySelect(cat)}
                    disabled={cat.movements.length === 0}
                    className="p-4 rounded-lg flex flex-col items-center justify-center font-semibold transition-transform duration-200 hover:scale-105 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {Icon && <Icon className="w-8 h-8 mb-2 text-blue-500" />}
                    {cat.category}
                  </button>
                );
              })}
            </div>
          </motion.div>
        );
      case 'movement':
        return (
          <motion.div key="movement" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
              <h2 className="text-lg font-semibold">2. Choisissez un mouvement</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-4">
                  {selectedCategory?.movements.map((mov) => (
                      <button key={mov.name} onClick={() => handleMovementSelect(mov)} className="p-4 rounded-lg font-semibold transition-transform duration-200 hover:scale-105 bg-blue-100 dark:bg-blue-900/50 hover:bg-blue-200 dark:hover:bg-blue-900/80">
                          {mov.name}
                      </button>
                  ))}
              </div>
          </motion.div>
        );
      case 'upload':
          return (
            <motion.div key="upload" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
              <h2 className="text-lg font-semibold">3. Envoyez votre vidéo pour un {selectedMovement?.name}</h2>
              <div className="mt-4 p-6 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-center">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <button disabled className="flex items-center justify-center gap-3 p-4 bg-gray-400 text-white rounded-lg font-semibold cursor-not-allowed">
                        <Film className="w-6 h-6" /> Filmer (Bientôt)
                    </button>
                    <button onClick={handleUploadClick} className="flex items-center justify-center gap-3 p-4 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold transition-transform duration-200 hover:scale-105">
                        <Upload className="w-6 h-6" /> Importer
                    </button>
                </div>
                <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="video/*" className="hidden" />
              </div>
            </motion.div>
          );
      case 'analyzing':
        return (
            <motion.div key="analyzing" className="flex flex-col items-center justify-center text-center p-8" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}>
                <Loader2 className="w-16 h-16 animate-spin text-blue-500" />
                <h2 className="text-2xl font-semibold mt-6">Analyse en cours...</h2>
                <p className="text-gray-600 dark:text-gray-400 mt-2">Veuillez patienter pendant que nous traitons votre vidéo.</p>
            </motion.div>
        );
      case 'report':
        return <AnalysisReport result={analysisResult} onReset={() => setCurrentStep('category')} />;
    }
  };

  return (
    <>
      {isGuideModalOpen && selectedMovement && (
        <FilmingGuideModal movement={selectedMovement.name} onClose={handleGuideModalClose} />
      )}

      <div className="max-w-4xl mx-auto p-4 sm:p-6 space-y-6">
        <AnimatePresence>
            {currentStep !== 'category' && (
                <motion.button 
                    onClick={handleBackNavigation} 
                    className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                >
                <ArrowLeft className="w-5 h-5" />
                <span>Retour</span>
                </motion.button>
            )}
        </AnimatePresence>

        {currentStep !== 'report' && currentStep !== 'analyzing' &&(
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Analyse Vidéo</h1>
            <p className="text-sm text-gray-600 mt-1">Analysez la technique de vos mouvements.</p>
          </div>
        )}
        
        {error && (
          <motion.div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <p>{error}</p>
          </motion.div>
        )}

        <AnimatePresence mode="wait">
            {renderContent()}
        </AnimatePresence>
      </div>
    </>
  );
}
