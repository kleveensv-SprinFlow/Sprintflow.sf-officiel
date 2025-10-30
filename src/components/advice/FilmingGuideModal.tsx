import React from 'react';
import { X } from 'lucide-react';
import { motion } from 'framer-motion';

interface FilmingGuideModalProps {
  movement: string;
  onClose: () => void;
}

const FilmingGuideModal: React.FC<FilmingGuideModalProps> = ({ movement, onClose }) => {
  // Contenu du guide spécifique au mouvement
  const guides: { [key: string]: { angle: string; framing: string; stability: string } } = {
    Squat: {
      angle: "Placez votre téléphone de côté, à hauteur de hanche.",
      framing: "Assurez-vous que tout votre corps est visible dans le cadre, des pieds à la tête.",
      stability: "Utilisez un trépied ou posez le téléphone sur un support stable. L'image ne doit pas bouger.",
    },
    // D'autres mouvements peuvent être ajoutés ici
    Default: {
        angle: "Placez votre téléphone de côté.",
        framing: "Assurez-vous que tout votre corps est visible.",
        stability: "Utilisez un trépied, l'image doit être stable.",
    }
  };

  const specificGuide = guides[movement] || guides.Default;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 50, opacity: 0 }}
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-md p-6 relative"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
          aria-label="Fermer"
        >
          <X size={24} />
        </button>

        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Guide pour filmer : <span className="text-blue-500">{movement}</span>
        </h2>

        <div className="space-y-4 text-gray-700 dark:text-gray-300">
          <div>
            <h3 className="font-semibold text-lg mb-1 text-gray-800 dark:text-gray-100">1. Angle de vue</h3>
            <p>{specificGuide.angle}</p>
          </div>
          <div>
            <h3 className="font-semibold text-lg mb-1 text-gray-800 dark:text-gray-100">2. Cadrage</h3>
            <p>{specificGuide.framing}</p>
          </div>
          <div>
            <h3 className="font-semibold text-lg mb-1 text-gray-800 dark:text-gray-100">3. Stabilité</h3>
            <p>{specificGuide.stability}</p>
          </div>
        </div>

        <div className="mt-6 p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-center bg-gray-50 dark:bg-gray-700/50">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Une bonne qualité vidéo est essentielle pour une analyse précise.
          </p>
        </div>
        
        <button
          onClick={onClose}
          className="mt-6 w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition-transform duration-200 hover:scale-105"
        >
          J'ai compris
        </button>
      </motion.div>
    </div>
  );
};

export default FilmingGuideModal;
