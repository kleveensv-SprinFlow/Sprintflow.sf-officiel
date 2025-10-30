import React, { useState, useRef } from 'react';
import { ArrowLeft, Film, Upload, Info, Dumbbell, Wind, Disc, ChevronsUp, Loader2, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { videoAnalysisMovements, Movement, MovementCategory } from '../../data/videoAnalysisMovements';
import { VideoTrimmerScreen } from './VideoTrimmerScreen';
import { ProcessingScreen } from './ProcessingScreen';
import { AnalysisReportScreen } from './AnalysisReportScreen';
import { useVideoAnalysis, SquatAnalysisResult } from '../../hooks/useVideoAnalysis';
import { useVideoAnalysisLogs, VideoAnalysisLog } from '../../hooks/useVideoAnalysisLogs';

type VideoAnalysisStep = 'selection' | 'trimming' | 'processing' | 'report' | 'error';

const iconMap: { [key: string]: React.ElementType } = {
  Dumbbell, Wind, Disc, ChevronsUp
};

interface VideoAnalysisFlowProps {
  onBack: () => void;
}

function MovementSelectionModal({ category, onClose, onSelectMovement }: { category: MovementCategory, onClose: () => void, onSelectMovement: (movement: Movement) => void }) {
  return (
    <motion.div
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-md"
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
      >
        <h2 className="text-xl font-bold mb-4">Choisir un mouvement</h2>
        <div className="space-y-3">
          {category.movements.map(movement => (
            <button
              key={movement.specId}
              onClick={() => onSelectMovement(movement)}
              className="w-full text-left p-3 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-md transition-colors"
            >
              {movement.name}
            </button>
          ))}
        </div>
        <button
          onClick={onClose}
          className="mt-6 w-full p-2 bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 rounded-md"
        >
          Annuler
        </button>
      </motion.div>
    </motion.div>
  );
}

function SelectionScreen({ onMovementSelected, onBack }: { onMovementSelected: (movement: Movement, file: File) => void, onBack: () => void }) {
  const [selectedMovement, setSelectedMovement] = useState<Movement | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalCategory, setModalCategory] = useState<MovementCategory | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleCategoryClick = (category: MovementCategory) => {
    if (category.category === "Musculation" && category.movements.length > 0) {
      setModalCategory(category);
      setIsModalOpen(true);
    }
  };

  const handleMovementSelect = (movement: Movement) => {
    setSelectedMovement(movement);
    setIsModalOpen(false);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && selectedMovement) {
      onMovementSelected(selectedMovement, file);
    }
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  }

  const FilmingTips = () => (
    <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 p-4 rounded-r-lg mt-6">
      <div className="flex items-start">
        <Info className="w-8 h-8 text-blue-500 mr-3 flex-shrink-0" />
        <div>
          <h3 className="font-bold text-blue-800 dark:text-blue-200">
            {selectedMovement ? `Conseils pour filmer : ${selectedMovement.name}` : "Conseils pour filmer"}
          </h3>
          <ul className="list-disc list-inside text-sm text-blue-700 dark:text-blue-300 mt-2">
            {selectedMovement ? (
              selectedMovement.guide.split('. ').map((tip, index) => tip && <li key={index}>{tip}</li>)
            ) : (
              <li>Veuillez d'abord s�lectionner un exercice.</li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <AnimatePresence>
        {isModalOpen && modalCategory && (
          <MovementSelectionModal
            category={modalCategory}
            onClose={() => setIsModalOpen(false)}
            onSelectMovement={handleMovementSelect}
          />
        )}
      </AnimatePresence>

      <div className="max-w-4xl mx-auto p-4 sm:p-6 space-y-4">
        <button onClick={onBack} className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-2">
          <ArrowLeft className="w-5 h-5" />
          <span>Retour aux Conseils</span>
        </button>

        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Analyse Vid�o</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {selectedMovement ? `Pr�t � analyser : ${selectedMovement.name}` : "Choisissez une cat�gorie pour commencer"}
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
          {videoAnalysisMovements.map((cat) => {
            const Icon = iconMap[cat.icon];
            const isDisabled = cat.movements.length === 0;
            return (
              <button
                key={cat.category}
                onClick={() => handleCategoryClick(cat)}
                disabled={isDisabled}
                className="p-4 rounded-lg flex flex-col items-center justify-center font-semibold transition-transform duration-200 hover:scale-105 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {Icon && <Icon className="w-8 h-8 mb-2 text-blue-500" />}
                <span className="text-center">{cat.category}</span>
              </button>
            );
          })}
        </div>

        <FilmingTips />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
          <button
            disabled={!selectedMovement}
            className="flex items-center justify-center gap-3 p-4 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-semibold transition-all disabled:bg-gray-300 dark:disabled:bg-gray-700 cursor-not-allowed"
          >
            <Film className="w-6 h-6" /> Filmer (Bient�t)
          </button>
          <button
            onClick={handleImportClick}
            disabled={!selectedMovement}
            className="flex items-center justify-center gap-3 p-4 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold transition-all disabled:bg-purple-300 dark:disabled:bg-purple-800"
          >
            <Upload className="w-6 h-6" /> Importer
          </button>
          <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="video/*" className="hidden" />
        </div>
      </div>
    </>
  );
}

function ErrorScreen({ message, onRetry }: { message: string, onRetry: () => void }) {
  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 flex flex-col items-center justify-center text-center h-full">
      <AlertTriangle className="w-16 h-16 text-red-500 mb-6" />
      <h2 className="text-2xl font-semibold text-red-600">Analyse �chou�e</h2>
      <p className="text-gray-600 dark:text-gray-400 mt-2 mb-8 max-w-md">
        {message || "Une erreur inattendue est survenue. Veuillez r�essayer."}
      </p>
      <button
        onClick={onRetry}
        className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold"
      >
        R�essayer
      </button>
    </div>
  );
}

