import React, { useState } from 'react';
import { ArrowLeft, Film, Upload, Info } from 'lucide-react';

interface VideoAnalysisProps {
  onBack: () => void;
}

type MovementType = 'sprint' | 'saut' | 'lancer' | 'musculation' | 'halterophilie';

const movementTypes: { key: MovementType; label: string }[] = [
  { key: 'sprint', label: 'Sprint' },
  { key: 'saut', label: 'Saut' },
  { key: 'lancer', label: 'Lancer' },
  { key: 'musculation', label: 'Musculation' },
  { key: 'halterophilie', label: 'Haltérophilie' },
];

const filmingTips: Record<MovementType, string[]> = {
  sprint: [
    "Filmez de côté, à environ 10 mètres de distance.",
    "Assurez-vous que tout le corps est visible pendant toute la course.",
    "Utilisez un trépied pour une image stable.",
  ],
  saut: [
    "Placez la caméra de côté ou de 3/4 face.",
    "Cadrez largement pour inclure l'élan et la réception.",
    "Un ralenti peut aider à mieux décomposer le mouvement.",
  ],
  lancer: [
    "Filmez de derrière et de côté pour analyser la trajectoire et la technique.",
    "Ne zoomez pas trop pour garder le lanceur au centre de l'image.",
    "Vérifiez que l'aire de lancer est bien éclairée.",
  ],
  musculation: [
    "Filmez l'exercice sous plusieurs angles (face, côté).",
    "Portez des vêtements qui ne masquent pas les articulations.",
    "Assurez-vous que la charge et l'amplitude complète du mouvement sont visibles.",
  ],
  halterophilie: [
    "Un angle de 3/4 est idéal pour voir la trajectoire de la barre.",
    "Filmez à hauteur de la barre.",
    "Gardez la totalité du corps et de la barre dans le cadre.",
  ],
};

export function VideoAnalysis({ onBack }: VideoAnalysisProps) {
  const [selectedMovement, setSelectedMovement] = useState<MovementType | null>(null);

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 space-y-6">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
      >
        <ArrowLeft className="w-5 h-5" />
        <span>Retour</span>
      </button>

      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
          Analyse Vidéo
        </h1>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          Analysez la technique de vos mouvements.
        </p>
      </div>

      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
          1. Choisissez un type de mouvement
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {movementTypes.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setSelectedMovement(key)}
              className={`p-4 rounded-lg text-center font-semibold transition-colors ${
                selectedMovement === key
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {selectedMovement && (
        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg space-y-3">
          <div className="flex items-center gap-2 text-blue-800 dark:text-blue-300">
            <Info className="w-5 h-5" />
            <h3 className="text-md font-semibold">Conseils pour filmer</h3>
          </div>
          <ul className="list-disc list-inside text-sm text-blue-700 dark:text-blue-200 space-y-1">
            {filmingTips[selectedMovement].map((tip, index) => (
              <li key={index}>{tip}</li>
            ))}
          </ul>
        </div>
      )}

      {selectedMovement && (
        <div className="space-y-4 pt-4">
           <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
            2. Envoyez votre vidéo
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button className="flex items-center justify-center gap-3 p-4 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-colors">
              <Film className="w-6 h-6" />
              Filmer
            </button>
            <button className="flex items-center justify-center gap-3 p-4 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold transition-colors">
              <Upload className="w-6 h-6" />
              Importer
            </button>
          </div>
        </div>
      )}
    </div>
  );
}