export function VideoAnalysisFlow({ onBack }: VideoAnalysisFlowProps) {
  const [currentStep, setCurrentStep] = useState<VideoAnalysisStep>('selection');
  const [selectedMovement, setSelectedMovement] = useState<Movement | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [analysisResult, setAnalysisResult] = useState<SquatAnalysisResult | null>(null);
  const [currentLog, setCurrentLog] = useState<VideoAnalysisLog | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const { analyzeSquat, progress, error: analysisHookError, isLoadingModel } = useVideoAnalysis();
  const { uploadVideo, createAnalysisLog, updateAnalysisLog, shareWithCoach } = useVideoAnalysisLogs();

  const handleMovementSelected = (movement: Movement, file: File) => {
    setSelectedMovement(movement);
    setVideoFile(file);
    setCurrentStep('trimming');
  };

  const handleTrimmingComplete = async (startTime: number, endTime: number) => {
    if (!videoFile || !selectedMovement) return;

    setCurrentStep('processing');
    setErrorMessage(null);

    let logId: string | null = null;

    try {
      const videoUrl = await uploadVideo(videoFile, selectedMovement.specId);
      const log = await createAnalysisLog(selectedMovement.name, videoUrl);
      logId = log.id;
      setCurrentLog(log);

      const result = await analyzeSquat(videoFile, startTime, endTime);

      if (result) {
        await updateAnalysisLog(log.id, 'COMPLETED', result);
        setAnalysisResult(result);
        setCurrentStep('report');
      } else {
        throw new Error(analysisHookError || "L'analyse a �chou�. Veuillez v�rifier le cadrage de votre vid�o.");
      }

    } catch (e: any) {
      if (logId) {
        await updateAnalysisLog(logId, 'ERROR', null);
      }
      setErrorMessage(e.message);
      setCurrentStep('error');
    }
  };

  const handleShare = async () => {
    if (currentLog) {
      await shareWithCoach(currentLog.id);
      alert('Analyse partag�e avec votre coach !');
    }
  };

  const handleResetFlow = () => {
    setCurrentStep('selection');
    setSelectedMovement(null);
    setVideoFile(null);
    setAnalysisResult(null);
    setCurrentLog(null);
    setErrorMessage(null);
  };

  if (isLoadingModel) {
    return (
      <div className="flex flex-col items-center justify-center text-center p-8 h-full">
        <Loader2 className="w-12 h-12 animate-spin text-blue-500" />
        <h2 className="text-xl font-semibold mt-6">Chargement du mod�le IA...</h2>
        <p className="text-gray-600 dark:text-gray-400 mt-2">Cela peut prendre quelques instants.</p>
      </div>
    );
  }

  if (currentStep === 'trimming' && videoFile) {
    return <VideoTrimmerScreen videoFile={videoFile} onComplete={handleTrimmingComplete} onBack={handleResetFlow} />;
  }

  if (currentStep === 'processing') {
    return <ProcessingScreen progress={progress} />;
  }

  if (currentStep === 'report' && analysisResult && currentLog) {
    return <AnalysisReportScreen result={analysisResult} log={currentLog} onShare={handleShare} onComplete={handleResetFlow} />;
  }

  if (currentStep === 'error') {
    return <ErrorScreen message={errorMessage || "Une erreur est survenue."} onRetry={handleResetFlow} />
  }

  return <SelectionScreen onMovementSelected={handleMovementSelected} onBack={onBack} />;
}
